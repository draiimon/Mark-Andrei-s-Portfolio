import { useState, type FormEvent } from "react";
import { ArrowUpRight, BriefcaseBusiness, Check, ChevronRight, CloudUpload, ExternalLink, FileText, GripVertical, Image, LogOut, Pencil, Plus, Quote, Radio, Save, Settings2, ShieldCheck, Trophy, UserRound, UsersRound, Eye, EyeOff } from "lucide-react";
import "./_group.css";

type Section = "profile" | "projects" | "experience" | "leadership" | "taglines" | "achievements" | "resume" | "site-media";
type Mode = "login" | "editor";

const sections: Array<{ id: Section; label: string; note: string; icon: typeof UserRound }> = [
  { id: "profile", label: "Profile", note: "Identity and links", icon: UserRound },
  { id: "projects", label: "Projects", note: "Featured work", icon: BriefcaseBusiness },
  { id: "experience", label: "Experience", note: "Career timeline", icon: Radio },
  { id: "leadership", label: "Leadership", note: "Communities", icon: UsersRound },
  { id: "taglines", label: "Taglines", note: "Hero rotation", icon: Quote },
  { id: "achievements", label: "Achievements", note: "Proof points", icon: Trophy },
  { id: "resume", label: "Resume", note: "PDF document", icon: FileText },
  { id: "site-media", label: "Site media", note: "Favicon and social", icon: Image },
];

const records: Record<"projects" | "experience" | "leadership" | "taglines" | "achievements", Array<{ id: number; name: string; detail: string; badge?: string }>> = {
  projects: [
    { id: 1, name: "Morrow / climate ledger", detail: "Product design · 2024", badge: "Featured" },
    { id: 2, name: "Northstar systems", detail: "Frontend engineering · 2024" },
    { id: 3, name: "Sundial archive", detail: "Research tool · 2023" },
  ],
  experience: [
    { id: 1, name: "Senior Product Engineer", detail: "Field Notes Studio · 2023 — now" },
    { id: 2, name: "Design Engineer", detail: "Radian Labs · 2021 — 2023" },
  ],
  leadership: [
    { id: 1, name: "Creative coding mentor", detail: "Open Source Design · 2022 — now" },
    { id: 2, name: "Founding organizer", detail: "Manila Interface Club · 2020 — 2022" },
  ],
  taglines: [
    { id: 1, name: "A little closer to the light.", detail: "Hero line · active" },
    { id: 2, name: "Useful things, carefully made.", detail: "Hero line · alternate" },
    { id: 3, name: "Designing the space between.", detail: "Hero line · alternate" },
  ],
  achievements: [
    { id: 1, name: "Built products used by 2.4m people", detail: "Impact statement" },
    { id: 2, name: "Awwwards Honorable Mention", detail: "Recognition · 2024" },
  ],
};

function Mark() {
  return <span className="eclipse-mark" aria-hidden="true" />;
}

function StateSwitch({ mode, onChange }: { mode: Mode; onChange: (mode: Mode) => void }) {
  return <div className="state-switch" aria-label="Mockup state"><button type="button" className={mode === "login" ? "is-active" : ""} onClick={() => onChange("login")}>Login</button><button type="button" className={mode === "editor" ? "is-active" : ""} onClick={() => onChange("editor")}>Editor</button></div>;
}

