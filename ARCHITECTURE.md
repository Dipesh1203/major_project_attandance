# Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          ATTENDANCE FEATURE                          │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌───────────────────┐  ┌───────────────────┐  ┌────────────────┐  │
│  │  Admin Dashboard  │  │ Faculty Dashboard │  │Student Dashboard│ │
│  │  ┌─────────────┐  │  │  ┌─────────────┐  │  │ ┌────────────┐ │  │
│  │  │ Attendance  │  │  │  │ Attendance  │  │  │ │My Attendance│ │
│  │  │    Tab      │  │  │  │    Tab      │  │  │ │    Tab     │  │
│  │  └─────────────┘  │  │  └─────────────┘  │  │ └────────────┘ │  │
│  └───────────────────┘  └───────────────────┘  └────────────────┘  │
│           │                       │                      │           │
│           └───────────────────────┴──────────────────────┘           │
│                                   │                                  │
│  ┌────────────────────────────────┼──────────────────────────────┐  │
│  │         COMPONENTS             │                              │  │
│  │  ┌─────────────────────────────▼────────────────────────────┐ │  │
│  │  │ BulkMarkAttendanceForm                                   │ │  │
│  │  │ • Select course & date                                   │ │  │
│  │  │ • Load enrolled students                                 │ │  │
│  │  │ • Mark status for all students                          │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │ MarkAttendanceForm (Enhanced)                           │ │  │
│  │  │ • Select course, student, date                          │ │  │
│  │  │ • Choose status (Present/Absent/Late/Excused)          │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  │  ┌──────────────────────────────────────────────────────────┐ │  │
│  │  │ AttendanceViewer                                        │ │  │
│  │  │ • Filter by course/student/date                        │ │  │
│  │  │ • Table view with color-coded badges                  │ │  │
│  │  │ • Role-based data filtering                           │ │  │
│  │  └──────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ HTTP/JSON + JWT
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND API (Express.js)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    ROUTES (auth.route.js)                   │    │
│  │                                                             │    │
│  │  POST /api/auth/attendance                                 │    │
│  │  • Mark individual attendance                              │    │
│  │  • Auth: faculty, admin, nodal_officer                    │    │
│  │                                                             │    │
│  │  POST /api/auth/attendance/bulk  [NEW]                    │    │
│  │  • Mark attendance for multiple students                   │    │
│  │  • Auth: faculty, admin, nodal_officer                    │    │
│  │                                                             │    │
│  │  GET /api/auth/attendance  [NEW]                          │    │
│  │  • View attendance records                                 │    │
│  │  • Auth: all authenticated users                          │    │
│  │  • Query: ?course_id=X&student_id=Y&date=Z                │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                   │                                  │
│                                   ▼                                  │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │            CONTROLLERS (auth.controller.js)                 │    │
│  │                                                             │    │
│  │  markAttendance(req, res)                                  │    │
│  │  • Validate course & student                               │    │
│  │  • Check enrollment                                        │    │
│  │  • Upsert attendance record                                │    │
│  │                                                             │    │
│  │  bulkMarkAttendance(req, res)  [NEW]                      │    │
│  │  • Validate course                                         │    │
│  │  • Loop through students array                             │    │
│  │  • Validate & mark each student                           │    │
│  │  • Return results array                                    │    │
│  │                                                             │    │
│  │  getAttendance(req, res)  [NEW]                           │    │
│  │  • Build query from filters                               │    │
│  │  • Apply role-based access control                        │    │
│  │  • Return filtered attendance records                     │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                   │                                  │
│                                   ▼                                  │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    MIDDLEWARES                              │    │
│  │  • auth() - Verify JWT token                               │    │
│  │  • authorize(...roles) - Check user role                   │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      DATABASE (MongoDB)                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              Attendance Collection                          │    │
│  │                                                             │    │
│  │  {                                                          │    │
│  │    _id: ObjectId,                                          │    │
│  │    course_id: ObjectId (ref: Course),                     │    │
│  │    student_id: ObjectId (ref: User),                      │    │
│  │    date: Date,                                             │    │
│  │    status: "present" | "absent" | "late" | "excused",    │    │
│  │    marked_by: ObjectId (ref: User),                       │    │
│  │    timestamps: { createdAt, updatedAt }                    │    │
│  │  }                                                          │    │
│  │                                                             │    │
│  │  Unique Index: { course_id, student_id, date }            │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  Related Collections:                                                │
│  • Users (students, faculty, admin, nodal_officer)                  │
│  • Courses (linked to programs)                                     │
│  • Enrollments (student-course relationships)                       │
│  • FacultyAssignments (faculty-course relationships)                │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        DATA FLOW EXAMPLES                            │
└─────────────────────────────────────────────────────────────────────┘

1. BULK MARK ATTENDANCE FLOW
   ────────────────────────────
   Faculty → BulkMarkAttendanceForm → POST /api/auth/attendance/bulk
   → Middleware: Verify JWT + Check role
   → Controller: bulkMarkAttendance()
   → Validate course ownership
   → Check faculty assignment
   → For each student:
      - Validate student
      - Check enrollment
      - Upsert attendance record
   → Return results array
   → Frontend: Show success/error messages

2. VIEW ATTENDANCE FLOW
   ────────────────────
   Student → AttendanceViewer → GET /api/auth/attendance
   → Middleware: Verify JWT
   → Controller: getAttendance()
   → Apply student_id filter (auto for students)
   → Query MongoDB with filters
   → Populate course, student, marked_by fields
   → Return filtered records
   → Frontend: Display in color-coded table

3. INDIVIDUAL MARK FLOW
   ──────────────────────
   Faculty → MarkAttendanceForm → POST /api/auth/attendance
   → Middleware: Verify JWT + Check role
   → Controller: markAttendance()
   → Validate course & student
   → Check enrollment
   → Upsert single attendance record
   → Return created/updated record
   → Frontend: Show success message

┌─────────────────────────────────────────────────────────────────────┐
│                     SECURITY & VALIDATION                            │
└─────────────────────────────────────────────────────────────────────┘

✓ JWT Authentication on all routes
✓ Role-based authorization (faculty/admin/nodal_officer/student)
✓ Node ownership verification (users can only access their node's data)
✓ Enrollment verification (student must be enrolled in course)
✓ Faculty assignment check (faculty can only mark for assigned courses)
✓ Student isolation (students only see their own data)
✓ Unique constraint prevents duplicate records
✓ Input validation for all fields
✓ Mongoose schema validation

┌─────────────────────────────────────────────────────────────────────┐
│                        TECHNOLOGY STACK                              │
└─────────────────────────────────────────────────────────────────────┘

Frontend:
• React 18 - UI library
• Vite - Build tool
• Tailwind CSS - Styling (via CDN)

Backend:
• Node.js - Runtime
• Express 5 - Web framework
• Mongoose - MongoDB ODM
• JWT - Authentication
• bcryptjs - Password hashing

Database:
• MongoDB - Document database

Dev Tools:
• nodemon - Auto-restart
• Git - Version control
