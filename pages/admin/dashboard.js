import DashboardShell from "../../components/DashboardShell";
const db = require("../../lib/db");
const { requireUser } = require("../../lib/auth");

export async function getServerSideProps({ req }) {
  const auth = requireUser(req, ["admin"]);
  if (auth.redirect) return { redirect: { destination: auth.destination, permanent: false } };

  const studentCount = db.prepare("SELECT COUNT(*) as c FROM students").get().c;
  const teacherCount = db.prepare("SELECT COUNT(*) as c FROM teachers").get().c;
  const pendingFees = db.prepare("SELECT COUNT(*) as c FROM fees WHERE status = 'Pending'").get().c;
  const recentAttendance = db
    .prepare(
      `SELECT a.id, a.date, a.status, s.name as studentName
       FROM attendance a JOIN students s ON s.id = a.studentId
       ORDER BY a.id DESC LIMIT 6`
    )
    .all()
    .map((r) => ({ id: r.id, date: r.date, status: r.status, student: { name: r.studentName } }));
  const classCounts = db
    .prepare(`SELECT className, COUNT(*) as count FROM students GROUP BY className ORDER BY className`)
    .all();

  return {
    props: {
      user: auth.user,
      stats: { studentCount, teacherCount, pendingFees },
      recentAttendance,
      classCounts,
    },
  };
}

function StatCard({ label, value, accent }) {
  return (
    <div className="card p-6">
      <p className="eyebrow">{label}</p>
      <p className={`font-display text-4xl mt-3 ${accent}`}>{value}</p>
    </div>
  );
}

export default function AdminDashboard({ user, stats, recentAttendance, classCounts }) {
  return (
    <DashboardShell
      role="admin"
      user={user}
      title="Institution Overview"
      subtitle="Live snapshot of enrollment, staffing, and outstanding fees."
    >
      <div className="grid sm:grid-cols-3 gap-5">
        <StatCard label="Total Students" value={stats.studentCount} accent="text-brand-500" />
        <StatCard label="Total Teachers" value={stats.teacherCount} accent="text-ink" />
        <StatCard label="Pending Fee Payments" value={stats.pendingFees} accent="text-amber-500" />
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mt-8">
        <div className="card p-6">
          <p className="eyebrow mb-4">Students per class</p>
          <div className="space-y-3">
            {classCounts.map((c) => (
              <div key={c.className}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">Class {c.className}</span>
                  <span className="text-[#6b7391]">{c.count}</span>
                </div>
                <div className="h-2 bg-[#eef1fb] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-500 rounded-full"
                    style={{ width: `${Math.min(100, (c.count / Math.max(stats.studentCount, 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
            {classCounts.length === 0 && <p className="text-sm text-[#6b7391]">No students enrolled yet.</p>}
          </div>
        </div>

        <div className="card p-6">
          <p className="eyebrow mb-4">Recent attendance activity</p>
          <div className="space-y-3">
            {recentAttendance.map((a) => (
              <div key={a.id} className="flex justify-between items-center text-sm border-b border-[#f0f2f8] pb-3 last:border-0">
                <div>
                  <p className="font-medium">{a.student?.name}</p>
                  <p className="text-[#6b7391] text-xs">{a.date}</p>
                </div>
                <span className={`badge ${a.status === "Present" ? "badge-green" : "badge-red"}`}>{a.status}</span>
              </div>
            ))}
            {recentAttendance.length === 0 && <p className="text-sm text-[#6b7391]">No attendance recorded yet.</p>}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
