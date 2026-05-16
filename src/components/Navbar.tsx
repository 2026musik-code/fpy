import { Film, Search, Home as HomeIcon, Clock, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

export function Navbar() {
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'History', path: '/history', icon: Clock },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 w-full z-50 h-[52px] md:h-[60px] bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 text-rose-500 font-bold text-xl tracking-tight">
          <Film className="w-6 h-6" />
          <span>FYPshort</span>
        </Link>
        
        <div className="flex items-center gap-4 md:gap-6">
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "flex items-center gap-2 text-sm font-medium transition-colors hover:text-rose-400",
                  location.pathname === link.path ? "text-rose-500" : "text-zinc-400"
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 bg-zinc-950/90 backdrop-blur-lg border-t border-white/10 flex items-center justify-between px-6 py-3 safe-area-bottom">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={cn(
              "flex flex-col items-center gap-1 transition-colors",
              location.pathname === link.path ? "text-rose-500" : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            <link.icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{link.name}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
