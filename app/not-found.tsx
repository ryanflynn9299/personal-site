import { Home, BookOpen } from "lucide-react";
import { SpaceThemedStatusPage } from "@/components/common/SpaceThemedStatusPage";

export default function NotFound() {
  return (
    <SpaceThemedStatusPage
      code="404"
      title="You're lost in space"
      description="The page you're looking for might have been moved, deleted, or never existed in this galaxy. Double-check the URL and try again."
      actions={[
        {
          label: "Return to Home Base",
          href: "/",
          icon: Home,
        },
        {
          label: "Explore the Blog",
          href: "/blog",
          variant: "outline",
          icon: BookOpen,
        },
      ]}
    />
  );
}
