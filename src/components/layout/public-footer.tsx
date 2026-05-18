import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

const footerLinks = {
  platform: {
    title: 'პლატფორმა',
    links: [
      { href: '/tutors', label: 'მასწავლებლები' },
      { href: '/consultations', label: 'კონსულტაციები' },
      { href: '/register/tutor', label: 'გახდი მასწავლებელი' },
    ],
  },
  info: {
    title: 'ინფო',
    links: [
      { href: '/faq', label: 'ხშირი შეკითხვები' },
      { href: '/contact', label: 'კონტაქტი' },
    ],
  },
  legal: {
    title: 'სამართლებრივი',
    links: [
      { href: '/privacy', label: 'კონფიდენციალურობა' },
      { href: '/terms', label: 'წესები და პირობები' },
    ],
  },
};

const socialLinks = [
  {
    href: 'https://facebook.com',
    label: 'Facebook',
    path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
  },
  {
    href: 'https://instagram.com',
    label: 'Instagram',
    path: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zm1.5-4.87h.01M7.5 20.5h9a5 5 0 0 0 5-5v-9a5 5 0 0 0-5-5h-9a5 5 0 0 0-5 5v9a5 5 0 0 0 5 5z',
  },
  {
    href: 'https://linkedin.com',
    label: 'LinkedIn',
    path: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  },
  {
    href: 'https://youtube.com',
    label: 'YouTube',
    path: 'M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z',
  },
];

export function PublicFooter() {
  return (
    <footer className="border-border bg-background border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-5">
          {/* Brand column */}
          <div className="col-span-2 flex flex-col gap-4 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <GraduationCap className="text-primary h-6 w-6" />
              <span className="text-foreground text-lg font-semibold">Tutor</span>
            </Link>
            <p className="text-muted-foreground max-w-xs text-sm">
              ონლაინ სწავლების პლატფორმა. აღმოაჩინე სფეციალისტი, დაჯავშნე კონსულტაცია.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              {socialLinks.map(({ href, label, path }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
            {/* Contact */}
            <p className="text-muted-foreground text-sm">info@tutor.ge</p>
          </div>

          {/* Link columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title} className="flex flex-col gap-3">
              <h3 className="text-foreground text-sm font-semibold">{section.title}</h3>
              <ul className="flex flex-col gap-2">
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

        <div className="border-border mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
          <p className="text-muted-foreground text-xs">
            &copy; {new Date().getFullYear()} Tutor. ყველა უფლება დაცულია.
          </p>
          {/* Language switcher — Georgian only, disabled */}
          <div className="flex items-center gap-1">
            <span className="text-foreground rounded bg-gray-100 px-2 py-0.5 text-xs font-medium dark:bg-gray-800">
              ქართ
            </span>
            <span
              className="text-muted-foreground cursor-not-allowed rounded px-2 py-0.5 text-xs opacity-40"
              title="მალე"
            >
              ENG
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
