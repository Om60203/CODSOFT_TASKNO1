import { useEffect, useState } from "react";
import DashboardShell from "../../components/DashboardShell";
const { requireUser } = require("../../lib/auth");

export async function getServerSideProps({ req }) {
  const auth = requireUser(req, ["admin"]);
  if (auth.redirect) return { redirect: { destination: auth.destination, permanent: false } };
  return { props: { user: auth.user } };
}

const EMPTY = { studentId: "", amount: "", term: "", status: "Pending", dueDate: "" };

export default function FeesPage({ user }) {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const [fRes, sRes] = await Promise.all([fetch("/api/fees"), fetch("/api/students")]);
    setFees(await fRes.json());
    setStudents(await sRes.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/fees", {
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

  async function togglePaid(fee) {
    await fetch(`/api/fees/${fee.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: fee.status === "Paid" ? "Pending" : "Paid" }),
    });
    load();
  }

  return (
    <DashboardShell role="admin" user={user} title="Fees" subtitle="Track fee assignments and payment status per student.">
      <div className="flex justify-between items-center mb-5">
        <p className="text-sm text-[#6b7391]">{fees.length} fee records</p>
        <button className="btn-primary" onClick={() => { setForm(EMPTY); setError(""); setShowForm(true); }}>
          + Add Fee Record
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-[#6b7391]">Loading...</p>
        ) : fees.length === 0 ? (
          <p className="p-6 text-sm text-[#6b7391]">No fee records yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Term</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {fees.map((f) => (
                <tr key={f.id}>
                  <td className="font-medium">{f.student?.name}</td>
                  <td>{f.term}</td>
                  <td>₹{f.amount.toLocaleString("en-IN")}</td>
                  <td>{f.dueDate}</td>
                  <td>
                    <span className={`badge ${f.status === "Paid" ? "badge-green" : "badge-amber"}`}>{f.status}</span>
                  </td>
                  <td className="text-right">
                    <button className="text-brand-500 text-xs font-semibold" onClick={() => togglePaid(f)}>
                      Mark {f.status === "Paid" ? "Pending" : "Paid"}
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
            <p className="font-display text-lg mb-4">Add Fee Record</p>
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
                <input required placeholder="Term (e.g. Term 1)" className="border rounded-lg px-3 py-2 text-sm" value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} />
                <input required type="number" placeholder="Amount (₹)" className="border rounded-lg px-3 py-2 text-sm" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <input required type="date" className="border rounded-lg px-3 py-2 text-sm w-full" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
