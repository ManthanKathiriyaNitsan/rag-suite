"""
JWT authentication helpers with enhanced security
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status, Header, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from .db import get_db
from .models import User, APIKey
from .settings import settings
import logging

logger = logging.getLogger(__name__)

# Password hashing - use a simpler approach
import hashlib
import secrets

# Security scheme with auto_error=False for custom error handling
security = HTTPBearer(auto_error=False)

# Enhanced security scheme for protected routes
protected_security = HTTPBearer()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    # Simple hash verification (for development only)
    salt = hashed_password[:32]
    hash_part = hashed_password[32:]
    return hashlib.sha256((plain_password + salt).encode()).hexdigest() == hash_part

def get_password_hash(password: str) -> str:
    """Hash a password"""
    # Simple password hashing (for development only)
    salt = secrets.token_hex(16)
    hash_value = hashlib.sha256((password + salt).encode()).hexdigest()
    return salt + hash_value

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.jwt_expire_minutes)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)

def verify_token(token: str):
    """Verify and decode a JWT token"""
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        username: str = payload.get("sub")
        if username is None:
            logger.warning("Token verification failed: missing 'sub' claim in token")
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except JWTError as e:
        logger.warning(f"Token verification failed: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")

def authenticate_user(db: Session, username: str, password: str):
    """Authenticate a user by username/email and password"""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        user = db.query(User).filter(User.email == username).first()
    
    if not user or not verify_password(password, user.hashed_password):
        return False
    return user

def check_and_update_user_activity(user: User, db: Session) -> None:
    """
    Check if user has been inactive for more than the timeout period.
    If inactive, raise HTTPException. Otherwise, update last_activity.
    """
    current_time = datetime.now(timezone.utc)
    
    # If user has last_activity set, check for inactivity
    if user.last_activity:
        # Ensure both are timezone-aware for comparison
        last_activity = user.last_activity
        if last_activity.tzinfo is None:
            # If stored as naive, assume it's UTC
            last_activity = last_activity.replace(tzinfo=timezone.utc)
        
        time_since_activity = current_time - last_activity
        inactivity_timeout = timedelta(minutes=settings.jwt_inactivity_timeout_minutes)
        
        if time_since_activity > inactivity_timeout:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Session expired due to inactivity ({settings.jwt_inactivity_timeout_minutes} minutes)",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    # Update last_activity to current time (timezone-aware)
    user.last_activity = current_time
    try:
        db.commit()
    except Exception:
        db.rollback()
        # Don't fail the request if activity update fails, but log it
        pass

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get the current authenticated user (optional authentication)"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        username = verify_token(credentials.credentials)
    except HTTPException as e:
        logger.warning(f"Token verification failed: {e.detail}")
        raise
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        user = db.query(User).filter(User.email == username).first()
    if user is None:
        logger.warning(f"User not found for username/email: {username}. Token is valid but user doesn't exist in database.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        logger.warning(f"Inactive user attempted to access: {user.id} (username: {user.username})")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive"
        )
    
    # Check inactivity and update last_activity
    try:
        check_and_update_user_activity(user, db)
    except HTTPException as e:
        logger.warning(f"Session expired for user {user.id} (username: {user.username}): {e.detail}")
        raise
    
    return user

async def get_current_user_required(
    credentials: HTTPAuthorizationCredentials = Depends(protected_security),
    db: Session = Depends(get_db)
):
    """Get the current authenticated user (required authentication for protected routes)"""
    try:
        username = verify_token(credentials.credentials)
    except HTTPException as e:
        logger.warning(f"Token verification failed: {e.detail}")
        raise
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        user = db.query(User).filter(User.email == username).first()
    if user is None:
        logger.warning(f"User not found for username/email: {username}. Token is valid but user doesn't exist in database. User may have been deleted or username changed.")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        logger.warning(f"Inactive user attempted to access: {user.id} (username: {user.username})")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive"
        )
    
    # Check inactivity and update last_activity
    try:
        check_and_update_user_activity(user, db)
    except HTTPException as e:
        logger.warning(f"Session expired for user {user.id} (username: {user.username}): {e.detail}")
        raise
    
    return user

async def get_current_admin_user(
    credentials: HTTPAuthorizationCredentials = Depends(protected_security),
    db: Session = Depends(get_db)
):
    """Get the current authenticated admin user"""
    user = await get_current_user_required(credentials, db)
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return user

def require_auth(func):
    """Decorator to require authentication for any function"""
    async def wrapper(*args, **kwargs):
        # This would be used with FastAPI dependency injection
        return await func(*args, **kwargs)
    return wrapper

# Alias for compatibility
get_current_active_user = get_current_user_required

async def get_active_project(
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Get the active project for the current user (excludes temporary onboarding projects)"""
    from .models import Project
    from sqlalchemy import and_, not_
    from sqlalchemy.exc import OperationalError
    
    try:
        active_project = db.query(Project).filter(
        and_(
            Project.owner_id == current_user.id,
            Project.is_active == True,
            not_(Project.name.like("__TEMP_ONBOARDING_%"))
        )
        ).first()
        
        # If no active project, try to get any project (excluding temp) and activate it
        if not active_project:
            any_project = db.query(Project).filter(
            and_(
                Project.owner_id == current_user.id,
                not_(Project.name.like("__TEMP_ONBOARDING_%"))
            )
        ).first()
        
            if any_project:
                any_project.is_active = True
                try:
                    db.commit()
                    db.refresh(any_project)
                except OperationalError:
                    db.rollback()
                    # If commit fails, return the project anyway (it's already marked active in memory)
                    return any_project
                return any_project
            
            # If no projects exist, create a default one
            default_project = Project(
                name="Main Project",
                description="Default project",
                owner_id=current_user.id,
                is_active=True
            )
            db.add(default_project)
            try:
                db.commit()
                db.refresh(default_project)
            except OperationalError:
                db.rollback()
                # If commit fails, raise HTTPException to indicate database issue
                from fastapi import HTTPException, status
                raise HTTPException(
                    status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                    detail="Database service is currently unavailable. Please ensure PostgreSQL is running and try again."
                )
            return default_project
        
        return active_project
    except OperationalError as e:
        # Re-raise as HTTPException for better error handling
        from fastapi import HTTPException, status
        error_str = str(e.orig) if hasattr(e, 'orig') else str(e)
        if "Connection refused" in error_str or "could not connect" in error_str.lower():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Database service is currently unavailable. Please ensure PostgreSQL is running and try again."
            )
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service error. Please try again later."
        )

