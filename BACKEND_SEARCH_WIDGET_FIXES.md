# Backend Fixes Required for Search Widget

## Issue 1: Static Files Not Served (Method Not Allowed)

### Problem
```
GET http://192.168.0.101:8000/api/v1/search-widget/v1/loader.js
Returns: {"detail": "Method Not Allowed"}
```

### Solution
Configure backend to serve static files at `/api/v1/search-widget/v1/` with **GET** method.

**Files to serve:**
- `loader.js`
- `search-widget.umd.js`
- `search-widget.umd.js.map` (optional)
- `search-widget.css`

**Copy files from:** `dist/search-widget/v1/` to your backend static directory

**Implementation Examples:**

#### FastAPI
```python
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI()

# Mount static directory
app.mount("/api/v1/search-widget/v1", StaticFiles(directory="static/search-widget/v1"), name="search-widget-static")
```

#### Express.js
```javascript
const express = require('express');
const path = require('path');
const app = express();

app.use('/api/v1/search-widget/v1', express.static('static/search-widget/v1', {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }
  }
}));
```

#### Flask
```python
from flask import Flask, send_from_directory

app = Flask(__name__)

@app.route('/api/v1/search-widget/v1/<path:filename>')
def serve_widget_file(filename):
    return send_from_directory(
        'static/search-widget/v1',
        filename,
        mimetype={
            'js': 'application/javascript',
            'css': 'text/css',
            'map': 'application/json'
        }.get(filename.split('.')[-1], 'application/octet-stream')
    )
```

**CORS Configuration (if needed):**
```python
# FastAPI
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "OPTIONS"],
    allow_headers=["*"],
)
```

---

## Issue 2: Citation Formatting API (Optional but Recommended)

### Problem
The widget needs citation formatting settings to display sources correctly. Currently uses defaults if API returns 401.

### Solution
If you want citation formatting to work dynamically, implement:

**Endpoint:** `GET /api/v1/search/citation/`

**Should accept:**
- Header: `X-Project-ID: <project-id>`
- Query: `?project_id=<project-id>`

**Response Format:**
```json
{
  "showSourceCount": true,
  "layout": "grid",
  "colorScheme": "default"
}
```

**OR** return 401 if not implemented (widget will use defaults).

---

## Issue 3: Search Query Response Format

### Problem
The widget expects search responses to include citation data with proper structure.

### Solution
Ensure `/api/v1/search/query` or `/api/v1/rag/query` returns:

```json
{
  "answer": "The answer text here",
  "sources": [
    {
      "title": "Source Title",
      "url": "https://example.com/source",
      "snippet": "Relevant snippet from source"
    }
  ],
  "message_id": "msg-uuid",
  "session_id": "session-uuid"
}
```

**Important:** The `sources` array should contain objects with `title`, `url`, and `snippet` fields.

---

## Priority

1. **CRITICAL**: Static files serving (Issue 1) - Widget won't load without this
2. **HIGH**: Search query response format (Issue 3) - Citations won't display correctly
3. **LOW**: Citation formatting API (Issue 2) - Widget works with defaults

---

## Testing

After implementing, test:
```bash
# Test static files
curl http://192.168.0.101:8000/api/v1/search-widget/v1/loader.js
curl http://192.168.0.101:8000/api/v1/search-widget/v1/search-widget.umd.js
curl http://192.168.0.101:8000/api/v1/search-widget/v1/search-widget.css

# All should return 200 OK with file content
```

---

## Notes

- Static files must be served with correct MIME types
- CORS headers may be needed if widget is embedded on different domain
- The widget gracefully handles 401 errors and uses defaults

