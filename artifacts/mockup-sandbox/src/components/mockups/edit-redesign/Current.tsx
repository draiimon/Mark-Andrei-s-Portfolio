import { useState, type FormEvent } from "react";
import { ArrowUpRight, Eye, EyeOff, ExternalLink, GripVertical, LogOut, Pencil, Save } from "lucide-react";
import "./_group.css";

type Section = "profile" | "projects" | "experience" | "leadership" | "taglines" | "achievements" | "resume" | "site-media";

const sections: Array<{ id: Section; label: string; note: string }> = [
  { id: "profile", label: "Profile", note: "Identity and links" },
  { id: "projects", label: "Projects", note: "Featured work" },
  { id: "experience", label: "Experience", note: "Career timeline" },
  { id: "leadership", label: "Leadership", note: "Communities" },
  { id: "taglines", label: "Taglines", note: "Hero rotation" },
  { id: "achievements", label: "Achievements", note: "Proof points" },
  { id: "resume", label: "Resume", note: "PDF document" },
  { id: "site-media", label: "Site media", note: "Favicon and social" },
];

const projects = [
  { id: 1, name: "Morrow / climate ledger", detail: "Product design · featured", highlight: true },
  { id: 2, name: "Northstar systems", detail: "Frontend engineering · 2024", highlight: false },
  { id: 3, name: "Sundial archive", detail: "Research tool · 2023", highlight: false },
];

const experience = [
  { id: 1, name: "Senior Product Engineer", detail: "Field Notes Studio · 2023 — now" },
  { id: 2, name: "Design Engineer", detail: "Radian Labs · 2021 — 2023" },
];

const leadership = [
  { id: 1, name: "Creative coding mentor", detail: "Open Source Design · 2022 — now" },
  { id: 2, name: "Founding organizer", detail: "Manila Interface Club · 2020 — 2022" },
];

const achievements = [
  { id: 1, name: "Built products used by 2.4m people", detail: "Impact statement" },
  { id: 2, name: "Awwwards Honorable Mention", detail: "Recognition · 2024" },
];

function Mark() {
  return <span className="eclipse-mark" aria-hidden="true" />;
}

function StateSwitch({ mode, onChange }: { mode: "login" | "editor"; onChange: (mode: "login" | "editor") => void }) {
  return (
    <div className="state-switch" aria-label="Mockup state">
      <button type="button" className={mode === "login" ? "is-active" : ""} onClick={() => onChange("login")}>Login</button>
      <button type="button" className={mode === "editor" ? "is-active" : ""} onClick={() => onChange("editor")}>Editor</button>
    </div>
  );
}

