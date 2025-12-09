import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "mindak studio",
  version: packageJson.version,
  copyright: `© ${currentYear}, mindak studio.`,
  meta: {
    title: "mindak studio - Modern Next.js Dashboard",
    description:
      "mindak studio is a modern dashboard built with Next.js 16, Tailwind CSS v4, and shadcn/ui.",
  },
};
