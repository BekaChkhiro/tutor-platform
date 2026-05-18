import Link from 'next/link';

const FOOTER_SECTIONS = [
  {
    heading: 'Platform',
    links: [
      { href: '/tutors', label: 'Browse Tutors' },
      { href: '/register/tutor', label: 'Become a Tutor' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { href: '/faq', label: 'FAQ' },
      { href: '/contact', label: 'Contact Us' },
    ],
  },
  {
    heading: 'Account',
    links: [
      { href: '/login', label: 'Sign In' },
      { href: '/register', label: 'Register' },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="border-border bg-background border-t">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-foreground font-semibold">
              Tutor
            </Link>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Online tutoring marketplace — book sessions with expert tutors.
            </p>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.heading}>
              <h3 className="text-foreground mb-3 text-sm font-semibold">{section.heading}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-border mt-10 border-t pt-6">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Tutor. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
