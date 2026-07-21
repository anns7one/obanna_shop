import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2d2a32",
          borderRadius: "50%",
        }}
      >
        <span
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontWeight: 700,
            fontSize: 64,
            letterSpacing: -3,
            color: "#fffdfb",
          }}
        >
          OBA
        </span>
      </div>
    ),
    { ...size },
  );
}
