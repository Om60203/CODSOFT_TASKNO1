import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

const ROLES = [
  { id: "admin", label: "Administrator" },
  { id: "teacher", label: "Teacher" },
  { id: "student", label: "Student" },
];

const DEMO_CREDS = {
  admin: { email: "admin@edumanage.in", password: "admin123" },
  teacher: { email: "meera@edumanage.in", password: "teacher123" },
  student: { email: "aarav@example.com", password: "student123" },
};

export default function Login() {
  const router = useRouter();
  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Login failed");
      return;
    }
    router.push(`/${role}/dashboard`);
  }

  function fillDemo() {
    setEmail(DEMO_CREDS[role].email);
    setPassword(DEMO_CREDS[role].password);
  }

  return (
    <>
      <Head>
        <title>Sign in — EduManage</title>
      </Head>
      <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden bg-[#0a0e1a]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url('/backgrounds/mystic.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e1a]/80 via-[#101a2e]/85 to-[#1a1035]/90" />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative w-full max-w-md">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 rounded-full border-2 border-amber-400 flex items-center justify-center text-amber-400 font-display">
              ES
            </div>
            <span className="font-display text-2xl text-white">EduManage</span>
          </div>

          <div className="backdrop-blur-xl bg-white/[0.07] border border-white/15 rounded-2xl p-8 shadow-2xl">
            <p className="eyebrow text-amber-400 mb-1">Welcome back</p>
            <h1 className="font-display text-2xl text-white mb-6">Sign in to your dashboard</h1>

            <div className="flex bg-white/5 border border-white/10 rounded-lg p-1 mb-6">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setRole(r.id);
                    setError("");
                  }}
                  className={`flex-1 text-xs font-semibold py-2 rounded-md transition ${
                    role === r.id ? "bg-brand-500 text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-white/50 mb-1 block">Email</label>
                <input
                  required
                  type="email"
                  autoComplete="email"
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400"
                  placeholder="you@edumanage.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">Password</label>
                <input
                  required
                  type="password"
                  autoComplete="current-password"
                  className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-400 hover:bg-amber-500 text-ink font-semibold rounded-lg py-2.5 text-sm transition disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <button
              type="button"
              onClick={fillDemo}
              className="w-full text-center text-xs text-white/40 hover:text-amber-400 mt-4 transition"
            >
              Use demo {ROLES.find((r) => r.id === role).label.toLowerCase()} credentials
            </button>
          </div>

          <p className="text-center text-white/30 text-xs mt-6">
            EduManage · Student Management System
          </p>
        </div>
      </div>
    </>
  );
}
