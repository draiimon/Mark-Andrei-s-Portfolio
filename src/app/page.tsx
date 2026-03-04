import { prisma } from "@/lib/prisma";
import Chatbot from "@/components/Chatbot";
import { Cloud, ExternalLink, Github } from "lucide-react";

const DEFAULT_PROJECTS = [
  {
    id: 0,
    name: "PanicSense PH",
    tagline: "AI disaster detection platform",
    description: "Real-time disaster monitoring using multilingual sentiment analysis (mBERT, Bi-GRU, LSTM) to prioritize high-distress areas in the Philippines.",
    techStack: "Python · NLP · React · AWS",
    link: "https://panicsenseph.ct.ws/",
    githubUrl: null
  },
  {
    id: -1,
    name: "Oaktree Platform",
    tagline: "Cloud-ready DevOps",
    description: "End-to-end DevOps platform deploying a full-stack app via Docker, Terraform, and AWS ECS. CI/CD with GitHub Actions.",
    techStack: "Docker · Terraform · AWS ECS · GitHub Actions",
    link: null,
    githubUrl: "https://github.com/draiimon"
  },
  {
    id: -2,
    name: "SmartSort",
    tagline: "AI waste segregation",
    description: "YOLOv8-based system to classify waste into biodegradable and non-biodegradable for better waste management.",
    techStack: "Python · YOLOv8 · OpenCV",
    link: null,
    githubUrl: "https://github.com/draiimon/Waste-Detection-Non-Bio-and-Bio-Project-Using-Yolov8"
  }
];

export default async function Home() {
  const profile = await prisma.profile.findFirst();
  const dbProjects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" }
  });
  const gallery = await prisma.galleryImage.findMany({
    orderBy: { createdAt: "desc" },
    take: 6
  });

  const projects = dbProjects.length > 0 ? dbProjects : DEFAULT_PROJECTS;

  return (
    <main className="min-h-screen bg-black text-white antialiased">
      <div className="max-w-2xl mx-auto px-6 py-16 md:py-24">
        {/* Header — brand + nav */}
        <header className="flex items-center justify-between mb-20 md:mb-28">
          <a href="#" className="flex items-center gap-2 text-white font-medium tracking-tight">
            <Cloud className="h-5 w-5 text-awsOrange" />
            <span>To the clouds.</span>
          </a>
          <nav className="flex gap-6 text-sm text-neutral-400">
            <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="hover:text-awsOrange transition-colors">
              Resume
            </a>
            <a href="https://www.linkedin.com/in/mark-andrei-castillo-1741302a0/" target="_blank" rel="noopener noreferrer" className="hover:text-awsOrange transition-colors">
              LinkedIn
            </a>
            <a href="https://github.com/draiimon" target="_blank" rel="noopener noreferrer" className="hover:text-awsOrange transition-colors">
              Github
            </a>
          </nav>
        </header>

        {/* Hero — brand: To the clouds. */}
        <section className="mb-20 md:mb-32">
          <p className="text-sm font-medium text-awsOrange uppercase tracking-[0.2em] mb-4">
            To the clouds.
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1]">
            Mark Andrei
            <br />
            <span className="text-awsOrange">builds in the cloud.</span>
          </h1>
          <p className="mt-6 text-lg text-neutral-400 max-w-lg">
            {profile?.about ??
              "Cloud & DevOps. I ship systems that scale and run reliably—from AWS to AI."}
          </p>
          <p className="mt-4 text-sm text-neutral-500">
            Available for work · Philippines
          </p>
        </section>

        {/* Development Stuff. */}
        <section id="projects" className="mb-20 md:mb-32">
          <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-8">
            Development stuff.
          </h2>
          <div className="space-y-10">
            {projects.map((project) => (
              <article key={project.id} className="group">
                <h3 className="text-xl font-semibold text-white group-hover:text-awsOrange transition-colors">
                  {project.name}
                </h3>
                <p className="text-sm text-neutral-500 mt-1">
                  {project.techStack}
                </p>
                <p className="mt-2 text-neutral-400 text-sm leading-relaxed">
                  {project.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-4">
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-awsOrange hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Live Demo
                    </a>
                  )}
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm text-awsOrange hover:underline"
                    >
                      <Github className="h-3.5 w-3.5" />
                      Read More
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Gallery — only if there are images */}
        {gallery.length > 0 && (
          <section className="mb-20 md:mb-32">
            <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-8">
              Gallery.
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {gallery.map((image) => (
                <div key={image.id} className="aspect-[4/3] rounded overflow-hidden bg-neutral-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Say hi — portfolio standard */}
        <section className="mb-20 md:mb-24">
          <p className="text-sm text-neutral-500">
            Say hi —{" "}
            <a href="mailto:andreicastillofficial@gmail.com" className="text-awsOrange hover:underline">
              andreicastillofficial@gmail.com
            </a>
          </p>
        </section>

        {/* Footer — To the clouds. branding (no edit link in UI; use /edit to manage) */}
        <footer className="pt-8 border-t border-neutral-800 text-sm text-neutral-500 flex flex-wrap items-center justify-between gap-4">
          <span className="flex items-center gap-1.5">
            <Cloud className="h-4 w-4 text-awsOrange/70" />
            To the clouds.
          </span>
          <span>© {new Date().getFullYear()} Mark Andrei R. Castillo.</span>
          <span className="text-neutral-600">That&apos;s all for now.</span>
        </footer>
      </div>

      <Chatbot />
    </main>
  );
}
