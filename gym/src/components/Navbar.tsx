import { useState } from 'react'
import { Link } from 'react-router-dom'

const links = [
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#memberships', label: 'Memberships' },
  { href: '#schedule', label: 'Schedule' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="font-display text-2xl tracking-widest text-white">
          CORE<span className="text-volt">NERGY</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-steel transition hover:text-white">
              {l.label}
            </a>
          ))}
          <Link
            to="/book-trial"
            className="rounded-full bg-volt px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-voltLight"
          >
            Book Free Trial
          </Link>
        </nav>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-md border border-line md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <span className="sr-only">Menu</span>
          <div className="space-y-1.5">
            <span className="block h-0.5 w-5 bg-white" />
            <span className="block h-0.5 w-5 bg-white" />
            <span className="block h-0.5 w-5 bg-white" />
          </div>
        </button>
      </div>

      {open && (
        <nav className="border-t border-line bg-ink px-5 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-steel hover:text-white">
                {l.label}
              </a>
            ))}
            <Link
              to="/book-trial"
              onClick={() => setOpen(false)}
              className="rounded-full bg-volt px-5 py-3 text-center font-semibold text-white"
            >
              Book Free Trial
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
