import DashboardShell from "../../components/DashboardShell";
const db = require("../../lib/db");
const { requireUser } = require("../../lib/auth");

export async function getServerSideProps({ req }) {
  const auth = requireUser(req, ["student"]);
  if (auth.redirect) return { redirect: { destination: auth.destination, permanent: false } };

  const studentId = auth.user.studentId;
  const student = studentId ? db.prepare("SELECT * FROM students WHERE id = ?").get(studentId) : null;

  const attendance = studentId
    ? db.prepare("SELECT * FROM attendance WHERE studentId = ? ORDER BY date DESC").all(studentId)
    : [];
  const fees = studentId
    ? db.prepare("SELECT * FROM fees WHERE studentId = ? ORDER BY id DESC").all(studentId)
    : [];
  const exams = studentId
    ? db.prepare("SELECT * FROM exam_results WHERE studentId = ? ORDER BY id DESC").all(studentId)
    : [];

  return {
    props: { user: auth.user, student: student || null, attendance, fees, exams },
  };
}

export default function StudentDashboard({ user, student, attendance, fees, exams }) {
  const presentCount = attendance.filter((a) => a.status === "Present").length;
  const attendancePct = attendance.length ? Math.round((presentCount / attendance.length) * 100) : 0;

  return (
    <DashboardShell role="student" user={user} title="My Records" subtitle="Your attendance, fees, and exam performance in one place.">
      {!student ? (
        <p className="text-sm text-[#6b7391]">
          Your account isn't linked to a student profile yet. Ask an administrator to link it under Login Accounts.
        </p>
      ) : (
        <>
          <div className="card p-5 mb-6 flex items-center justify-between">
            <div>
              <p className="font-display text-lg">{student.name}</p>
              <p className="text-sm text-[#6b7391]">Roll No {student.rollNo} · Class {student.className}-{student.section}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 mb-8">
            <div className="card p-6">
              <p className="eyebrow">Attendance Rate</p>
              <p className="font-display text-4xl mt-3 text-brand-500">{attendancePct}%</p>
            </div>
            <div className="card p-6">
              <p className="eyebrow">Pending Fees</p>
              <p className="font-display text-4xl mt-3 text-amber-500">{fees.filter((f) => f.status === "Pending").length}</p>
            </div>
            <div className="card p-6">
              <p className="eyebrow">Exams Recorded</p>
              <p className="font-display text-4xl mt-3">{exams.length}</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-5">
            <div className="card p-6">
              <p className="eyebrow mb-4">Attendance history</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {attendance.map((a) => (
                  <div key={a.id} className="flex justify-between text-sm border-b border-[#f0f2f8] pb-2 last:border-0">
                    <span>{a.date}</span>
                    <span className={`badge ${a.status === "Present" ? "badge-green" : "badge-red"}`}>{a.status}</span>
                  </div>
                ))}
                {attendance.length === 0 && <p className="text-sm text-[#6b7391]">No records yet.</p>}
              </div>
            </div>

            <div className="card p-6">
              <p className="eyebrow mb-4">Fee status</p>
              <div className="space-y-2">
                {fees.map((f) => (
                  <div key={f.id} className="flex justify-between text-sm border-b border-[#f0f2f8] pb-2 last:border-0">
                    <span>{f.term} — ₹{f.amount.toLocaleString("en-IN")}</span>
                    <span className={`badge ${f.status === "Paid" ? "badge-green" : "badge-amber"}`}>{f.status}</span>
                  </div>
                ))}
                {fees.length === 0 && <p className="text-sm text-[#6b7391]">No fee records yet.</p>}
              </div>
            </div>

            <div className="card p-6 lg:col-span-2">
              <p className="eyebrow mb-4">Exam performance</p>
              <div className="space-y-2">
                {exams.map((ex) => (
                  <div key={ex.id} className="flex justify-between text-sm border-b border-[#f0f2f8] pb-2 last:border-0">
                    <span>{ex.examName} — {ex.subject}</span>
                    <span className="font-semibold">{ex.marks} / {ex.maxMarks}</span>
                  </div>
                ))}
                {exams.length === 0 && <p className="text-sm text-[#6b7391]">No exam results yet.</p>}
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
