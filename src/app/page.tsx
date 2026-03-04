import Chatbot from "@/components/Chatbot";
import ScrollReveal from "@/components/ScrollReveal";
import TopBar from "@/components/TopBar";
import TypewriterTagline from "@/components/TypewriterTagline";
import { ExternalLink, Github } from "lucide-react";

const EXPERIENCE = [
  {
    role: "Cloud DevOps Intern",
    company: "Oaktree Innovations",
    period: "Mar 2025 - May 2025",
    summary:
      "Assisted with AWS infrastructure tasks, improved CI/CD workflows, and supported deployment automation."
  },
  {
    role: "BS Computer Science",
    company: "Technological Institute of the Philippines - Manila",
    period: "2021 - 2025",
    summary:
      "Recent graduate with hands-on project experience in cloud, AI, and full-stack development."
  }
];

const LEADERSHIP = [
  {
    org: "Microsoft Student Community - TIP Manila",
    role: "TSMP & Communication Committee, LORSO Rep",
    period: "2021 - 2025"
  },
  {
    org: "League of Recognized Student Organizations - TIP Manila",
    role: "Assistant Secretary, Project Manager (Operations)",
    period: "2023 - 2025"
  },
  {
    org: "AWS Cloud Club - TIP Manila",
    role: "Vice-Chief Relations Officer",
    period: "2024"
  },
  {
    org: "ICONS (Information & Computing Organization of Networked Students)",
    role: "Treasurer, Public Relations Officer, Communications Head",
    period: "2021 - 2024"
  },
  {
    org: "UPHSD SHS Alumni Association",
    role: "Public Information Officer",
    period: "2024 - 2027"
  }
];

const ACHIEVEMENTS = [
  "With Honor Distinction (BS Computer Science)",
  "Service Excellence Award",
  "Service Stewardship Award",
  "Built and deployed practical cloud/AI projects including PanicSense PH thesis",
  "Hands-on Cloud DevOps internship experience at Oaktree Innovations"
];

export default function Home() {
  return (
    <main className="site-shell min-h-screen text-white antialiased">
      <div className="cloud-light one" />
      <div className="cloud-light two" />
      <div className="cloud-light three" />

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12 md:py-16">
        <TopBar />

        <ScrollReveal className="mb-14" delayMs={20}>
          <section>
          <h1 className="font-display text-4xl font-black leading-[1.05] sm:text-5xl md:text-7xl">
            <strong>Mark Andrei,</strong>
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
            <p className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.06em] text-amber-400 sm:gap-2 sm:text-sm sm:tracking-[0.18em]">
              <span className="h-2 w-2 rounded-full bg-amber-400" />
              Available for work
            </p>
            <p className="inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.03em] text-slate-200 sm:gap-2 sm:text-sm sm:tracking-[0.12em]">
              <span className="h-2 w-2 rounded-full bg-slate-200" />
              Graduated With Honor Distinction
            </p>
          </div>
          <p className="mt-2 w-full overflow-hidden text-xl font-semibold text-white sm:text-2xl md:text-3xl">
            <TypewriterTagline />
          </p>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
            Entry-level DevOps and Software Developer focused on building practical applications and reliable systems, with leadership experience from student organizations and a passion for learning new technologies.
          </p>
          </section>
        </ScrollReveal>

        <ScrollReveal className="mb-14" delayMs={40}>
          <section id="featured" className="feature-card">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
            Featured Work
          </p>
          <h2 className="mt-1 text-2xl font-bold">PanicSense PH</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300 md:text-base">
            Real-time disaster signal monitoring with multilingual sentiment analysis to surface urgent areas faster.
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
            Python / NLP / mBERT / Bi-GRU / LSTM
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <a
              href="https://panicsenseph.ct.ws/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-amber-400 hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              Live Demo
            </a>
            <a
              href="https://github.com/draiimon/Thesis-PanicSense/tree/main"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 font-medium text-amber-400 hover:underline"
            >
              <Github className="h-4 w-4" />
              GitHub Repo
            </a>
          </div>
          </section>
        </ScrollReveal>

        <section id="experience" className="mb-14">
          <h2 className="mb-4 text-2xl font-bold">Experience Snapshot</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {EXPERIENCE.map((item, idx) => (
              <ScrollReveal key={item.role} delayMs={70 + idx * 60}>
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

        <section id="leadership" className="mb-14">
          <h2 className="mb-4 text-2xl font-bold">Leadership & Community Activities</h2>
          <div className="space-y-4 border-l border-white/20 pl-4 md:pl-6">
            {LEADERSHIP.map((item, idx) => (
              <ScrollReveal key={`${item.org}-${item.role}`} className="pb-2" delayMs={90 + idx * 45}>
                <article>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">{item.period}</p>
                  <h3 className="mt-1 break-words text-base font-bold text-white">{item.org}</h3>
                  <p className="mt-1 break-words text-sm leading-relaxed text-slate-300">{item.role}</p>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </section>

        <ScrollReveal className="mb-14" delayMs={120}>
          <section id="achievements">
            <h2 className="mb-4 text-2xl font-bold">Achievements</h2>
            <div className="space-y-3 border-l border-white/20 pl-4 md:pl-6">
              {ACHIEVEMENTS.map((item, idx) => (
                <ScrollReveal key={item} delayMs={140 + idx * 35}>
                  <p className="flex items-start gap-2 break-words text-sm leading-relaxed text-slate-300">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <span>{item}</span>
                  </p>
                </ScrollReveal>
              ))}
            </div>
          </section>
        </ScrollReveal>

        <p className="text-sm text-slate-300 md:text-base">
          Say hi —{" "}
          <a href="mailto:andreicastillofficial@gmail.com" className="text-amber-400 hover:underline">
            andreicastillofficial@gmail.com
          </a>
        </p>

        <footer className="mt-3 border-t border-white/10 pt-6 text-[11px] text-slate-300 sm:text-sm md:text-base">
          <div className="mt-2 grid grid-cols-3 items-center gap-2">
            <span className="text-left">To the clouds.</span>
            <span className="text-center">@2026 draiimon</span>
            <span className="text-right">Thank you!</span>
          </div>
        </footer>
      </div>

      <Chatbot />
    </main>
  );
}



