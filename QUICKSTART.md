# Quick Start Guide - Attendance Feature

## Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
# Backend
npm install

# Frontend (in another terminal)
cd frontend
npm install
```

### Step 2: Start MongoDB
```bash
# Make sure MongoDB is running on localhost:27017
# Or use a cloud MongoDB URI in .env file
```

### Step 3: Setup Environment
```bash
# Create .env file (already ignored by git)
cat > .env << EOF
MONGODB_URI=mongodb://localhost:27017/education_management
JWT_SECRET=your_secret_key_change_in_production
PORT=3000
EOF
```

### Step 4: Seed Test Data
```bash
npm run seed
```

This creates test users:
- **Faculty**: sunita.verma@example.com / password123
- **Admin**: admin.delhi@example.com / password123
- **Student**: amit.kumar@example.com / password123

### Step 5: Start Backend Server
```bash
npm start
# Server runs on http://localhost:3000
```

### Step 6: Start Frontend (separate terminal)
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

### Step 7: Test the Feature

#### As Faculty:
1. Go to http://localhost:5173
2. Login: sunita.verma@example.com / password123
3. Click **Attendance** tab
4. Use **Bulk Mark Attendance**:
   - Select "Introduction to Programming" course
   - Keep today's date
   - Mark attendance for students (defaults to Present)
   - Click "Mark Attendance for X Students"
5. View records in the table below

#### As Student:
1. Logout (top right)
2. Login: amit.kumar@example.com / password123
3. Click **My Attendance** tab
4. View your attendance records

## API Testing (Optional)

### Get a Token
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sunita.verma@example.com","password":"password123"}'
```

Copy the token from response.

### Mark Bulk Attendance
```bash
# First get course and student IDs from seed output
curl -X POST http://localhost:3000/api/auth/attendance/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "course_id": "COURSE_ID_FROM_SEED",
    "date": "2024-01-25",
    "students": [
      {"student_id": "STUDENT_ID_1", "status": "present"},
      {"student_id": "STUDENT_ID_2", "status": "absent"}
    ]
  }'
```

### View Attendance
```bash
curl -X GET "http://localhost:3000/api/auth/attendance" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running: `mongod --version`
- Check MONGODB_URI in .env file
- Try: `mongodb://127.0.0.1:27017/education_management`

### Frontend Build Error
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Try `npm run build` to check for errors

### JWT Error / Unauthorized
- Check if JWT_SECRET is set in .env
- Make sure you're sending the token: `Authorization: Bearer YOUR_TOKEN`
- Token expires in 24 hours, login again

### No Data Shows Up
- Run `npm run seed` to populate database
- Check if MongoDB is running
- Verify you're logged in with correct user

## Next Steps

1. **Explore the UI**: Try all three user roles (Faculty, Admin, Student)
2. **Test Bulk Marking**: Mark attendance for multiple students
3. **Use Filters**: Filter attendance by course or date
4. **Read Docs**: 
   - See `ATTENDANCE_TESTING.md` for detailed API testing
   - See `UI_OVERVIEW.md` for UI documentation
   - See `ARCHITECTURE.md` for technical details

## Production Deployment

Before deploying to production:

1. **Change JWT Secret**: Use a strong random secret
   ```bash
   openssl rand -base64 32
   ```

2. **Use Production MongoDB**: 
   - MongoDB Atlas (cloud)
   - Or secure MongoDB instance

3. **Environment Variables**: Set proper values
   - MONGODB_URI
   - JWT_SECRET
   - PORT

4. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   # Serve the dist/ folder
   ```

5. **Security Checklist**:
   - ✅ Strong JWT secret
   - ✅ Secure MongoDB connection
   - ✅ HTTPS enabled
   - ✅ CORS properly configured
   - ✅ Rate limiting added
   - ✅ Input sanitization enabled

## Support

- See documentation files in root directory
- Check error messages in browser console
- Review backend logs in terminal
- Refer to `readme.md` for API reference

## Features You Can Use Now

✅ Bulk mark attendance for entire class
✅ Individual attendance marking
✅ View attendance records with filters
✅ Color-coded status (Present/Absent/Late/Excused)
✅ Student can view own attendance
✅ Faculty can mark for assigned courses
✅ Admin has full access

Enjoy using the attendance feature! 🎉
