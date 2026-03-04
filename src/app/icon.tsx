import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 512,
  height: 512
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          background:
            "radial-gradient(circle at 22% 20%, rgba(255,153,0,0.34), transparent 42%), radial-gradient(circle at 80% 76%, rgba(255,255,255,0.13), transparent 36%), linear-gradient(160deg, #07090c 0%, #121722 100%)",
          color: "#ff9900"
        }}
      >
        <div
          style={{
            width: 370,
            height: 370,
            borderRadius: 88,
            border: "3px solid rgba(255,153,0,0.62)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 80px rgba(255,153,0,0.22) inset"
          }}
        >
          <span
            style={{
              fontSize: 180,
              fontWeight: 900,
              letterSpacing: "-0.06em",
              transform: "translateY(-4px)"
            }}
          >
            MA
          </span>
        </div>
      </div>
    ),
    size
  );
}
