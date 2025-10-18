# Attendance Feature Testing Guide

This document provides step-by-step instructions to test the new attendance features.

## Prerequisites
1. MongoDB running on localhost:27017
2. Backend server running on localhost:3000
3. Seeded database with test users (run `npm run seed`)

## Test Scenarios

### Scenario 1: Bulk Mark Attendance (Faculty)

**Login as Faculty**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sunita.verma@example.com",
    "password": "password123"
  }'
```

**Response:** You'll receive a JWT token. Use it in subsequent requests.

**Mark Bulk Attendance**

First, get the course ID from the courses endpoint or from the seed data output.

```bash
curl -X POST http://localhost:3000/api/auth/attendance/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "course_id": "YOUR_COURSE_ID",
    "date": "2024-01-20",
    "students": [
      { "student_id": "STUDENT_ID_1", "status": "present" },
      { "student_id": "STUDENT_ID_2", "status": "absent" },
      { "student_id": "STUDENT_ID_3", "status": "late" }
    ]
  }'
```

**Note**: Get course IDs and student IDs from:
- `GET /api/auth/courses` for course IDs
- `GET /api/auth/users` for student IDs
- Or check the output of `npm run seed` command

**Expected Result:** All students' attendance marked for the specified date.

---

### Scenario 2: View Attendance Records (Faculty/Admin)

**Get All Attendance Records**
```bash
curl -X GET http://localhost:3000/api/auth/attendance \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Filter by Course**
```bash
curl -X GET "http://localhost:3000/api/auth/attendance?course_id=YOUR_COURSE_ID" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Filter by Date**
```bash
curl -X GET "http://localhost:3000/api/auth/attendance?date=2024-01-20" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Result:** JSON array of attendance records with course, student, and status information.

---

### Scenario 3: Student Views Own Attendance

**Login as Student**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "amit.kumar@example.com",
    "password": "password123"
  }'
```

**View My Attendance**
```bash
curl -X GET http://localhost:3000/api/auth/attendance \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Result:** Only the student's own attendance records are returned.

---

### Scenario 4: Individual Attendance Marking

**Mark Individual Attendance**
```bash
curl -X POST http://localhost:3000/api/auth/attendance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "course_id": "YOUR_COURSE_ID",
    "student_id": "STUDENT_ID",
    "date": "2024-01-21",
    "status": "present"
  }'
```

**Expected Result:** Single attendance record created/updated.

---

## Frontend Testing

### 1. Admin/Faculty Dashboard
1. Login as faculty/admin
2. Navigate to "Attendance" tab
3. Use "Bulk Mark Attendance" form:
   - Select a course
   - Select a date
   - Mark attendance status for each student
   - Submit
4. View results in "View Attendance Records" section below

### 2. Student Dashboard
1. Login as student
2. Navigate to "My Attendance" tab
3. View your attendance records
4. Filter by course or date

---

## API Response Examples

### Successful Bulk Attendance Response
```json
{
  "message": "Bulk attendance processed",
  "results": [
    {
      "student_id": "6789...",
      "status": "success",
      "attendance": {
        "_id": "abc123...",
        "course_id": "xyz456...",
        "student_id": "6789...",
        "date": "2024-01-20T00:00:00.000Z",
        "status": "present",
        "marked_by": "def789..."
      }
    }
  ]
}
```

### Get Attendance Response
```json
{
  "attendance": [
    {
      "_id": "abc123...",
      "course_id": {
        "_id": "xyz456...",
        "course_name": "Introduction to Programming"
      },
      "student_id": {
        "_id": "6789...",
        "name": "Amit Kumar",
        "email": "amit.kumar@example.com"
      },
      "date": "2024-01-20T00:00:00.000Z",
      "status": "present",
      "marked_by": {
        "_id": "def789...",
        "name": "Dr. Sunita Verma",
        "email": "sunita.verma@example.com",
        "role": "faculty"
      },
      "createdAt": "2024-01-20T08:30:00.000Z",
      "updatedAt": "2024-01-20T08:30:00.000Z"
    }
  ]
}
```

---

## Error Scenarios to Test

1. **Unauthorized Access**: Student trying to view another student's attendance
   - Expected: 403 Forbidden error

2. **Faculty Not Assigned to Course**: Faculty trying to mark attendance for a course they're not assigned to
   - Expected: 403 Forbidden error

3. **Invalid Student**: Trying to mark attendance for student not enrolled in course
   - Expected: 400 Bad Request error

4. **Missing Required Fields**: POST without course_id, date, or students
   - Expected: 400 Bad Request error

---

## Performance Considerations

- Bulk marking is more efficient than individual API calls for each student
- Recommended batch size: 30-50 students per bulk request
  - Based on typical MongoDB document size limits and network latency
  - Keeps request/response payload manageable
  - Provides good balance between efficiency and reliability
- For larger classes (100+ students), consider splitting into multiple batches
- Each bulk request processes students sequentially to ensure data consistency

---

## Notes

- All dates are stored in UTC format
- Attendance records are unique per (course_id, student_id, date) combination
- Updating an existing attendance record (same date) will overwrite the previous status
- The `marked_by` field tracks who recorded the attendance
