const CRITICAL_IMAGES = [
  "/solar-eclipse-logo.svg",
  "/favicon.svg",
  "/icon-192.png",
];
const CRITICAL_VIDEO = "/assets/solar-eclipse-background-pingpong.mp4";

function waitForStylesheets() {
  const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'));
  if (links.length === 0) return Promise.resolve();

  return Promise.all(
    links.map((link) => {
      if (link.sheet) return Promise.resolve();
      return new Promise<void>((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          link.removeEventListener("load", finish);
          link.removeEventListener("error", finish);
          resolve();
        };
        link.addEventListener("load", finish, { once: true });
        link.addEventListener("error", finish, { once: true });
      });
    }),
  ).then(() => undefined);
}

function waitForImage(src: string) {
  return new Promise<void>((resolve) => {
    const image = new Image();
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    image.decoding = "async";
    image.onload = () => {
      void image.decode().catch(() => undefined).finally(finish);
    };
    image.onerror = finish;
    image.src = src;
    if (image.complete) {
      void image.decode().catch(() => undefined).finally(finish);
    }
  });
}

function waitForVideo(src: string) {
  return new Promise<void>((resolve) => {
    const video = document.createElement("video");
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      video.removeEventListener("canplay", finish);
      video.removeEventListener("loadeddata", finish);
      video.removeEventListener("error", finish);
      video.remove();
      resolve();
    };

    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.addEventListener("canplay", finish, { once: true });
    video.addEventListener("loadeddata", finish, { once: true });
    video.addEventListener("error", finish, { once: true });
    video.src = src;
    video.style.cssText = "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;";
    document.body.appendChild(video);
    video.load();
    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) finish();
  });
}

function waitForStablePaint() {
  return new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => resolve());
      });
    });
  });
}

export async function prepareMobileCriticalResources() {
  await Promise.all([
    waitForStylesheets(),
    document.fonts?.ready ?? Promise.resolve(),
    ...CRITICAL_IMAGES.map(waitForImage),
    waitForVideo(CRITICAL_VIDEO),
  ]);
  await waitForStablePaint();
}