function RefinedLogin({ onLogin, onSwitch }: { onLogin: () => void; onSwitch: (mode: Mode) => void }) {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Enter your username and password to continue.");
      return;
    }
    setError("");
    onLogin();
  }

  return (
    <main className="edit-mockup edit-refined">
      <div className="refined-state-bar"><StateSwitch mode="login" onChange={onSwitch} /></div>
      <section className="refined-login" aria-labelledby="refined-login-title">
        <div className="refined-login-grid">
          <div className="refined-login-story"><span className="micro-label">Mark Andrei / Portfolio</span><h1 id="refined-login-title">Shape the story <em>behind the work.</em></h1><p>The quiet room behind the public portfolio. Tune the signal, keep the good parts, and send the work back into the world.</p><a href="#public-profile" onClick={(event) => event.preventDefault()}>Return to public profile <ArrowUpRight className="icon" /></a></div>
          <div className="refined-orbit" aria-hidden="true"><span className="refined-orbit-core" /></div>
          <div className="refined-login-card">
            <header><div><Mark /><div><h2>Portfolio / Edit</h2><p>Private control center</p></div></div><ShieldCheck className="icon" aria-label="Secure sign in" /></header>
            <form className="refined-form" onSubmit={submit}>
              <label>Username<input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="mark.andrei" autoComplete="username" /></label>
              <label className="refined-password">Password<input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" autoComplete="current-password" /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}</button></label>
              {error && <p className="refined-error" role="alert">{error}</p>}
              <button type="submit" className="refined-submit">Continue to editor <ChevronRight className="icon" /></button>
              <p className="refined-form-note">Your session is protected by the portfolio server.</p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function RefinedList({ section, onSave }: { section: "projects" | "experience" | "leadership" | "taglines" | "achievements"; onSave: (message: string) => void }) {
  const title = sections.find((item) => item.id === section)?.label ?? section;
  const note = sections.find((item) => item.id === section)?.note ?? "";
  return <section className="refined-section"><header className="refined-section-head"><div><span className="section-index">0{sections.findIndex((item) => item.id === section) + 1} / 08</span><h2>{title}</h2><p>{note}. Drag to change the public order.</p></div><span className="refined-updated">UPDATED 14 JUN 2024</span></header><div className="refined-list">{records[section].map((record) => <div className="refined-list-row" key={record.id}><div className="refined-list-main"><GripVertical className="icon list-handle" /><div><strong>{record.name}</strong><small>{record.detail}</small></div></div><div className="refined-row-actions">{record.badge && <span className="refined-badge">{record.badge}</span>}<button type="button" aria-label={`Edit ${record.name}`} onClick={() => onSave(`${record.name} ready to edit`)}><Pencil className="icon" /></button><button type="button" aria-label={`Reorder ${record.name}`} onClick={() => onSave(`${title} order updated`)}><GripVertical className="icon" /></button></div></div>)}</div><div className="refined-actions"><small>{records[section].length} items · changes save locally in this preview</small><button type="button" className="refined-primary" onClick={() => onSave(`${title.slice(0, -1)} draft created`)}><Plus className="icon" /> Add {title.slice(0, -1).toLowerCase()}</button></div></section>;
}

function RefinedEditor({ onLogout, onSwitch }: { onLogout: () => void; onSwitch: (mode: Mode) => void }) {
  const [active, setActive] = useState<Section>("profile");
  const [fullName, setFullName] = useState("Mark Andrei");
  const [headline, setHeadline] = useState("Design engineer building calm, useful software.");
  const [location, setLocation] = useState("Manila, Philippines");
  const [about, setAbout] = useState("I work across product, interface, and systems — making digital tools feel more legible and more human.");
  const [toast, setToast] = useState("");
  const [saved, setSaved] = useState("All changes saved");

  function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved("Saved just now");
    setToast("Profile changes saved");
    window.setTimeout(() => setToast(""), 2400);
  }

  function notify(message: string) {
    setSaved("Saved just now");
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  return (
    <main className="edit-mockup edit-refined">
      <div className="refined-editor">
        <header className="refined-topbar">
          <div className="refined-identity"><Mark /><div><strong>Mark Andrei</strong><small>Portfolio / Edit</small></div></div>
          <div className="refined-top-actions"><span className="refined-save-state"><span className="saving-dot" />{saved}</span><a href="#public-profile" onClick={(event) => event.preventDefault()}><ExternalLink className="icon" /><span>View site</span></a><button type="button" onClick={onLogout}><LogOut className="icon" /><span>Log out</span></button></div>
        </header>
        <div className="refined-state-bar"><StateSwitch mode="editor" onChange={onSwitch} /></div>
        <section className="refined-intro"><div><span className="micro-label">Control center / 08 sections</span><h1>Edit the <em>signal.</em></h1></div><p className="refined-intro-copy">Keep the portfolio current without losing the shape of the story.</p></section>
        <div className="refined-layout">
          <nav className="refined-nav" aria-label="Editor sections"><span className="nav-kicker">Sections</span>{sections.map(({ id, label, note, icon: Icon }) => <button type="button" key={id} className={active === id ? "is-active" : ""} onClick={() => setActive(id)}><Icon className="nav-icon" /><span>{label}<small>{note}</small></span></button>)}</nav>
          <div className="refined-content">
            {active === "profile" && <section className="refined-section">
              <header className="refined-section-head"><div><span className="section-index">01 / 08</span><h2>Profile and links</h2><p>Homepage-visible fields only. This is the voice people meet first.</p></div><span className="refined-updated">UPDATED 14 JUN 2024</span></header>
              <form onSubmit={saveProfile}>
                <div className="refined-fields">
                  <div className="refined-field"><label htmlFor="refined-name">Full name</label><input id="refined-name" value={fullName} onChange={(event) => setFullName(event.target.value)} /></div>
                  <div className="refined-field"><label htmlFor="refined-location">Location</label><input id="refined-location" value={location} onChange={(event) => setLocation(event.target.value)} /></div>
                  <div className="refined-field wide"><label htmlFor="refined-headline">Headline</label><input id="refined-headline" value={headline} onChange={(event) => setHeadline(event.target.value)} /></div>
                  <div className="refined-field wide"><label htmlFor="refined-about">About</label><textarea id="refined-about" value={about} onChange={(event) => setAbout(event.target.value)} /></div>
                  <div className="refined-field"><label htmlFor="refined-email">Email</label><input id="refined-email" defaultValue="hello@markandrei.dev" /></div>
                  <div className="refined-field"><label htmlFor="refined-github">GitHub</label><input id="refined-github" defaultValue="github.com/markandrei" /></div>
                  <div className="refined-field"><label htmlFor="refined-tagline">Hero tagline</label><input id="refined-tagline" defaultValue="A little closer to the light." /></div>
                  <div className="refined-field"><label htmlFor="refined-availability">Availability</label><input id="refined-availability" defaultValue="Open to select projects" /></div>
                </div>
                <div className="refined-actions"><small>Profile is the active public section</small><button type="submit" className="refined-primary"><Save className="icon" /> Save profile</button></div>
              </form>
            </section>}
            {(active === "projects" || active === "experience" || active === "leadership" || active === "taglines" || active === "achievements") && <RefinedList section={active} onSave={notify} />}
            {active === "resume" && <section className="refined-section"><header className="refined-section-head"><div><span className="section-index">07 / 08</span><h2>Resume</h2><p>Replace the PDF linked from the public profile.</p></div><span className="refined-updated">PUBLIC LINK ACTIVE</span></header><div className="refined-upload"><span className="upload-icon"><CloudUpload className="icon" /></span><div><strong>mark-andrei-resume.pdf</strong><p>Uploaded 14 Jun 2024 · 284 KB</p></div><button type="button" onClick={() => notify("Resume upload queued")}>Replace PDF</button></div><div className="refined-actions"><small>PDF, up to 10 MB</small><button type="button" className="refined-primary" onClick={() => notify("Resume opened")}><FileText className="icon" /> Open current</button></div></section>}
            {active === "site-media" && <section className="refined-section"><header className="refined-section-head"><div><span className="section-index">08 / 08</span><h2>Site media</h2><p>Favicon and social preview image.</p></div><span className="refined-updated">2 ASSETS LIVE</span></header><div className="refined-upload"><span className="upload-icon"><Settings2 className="icon" /></span><div><strong>Favicon / mark-andrei.png</strong><p>Browser tab icon · 512 × 512</p></div><button type="button" onClick={() => notify("Favicon picker opened")}>Replace</button></div><div className="refined-upload" style={{ marginTop: "0.7rem" }}><span className="upload-icon"><Image className="icon" /></span><div><strong>Social preview / eclipse-card.jpg</strong><p>Open Graph image · 1200 × 630</p></div><button type="button" onClick={() => notify("Social image picker opened")}>Replace</button></div><div className="refined-actions"><small>Images are shown on the public profile</small><button type="button" className="refined-primary" onClick={() => notify("Media saved")}><Check className="icon" /> Save media</button></div></section>}
          </div>
        </div>
        {toast && <div className="refined-toast" role="status"><Check className="icon" />{toast}</div>}
      </div>
    </main>
  );
}

export function Refined() {
  const [mode, setMode] = useState<Mode>("editor");
  return mode === "login" ? <RefinedLogin onLogin={() => setMode("editor")} onSwitch={setMode} /> : <RefinedEditor onLogout={() => setMode("login")} onSwitch={setMode} />;
}