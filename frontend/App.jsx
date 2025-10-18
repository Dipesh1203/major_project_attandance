import React, { useState, useEffect, createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client';

const API_BASE_URL = 'http://localhost:3000/api/auth';

const AuthContext = createContext(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const hasRole = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  const login = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

const apiCall = async (endpoint, method = 'GET', body = null, token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }

  return data;
};

const LoginForm = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiCall('/login', 'POST', { email, password });
      login(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-800">Education Management</h1>
          <p className="text-slate-600 mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-slate-800">EMS Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-800">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Card = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${className}`}>
    {title && <h2 className="text-lg font-semibold text-slate-800 mb-4">{title}</h2>}
    {children}
  </div>
);

const Alert = ({ type = 'info', message, onClose }) => {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div className={`border px-4 py-3 rounded-lg flex justify-between items-center ${styles[type]}`}>
      <span className="text-sm">{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4 font-bold hover:opacity-70">
          ×
        </button>
      )}
    </div>
  );
};

const CreateUserForm = () => {
  const { token, user } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const roleOptions = user?.role === 'nodal_officer'
    ? ['admin', 'faculty', 'student']
    : ['faculty', 'student'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const data = await apiCall('/create-user', 'POST', formData, token);
      setMessage({ type: 'success', text: data.message || 'User created successfully' });
      setFormData({ name: '', email: '', password: '', role: 'student' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Create User">
      <form onSubmit={handleSubmit} className="space-y-4">
        {message && <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </form>
    </Card>
  );
};

const CreateProgramForm = () => {
  const { token } = useAuth();
  const [programName, setProgramName] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const data = await apiCall('/programs', 'POST', { program_name: programName }, token);
      setMessage({ type: 'success', text: data.message || 'Program created successfully' });
      setProgramName('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Create Program">
      <form onSubmit={handleSubmit} className="space-y-4">
        {message && <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Program Name</label>
          <input
            type="text"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="e.g., Computer Science Engineering"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Program'}
        </button>
      </form>
    </Card>
  );
};

const CreateCourseForm = () => {
  const { token } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [formData, setFormData] = useState({
    program_id: '',
    course_name: '',
    description: '',
    start_date: '',
    end_date: '',
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const data = await apiCall('/programs', 'GET', null, token);
        setPrograms(data.programs || []);
      } catch (err) {
        console.error('Failed to fetch programs:', err);
      }
    };
    fetchPrograms();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const data = await apiCall('/courses', 'POST', formData, token);
      setMessage({ type: 'success', text: data.message || 'Course created successfully' });
      setFormData({ program_id: '', course_name: '', description: '', start_date: '', end_date: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Create Course">
      <form onSubmit={handleSubmit} className="space-y-4">
        {message && <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Program</label>
          <select
            value={formData.program_id}
            onChange={(e) => setFormData({ ...formData, program_id: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          >
            <option value="">Select a program</option>
            {programs.map((prog) => (
              <option key={prog._id} value={prog._id}>
                {prog.program_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Course Name</label>
          <input
            type="text"
            value={formData.course_name}
            onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            rows="3"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Start Date</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">End Date</label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Course'}
        </button>
      </form>
    </Card>
  );
};

const EnrollStudentForm = () => {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ course_id: '', student_id: '' });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, usersData] = await Promise.all([
          apiCall('/courses', 'GET', null, token),
          apiCall('/users', 'GET', null, token),
        ]);
        setCourses(coursesData.courses || []);
        setUsers((usersData.users || []).filter((u) => u.role === 'student'));
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const data = await apiCall('/enroll', 'POST', formData, token);
      setMessage({ type: 'success', text: data.message || 'Student enrolled successfully' });
      setFormData({ course_id: '', student_id: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Enroll Student">
      <form onSubmit={handleSubmit} className="space-y-4">
        {message && <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Student</label>
          <select
            value={formData.student_id}
            onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          >
            <option value="">Select a student</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Course</label>
          <select
            value={formData.course_id}
            onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.course_name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Enrolling...' : 'Enroll Student'}
        </button>
      </form>
    </Card>
  );
};

const MarkAttendanceForm = () => {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    course_id: '',
    student_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
  });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, usersData] = await Promise.all([
          apiCall('/courses', 'GET', null, token),
          apiCall('/users', 'GET', null, token),
        ]);
        setCourses(coursesData.courses || []);
        setUsers((usersData.users || []).filter((u) => u.role === 'student'));
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const data = await apiCall('/attendance', 'POST', formData, token);
      setMessage({ type: 'success', text: data.message || 'Attendance marked successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Mark Attendance">
      <form onSubmit={handleSubmit} className="space-y-4">
        {message && <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Course</label>
          <select
            value={formData.course_id}
            onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.course_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Student</label>
          <select
            value={formData.student_id}
            onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          >
            <option value="">Select a student</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Marking...' : 'Mark Attendance'}
        </button>
      </form>
    </Card>
  );
};

const GenerateCertificateForm = () => {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ course_id: '', student_id: '', certificate_url: '' });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, usersData] = await Promise.all([
          apiCall('/courses', 'GET', null, token),
          apiCall('/users', 'GET', null, token),
        ]);
        setCourses(coursesData.courses || []);
        setUsers((usersData.users || []).filter((u) => u.role === 'student'));
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };
    fetchData();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const data = await apiCall('/certificates', 'POST', formData, token);
      setMessage({ type: 'success', text: data.message || 'Certificate generated successfully' });
      setFormData({ course_id: '', student_id: '', certificate_url: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Generate Certificate">
      <form onSubmit={handleSubmit} className="space-y-4">
        {message && <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Student</label>
          <select
            value={formData.student_id}
            onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          >
            <option value="">Select a student</option>
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Course</label>
          <select
            value={formData.course_id}
            onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            required
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course._id} value={course._id}>
                {course.course_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Certificate URL</label>
          <input
            type="url"
            value={formData.certificate_url}
            onChange={(e) => setFormData({ ...formData, certificate_url: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="https://example.com/certificate.pdf"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Generate Certificate'}
        </button>
      </form>
    </Card>
  );
};

const UsersList = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await apiCall('/users', 'GET', null, token);
        setUsers(data.users || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  if (loading) return <Card title="Users"><p className="text-slate-600">Loading...</p></Card>;
  if (error) return <Card title="Users"><p className="text-red-600">{error}</p></Card>;

  return (
    <Card title="Users">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Name</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="py-3 px-4 text-sm text-slate-800">{user.name}</td>
                <td className="py-3 px-4 text-sm text-slate-600">{user.email}</td>
                <td className="py-3 px-4 text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {user.role.replace('_', ' ')}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

const ProgramsList = () => {
  const { token } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const data = await apiCall('/programs', 'GET', null, token);
        setPrograms(data.programs || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, [token]);

  if (loading) return <Card title="Programs"><p className="text-slate-600">Loading...</p></Card>;
  if (error) return <Card title="Programs"><p className="text-red-600">{error}</p></Card>;

  return (
    <Card title="Programs">
      {programs.length === 0 ? (
        <p className="text-slate-600">No programs found</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((program) => (
            <div key={program._id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
              <h3 className="font-semibold text-slate-800">{program.program_name}</h3>
              <p className="text-sm text-slate-600 mt-2">
                Created: {new Date(program.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

const CoursesList = () => {
  const { token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await apiCall('/courses', 'GET', null, token);
        setCourses(data.courses || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [token]);

  if (loading) return <Card title="Courses"><p className="text-slate-600">Loading...</p></Card>;
  if (error) return <Card title="Courses"><p className="text-red-600">{error}</p></Card>;

  return (
    <Card title="Courses">
      {courses.length === 0 ? (
        <p className="text-slate-600">No courses found</p>
      ) : (
        <div className="space-y-4">
          {courses.map((course) => (
            <div key={course._id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
              <h3 className="font-semibold text-slate-800">{course.course_name}</h3>
              <p className="text-sm text-slate-600 mt-1">{course.description}</p>
              <div className="flex gap-4 mt-3 text-xs text-slate-500">
                <span>Start: {new Date(course.start_date).toLocaleDateString()}</span>
                <span>End: {new Date(course.end_date).toLocaleDateString()}</span>
                <span className="capitalize">Status: {course.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

const ProfileView = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiCall('/profile', 'GET', null, token);
        setProfile(data.user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  if (loading) return <Card title="Profile"><p className="text-slate-600">Loading...</p></Card>;
  if (error) return <Card title="Profile"><p className="text-red-600">{error}</p></Card>;

  return (
    <Card title="My Profile">
      <div className="space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600">
              {profile?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-800">{profile?.name}</h3>
            <p className="text-sm text-slate-600 capitalize">{profile?.role?.replace('_', ' ')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-slate-700">Email</p>
            <p className="text-slate-600">{profile?.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Node</p>
            <p className="text-slate-600">{profile?.node?.node_name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Member Since</p>
            <p className="text-slate-600">{new Date(profile?.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

const ProgressView = () => {
  const { token, user } = useAuth();
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const data = await apiCall('/progress', 'GET', null, token);
        setProgress(Array.isArray(data.progress) ? data.progress : [data.progress]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProgress();
  }, [token]);

  if (loading) return <Card title="My Progress"><p className="text-slate-600">Loading...</p></Card>;
  if (error) return <Card title="My Progress"><p className="text-red-600">{error}</p></Card>;

  return (
    <Card title="My Progress">
      {progress.length === 0 ? (
        <p className="text-slate-600">No progress data available</p>
      ) : (
        <div className="space-y-4">
          {progress.map((item, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-700">Attendance</p>
                  <p className="text-2xl font-bold text-blue-600">{item.attendance_pct?.toFixed(1) || 0}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Credits Earned</p>
                  <p className="text-2xl font-bold text-green-600">{item.credits_earned || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'Manage Users' },
    { id: 'programs', label: 'Manage Programs' },
    { id: 'courses', label: 'Manage Courses' },
    { id: 'enroll', label: 'Enrollment' },
    { id: 'certificates', label: 'Certificates' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Administration Dashboard</h1>
          <p className="text-slate-600">Manage users, programs, and courses</p>
        </div>

        <div className="mb-6 border-b border-slate-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileView />
              <ProgramsList />
              <div className="md:col-span-2">
                <CoursesList />
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CreateUserForm />
              <UsersList />
            </div>
          )}

          {activeTab === 'programs' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CreateProgramForm />
              <ProgramsList />
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="grid grid-cols-1 gap-6">
              <CreateCourseForm />
              <CoursesList />
            </div>
          )}

          {activeTab === 'enroll' && <EnrollStudentForm />}

          {activeTab === 'certificates' && <GenerateCertificateForm />}
        </div>
      </div>
    </div>
  );
};

const FacultyDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'attendance', label: 'Mark Attendance' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Faculty Dashboard</h1>
          <p className="text-slate-600">Manage student attendance</p>
        </div>

        <div className="mb-6 border-b border-slate-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileView />
              <ProgramsList />
              <div className="md:col-span-2">
                <CoursesList />
              </div>
            </div>
          )}

          {activeTab === 'attendance' && <MarkAttendanceForm />}
        </div>
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'programs', label: 'Programs' },
    { id: 'courses', label: 'Courses' },
    { id: 'progress', label: 'My Progress' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Student Dashboard</h1>
          <p className="text-slate-600">View your programs, courses, and progress</p>
        </div>

        <div className="mb-6 border-b border-slate-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ProfileView />
              <ProgressView />
            </div>
          )}

          {activeTab === 'programs' && <ProgramsList />}
          {activeTab === 'courses' && <CoursesList />}
          {activeTab === 'progress' && <ProgressView />}
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();

  if (hasRole(user?.role, ['nodal_officer', 'admin'])) {
    return <AdminDashboard />;
  } else if (hasRole(user?.role, ['faculty'])) {
    return <FacultyDashboard />;
  } else if (hasRole(user?.role, ['student'])) {
    return <StudentDashboard />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card>
          <p className="text-slate-600">Unknown role. Please contact administrator.</p>
        </Card>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
};

const Main = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Dashboard /> : <LoginForm />;
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
