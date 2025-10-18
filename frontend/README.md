# Education Management System - Frontend

A modern, responsive React frontend for the Education Management System with Role-Based Access Control (RBAC).

## Features

- **Authentication**: Secure login with JWT tokens
- **Role-Based Access Control**: Different dashboards for:
  - Nodal Officers & Admins (full access)
  - Faculty (attendance management)
  - Students (view-only access to programs, courses, and progress)
- **Fully Responsive**: Works on mobile, tablet, and desktop
- **Modern UI**: Built with Tailwind CSS for a clean, professional look

## Tech Stack

- React 18 (Hooks & Context API)
- Vite (Build tool)
- Tailwind CSS (Styling)
- Native Fetch API (HTTP requests)

## Getting Started

### Prerequisites

- Node.js 16+ installed
- Backend API running on `http://localhost:3000`

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## API Integration

The frontend connects to the backend API at `http://localhost:3000/api/auth` and includes the following endpoints:

- `POST /login` - User authentication
- `GET /profile` - Get current user profile
- `POST /create-user` - Create new users (admin/nodal_officer only)
- `GET /users` - Get all users (admin/nodal_officer only)
- `POST /programs` - Create programs (admin/nodal_officer only)
- `GET /programs` - Get all programs
- `POST /courses` - Create courses (admin/nodal_officer only)
- `GET /courses` - Get all courses
- `POST /enroll` - Enroll students (admin/nodal_officer only)
- `POST /attendance` - Mark attendance (admin/nodal_officer/faculty)
- `GET /progress` - Get student progress
- `POST /certificates` - Generate certificates (admin/nodal_officer only)

## User Roles & Permissions

### Nodal Officer
- Create admins, faculty, and students
- Manage programs and courses
- Enroll students
- Mark attendance
- Generate certificates

### Admin
- Create faculty and students
- Manage programs and courses
- Enroll students
- Mark attendance
- Generate certificates

### Faculty
- View programs and courses
- Mark attendance for assigned courses

### Student
- View programs and courses
- View personal progress and attendance

## Default Test Credentials

Use the seeded data from the backend to test different roles. Run the seed script on the backend:

```bash
npm run seed
```

## Project Structure

```
frontend/
├── App.jsx           # Main application (all code in single file)
├── index.html        # HTML entry point
├── package.json      # Dependencies
├── vite.config.js    # Vite configuration
└── README.md         # This file
```

## Features by Role

### Admin/Nodal Officer Dashboard
- Overview (Profile, Programs, Courses)
- User Management (Create & List Users)
- Program Management (Create & List Programs)
- Course Management (Create & List Courses)
- Student Enrollment
- Certificate Generation

### Faculty Dashboard
- Overview (Profile, Programs, Courses)
- Attendance Management

### Student Dashboard
- Overview (Profile & Progress)
- View Programs
- View Courses
- View Progress (Attendance % & Credits)

## Notes

- All protected routes require the `Authorization: Bearer <token>` header
- Token and user data are stored in localStorage for persistence
- Forms include comprehensive error handling and success messages
- UI is fully responsive with mobile-first design
