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
          background:
            "radial-gradient(circle at 20% 20%, rgba(255,153,0,0.35), transparent 45%), linear-gradient(160deg, #0b0d11 0%, #12161d 100%)",
          color: "#ff9900",
          fontSize: 210,
          fontWeight: 900
        }}
      >
        M
      </div>
    ),
    size
  );
}
