import React, { useCallback, useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";



// Mock data for local development
const MOCK_JOBS = [
  {
    id: 1,
    title: "Frontend Developer",
    company: "Tech Solutions Inc.",
    location: "Remote",
    description: "We are looking for a skilled frontend developer with React experience to join our team.",
    salary: "$80,000 - $110,000",
    requirements: ["3+ years React experience", "TypeScript knowledge", "CSS/SCSS proficiency"],
    employer_id: 1
  },
  {
    id: 2,
    title: "Backend Engineer",
    company: "Data Systems",
    location: "New York, NY",
    description: "Seeking a backend engineer to help build scalable API services.",
    salary: "$90,000 - $120,000",
    requirements: ["Node.js", "SQL databases", "API design", "Cloud services"],
    employer_id: 2
  },
  {
    id: 3,
    title: "UX Designer",
    company: "Creative Labs",
    location: "San Francisco, CA",
    description: "Join our design team to create beautiful and functional user experiences.",
    salary: "$85,000 - $105,000",
    requirements: ["Portfolio showing UX work", "Figma proficiency", "3+ years experience"],
    employer_id: 1
  }
];

// Mock user for demo purposes
const MOCK_USERS = [
  {
    id: 1,
    name: "Jane Employer",
    email: "employer@example.com",
    password: "password123",
    role: "employer"
  },
  {
    id: 2,
    name: "John Applicant",
    email: "applicant@example.com",
    password: "password123",
    role: "applicant",
    appliedJobs: []
  }
];

// Local storage helper functions
const saveToLocalStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const getFromLocalStorage = (key, defaultValue = null) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

// Authentication Components
function LoginForm({ onLogin, switchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Find user in mock data (in a real app, this would be an API call)
    const user = MOCK_USERS.find(u => u.email === email);
    
    if (user && user.password === password) {
      // Generate a fake token
      const token = btoa(JSON.stringify({
        id: user.id,
        email: user.email,
        role: user.role,
        exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
      }));
      
      // Return user without password
      const { password: _, ...safeUser } = user;
      
      onLogin({
        ...safeUser,
        appliedJobs: user.role === "applicant" ? getFromLocalStorage(`${user.id}_appliedJobs`, []) : undefined
      }, token);
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="auth-form">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <p>
        Don't have an account?{" "}
        <button onClick={switchToRegister}>Register</button>
      </p>
      <div className="demo-credentials">
        <p><strong>Demo Credentials:</strong></p>
        <p>Employer: employer@example.com / password123</p>
        <p>Applicant: applicant@example.com / password123</p>
      </div>
    </div>
  );
}

function RegisterForm({ onRegister, switchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("applicant");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if email already exists
    if (MOCK_USERS.some(u => u.email === email)) {
      setError("Email already registered");
      return;
    }
    
    // Create a new user (in a real app, this would be an API call)
    const newUser = {
      id: MOCK_USERS.length + 1,
      name,
      email,
      password,
      role,
      appliedJobs: role === "applicant" ? [] : undefined
    };
    
    MOCK_USERS.push(newUser);
    
    // Generate a fake token
    const token = btoa(JSON.stringify({
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    }));
    
    // Return user without password
    const { password: _, ...safeUser } = newUser;
    onRegister(safeUser, token);
  };

  return (
    <div className="auth-form">
      <h2>Register</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="applicant">Job Seeker</option>
          <option value="employer">Employer</option>
        </select>
        <button type="submit">Register</button>
      </form>
      <p>
        Already have an account?{" "}
        <button onClick={switchToLogin}>Login</button>
      </p>
    </div>
  );
}

// Job Posting Component for Employers
function JobPostingForm({ user, onJobPosted }) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState(user?.name || "");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [salary, setSalary] = useState("");
  const [requirements, setRequirements] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create new job (in a real app, this would be an API call)
    const newJob = {
      id: Date.now(), // Simple way to get a unique ID
      title,
      company,
      location,
      description,
      salary,
      requirements: requirements.split(",").map(r => r.trim()),
      employer_id: user?.id
    };
    
    // Add to local jobs storage
    const jobs = getFromLocalStorage("jobs", MOCK_JOBS);
    saveToLocalStorage("jobs", [...jobs, newJob]);
    
    onJobPosted(newJob);
    
    // Reset form
    setTitle("");
    setLocation("");
    setDescription("");
    setSalary("");
    setRequirements("");
  };

  return (
    <div className="job-posting-form">
      <h2>Post a New Job</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Job Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <textarea
          placeholder="Job Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Salary"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Requirements (comma-separated)"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          required
        />
        <button type="submit">Post Job</button>
      </form>
    </div>
  );
}

// Search component
function JobSearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  return (
    <div className="job-search-bar">
      <input
        type="text"
        placeholder="Search jobs by title, company, or location"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button onClick={handleSearch}>🔍 Search</button>
    </div>
  );
}

