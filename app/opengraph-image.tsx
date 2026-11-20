import { ImageResponse } from "next/og";
import { site } from "@/content";

export const alt = "Hisyam Syafa Raditya — Informatics Engineering, ITS";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#050507",
          color: "#F4F4F0",
          padding: 72,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 720,
            height: 720,
            borderRadius: 9999,
            top: -280,
            right: -140,
            background:
              "radial-gradient(circle, rgba(244,244,240,0.34) 0%, rgba(244,244,240,0.06) 55%, rgba(244,244,240,0) 72%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 620,
            height: 620,
            borderRadius: 9999,
            bottom: -300,
            left: -120,
            background:
              "radial-gradient(circle, rgba(169,171,179,0.28) 0%, rgba(169,171,179,0.05) 55%, rgba(169,171,179,0) 72%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 540,
            height: 540,
            borderRadius: 9999,
            bottom: -260,
            right: 80,
            background:
              "radial-gradient(circle, rgba(200,255,62,0.1) 0%, rgba(200,255,62,0) 68%)",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            letterSpacing: 3,
            fontFamily: "monospace",
            color: "#A9ABB3",
            textTransform: "uppercase",
          }}
        >
          <span>HSR · Portfolio</span>
          <span>Surabaya · 2026</span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              fontSize: 150,
              lineHeight: 0.86,
              fontWeight: 900,
              letterSpacing: -9,
              textTransform: "uppercase",
              maxWidth: 1000,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Hisyam</span>
            <span style={{ display: "flex", gap: 28 }}>
              <span>Syafa</span>
              <span style={{ color: "transparent", WebkitTextStroke: "2px #F4F4F0" }}>
                Raditya
              </span>
            </span>
          </div>
          <div
            style={{
              marginTop: 30,
              fontSize: 25,
              color: "#A9ABB3",
              letterSpacing: 1,
            }}
          >
            {site.monoLine}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
