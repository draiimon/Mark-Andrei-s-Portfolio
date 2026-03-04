import Chatbot from "@/components/Chatbot";
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

export default function Home() {
  return (
    <main className="site-shell min-h-screen text-white antialiased">
      <div className="cloud-light one" />
      <div className="cloud-light two" />
      <div className="cloud-light three" />

      <div className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        <TopBar />

        <section className="fade-rise mb-14">
          <h1 className="font-display text-5xl font-black leading-[1.05] md:text-7xl">
            <strong>Mark Andrei</strong>
          </h1>
          <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Available for work
          </p>
          <p className="mt-2 text-2xl font-semibold text-white md:text-3xl">
            <TypewriterTagline />
          </p>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
            Entry-level Cloud and Developer with a strong interest in building reliable systems and practical applications. Eager to learn, grow, and contribute while continuously improving my technical skills.
          </p>
        </section>

        <section id="featured" className="feature-card mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">
            Featured Work
          </p>
          <h2 className="mt-1 text-2xl font-bold">PanicSense PH</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300 md:text-base">
            Real-time disaster signal monitoring with multilingual sentiment analysis to surface urgent areas faster.
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
            Python / NLP / AWS
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

        <section id="experience" className="mb-14">
          <h2 className="mb-4 text-2xl font-bold">Experience Snapshot</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {EXPERIENCE.map((item) => (
              <article key={item.role} className="snap-card">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">{item.period}</p>
                <h3 className="mt-1 text-lg font-bold">{item.role}</h3>
                <p className="text-sm text-slate-300">{item.company}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.summary}</p>
              </article>
            ))}
          </div>
        </section>

        <p className="text-sm text-slate-300 md:text-base">
          Say hi —{" "}
          <a href="mailto:andreicastillofficial@gmail.com" className="text-amber-400 hover:underline">
            andreicastillofficial@gmail.com
          </a>
        </p>

        <footer className="mt-3 border-t border-white/10 pt-6 text-sm text-slate-300 md:text-base">
          <div className="mt-2 grid grid-cols-3 items-center">
            <span className="text-left">To the clouds.</span>
            <span className="text-center">© 2026 Mark Andrei R. Castillo.</span>
            <span className="text-right">Thank you!</span>
          </div>
        </footer>
      </div>

      <Chatbot />
    </main>
  );
}
