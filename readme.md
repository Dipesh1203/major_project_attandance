# 📚 Node Education API

This project provides APIs for managing **nodes, users, programs, courses, enrollments, and more**.  
It is designed for nodal officers, admins, faculty, and students to streamline education workflows.

---

## 🚀 Authentication & Roles

- **Nodal Officer** → Manage admins, programs, courses, enrollments  
- **Admin** → Manage programs, courses, users  
- **Faculty & Students** → Limited access (view courses, enrollments, progress, etc.)

All protected routes require a **JWT Token**:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔑 API Endpoints

### 1. Login
```http
POST /api/auth/login
```
**Body:**
```json
{
  "email": "rajesh.kumar@example.com",
  "password": "password123"
}
```

---

### 2. Create Admin (as Nodal Officer)
```http
POST /api/auth/create-user
```

---

### 3. Get User Profile
```http
GET /api/auth/profile
```

---

### 4. Get Users
```http
GET /api/auth/users
```

---

### 5. Create Program
```http
POST /api/auth/programs
```

---

### 6. Get Programs
```http
GET /api/auth/programs
```

---

### 7. Create Course
```http
POST /api/auth/courses
```

---

### 8. Get Courses
```http
GET /api/auth/courses
```

---

### 9. Enroll Student
```http
POST /api/auth/enroll
```

---

### 10. Mark Attendance (Individual)
```http
POST /api/auth/attendance
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "course_id": "[COURSE_ID]",
  "student_id": "[STUDENT_ID]",
  "date": "2024-01-20",
  "status": "present"
}
```
**Status options:** `present`, `absent`, `late`, `excused`

---

### 11. Bulk Mark Attendance
```http
POST /api/auth/attendance/bulk
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "course_id": "[COURSE_ID]",
  "date": "2024-01-20",
  "students": [
    { "student_id": "[STUDENT_ID_1]", "status": "present" },
    { "student_id": "[STUDENT_ID_2]", "status": "absent" },
    { "student_id": "[STUDENT_ID_3]", "status": "late" }
  ]
}
```
**Use case:** Mark attendance for all students in a course at once

---

### 12. Get Attendance Records
```http
GET /api/auth/attendance
Authorization: Bearer YOUR_JWT_TOKEN

# Optional query parameters:
# ?course_id=[COURSE_ID]
# ?student_id=[STUDENT_ID]
# ?date=2024-01-20
```
**Note:** Students can only view their own attendance. Faculty/Admin/Nodal officers can view all attendance in their node.

---

### 13. Track Student Progress
```http
GET /api/auth/progress?student_id=[STUDENT_ID]
Authorization: Bearer YOUR_JWT_TOKEN

# Optional: Filter by course
GET /api/auth/progress?student_id=[STUDENT_ID]&course_id=[COURSE_ID]
```

---

### 14. Generate Certificate
```http
POST /api/auth/certificates
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "course_id": "[COURSE_ID]",
  "student_id": "[STUDENT_ID]",
  "certificate_url": "https://example.com/certificate.pdf"
}
```

---

## 🎯 New Features

### Attendance Management System
The system now includes comprehensive attendance management:

1. **Individual Attendance Marking**: Mark attendance for one student at a time
2. **Bulk Attendance Marking**: Mark attendance for all students in a course simultaneously
3. **Attendance Records Viewing**: View attendance with filters by course, student, and date
4. **Role-Based Access**: 
   - Faculty can mark attendance for assigned courses
   - Admins and Nodal Officers can mark attendance for any course in their node
   - Students can view their own attendance records
5. **Attendance Status Types**: Present, Absent, Late, Excused

---

## 🧪 Testing Workflow (Updated)

1. **Login as Nodal Officer**
   ```http
   POST /api/auth/login
   ```
2. **Create Program**
   ```http
   POST /api/auth/programs
   ```
3. **Verify Programs**
   ```http
   GET /api/auth/programs
   ```
4. **Create Course**
   ```http
   POST /api/auth/courses
   ```
5. **Verify Courses**
   ```http
   GET /api/auth/courses
   ```
6. **Enroll Student**
   ```http
   POST /api/auth/enroll
   ```
7. **Mark Bulk Attendance**
   ```http
   POST /api/auth/attendance/bulk
   ```
8. **View Attendance Records**
   ```http
   GET /api/auth/attendance
   ```
9. **Get Profile**
   ```http
   GET /api/auth/profile
   ```
10. **Get All Users**
   ```http
   GET /api/auth/users
   ```

---

## ⚡ Notes

- Use **Bearer Token** for all protected routes  
- The attendance feature is now fully integrated with both individual and bulk marking capabilities
- Students can view their own attendance records
- Faculty can mark attendance for courses they are assigned to
- API responses include helpful messages and resource objects for quick integration

---

## 🖥️ Frontend Features

The frontend application includes:
- **Admin Dashboard**: Manage users, programs, courses, enrollments, attendance, and certificates
- **Faculty Dashboard**: Mark attendance (individual and bulk) and view attendance records
- **Student Dashboard**: View programs, courses, attendance records, and progress
- **Bulk Attendance Marking**: Select a course and date, then mark attendance for all enrolled students at once
- **Attendance Viewer**: Filter and view attendance records by course, student, and date

---
