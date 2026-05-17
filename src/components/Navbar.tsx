import { useState } from 'react';
import { Film, Search, Home as HomeIcon, Clock, User, Crown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { CheckoutModal } from './CheckoutModal';
import { motion } from 'motion/react';

export function Navbar() {
  const location = useLocation();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Search', path: '/search', icon: Search },
    { name: 'History', path: '/history', icon: Clock },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />

      {/* Top Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 w-full z-50 h-[56px] md:h-[64px] bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 md:px-8 shadow-sm"
      >
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform duration-300">
            <Film className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">FYPshort</span>
        </Link>
        
        <div className="flex items-center gap-4 md:gap-8">
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={cn(
                    "relative flex items-center gap-2 text-sm font-bold transition-colors py-2 px-1 group",
                    isActive ? "text-rose-500" : "text-zinc-400 hover:text-rose-400"
                  )}
                >
                  <link.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", isActive && "text-rose-500")} />
                  {link.name}
                  {isActive && (
                    <motion.div 
                      layoutId="nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCheckoutOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-orange-400 to-yellow-500 text-black px-4 py-2 rounded-xl font-black text-xs shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] transition-all overflow-hidden relative group"
          >
            <div className="absolute inset-0 bg-white/20 -translate-x-[150%] skew-x-12 group-hover:animate-[shimmer_1.5s_infinite]" />
            <Crown className="w-4 h-4" />
            <span className="hidden sm:inline uppercase tracking-widest">Premium</span>
          </motion.button>
        </div>
      </motion.header>

      {/* Mobile Bottom Navigation */}
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="md:hidden fixed bottom-0 w-full z-50 bg-zinc-950/90 backdrop-blur-xl border-t border-white/5 flex items-center justify-between px-2 pt-2 pb-safe-bottom"
      >
        <div className="flex w-full justify-around py-1">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className="relative flex flex-col items-center gap-1.5 p-2 w-16"
              >
                <div className={cn(
                  "flex flex-col items-center gap-1 transition-all duration-300 z-10",
                  isActive ? "text-rose-500 -translate-y-1" : "text-zinc-500 hover:text-zinc-300"
                )}>
                  <link.icon className="w-5 h-5" />
                  <span className="text-[10px] font-bold tracking-wide">{link.name}</span>
                </div>
                {isActive && (
                  <motion.div 
                    layoutId="mobile-nav-indicator"
                    className="absolute inset-0 bg-rose-500/10 rounded-2xl border border-rose-500/20"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </motion.nav>
    </>
  );
}
