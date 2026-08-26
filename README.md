# EduManage — Student Management System
### CodSoft Full-Stack Web Development Internship — Task 1

A full-stack platform for managing students, teachers, attendance, fees, and
exam records, with **real login-protected**, role-based dashboards for
Administrators, Teachers, and Students.

## Tech Stack
- **Frontend:** Next.js (React) + Tailwind CSS
- **Backend:** Next.js API Routes (Node.js)
- **Database:** SQLite via `better-sqlite3` (file-based, zero setup)
- **Auth:** bcrypt password hashing + secure HTTP-only session cookies

## Run it locally

1. Unzip the project and open a terminal in the `edumanage` folder.
2. Install dependencies:
   ```
   npm install
   ```
3. Seed the database with sample data + demo login accounts:
   ```
   npm run seed
   ```
4. Start the dev server:
   ```
   npm run dev
   ```
5. Open **http://localhost:3000** → click "Sign in".

## Demo login credentials (created by `npm run seed`)

| Role       | Email                   | Password    |
|------------|--------------------------|-------------|
| Admin      | admin@edumanage.in       | admin123    |
| Teacher    | meera@edumanage.in       | teacher123  |
| Student    | aarav@example.com        | student123  |

Each seeded teacher/student has its own login (all teachers use `teacher123`,
all students use `student123` — check `lib/seed.js` for the full list of
emails).

## How auth works
- Passwords are hashed with **bcrypt** (`lib/auth.js`) — never stored in plain text.
- On login, a random session token is generated, stored server-side in a
  `sessions` table, and set as an **HttpOnly cookie** (not readable by JS,
  protects against XSS token theft).
- Every dashboard page (`admin/*`, `teacher/dashboard`, `student/dashboard`)
  checks the session server-side in `getServerSideProps` before rendering —
  if you're not logged in, or logged in as the wrong role, you get redirected
  to `/login` before any data is sent to the browser.
- **Data is scoped by identity**: a student's dashboard only ever shows that
  student's own attendance/fees/exams (looked up via `studentId` linked to
  their account) — not a dropdown to browse anyone else's records. Same for
  teachers and their assigned class.
- Admins can create/delete login accounts for teachers and students from
  **Login Accounts** in the sidebar, linking each account to the right
  student/teacher record.

## What it does

- **Login page** — role-tabbed sign-in (Admin / Teacher / Student), styled
  with a dark gradient background.
- **Admin dashboard**
  - Overview: live counts, students-per-class chart, recent attendance.
  - Students: full CRUD.
  - Teachers: add/remove staff.
  - Attendance: mark Present/Absent per student per date.
  - Fees: assign fee terms, toggle Paid/Pending.
  - Exam Records: record marks, auto-computed letter grade.
  - **Login Accounts**: create/delete sign-in credentials for any role.
- **Teacher dashboard** — shows only the logged-in teacher's own assigned class.
- **Student dashboard** — shows only the logged-in student's own attendance %, fees, and exam performance.

## Project structure
```
edumanage/
├── components/DashboardShell.jsx   # shared sidebar layout + logout
├── lib/db.js                       # SQLite connection + schema (incl. users/sessions)
├── lib/auth.js                     # password hashing, sessions, cookies, route guards
├── lib/seed.js                     # sample data + demo account seeder
├── public/backgrounds/             # login/landing page background images
├── pages/
│   ├── index.js                    # landing page
│   ├── login.js                    # sign-in page
│   ├── admin/                      # admin pages (all auth-guarded)
│   ├── teacher/dashboard.js        # scoped to logged-in teacher
│   ├── student/dashboard.js        # scoped to logged-in student
│   └── api/                        # REST API (students, teachers, attendance, fees, exams, auth, users)
└── styles/globals.css
```

## Notes for your submission
- Every dashboard route is protected server-side (not just hidden with CSS) —
  visiting `/admin/dashboard` without logging in as an admin redirects you to
  `/login` before the page even renders.
- SQLite is used in place of PostgreSQL to keep setup to zero external
  services — swapping to Postgres later only needs changes in `lib/db.js`.
- Push this to GitHub and deploy to Vercel for a live submission link (for
  serverless deployment with `better-sqlite3`, you'd want a persistent volume
  or a hosted Postgres — happy to help wire that up if needed).
