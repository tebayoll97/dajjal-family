import DesignSystemClient from "./DesignSystemClient";

export const metadata = {
  title: "Design System | Dajjal Family",
  description: "Internal preview of Dajjal Family design tokens and shared UI primitives.",
  robots: { index: false, follow: false },
};

export default function DesignSystemPreviewPage() {
  return <DesignSystemClient />;
}
