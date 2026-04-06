# 🚀 Employee Attendance Management System

A full-stack **Employee Attendance Management System** built using **Node.js, Express, and MySQL**.
This project helps manage employees and track their **daily and monthly attendance** with real-time updates.

---

## 📌 Features

### 👨‍💼 Employee Management

* Add, edit, and delete employees
* Store employee details (Name, Phone, Salary)

### 📅 Attendance System

* Mark attendance (Present / Absent)
* Default status: **Select**
* Data persists after page refresh

### 🔍 Date-wise Attendance

* Select any date
* View attendance for that specific day

### 📊 Monthly Attendance

* View full month attendance
* Track:

  * Total Present Days
  * Total Absent Days

### ⚡ Real-time Updates

* Attendance saves instantly
* Changing to "Select" removes record

---

## 🛠️ Tech Stack

* Frontend: HTML, CSS, JavaScript
* Backend: Node.js, Express.js
* Database: MySQL

---

## 📁 Project Structure

```
Project Folder/
│
├── backend/
│   └── server.js
│
├── public/
│   ├── attendance.html
│   ├── dashboard.html
│   ├── employee_erp.html
│   ├── login.html
│   ├── index.html
│   ├── css/
│   ├── js/
│   ├── image/
│
├── database/
│   └── employee_db.sql
│
├── package.json
├── package-lock.json
├── README.md
├── .gitignore
```

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Install dependencies

```
npm install
```

### 3. Create `.env` file

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=sdt
PORT=5000
```

---

### 4. Setup Database

Run this in MySQL:

```
CREATE DATABASE sdt;
```

Then import:

```
database/employee_db.sql
```

---

### 5. Run the project

```
node backend/server.js
```

Open:

```
http://localhost:5000
```

---

## 🧪 API Testing

You can test APIs using:

* Postman
* Thunder Client

---

## 🎯 Project Goal

This project demonstrates a **real-world full-stack system** with:

* CRUD operations
* Data persistence
* Dynamic filtering (date & month)

---

## 🚀 Future Improvements

* Login authentication 🔐
* Role-based access
* Export attendance (PDF/Excel)
* Dashboard analytics

---

## 🙌 Author

**Utang Patel**
Aspiring Full Stack Developer 💻

---

## ⭐ Support

If you like this project:

* Star ⭐ the repository
* Share it
* Connect on LinkedIn
