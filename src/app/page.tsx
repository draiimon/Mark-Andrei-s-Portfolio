import { prisma } from "@/lib/prisma";
import Chatbot from "@/components/Chatbot";
import RotatingTagline from "@/components/RotatingTagline";
import { ArrowUpRight, Cloud, ExternalLink, Github, Sparkles } from "lucide-react";

const DEFAULT_PROJECTS = [
  {
    id: 0,
    name: "PanicSense PH",
    tagline: "AI disaster signal monitoring",
    description:
      "Real-time disaster monitoring with multilingual sentiment and emotion analysis to surface high-risk areas faster.",
    techStack: "Python / NLP / React / AWS",
    link: "https://panicsenseph.ct.ws/",
    githubUrl: null
  },
  {
    id: -2,
    name: "SmartSort",
    tagline: "Waste sorting assistant",
    description:
      "YOLOv8-based classifier for biodegradable and non-biodegradable waste to support cleaner waste workflows.",
    techStack: "Python / YOLOv8 / OpenCV",
    link: null,
    githubUrl: "https://github.com/draiimon/Waste-Detection-Non-Bio-and-Bio-Project-Using-Yolov8"
  },
  {
    id: -3,
    name: "Cloud Capture",
    tagline: "Serverless photo workflow",
    description:
      "Image pipeline using AWS S3, Lambda, and DynamoDB to automate upload processing and sharing.",
    techStack: "AWS S3 / Lambda / DynamoDB",
    link: null,
    githubUrl: "https://github.com/draiimon"
  }
];

const EXPERIENCE = [
  {
    title: "Cloud DevOps Intern",
    company: "Oaktree Innovations",
    period: "Mar 2025 - May 2025",
    details:
      "Supported AWS-based deployments, helped improve CI/CD workflows, and assisted in monitoring and delivery automation."
  },
  {
    title: "CS Graduate",
    company: "TIP Manila",
    period: "2021 - 2025",
    details:
      "Built strong foundations in software engineering and cloud tooling through projects, org work, and hands-on implementation."
  }
];

