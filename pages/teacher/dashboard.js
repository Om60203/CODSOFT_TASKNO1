import DashboardShell from "../../components/DashboardShell";
const { pool, ensureSchema } = require("../../lib/db");
const { requireUser } = require("../../lib/auth");

export async function getServerSideProps({ req }) {
  const auth = await requireUser(req, ["teacher"]);
  if (auth.redirect) return { redirect: { destination: auth.destination, permanent: false } };
  await ensureSchema();

  let teacher = null;
  let classStudents = [];
  if (auth.user.teacherId) {
    const tRes = await pool.query(`SELECT * FROM teachers WHERE id = $1`, [auth.user.teacherId]);
    teacher = tRes.rows[0] || null;
    if (teacher) {
      const sRes = await pool.query(`SELECT * FROM students WHERE "className" = $1 ORDER BY "rollNo"`, [teacher.className]);
      classStudents = sRes.rows;
    }
  }

  return { props: { user: auth.user, teacher, classStudents } };
}

export default function TeacherDashboard({ user, teacher, classStudents }) {
  return (
    <DashboardShell role="teacher" user={user} title="My Class" subtitle="Students assigned to your class.">
      {!teacher ? (
        <p className="text-sm text-[#6b7391]">
          Your account isn't linked to a teacher profile yet. Ask an administrator to link it under Login Accounts.
        </p>
      ) : (
        <>
          <div className="card p-5 mb-6 flex items-center justify-between">
            <div>
              <p className="font-display text-lg">{teacher.name}</p>
              <p className="text-sm text-[#6b7391]">{teacher.subject} · Class {teacher.className}</p>
            </div>
            <span className="badge badge-blue">{classStudents.length} students</span>
          </div>

          <div className="card overflow-hidden">
            {classStudents.length === 0 ? (
              <p className="p-6 text-sm text-[#6b7391]">No students in Class {teacher.className} yet.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Section</th>
                    <th>Guardian</th>
                    <th>Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map((s) => (
                    <tr key={s.id}>
                      <td className="font-medium">{s.rollNo}</td>
                      <td>{s.name}</td>
                      <td>{s.section}</td>
                      <td>{s.guardian}</td>
                      <td className="text-[#6b7391]">{s.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <p className="text-xs text-[#6b7391] mt-4">
            To mark attendance or record exam results for your class, ask an administrator — attendance/exam entry from the teacher dashboard is coming soon.
          </p>
        </>
      )}
    </DashboardShell>
  );
}