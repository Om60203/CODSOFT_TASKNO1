import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen relative flex flex-col overflow-hidden bg-[#0a0e1a] text-white">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: "url('/backgrounds/nature.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a]/70 via-[#0a0e1a]/85 to-[#0a0e1a]" />

      <div className="relative max-w-5xl mx-auto w-full px-6 pt-24 pb-12 flex-1">
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-amber-400 flex items-center justify-center text-amber-400 font-display">
              ES
            </div>
            <span className="font-display text-xl">EduManage</span>
          </div>
          <Link href="/login" className="btn-primary">
            Sign in
          </Link>
        </div>

        <p className="eyebrow text-amber-400">Full-Stack Education Platform</p>
        <h1 className="font-display text-5xl leading-tight mt-3 max-w-2xl">
          One record book for every student, teacher, and administrator.
        </h1>
        <p className="text-white/60 mt-5 max-w-xl">
          EduManage digitizes the daily academic workflow — enrollment, attendance,
          fees, and exam records — so nothing lives on paper anymore. Each role
          signs in to its own secure dashboard.
        </p>

        <Link
          href="/login"
          className="inline-block mt-10 bg-amber-400 hover:bg-amber-500 text-ink font-semibold rounded-lg px-6 py-3 text-sm transition"
        >
          Sign in to your dashboard →
        </Link>
      </div>
      <footer className="relative border-t border-white/10 py-5 text-center text-xs text-white/40">
        EduManage — Student Management System · Built for CodSoft Full-Stack Web Development Internship
      </footer>
    </div>
  );
}
