# NoGital Focus API Documentation

## Overview

The NoGital Focus API provides endpoints for managing tasks, tracking productivity, and accessing AI-powered features.

## Base URL

```
https://api.nogitalfocus.com/v1
```

## Authentication

All API requests require authentication using Bearer tokens.

```http
Authorization: Bearer YOUR_API_TOKEN
```

## Endpoints

### Tasks

#### Get All Tasks
```http
GET /tasks
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "task_123",
      "title": "Complete project proposal",
      "description": "Write the initial project proposal document",
      "status": "in_progress",
      "priority": "high",
      "due_date": "2025-02-15T10:00:00Z",
      "created_at": "2025-01-21T08:00:00Z",
      "updated_at": "2025-01-21T09:30:00Z"
    }
  ]
}
```

#### Create Task
```http
POST /tasks
```

**Request Body:**
```json
{
  "title": "New task title",
  "description": "Task description",
  "priority": "medium",
  "due_date": "2025-02-15T10:00:00Z"
}
```

#### Update Task
```http
PUT /tasks/{task_id}
```

#### Delete Task
```http
DELETE /tasks/{task_id}
```

### Focus Sessions

#### Start Session
```http
POST /sessions
```

**Request Body:**
```json
{
  "duration": 1500,
  "type": "pomodoro",
  "task_id": "task_123"
}
```

#### Get Session History
```http
GET /sessions
```

**Query Parameters:**
- `start_date`: Start date (ISO format)
- `end_date`: End date (ISO format)
- `type`: Session type (pomodoro, break, custom)

### Goals

#### Get Goals
```http
GET /goals
```

#### Create Goal
```http
POST /goals
```

**Request Body:**
```json
{
  "title": "Learn React",
  "description": "Master React fundamentals",
  "target_date": "2025-03-15T00:00:00Z",
  "category": "learning"
}
```

### Analytics

#### Get Productivity Stats
```http
GET /analytics/productivity
```

**Query Parameters:**
- `period`: Time period (day, week, month, year)
- `start_date`: Start date
- `end_date`: End date

**Response:**
```json
{
  "success": true,
  "data": {
    "total_focus_time": 3600,
    "completed_tasks": 15,
    "productivity_score": 85.5,
    "sessions_completed": 8,
    "goals_progress": 60
  }
}
```

### AI Features

#### Get AI Suggestions
```http
POST /ai/suggestions
```

**Request Body:**
```json
{
  "user_id": "user_123",
  "context": "productivity_optimization"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "type": "schedule_optimization",
        "title": "Optimize your morning routine",
        "description": "Based on your patterns, try starting focused work at 9 AM",
        "confidence": 0.85
      }
    ]
  }
}
```

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "title",
      "issue": "Title is required"
    }
  }
}
```

### Common Error Codes
- `AUTHENTICATION_ERROR`: Invalid or missing authentication
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `VALIDATION_ERROR`: Invalid request data
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Rate Limiting

- **Free Tier**: 100 requests/hour
- **Pro Tier**: 1000 requests/hour
- **Enterprise**: Custom limits

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642752000
```

## Pagination

For endpoints that return lists, pagination is supported:

```http
GET /tasks?page=1&limit=20
```

**Response Headers:**
```http
X-Total-Count: 150
X-Page-Count: 8
X-Current-Page: 1
```

## Webhooks

### Available Events
- `task.created`
- `task.completed`
- `session.started`
- `session.completed`
- `goal.achieved`

### Webhook Payload
```json
{
  "event": "task.completed",
  "timestamp": "2025-01-21T10:30:00Z",
  "data": {
    "task_id": "task_123",
    "user_id": "user_456",
    "completed_at": "2025-01-21T10:30:00Z"
  }
}
```

## SDKs

### JavaScript/TypeScript
```bash
npm install @nogitalfocus/sdk
```

```javascript
import { NoGitalFocusAPI } from '@nogitalfocus/sdk';

const api = new NoGitalFocusAPI('YOUR_API_TOKEN');

// Get tasks
const tasks = await api.tasks.getAll();

// Create task
const newTask = await api.tasks.create({
  title: 'New task',
  priority: 'high'
});
```

### Python
```bash
pip install nogitalfocus-python
```

```python
from nogitalfocus import NoGitalFocusAPI

api = NoGitalFocusAPI('YOUR_API_TOKEN')

# Get tasks
tasks = api.tasks.get_all()

# Create task
new_task = api.tasks.create({
    'title': 'New task',
    'priority': 'high'
})
```

## Support

- **API Documentation**: https://docs.nogitalfocus.com/api
- **SDK Documentation**: https://docs.nogitalfocus.com/sdk
- **Support Email**: api-support@nogitalfocus.com
- **Status Page**: https://status.nogitalfocus.com

---

**Last Updated**: January 21, 2025
**API Version**: v1.0.0 