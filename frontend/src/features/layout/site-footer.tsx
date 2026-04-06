import Link from "next/link";

export function SiteFooter() {
  return (
    <footer
      id="contact"
      className="mt-auto border-t border-border/60 bg-canvas-alt/80 px-6 py-8 sm:px-8 lg:px-10"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-text-secondary">
            Contact
          </p>
          <Link
            href="mailto:hello@dogshelter.example"
            className="font-display text-lg font-bold text-primary transition-colors hover:text-brand-alt"
          >
            Get in touch
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="#"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-social-well font-display text-sm font-bold text-primary transition-opacity hover:opacity-90"
            aria-label="Facebook"
          >
            FB
          </a>
          <a
            href="#"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-social-well font-display text-sm font-bold text-primary transition-opacity hover:opacity-90"
            aria-label="Instagram"
          >
            IG
          </a>
        </div>
      </div>
    </footer>
  );
}
