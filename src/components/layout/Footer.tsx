import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

const footerLinks = {
  platform: {
    title: 'პლატფორმა',
    links: [
      { href: '/tutors', label: 'ექსპერტები' },
      { href: '/#how-it-works', label: 'როგორ მუშაობს' },
      { href: '/faq', label: 'კითხვები' },
    ],
  },
  account: {
    title: 'ანგარიში',
    links: [
      { href: '/login', label: 'შესვლა' },
      { href: '/register', label: 'რეგისტრაცია' },
      { href: '/register?role=tutor', label: 'გახდი ექსპერტი' },
    ],
  },
  company: {
    title: 'კომპანია',
    links: [
      { href: '/contact', label: 'კონტაქტი' },
      { href: '/faq', label: 'დახმარება' },
    ],
  },
};

export function Footer() {
  return (
    <footer className="border-border bg-muted/30 border-t">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <GraduationCap className="text-primary size-5" />
              <span>Tutor</span>
            </Link>
            <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
              ონლაინ სწავლების მარტივი გზა — დაუკავშირდი საუკეთესო ექსპერტებს.
            </p>
          </div>

          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="mb-4 text-sm font-semibold">{section.title}</h3>
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

        <div className="border-border mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} Tutor. ყველა უფლება დაცულია.
          </p>
          <div className="flex gap-4">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              კონფიდენციალურობა
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              წესები
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
