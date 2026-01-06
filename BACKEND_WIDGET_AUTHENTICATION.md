# Backend Widget Authentication Guide

## Problem
The frontend widget is receiving **401 Unauthorized** errors when trying to access activation endpoints (`/search/activate`, `/chatbot/activate`) in widget mode. This happens because the backend doesn't recognize the `X-Project-ID` header or `project_id` query parameter for authentication.

## Current Behavior
- Widget sends requests with `X-Project-ID` header and `project_id` query parameter
- Backend returns 401 Unauthorized
- Frontend handles this gracefully by defaulting to active status
- Widget continues to work, but errors appear in console

## Solution
Implement projectId-based authentication for widget endpoints to allow widgets to authenticate without requiring user login.

## Required Changes

### 1. Accept Project ID Authentication

The backend should accept authentication via:
- **Header**: `X-Project-ID: <project-id>`
- **Query Parameter**: `project_id=<project-id>`

### 2. Endpoints That Need Project ID Support

These endpoints should accept projectId authentication:

#### Search Widget Endpoints:
- `GET /api/v1/search/activate` - Get search activation status
- `PUT /api/v1/search/activate` - Update search activation status
- `GET /api/v1/search/configuration` - Get search configuration
- `POST /api/v1/search` - Perform search query

#### Chatbot Widget Endpoints:
- `GET /api/v1/chatbot/activate` - Get chatbot activation status
- `PUT /api/v1/chatbot/activate` - Update chatbot activation status
- `GET /api/v1/chatbot/settings` - Get chatbot settings
- `POST /api/v1/chatbot/chat` - Send chat message

#### General Widget Endpoints:
- `GET /api/v1/projects/{project_id}` - Get project details
- `GET /api/v1/avatars/*` - Get avatar images

### 3. Authentication Middleware Implementation

#### FastAPI Example

```python
from fastapi import Header, Query, HTTPException, Depends
from typing import Optional

async def get_project_id(
    x_project_id: Optional[str] = Header(None, alias="X-Project-ID"),
    project_id: Optional[str] = Query(None)
) -> Optional[str]:
    """Extract project ID from header or query parameter"""
    return x_project_id or project_id

async def authenticate_project(project_id: Optional[str] = Depends(get_project_id)):
    """Authenticate request using project ID"""
    if not project_id:
        # Check for Bearer token authentication (for main app)
        # This allows both authentication methods
        return None
    
    # Validate project ID exists and is active
    project = await get_project_by_id(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not project.is_active:
        raise HTTPException(status_code=403, detail="Project is not active")
    
    return project

# Use in endpoints
@app.get("/api/v1/search/activate")
async def get_search_activation(
    project: Optional[Project] = Depends(authenticate_project),
    token: Optional[str] = Depends(get_bearer_token)  # Fallback to token auth
):
    # If no project, try token authentication (for main app)
    if not project:
        user = await authenticate_token(token)
        if not user:
            raise HTTPException(status_code=401, detail="Authentication required")
        # Use user's project
        project = user.active_project
    
    # Return activation status for this project
    return {
        "success": True,
        "data": {
            "is_active": project.search_enabled
        },
        "message": "Search activation status retrieved"
    }
```

#### Express.js Example

```javascript
const authenticateProject = async (req, res, next) => {
  // Try to get project ID from header or query
  const projectId = req.headers['x-project-id'] || req.query.project_id;
  
  if (projectId) {
    // Validate project ID
    const project = await getProjectById(projectId);
    
    if (!project) {
      return res.status(404).json({ detail: 'Project not found' });
    }
    
    if (!project.isActive) {
      return res.status(403).json({ detail: 'Project is not active' });
    }
    
    // Attach project to request
    req.project = project;
    return next();
  }
  
  // Fallback to token authentication (for main app)
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    const user = await verifyToken(token);
    if (user) {
      req.user = user;
      req.project = user.activeProject;
      return next();
    }
  }
  
  return res.status(401).json({ detail: 'Authentication required' });
};

// Use in routes
router.get('/search/activate', authenticateProject, async (req, res) => {
  const project = req.project;
  
  res.json({
    success: true,
    data: {
      is_active: project.searchEnabled
    },
    message: 'Search activation status retrieved'
  });
});
```

