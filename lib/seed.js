const { pool, ensureSchema } = require("./db");
const { hashPassword } = require("./auth");

async function seed() {
  await ensureSchema();
  await pool.query(`DELETE FROM sessions; DELETE FROM users; DELETE FROM exam_results; DELETE FROM fees; DELETE FROM attendance; DELETE FROM students; DELETE FROM teachers;`);

  const students = [
    { name: "Aarav Sharma", rollNo: "R101", className: "10", section: "A", email: "aarav@example.com", phone: "9876500001", guardian: "Rajesh Sharma" },
    { name: "Diya Patel", rollNo: "R102", className: "10", section: "A", email: "diya@example.com", phone: "9876500002", guardian: "Kiran Patel" },
    { name: "Vihaan Gupta", rollNo: "R103", className: "10", section: "B", email: "vihaan@example.com", phone: "9876500003", guardian: "Sanjay Gupta" },
    { name: "Ananya Singh", rollNo: "R104", className: "9", section: "A", email: "ananya@example.com", phone: "9876500004", guardian: "Vikram Singh" },
    { name: "Reyansh Kumar", rollNo: "R105", className: "9", section: "B", email: "reyansh@example.com", phone: "9876500005", guardian: "Alok Kumar" },
  ];
  const studentIds = [];
  for (const s of students) {
    const { rows } = await pool.query(
      `INSERT INTO students (name, "rollNo", "className", section, email, phone, guardian) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [s.name, s.rollNo, s.className, s.section, s.email, s.phone, s.guardian]
    );
    studentIds.push(rows[0].id);
  }

  const teachers = [
    { name: "Meera Iyer", subject: "Mathematics", email: "meera@edumanage.in", phone: "9876511001", className: "10" },
    { name: "Rohan Verma", subject: "Science", email: "rohan@edumanage.in", phone: "9876511002", className: "9" },
    { name: "Priya Nair", subject: "English", email: "priya@edumanage.in", phone: "9876511003", className: "10" },
  ];
  const teacherIds = [];
  for (const t of teachers) {
    const { rows } = await pool.query(
      `INSERT INTO teachers (name, subject, email, phone, "className") VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [t.name, t.subject, t.email, t.phone, t.className]
    );
    teacherIds.push(rows[0].id);
  }

  const today = new Date().toISOString().slice(0, 10);
  for (const id of studentIds) {
    await pool.query(`INSERT INTO attendance ("studentId", date, status) VALUES ($1,$2,'Present')`, [id, today]);
    await pool.query(`INSERT INTO fees ("studentId", amount, term, status, "dueDate") VALUES ($1,15000,'Term 1',$2,'2026-09-15')`, [id, Math.random() > 0.5 ? "Paid" : "Pending"]);
    await pool.query(`INSERT INTO exam_results ("studentId", "examName", subject, marks, "maxMarks") VALUES ($1,'Mid Term','Mathematics',$2,100)`, [id, Math.floor(Math.random() * 40) + 50]);
  }

  await pool.query(`INSERT INTO users (email, "passwordHash", role, name) VALUES ($1,$2,'admin','Admin')`, ["admin@edumanage.in", hashPassword("admin123")]);
  for (let i = 0; i < teachers.length; i++) {
    await pool.query(`INSERT INTO users (email, "passwordHash", role, name, "teacherId") VALUES ($1,$2,'teacher',$3,$4)`, [teachers[i].email, hashPassword("teacher123"), teachers[i].name, teacherIds[i]]);
  }
  for (let i = 0; i < students.length; i++) {
    await pool.query(`INSERT INTO users (email, "passwordHash", role, name, "studentId") VALUES ($1,$2,'student',$3,$4)`, [students[i].email, hashPassword("student123"), students[i].name, studentIds[i]]);
  }

  console.log("Seed complete:", studentIds.length, "students,", teacherIds.length, "teachers, and login accounts created.");
  console.log("Admin login -> admin@edumanage.in / admin123");
  await pool.end();
}

seed().catch((e) => { console.error(e); process.exit(1); });