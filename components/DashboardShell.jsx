import Link from "next/link";
import { useRouter } from "next/router";

const NAV = {
  admin: [
    { href: "/admin/dashboard", label: "Overview", icon: "◆" },
    { href: "/admin/students", label: "Students", icon: "▤" },
    { href: "/admin/teachers", label: "Teachers", icon: "◧" },
    { href: "/admin/attendance", label: "Attendance", icon: "☰" },
    { href: "/admin/fees", label: "Fees", icon: "$" },
    { href: "/admin/exams", label: "Exam Records", icon: "✎" },
    { href: "/admin/accounts", label: "Login Accounts", icon: "⚿" },
  ],
  teacher: [{ href: "/teacher/dashboard", label: "My Classes", icon: "◆" }],
  student: [{ href: "/student/dashboard", label: "My Records", icon: "◆" }],
};

const ROLE_LABEL = { admin: "Administrator", teacher: "Teacher", student: "Student" };

export default function DashboardShell({ role, title, subtitle, user, children }) {
  const router = useRouter();
  const items = NAV[role] || [];

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen flex bg-[#f4f6fb]">
      <aside className="w-64 shrink-0 bg-ink text-white flex flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border-2 border-amber-400 flex items-center justify-center text-amber-400 font-display text-sm">
              ES
            </div>
            <div>
              <p className="font-display text-lg leading-none">EduManage</p>
              <p className="text-[10px] tracking-widest text-white/50 uppercase mt-1">Academic Console</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-1">
          {items.map((item) => {
            const active = router.pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active ? "bg-brand-500 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="w-4 text-center opacity-80">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="px-6 py-5 border-t border-white/10 text-xs text-white/50">
          Signed in as
          <div className="text-white font-semibold truncate">{user?.name || ROLE_LABEL[role]}</div>
          <div className="text-white/40 truncate">{user?.email}</div>
          <button onClick={handleLogout} className="inline-block mt-2 text-amber-400 hover:underline">
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <header className="bg-white border-b border-[#e6e9f2] px-8 py-6">
          <p className="eyebrow">{ROLE_LABEL[role]} Dashboard</p>
          <h1 className="font-display text-2xl mt-1">{title}</h1>
          {subtitle && <p className="text-sm text-[#6b7391] mt-1">{subtitle}</p>}
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
