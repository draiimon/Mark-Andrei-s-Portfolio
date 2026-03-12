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
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 32,
            padding: "26px 30px",
            background: "rgba(255,255,255,0.04)"
          }}
        >
          <div style={{ fontSize: 68, fontWeight: 900, lineHeight: 1.04 }}>
            Mark Andrei,
            <div style={{ fontSize: 36, fontWeight: 700, color: "#ff9900", marginTop: 14 }}>
              DevOps & Software Developer
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
        <div style={{ fontSize: 28, color: "#e4e8ef", marginTop: 24, maxWidth: "90%", lineHeight: 1.36 }}>
          Entry-level DevOps and Software Developer focused on practical applications, reliable systems, and continuous growth through hands-on work.
        </div>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: 20
          }}
        >
          <div style={{ fontSize: 21, color: "#ffcc84", fontWeight: 600 }}>
            Portfolio
          </div>
          <div style={{ fontSize: 20, color: "#c9ced6" }}>mark-andrei-portfolio.onrender.com</div>
        </div>
      </div>
    ),
    size
  );
}