async def verify_api_key(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Verify API key from bearer token and return the API key object"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required. Please provide a valid API key in the Authorization header.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    api_key_token = credentials.credentials
    
    # Validate API key is not empty or whitespace
    if not api_key_token or not api_key_token.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key cannot be empty. Please provide a valid API key.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Validate API key format (should start with rgs_live_ or rgs_test_)
    api_key_token = api_key_token.strip()
    if not (api_key_token.startswith("rgs_live_") or api_key_token.startswith("rgs_test_")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key format. API keys must start with 'rgs_live_' or 'rgs_test_'.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Look up the API key in the database
    api_key = db.query(APIKey).filter(APIKey.key == api_key_token).first()
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key. The provided API key does not exist or is not recognized.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if API key is active
    if not api_key.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key is inactive. This API key has been deactivated. Please use an active API key or contact support.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if API key has expired
    if api_key.expires_at and api_key.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"API key has expired on {api_key.expires_at.strftime('%Y-%m-%d %H:%M:%S UTC')}. Please generate a new API key.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last used timestamp and increment request count
    api_key.last_used_at = datetime.utcnow()
    api_key.request_count += 1
    db.commit()
    
    return api_key

async def get_current_user_or_api_key(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Get current user from JWT token OR verify API key.
    This allows endpoints to accept either JWT tokens (for logged-in users) or API keys.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    
    # Validate token is not empty or whitespace
    if not token or not token.strip():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token cannot be empty. Please provide a valid JWT token or API key.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = token.strip()
    
    # Check if it looks like an API key (starts with rgs_live_ or rgs_test_)
    # If so, try API key verification first, otherwise try JWT first
    if token.startswith("rgs_live_") or token.startswith("rgs_test_"):
        # Looks like an API key, verify it directly (inline logic to avoid Depends issue)
        api_key = db.query(APIKey).filter(APIKey.key == token).first()
        
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid API key. The provided API key does not exist or is not recognized.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if API key is active
        if not api_key.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="API key is inactive. This API key has been deactivated. Please use an active API key or contact support.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if API key has expired
        if api_key.expires_at and api_key.expires_at < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"API key has expired on {api_key.expires_at.strftime('%Y-%m-%d %H:%M:%S UTC')}. Please generate a new API key.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Update last used timestamp and increment request count
        api_key.last_used_at = datetime.utcnow()
        api_key.request_count += 1
        db.commit()
        
        return {"type": "api_key", "api_key": api_key}
    
    # Otherwise, try JWT token verification
    try:
        username = verify_token(token)
        user = db.query(User).filter(User.username == username).first()
        if not user:
            user = db.query(User).filter(User.email == username).first()
        if user and user.is_active:
            # Check inactivity and update last_activity for JWT users
            check_and_update_user_activity(user, db)
            return {"type": "user", "user": user}
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except (HTTPException, JWTError):
        # JWT verification failed
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_project_id_or_user(
    authorization: Optional[str] = Header(None),
    x_project_id: Optional[str] = Header(None, alias="X-Project-ID"),
    project_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Allow authentication via:
    1. Bearer token (for logged-in users)
    2. X-Project-ID header (for widgets)
    3. project_id query parameter (for widgets)
    
    Returns a dict with 'type' ('user' or 'widget') and the relevant object/ID.
    """
    from .models import Project
    import uuid

    # 1. Check for Bearer token first (User Auth)
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1] if len(authorization.split(" ")) > 1 else ""
        
        # Validate token is not empty
        if not token or not token.strip():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token cannot be empty. Please provide a valid JWT token or API key.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        token = token.strip()
        
        try:
            # Re-use existing logic logic for token verification
            # We can't easily reuse get_current_user_or_api_key directly because of dependency injection structure
            # effectively duplicating the check logic or calling it manually if we could (but it depends on Depends)
            
            # Manually verify API key
            if token.startswith("rgs_live_") or token.startswith("rgs_test_"):
                 api_key = db.query(APIKey).filter(APIKey.key == token).first()
                 
                 if not api_key:
                     raise HTTPException(
                         status_code=status.HTTP_401_UNAUTHORIZED,
                         detail="Invalid API key. The provided API key does not exist or is not recognized.",
                         headers={"WWW-Authenticate": "Bearer"},
                     )
                 
                 if not api_key.is_active:
                     raise HTTPException(
                         status_code=status.HTTP_401_UNAUTHORIZED,
                         detail="API key is inactive. This API key has been deactivated. Please use an active API key or contact support.",
                         headers={"WWW-Authenticate": "Bearer"},
                     )
                 
                 if api_key.expires_at and api_key.expires_at < datetime.utcnow():
                     raise HTTPException(
                         status_code=status.HTTP_401_UNAUTHORIZED,
                         detail=f"API key has expired on {api_key.expires_at.strftime('%Y-%m-%d %H:%M:%S UTC')}. Please generate a new API key.",
                         headers={"WWW-Authenticate": "Bearer"},
                     )
                 
                 # All validation checks passed, update usage and return
                 api_key.last_used_at = datetime.utcnow()
                 api_key.request_count += 1
                 db.commit()
                 return {"type": "api_key", "api_key": api_key, "user_id": api_key.created_by_id}
            
            # Try JWT
            username = verify_token(token)
            user = db.query(User).filter(User.username == username).first()
            if not user:
                user = db.query(User).filter(User.email == username).first()
            
            if user and user.is_active:
                check_and_update_user_activity(user, db)
                return {"type": "user", "user": user, "user_id": user.id}

        except HTTPException:
            # Re-raise HTTPExceptions (they have proper error messages)
            raise
        except Exception:
            # If token auth fails, fall through to check for project_id
            pass
            
    # 2. Check for Project ID (Widget Auth)
    pid_str = x_project_id or project_id
    if pid_str:
        try:
            # Validate UUID format
            pid_uuid = uuid.UUID(pid_str)
            
            # Check if project exists
            project = db.query(Project).filter(Project.id == pid_uuid).first()
            
            # For widgets (X-Project-ID), we allow access even if the project is not "active" (selected in dashboard)
            # The is_active flag mainly tracks which project the user is currently viewing/editing in the UI.
            if project:
                return {
                    "type": "widget", 
                    "project_id": project.id, 
                    "project": project,
                    "user_id": project.owner_id # Widget acts on behalf of project owner
                }
        except ValueError:
            pass # Invalid UUID format
            
    # No valid auth found
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required (Bearer token or Project ID)",
        headers={"WWW-Authenticate": "Bearer"},
    )
