import Link from "next/link";

const navItems = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Vitae", href: "/vitae" },
  { name: "Blog", href: "/blog" },
  { name: "Contact", href: "/contact" },
];

// The text next to my name in the header
const epithet = "// Building Scalable Systems";
// const epithet2 = "// Crafting Code and Content";
// const epithet3 = "// Java • Python • PostgreSQL ";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-700 bg-slate-800/80 backdrop-blur-sm shadow-md shadow-black/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-baseline">
            <Link
              href="/"
              className="text-xl font-bold text-slate-50 font-heading"
            >
              Ryan Flynn
            </Link>
            <span className="text-sm ml-2 hidden text-slate-400 md:inline-block">
              {epithet}
            </span>
          </div>
          <nav>
            <ul className="flex items-center space-x-6">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-slate-300 transition-colors hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
