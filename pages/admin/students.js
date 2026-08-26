import { useEffect, useState } from "react";
import DashboardShell from "../../components/DashboardShell";
const { requireUser } = require("../../lib/auth");

export async function getServerSideProps({ req }) {
  const auth = requireUser(req, ["admin"]);
  if (auth.redirect) return { redirect: { destination: auth.destination, permanent: false } };
  return { props: { user: auth.user } };
}

const EMPTY = { name: "", rollNo: "", className: "", section: "", email: "", phone: "", guardian: "" };

export default function StudentsPage({ user }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/students");
    setStudents(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setForm(EMPTY);
    setEditingId(null);
    setError("");
    setShowForm(true);
  }

  function openEdit(s) {
    setForm({ name: s.name, rollNo: s.rollNo, className: s.className, section: s.section, email: s.email, phone: s.phone, guardian: s.guardian });
    setEditingId(s.id);
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const url = editingId ? `/api/students/${editingId}` : "/api/students";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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
    if (!confirm("Remove this student and all associated records?")) return;
    await fetch(`/api/students/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <DashboardShell role="admin" user={user} title="Students" subtitle="Manage enrollment records for every student.">
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-[#6b7391]">{students.length} students enrolled</p>
        <button className="btn-primary" onClick={openNew}>
          + Add Student
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-[#6b7391]">Loading...</p>
        ) : students.length === 0 ? (
          <p className="p-6 text-sm text-[#6b7391]">No students yet. Add your first student to get started.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll No</th>
                <th>Name</th>
                <th>Class</th>
                <th>Guardian</th>
                <th>Contact</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium">{s.rollNo}</td>
                  <td>{s.name}</td>
                  <td>
                    {s.className}-{s.section}
                  </td>
                  <td>{s.guardian}</td>
                  <td className="text-[#6b7391]">{s.phone}</td>
                  <td className="text-right whitespace-nowrap">
                    <button className="text-brand-500 text-xs font-semibold mr-3" onClick={() => openEdit(s)}>
                      Edit
                    </button>
                    <button className="text-red-500 text-xs font-semibold" onClick={() => handleDelete(s.id)}>
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
            <p className="font-display text-lg mb-4">{editingId ? "Edit Student" : "Add Student"}</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Full name" className="border rounded-lg px-3 py-2 text-sm col-span-2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input required placeholder="Roll number" className="border rounded-lg px-3 py-2 text-sm" value={form.rollNo} onChange={(e) => setForm({ ...form, rollNo: e.target.value })} />
                <input required placeholder="Class (e.g. 10)" className="border rounded-lg px-3 py-2 text-sm" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} />
                <input required placeholder="Section (e.g. A)" className="border rounded-lg px-3 py-2 text-sm" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} />
                <input placeholder="Guardian name" className="border rounded-lg px-3 py-2 text-sm" value={form.guardian} onChange={(e) => setForm({ ...form, guardian: e.target.value })} />
                <input placeholder="Email" className="border rounded-lg px-3 py-2 text-sm col-span-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <input placeholder="Phone" className="border rounded-lg px-3 py-2 text-sm col-span-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingId ? "Save changes" : "Add student"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
