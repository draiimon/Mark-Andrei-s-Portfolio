import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 1200,
  height: 630
};

export const contentType = "image/png";

export default function OpenGraphImage() {
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
            "radial-gradient(circle at 82% 18%, rgba(255,153,0,0.3), transparent 34%), radial-gradient(circle at 14% 84%, rgba(255,255,255,0.14), transparent 38%), linear-gradient(170deg, #050608 0%, #0f141d 100%)",
          color: "#ffffff"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1.05 }}>
            Mark Andrei,
            <div style={{ fontSize: 44, fontWeight: 700, color: "#ff9900", marginTop: 14 }}>
              To the clouds.
            </div>
          </div>
          <div
            style={{
              width: 136,
              height: 136,
              borderRadius: 30,
              border: "2px solid rgba(255,153,0,0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ff9900",
              fontSize: 64,
              fontWeight: 900
            }}
          >
            MA
          </div>
        </div>
        <div style={{ fontSize: 29, color: "#d5d9e0", marginTop: 28, maxWidth: "88%", lineHeight: 1.36 }}>
          Entry-level DevOps and Software Developer focused on building practical applications and reliable systems.
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ fontSize: 22, color: "#ffcc84", fontWeight: 600 }}>
            Leadership • DevOps • Software Development
          </div>
          <div style={{ fontSize: 22, color: "#c9ced6" }}>mark-andrei-portfolio.onrender.com</div>
        </div>
      </div>
    ),
    size
  );
}
