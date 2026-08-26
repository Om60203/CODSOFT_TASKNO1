import { useEffect, useState } from "react";
import DashboardShell from "../../components/DashboardShell";
const { requireUser } = require("../../lib/auth");

export async function getServerSideProps({ req }) {
  const auth = requireUser(req, ["admin"]);
  if (auth.redirect) return { redirect: { destination: auth.destination, permanent: false } };
  return { props: { user: auth.user } };
}

const EMPTY = { name: "", subject: "", className: "", email: "", phone: "" };

export default function TeachersPage({ user }) {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/teachers");
    setTeachers(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/teachers", {
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
    if (!confirm("Remove this teacher?")) return;
    await fetch(`/api/teachers/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <DashboardShell role="admin" user={user} title="Teachers" subtitle="Manage teaching staff and their assigned classes.">
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-[#6b7391]">{teachers.length} teachers on staff</p>
        <button className="btn-primary" onClick={() => { setForm(EMPTY); setError(""); setShowForm(true); }}>
          + Add Teacher
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-[#6b7391]">Loading...</p>
        ) : teachers.length === 0 ? (
          <p className="p-6 text-sm text-[#6b7391]">No teachers yet. Add your first teacher to get started.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Subject</th>
                <th>Class</th>
                <th>Contact</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id}>
                  <td className="font-medium">{t.name}</td>
                  <td>{t.subject}</td>
                  <td>{t.className}</td>
                  <td className="text-[#6b7391]">{t.phone}</td>
                  <td className="text-right">
                    <button className="text-red-500 text-xs font-semibold" onClick={() => handleDelete(t.id)}>
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
            <p className="font-display text-lg mb-4">Add Teacher</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Full name" className="border rounded-lg px-3 py-2 text-sm w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Subject" className="border rounded-lg px-3 py-2 text-sm" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                <input required placeholder="Class (e.g. 10)" className="border rounded-lg px-3 py-2 text-sm" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} />
              </div>
              <input placeholder="Email" className="border rounded-lg px-3 py-2 text-sm w-full" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input placeholder="Phone" className="border rounded-lg px-3 py-2 text-sm w-full" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
