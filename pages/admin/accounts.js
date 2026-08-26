import { useEffect, useState } from "react";
import DashboardShell from "../../components/DashboardShell";
const { requireUser } = require("../../lib/auth");

export async function getServerSideProps({ req }) {
  const auth = requireUser(req, ["admin"]);
  if (auth.redirect) return { redirect: { destination: auth.destination, permanent: false } };
  return { props: { user: auth.user } };
}

const EMPTY = { email: "", password: "", role: "student", name: "", studentId: "", teacherId: "" };

export default function AccountsPage({ user }) {
  const [accounts, setAccounts] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const [aRes, sRes, tRes] = await Promise.all([
      fetch("/api/users"),
      fetch("/api/students"),
      fetch("/api/teachers"),
    ]);
    setAccounts(await aRes.json());
    setStudents(await sRes.json());
    setTeachers(await tRes.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setForm(EMPTY);
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const payload = { ...form };
    if (form.role !== "student") payload.studentId = "";
    if (form.role !== "teacher") payload.teacherId = "";
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }
    setShowForm(false);
    load();
  }

  async function handleDelete(id) {
    if (!confirm("Remove this login account? The person will no longer be able to sign in.")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE" });
    load();
  }

  const roleBadge = { admin: "badge-blue", teacher: "badge-amber", student: "badge-green" };

  return (
    <DashboardShell role="admin" user={user} title="Login Accounts" subtitle="Create and manage sign-in credentials for admins, teachers, and students.">
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-[#6b7391]">{accounts.length} accounts</p>
        <button className="btn-primary" onClick={openNew}>
          + Create Login
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-[#6b7391]">Loading...</p>
        ) : accounts.length === 0 ? (
          <p className="p-6 text-sm text-[#6b7391]">No accounts yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Linked to</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => (
                <tr key={a.id}>
                  <td className="font-medium">{a.name}</td>
                  <td className="text-[#6b7391]">{a.email}</td>
                  <td>
                    <span className={`badge ${roleBadge[a.role]}`}>{a.role}</span>
                  </td>
                  <td className="text-[#6b7391]">
                    {a.studentRollNo ? `Student · ${a.studentRollNo}` : a.teacherSubject ? `Teacher · ${a.teacherSubject}` : "—"}
                  </td>
                  <td className="text-right">
                    <button className="text-red-500 text-xs font-semibold" onClick={() => handleDelete(a.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowForm(false)}>
          <div className="card p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <p className="font-display text-lg mb-4">Create Login Account</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex bg-[#eef1fb] rounded-lg p-1">
                {["admin", "teacher", "student"].map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setForm({ ...form, role: r })}
                    className={`flex-1 text-xs font-semibold py-1.5 rounded-md capitalize ${
                      form.role === r ? "bg-white shadow text-ink" : "text-[#6b7391]"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <input required placeholder="Full name" className="border rounded-lg px-3 py-2 text-sm w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required type="email" placeholder="Login email" className="border rounded-lg px-3 py-2 text-sm w-full" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input required type="password" placeholder="Password (min 6 characters)" className="border rounded-lg px-3 py-2 text-sm w-full" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />

              {form.role === "student" && (
                <select required className="border rounded-lg px-3 py-2 text-sm w-full" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })}>
                  <option value="">Link to student record</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.rollNo})</option>
                  ))}
                </select>
              )}
              {form.role === "teacher" && (
                <select required className="border rounded-lg px-3 py-2 text-sm w-full" value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })}>
                  <option value="">Link to teacher record</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} — {t.subject}</option>
                  ))}
                </select>
              )}

              {error && <p className="text-red-500 text-xs">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create account</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