#### Django Example

```python
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from functools import wraps

def authenticate_project(view_func):
    """Decorator to authenticate via project ID or token"""
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        # Try to get project ID from header or query
        project_id = request.headers.get('X-Project-ID') or request.GET.get('project_id')
        
        if project_id:
            try:
                project = Project.objects.get(id=project_id, is_active=True)
                request.project = project
                return view_func(request, *args, **kwargs)
            except Project.DoesNotExist:
                return JsonResponse({'detail': 'Project not found'}, status=404)
        
        # Fallback to token authentication (for main app)
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        if token:
            user = verify_token(token)
            if user:
                request.user = user
                request.project = user.active_project
                return view_func(request, *args, **kwargs)
        
        return JsonResponse({'detail': 'Authentication required'}, status=401)
    
    return wrapper

# Use in views
@csrf_exempt
@authenticate_project
def get_search_activation(request):
    project = request.project
    
    return JsonResponse({
        'success': True,
        'data': {
            'is_active': project.search_enabled
        },
        'message': 'Search activation status retrieved'
    })
```

### 4. Response Format

All activation endpoints should return this format:

```json
{
  "success": true,
  "data": {
    "is_active": true
  },
  "message": "Activation status retrieved successfully"
}
```

### 5. Error Handling

- **401 Unauthorized**: Return when neither projectId nor token is provided
- **404 Not Found**: Return when projectId is provided but project doesn't exist
- **403 Forbidden**: Return when project exists but is not active

### 6. Security Considerations

1. **Validate Project ID Format**: Ensure project IDs are valid UUIDs
2. **Check Project Status**: Only allow active projects
3. **Rate Limiting**: Apply rate limits per project ID
4. **CORS**: Ensure CORS headers allow the `X-Project-ID` header
5. **Logging**: Log project ID access for audit purposes

### 7. Testing

Test with curl:

```bash
# Test with project ID header
curl -X GET "http://192.168.0.101:8000/api/v1/search/activate" \
  -H "X-Project-ID: 738425a0-3200-4443-9ef1-53bea7a31179" \
  -H "Origin: http://localhost:5173"

# Test with project ID query parameter
curl -X GET "http://192.168.0.101:8000/api/v1/search/activate?project_id=738425a0-3200-4443-9ef1-53bea7a31179" \
  -H "Origin: http://localhost:5173"

# Expected response
{
  "success": true,
  "data": {
    "is_active": true
  },
  "message": "Search activation status retrieved"
}
```

### 8. Migration Strategy

1. **Phase 1**: Add project ID authentication alongside token authentication (both work)
2. **Phase 2**: Test with widgets to ensure it works
3. **Phase 3**: (Optional) Make project ID required for widget endpoints

### 9. Current Project ID Format

The frontend sends project IDs in this format:
- UUID v4: `738425a0-3200-4443-9ef1-53bea7a31179`

### 10. CORS Configuration

Ensure CORS allows the `X-Project-ID` header:

```python
# FastAPI
allow_headers=["Content-Type", "Authorization", "X-Project-ID", "Accept"]
```

```javascript
// Express.js
allowedHeaders: ['Content-Type', 'Authorization', 'X-Project-ID', 'Accept']
```

## After Implementation

Once project ID authentication is implemented:
1. Widgets will authenticate successfully
2. 401 errors will disappear
3. Activation status will be retrieved correctly
4. Widgets will respect activation settings from backend

## Verification Checklist

- [ ] Project ID can be extracted from `X-Project-ID` header
- [ ] Project ID can be extracted from `project_id` query parameter
- [ ] Project ID is validated (exists, is active)
- [ ] Endpoints return correct response format
- [ ] 401 errors are returned when authentication fails
- [ ] CORS headers include `X-Project-ID`
- [ ] Rate limiting is applied per project
- [ ] Logging is implemented for audit
- [ ] Tested with actual widget project IDs
- [ ] Fallback to token authentication still works (for main app)

## Support

If issues persist:
1. Check backend logs for authentication errors
2. Verify project ID format matches UUID v4
3. Ensure project exists and is active in database
4. Test with curl to isolate frontend vs backend issues
5. Check CORS configuration includes `X-Project-ID` header

