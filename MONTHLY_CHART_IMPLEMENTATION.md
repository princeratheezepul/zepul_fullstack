# Monthly Candidate Submission Chart Implementation

## Overview
This implementation adds real-time data functionality to the Candidate Submission Chart, showing the number of resumes submitted by a recruiter over the last 7 months.

## Features Implemented

### 1. Backend API Endpoint
- **Route**: `GET /api/resumes/stats/monthly`
- **Authentication**: Requires recruiter JWT token
- **Response**: Monthly submission data for the last 7 months

### 2. Frontend Chart Component
- **Real-time data fetching** from the API
- **Loading states** with spinner
- **Error handling** with retry functionality
- **Dynamic Y-axis scaling** based on data
- **Interactive hover effects**

## Technical Implementation

### Backend Changes

#### 1. Controller Function (`server/src/controllers/resume.controller.js`)
```javascript
export const getMonthlySubmissionData = async (req, res) => {
  // Aggregates resume submissions by month for the last 7 months
  // Returns data in format: [{ name: 'Jan', uv: 5 }, ...]
}
```

**Key Features:**
- Uses MongoDB aggregation pipeline
- Filters by recruiter ID and date range
- Groups by year and month
- Returns formatted data with month names

#### 2. Route Addition (`server/src/routes/resume.route.js`)
```javascript
router.get("/stats/monthly", verifyRecruiterJWT, getMonthlySubmissionData);
```

### Frontend Changes

#### 1. Updated Component (`client/src/Components/recruiter/dashboard/CandidateSubmissionChart.jsx`)

**Key Changes:**
- Replaced static data with API calls
- Added loading and error states
- Integrated with `useApi` hook for authentication
- Dynamic Y-axis scaling
- Proper error handling with retry functionality

**State Management:**
```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [activeDataKey, setActiveDataKey] = useState('');
```

**API Integration:**
```javascript
const { get } = useApi();

const fetchMonthlyData = async () => {
  const response = await get(`${import.meta.env.VITE_BACKEND_URL}/api/resumes/stats/monthly`);
  const result = await response.json();
  // Handle response...
};
```

## Data Flow

1. **Resume Submission**: When a recruiter submits a resume, it's saved with `createdAt` timestamp
2. **Chart Data Request**: Component fetches monthly data via API
3. **Data Aggregation**: Backend aggregates resumes by month for the last 7 months
4. **Chart Rendering**: Frontend displays the aggregated data in the area chart

## API Response Format

```json
{
  "success": true,
  "data": [
    { "name": "Jan", "uv": 5 },
    { "name": "Feb", "uv": 12 },
    { "name": "Mar", "uv": 8 },
    { "name": "Apr", "uv": 15 },
    { "name": "May", "uv": 20 },
    { "name": "Jun", "uv": 18 },
    { "name": "Jul", "uv": 25 }
  ]
}
```

## Error Handling

### Backend
- Validates recruiter ID from JWT token
- Handles MongoDB aggregation errors
- Returns appropriate HTTP status codes

### Frontend
- Shows loading spinner during API calls
- Displays error messages with retry button
- Graceful fallback to empty data
- Automatic token refresh via `useApi` hook

## Security

- **Authentication**: Requires valid recruiter JWT token
- **Authorization**: Only returns data for the authenticated recruiter
- **Input Validation**: Validates recruiter ID and date parameters
- **Error Sanitization**: Prevents sensitive information leakage

## Performance Considerations

- **Database Indexing**: Ensure `recruiterId` and `createdAt` fields are indexed
- **Caching**: Consider implementing Redis caching for frequently accessed data
- **Pagination**: For large datasets, consider implementing pagination
- **Real-time Updates**: Consider WebSocket integration for live updates

## Testing

### Manual Testing
1. Login as a recruiter
2. Navigate to the dashboard
3. Submit some test resumes
4. Check if the chart updates with real data
5. Test error scenarios (network issues, invalid tokens)

### API Testing
```bash
# Test the endpoint (requires valid JWT token)
curl -X GET \
  http://localhost:5000/api/resumes/stats/monthly \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

## Future Enhancements

1. **Date Range Selection**: Allow users to select custom date ranges
2. **Export Functionality**: Add ability to export chart data
3. **Comparative Analysis**: Show data compared to previous periods
4. **Real-time Updates**: Implement WebSocket for live data updates
5. **Advanced Filtering**: Filter by job type, status, etc.

## Troubleshooting

### Common Issues

1. **No Data Showing**
   - Check if resumes exist for the recruiter
   - Verify date range (last 7 months)
   - Check database connection

2. **Authentication Errors**
   - Verify JWT token is valid
   - Check token expiration
   - Ensure proper user type (recruiter)

3. **Chart Not Rendering**
   - Check browser console for errors
   - Verify API response format
   - Check if Recharts library is properly imported

### Debug Steps

1. Check server logs for API errors
2. Verify database queries in MongoDB
3. Test API endpoint directly with Postman/curl
4. Check browser network tab for failed requests
5. Verify environment variables are set correctly

## Dependencies

### Backend
- `mongoose`: For MongoDB aggregation
- `jsonwebtoken`: For authentication
- `express`: For routing

### Frontend
- `recharts`: For chart rendering
- `react`: For component lifecycle
- Custom `useApi` hook: For API calls and authentication

## Environment Variables

Ensure these are set in your `.env` file:
```env
PORT=5000
DB_URL=your_mongodb_connection_string
Frontend_URL=http://localhost:5173
ACCESS_TOKEN_SECRET=your_jwt_secret
``` 