# TechCore IT Ticketing System
ITEC-4750 Senior Capstone | Group 2

## Team
- William Mauldin (Documentation/QA)
- Macy Mayoralgo (Project Manager)
- Ronald Robertson (Backend Developer)
- Timarco Ross (Frontend Developer)
- Erin Smith (Database Administrator)

## Tech Stack
- **Backend:** Node.js + Express.js
- **Database:** MySQL
- **Frontend:** HTML, CSS, JavaScript (no framework)

---

## Setup Instructions

### 1. Prerequisites
Make sure you have installed:
- Node.js (v18+)
- MySQL (v8+)
- VS Code

### 2. Database Setup
Open MySQL Workbench (or mysql CLI) and run:
```
database/schema.sql
```
This creates the `techcore_ticketing` database and tables.

### 3. Backend Setup
```bash
cd backend
npm install
```

Copy the env template and fill in your MySQL password:
```bash
cp .env.example .env
```
Edit `.env`:
```
DB_PASSWORD=your_mysql_root_password
SESSION_SECRET=any-random-string-you-want
```

### 4. Start the Server
```bash
cd backend
npm run dev       # development (auto-restarts on changes)
# or
npm start         # production
```

> **Reset demo data:** If you need to wipe and re-seed from scratch, run `node seed.js` from the `backend/` folder.

### 6. Open the App
Go to: **http://localhost:3000**

---

## Test Credentials
All passwords are: `Password1!`

| Username   | Role     |
|------------|----------|
| john.doe   | User     |
| jane.smith | User     |
| it.staff   | IT Staff |
| admin      | Admin    |

---

## What Each Role Can Do

**User**
- Log in
- Submit a ticket
- View their own tickets and status updates

**IT Staff**
- View all tickets
- Update ticket status (Open / In Progress / Resolved / Closed)
- Assign tickets

**Admin**
- Everything IT Staff can do
- Manage user assignments

---

## Project Structure
```
techcore-ticketing/
├── backend/
│   ├── config/db.js          MySQL connection
│   ├── middleware/auth.js     Login + role checks
│   ├── routes/auth.js        Login, logout, session
│   ├── routes/tickets.js     Ticket CRUD + status + assign
│   ├── server.js             Main entry point
│   ├── seed.js               Populates test data
│   ├── .env.example          Environment variable template
│   └── package.json
├── frontend/
│   ├── login.html
│   ├── dashboard.html
│   ├── submit-ticket.html
│   └── css/style.css
├── database/
│   └── schema.sql            Database + table creation
└── .gitignore
```
