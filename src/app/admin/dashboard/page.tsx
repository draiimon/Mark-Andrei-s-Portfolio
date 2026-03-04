import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("andei_admin")?.value === "true";
  if (!isAdmin) redirect("/admin/login");

  const profile = await prisma.profile.findFirst();
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  const gallery = await prisma.galleryImage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="min-h-screen bg-awsBlack text-sm text-neutral-200">
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-awsOrange">Admin</p>
            <h1 className="text-lg font-semibold">Portfolio dashboard</h1>
          </div>
          <a
            href="/"
            className="text-xs text-neutral-500 hover:text-awsOrange transition-colors"
          >
            View public portfolio
          </a>
        </header>

        <section className="grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-awsGray bg-awsGray/40 p-4 space-y-3">
            <h2 className="text-sm font-semibold">Profile snapshot</h2>
            {profile ? (
              <div className="space-y-1 text-xs">
                <p className="font-medium">{profile.fullName}</p>
                <p className="text-neutral-400">{profile.headline}</p>
                <p className="text-neutral-500">{profile.location}</p>
                <p className="text-neutral-500">{profile.email}</p>
                <p className="text-neutral-500">{profile.phone}</p>
              </div>
            ) : (
              <p className="text-xs text-neutral-400">
                No profile record yet. Use the form below to create one.
              </p>
            )}
            <a
              href="/admin/profile"
              className="inline-flex mt-2 text-[11px] text-awsOrange hover:underline"
            >
              Edit profile
            </a>
          </div>

          <div className="rounded-xl border border-awsGray bg-awsGray/40 p-4 space-y-3">
            <h2 className="text-sm font-semibold">At a glance</h2>
            <p className="text-xs text-neutral-400">
              Projects: <span className="text-neutral-200">{projects.length}</span>
            </p>
            <p className="text-xs text-neutral-400">
              Gallery images: <span className="text-neutral-200">{gallery.length}</span>
            </p>
            <div className="flex gap-3 pt-1">
              <a
                href="/admin/projects"
                className="text-[11px] text-awsOrange hover:underline"
              >
                Manage projects
              </a>
              <a
                href="/admin/gallery"
                className="text-[11px] text-awsOrange hover:underline"
              >
                Manage gallery
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

