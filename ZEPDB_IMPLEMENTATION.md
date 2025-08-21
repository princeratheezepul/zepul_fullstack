# ZepDB Implementation Guide

## Overview
ZepDB is an AI-powered recruitment assistant that allows recruiters to query their candidate database using natural language. It uses Google's Gemini AI to extract structured information from user queries and then searches the database for matching candidates.

## Features Implemented

### ✅ Backend (Node.js/Express)
1. **ZepDB Controller** (`server/src/controllers/zepdb.controller.js`)
   - Gemini AI integration for query processing
   - Database querying with MongoDB
   - Candidate filtering and formatting
   - Statistics endpoint for status counts

2. **ZepDB Routes** (`server/src/routes/zepdb.route.js`)
   - POST `/api/zepdb/query` - Process natural language queries
   - GET `/api/zepdb/stats` - Get candidate statistics
   - Recruiter authentication middleware

3. **Server Integration** (`server/src/index.js`)
   - Added ZepDB routes to main server

### ✅ Frontend (React)
1. **ZepDB Component** (`client/src/Components/recruiter/dashboard/ZepDB.jsx`)
   - ChatGPT-like interface
   - Real-time query processing
   - Candidate list display with status filtering
   - Responsive design with Tailwind CSS

2. **Dashboard Integration** (`client/src/Pages/RecruiterDashboard.jsx`)
   - Added ZepDB to sidebar navigation
   - Conditional rendering based on active component

## Setup Instructions

### 1. Environment Variables
Add the following to your `.env` file in the server directory:

```env
# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Other existing variables...
ACCESS_TOKEN_SECRET=your_jwt_secret
MONGODB_URI=your_mongodb_connection_string
```

### 2. Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key and add it to your `.env` file

### 3. Dependencies
The required dependencies are already installed:
- `@google/generative-ai` - For Gemini AI integration
- All other dependencies are already present

## How It Works

### 1. Query Processing Flow
```
User Input → Frontend → Backend API → Gemini AI → Database Query → Results
```

### 2. Gemini AI Integration
- Extracts structured information from natural language queries
- Identifies roles, experience requirements, skills, location
- Returns JSON with extracted criteria
- Fallback to simple parsing if Gemini fails

### 3. Database Querying
- Searches resumes based on extracted criteria
- Filters by recruiter ID for security
- Supports role, experience, skills, location filtering
- Returns formatted candidate data

### 4. Frontend Display
- Shows results in professional candidate list format
- Status-based filtering with counts
- Responsive design for all devices
- Loading states and error handling

## API Endpoints

### POST `/api/zepdb/query`
**Request:**
```json
{
  "query": "Give me resumes for software developers with experience greater than 3 years"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "Give me resumes for software developers with experience greater than 3 years",
    "extractedInfo": {
      "role": "software developer",
      "minExperience": 3,
      "maxExperience": 5,
      "skills": [],
      "location": "",
      "status": "all"
    },
    "candidates": [...],
    "totalCount": 5
  }
}
```

### GET `/api/zepdb/stats`
**Response:**
```json
{
  "success": true,
  "data": {
    "all": 25,
    "scheduled": 3,
    "screening": 8,
    "submitted": 10,
    "shortlisted": 2,
    "rejected": 1,
    "offered": 1,
    "hired": 0
  }
}
```

## Example Queries

Users can ask questions like:
- "Give me resumes for software developers with experience greater than 3 years"
- "Show me candidates with React experience"
- "Find frontend developers in Bangalore"
- "Get candidates with Python and Django skills"
- "Show me senior developers with 5+ years experience"

## Security Features

1. **Authentication**: All endpoints require recruiter authentication
2. **Data Isolation**: Recruiters can only see their own candidates
3. **Input Validation**: Query validation and sanitization
4. **Error Handling**: Comprehensive error handling and logging

## Performance Optimizations

1. **Query Limiting**: Results limited to 100 candidates per query
2. **Database Indexing**: Uses existing indexes on recruiterId and status
3. **Caching**: Can be extended with Redis for frequently accessed data
4. **Pagination**: Can be extended for large result sets

## Future Enhancements

1. **Advanced Filtering**: Add more sophisticated filtering options
2. **Search History**: Save and reuse previous queries
3. **Export Results**: Export candidate lists to CSV/PDF
4. **Real-time Updates**: WebSocket integration for live updates
5. **Analytics**: Query analytics and insights
6. **Multi-language Support**: Support for multiple languages

## Troubleshooting

### Common Issues

1. **Gemini API Errors**
   - Check API key is valid
   - Verify internet connection
   - Check API quota limits

2. **Database Connection Issues**
   - Verify MongoDB connection string
   - Check database permissions
   - Ensure resume collection exists

3. **Authentication Errors**
   - Verify JWT token is valid
   - Check recruiter exists in database
   - Ensure proper middleware setup

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=true
```

## Testing

### Manual Testing
1. Start the server: `npm run dev`
2. Start the client: `npm run dev`
3. Login as a recruiter
4. Navigate to ZepDB in sidebar
5. Try various queries and verify results

### API Testing
Use Postman or curl to test endpoints:
```bash
curl -X POST http://localhost:5000/api/zepdb/query \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query": "Find React developers"}'
```

## Support

For issues or questions:
1. Check the console logs for error messages
2. Verify all environment variables are set
3. Ensure database has candidate data
4. Test with simple queries first

---

**Note**: This implementation provides a production-ready foundation for AI-powered recruitment queries. The system is scalable and can be extended with additional features as needed.
