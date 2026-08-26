const db = require("./db");
const { hashPassword } = require("./auth");

db.exec(`
DELETE FROM sessions;
DELETE FROM users;
DELETE FROM exam_results;
DELETE FROM fees;
DELETE FROM attendance;
DELETE FROM students;
DELETE FROM teachers;
`);

const insertStudent = db.prepare(
  `INSERT INTO students (name, rollNo, className, section, email, phone, guardian) VALUES (@name, @rollNo, @className, @section, @email, @phone, @guardian)`
);
const insertTeacher = db.prepare(
  `INSERT INTO teachers (name, subject, email, phone, className) VALUES (@name, @subject, @email, @phone, @className)`
);
const insertAttendance = db.prepare(`INSERT INTO attendance (studentId, date, status) VALUES (?, ?, ?)`);
const insertFee = db.prepare(`INSERT INTO fees (studentId, amount, term, status, dueDate) VALUES (?, ?, ?, ?, ?)`);
const insertExam = db.prepare(
  `INSERT INTO exam_results (studentId, examName, subject, marks, maxMarks) VALUES (?, ?, ?, ?, ?)`
);
const insertUser = db.prepare(
  `INSERT INTO users (email, passwordHash, role, name, studentId, teacherId) VALUES (?, ?, ?, ?, ?, ?)`
);

const students = [
  { name: "Aarav Sharma", rollNo: "R101", className: "10", section: "A", email: "aarav@example.com", phone: "9876500001", guardian: "Rajesh Sharma" },
  { name: "Diya Patel", rollNo: "R102", className: "10", section: "A", email: "diya@example.com", phone: "9876500002", guardian: "Kiran Patel" },
  { name: "Vihaan Gupta", rollNo: "R103", className: "10", section: "B", email: "vihaan@example.com", phone: "9876500003", guardian: "Sanjay Gupta" },
  { name: "Ananya Singh", rollNo: "R104", className: "9", section: "A", email: "ananya@example.com", phone: "9876500004", guardian: "Vikram Singh" },
  { name: "Reyansh Kumar", rollNo: "R105", className: "9", section: "B", email: "reyansh@example.com", phone: "9876500005", guardian: "Alok Kumar" },
];

const studentIds = students.map((s) => insertStudent.run(s).lastInsertRowid);

const teachers = [
  { name: "Meera Iyer", subject: "Mathematics", email: "meera@edumanage.in", phone: "9876511001", className: "10" },
  { name: "Rohan Verma", subject: "Science", email: "rohan@edumanage.in", phone: "9876511002", className: "9" },
  { name: "Priya Nair", subject: "English", email: "priya@edumanage.in", phone: "9876511003", className: "10" },
];
const teacherIds = teachers.map((t) => insertTeacher.run(t).lastInsertRowid);

const today = new Date().toISOString().slice(0, 10);
studentIds.forEach((id) => {
  insertAttendance.run(id, today, "Present");
  insertFee.run(id, 15000, "Term 1", Math.random() > 0.5 ? "Paid" : "Pending", "2026-09-15");
  insertExam.run(id, "Mid Term", "Mathematics", Math.floor(Math.random() * 40) + 50, 100);
});

// --- Login accounts ---
// Admin
insertUser.run("admin@edumanage.in", hashPassword("admin123"), "admin", "Admin", null, null);

// One login per teacher (password: teacher123)
teachers.forEach((t, i) => {
  insertUser.run(t.email, hashPassword("teacher123"), "teacher", t.name, null, teacherIds[i]);
});

// One login per student (password: student123)
students.forEach((s, i) => {
  insertUser.run(s.email, hashPassword("student123"), "student", s.name, studentIds[i], null);
});

console.log("Seed complete:", studentIds.length, "students,", teacherIds.length, "teachers, and login accounts created.");
console.log("");
console.log("Demo logins:");
console.log("  Admin    -> admin@edumanage.in / admin123");
console.log("  Teacher  -> meera@edumanage.in / teacher123");
console.log("  Student  -> aarav@example.com / student123");
