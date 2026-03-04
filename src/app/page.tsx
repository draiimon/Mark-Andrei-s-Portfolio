import Chatbot from "@/components/Chatbot";
import ScrollReveal from "@/components/ScrollReveal";
import TopBar from "@/components/TopBar";
import TypewriterTagline from "@/components/TypewriterTagline";
import { prisma } from "@/lib/prisma";
import { ExternalLink, Github } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const [profile, projects, experience, leadership, achievements, taglines] = await Promise.all([
    prisma.profile.findFirst(),
    prisma.project.findMany({ orderBy: [{ highlight: "desc" }, { createdAt: "desc" }] }),
    prisma.experience.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    prisma.leadership.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    prisma.achievement.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] }),
    prisma.tagline.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] })
  ]);

  const featured = projects.find((p) => p.highlight) ?? projects[0] ?? null;

  const heroName = profile?.fullName || "Mark Andrei";
  const taglineLines = taglines.length > 0 ? taglines.map((t) => t.text) : [profile?.heroTagline || "builds in the cloud."];
  const aboutText =
    profile?.about ||
    "Entry-level DevOps and Software Developer focused on building practical applications and reliable systems.";
  const availability = profile?.availability || "Available for work";
  const email = profile?.email || "andreicastillofficial@gmail.com";
  const brandName = profile?.brandName || "To the clouds.";
  const featuredLabel = profile?.featuredLabel || "Featured Work";
  const experienceTitle = profile?.experienceTitle || "Experience Snapshot";
  const leadershipTitle = profile?.leadershipTitle || "Leadership and Community Activities";
  const achievementsTitle = profile?.achievementsTitle || "Achievements";
  const contactLabel = profile?.contactLabel || "Say hi -";
  const footerCenterText = profile?.footerCenterText || "@2026 draiimon";
  const footerRightText = profile?.footerRightText || "Thank you!";

  return (
    <main className="site-shell min-h-screen text-white antialiased">
      <div className="cloud-light one" />
      <div className="cloud-light two" />
      <div className="cloud-light three" />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12 md:py-16">
        <TopBar brand={brandName} linkedinUrl={profile?.linkedinUrl} githubUrl={profile?.github} />

        <ScrollReveal className="mb-14" delayMs={20}>
          <section>
            <h1 className="font-display text-4xl font-black leading-[1.05] sm:text-5xl md:text-7xl">
              <strong>{heroName},</strong>
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
              <p className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.06em] text-amber-400 sm:gap-2 sm:text-sm sm:tracking-[0.18em]">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                {availability}
              </p>
              {profile?.headline && (
                <p className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.03em] text-slate-200 sm:gap-2 sm:text-sm sm:tracking-[0.12em]">
                  <span className="h-2 w-2 rounded-full bg-slate-200" />
                  {profile.headline}
                </p>
              )}
            </div>
            <p className="mt-2 w-full overflow-hidden text-xl font-semibold text-white sm:text-2xl md:text-3xl">
              <TypewriterTagline lines={taglineLines} />
            </p>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">{aboutText}</p>
          </section>
        </ScrollReveal>

        {featured && (
          <ScrollReveal className="mb-14" delayMs={40}>
            <section id="featured" className="feature-card">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">{featuredLabel}</p>
              <h2 className="mt-1 text-2xl font-bold">{featured.name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-300 md:text-base">{featured.description}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">{featured.techStack}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                {featured.link && (
                  <a
                    href={featured.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-amber-400 hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Live Demo
                  </a>
                )}
                {featured.githubUrl && (
                  <a
                    href={featured.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-amber-400 hover:underline"
                  >
                    <Github className="h-4 w-4" />
                    GitHub Repo
                  </a>
                )}
              </div>
            </section>
          </ScrollReveal>
        )}

        {experience.length > 0 && (
          <section id="experience" className="mb-14">
            <h2 className="mb-4 text-2xl font-bold">{experienceTitle}</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {experience.map((item, idx) => (
                <ScrollReveal key={item.id} delayMs={70 + idx * 60}>
                  <article className="snap-card">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">{item.period}</p>
                    <h3 className="mt-1 text-lg font-bold">{item.role}</h3>
                    <p className="text-sm text-slate-300">{item.company}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.summary}</p>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}

        {leadership.length > 0 && (
          <section id="leadership" className="mb-14">
            <h2 className="mb-4 text-2xl font-bold">{leadershipTitle}</h2>
            <div className="space-y-4 border-l border-white/20 pl-4 md:pl-6">
              {leadership.map((item, idx) => (
                <ScrollReveal key={item.id} className="pb-2" delayMs={90 + idx * 45}>
                  <article>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">{item.period}</p>
                    <h3 className="mt-1 break-words text-base font-bold text-white">{item.org}</h3>
                    <p className="mt-1 break-words text-sm leading-relaxed text-slate-300">{item.role}</p>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}

        {achievements.length > 0 && (
          <ScrollReveal className="mb-14" delayMs={120}>
            <section id="achievements">
              <h2 className="mb-4 text-2xl font-bold">{achievementsTitle}</h2>
              <div className="space-y-3 border-l border-white/20 pl-4 md:pl-6">
                {achievements.map((item, idx) => (
                  <ScrollReveal key={item.id} delayMs={140 + idx * 35}>
                    <p className="flex items-start gap-2 break-words text-sm leading-relaxed text-slate-300">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
                      <span>{item.text}</span>
                    </p>
                  </ScrollReveal>
                ))}
              </div>
            </section>
          </ScrollReveal>
        )}

        <p className="text-sm text-slate-300 md:text-base">
          {contactLabel}{" "}
          <a href={`mailto:${email}`} className="text-amber-400 hover:underline">
            {email}
          </a>
        </p>

        <footer className="mt-3 border-t border-white/10 pt-6 text-[11px] text-slate-300 sm:text-sm md:text-base">
          <div className="mt-2 grid grid-cols-3 items-center gap-2">
            <span className="text-left">{brandName}</span>
            <span className="text-center">{footerCenterText}</span>
            <span className="text-right">{footerRightText}</span>
          </div>
        </footer>
      </div>

      <Chatbot />
    </main>
  );
}
