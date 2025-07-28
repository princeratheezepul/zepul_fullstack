# Authentication System Documentation

## Overview

This project implements a **hybrid authentication approach** that combines the security of HTTP-only cookies with the convenience of client-side state management.

## Architecture

### 1. **Server-Side (HTTP-only Cookies)**
- **Access Token**: Short-lived JWT token (1 day)
- **Refresh Token**: Long-lived JWT token (30 days)
- **Storage**: HTTP-only cookies (XSS protection)
- **Automatic**: Sent with every request via `credentials: 'include'`

### 2. **Client-Side (React Context + localStorage)**
- **User Data**: Minimal user information (ID, email, username, type)
- **Storage**: React Context (runtime) + localStorage (persistence)
- **Security**: No sensitive data stored in localStorage

## Components

### AuthContext (`src/context/AuthContext.jsx`)
```javascript
const { user, isAuthenticated, isLoading, login, logout, updateUser } = useAuth();
```

**Features:**
- Centralized authentication state
- Automatic localStorage persistence
- Loading states for better UX
- Type-safe user data

### ProtectedRoute (`src/components/ProtectedRoute.jsx`)
```javascript
<ProtectedRoute allowedRoles={['admin', 'manager']}>
  <AdminDashboard />
</ProtectedRoute>
```

**Features:**
- Role-based access control
- Automatic redirects
- Loading states
- Flexible role configuration

### useApi Hook (`src/hooks/useApi.js`)
```javascript
const { get, post, put, delete: del } = useApi();

// Automatic authentication handling
const response = await get('/api/users');
```

**Features:**
- Automatic credential inclusion
- 401 handling with logout
- Error handling
- Type-safe methods

## Usage Examples

### Login
```javascript
import { useAuth } from '../context/AuthContext';

const { login } = useAuth();

const handleLogin = async (credentials) => {
  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
    credentials: 'include'
  });
  
  const userData = await response.json();
  login(userData); // Stores minimal data in context + localStorage
};
```

### Protected Components
```javascript
import ProtectedRoute from '../components/ProtectedRoute';

function App() {
  return (
    <ProtectedRoute allowedRoles={['manager']}>
      <ManagerDashboard />
    </ProtectedRoute>
  );
}
```

### API Calls
```javascript
import { useApi } from '../hooks/useApi';

function UserProfile() {
  const { get, put } = useApi();
  
  const fetchUser = async () => {
    const response = await get('/api/user/profile');
    const data = await response.json();
    // Automatic 401 handling
  };
}
```

### Logout
```javascript
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../utils/authUtils';

const { logout } = useAuth();

const handleLogout = async () => {
  await logoutUser(navigate);
  logout(); // Clears context
};
```

## Security Benefits

1. **XSS Protection**: Tokens in HTTP-only cookies
2. **CSRF Protection**: SameSite cookie attributes
3. **Minimal Data Exposure**: Only essential user data in localStorage
4. **Automatic Token Management**: Server handles token refresh
5. **Secure Logout**: Clears both client and server state

## Migration Guide

### From Old System
1. Replace `localStorage.getItem('userInfo')` with `useAuth()`
2. Replace manual token handling with `useApi()` hook
3. Wrap protected routes with `ProtectedRoute`
4. Update logout to use `logoutUser()` utility

### Benefits
- ✅ Better security
- ✅ Improved performance
- ✅ Centralized state management
- ✅ Automatic error handling
- ✅ Type safety
- ✅ Better user experience

## File Structure
```
src/
├── context/
│   └── AuthContext.jsx          # Main auth context
├── components/
│   └── ProtectedRoute.jsx       # Route protection
├── hooks/
│   └── useApi.js               # API utilities
├── utils/
│   └── authUtils.js            # Auth utilities
└── docs/
    └── AUTHENTICATION.md       # This file
``` 