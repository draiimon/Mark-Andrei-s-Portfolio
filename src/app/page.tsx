import { prisma } from "@/lib/prisma";
import { motion } from "framer-motion";
import Link from "next/link";
import Chatbot from "@/components/Chatbot";

export default async function Home() {
  const profile = await prisma.profile.findFirst();
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" }
  });
  const gallery = await prisma.galleryImage.findMany({
    orderBy: { createdAt: "desc" },
    take: 6
  });

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,153,0,0.18),_transparent_55%)]" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10 space-y-20">
        <header className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-awsOrange to-awsGray shadow-glow flex items-center justify-center text-xs font-semibold">
              MC
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-awsOrange">
                Cloud DevOps | AI
              </p>
              <p className="text-sm text-neutral-400">
                {profile?.fullName ?? "Mark Andrei R. Castillo"}
              </p>
            </div>
          </motion.div>

          <nav className="flex gap-6 text-xs text-neutral-300">
            <a href="#projects" className="hover:text-awsOrange transition-colors">
              Projects
            </a>
            <a href="#gallery" className="hover:text-awsOrange transition-colors">
              Gallery
            </a>
            <a href="#about" className="hover:text-awsOrange transition-colors">
              About
            </a>
          </nav>
        </header>

        <section className="grid md:grid-cols-[1.3fr,1fr] gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-awsGray/60 bg-awsGray/40 px-3 py-1 text-xs text-neutral-200 shadow-lg shadow-black/40">
              <span className="h-1.5 w-1.5 rounded-full bg-awsOrange animate-pulse" />
              Open to Cloud / DevOps & AI roles
            </p>

            <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
              Building <span className="text-awsOrange">cloud-native</span> systems
              <br />
              with DevOps and AI.
            </h1>

            <p className="text-sm md:text-base text-neutral-300 max-w-xl">
              {profile?.objective ??
                "Self-driven Computer Science graduate with hands-on experience in AWS, Docker, CI/CD, and AI/ML, focused on shipping reliable, scalable platforms."}
            </p>

            <div className="flex flex-wrap gap-3 text-xs">
              {["AWS", "Docker", "CI/CD", "Terraform", "Python", "Next.js", "YOLOv8", "MediaPipe"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-awsGray bg-awsGray/40 px-3 py-1 text-neutral-200 hover:border-awsOrange/80 hover:text-awsOrange transition-colors"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="mailto:andreicastillofficial@gmail.com"
                className="inline-flex items-center gap-2 rounded-md bg-awsOrange px-4 py-2 text-sm font-medium text-awsBlack shadow-glow hover:brightness-110 transition-all"
              >
                Contact Me
              </Link>
              <Link
                href="https://github.com/draiimon"
                target="_blank"
                className="inline-flex items-center gap-2 rounded-md border border-awsGray px-4 py-2 text-sm text-neutral-200 hover:border-awsOrange hover:text-awsOrange transition-colors"
              >
                GitHub
              </Link>
            </div>

            <p className="text-xs text-neutral-500 pt-2">
              Currently exploring: cloud-native DevOps, observability, and AI-driven automation.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="relative rounded-2xl border border-awsGray bg-gradient-to-b from-awsGray/70 to-awsBlack/80 p-5 shadow-2xl shadow-black/60"
          >
            <div className="flex justify-between items-center mb-4 text-xs text-neutral-300">
              <span className="font-medium text-awsOrange">Cloud Timeline</span>
              <span className="text-neutral-500">2021 – 2025</span>
            </div>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span>AWS Cloud DevOps Intern – Oaktree Innovations</span>
                <span className="text-neutral-500">2025</span>
              </div>
              <p className="text-neutral-400">
                Deployed and operated full-stack apps with ECS, Docker, GitHub Actions and Terraform.
              </p>

              <div className="flex justify-between pt-2">
                <span>PanicSense PH – AI Disaster Intel</span>
              </div>
              <p className="text-neutral-400">
                Real-time sentiment and emotion analysis pipeline for prioritizing high-distress areas.
              </p>

              <div className="grid grid-cols-3 gap-2 pt-3 text-[11px]">
                <span className="rounded-md bg-awsBlack/80 border border-awsGray/80 px-2 py-2 text-neutral-300">
                  <span className="block text-[9px] text-neutral-500">Cloud</span>
                  AWS · ECS · S3 · Lambda
                </span>
                <span className="rounded-md bg-awsBlack/80 border border-awsGray/80 px-2 py-2 text-neutral-300">
                  <span className="block text-[9px] text-neutral-500">DevOps</span>
                  Docker · GitHub Actions
                </span>
                <span className="rounded-md bg-awsBlack/80 border border-awsGray/80 px-2 py-2 text-neutral-300">
                  <span className="block text-[9px] text-neutral-500">AI/ML</span>
                  YOLOv8 · NLP · LLMs
                </span>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="projects" className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Selected projects</h2>
            <span className="text-xs text-neutral-500">
              Cloud, DevOps, AI/ML, and accessibility
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {projects.map((project) => (
              <motion.article
                key={project.id}
                whileHover={{ y: -4 }}
                className="group rounded-xl border border-awsGray bg-awsGray/40 p-4 text-sm cursor-default transition-all hover:border-awsOrange/80 hover:shadow-glow"
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="font-medium group-hover:text-awsOrange transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-xs text-neutral-400">{project.tagline}</p>
                  </div>
                  {project.link && (
                    <Link
                      href={project.link}
                      target="_blank"
                      className="text-[11px] text-awsOrange hover:underline"
                    >
                      View
                    </Link>
                  )}
                </div>
                <p className="mt-2 text-neutral-300 text-xs">{project.description}</p>
                <p className="mt-3 text-[11px] text-neutral-400">
                  {project.techStack}
                </p>
              </motion.article>
            ))}
          </div>
        </section>

        <section id="gallery" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Gallery</h2>
            <span className="text-xs text-neutral-500">
              Snapshots from projects, events, and talks
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {gallery.map((image) => (
              <motion.div
                key={image.id}
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden rounded-lg border border-awsGray/80 bg-awsGray/40 aspect-[4/3] group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute bottom-2 left-2 text-[11px] text-neutral-200">
                  {image.title}
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="about" className="space-y-4 pb-10">
          <h2 className="text-lg font-semibold">About & leadership</h2>
          <div className="grid md:grid-cols-2 gap-8 text-sm text-neutral-300">
            <div className="space-y-3">
              <p>
                {profile?.about ??
                  "I&apos;m Mark Andrei, a Computer Science graduate with strong experience in DevOps, AI/ML, and full-stack development. I enjoy building cloud-native systems, automating workflows, and turning ideas into reliable products."}
              </p>
              <p>
                I&apos;ve worked across{" "}
                <span className="text-awsOrange">
                  AWS, Docker, GitHub Actions, Terraform, YOLOv8, MediaPipe, and modern NLP
                </span>
                , and I love combining infrastructure and intelligence to solve real problems.
              </p>
            </div>
            <div className="space-y-2 text-xs text-neutral-400">
              <p className="text-neutral-300 font-medium">
                Leadership highlights
              </p>
              <ul className="space-y-1 list-disc list-inside">
                <li>Microsoft Student Community – TSMP & Communications, LORSO Rep</li>
                <li>AWS Cloud Club – Vice-Chief Relations Officer</li>
                <li>ICONS – Treasurer, Public Relations Officer, Communications Head</li>
                <li>League of Recognized Student Organizations – Assistant Secretary & PM</li>
                <li>UPHSD SHS Alumni Association – Public Information Officer</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      <Chatbot />
    </main>
  );
}

