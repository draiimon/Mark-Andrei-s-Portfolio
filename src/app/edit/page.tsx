"use client";

import { useEffect, useState } from "react";
import { Cloud } from "lucide-react";

type Profile = {
  id: number;
  fullName: string;
  headline: string;
  location: string;
  email: string;
  phone: string;
  github: string;
  objective: string;
  about: string;
  skills: string;
} | null;

type Project = {
  id: number;
  name: string;
  tagline: string;
  description: string;
  techStack: string;
  link: string | null;
  githubUrl: string | null;
};

type GalleryImage = {
  id: number;
  title: string;
  url: string;
};

export default function EditPage() {
  const [auth, setAuth] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [profile, setProfile] = useState<Profile>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [saving, setSaving] = useState(false);
  const [profileForm, setProfileForm] = useState({ fullName: "", headline: "", location: "", email: "", phone: "", github: "", objective: "", about: "", skills: "" });
  const [newProject, setNewProject] = useState({ name: "", tagline: "", description: "", techStack: "", link: "", githubUrl: "" });
  const [newImage, setNewImage] = useState({ title: "", url: "" });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeSuccess, setResumeSuccess] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editProjectForm, setEditProjectForm] = useState({ name: "", tagline: "", description: "", techStack: "", link: "", githubUrl: "" });

  useEffect(() => {
    fetch("/api/edit/me")
      .then((r) => {
        setAuth(r.ok);
        if (r.ok) loadData();
      })
      .catch(() => setAuth(false));
  }, []);

  function loadData() {
    Promise.all([
      fetch("/api/edit/profile").then((r) => r.json()),
      fetch("/api/edit/projects").then((r) => r.json()),
      fetch("/api/edit/gallery").then((r) => r.json())
    ]).then(([p, proj, g]) => {
      setProfile(p);
      setProjects(proj ?? []);
      setGallery(g ?? []);
      if (p) setProfileForm({
        fullName: p.fullName ?? "",
        headline: p.headline ?? "",
        location: p.location ?? "",
        email: p.email ?? "",
        phone: p.phone ?? "",
        github: p.github ?? "",
        objective: p.objective ?? "",
        about: p.about ?? "",
        skills: p.skills ?? ""
      });
    });
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (!res.ok) {
      setLoginError(data.error ?? "Invalid credentials");
      return;
    }
    setAuth(true);
    loadData();
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/edit/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profileForm) });
    setSaving(false);
    loadData();
  }

  async function addProject(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/edit/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newProject,
        link: newProject.link || null,
        githubUrl: newProject.githubUrl || null
      })
    });
    setNewProject({ name: "", tagline: "", description: "", techStack: "", link: "", githubUrl: "" });
    setSaving(false);
    loadData();
  }

  async function deleteProject(id: number) {
    if (!confirm("Delete this project?")) return;
    await fetch(`/api/edit/projects/${id}`, { method: "DELETE" });
    loadData();
    setEditingProjectId(null);
  }

  function startEditProject(p: Project) {
    setEditingProjectId(p.id);
    setEditProjectForm({
      name: p.name,
      tagline: p.tagline,
      description: p.description,
      techStack: p.techStack,
      link: p.link ?? "",
      githubUrl: p.githubUrl ?? ""
    });
  }

  async function saveProjectEdit(e: React.FormEvent) {
    e.preventDefault();
    if (editingProjectId == null) return;
    setSaving(true);
    await fetch(`/api/edit/projects/${editingProjectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editProjectForm,
        link: editProjectForm.link || null,
        githubUrl: editProjectForm.githubUrl || null
      })
    });
    setSaving(false);
    setEditingProjectId(null);
    loadData();
  }

  async function addImage(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch("/api/edit/gallery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newImage) });
    setNewImage({ title: "", url: "" });
    setSaving(false);
    loadData();
  }

  async function deleteImage(id: number) {
    if (!confirm("Remove this image?")) return;
    await fetch(`/api/edit/gallery/${id}`, { method: "DELETE" });
    loadData();
  }

  async function uploadResume(e: React.FormEvent) {
    e.preventDefault();
    if (!resumeFile) return;
    setSaving(true);
    setResumeSuccess(false);
    const formData = new FormData();
    formData.append("file", resumeFile);
    const res = await fetch("/api/edit/resume", { method: "POST", body: formData });
    setSaving(false);
    setResumeFile(null);
    if (res.ok) setResumeSuccess(true);
  }

  if (auth === null) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <span className="text-neutral-500">Loading…</span>
      </main>
    );
  }

  if (auth === false) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex items-center gap-2 justify-center">
            <Cloud className="h-8 w-8 text-awsOrange" />
            <span className="font-semibold">To the clouds.</span>
          </div>
          <p className="text-sm text-neutral-500 text-center">Sign in to edit your portfolio.</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-awsOrange"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-awsOrange"
            />
            {loginError && <p className="text-sm text-red-400">{loginError}</p>}
            <button type="submit" className="w-full rounded bg-awsOrange py-2 text-sm font-medium text-black hover:brightness-110">
              Sign in
            </button>
          </form>
          <p className="text-xs text-neutral-600 text-center">
            <a href="/" className="hover:text-awsOrange">← Back to site</a>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="max-w-2xl mx-auto space-y-12">
        <header className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-white font-medium">
            <Cloud className="h-5 w-5 text-awsOrange" />
            To the clouds. · Edit
          </a>
          <a href="/" className="text-sm text-neutral-500 hover:text-awsOrange">View site →</a>
        </header>

        <section>
          <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">Resume (PDF)</h2>
          <p className="text-xs text-neutral-500 mb-3">Re-upload to replace the current resume. Site links to this file.</p>
          <form onSubmit={uploadResume} className="flex flex-wrap items-end gap-3 text-sm">
            <label className="flex-1 min-w-[200px]">
              <span className="sr-only">Choose PDF</span>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={(e) => { setResumeFile(e.target.files?.[0] ?? null); setResumeSuccess(false); }}
                className="block w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-neutral-300 file:mr-2 file:rounded file:border-0 file:bg-awsOrange file:px-3 file:py-1 file:text-black file:text-sm"
              />
            </label>
            <button type="submit" disabled={saving || !resumeFile} className="rounded bg-awsOrange px-4 py-2 font-medium text-black disabled:opacity-60">
              Upload resume
            </button>
          </form>
          {resumeSuccess && <p className="mt-2 text-xs text-green-400">Resume updated. Visit /api/resume to view.</p>}
        </section>

        <section>
          <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">Profile</h2>
          <form onSubmit={saveProfile} className="space-y-3 text-sm">
            {(["fullName", "headline", "location", "email", "phone", "github"] as const).map((key) => (
              <input
                key={key}
                type="text"
                placeholder={key}
                value={profileForm[key]}
                onChange={(e) => setProfileForm((p) => ({ ...p, [key]: e.target.value }))}
                className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-awsOrange"
              />
            ))}
            <textarea
              placeholder="objective"
              value={profileForm.objective}
              onChange={(e) => setProfileForm((p) => ({ ...p, objective: e.target.value }))}
              rows={2}
              className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-awsOrange"
            />
            <textarea
              placeholder="about (shows on site)"
              value={profileForm.about}
              onChange={(e) => setProfileForm((p) => ({ ...p, about: e.target.value }))}
              rows={3}
              className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-awsOrange"
            />
            <input
              type="text"
              placeholder="skills (comma-separated)"
              value={profileForm.skills}
              onChange={(e) => setProfileForm((p) => ({ ...p, skills: e.target.value }))}
              className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-awsOrange"
            />
            <button type="submit" disabled={saving} className="rounded bg-awsOrange px-4 py-2 text-sm font-medium text-black disabled:opacity-60">
              Save profile
            </button>
          </form>
        </section>

        <section>
          <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">Projects</h2>
          <div className="space-y-4">
            {projects.map((p) => (
              <div key={p.id} className="rounded border border-neutral-800 p-4">
                {editingProjectId === p.id ? (
                  <form onSubmit={saveProjectEdit} className="space-y-2 text-sm">
                    <input value={editProjectForm.name} onChange={(e) => setEditProjectForm((f) => ({ ...f, name: e.target.value }))} placeholder="Name" className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white" />
                    <input value={editProjectForm.tagline} onChange={(e) => setEditProjectForm((f) => ({ ...f, tagline: e.target.value }))} placeholder="Tagline" className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white" />
                    <textarea value={editProjectForm.description} onChange={(e) => setEditProjectForm((f) => ({ ...f, description: e.target.value }))} placeholder="Description" rows={2} className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white" />
                    <input value={editProjectForm.techStack} onChange={(e) => setEditProjectForm((f) => ({ ...f, techStack: e.target.value }))} placeholder="Tech stack" className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white" />
                    <input value={editProjectForm.link} onChange={(e) => setEditProjectForm((f) => ({ ...f, link: e.target.value }))} placeholder="Live demo URL" className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white" />
                    <input value={editProjectForm.githubUrl} onChange={(e) => setEditProjectForm((f) => ({ ...f, githubUrl: e.target.value }))} placeholder="GitHub URL" className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white" />
                    <div className="flex gap-2">
                      <button type="submit" disabled={saving} className="rounded bg-awsOrange px-3 py-1.5 text-sm font-medium text-black">Save</button>
                      <button type="button" onClick={() => setEditingProjectId(null)} className="rounded border border-neutral-600 px-3 py-1.5 text-sm text-neutral-400">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <p className="font-medium text-white">{p.name}</p>
                      <p className="text-xs text-neutral-500">{p.techStack}</p>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => startEditProject(p)} className="text-xs text-awsOrange hover:underline">Edit</button>
                      <button type="button" onClick={() => deleteProject(p.id)} className="text-xs text-red-400 hover:underline">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <form onSubmit={addProject} className="mt-4 space-y-2 text-sm">
            <input
              type="text"
              placeholder="Project name"
              value={newProject.name}
              onChange={(e) => setNewProject((p) => ({ ...p, name: e.target.value }))}
              className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-awsOrange"
            />
            <input type="text" placeholder="Tagline" value={newProject.tagline} onChange={(e) => setNewProject((p) => ({ ...p, tagline: e.target.value }))} className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-awsOrange" />
            <textarea placeholder="Description" value={newProject.description} onChange={(e) => setNewProject((p) => ({ ...p, description: e.target.value }))} rows={2} className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-awsOrange" />
            <input type="text" placeholder="Tech stack (e.g. Python · React · AWS)" value={newProject.techStack} onChange={(e) => setNewProject((p) => ({ ...p, techStack: e.target.value }))} className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-awsOrange" />
            <input type="url" placeholder="Live demo URL" value={newProject.link} onChange={(e) => setNewProject((p) => ({ ...p, link: e.target.value }))} className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-awsOrange" />
            <input type="url" placeholder="GitHub URL" value={newProject.githubUrl} onChange={(e) => setNewProject((p) => ({ ...p, githubUrl: e.target.value }))} className="w-full rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-awsOrange" />
            <button type="submit" disabled={saving} className="rounded bg-awsOrange px-4 py-2 text-sm font-medium text-black disabled:opacity-60">
              Add project
            </button>
          </form>
        </section>

        <section>
          <h2 className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-4">Gallery</h2>
          <div className="space-y-3">
            {gallery.map((img) => (
              <div key={img.id} className="flex items-center gap-4 rounded border border-neutral-800 p-3">
                <img src={img.url} alt={img.title} className="h-12 w-12 rounded object-cover" />
                <span className="text-sm text-neutral-300 flex-1">{img.title}</span>
                <button type="button" onClick={() => deleteImage(img.id)} className="text-xs text-red-400 hover:underline">
                  Remove
                </button>
              </div>
            ))}
          </div>
          <form onSubmit={addImage} className="mt-4 flex gap-2 text-sm">
            <input
              type="text"
              placeholder="Title"
              value={newImage.title}
              onChange={(e) => setNewImage((p) => ({ ...p, title: e.target.value }))}
              className="flex-1 rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-awsOrange"
            />
            <input
              type="url"
              placeholder="Image URL"
              value={newImage.url}
              onChange={(e) => setNewImage((p) => ({ ...p, url: e.target.value }))}
              className="flex-1 rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-awsOrange"
            />
            <button type="submit" disabled={saving} className="rounded bg-awsOrange px-4 py-2 font-medium text-black disabled:opacity-60">
              Add
            </button>
          </form>
        </section>

        <p className="text-xs text-neutral-600 pt-8">
          <a href="/" className="hover:text-awsOrange">← Back to site</a>
        </p>
      </div>
    </main>
  );
}
