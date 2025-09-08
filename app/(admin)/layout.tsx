import { ReactNode } from "react";

// This layout wraps all pages inside the (admin) group.
// It's where you'll define the unique "Mission Control" theme.
export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        // This div would contain the unique styling for the admin section,
        // such as the "HUD" grid overlay or a nebula background.
        <div className="bg-slate-950 text-slate-200 min-h-screen">
            {/* The `children` prop will render the specific page, like the
                login page or the main dashboard. */}
            {children}
        </div>
    );
}