function Login({ onLogin, onSwitch }: { onLogin: () => void; onSwitch: (mode: "login" | "editor") => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Enter your editor credentials to continue.");
      return;
    }
    setError("");
    onLogin();
  }

  return (
    <main className="edit-mockup edit-current">
      <div className="current-state-bar"><StateSwitch mode="login" onChange={onSwitch} /></div>
      <section className="current-login" aria-labelledby="current-login-title">
        <div className="current-login-shell">
          <div className="current-login-copy">
            <a href="#public-profile" onClick={(event) => event.preventDefault()}>Return to public profile <ArrowUpRight className="icon" /></a>
            <p className="current-identity">Mark Andrei / Portfolio</p>
            <h1 id="current-login-title">Shape the story <span>behind the work.</span></h1>
          </div>
          <div className="current-login-panel">
            <header><Mark /><div><h2>Sign in to edit portfolio</h2><p>Private control center</p></div></header>
            <form className="current-form" onSubmit={submit}>
              <label>Username<input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="mark.andrei" autoComplete="username" /></label>
              <label className="current-password">Password<input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" autoComplete="current-password" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}</button></label>
              {error && <p className="current-error" role="alert">{error}</p>}
              <button className="current-login-button" type="submit">Continue to editor</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function ListSection({ section }: { section: Section }) {
  const list = section === "projects" ? projects : section === "experience" ? experience : section === "leadership" ? leadership : section === "achievements" ? achievements : [];
  const title = sections.find((item) => item.id === section)?.label ?? section;
  const note = sections.find((item) => item.id === section)?.note ?? "";
  return (
    <section className="current-section">
      <div className="current-section-head"><h2>{title}</h2><p>{note}. Drag rows to adjust the public order.</p></div>
      <div className="current-list">
        {list.map((item) => <div className="current-list-row" key={item.id}><div><strong>{item.name}</strong><small>{item.detail}</small></div><div className="current-row-actions">{section === "projects" && item.id === 1 && <span className="current-pill">Featured</span>}<button type="button" aria-label={`Edit ${item.name}`}><Pencil className="icon" /></button><button type="button" aria-label={`Reorder ${item.name}`}><GripVertical className="icon" /></button></div></div>)}
      </div>
      <button type="button" className="current-save"><Save className="icon" /> Add {title.toLowerCase().replace(/s$/, "")}</button>
    </section>
  );
}

function Editor({ onLogout, onSwitch }: { onLogout: () => void; onSwitch: (mode: "login" | "editor") => void }) {
  const [active, setActive] = useState<Section>("profile");
  const [fullName, setFullName] = useState("Mark Andrei");
  const [headline, setHeadline] = useState("Design engineer building calm, useful software.");
  const [about, setAbout] = useState("I work across product, interface, and systems — making digital tools feel more legible and more human.");
  const [saved, setSaved] = useState("Saved just now");

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved("Saved just now");
  }

  return (
    <main className="edit-mockup edit-current">
      <div className="current-admin">
        <header className="current-topbar">
          <div className="current-brand"><Mark /><div><strong>Mark Andrei</strong><small>Portfolio / Edit</small></div></div>
          <div className="current-actions"><span className="current-pill">{saved}</span><a href="#public-profile" onClick={(event) => event.preventDefault()}><ExternalLink className="icon" /><span>View site</span></a><button type="button" onClick={onLogout}><LogOut className="icon" /><span>Log out</span></button></div>
        </header>
        <div className="current-state-bar"><StateSwitch mode="editor" onChange={onSwitch} /></div>
        <section className="current-intro"><p>Control center / 08 sections</p><h1>Edit the signal.</h1><span>Keep the portfolio current without losing the shape of the story.</span></section>
        <div className="current-layout">
          <nav className="current-nav" aria-label="Editor sections"><span>Sections</span>{sections.map((item) => <button type="button" className={active === item.id ? "is-active" : ""} key={item.id} onClick={() => setActive(item.id)}><strong>{item.label}</strong><small>{item.note}</small></button>)}</nav>
          <div className="current-workspace">
            {active === "profile" ? <section className="current-section">
              <div className="current-section-head"><h2>Profile and links</h2><p>Homepage-visible fields only. Changes stay local in this preview.</p></div>
              <form className="current-fields" onSubmit={saveProfile}>
                <label className="current-field">Full name<input value={fullName} onChange={(event) => setFullName(event.target.value)} /></label>
                <label className="current-field">Location<input defaultValue="Manila, Philippines" /></label>
                <label className="current-field wide">Headline<input value={headline} onChange={(event) => setHeadline(event.target.value)} /></label>
                <label className="current-field wide">About<textarea value={about} onChange={(event) => setAbout(event.target.value)} /></label>
                <label className="current-field">Email<input defaultValue="hello@markandrei.dev" /></label>
                <label className="current-field">GitHub<input defaultValue="github.com/markandrei" /></label>
                <label className="current-field">Hero tagline<input defaultValue="A little closer to the light." /></label>
                <label className="current-field">Availability<input defaultValue="Open to select projects" /></label>
                <button className="current-save wide" type="submit"><Save className="icon" /> Save profile</button>
              </form>
            </section> : active === "resume" ? <section className="current-section"><div className="current-section-head"><h2>Resume</h2><p>Replace the PDF linked from the public profile.</p></div><div className="current-list-row"><div><strong>mark-andrei-resume.pdf</strong><small>Uploaded 14 Jun 2024 · 284 KB</small></div><span className="current-pill">Current</span></div><button type="button" className="current-save"><Save className="icon" /> Upload resume</button></section> : active === "site-media" ? <section className="current-section"><div className="current-section-head"><h2>Site media</h2><p>Favicon and social preview image.</p></div><div className="current-fields"><label className="current-field">Favicon<input type="file" /></label><label className="current-field">Social preview<input type="file" /></label></div><button type="button" className="current-save"><Save className="icon" /> Upload selected media</button></section> : <ListSection section={active} />}
            <p className="current-section-foot">Need to check the public output? <a href="#public-profile" onClick={(event) => event.preventDefault()}>Open profile <ArrowUpRight className="icon" /></a></p>
          </div>
        </div>
      </div>
    </main>
  );
}

export function Current() {
  const [mode, setMode] = useState<"login" | "editor">("login");
  return mode === "login" ? <Login onLogin={() => setMode("editor")} onSwitch={setMode} /> : <Editor onLogout={() => setMode("login")} onSwitch={setMode} />;
}