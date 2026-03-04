import Link from "next/link";

export default function AdminLanding() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-awsBlack to-awsGray">
      <div className="max-w-md w-full mx-4 rounded-2xl border border-awsGray bg-awsBlack/80 shadow-2xl shadow-black/80 p-8 space-y-4">
        <p className="text-xs uppercase tracking-[0.25em] text-awsOrange">Admin</p>
        <h1 className="text-xl font-semibold">Portfolio control panel</h1>
        <p className="text-sm text-neutral-400">
          This area lets you update your profile, projects, and gallery.
          It is intentionally hidden behind a minimal login screen so that
          visitors land on your public portfolio first.
        </p>
        <Link
          href="/admin/login"
          className="inline-flex items-center justify-center rounded-md bg-awsOrange px-4 py-2 text-sm font-medium text-awsBlack hover:brightness-110 transition-all"
        >
          Go to admin login
        </Link>
        <Link
          href="/"
          className="block text-xs text-neutral-500 hover:text-awsOrange pt-2"
        >
          ← Back to portfolio
        </Link>
      </div>
    </main>
  );
}

