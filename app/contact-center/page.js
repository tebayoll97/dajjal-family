import ContactCenterMember from "@/app/components/ContactCenterMember";

export const metadata = {
  title: "Contact Center",
  description: "Contact the DAJJAL FAMILY support team through your account.",
  robots: { index: false, follow: false },
};

export default function ContactCenterPage() {
  return <ContactCenterMember />;
}
