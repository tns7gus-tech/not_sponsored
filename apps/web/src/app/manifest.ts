import type { MetadataRoute } from "next";

import { SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#f2f4f6",
    theme_color: "#3182f6",
    icons: [
      {
        src: `${getSiteUrl()}/favicon.ico`,
        sizes: "48x48",
        type: "image/x-icon",
      },
    ],
  };
}
