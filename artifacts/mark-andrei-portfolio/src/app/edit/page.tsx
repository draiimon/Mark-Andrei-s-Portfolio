import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpRight, Eye, EyeOff, ExternalLink, GripVertical, LogOut } from "lucide-react";
import SolarAura from "@/components/SolarAura";
import "./admin-dashboard.css";

const EDIT_SOLAR_INTRO_MOBILE_DURATION_MS = 3000;
const EDIT_SOLAR_INTRO_DESKTOP_DURATION_MS = 3000;
const EDIT_SOLAR_INTRO_MOBILE_FADE_MS = 1100;
const EDIT_SOLAR_INTRO_DESKTOP_FADE_MS = 420;

type Profile = {
  id: number;
  fullName: string;
  headline: string;
  location: string;
  email: string;
  phone: string;
  github: string;
  linkedinUrl: string | null;
  facebookUrl: string | null;
  discordUrl: string | null;
  instagramUrl: string | null;
  spotifyUrl: string | null;
  musicUrl: string | null;
  cloudinaryCloudName: string | null;
  cloudinaryUploadPreset: string | null;
  objective: string;
  about: string;
  skills: string;
  viewCount: number;
  availability: string | null;
  brandName: string | null;
  heroTagline: string | null;
  tabTitle: string | null;
  faviconUrl: string | null;
  socialImageUrl: string | null;
  featuredLabel: string | null;
  experienceTitle: string | null;
  leadershipTitle: string | null;
  achievementsTitle: string | null;
  contactLabel: string | null;
  footerCenterText: string | null;
  footerRightText: string | null;
  aiBehaviorPrompt: string | null;
  updatedAt?: string;
} | null;

type Project = {
  id: number;
  name: string;
  tagline: string;
  description: string;
  techStack: string;
  link: string | null;
  githubUrl: string | null;
  highlight: boolean;
};

type Experience = {
  id: number;
  role: string;
  company: string;
  period: string;
  summary: string;
  sortOrder: number;
};

type Leadership = {
  id: number;
  org: string;
  role: string;
  period: string;
  sortOrder: number;
};

type Achievement = {
  id: number;
  text: string;
  sortOrder: number;
};

type Tagline = {
  id: number;
  text: string;
  sortOrder: number;
};

type ApiError = {
  error?: string;
};

type SortableSection = "experience" | "leadership" | "achievements" | "taglines";
type EditorSection = "profile" | "projects" | "experience" | "leadership" | "taglines" | "achievements" | "resume" | "site-media";
type DragItem = {
  section: SortableSection;
  id: number;
} | null;

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, credentials: "include" });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = (await res.json()) as ApiError;
      if (data?.error) message = data.error;
    } catch {
      // ignore parse failure
    }
    throw new Error(message);
  }
  return (await res.json()) as T;
}

function PortfolioSurface({
  children,
  backgroundBurstCycle = 0,
  backgroundSparkIntensity = 0,
}: {
  children: ReactNode;
  backgroundBurstCycle?: number;
  backgroundSparkIntensity?: number;
}) {
  return (
    <>
      <video
        className="site-video-background"
        src="/assets/solar-eclipse-background-pingpong.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        tabIndex={-1}
        aria-hidden="true"
      />
      <div className="site-video-shade" aria-hidden="true" />
      <div className="site-content-layer">
        <div className="cloud-light one" />
        <div className="cloud-light two" />
        <div className="cloud-light three" />
        <BackgroundSparkBurst
          burstCycle={backgroundBurstCycle}
          intensity={backgroundSparkIntensity}
        />
        {children}
      </div>
    </>
  );
}

type AmbientParticle = {
  x: number;
  y: number;
  settleX: number;
  settleY: number;
  spreadDuration: number;
  drift: number;
  driftSpeed: number;
  phase: number;
  size: number;
  trail: number;
  life: number;
  brightness: number;
};

function BackgroundSparkBurst({
  burstCycle,
  intensity = 0,
}: {
  burstCycle: number;
  intensity?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<AmbientParticle[]>([]);
  const viewportRef = useRef({ width: 0, height: 0, pixelRatio: 1 });
  const wakeRendererRef = useRef<(() => void) | null>(null);
  const rendererRunningRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const lastBurstCycleRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const mobileQuery = window.matchMedia("(max-width: 760px)");
    let isMobile = mobileQuery.matches;
    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      isMobile = mobileQuery.matches;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 1.5);
      viewportRef.current = { width, height, pixelRatio };
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    let lastTimestamp = performance.now();
    let lastDrawTimestamp = 0;
    const draw = (timestamp: number) => {
      const elapsed = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      // Keep the phone compositor from painting a full-screen glow field at
      // 60fps. The burst remains animated, but the canvas only draws about
      // 30fps on small touch devices.
      if (isMobile && timestamp - lastDrawTimestamp < 32) {
        animationFrameRef.current = window.requestAnimationFrame(draw);
        return;
      }
      lastDrawTimestamp = timestamp;
      const deltaSeconds = Math.min(0.05, Math.max(0.001, elapsed / 1000));
      const { width, height } = viewportRef.current;
      context.clearRect(0, 0, width, height);
      context.globalCompositeOperation = "lighter";

      const activeParticles: AmbientParticle[] = [];
      for (const particle of particlesRef.current) {
        particle.life += deltaSeconds;
        activeParticles.push(particle);

        const spreadTime = Math.max(0, particle.life);
        const spreadProgress = Math.min(1, spreadTime / particle.spreadDuration);
        const spreadEase = 1 - Math.pow(1 - spreadProgress, 3);
        const windTime = spreadTime * particle.driftSpeed;
        const settledX = particle.x + (particle.settleX - particle.x) * spreadEase;
        const settledY = particle.y + (particle.settleY - particle.y) * spreadEase;
        const x = Math.max(
          -16,
          Math.min(
            width + 16,
            settledX + Math.sin(windTime + particle.phase) * particle.drift
          )
        );
        const y = Math.max(
          -16,
          Math.min(
            height + 16,
            settledY +
              Math.cos(windTime * 0.73 + particle.phase * 1.7) *
                particle.drift *
                0.58
          )
        );
        const shimmer =
          0.18 +
          0.82 *
            Math.pow(
              Math.max(0, Math.sin(particle.life * (2.2 + particle.driftSpeed) + particle.phase)),
              5
            );
        const alpha = shimmer * particle.brightness;
        const tailX = x - Math.sin(windTime + particle.phase) * particle.trail;
        const tailY = y - Math.cos(windTime * 0.73 + particle.phase * 1.7) * particle.trail;

        context.lineWidth = particle.size;
        context.strokeStyle = `rgba(255, 153, 32, ${alpha * 0.72})`;
        context.beginPath();
        context.moveTo(tailX, tailY);
        context.lineTo(x, y);
        context.stroke();

        context.fillStyle = `rgba(255, 248, 211, ${Math.min(1, alpha * particle.brightness)})`;
        context.beginPath();
        context.arc(x, y, particle.size * 0.75, 0, Math.PI * 2);
        context.fill();
      }

      particlesRef.current = activeParticles;
      context.globalCompositeOperation = "source-over";
      if (activeParticles.length > 0) {
        animationFrameRef.current = window.requestAnimationFrame(draw);
      } else {
        rendererRunningRef.current = false;
      }
    };

    wakeRendererRef.current = () => {
      if (rendererRunningRef.current) return;
      rendererRunningRef.current = true;
      lastTimestamp = performance.now();
      animationFrameRef.current = window.requestAnimationFrame(draw);
    };

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
      wakeRendererRef.current = null;
      rendererRunningRef.current = false;
      particlesRef.current = [];
      window.removeEventListener("resize", resize);
      context.clearRect(0, 0, viewportRef.current.width, viewportRef.current.height);
    };
  }, []);

  useEffect(() => {
    if (burstCycle <= 0 || burstCycle <= lastBurstCycleRef.current) return;
    lastBurstCycleRef.current = burstCycle;

    const { width, height } = viewportRef.current;
    const isInitialFill = particlesRef.current.length === 0;
    const isMobile = width <= 760;
    const particleCount = isInitialFill
      ? isMobile
        ? Math.round(150 + Math.min(1, intensity) * 40)
        : Math.round(1100 + Math.min(1, intensity) * 320)
      : isMobile
        ? Math.round(44 + Math.min(1, intensity) * 70)
        : Math.round(180 + Math.min(1, intensity) * 280);
    const seed = (burstCycle + 1) * 7919;
    const seeded = (value: number) => {
      const sample = Math.sin(value * 12.9898 + seed) * 43758.5453;
      return sample - Math.floor(sample);
    };
    const solarMark = document.querySelector<HTMLElement>(".edit-login-mark");
    const solarBounds = solarMark?.getBoundingClientRect();
    const sourceX = solarBounds ? solarBounds.left + solarBounds.width / 2 : width * 0.6;
    const sourceY = solarBounds ? solarBounds.top + solarBounds.height / 2 : height * 0.36;
    const newParticles: AmbientParticle[] = Array.from(
      { length: particleCount },
      (_, index) => {
        return {
          // Each batch spreads once from the eclipse to a random full-viewport
          // settle point, then remains alive with only local air drift.
          x: sourceX + (seeded(index + 30) - 0.5) * width * 0.04,
          y: sourceY + (seeded(index + 31) - 0.5) * height * 0.04,
          settleX: seeded(index + 40) * width,
          settleY: seeded(index + 50) * height,
           spreadDuration: isMobile
             ? 1.35 + seeded(index + 60) * 0.9
             : 2.4 + seeded(index + 60) * 1.4,
           drift: isMobile
             ? 2.5 + seeded(index + 80) * 6.5
             : 2.5 + seeded(index + 80) * 8.5,
          driftSpeed: 0.18 + seeded(index + 90) * 0.36,
          phase: seeded(index + 100) * Math.PI * 2,
           size: isMobile
             ? 0.8 + seeded(index + 110) * 1.35 + Math.min(1, intensity) * 0.45
             : 0.45 + seeded(index + 110) * 1.25 + Math.min(1, intensity) * 0.3,
           trail: isMobile
             ? 0.6 + seeded(index + 120) * 1.4
             : 0.3 + seeded(index + 120) * 1.2,
          life: -seeded(index + 130) * 0.18,
           brightness: isMobile
             ? 0.88 + Math.min(1, intensity) * 0.18 + seeded(index + 140) * 0.2
             : 0.62 + Math.min(1, intensity) * 0.3 + seeded(index + 140) * 0.2,
        };
      }
    );

    const maxParticles = isMobile ? 420 : 2200;
    particlesRef.current = [
      ...particlesRef.current,
      ...newParticles,
    ].slice(-maxParticles);
    wakeRendererRef.current?.();
  }, [burstCycle, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="edit-background-spark-canvas"
      aria-hidden="true"
    />
  );
}

