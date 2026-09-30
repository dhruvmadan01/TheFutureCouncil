import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://connect.thefuturecouncil.in";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/startups", "/startups/"],
        disallow: [
          "/match",
          "/messages",
          "/me",
          "/onboarding",
          "/requests",
          "/admin",
          "/api/",
          "/styleguide",
          "/auth/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
