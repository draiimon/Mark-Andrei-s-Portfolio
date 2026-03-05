"use client";

import { useEffect, useState } from "react";
import { Cloud, Eye, EyeOff, Gauge, GripVertical, Sparkles } from "lucide-react";

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

export default function EditPage() {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dragItem, setDragItem] = useState<DragItem>(null);
  const [dragOverItem, setDragOverItem] = useState<DragItem>(null);
  const [deckScrolling, setDeckScrolling] = useState(false);

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

  useEffect(() => {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const isReload = nav?.type === "reload";

    async function bootstrapAuth() {
      if (isReload) {
        await fetch("/api/admin/logout", { method: "POST", credentials: "include" }).catch(() => {});
      }

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

  function smoothScrollToId(id: string) {
    const target = document.getElementById(id);
    if (!target) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targetY = target.getBoundingClientRect().top + window.scrollY - 96;

    if (prefersReducedMotion) {
      window.scrollTo(0, targetY);
      return;
    }

    const startY = window.scrollY;
    const distance = targetY - startY;
    const duration = 850;
    const start = performance.now();

    setDeckScrolling(true);

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const step = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = easeInOutCubic(t);
      window.scrollTo(0, startY + distance * eased);

      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        window.setTimeout(() => setDeckScrolling(false), 120);
      }
    };

    requestAnimationFrame(step);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
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

  if (auth === null) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <span className="text-neutral-500">Loading...</span>
      </main>
    );
  }

  if (auth === false) {
    return (
      <main className="site-shell min-h-screen text-white">
        <div className="cloud-light one" />
        <div className="cloud-light two" />
        <div className="cloud-light three" />
        <div className="mx-auto flex min-h-screen max-w-md items-center p-6">
          <div className="login-shell w-full rounded-3xl p-7 md:p-8 fade-rise">
            <div className="edit-orb one" />
            <div className="edit-orb two" />
            <div className="relative z-10">
              <div className="mb-6 flex items-center gap-2">
                <span className="rounded-full border border-awsOrange/45 bg-awsOrange/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-awsOrange">
                  Internal
                </span>
              </div>
              <div className="mb-5 flex items-center gap-3">
                <div>
                  <p className="text-xl font-semibold leading-tight text-white">Sign in to edit portfolio</p>
                  <p className="text-xs text-neutral-400">Use your admin credentials to continue.</p>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-3.5">
                <label className="block space-y-1">
                  <span className="text-[11px] uppercase tracking-[0.12em] text-neutral-400">Username</span>
                  <div className="field-shell rounded-xl px-3 py-2.5">
                    <input
                      type="text"
                      placeholder="draiimon"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-transparent text-white placeholder:text-neutral-500 focus:outline-none"
                    />
                  </div>
                </label>

                <label className="block space-y-1">
                  <span className="text-[11px] uppercase tracking-[0.12em] text-neutral-400">Password</span>
                  <div className="field-shell flex items-center rounded-xl px-3 py-2.5">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent text-white placeholder:text-neutral-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="ml-2 rounded p-1 text-neutral-400 hover:text-awsOrange"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>

                {loginError && <p className="text-xs text-red-400">{loginError}</p>}
                <button type="submit" className="w-full rounded-xl bg-awsOrange px-4 py-2.5 font-semibold text-black shadow-[0_10px_28px_rgba(255,153,0,0.35)] transition hover:brightness-110">
                  Enter Edit Mode
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const totalContentItems =
    projects.length + experience.length + leadership.length + achievements.length + taglines.length;

  return (
    <main className={`edit-page site-shell min-h-screen text-white ${deckScrolling ? "deck-scrolling" : ""}`}>
      <div className="cloud-light one" />
      <div className="cloud-light two" />
      <div className="cloud-light three" />

      <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6 md:space-y-10 md:py-14">
        <header className="topbar edit-topbar rounded-2xl px-4 py-3 md:px-5">
          <div className="edit-orb one" />
          <div className="edit-orb two" />
          <div className="relative z-10 flex w-full items-center justify-between gap-3">
            <a href="/home" className="flex items-center gap-2.5 text-white">
              <span className="rounded-lg border border-white/20 bg-black/35 p-1.5">
                <Cloud className="h-5 w-5 text-awsOrange" />
              </span>
              <span>
                <span className="block text-xs uppercase tracking-[0.18em] text-neutral-400">Control Center</span>
                <span className="block font-semibold leading-tight">Portfolio Edit</span>
              </span>
            </a>
            <a
              href="/home"
              className="rounded-lg border border-white/20 bg-black/30 px-3 py-1.5 text-xs font-medium text-neutral-200 transition hover:border-awsOrange/60 hover:text-awsOrange"
            >
              View site
            </a>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="rounded-lg border border-red-400/35 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-200 transition hover:border-red-300/70 hover:text-red-100"
            >
              Logout
            </button>
          </div>
        </header>

        {(error || success) && (
          <div className={`space-y-2 ${dragItem?.section === "experience" ? "drag-lane-active" : ""}`}>
            {error && <p className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
            {success && <p className="rounded border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-300">{success}</p>}
          </div>
        )}

        <section className="control-deck rounded-2xl p-5">
          <div className="deck-glow one" />
          <div className="deck-glow two" />
          <div className="relative z-10">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-awsOrange" />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-300">Control Deck</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] text-neutral-300">
                <Sparkles className="h-3.5 w-3.5 text-awsOrange" />
                {totalContentItems} content records managed
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-4">
              {[
                { id: "resume", label: "Resume" },
                { id: "profile", label: "Profile" },
                { id: "projects", label: "Projects" },
                { id: "experience", label: "Experience" },
                { id: "leadership", label: "Leadership" },
                { id: "taglines", label: "Taglines" },
                { id: "achievements", label: "Achievements" }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="deck-link"
                  onClick={() => smoothScrollToId(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="resume" className="feature-card edit-section space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-300">Resume (PDF)</h2>
          <form
            className="flex flex-wrap items-end gap-3 text-sm"
            onSubmit={(e) => {
              e.preventDefault();
              if (!resumeFile) return;
              void withSave(async () => {
                const formData = new FormData();
                formData.append("file", resumeFile);
                const res = await fetch("/api/edit/resume", { method: "POST", body: formData, credentials: "include" });
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
                        placeholder="To the clouds. - Mark Andrei"
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
            <input type="url" placeholder="Live demo URL" value={newProject.link} onChange={(e) => setNewProject((p) => ({ ...p, link: e.target.value }))} className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
            <input type="url" placeholder="GitHub URL" value={newProject.githubUrl} onChange={(e) => setNewProject((p) => ({ ...p, githubUrl: e.target.value }))} className="w-full rounded-lg border border-white/15 bg-black/45 px-3 py-2 text-white" />
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
    </main>
  );
}

