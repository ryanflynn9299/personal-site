import { redirect } from "next/navigation";

export default function TermsPage() {
  redirect("/policies?tab=terms");
}