export default function EditPage() {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [solarIntroActive, setSolarIntroActive] = useState(true);
  const [solarIntroFading, setSolarIntroFading] = useState(false);
  const [loginAuraMomentum, setLoginAuraMomentum] = useState(0);
  const [loginAuraClickTick, setLoginAuraClickTick] = useState(0);
  const [dragItem, setDragItem] = useState<DragItem>(null);
  const [dragOverItem, setDragOverItem] = useState<DragItem>(null);
  const [activeEditorSection, setActiveEditorSection] = useState<EditorSection>("profile");

  useEffect(() => {
    if (loginAuraMomentum <= 0) return;

    const timer = window.setTimeout(() => {
      setLoginAuraMomentum((momentum) => Math.max(0, momentum - 1));
    }, 220);

    return () => window.clearTimeout(timer);
  }, [loginAuraMomentum, loginAuraClickTick]);

  const [profile, setProfile] = useState<Profile>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [leadership, setLeadership] = useState<Leadership[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [taglines, setTaglines] = useState<Tagline[]>([]);

  const [profileForm, setProfileForm] = useState({
    fullName: "",
    headline: "",
    location: "",
    email: "",
    phone: "",
    github: "",
    linkedinUrl: "",
    facebookUrl: "",
    discordUrl: "",
    instagramUrl: "",
    spotifyUrl: "",
    musicUrl: "",
    cloudinaryCloudName: "",
    cloudinaryUploadPreset: "",
    objective: "",
    about: "",
    skills: "",
    viewCount: "0",
    availability: "",
    brandName: "",
    heroTagline: "",
    tabTitle: "",
    faviconUrl: "",
    socialImageUrl: "",
    featuredLabel: "",
    experienceTitle: "",
    leadershipTitle: "",
    achievementsTitle: "",
    contactLabel: "",
    footerCenterText: "",
    footerRightText: "",
    aiBehaviorPrompt: ""
  });

  const [newProject, setNewProject] = useState({
    name: "",
    tagline: "",
    description: "",
    techStack: "",
    link: "",
    githubUrl: "",
    highlight: false
  });
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editProjectForm, setEditProjectForm] = useState({
    name: "",
    tagline: "",
    description: "",
    techStack: "",
    link: "",
    githubUrl: "",
    highlight: false
  });

  const [newExperience, setNewExperience] = useState({ role: "", company: "", period: "", summary: "" });
  const [editingExperienceId, setEditingExperienceId] = useState<number | null>(null);
  const [editExperienceForm, setEditExperienceForm] = useState({ role: "", company: "", period: "", summary: "" });
  const [newLeadership, setNewLeadership] = useState({ org: "", role: "", period: "" });
  const [editingLeadershipId, setEditingLeadershipId] = useState<number | null>(null);
  const [editLeadershipForm, setEditLeadershipForm] = useState({ org: "", role: "", period: "" });
  const [newAchievement, setNewAchievement] = useState({ text: "" });
  const [editingAchievementId, setEditingAchievementId] = useState<number | null>(null);
  const [editAchievementText, setEditAchievementText] = useState("");
  const [newTagline, setNewTagline] = useState({ text: "" });

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [socialFile, setSocialFile] = useState<File | null>(null);

  useEffect(() => {
    async function bootstrapAuth() {
      const res = await fetch("/api/edit/me", { credentials: "include" }).catch(() => null);
      if (res?.ok) {
        setAuth(true);
        await loadData();
        return;
      }
      setAuth(false);
    }

    void bootstrapAuth();
  }, []);

  useEffect(() => {
    if (auth !== false) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSolarIntroActive(false);
      return;
    }

    const isMobileViewport = window.matchMedia("(max-width: 760px)").matches;
    const holdDuration = isMobileViewport
      ? EDIT_SOLAR_INTRO_MOBILE_DURATION_MS
      : EDIT_SOLAR_INTRO_DESKTOP_DURATION_MS;
    const fadeDuration = isMobileViewport
      ? EDIT_SOLAR_INTRO_MOBILE_FADE_MS
      : EDIT_SOLAR_INTRO_DESKTOP_FADE_MS;
    const fadeTimer = window.setTimeout(() => setSolarIntroFading(true), holdDuration);
    const hideTimer = window.setTimeout(
      () => setSolarIntroActive(false),
      holdDuration + fadeDuration,
    );
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [auth]);

  async function loadData() {
    try {
      const [p, proj, exp, lead, ach, tgs] = await Promise.all([
        apiJson<Profile>("/api/edit/profile"),
        apiJson<Project[]>("/api/edit/projects"),
        apiJson<Experience[]>("/api/edit/experience"),
        apiJson<Leadership[]>("/api/edit/leadership"),
        apiJson<Achievement[]>("/api/edit/achievements"),
        apiJson<Tagline[]>("/api/edit/taglines")
      ]);
      setProfile(p);
      setProjects(proj || []);
      setExperience(exp || []);
      setLeadership(lead || []);
      setAchievements(ach || []);
      setTaglines(tgs || []);
      if (p) {
        setProfileForm({
          fullName: p.fullName || "",
          headline: p.headline || "",
          location: p.location || "",
          email: p.email || "",
          phone: p.phone || "",
          github: p.github || "",
          linkedinUrl: p.linkedinUrl || "",
          facebookUrl: p.facebookUrl || "",
          discordUrl: p.discordUrl || "",
          instagramUrl: p.instagramUrl || "",
          spotifyUrl: p.spotifyUrl || "",
          musicUrl: p.musicUrl || "",
          cloudinaryCloudName: p.cloudinaryCloudName || "",
          cloudinaryUploadPreset: p.cloudinaryUploadPreset || "",
          objective: p.objective || "",
          about: p.about || "",
          skills: p.skills || "",
          viewCount: String(p.viewCount ?? 0),
          availability: p.availability || "",
          brandName: p.brandName || "",
          heroTagline: p.heroTagline || "",
          tabTitle: p.tabTitle || "",
          faviconUrl: p.faviconUrl || "",
          socialImageUrl: p.socialImageUrl || "",
          featuredLabel: p.featuredLabel || "",
          experienceTitle: p.experienceTitle || "",
          leadershipTitle: p.leadershipTitle || "",
          achievementsTitle: p.achievementsTitle || "",
          contactLabel: p.contactLabel || "",
          footerCenterText: p.footerCenterText || "",
          footerRightText: p.footerRightText || "",
          aiBehaviorPrompt: p.aiBehaviorPrompt || ""
        });
      }
      setError("");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to load data";
      if (message.toLowerCase().includes("unauthorized")) {
        setAuth(false);
        setError("Session expired. Please sign in again.");
        return;
      }
      setError(message);
    }
  }

  async function withSave(task: () => Promise<void>, message: string) {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await task();
      setSuccess(message);
      await loadData();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Save failed";
      if (message.toLowerCase().includes("unauthorized")) {
        setAuth(false);
        setError("Session expired. Please sign in again.");
      } else {
        setError(message);
      }
    } finally {
      setSaving(false);
    }
  }

  async function uploadSiteMedia(key: "favicon" | "social", file: File) {
    const formData = new FormData();
    formData.append("key", key);
    formData.append("file", file);
    const res = await fetch("/api/edit/site-media", {
      method: "POST",
      body: formData,
      credentials: "include"
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as ApiError;
      throw new Error(data.error || `Upload failed (${res.status})`);
    }
    const data = (await res.json()) as { url?: string };
    return data.url || "";
  }

  function applyFaviconNow(href: string) {
    if (!href) return;
    const rels = ["icon", "shortcut icon", "apple-touch-icon"];
    for (const rel of rels) {
      let link = document.querySelector<HTMLLinkElement>(`link[rel='${rel}']`);
      if (!link) {
        link = document.createElement("link");
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
    }
  }

  function startEditProject(p: Project) {
    setEditingProjectId(p.id);
    setEditProjectForm({
      name: p.name,
      tagline: p.tagline,
      description: p.description,
      techStack: p.techStack,
      link: p.link || "",
      githubUrl: p.githubUrl || "",
      highlight: p.highlight
    });
  }

  function startEditExperience(item: Experience) {
    setEditingExperienceId(item.id);
    setEditExperienceForm({
      role: item.role,
      company: item.company,
      period: item.period,
      summary: item.summary
    });
  }

  function startEditLeadership(item: Leadership) {
    setEditingLeadershipId(item.id);
    setEditLeadershipForm({
      org: item.org,
      role: item.role,
      period: item.period
    });
  }

  function startEditAchievement(item: Achievement) {
    setEditingAchievementId(item.id);
    setEditAchievementText(item.text);
  }

  function reorderListById<T extends { id: number }>(list: T[], fromId: number, toId: number) {
    const fromIndex = list.findIndex((item) => item.id === fromId);
    const toIndex = list.findIndex((item) => item.id === toId);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return list;
    const next = [...list];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    return next;
  }

  async function persistOrder(section: SortableSection, idsInOrder: number[]) {
    await Promise.all(
      idsInOrder.map((id, index) =>
        apiJson(`/api/edit/${section}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sortOrder: index + 1 })
        })
      )
    );
  }

  function handleDrop(section: SortableSection, targetId: number) {
    if (!dragItem || dragItem.section !== section || dragItem.id === targetId) {
      setDragItem(null);
      setDragOverItem(null);
      return;
    }

    let reorderedIds: number[] = [];

    if (section === "experience") {
      const reordered = reorderListById(experience, dragItem.id, targetId);
      setExperience(reordered);
      reorderedIds = reordered.map((item) => item.id);
    } else if (section === "leadership") {
      const reordered = reorderListById(leadership, dragItem.id, targetId);
      setLeadership(reordered);
      reorderedIds = reordered.map((item) => item.id);
    } else if (section === "achievements") {
      const reordered = reorderListById(achievements, dragItem.id, targetId);
      setAchievements(reordered);
      reorderedIds = reordered.map((item) => item.id);
    } else {
      const reordered = reorderListById(taglines, dragItem.id, targetId);
      setTaglines(reordered);
      reorderedIds = reordered.map((item) => item.id);
    }

    setDragItem(null);
    setDragOverItem(null);

    void withSave(async () => {
      await persistOrder(section, reorderedIds);
    }, `${section.charAt(0).toUpperCase() + section.slice(1)} order updated.`);
  }

  function idsForSection(section: SortableSection) {
    if (section === "experience") return experience.map((v) => v.id);
    if (section === "leadership") return leadership.map((v) => v.id);
    if (section === "achievements") return achievements.map((v) => v.id);
    return taglines.map((v) => v.id);
  }

  function dragShiftClass(section: SortableSection, itemId: number) {
    if (!dragItem || !dragOverItem) return "";
    if (dragItem.section !== section || dragOverItem.section !== section) return "";
    if (dragItem.id === itemId) return "drag-active";

    const ids = idsForSection(section);
    const draggedIndex = ids.indexOf(dragItem.id);
    const targetIndex = ids.indexOf(dragOverItem.id);
    const itemIndex = ids.indexOf(itemId);

    if (draggedIndex === -1 || targetIndex === -1 || itemIndex === -1) return "";

    if (draggedIndex < targetIndex && itemIndex > draggedIndex && itemIndex <= targetIndex) {
      return "drag-shift-up";
    }
    if (draggedIndex > targetIndex && itemIndex >= targetIndex && itemIndex < draggedIndex) {
      return "drag-shift-down";
    }
    return "";
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (loggingIn) return;
    setLoginError("");
    setLoggingIn(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include"
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as ApiError;
        setLoginError(data.error || "Invalid credentials");
        return;
      }
      const me = await fetch("/api/edit/me", { credentials: "include" });
      if (!me.ok) {
        setLoginError("Login session was not created. Try again.");
        return;
      }
      setAuth(true);
      await loadData();
    } catch {
      setLoginError("Login failed");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" }).catch(() => {});
    setAuth(false);
    setUsername("");
    setPassword("");
    setShowPassword(false);
    setLoginError("");
  }

  if (auth !== true) {
    const starIntensity = Math.min(1, loginAuraClickTick / 40);
    const compactLogin =
      typeof window !== "undefined" && window.matchMedia("(max-width: 760px)").matches;
    const mobileSparkActive = compactLogin ? loginAuraClickTick > 0 : loginAuraClickTick >= 10;
    const sparkCount =
      mobileSparkActive
        ? Math.min(
            compactLogin ? 48 : 180,
            compactLogin
              ? 10 + loginAuraMomentum * 2 + loginAuraClickTick
              : 12 + loginAuraMomentum * 4 + loginAuraClickTick * 2
          )
        : 0;
    const backgroundBurstCycle = compactLogin
      ? loginAuraClickTick
      : Math.floor(loginAuraClickTick / 10);

    return (
      <main className={`edit-page site-shell min-h-screen text-white ${solarIntroActive ? "solar-intro-playing" : ""}`}>
        <PortfolioSurface
          backgroundBurstCycle={backgroundBurstCycle}
          backgroundSparkIntensity={starIntensity}
        >
          {solarIntroActive && (
             <div className={`edit-solar-reveal ${solarIntroFading ? "edit-solar-reveal-fading" : ""}`} role="status" aria-live="polite">
              <div className="edit-solar-reveal-visual" aria-hidden="true">
                <span className="edit-solar-halo edit-solar-halo-one" />
                <span className="edit-solar-halo edit-solar-halo-two" />
                <SolarAura className="edit-solar-aura" state="idle" showOrbits={false} />
              </div>
              <button type="button" className="edit-solar-skip" onClick={() => setSolarIntroActive(false)}>
                Portfolio/Edit
              </button>
            </div>
          )}

          <div
            className={`edit-login-stage mx-auto flex min-h-screen max-w-6xl items-center px-4 py-12 sm:px-6 lg:px-8 ${solarIntroActive ? "edit-login-stage-muted" : ""}`}
            aria-hidden={solarIntroActive}
          >
            <div className="edit-login-copy">
              <a href="/" className="edit-login-back">
                Return to public profile
              </a>
              <p className="edit-login-identity">Mark Andrei / Portfolio</p>
              <h1 className="edit-login-display music-reactive-hero">
                Shape the story
                <span>behind the work.</span>
              </h1>
            </div>

            <div className="edit-login-panel">
              <div className="edit-login-shell w-full fade-rise">
                <div className="relative z-10">
                  <div className="edit-login-heading">
                    <button
                      type="button"
                      className={`edit-login-mark ${loginAuraMomentum > 0 ? "has-momentum" : ""}`}
                      onClick={() => {
                        setLoginAuraMomentum((momentum) => Math.min(14, momentum + 2));
                        setLoginAuraClickTick((tick) => tick + 1);
                      }}
                      aria-label="Speed up eclipse"
                      title="Click repeatedly to speed up the eclipse; it gradually slows down"
                    >
                      <span
                        className={`edit-login-aura-bounce ${
                          loginAuraClickTick > 0
                            ? loginAuraClickTick % 2 === 0
                              ? "edit-login-click-pulse-a"
                              : "edit-login-click-pulse-b"
                            : ""
                        }`}
                        aria-hidden="true"
                      >
                        <SolarAura
                        small
                        state="idle"
                        className="edit-login-aura"
                        showOrbits={false}
                        momentum={loginAuraMomentum}
                        />
                      </span>
                      <span
                        className={`edit-login-sparks ${
                          sparkCount > 0
                            ? loginAuraClickTick % 2 === 0
                              ? "edit-login-spark-burst-a"
                              : "edit-login-spark-burst-b"
                            : ""
                        }`}
                        aria-hidden="true"
                      >
                        {Array.from({ length: sparkCount }, (_, index) => {
                          const angleJitter = (index * 17) % 13 - 6;
                          const angle = index * (360 / Math.max(1, sparkCount)) + angleJitter;
                          const distance = 2.55 + ((index * 7) % 13) * 0.12 + loginAuraMomentum * 0.06;
                          const duration = 430 + ((index * 11) % 7) * 38 - loginAuraMomentum * 6;
                          const length = 0.58 + ((index * 13) % 7) * 0.11;
                          return (
                            <span
                              key={`eclipse-spark-${index}`}
                              style={
                                {
                                  "--spark-angle": `${angle}deg`,
                                  "--spark-delay": `${(index * 13) % 120}ms`,
                                  "--spark-distance": `${distance}rem`,
                                  "--spark-duration": `${duration}ms`,
                                  "--spark-length": `${length}rem`,
                                } as React.CSSProperties
                              }
                            />
                          );
                        })}
                      </span>
                    </button>
                    <div className="edit-login-heading-copy hero-copy-block">
                      <p className="edit-login-title music-reactive-copy">Sign in to edit portfolio</p>
                    </div>
                  </div>

                  <form onSubmit={handleLogin} className="edit-login-form">
                    <label className="edit-login-label">
                      <span>Username</span>
                      <div className="field-shell edit-login-field">
                        <input
                          type="text"
                          placeholder="draiimon"
                          autoComplete="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="edit-login-input"
                        />
                      </div>
                    </label>

                    <label className="edit-login-label">
                      <span>Password</span>
                      <div className="field-shell edit-login-field edit-login-password-field">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="edit-login-input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="edit-login-password-toggle"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </label>

                    {loginError && <p className="edit-login-error" role="alert">{loginError}</p>}
                    <button type="submit" className="edit-login-submit" disabled={loggingIn} aria-busy={loggingIn}>
                      <span>{loggingIn ? "Checking access…" : "Enter Edit Mode"}</span>
                      <ArrowUpRight className="edit-login-submit-icon" aria-hidden="true" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </PortfolioSurface>
      </main>
    );
  }

  const totalContentItems =
    projects.length + experience.length + leadership.length + achievements.length + taglines.length;

  return (
    <main className="edit-page edit-control-center site-shell min-h-screen text-white">
      <PortfolioSurface>
        <div className="edit-admin-shell mx-auto px-4 sm:px-6">
          <header className="edit-topbar">
            <a href="/home" className="edit-admin-identity" aria-label="View public portfolio">
              <span className="edit-admin-mark" aria-hidden="true" />
              <span>
                <span>Mark Andrei</span>
                <small>Portfolio editor</small>
              </span>
            </a>
            <div className="edit-admin-status" aria-live="polite">
              <span className={saving ? "is-saving" : ""} aria-hidden="true" />
              {saving ? "Saving changes" : success ? "Changes saved" : "All changes synced"}
            </div>
            <div className="edit-admin-actions">
              <a href="/home" className="edit-action-secondary">
                <span>View portfolio</span>
                <ExternalLink aria-hidden="true" />
              </a>
              <button type="button" onClick={() => void handleLogout()} className="edit-action-quiet" aria-label="Log out">
                <LogOut aria-hidden="true" />
                <span>Logout</span>
              </button>
            </div>
          </header>

        {(error || success) && (
          <div className="edit-notices" role="status" aria-live="polite">
            {error && <p className="edit-notice is-error">{error}</p>}
            {success && <p className="edit-notice is-success">{success}</p>}
          </div>
        )}

        <section className="edit-dashboard-intro" aria-labelledby="edit-dashboard-title">
          <div>
            <p>Portfolio / Edit mode</p>
            <h1 id="edit-dashboard-title">Shape what people see.</h1>
          </div>
          <p>{totalContentItems} content records · {projects.length} projects live · {profile?.updatedAt ? `Updated ${new Date(profile.updatedAt).toLocaleDateString()}` : "Ready to edit"}</p>
        </section>

        <div className="edit-admin-layout">
          <nav className="edit-admin-nav" aria-label="Portfolio sections">
            <p>Content</p>
            {([
              ["profile", "Profile", "Identity & links"],
              ["projects", "Projects", `${projects.length} published`],
              ["experience", "Experience", `${experience.length} entries`],
              ["leadership", "Leadership", `${leadership.length} entries`],
              ["taglines", "Taglines", `${taglines.length} rotating`],
              ["achievements", "Achievements", `${achievements.length} entries`],
              ["resume", "Resume", "PDF document"],
              ["site-media", "Site media", "Icons & sharing"],
            ] as [EditorSection, string, string][]).map(([id, label, meta]) => (
              <button
                key={id}
                type="button"
                className={activeEditorSection === id ? "is-active" : ""}
                aria-current={activeEditorSection === id ? "page" : undefined}
                onClick={() => {
                  setActiveEditorSection(id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <span>{label}</span>
                <small>{meta}</small>
              </button>
            ))}
          </nav>

          <div className="edit-workspace" data-active-section={activeEditorSection}>

        <section id="resume" className="feature-card edit-section space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-300">Resume (PDF)</h2>
          <form
            className="flex flex-wrap items-end gap-3 text-sm"
            onSubmit={(e) => {
              e.preventDefault();
              if (!resumeFile) return;
              void withSave(async () => {
                if (resumeFile.type !== "application/pdf") throw new Error("Please choose a PDF resume.");
                const res = await fetch("/api/edit/resume", {
                  method: "POST",
                  headers: { "Content-Type": "application/pdf" },
                  body: resumeFile,
                  credentials: "include",
                });
                if (!res.ok) {
                  const data = (await res.json().catch(() => ({}))) as ApiError;
                  throw new Error(data.error || `Upload failed (${res.status})`);
                }
                setResumeFile(null);
              }, "Resume updated.");
            }}
          >
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                className="block w-full rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-neutral-300 file:mr-2 file:rounded file:border-0 file:bg-awsOrange file:px-3 file:py-1 file:text-black file:text-sm"
              />
            <button type="submit" disabled={saving || !resumeFile} className="rounded-lg bg-awsOrange px-4 py-2 font-medium text-black disabled:opacity-60">
              Upload resume
            </button>
          </form>
        </section>

        <section id="site-media" className="feature-card edit-section space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-300">Site Media Uploads</h2>
          <p className="text-xs text-neutral-500">Uploads are saved in database and applied to tab icon + social preview.</p>
          <div className="grid gap-3 md:grid-cols-2">
            <form
              className="space-y-2 rounded-xl border border-white/10 bg-black/25 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!faviconFile) return;
                void withSave(async () => {
                  const url = await uploadSiteMedia("favicon", faviconFile);
                  setFaviconFile(null);
                  setProfileForm((p) => ({ ...p, faviconUrl: url }));
                  applyFaviconNow(url);
                }, "Favicon uploaded.");
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Favicon</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFaviconFile(e.target.files?.[0] ?? null)}
                className="block w-full rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-neutral-300 file:mr-2 file:rounded file:border-0 file:bg-awsOrange file:px-3 file:py-1 file:text-black file:text-sm"
              />
              <p className="truncate text-xs text-neutral-500">{profileForm.faviconUrl || "No favicon uploaded yet."}</p>
              <button type="submit" disabled={saving || !faviconFile} className="rounded-lg bg-awsOrange px-3 py-1.5 text-xs font-medium text-black disabled:opacity-60">
                Upload favicon
              </button>
            </form>

            <form
              className="space-y-2 rounded-xl border border-white/10 bg-black/25 p-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (!socialFile) return;
                void withSave(async () => {
                  const url = await uploadSiteMedia("social", socialFile);
                  setSocialFile(null);
                  setProfileForm((p) => ({ ...p, socialImageUrl: url }));
                }, "Social preview uploaded.");
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-neutral-400">Social Preview</p>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSocialFile(e.target.files?.[0] ?? null)}
                className="block w-full rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-neutral-300 file:mr-2 file:rounded file:border-0 file:bg-awsOrange file:px-3 file:py-1 file:text-black file:text-sm"
              />
              <p className="truncate text-xs text-neutral-500">{profileForm.socialImageUrl || "No social image uploaded yet."}</p>
              <button type="submit" disabled={saving || !socialFile} className="rounded-lg bg-awsOrange px-3 py-1.5 text-xs font-medium text-black disabled:opacity-60">
                Upload social image
              </button>
            </form>
          </div>
        </section>

        <section id="profile" className="feature-card edit-section space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-200">Profile and Links</h2>
              <p className="mt-1 text-xs text-neutral-400">Homepage-visible fields only.</p>
            </div>
            {profile?.updatedAt && (
              <p className="text-xs text-neutral-500">Last update: {new Date(profile.updatedAt).toLocaleString()}</p>
            )}
          </div>

          <form
            className="space-y-5 text-sm"
            onSubmit={(e) => {
              e.preventDefault();
              void withSave(async () => {
                await apiJson("/api/edit/profile", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ...profileForm,
                    linkedinUrl: profileForm.linkedinUrl || null,
                    facebookUrl: profileForm.facebookUrl || null,
                    discordUrl: profileForm.discordUrl || null,
                    instagramUrl: profileForm.instagramUrl || null,
                    spotifyUrl: profileForm.spotifyUrl || null,
                    musicUrl: profileForm.musicUrl || null,
                    cloudinaryCloudName: profileForm.cloudinaryCloudName || null,
                    cloudinaryUploadPreset: profileForm.cloudinaryUploadPreset || null,
                    availability: profileForm.availability || null,
                    viewCount: Number.isFinite(Number(profileForm.viewCount))
                      ? Math.max(0, Math.trunc(Number(profileForm.viewCount)))
                      : 0,
                    brandName: profileForm.brandName || null,
                    heroTagline: profileForm.heroTagline || null,
                    tabTitle: profileForm.tabTitle || null,
                    faviconUrl: profileForm.faviconUrl || null,
                    socialImageUrl: profileForm.socialImageUrl || null,
                    featuredLabel: profileForm.featuredLabel || null,
                    experienceTitle: profileForm.experienceTitle || null,
                    leadershipTitle: profileForm.leadershipTitle || null,
                    achievementsTitle: profileForm.achievementsTitle || null,
                    contactLabel: profileForm.contactLabel || null,
                    footerCenterText: profileForm.footerCenterText || null,
                    footerRightText: profileForm.footerRightText || null,
                    aiBehaviorPrompt: profileForm.aiBehaviorPrompt || null
                  })
                });
              }, "Profile updated.");
            }}
          >
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">Identity</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="space-y-1">
                    <span className="text-xs text-neutral-400">Full Name</span>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm((p) => ({ ...p, fullName: e.target.value }))}
                      className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-neutral-400">Headline</span>
                    <input
                      type="text"
                      value={profileForm.headline}
                      onChange={(e) => setProfileForm((p) => ({ ...p, headline: e.target.value }))}
                      className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-neutral-400">Availability</span>
                    <input
                      type="text"
                      value={profileForm.availability}
                      onChange={(e) => setProfileForm((p) => ({ ...p, availability: e.target.value }))}
                      className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-neutral-400">Brand Name</span>
                    <input
                      type="text"
                      value={profileForm.brandName}
                      onChange={(e) => setProfileForm((p) => ({ ...p, brandName: e.target.value }))}
                      className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/25 p-4">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-400">Links and Bio</p>
                <div className="mb-4">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-neutral-500">Primary Links</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="space-y-1">
                      <span className="text-xs text-neutral-400">Email</span>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                        className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs text-neutral-400">LinkedIn URL</span>
                      <input
                        type="url"
                        value={profileForm.linkedinUrl}
                        onChange={(e) => setProfileForm((p) => ({ ...p, linkedinUrl: e.target.value }))}
                        className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white"
                      />
                    </label>
                    <label className="space-y-1 md:col-span-2">
                      <span className="text-xs text-neutral-400">GitHub URL</span>
                      <input
                        type="url"
                        value={profileForm.github}
                        onChange={(e) => setProfileForm((p) => ({ ...p, github: e.target.value }))}
                        className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs text-neutral-400">Discord Username</span>
                      <input
                        type="text"
                        value={profileForm.discordUrl}
                        onChange={(e) => setProfileForm((p) => ({ ...p, discordUrl: e.target.value }))}
                        placeholder="@username"
                        className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs text-neutral-400">Instagram URL</span>
                      <input
                        type="url"
                        value={profileForm.instagramUrl}
                        onChange={(e) => setProfileForm((p) => ({ ...p, instagramUrl: e.target.value }))}
                        placeholder="https://instagram.com/..."
                        className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs text-neutral-400">Spotify Profile/Playlist URL</span>
                      <input
                        type="url"
                        value={profileForm.spotifyUrl}
                        onChange={(e) => setProfileForm((p) => ({ ...p, spotifyUrl: e.target.value }))}
                        placeholder="https://open.spotify.com/..."
                        className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs text-neutral-400">Music Link (YouTube/Spotify or direct audio URL)</span>
                      <input
                        type="url"
                        value={profileForm.musicUrl}
                        onChange={(e) => setProfileForm((p) => ({ ...p, musicUrl: e.target.value }))}
                        placeholder="https://youtube.com/watch?v=... or spotify link"
                        className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white"
                      />
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-neutral-500">Browser and Share Meta</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="space-y-1">
                      <span className="text-xs text-neutral-400">Tab Title</span>
                      <input
                        type="text"
                        value={profileForm.tabTitle}
                        onChange={(e) => setProfileForm((p) => ({ ...p, tabTitle: e.target.value }))}
                        placeholder="Portfolio - Mark Andrei"
                        className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs text-neutral-400">Favicon URL</span>
                      <input
                        type="text"
                        value={profileForm.faviconUrl}
                        onChange={(e) => setProfileForm((p) => ({ ...p, faviconUrl: e.target.value }))}
                        placeholder="/api/public/site-media/favicon or https://..."
                        className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white"
                      />
                    </label>
                    <label className="space-y-1 md:col-span-2">
                      <span className="text-xs text-neutral-400">Linked Preview Image URL (OpenGraph/Twitter)</span>
                      <input
                        type="text"
                        value={profileForm.socialImageUrl}
                        onChange={(e) => setProfileForm((p) => ({ ...p, socialImageUrl: e.target.value }))}
                        placeholder="/api/public/site-media/social or https://..."
                        className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs text-neutral-400">Contact Label</span>
                      <input
                        type="text"
                        value={profileForm.contactLabel}
                        onChange={(e) => setProfileForm((p) => ({ ...p, contactLabel: e.target.value }))}
                        placeholder="Say hi -"
                        className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white"
                      />
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.14em] text-neutral-500">Homepage Labels</p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="space-y-1">
                      <span className="text-xs text-neutral-400">Featured Section Title</span>
                      <input
                        type="text"
                        value={profileForm.featuredLabel}
                        onChange={(e) => setProfileForm((p) => ({ ...p, featuredLabel: e.target.value }))}
                        placeholder="Featured Work"
                        className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs text-neutral-400">Experience Section Title</span>
                      <input
                        type="text"
                        value={profileForm.experienceTitle}
                        onChange={(e) => setProfileForm((p) => ({ ...p, experienceTitle: e.target.value }))}
                        placeholder="Experience Snapshot"
                        className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white"
                      />
                    </label>
                    <label className="space-y-1 md:col-span-2">
                      <span className="text-xs text-neutral-400">Leadership Section Title</span>
                      <input
                        type="text"
                        value={profileForm.leadershipTitle}
                        onChange={(e) => setProfileForm((p) => ({ ...p, leadershipTitle: e.target.value }))}
                        placeholder="Leadership and Community Activities"
                        className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs text-neutral-400">Achievements Section Title</span>
                      <input
                        type="text"
                        value={profileForm.achievementsTitle}
                        onChange={(e) => setProfileForm((p) => ({ ...p, achievementsTitle: e.target.value }))}
                        placeholder="Achievements"
                        className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs text-neutral-400">Footer Center Text</span>
                      <input
                        type="text"
                        value={profileForm.footerCenterText}
                        onChange={(e) => setProfileForm((p) => ({ ...p, footerCenterText: e.target.value }))}
                        placeholder="@2026 draiimon"
                        className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white"
                      />
                    </label>
                    <label className="space-y-1 md:col-span-2">
                      <span className="text-xs text-neutral-400">Footer Right Text</span>
                      <input
                        type="text"
                        value={profileForm.footerRightText}
                        onChange={(e) => setProfileForm((p) => ({ ...p, footerRightText: e.target.value }))}
                        placeholder="Thank you!"
                        className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="space-y-1 md:col-span-2">
                    <span className="text-xs text-neutral-400">About</span>
                    <textarea
                      value={profileForm.about}
                      onChange={(e) => setProfileForm((p) => ({ ...p, about: e.target.value }))}
                      rows={4}
                      className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white"
                    />
                  </label>
                  <label className="space-y-1 md:col-span-2">
                    <span className="text-xs text-neutral-400">AI Behavior Instructions</span>
                    <textarea
                      value={profileForm.aiBehaviorPrompt}
                      onChange={(e) => setProfileForm((p) => ({ ...p, aiBehaviorPrompt: e.target.value }))}
                      rows={4}
                      placeholder="Set how your portfolio AI should behave..."
                      className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button type="submit" disabled={saving} className="rounded-lg bg-awsOrange px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-60">
                Save profile
              </button>
            </div>
          </form>
        </section>

        <section id="projects" className="feature-card edit-section space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-300">Projects</h2>
          <div className="space-y-4">
            {projects.map((p) => (
              <div key={p.id} className="rounded-xl border border-white/10 bg-black/30 p-4">
                {editingProjectId === p.id ? (
                  <form
                    className="space-y-2 text-sm"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (editingProjectId == null) return;
                      void withSave(async () => {
                        await apiJson(`/api/edit/projects/${editingProjectId}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            ...editProjectForm,
                            link: editProjectForm.link || null,
                            githubUrl: editProjectForm.githubUrl || null
                          })
                        });
                        setEditingProjectId(null);
                      }, "Project updated.");
                    }}
                  >
                    <input value={editProjectForm.name} onChange={(e) => setEditProjectForm((f) => ({ ...f, name: e.target.value }))} placeholder="Name" className="w-full rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-white" />
                    <input value={editProjectForm.tagline} onChange={(e) => setEditProjectForm((f) => ({ ...f, tagline: e.target.value }))} placeholder="Tagline" className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
                    <textarea value={editProjectForm.description} onChange={(e) => setEditProjectForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description" rows={2} className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
                    <input value={editProjectForm.techStack} onChange={(e) => setEditProjectForm((f) => ({ ...f, techStack: e.target.value }))} placeholder="Tech stack" className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
                    <input value={editProjectForm.link} onChange={(e) => setEditProjectForm((f) => ({ ...f, link: e.target.value }))} placeholder="Live demo URL" className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
                    <input value={editProjectForm.githubUrl} onChange={(e) => setEditProjectForm((f) => ({ ...f, githubUrl: e.target.value }))} placeholder="GitHub URL" className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
                    <label className="flex items-center gap-2 text-neutral-300">
                      <input type="checkbox" checked={editProjectForm.highlight} onChange={(e) => setEditProjectForm((f) => ({ ...f, highlight: e.target.checked }))} />
                      Featured project
                    </label>
                    <div className="flex gap-2">
                      <button type="submit" disabled={saving} className="rounded-lg bg-awsOrange px-3 py-1.5 text-sm font-medium text-black">Save</button>
                      <button type="button" onClick={() => setEditingProjectId(null)} className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-neutral-300">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">
                        {p.name} {p.highlight ? <span className="text-xs text-amber-400">(featured)</span> : null}
                      </p>
                      <p className="text-xs text-neutral-500">{p.tagline}</p>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <button type="button" onClick={() => startEditProject(p)} className="text-awsOrange hover:underline">Edit</button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!confirm("Delete this project?")) return;
                          void withSave(async () => {
                            await apiJson(`/api/edit/projects/${p.id}`, { method: "DELETE" });
                          }, "Project deleted.");
                        }}
                        className="text-red-400 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <form
            className="mt-4 space-y-2 text-sm"
            onSubmit={(e) => {
              e.preventDefault();
              void withSave(async () => {
                await apiJson("/api/edit/projects", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ...newProject,
                    link: newProject.link || null,
                    githubUrl: newProject.githubUrl || null
                  })
                });
                setNewProject({ name: "", tagline: "", description: "", techStack: "", link: "", githubUrl: "", highlight: false });
              }, "Project added.");
            }}
          >
            <input type="text" placeholder="Project name" value={newProject.name} onChange={(e) => setNewProject((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-lg border border-white/15 bg-black/35 px-3 py-2 text-white" />
            <input type="text" placeholder="Tagline" value={newProject.tagline} onChange={(e) => setNewProject((p) => ({ ...p, tagline: e.target.value }))} className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
            <textarea placeholder="Description" value={newProject.description} onChange={(e) => setNewProject((p) => ({ ...p, description: e.target.value }))} rows={2} className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
            <input type="text" placeholder="Tech stack" value={newProject.techStack} onChange={(e) => setNewProject((p) => ({ ...p, techStack: e.target.value }))} className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
            <input type="text" placeholder="Live demo URL" value={newProject.link} onChange={(e) => setNewProject((p) => ({ ...p, link: e.target.value }))} className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
            <input type="text" placeholder="GitHub URL" value={newProject.githubUrl} onChange={(e) => setNewProject((p) => ({ ...p, githubUrl: e.target.value }))} className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
            <label className="flex items-center gap-2 text-neutral-300">
              <input type="checkbox" checked={newProject.highlight} onChange={(e) => setNewProject((p) => ({ ...p, highlight: e.target.checked }))} />
              Featured project
            </label>
            <button type="submit" disabled={saving} className="rounded-lg bg-awsOrange px-4 py-2 text-sm font-medium text-black disabled:opacity-60">
              Add project
            </button>
          </form>
        </section>

        <section id="experience" className="feature-card edit-section space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-300">Experience</h2>
          <p className="text-xs text-neutral-500">Drag cards to reorder.</p>
          <div className={`space-y-2 ${dragItem?.section === "leadership" ? "drag-lane-active" : ""}`}>
            {experience.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDragItem({ section: "experience", id: item.id })}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverItem({ section: "experience", id: item.id });
                }}
                onDragLeave={() => setDragOverItem(null)}
                onDrop={() => handleDrop("experience", item.id)}
                onDragEnd={() => {
                  setDragItem(null);
                  setDragOverItem(null);
                }}
                className={`drag-card cursor-grab rounded-xl border border-white/10 bg-black/30 p-3 text-sm active:cursor-grabbing ${dragShiftClass("experience", item.id)} ${
                  dragOverItem?.section === "experience" && dragOverItem.id === item.id ? "drag-target" : ""
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500">
                    <GripVertical className="h-3.5 w-3.5" />
                    Drag to reorder
                  </span>
                </div>
                {editingExperienceId === item.id ? (
                  <form
                    className="space-y-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void withSave(async () => {
                        await apiJson(`/api/edit/experience/${item.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(editExperienceForm)
                        });
                        setEditingExperienceId(null);
                      }, "Experience updated.");
                    }}
                  >
                    <input value={editExperienceForm.role} onChange={(e) => setEditExperienceForm((v) => ({ ...v, role: e.target.value }))} placeholder="Role" className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
                    <input value={editExperienceForm.company} onChange={(e) => setEditExperienceForm((v) => ({ ...v, company: e.target.value }))} placeholder="Company" className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
                    <input value={editExperienceForm.period} onChange={(e) => setEditExperienceForm((v) => ({ ...v, period: e.target.value }))} placeholder="Period" className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
                    <textarea value={editExperienceForm.summary} onChange={(e) => setEditExperienceForm((v) => ({ ...v, summary: e.target.value }))} placeholder="Summary" rows={2} className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
                    <div className="flex gap-2 text-xs">
                      <button type="submit" className="rounded-lg bg-awsOrange px-3 py-1.5 font-medium text-black">Save</button>
                      <button type="button" className="rounded-lg border border-white/20 px-3 py-1.5 text-neutral-300" onClick={() => setEditingExperienceId(null)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p className="font-medium">{item.role} - {item.company}</p>
                    <p className="text-xs text-neutral-400">{item.period}</p>
                    <p className="mt-1 text-neutral-300">{item.summary}</p>
                    <div className="mt-2 flex gap-3 text-xs">
                      <button type="button" className="text-awsOrange hover:underline" onClick={() => startEditExperience(item)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-red-400 hover:underline"
                        onClick={() => {
                          if (!confirm("Delete this experience?")) return;
                          void withSave(async () => {
                            await apiJson(`/api/edit/experience/${item.id}`, { method: "DELETE" });
                          }, "Experience removed.");
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <form
            className="mt-4 grid gap-2 text-sm"
            onSubmit={(e) => {
              e.preventDefault();
              void withSave(async () => {
                await apiJson("/api/edit/experience", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...newExperience, sortOrder: experience.length + 1 })
                });
                setNewExperience({ role: "", company: "", period: "", summary: "" });
              }, "Experience added.");
            }}
          >
            <input type="text" placeholder="Role" value={newExperience.role} onChange={(e) => setNewExperience((v) => ({ ...v, role: e.target.value }))} className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
            <input type="text" placeholder="Company" value={newExperience.company} onChange={(e) => setNewExperience((v) => ({ ...v, company: e.target.value }))} className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
            <input type="text" placeholder="Period" value={newExperience.period} onChange={(e) => setNewExperience((v) => ({ ...v, period: e.target.value }))} className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
            <textarea placeholder="Summary" value={newExperience.summary} onChange={(e) => setNewExperience((v) => ({ ...v, summary: e.target.value }))} rows={2} className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
            <button type="submit" disabled={saving} className="rounded-lg bg-awsOrange px-4 py-2 text-sm font-medium text-black disabled:opacity-60">
              Add experience
            </button>
          </form>
        </section>

        <section id="leadership" className="feature-card edit-section space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-300">Leadership</h2>
          <p className="text-xs text-neutral-500">Drag cards to reorder.</p>
          <div className={`space-y-2 ${dragItem?.section === "taglines" ? "drag-lane-active" : ""}`}>
            {leadership.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDragItem({ section: "leadership", id: item.id })}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverItem({ section: "leadership", id: item.id });
                }}
                onDragLeave={() => setDragOverItem(null)}
                onDrop={() => handleDrop("leadership", item.id)}
                onDragEnd={() => {
                  setDragItem(null);
                  setDragOverItem(null);
                }}
                className={`drag-card cursor-grab rounded-xl border border-white/10 bg-black/30 p-3 text-sm active:cursor-grabbing ${dragShiftClass("leadership", item.id)} ${
                  dragOverItem?.section === "leadership" && dragOverItem.id === item.id ? "drag-target" : ""
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500">
                    <GripVertical className="h-3.5 w-3.5" />
                    Drag to reorder
                  </span>
                </div>
                {editingLeadershipId === item.id ? (
                  <form
                    className="space-y-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void withSave(async () => {
                        await apiJson(`/api/edit/leadership/${item.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(editLeadershipForm)
                        });
                        setEditingLeadershipId(null);
                      }, "Leadership updated.");
                    }}
                  >
                    <input value={editLeadershipForm.org} onChange={(e) => setEditLeadershipForm((v) => ({ ...v, org: e.target.value }))} placeholder="Organization" className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
                    <input value={editLeadershipForm.role} onChange={(e) => setEditLeadershipForm((v) => ({ ...v, role: e.target.value }))} placeholder="Role" className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
                    <input value={editLeadershipForm.period} onChange={(e) => setEditLeadershipForm((v) => ({ ...v, period: e.target.value }))} placeholder="Period" className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
                    <div className="flex gap-2 text-xs">
                      <button type="submit" className="rounded-lg bg-awsOrange px-3 py-1.5 font-medium text-black">Save</button>
                      <button type="button" className="rounded-lg border border-white/20 px-3 py-1.5 text-neutral-300" onClick={() => setEditingLeadershipId(null)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p className="font-medium">{item.org}</p>
                    <p className="text-neutral-300">{item.role}</p>
                    <p className="text-xs text-neutral-400">{item.period}</p>
                    <div className="mt-2 flex gap-3 text-xs">
                      <button type="button" className="text-awsOrange hover:underline" onClick={() => startEditLeadership(item)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-red-400 hover:underline"
                        onClick={() => {
                          if (!confirm("Delete this leadership entry?")) return;
                          void withSave(async () => {
                            await apiJson(`/api/edit/leadership/${item.id}`, { method: "DELETE" });
                          }, "Leadership entry removed.");
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <form
            className="mt-4 grid gap-2 text-sm"
            onSubmit={(e) => {
              e.preventDefault();
              void withSave(async () => {
                await apiJson("/api/edit/leadership", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...newLeadership, sortOrder: leadership.length + 1 })
                });
                setNewLeadership({ org: "", role: "", period: "" });
              }, "Leadership entry added.");
            }}
          >
            <input type="text" placeholder="Organization" value={newLeadership.org} onChange={(e) => setNewLeadership((v) => ({ ...v, org: e.target.value }))} className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
            <input type="text" placeholder="Role" value={newLeadership.role} onChange={(e) => setNewLeadership((v) => ({ ...v, role: e.target.value }))} className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
            <input type="text" placeholder="Period" value={newLeadership.period} onChange={(e) => setNewLeadership((v) => ({ ...v, period: e.target.value }))} className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
            <button type="submit" disabled={saving} className="rounded-lg bg-awsOrange px-4 py-2 text-sm font-medium text-black disabled:opacity-60">
              Add leadership
            </button>
          </form>
        </section>

        <section id="taglines" className="feature-card edit-section space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-300">Taglines</h2>
          <p className="text-xs text-neutral-500">Drag cards to reorder.</p>
          <div className={`space-y-2 ${dragItem?.section === "achievements" ? "drag-lane-active" : ""}`}>
            {taglines.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDragItem({ section: "taglines", id: item.id })}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverItem({ section: "taglines", id: item.id });
                }}
                onDragLeave={() => setDragOverItem(null)}
                onDrop={() => handleDrop("taglines", item.id)}
                onDragEnd={() => {
                  setDragItem(null);
                  setDragOverItem(null);
                }}
                className={`drag-card cursor-grab rounded-xl border border-white/10 bg-black/30 p-3 text-sm active:cursor-grabbing ${dragShiftClass("taglines", item.id)} ${
                  dragOverItem?.section === "taglines" && dragOverItem.id === item.id ? "drag-target" : ""
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500">
                    <GripVertical className="h-3.5 w-3.5" />
                    Drag to reorder
                  </span>
                </div>
                <div className="grid gap-2">
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) =>
                      setTaglines((all) => all.map((t) => (t.id === item.id ? { ...t, text: e.target.value } : t)))
                    }
                    className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white"
                  />
                </div>
                <div className="mt-2 flex gap-3 text-xs">
                  <button
                    type="button"
                    className="text-awsOrange hover:underline"
                    onClick={() => {
                      void withSave(async () => {
                        await apiJson(`/api/edit/taglines/${item.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ text: item.text })
                        });
                      }, "Tagline updated.");
                    }}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="text-red-400 hover:underline"
                    onClick={() => {
                      if (!confirm("Delete this tagline?")) return;
                      void withSave(async () => {
                        await apiJson(`/api/edit/taglines/${item.id}`, { method: "DELETE" });
                      }, "Tagline deleted.");
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          <form
            className="mt-4 grid gap-2 text-sm"
            onSubmit={(e) => {
              e.preventDefault();
              void withSave(async () => {
                await apiJson("/api/edit/taglines", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...newTagline, sortOrder: taglines.length + 1 })
                });
                setNewTagline({ text: "" });
              }, "Tagline added.");
            }}
          >
            <input
              type="text"
              placeholder="Tagline text"
              value={newTagline.text}
              onChange={(e) => setNewTagline((v) => ({ ...v, text: e.target.value }))}
              className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white"
            />
            <button type="submit" disabled={saving} className="rounded-lg bg-awsOrange px-4 py-2 text-sm font-medium text-black disabled:opacity-60">
              Add tagline
            </button>
          </form>
        </section>

        <section id="achievements" className="feature-card edit-section space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-300">Achievements</h2>
          <p className="text-xs text-neutral-500">Drag cards to reorder.</p>
          <div className="space-y-2">
            {achievements.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={() => setDragItem({ section: "achievements", id: item.id })}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverItem({ section: "achievements", id: item.id });
                }}
                onDragLeave={() => setDragOverItem(null)}
                onDrop={() => handleDrop("achievements", item.id)}
                onDragEnd={() => {
                  setDragItem(null);
                  setDragOverItem(null);
                }}
                className={`drag-card cursor-grab rounded-xl border border-white/10 bg-black/30 p-3 text-sm active:cursor-grabbing ${dragShiftClass("achievements", item.id)} ${
                  dragOverItem?.section === "achievements" && dragOverItem.id === item.id ? "drag-target" : ""
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500">
                    <GripVertical className="h-3.5 w-3.5" />
                    Drag to reorder
                  </span>
                </div>
                {editingAchievementId === item.id ? (
                  <form
                    className="space-y-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void withSave(async () => {
                        await apiJson(`/api/edit/achievements/${item.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ text: editAchievementText })
                        });
                        setEditingAchievementId(null);
                        setEditAchievementText("");
                      }, "Achievement updated.");
                    }}
                  >
                    <input value={editAchievementText} onChange={(e) => setEditAchievementText(e.target.value)} className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
                    <div className="flex gap-2 text-xs">
                      <button type="submit" className="rounded-lg bg-awsOrange px-3 py-1.5 font-medium text-black">Save</button>
                      <button type="button" className="rounded-lg border border-white/20 px-3 py-1.5 text-neutral-300" onClick={() => setEditingAchievementId(null)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <p className="text-neutral-200">{item.text}</p>
                    <div className="mt-2 flex gap-3 text-xs">
                      <button type="button" className="text-awsOrange hover:underline" onClick={() => startEditAchievement(item)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-red-400 hover:underline"
                        onClick={() => {
                          if (!confirm("Delete this achievement?")) return;
                          void withSave(async () => {
                            await apiJson(`/api/edit/achievements/${item.id}`, { method: "DELETE" });
                          }, "Achievement removed.");
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
          <form
            className="mt-4 grid gap-2 text-sm"
            onSubmit={(e) => {
              e.preventDefault();
              void withSave(async () => {
                await apiJson("/api/edit/achievements", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ ...newAchievement, sortOrder: achievements.length + 1 })
                });
                setNewAchievement({ text: "" });
              }, "Achievement added.");
            }}
          >
            <input type="text" placeholder="Achievement text" value={newAchievement.text} onChange={(e) => setNewAchievement((v) => ({ ...v, text: e.target.value }))} className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
            <button type="submit" disabled={saving} className="rounded-lg bg-awsOrange px-4 py-2 text-sm font-medium text-black disabled:opacity-60">
              Add achievement
            </button>
          </form>
        </section>

        <p className="pt-3 text-xs text-neutral-600">
          <a href="/home" className="hover:text-awsOrange">
            Back to site
          </a>
        </p>
          </div>
        </div>
        </div>
      </PortfolioSurface>
    </main>
  );
}

