# Backend Changes Required for Search Widget ProjectId Authentication

## Overview
The search widget needs to authenticate using `projectId` instead of user session tokens when embedded on external websites. The frontend already handles 401 errors gracefully, but for full functionality, the backend should support projectId-based authentication.

## Required Changes

### 1. Accept ProjectId in Requests

The widget sends `projectId` in two ways:
- **Header**: `X-Project-ID: <project-id>`
- **Query Parameter**: `?project_id=<project-id>`

Your backend should check for projectId in this order:
1. `X-Project-ID` header (preferred)
2. `project_id` query parameter (fallback)

### 2. Endpoints That Need ProjectId Support

The following endpoints should accept and validate `projectId`:

#### A. Search Configuration
- **Endpoint**: `GET /api/v1/search/configuration`
- **Current**: Requires user authentication
- **Required**: Accept `projectId` and return project-specific configuration
- **Query Parameter**: `?project_id=<project-id>` or Header: `X-Project-ID: <project-id>`

#### B. Search Customization
- **Endpoint**: `GET /api/v1/search/customization`
- **Current**: Requires user authentication
- **Required**: Accept `projectId` and return project-specific customization
- **Query Parameter**: `?project_id=<project-id>` or Header: `X-Project-ID: <project-id>`

#### C. Search Citation Settings
- **Endpoint**: `GET /api/v1/search/citation/`
- **Current**: Requires user authentication (returns 401 in widget mode)
- **Required**: Accept `projectId` and return project-specific citation settings
- **Query Parameter**: `?project_id=<project-id>` or Header: `X-Project-ID: <project-id>`

#### D. Response Configuration
- **Endpoint**: `GET /api/v1/search/response-config`
- **Current**: Requires user authentication (returns 401 in widget mode)
- **Required**: Accept `projectId` and return project-specific response config
- **Query Parameter**: `?project_id=<project-id>` or Header: `X-Project-ID: <project-id>`

#### E. Search Activation Status
- **Endpoint**: `GET /api/v1/search/activation-status`
- **Current**: Requires user authentication (returns 401 in widget mode)
- **Required**: Accept `projectId` and return activation status for that project
- **Query Parameter**: `?project_id=<project-id>` or Header: `X-Project-ID: <project-id>`

#### F. Search Query (RAG Query)
- **Endpoint**: `POST /api/v1/search/query` or `/api/v1/rag/query`
- **Current**: Requires user authentication
- **Required**: Accept `projectId` and process query for that project
- **Body/Query**: Include `project_id` in request

#### G. Feedback Submission
- **Endpoint**: `POST /api/v1/search/feedback` or similar
- **Current**: Requires user authentication (returns 401 in widget mode)
- **Required**: Accept `projectId` and save feedback for that project
- **Body/Query**: Include `project_id` in request

### 3. Authentication Middleware

Create or update authentication middleware to:
1. Check for `X-Project-ID` header first
2. Fall back to `project_id` query parameter
3. If projectId is present, validate it exists and is active
4. If projectId is valid, allow request (skip user session check)
5. If no projectId, fall back to normal user session authentication

**Pseudocode Example:**
```python
def authenticate_request(request):
    # Check for projectId (widget mode)
    project_id = request.headers.get('X-Project-ID') or request.query_params.get('project_id')
    
    if project_id:
        # Validate project exists and is active
        project = Project.objects.filter(id=project_id, is_active=True).first()
        if project:
            # Set project context for the request
            request.project = project
            return True  # Allow request
        else:
            return False  # Invalid project
    
    # Fall back to normal user authentication
    return authenticate_user_session(request)
```

### 4. CORS Configuration

Ensure CORS headers allow:
- **Origin**: `*` (or specific domains)
- **Methods**: `GET, POST, OPTIONS`
- **Headers**: `X-Project-ID, Content-Type, Authorization`
- **Credentials**: `false` (for widget mode)

### 5. Response Format

All endpoints should return data in this format:
```json
{
  "success": true,
  "data": {
    // Actual response data here
  },
  "message": "Success message"
}
```

Or direct data (frontend handles both):
```json
{
  // Direct response data
}
```

## Current Frontend Behavior

The frontend already handles 401 errors gracefully:
- Returns default values when endpoints return 401
- Widget still functions with default settings
- No breaking errors in console

## Priority

**High Priority** (Widget won't work without these):
1. Search Query endpoint (for actual search functionality)
2. Search Configuration endpoint (for widget appearance)
3. Search Customization endpoint (for widget appearance)

**Medium Priority** (Widget works but with defaults):
4. Search Citation Settings (uses defaults if 401)
5. Response Configuration (uses defaults if 401)

**Low Priority** (Nice to have):
6. Search Activation Status (widget defaults to active)
7. Feedback Submission (feedback just won't be saved)

## Testing

After implementing, test with:
```html
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'http://192.168.0.101:8000/api/v1/search-widget/v1/loader.js';
    script.setAttribute('data-ragsuite-project-id', 'YOUR_PROJECT_ID');
    script.setAttribute('data-api-endpoint', 'http://192.168.0.101:8000/api/v1');
    script.async = true;
    document.body.appendChild(script);
  })();
</script>
```

Check browser console for:
- No 401 errors
- Widget appears on page
- Search functionality works
- Configuration/customization loads correctly

## Notes

- The widget always sends `projectId` in both header and query parameter for maximum compatibility
- If backend doesn't support projectId yet, frontend gracefully degrades with defaults
- Widget mode is detected by presence of `RAGSUITE_PROJECT_ID` in window object
- All widget requests include `project_id` in query params: `?project_id=<uuid>`

