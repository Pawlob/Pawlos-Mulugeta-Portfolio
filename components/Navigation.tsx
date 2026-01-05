
import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react';
import LoginModal from './LoginModal';
import { authService } from '../services/authService';
import { soundService } from '../services/soundService';
import { User } from '../types';
import { LOGO_URL } from '../constants';

interface NavigationProps {
  currentView?: 'home' | 'cms';
  onNavigate?: (view: 'home' | 'cms') => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView = 'home', onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(authService.getCurrentUser());
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    const handleAuthChange = () => {
      setUser(authService.getCurrentUser());
    };
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'l' || e.key === 'L')) {
            e.preventDefault();
            setIsLoginModalOpen(true);
        }
    };
    const params = new URLSearchParams(window.location.search);
    if (params.get('login') === 'true') {
        setIsLoginModalOpen(true);
        window.history.replaceState({}, '', window.location.pathname);
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  const navLinks = [
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Experience', href: '#experience' },
    { name: 'Skills', href: '#skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleLogoutClick = () => {
    soundService.playTap();
    authService.logout();
    if (onNavigate) onNavigate('home');
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = (view: 'home' | 'cms', href?: string) => {
    soundService.playTap();
    if (onNavigate) onNavigate(view);
    setIsMobileMenuOpen(false);
    if (view === 'home') {
        setTimeout(() => {
            if (href === '#' || !href) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (href.startsWith('#')) {
                const element = document.querySelector(href);
                element?.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    }
  };

  const handleHover = () => {
    soundService.playHover();
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b border-white/10 ${
          isScrolled || currentView === 'cms' ? 'bg-[#013328]/90 backdrop-blur-md shadow-lg py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
          <a 
            href="#" 
            onMouseEnter={handleHover}
            onClick={(e) => { e.preventDefault(); handleNavClick('home', '#'); }} 
            className="flex items-center gap-2 cursor-pointer group"
          >
            <img 
                src={LOGO_URL}
                alt="Pawlos M." 
                className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105" 
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const span = e.currentTarget.nextElementSibling;
                    if (span) span.classList.remove('hidden');
                }}
            />
            <span className="hidden text-xl font-bold text-accent tracking-widest">
                PAWLOS<span className="text-highlight">.M</span>
            </span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {currentView === 'home' && navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onMouseEnter={handleHover}
                onClick={(e) => { e.preventDefault(); handleNavClick('home', link.href); }}
                className="text-sm font-medium text-accent hover:text-highlight transition-colors tracking-wide cursor-pointer"
              >
                {link.name}
              </a>
            ))}

            {currentView === 'cms' && (
               <button
                onMouseEnter={handleHover}
                onClick={() => handleNavClick('home', '#')}
                className="text-sm font-medium text-accent hover:text-highlight transition-colors tracking-wide cursor-pointer"
              >
                Back to Site
              </button>
            )}
            
            {user ? (
              <div className="flex items-center gap-4 border-l border-white/20 pl-4">
                 <button 
                    onMouseEnter={handleHover}
                    onClick={() => handleNavClick('cms')}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${currentView === 'cms' ? 'text-highlight' : 'text-accent hover:text-highlight'}`}
                 >
                    <LayoutDashboard size={16} /> Dashboard
                 </button>
                 <div className="flex items-center gap-2 text-highlight text-sm font-medium">
                    <UserIcon size={16} /> <span className="max-w-[100px] truncate">{user.name}</span>
                 </div>
                 <button 
                  onMouseEnter={handleHover}
                  onClick={handleLogoutClick}
                  className="text-sm font-medium text-accent hover:text-red-400 transition-colors tracking-wide flex items-center gap-2"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
                <a
                href="#contact"
                onMouseEnter={handleHover}
                onClick={(e) => { e.preventDefault(); handleNavClick('home', '#contact'); }}
                className="px-5 py-2 rounded border border-highlight text-highlight hover:bg-highlight hover:text-primary transition-all font-medium text-sm cursor-pointer"
                >
                Hire Me
                </a>
            )}
          </div>

          <button
            className="md:hidden text-accent p-2"
            onClick={() => { soundService.playTap(); setIsMobileMenuOpen(!isMobileMenuOpen); }}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-primary border-b border-highlight/20 shadow-xl p-6 flex flex-col gap-4">
            {currentView === 'home' && navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-lg font-medium text-accent hover:text-highlight py-2 border-b border-white/5"
                onClick={(e) => { e.preventDefault(); handleNavClick('home', link.href); }}
              >
                {link.name}
              </a>
            ))}
            {currentView === 'cms' && (
               <button
                onClick={() => handleNavClick('home', '#')}
                className="text-lg font-medium text-accent hover:text-highlight py-2 border-b border-white/5 text-left"
              >
                Back to Site
              </button>
            )}
            {user ? (
              <>
                 <button 
                    onClick={() => handleNavClick('cms')}
                    className="text-lg font-medium text-highlight py-2 border-b border-white/5 flex items-center gap-2 w-full text-left"
                 >
                    <LayoutDashboard size={20} /> Dashboard
                 </button>
                 <button 
                    onClick={handleLogoutClick}
                    className="text-lg font-medium text-red-400 hover:text-red-300 py-2 border-b border-white/5 flex items-center gap-2 w-full text-left"
                  >
                    <LogOut size={20} /> Logout
                  </button>
              </>
            ) : (
                <a
                    href="#contact"
                    onClick={(e) => { e.preventDefault(); handleNavClick('home', '#contact'); }}
                    className="block w-full text-center px-5 py-3 mt-2 rounded border border-highlight text-highlight hover:bg-highlight hover:text-primary transition-all font-bold text-base cursor-pointer"
                >
                    Hire Me
                </a>
            )}
          </div>
        )}
      </nav>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </>
  );
};

export default Navigation;
