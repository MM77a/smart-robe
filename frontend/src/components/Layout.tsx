import Link from 'next/link';
import { useRouter } from 'next/router';
import { Shirt } from 'lucide-react';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const NAV_LINKS = [
  { href: '/',               label: 'Home'       },
  { href: '/quiz',           label: 'Style Quiz' },
  { href: '/wardrobe',       label: 'Wardrobe'   },
  { href: '/outfits',        label: 'Outfits'    },
  { href: '/tryon',          label: 'Try-On'     },
  { href: '/virtual-try-on', label: 'Demo'       },
];

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useRouter();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-brand-700">
            <Shirt className="w-6 h-6" />
            Smart-Robe
          </Link>
          <ul className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === href
                      ? 'text-brand-600'
                      : 'text-gray-600 hover:text-brand-600'
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-white border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Smart-Robe · AI-Powered Fashion
      </footer>
    </div>
  );
}
