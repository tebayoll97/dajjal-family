import "./df.css";

export const metadata = {
  title: {
    default: "Dajjal Family",
    template: "%s | Dajjal Family",
  },
  description: "Enter the Dajjal Family universe: family projects, games, and special events.",
};

export default function DFLayout({ children }) {
  return <div className="df-main">{children}</div>;
}
