import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Use direct supabase client for OG image generation
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: startup } = await supabase
    .from("startups")
    .select("name, one_liner, industry, city, stage, verification_tier")
    .eq("slug", slug)
    .single();

  const name = startup?.name || "TFC Startup";
  const oneLiner = startup?.one_liner || "Building the future on campus";
  const meta = `${startup?.industry || "Tech"} · ${startup?.city || "India"} · ${startup?.stage || "Venture"}`;
  const tier = startup?.verification_tier === "tfc_backed" ? "TFC BACKED" : startup?.verification_tier === "verified" ? "VERIFIED" : "LISTED";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#FFF4E8",
          padding: "60px 80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Glow Accent */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(226,84,42,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                backgroundColor: "#1B1712",
                color: "#FFF4E8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "22px",
              }}
            >
              TFC
            </div>
            <span style={{ fontSize: "24px", fontWeight: 800, color: "#1B1712", letterSpacing: "-0.5px" }}>
              TFC Connect
            </span>
          </div>

          <div
            style={{
              padding: "6px 16px",
              borderRadius: "999px",
              backgroundColor: tier === "TFC BACKED" ? "#E2542A" : tier === "VERIFIED" ? "#1F5A45" : "#1B1712",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 700,
              letterSpacing: "1px",
            }}
          >
            {tier}
          </div>
        </div>

        {/* Center Content */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "950px" }}>
          <h1
            style={{
              fontSize: "64px",
              fontWeight: 900,
              color: "#1B1712",
              letterSpacing: "-2px",
              lineHeight: 1.05,
              margin: 0,
            }}
          >
            {name}
          </h1>
          <p
            style={{
              fontSize: "28px",
              fontWeight: 500,
              color: "#5A4E44",
              lineHeight: 1.35,
              margin: 0,
            }}
          >
            {oneLiner}
          </p>
        </div>

        {/* Bottom Metadata Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid #EAD7C6",
            paddingTop: "24px",
          }}
        >
          <span style={{ fontSize: "20px", fontWeight: 600, color: "#8C7D70" }}>
            {meta}
          </span>
          <span style={{ fontSize: "16px", fontWeight: 600, color: "#E2542A" }}>
            thefuturecouncil.in/startups
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
