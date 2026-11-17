import { getActiveThemePreset } from "@/lib/themeSettings";

export const dynamic = "force-dynamic";

export async function GET() {
  const { preset, source } = await getActiveThemePreset();

  return Response.json(
    { activeThemePreset: preset, source },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    }
  );
}
