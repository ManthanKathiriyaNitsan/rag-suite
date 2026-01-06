# Git Commit Message

```
fix: reduce excessive API requests and handle widget authentication errors

## Changes

### Frontend Fixes

1. **Reduced Console Logging**
   - API request/response logging only in development mode
   - Suppressed CORB/CORS error spam (logged once)
   - Health/status endpoints excluded from logging

2. **Optimized Polling Intervals**
   - Crawl status: 0.5s → 3s
   - System Health: 10s → 30s
   - Documents: 10s → 60s
   - Projects: 10s → 60s
   - Analytics: 60s → 300s (5 minutes)
   - Chat History: 30s → 60s
   - Document Stats: 30s → 120s

3. **Error Handling Improvements**
   - Stop polling on CORB/CORS errors
   - Added retry limits (max 1 retry)
   - Disabled refetchOnWindowFocus to prevent excessive requests
   - Error detection stops polling automatically

4. **Widget Authentication Error Handling**
   - Suppressed 401 errors for activation endpoints in widget mode
   - Widget defaults to active status when backend doesn't support projectId
   - Graceful fallback for widget authentication
   - Reduced error logging for expected 401s

### Files Modified

- client/src/services/api/api.ts
  - Reduced console logging
  - Added CORB/CORS error detection
  - Suppressed 401 errors for activation endpoints in widget mode
  - Improved error handling

- client/src/hooks/useCrawl.ts
  - Increased polling interval from 0.5s to 3s
  - Added CORB/CORS error detection and polling stop

- client/src/hooks/useSystemHealth.ts
  - Increased polling interval from 10s to 30s
  - Added error handling

- client/src/hooks/useDocuments.ts
  - Increased polling intervals
  - Added error handling

- client/src/hooks/useProjects.ts
  - Increased polling interval from 10s to 60s
  - Added error handling

- client/src/hooks/useAnalytics.ts
  - Increased polling interval from 60s to 300s
  - Added error handling for all analytics hooks

- client/src/hooks/useSearchActivation.ts
  - Disabled retry for activation queries
  - Improved widget mode error handling

- client/src/pages/ChatbotConfiguration.tsx
  - Increased chat history polling from 30s to 60s
  - Added CORB/CORS error detection

- client/src/pages/SearchConfiguration.tsx
  - Increased chat history polling from 30s to 60s
  - Added CORB/CORS error detection

### Documentation Added

- BACKEND_WIDGET_AUTHENTICATION.md
  - Complete guide for implementing projectId authentication
  - Examples for FastAPI, Express.js, Django
  - Security considerations and testing instructions

## Impact

- Reduces continuous API requests from 2,446+ to normal levels
- Eliminates CORB error spam in console
- Widget continues working even if backend doesn't support projectId yet
- Cleaner console with only relevant errors
- Better user experience with optimized polling

## Backend Requirements

See BACKEND_WIDGET_AUTHENTICATION.md for:
- ProjectId authentication implementation
- CORS configuration (if not already done)
- Endpoint requirements for widget support

## Testing

- Verify no excessive requests in Network tab
- Check console for reduced error messages
- Confirm widget works in widget mode
- Verify polling stops on CORB/CORS errors
```

