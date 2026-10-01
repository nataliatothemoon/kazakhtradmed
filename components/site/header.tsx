import Link from "next/link";
import { Leaf } from "lucide-react";

const links = [
  { href: "/plants", label: "Catalog" },
  { href: "/consult", label: "Skin consult" },
  { href: "/sources", label: "Sources" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-border/80 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/" className="flex items-center gap-2 font-heading text-lg tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Leaf className="size-4" />
          </span>
          <span>
            Dala dári
            <span className="mt-0.5 block text-xs font-sans font-normal text-muted-foreground">
              Kazakh traditional medicine catalog
            </span>
          </span>
        </Link>
        <nav className="flex flex-wrap gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-1.5 text-sm text-foreground/80 hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/80 px-4 py-8 text-sm text-muted-foreground">
      <div className="mx-auto max-w-6xl space-y-2">
        <p>
          Educational catalog of published ethnobotany and phytochemistry. Not
          medical advice, not a diagnosis, and not a substitute for a licensed
          clinician or a traditional practitioner.
        </p>
        <p>Records cite Zhao et al. 2025, Berganayeva et al. 2023, and Nurlybekova et al. 2022.</p>
      </div>
    </footer>
  );
}
