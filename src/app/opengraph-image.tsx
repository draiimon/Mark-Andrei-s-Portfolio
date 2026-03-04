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
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          background:
            "radial-gradient(circle at 85% 20%, rgba(255,153,0,0.28), transparent 34%), radial-gradient(circle at 20% 85%, rgba(255,255,255,0.12), transparent 40%), linear-gradient(170deg, #050608 0%, #0f131a 100%)",
          color: "#ffffff"
        }}
      >
        <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1.05 }}>
          Mark Andrei
        </div>
        <div style={{ fontSize: 44, fontWeight: 700, color: "#ff9900", marginTop: 14 }}>
          To the clouds.
        </div>
        <div style={{ fontSize: 30, color: "#d5d9e0", marginTop: 26, maxWidth: "88%" }}>
          Entry-level Cloud and Developer building reliable systems and practical applications.
        </div>
      </div>
    ),
    size
  );
}
