import { useEffect, useState } from "react";
import DashboardShell from "../../components/DashboardShell";
const { requireUser } = require("../../lib/auth");

export async function getServerSideProps({ req }) {
  const auth = requireUser(req, ["admin"]);
  if (auth.redirect) return { redirect: { destination: auth.destination, permanent: false } };
  return { props: { user: auth.user } };
}

export default function AttendancePage({ user }) {
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const [sRes, aRes] = await Promise.all([fetch("/api/students"), fetch("/api/attendance")]);
    setStudents(await sRes.json());
    setRecords(await aRes.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function mark(studentId, status) {
    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, date, status }),
    });
    load();
  }

  const todayRecords = records.filter((r) => r.date === date);
  const statusFor = (studentId) => todayRecords.find((r) => r.studentId === studentId)?.status;

  return (
    <DashboardShell role="admin" user={user} title="Attendance" subtitle="Mark daily attendance for every enrolled student.">
      <div className="flex items-center gap-3 mb-5">
        <label className="text-sm text-[#6b7391]">Date</label>
        <input type="date" className="border rounded-lg px-3 py-2 text-sm" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-[#6b7391]">Loading...</p>
        ) : students.length === 0 ? (
          <p className="p-6 text-sm text-[#6b7391]">Add students first to mark attendance.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Class</th>
                <th>Status</th>
                <th>Mark</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => {
                const status = statusFor(s.id);
                return (
                  <tr key={s.id}>
                    <td className="font-medium">{s.rollNo}</td>
                    <td>{s.name}</td>
                    <td>{s.className}-{s.section}</td>
                    <td>
                      {status ? (
                        <span className={`badge ${status === "Present" ? "badge-green" : "badge-red"}`}>{status}</span>
                      ) : (
                        <span className="text-[#a0a6bd] text-xs">Not marked</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap">
                      <button className="text-xs font-semibold text-green-600 mr-3" onClick={() => mark(s.id, "Present")}>
                        Present
                      </button>
                      <button className="text-xs font-semibold text-red-500" onClick={() => mark(s.id, "Absent")}>
                        Absent
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </DashboardShell>
  );
}
