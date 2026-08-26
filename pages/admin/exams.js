import { useEffect, useState } from "react";
import DashboardShell from "../../components/DashboardShell";
const { requireUser } = require("../../lib/auth");

export async function getServerSideProps({ req }) {
  const auth = requireUser(req, ["admin"]);
  if (auth.redirect) return { redirect: { destination: auth.destination, permanent: false } };
  return { props: { user: auth.user } };
}

const EMPTY = { studentId: "", examName: "", subject: "", marks: "", maxMarks: "100" };

export default function ExamsPage({ user }) {
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const [eRes, sRes] = await Promise.all([fetch("/api/exams"), fetch("/api/students")]);
    setExams(await eRes.json());
    setStudents(await sRes.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }
    setForm(EMPTY);
    setShowForm(false);
    load();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this exam record?")) return;
    await fetch(`/api/exams/${id}`, { method: "DELETE" });
    load();
  }

  function grade(marks, maxMarks) {
    const pct = (marks / maxMarks) * 100;
    if (pct >= 90) return { label: "A+", cls: "badge-green" };
    if (pct >= 75) return { label: "A", cls: "badge-green" };
    if (pct >= 60) return { label: "B", cls: "badge-blue" };
    if (pct >= 40) return { label: "C", cls: "badge-amber" };
    return { label: "F", cls: "badge-red" };
  }

  return (
    <DashboardShell role="admin" user={user} title="Exam Records" subtitle="Record and review academic performance across exams.">
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-[#6b7391]">{exams.length} results recorded</p>
        <button className="btn-primary" onClick={() => { setForm(EMPTY); setError(""); setShowForm(true); }}>
          + Add Result
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-[#6b7391]">Loading...</p>
        ) : exams.length === 0 ? (
          <p className="p-6 text-sm text-[#6b7391]">No exam results yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Exam</th>
                <th>Subject</th>
                <th>Marks</th>
                <th>Grade</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {exams.map((ex) => {
                const g = grade(ex.marks, ex.maxMarks);
                return (
                  <tr key={ex.id}>
                    <td className="font-medium">{ex.student?.name}</td>
                    <td>{ex.examName}</td>
                    <td>{ex.subject}</td>
                    <td>{ex.marks} / {ex.maxMarks}</td>
                    <td><span className={`badge ${g.cls}`}>{g.label}</span></td>
                    <td className="text-right">
                      <button className="text-red-500 text-xs font-semibold" onClick={() => handleDelete(ex.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <p className="font-display text-lg mb-4">Add Exam Result</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <select required className="border rounded-lg px-3 py-2 text-sm w-full" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
                <option value="">Select student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.rollNo})
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Exam name" className="border rounded-lg px-3 py-2 text-sm" value={form.examName} onChange={(e) => setForm({ ...form, examName: e.target.value })} />
                <input required placeholder="Subject" className="border rounded-lg px-3 py-2 text-sm" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                <input required type="number" placeholder="Marks obtained" className="border rounded-lg px-3 py-2 text-sm" value={form.marks} onChange={(e) => setForm({ ...form, marks: e.target.value })} />
                <input required type="number" placeholder="Max marks" className="border rounded-lg px-3 py-2 text-sm" value={form.maxMarks} onChange={(e) => setForm({ ...form, maxMarks: e.target.value })} />
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