// Job listing card
function JobCard({ job, user, onApply }) {
  const hasApplied = user?.appliedJobs?.includes(job.id);

  return (
    <div className="job-card">
      <h3>{job.title}</h3>
      <p>{job.company} - {job.location}</p>
      <p>💰 {job.salary}</p>
      {user?.role === "applicant" && (
        <button
          onClick={onApply}
          disabled={hasApplied}
          className={hasApplied ? "applied-btn" : ""}
        >
          {hasApplied ? "Applied" : "Apply Now"}
        </button>
      )}
    </div>
  );
}

// Job detail modal
function JobDetailModal({ job, user, onClose, onApply }) {
  if (!job) return null;

  const hasApplied = user?.appliedJobs?.includes(job.id);

  return (
    <div className="job-detail-modal">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>{job.title}</h2>
        <h3>{job.company}</h3>
        <p>📍 {job.location}</p>
        <p>💰 {job.salary}</p>
        <h4>Job Description</h4>
        <p>{job.description}</p>
        <h4>Requirements</h4>
        <ul>
          {job.requirements.map((req, index) => <li key={index}>{req}</li>)}
        </ul>
        {user?.role === "applicant" && (
          <button
            onClick={() => onApply(job.id)}
            disabled={hasApplied}
            className={hasApplied ? "applied-btn" : ""}
          >
            {hasApplied ? "Already Applied" : "Apply Now"}
          </button>
        )}
      </div>
    </div>
  );
}

// Main Application Component
function App() {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authMode, setAuthMode] = useState("login");

  // Initialize app data
  useEffect(() => {
    // Initialize jobs data
    if (!localStorage.getItem("jobs")) {
      saveToLocalStorage("jobs", MOCK_JOBS);
    }
    
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token));
        
        // Check if token is expired
        if (payload.exp < Date.now()) {
          localStorage.removeItem("token");
          setAuthMode("login");
        } else {
          // Find user
          const user = MOCK_USERS.find(u => u.id === payload.id);
          if (user) {
            const { password: _, ...safeUser } = user;
            setUser({
              ...safeUser,
              appliedJobs: user.role === "applicant" ? 
                getFromLocalStorage(`${user.id}_appliedJobs`, []) : undefined
            });
            setAuthMode(null);
          }
        }
      } catch (err) {
        localStorage.removeItem("token");
        setAuthMode("login");
      }
    }
    
    // Load jobs
    fetchJobs();
  }, []);

  // Fetch jobs from local storage
  const fetchJobs = () => {
    try {
      const savedJobs = getFromLocalStorage("jobs", MOCK_JOBS);
      setJobs(savedJobs);
      setFilteredJobs(savedJobs);
      setIsLoading(false);
    } catch (err) {
      setError("Failed to fetch jobs");
      setIsLoading(false);
    }
  };

  // Handle login
  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem("token", token);
    setAuthMode(null);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setAuthMode("login");
  };

  // Handle job search
  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredJobs(jobs);
      return;
    }
    
    const filtered = jobs.filter(job =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredJobs(filtered);
  };

  // Handle job application
  const handleApplyJob = (jobId) => {
    if (!user) {
      setAuthMode("login");
      return;
    }
    
    // Update the user's applied jobs list
    const updatedAppliedJobs = [...(user.appliedJobs || []), jobId];
    
    // Save to local storage
    saveToLocalStorage(`${user.id}_appliedJobs`, updatedAppliedJobs);
    
    // Update state
    setUser(prev => ({
      ...prev,
      appliedJobs: updatedAppliedJobs
    }));
    
    alert("Job application submitted successfully!");
  };

  // Handle new job posting
  const handleJobPosted = (newJob) => {
    setJobs(prev => [...prev, newJob]);
    setFilteredJobs(prev => [...prev, newJob]);
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  if (authMode === "login") {
    return (
      <LoginForm
        onLogin={handleLogin}
        switchToRegister={() => setAuthMode("register")}
      />
    );
  }

  if (authMode === "register") {
    return (
      <RegisterForm
        onRegister={handleLogin}
        switchToLogin={() => setAuthMode("login")}
      />
    );
  }

  return (
    <div className="job-portal">
      <header>
        <h1>🌟 Job Portal</h1>
        {user && (
          <div className="user-info">
            Welcome, {user.name} ({user.role})
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </header>

      {user?.role === "employer" && (
        <JobPostingForm
          user={user}
          onJobPosted={handleJobPosted}
        />
      )}

      <div className="job-search-container">
        <JobSearchBar onSearch={handleSearch} />

        {error && <div className="error">{error}</div>}

        <div className="job-listings">
          {filteredJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              user={user}
              onApply={() => setSelectedJob(job)}
            />
          ))}
        </div>
      </div>

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          user={user}
          onClose={() => setSelectedJob(null)}
          onApply={handleApplyJob}
        />
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);