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
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px",
          background:
            "radial-gradient(circle at 80% 24%, rgba(255,153,0,0.26), transparent 34%), linear-gradient(165deg, #080a0e 0%, #121722 100%)",
          color: "#ffffff"
        }}
      >
        <div style={{ fontSize: 68, fontWeight: 900, lineHeight: 1.06 }}>
          Mark Andrei
        </div>
        <div style={{ fontSize: 40, fontWeight: 700, color: "#ff9900", marginTop: 12 }}>
          Cloud + Dev Portfolio
        </div>
        <div style={{ fontSize: 28, color: "#d5d9e0", marginTop: 24 }}>
          Practical projects, strong growth mindset, and reliable delivery.
        </div>
      </div>
    ),
    size
  );
}
