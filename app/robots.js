const origin = "https://dajjalfamily.com";

const privatePathPrefixes = [
  "/admin",
  "/contributors/shell",
  "/profile",
  "/settings",
  "/login",
  "/register",
  "/design-system",
  "/character-test",
  "/df/profile-couple-maker",
  "/app/create-profile-couple",
];

const privateExactPaths = [];

const disallow = [
  "/api",
  ...privatePathPrefixes.flatMap((path) => [path, `/id${path}`, `/en${path}`]),
  ...privateExactPaths.flatMap((path) => [`${path}$`, `/id${path}$`, `/en${path}$`]),
];

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