export default async function Home() {
  const profile = await prisma.profile.findFirst();
  const dbProjects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  const gallery = await prisma.galleryImage.findMany({ orderBy: { createdAt: "desc" }, take: 6 });

  const baseProjects = dbProjects.length > 0 ? dbProjects : DEFAULT_PROJECTS;
  const projects = baseProjects.filter(
    (project) => !/oaktree/i.test(project.name) && !/oaktree/i.test(project.description)
  );

  return (
    <main className="relative min-h-screen overflow-hidden text-white antialiased">
      <div className="cloud-blob orange left-[-80px] top-[90px] h-48 w-48" />
      <div className="cloud-blob blue right-[-40px] top-[240px] h-56 w-56" />
      <div className="cloud-blob slate left-[30%] bottom-[120px] h-64 w-64" />

      <div className="relative mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-12">
        <header className="glass-card fade-rise mb-10 rounded-2xl px-5 py-4 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <a href="#" className="flex items-center gap-2 font-semibold tracking-tight">
              <Cloud className="h-5 w-5 text-awsOrange" />
              <span>To the clouds.</span>
            </a>
            <nav className="flex flex-wrap items-center gap-2 text-sm">
              <a className="rounded-full border border-white/20 px-3 py-1.5 transition hover:border-awsOrange hover:text-awsOrange" href="#projects">
                Projects
              </a>
              <a className="rounded-full border border-white/20 px-3 py-1.5 transition hover:border-awsOrange hover:text-awsOrange" href="#experience">
                Experience
              </a>
              <a className="rounded-full border border-white/20 px-3 py-1.5 transition hover:border-awsOrange hover:text-awsOrange" href="/api/resume" target="_blank" rel="noreferrer">
                Resume
              </a>
              <a className="rounded-full border border-white/20 px-3 py-1.5 transition hover:border-awsOrange hover:text-awsOrange" href="#contact">
                Contact
              </a>
            </nav>
          </div>
        </header>

        <section className="mb-14 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="glass-card fade-rise rounded-3xl p-6 md:p-10">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-awsOrange/40 bg-awsOrange/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-awsOrange">
              <Sparkles className="h-3.5 w-3.5" />
              Open to opportunities
            </p>
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">
              Mark Andrei
              <br />
              <RotatingTagline />
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-neutral-300 md:text-lg">
              {profile?.about ??
                "Entry-level Cloud and DevOps focused developer building practical systems with modern web tools, AWS services, and automation workflows."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm text-neutral-200">
              <span className="rounded-full bg-white/10 px-3 py-1">Philippines</span>
              <span className="rounded-full bg-white/10 px-3 py-1">Cloud and DevOps</span>
              <span className="rounded-full bg-white/10 px-3 py-1">Entry-level</span>
            </div>
          </div>

          <aside className="glass-card floating-card rounded-3xl p-6">
            <p className="text-xs uppercase tracking-[0.18em] text-awsOrange">Current Focus</p>
            <ul className="mt-4 space-y-3 text-sm text-neutral-200">
              <li className="rounded-xl border border-white/10 bg-white/5 p-3">Building reliable web apps with Next.js and PostgreSQL.</li>
              <li className="rounded-xl border border-white/10 bg-white/5 p-3">Practicing CI/CD and deployment workflows.</li>
              <li className="rounded-xl border border-white/10 bg-white/5 p-3">Improving cloud and AI integration skills through projects.</li>
            </ul>
            <a href="#projects" className="mt-5 inline-flex items-center gap-2 text-sm text-awsOrange transition hover:underline">
              Explore projects
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </aside>
        </section>

        <section id="projects" className="mb-14">
          <div className="mb-5 flex items-end justify-between">
            <h2 className="text-xl font-semibold md:text-2xl">Featured Work</h2>
            <span className="text-xs uppercase tracking-[0.18em] text-neutral-400">Animated cards</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((project) => (
              <article key={project.id} className="glass-card group fade-rise rounded-2xl p-5 transition duration-300 hover:-translate-y-1 hover:border-awsOrange/50">
                <p className="text-xs uppercase tracking-[0.18em] text-awsOrange/90">{project.tagline}</p>
                <h3 className="mt-1 text-xl font-semibold text-white transition group-hover:text-awsOrange">{project.name}</h3>
                <p className="mt-2 text-sm text-neutral-300">{project.description}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.14em] text-neutral-400">{project.techStack}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-awsOrange hover:underline">
                      <ExternalLink className="h-4 w-4" />
                      Live
                    </a>
                  )}
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-awsOrange hover:underline">
                      <Github className="h-4 w-4" />
                      Source
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="experience" className="mb-14">
          <h2 className="mb-5 text-xl font-semibold md:text-2xl">Experience Snapshot</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {EXPERIENCE.map((item) => (
              <article key={item.title} className="glass-card fade-rise rounded-2xl p-5 transition duration-300 hover:border-awsOrange/45">
                <p className="text-xs uppercase tracking-[0.18em] text-awsOrange">{item.period}</p>
                <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-neutral-300">{item.company}</p>
                <p className="mt-3 text-sm leading-relaxed text-neutral-200">{item.details}</p>
              </article>
            ))}
          </div>
        </section>

        {gallery.length > 0 && (
          <section className="mb-14">
            <h2 className="mb-5 text-xl font-semibold md:text-2xl">Gallery</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {gallery.map((image) => (
                <div key={image.id} className="glass-card overflow-hidden rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.url} alt={image.title} className="h-44 w-full object-cover transition duration-500 hover:scale-105" />
                </div>
              ))}
            </div>
          </section>
        )}

        <section id="contact" className="glass-card mb-12 rounded-2xl p-6">
          <h2 className="text-xl font-semibold">Contact</h2>
          <p className="mt-2 text-sm text-neutral-300">
            Email:
            {" "}
            <a href="mailto:andreicastillofficial@gmail.com" className="text-awsOrange hover:underline">
              andreicastillofficial@gmail.com
            </a>
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <a href="https://github.com/draiimon" target="_blank" rel="noreferrer" className="rounded-full border border-white/20 px-3 py-1.5 hover:border-awsOrange hover:text-awsOrange">
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/mark-andrei-castillo-1741302a0/" target="_blank" rel="noreferrer" className="rounded-full border border-white/20 px-3 py-1.5 hover:border-awsOrange hover:text-awsOrange">
              LinkedIn
            </a>
            <a href="/api/resume" target="_blank" rel="noreferrer" className="rounded-full border border-white/20 px-3 py-1.5 hover:border-awsOrange hover:text-awsOrange">
              View Resume
            </a>
          </div>
        </section>

        <footer className="pb-12 text-sm text-neutral-400">
          <span className="flex items-center gap-2">
            <Cloud className="h-4 w-4 text-awsOrange" />
            {new Date().getFullYear()} Mark Andrei R. Castillo
          </span>
        </footer>
      </div>

      <Chatbot />
    </main>
  );
}
