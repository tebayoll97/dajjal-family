export const metadata = {
  title: {
    default: "Admin Control Center",
    template: "%s | Dajjal Family Admin",
  },
  description: "Private Dajjal Family administration workspace.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export default function AdminLayout({ children }) {
  return children;
}
