# OralVis Healthcare - Dental Scan Management System

A full-stack web application for managing dental scans with role-based access control for technicians and dentists.

## Project Overview

OralVis Healthcare is a comprehensive dental scan management system that allows technicians to upload patient scans and dentists to view and analyze all scans in the system. The application features user authentication, role-based dashboards, scan upload functionality, and detailed analytics.

## Technology Stack

### Frontend
- **React 18** - User interface library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API requests
- **CSS3** - Custom styling
- **HTML5** - Markup

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **SQLite3** - Database
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## Features

### Technician Portal
- Upload patient scans with metadata
- View and manage uploaded scans
- Edit scan details
- Delete scans
- Personal statistics dashboard

### Dentist Portal
- View all scans in the system
- Advanced search and filtering
- Detailed scan viewer
- Comprehensive analytics dashboard
- Patient management (coming soon)

### Authentication
- Secure JWT-based authentication
- Role-based access control
- Protected routes
- Session management

## Screenshots

### Login Page
![Login Interface with role selection and demo credentials](https://res.cloudinary.com/dw7dhefpb/image/upload/v1756827143/Screenshot_2025-09-02_204006_a14uon.png)

### Technician Upload Page
![Scan upload form with image preview and validation](https://res.cloudinary.com/dw7dhefpb/image/upload/v1756827143/Screenshot_2025-09-02_204018_sesto8.png)

### Dentist Viewer Dashboard
![Grid view of all scans with search and filter options](https://res.cloudinary.com/dw7dhefpb/image/upload/v1756827144/Screenshot_2025-09-02_204035_twzbhc.png)

## Live Demo

🌐 **[View Live Demo](https://your-demo-link.com)**

**Demo Credentials:**
- **Technician:** technician@oralvis.com / tech123
- **Dentist:** dentist@oralvis.com / dentist123

## Local Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm package manager
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/seshu362/OralVis-Healthcare-Assignment.git
cd oralvis-healthcare
```

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start the backend server
node server.js
```

The backend server will run on `http://localhost:5000`

### 3. Frontend Setup
```bash
# Open new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the frontend development server
npm start
```

The frontend will run on `http://localhost:3000`

## Default Login Credentials

The system comes pre-configured with demo accounts:

### Technician Account
- **Email:** technician@oralvis.com
- **Password:** tech123
- **Permissions:** Upload scans, manage own uploads

### Dentist Account
- **Email:** dentist@oralvis.com  
- **Password:** dentist123
- **Permissions:** View all scans, analytics dashboard

### Additional Test Accounts
- **Technician 2:** tech1@oralvis.com / tech123
- **Dr. Smith:** dr.smith@oralvis.com / dentist123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user

### Scans Management
- `GET /api/scans` - Get all scans (Dentist only)
- `GET /api/scans/:id` - Get specific scan details (Dentist only)
- `POST /api/scans` - Upload new scan (Technician only)
- `PUT /api/scans/:id` - Update scan (Technician only, own scans)
- `DELETE /api/scans/:id` - Delete scan (Technician only, own scans)
- `GET /api/technician/scans` - Get technician's own scans

### Analytics & Data
- `GET /api/stats` - Dashboard statistics
- `GET /api/regions` - Available scan regions
- `GET /api/patients` - Patient list
- `GET /api/profile` - User profile
- `GET /api/health` - Health check

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Technician', 'Dentist')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Scans Table
```sql
CREATE TABLE scans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_name TEXT NOT NULL,
    patient_id TEXT NOT NULL,
    scan_type TEXT NOT NULL DEFAULT 'RGB',
    region TEXT NOT NULL CHECK (region IN ('Frontal', 'Upper Arch', 'Lower Arch')),
    image_url TEXT NOT NULL,
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    uploaded_by INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users (id)
);
```

## Project Structure

```
oralvis-healthcare/
│
├── backend/
│   ├── server.js              # Main server file
│   ├── oralvis_healthcare.db  # SQLite database
│   ├── package.json           # Backend dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login/         # Login component
│   │   │   ├── Register/      # Registration component
│   │   │   ├── Header/        # Header component
│   │   │   ├── TechnicianDashboard/  # Technician interface
│   │   │   ├── DentistDashboard/     # Dentist interface
│   │   │   ├── UploadScan/    # Scan upload form
│   │   │   ├── ScanViewer/    # Scan detail viewer
│   │   │   └── ProtectedRoute/ # Route protection
│   │   ├── App.js             # Main app component
│   │   ├── App.css            # Global styles
│   │   └── index.js           # Entry point
│   ├── public/
│   ├── package.json           # Frontend dependencies
│   └── .env.example           # Frontend environment template
│
├── README.md                  # This file
└── .gitignore                # Git ignore rules
```

## Key Features Implemented

✅ **Authentication System**
- JWT-based secure authentication
- Role-based access control
- Protected routes

✅ **Technician Features**
- Scan upload with metadata
- Image preview functionality
- Edit and delete own scans
- Personal statistics

✅ **Dentist Features**
- View all scans in system
- Advanced search and filtering
- Detailed scan viewer modal
- Comprehensive analytics

✅ **Data Management**
- SQLite database integration
- Pagination support
- Search functionality
- Region-based filtering

✅ **User Interface**
- Responsive design
- Clean, professional styling
- Error handling and loading states
- Form validation

## Development Commands

### Backend
```bash
cd backend
npm run dev     # Start with nodemon (if configured)
node server.js  # Start production server
npm test        # Run tests (if configured)
```

### Frontend
```bash
cd frontend
npm start       # Start development server
npm run build   # Build for production
npm test        # Run tests
```

## Security Notes

- JWT tokens expire after 24 hours
- Passwords are hashed using bcrypt
- Role-based route protection
- CORS configuration for security
- Input validation on all endpoints

