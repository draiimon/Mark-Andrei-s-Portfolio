import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "radial-gradient(circle at 78% 18%, rgba(255,153,0,0.3), transparent 36%), radial-gradient(circle at 18% 82%, rgba(255,255,255,0.1), transparent 34%), linear-gradient(165deg, #080a0e 0%, #121722 100%)",
          color: "#ffffff"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontSize: 66, fontWeight: 900, lineHeight: 1.06 }}>
            Mark Andrei,
            <div style={{ fontSize: 38, fontWeight: 700, color: "#ff9900", marginTop: 12 }}>
              Portfolio
            </div>
          </div>
          <div
            style={{
              width: 128,
              height: 128,
              borderRadius: 28,
              border: "2px solid rgba(255,153,0,0.58)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ff9900",
              fontSize: 58,
              fontWeight: 900
            }}
          >
            MA
          </div>
        </div>
        <div style={{ fontSize: 28, color: "#d5d9e0", marginTop: 24, lineHeight: 1.36, maxWidth: "88%" }}>
          Entry-level DevOps and Software Developer focused on practical applications, reliable systems, and continuous growth.
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ fontSize: 20, color: "#ffcc84", fontWeight: 600 }}>
            DevOps - Software Developer - Leadership
          </div>
          <div style={{ fontSize: 20, color: "#c9ced6" }}>Portfolio Preview</div>
        </div>
      </div>
    ),
    size
  );
}

