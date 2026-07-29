# 👨‍💼 Employee Management System

A modern **Full-Stack Employee Management System** built using **React.js, Flask, Python, and MongoDB Atlas**.

The application provides separate **Admin** and **Employee** portals for managing employee records, authentication, profiles, and daily attendance.

Employees can securely create their **own password** using their Employee ID and registered email.

---

## 🚀 Features

### 👨‍💼 Admin Portal

- 🔐 Secure Admin Login
- 📊 Modern Admin Dashboard
- ➕ Add New Employees
- 👁️ View Employee Records
- ✏️ Update Employee Details
- 🗑️ Delete Employees
- 🔍 Search Employees
- 🟢 Active / Inactive Employee Status
- 📅 View Employee Attendance
- 🔎 Search Attendance Records
- 📆 Filter Attendance by Date

### 👨‍💻 Employee Portal

- 🔐 Secure Employee Login
- 🔑 First-Time Password Creation
- 👤 Employee Profile
- 📊 Personal Dashboard
- ✏️ Update Email & Phone
- 🟢 Daily Check-In
- 🔴 Daily Check-Out
- ⏰ Login Time Tracking
- ⏰ Logout Time Tracking
- ⌛ Automatic Working Hours Calculation
- 📅 Attendance History

---

## 🔑 Employee Password System

The Admin does **not** create or see employee passwords.

The authentication flow works like this:

Admin creates employee

↓  

Employee receives Employee ID

↓

Employee opens the Login page

↓

Clicks **Create Password**

↓

Enters Employee ID + Registered Email

↓

Creates their own password

↓

Password is securely hashed

↓

Employee can login

This provides better password privacy and security.

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- JavaScript
- CSS3
- Axios
- Lucide React

### Backend

- Python
- Flask
- Flask-CORS
- REST API
- JWT Authentication
- Werkzeug Password Hashing
- Gunicorn

### Database

- MongoDB
- MongoDB Atlas
- PyMongo

### Development Tools

- Git
- GitHub
- VS Code
- Postman
- MongoDB Compass

---

## 📁 Project Structure

```text
employee-management-system/
│
├── backend/
│   ├── app.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx
│   │   │   ├── CreatePassword.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── EmployeeDashboard.jsx
│   │   │   └── Sidebar.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── main.jsx
│   │   └── style.css
│   │
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
