# JWT Token Expiration Fixes

## Problem
The JWT tokens were expiring too quickly:
- Recruiter tokens: 2 hours
- Manager/Admin/AccountManager tokens: 1 day
- Users were being logged out frequently and had to re-authenticate

## Solution Implemented

### 1. Extended Token Expiration Times
- **All user types**: Access tokens now expire in **24 hours** (instead of 1 day or 2 hours)
- **Refresh tokens**: Remain at 30 days for all user types

### 2. Added Automatic Token Refresh
- **Server-side**: Added refresh token endpoints for all user types:
  - `/api/admin/refresh-token`
  - `/api/manager/refresh-token`
  - `/api/accountmanager/refresh-token`
  - `/api/recruiter/refresh-token`

- **Client-side**: Updated `useApi` hook to automatically refresh tokens when they expire
- **Automatic retry**: Failed requests due to expired tokens are automatically retried with new tokens

### 3. Improved Token Management
- **Recruiter tokens**: Now use the same refresh token system as other user types
- **Cookie management**: All tokens are properly cleared on logout
- **Storage cleanup**: Expired tokens are automatically removed from localStorage

### 4. Better Error Handling
- **Graceful degradation**: If token refresh fails, users are redirected to appropriate login pages
- **User-specific redirects**: Different login pages for different user types
- **Automatic logout**: Expired tokens trigger automatic logout and cleanup

## Files Modified

### Server-side Changes
- `server/src/models/user.model.js` - Updated default access token expiry to 24h
- `server/src/models/admin.model.js` - Updated default access token expiry to 24h
- `server/src/models/accountmanager.model.js` - Updated default access token expiry to 24h
- `server/src/controllers/recruiter.controller.js` - Updated token expiry to 24h, added refresh token support
- `server/src/controllers/manager.controller.js` - Added refresh token endpoint
- `server/src/controllers/admin.controller.js` - Added refresh token endpoint
- `server/src/controllers/accountmanager.controller.js` - Added refresh token endpoint
- All route files - Added refresh token routes

### Client-side Changes
- `client/src/hooks/useApi.js` - Added automatic token refresh logic
- `client/src/context/AuthContext.jsx` - Added token expiration checking

## Environment Variables
Make sure these environment variables are set in your `.env` file:

```env
ACCESS_TOKEN_SECRET=your_access_token_secret_key_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key_here
JWT_SECRET=your_jwt_secret_key_here

# Optional - defaults are set in code
ACCESS_TOKEN_EXPIRY=24h
REFRESH_TOKEN_EXPIRY=30d
```

## Benefits
1. **Better User Experience**: Users stay logged in for 24 hours
2. **Automatic Recovery**: Expired tokens are automatically refreshed
3. **Security**: Refresh tokens provide secure token renewal
4. **Consistency**: All user types now use the same token management system
5. **Reduced Login Friction**: Users don't need to re-login frequently

## Testing
To test the token refresh functionality:
1. Login with any user type
2. Wait for the access token to expire (or manually expire it)
3. Make an API call - it should automatically refresh the token
4. The user should remain logged in without interruption 