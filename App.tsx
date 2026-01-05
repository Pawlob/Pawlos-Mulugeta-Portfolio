import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navigation from './components/Navigation';
import CMSDashboard from './components/CMSDashboard';
import Preloader from './components/Preloader';
import { projectService } from './services/projectService';
import { messageService } from './services/messageService';
import { soundService } from './services/soundService';
import { Project } from './types';
import { EXPERIENCE, SERVICES, PROFILE_IMAGE_URL, SKILLS } from './constants';
import { Volume2, VolumeX } from 'lucide-react';

interface PopupMessage {
  text: string;
  icon: string;
}

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 }); // Initialize off-screen

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: { x: number; y: number; vx: number; vy: number; radius: number }[] = [];
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    const init = () => {
      particles = [];
      const count = Math.min(Math.floor(window.innerWidth / 15), 100);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: Math.random() * 2,
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, i) => {
        // Basic Physics
        p.x += p.vx;
        p.y += p.vy;

        // Boundary Check
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        // Mouse Interaction Logic
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseThreshold = 200;

        if (dist < mouseThreshold) {
          // Subtle gravity towards mouse
          const force = (mouseThreshold - dist) / mouseThreshold;
          p.x += dx * (force * 0.02);
          p.y += dy * (force * 0.02);

          // Connection to mouse
          ctx.beginPath();
          ctx.strokeStyle = `rgba(244, 162, 97, ${force * 0.4})`; // Higher opacity for mouse connections
          ctx.lineWidth = 0.5;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
          ctx.stroke();
        }

        // Render Particle
        ctx.fillStyle = 'rgba(237, 233, 214, 0.5)';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inter-particle connections
        ctx.strokeStyle = 'rgba(237, 233, 214, 0.2)';
        ctx.lineWidth = 0.3;
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist2 = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
          if (dist2 < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'cms'>('home');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isMuted, setIsMuted] = useState(soundService.getMuteState());

  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [popupVisible, setPopupVisible] = useState(false);
  const [currentPopupSlot, setCurrentPopupSlot] = useState<number>(0); 
  const [currentMessage, setCurrentMessage] = useState<PopupMessage>({ text: 'Modern Architecture?', icon: 'fa-building' });

  const skillsSectionRef = useRef<HTMLElement>(null);
  const [skillsAnimated, setSkillsAnimated] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await projectService.getProjects();
      setProjects(data);
    };
    fetchProjects();
    const handleProjectChange = () => fetchProjects();
    window.addEventListener('project-change', handleProjectChange);
    return () => window.removeEventListener('project-change', handleProjectChange);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
      if (currentView === 'home' && skillsSectionRef.current && !skillsAnimated) {
        const rect = skillsSectionRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight / 1.3) {
          setSkillsAnimated(true);
        }
      }

      // Trigger scroll reveals
      const reveals = document.querySelectorAll('.reveal');
      reveals.forEach(reveal => {
        const windowHeight = window.innerHeight;
        const revealTop = reveal.getBoundingClientRect().top;
        const revealPoint = 150;
        if (revealTop < windowHeight - revealPoint) {
          reveal.classList.add('active');
        }
      });
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [skillsAnimated, currentView, projects]);

  useEffect(() => {
    if (loading) return;
    const messages: PopupMessage[] = [
      { text: 'Modern Architecture?', icon: 'fa-building' },
      { text: 'Responsive Website?', icon: 'fa-mobile-alt' },
      { text: 'Home Renovation?', icon: 'fa-paint-roller' },
      { text: 'Custom Web App?', icon: 'fa-code' },
      { text: '3D Modeling?', icon: 'fa-cube' },
      { text: 'E-Commerce Store?', icon: 'fa-shopping-cart' },
      { text: 'Sustainable Design?', icon: 'fa-leaf' },
      { text: 'Interior Design?', icon: 'fa-couch' },
      { text: 'Landscape Planning?', icon: 'fa-tree' }
    ];
    let messageIndex = 0;
    const cyclePopup = () => {
        const randomSlot = Math.floor(Math.random() * 3);
        setCurrentPopupSlot(randomSlot);
        const msg = messages[messageIndex];
        setCurrentMessage(msg);
        messageIndex = (messageIndex + 1) % messages.length;
        setPopupVisible(true);
        setTimeout(() => {
            setPopupVisible(false);
            setTimeout(cyclePopup, 600);
        }, 3500);
    };
    const initialTimeout = setTimeout(cyclePopup, 500);
    return () => clearTimeout(initialTimeout);
  }, [loading]);

  const toggleMute = () => {
    const newState = soundService.toggleMute();
    setIsMuted(newState);
    if (!newState) soundService.playTap();
  };

  const scrollToTop = () => {
    soundService.playTap();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (cat: string) => {
    soundService.playTap();
    setActiveCategory(cat);
  };

  const handleProjectHover = () => {
    soundService.playHover();
  };

  const handleTiltMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.04)`;
    
    // Light effect tracking
    const light = card.querySelector('.card-light') as HTMLElement;
    if (light) {
      light.style.opacity = '1';
      light.style.left = `${x}px`;
      light.style.top = `${y}px`;
    }
  };

  const handleTiltLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    const light = e.currentTarget.querySelector('.card-light') as HTMLElement;
    if (light) light.style.opacity = '0';
  };

  const handleInputChange = (field: string, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
    if (contactStatus === 'error') {
        setContactStatus('idle');
        setErrorMessage('');
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setContactStatus('sending');
    soundService.playTap();
    try {
        await messageService.sendMessage({
            name: contactForm.name,
            email: contactForm.email,
            content: contactForm.message
        });
        setContactStatus('success');
        soundService.playSuccess();
        setContactForm({ name: '', email: '', message: '' });
        setTimeout(() => setContactStatus('idle'), 3000);
    } catch (error: any) {
        setContactStatus('error');
        setErrorMessage(error.message || 'Unknown error occurred.');
    }
  };

  return (
    <div className="font-sans text-white bg-[#013328] overflow-x-hidden min-h-screen">
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      
      {/* Interactive Background */}
      <ParticleBackground />

      <style>{`
        :root {
            --primary-bg: #013328;
            --accent-color: #ede9d6;
            --highlight-color: #f4a261;
            --fox-orange: #e67e22;
        }
        .hero-content { animation: slideIn 1.2s ease-out forwards; opacity: 0; }
        @keyframes slideIn { 0% { transform: translateX(-50px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
        .ring-one { animation: rotateRight 2s linear infinite; box-shadow: 0 0 10px rgba(244, 162, 97, 0.5); }
        .ring-two { animation: rotateLeft 4s linear infinite; }
        @keyframes rotateRight { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes rotateLeft { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
        .cube-wrapper { perspective: 1000px; }
        .cube { transform-style: preserve-3d; animation: spin 12s infinite linear; }
        .face { position: absolute; width: 200px; height: 200px; border: 2px solid var(--accent-color); background: rgba(1, 51, 40, 0.85); box-shadow: 0 0 15px rgba(237, 233, 214, 0.2); }
        .front  { transform: rotateY(0deg) translateZ(100px); }
        .back   { transform: rotateY(180deg) translateZ(100px); }
        .right  { transform: rotateY(90deg) translateZ(100px); }
        .left   { transform: rotateY(-90deg) translateZ(100px); }
        .top    { transform: rotateX(90deg) translateZ(100px); }
        .bottom { transform: rotateX(-90deg) translateZ(100px); }
        @keyframes spin { from { transform: rotateX(0) rotateY(0); } to { transform: rotateX(360deg) rotateY(360deg); } }
        .profile-popup {
            position: absolute; background: rgba(255, 255, 255, 0.95); color: var(--primary-bg);
            padding: 6px 14px; border-radius: 20px; font-size: 0.8rem; font-weight: bold;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3); pointer-events: none; opacity: 0;
            transform: translateY(12px) scale(0.8); transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            z-index: 30; border: 1px solid var(--highlight-color);
        }
        .profile-popup.visible { opacity: 1; transform: translateY(0) scale(1); }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        .popup-content { display: flex; align-items: center; gap: 8px; animation: float 4s ease-in-out infinite; }
        .popup-content i { color: var(--fox-orange); }
        .pop-pos-0 { top: -30px; right: -70px; }
        .pop-pos-1 { top: 35%; left: -95px; }
        .pop-pos-2 { bottom: -15px; right: -60px; }
        @media (max-width: 768px) {
            .pop-pos-0 { top: -40px; right: -10px; }
            .pop-pos-1 { top: 30%; left: -30px; } 
            .pop-pos-2 { bottom: -30px; right: -10px; }
            .cube-wrapper { transform: scale(0.7); margin-top: 2rem; }
            .profile-popup { font-size: 0.65rem; padding: 4px 10px; border-radius: 12px; }
        }
        .progress-bar-fill { transition: width 1.5s ease-in-out; }
        .project-card { transform-style: preserve-3d; transition: transform 0.1s cubic-bezier(0.1, 0.7, 0.1, 1); position: relative; overflow: hidden; }
        .card-light {
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(244, 162, 97, 0.15) 0%, transparent 70%);
          pointer-events: none;
          transform: translate(-50%, -50%);
          opacity: 0;
          transition: opacity 0.3s;
          z-index: 2;
        }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .project-card.show { animation: fadeIn 0.5s ease forwards; }
      `}</style>

      <Navigation currentView={currentView} onNavigate={setCurrentView} />

      {currentView === 'home' ? (
        <>
        <header className="min-h-screen flex flex-col md:flex-row items-center justify-center pt-28 pb-10 md:pt-20 bg-transparent text-center md:gap-20 lg:gap-40 px-4 relative z-10">
            <div className="hero-content flex flex-col items-center p-5">
                <div className="profile-container relative w-[240px] h-[240px] md:w-[280px] md:h-[280px] flex justify-center items-center mb-5">
                    <div className="ring-one absolute w-full h-full rounded-full border-4 border-transparent border-t-[#f4a261] border-r-[#f4a261] z-10"></div>
                    <div className="ring-two absolute w-[108%] h-[108%] rounded-full border-2 border-transparent border-b-[#ede9d6] border-l-[#ede9d6] z-10 opacity-70"></div>
                    <img 
                        className="profile-img w-[200px] h-[200px] md:w-[240px] md:h-[240px] rounded-full object-cover relative z-20 border-4 border-[#013328] shadow-[0_0_30px_rgba(0,0,0,0.5)]" 
                        src={PROFILE_IMAGE_URL}
                        alt="Pawlos Mulugeta"
                        onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/200/013328/ede9d6?text=Pawlos'; }}
                    />
                    <div className={`profile-popup pop-pos-${currentPopupSlot} ${popupVisible ? 'visible' : ''}`}>
                        <div className="popup-content">
                            {currentMessage.text} <i className={`fas ${currentMessage.icon}`}></i>
                        </div>
                    </div>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-[#ede9d6] my-4 tracking-tight">Pawlos Mulugeta</h1>
                <p className="text-lg md:text-xl text-[#f4a261] font-medium tracking-widest uppercase">Architect | Creative Designer</p>
                <p className="mt-6 max-w-lg text-[#ede9d6]/80 text-base md:text-lg leading-relaxed">
                  Bridging physical architecture & digital experiences through sustainable design and robust technical implementation.
                </p>
            </div>
            <div className="cube-wrapper w-[200px] h-[200px] relative mt-10 md:mt-0">
                <div className="cube w-full h-full relative">
                    <div className="face front flex items-center justify-center text-[#f4a261] font-bold text-2xl">CODE</div>
                    <div className="face back flex items-center justify-center text-[#f4a261] font-bold text-2xl">DESIGN</div>
                    <div className="face right flex items-center justify-center text-[#f4a261] font-bold text-2xl">ARCH</div>
                    <div className="face left flex items-center justify-center text-[#f4a261] font-bold text-2xl">WEB</div>
                    <div className="face top flex items-center justify-center text-[#f4a261] font-bold text-2xl"><i className="fas fa-layer-group"></i></div>
                    <div className="face bottom flex items-center justify-center text-[#f4a261] font-bold text-2xl"><i className="fas fa-pencil-ruler"></i></div>
                </div>
            </div>
        </header>

        <section id="about" className="py-24 px-5 text-center max-w-6xl mx-auto reveal relative z-10">
            <h2 className="text-3xl md:text-4xl text-[#f4a261] border-b-2 border-[#f4a261] inline-block mb-10 pb-2 font-bold uppercase tracking-widest">About Me</h2>
            <p className="max-w-3xl mx-auto text-xl leading-relaxed text-[#ede9d6]/90 font-light">
                I am an architect passionate about creating sustainable and innovative designs that blend functionality with aesthetics. 
                With a unique background in both physical architecture and digital development, I bridge the gap between built environments and digital experiences.
            </p>
        </section>

        <section id="services" className="py-24 px-5 text-center max-w-6xl mx-auto reveal relative z-10">
            <div className="bg-[#021a15]/50 backdrop-blur-xl border border-white/5 rounded-[3rem] p-10 md:p-16 shadow-2xl">
                <h2 className="text-3xl md:text-4xl text-[#f4a261] border-b-2 border-[#f4a261] inline-block mb-16 pb-2 font-bold uppercase tracking-widest">Expertise</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {SERVICES.map((service) => (
                        <div key={service.id} onMouseEnter={() => soundService.playHover()} className="bg-[#ede9d6] p-10 rounded-2xl shadow-xl hover:-translate-y-3 transition-all duration-500 group">
                            <div className="w-20 h-20 bg-[#013328] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:rotate-12 transition-transform">
                                <i className={`fas ${service.icon} text-3xl text-[#f4a261]`}></i>
                            </div>
                            <h3 className="text-2xl font-bold text-[#013328] mb-4">{service.title}</h3>
                            <p className="text-gray-600 text-base leading-relaxed">
                                {service.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <section id="experience" className="py-24 px-5 max-w-6xl mx-auto reveal relative z-10">
            <h2 className="text-3xl md:text-4xl text-[#f4a261] border-b-2 border-[#f4a261] inline-block mb-16 pb-2 text-center w-full font-bold uppercase tracking-widest">Journey</h2>
            <div className="space-y-16 relative before:content-[''] before:absolute before:left-4 md:before:left-1/2 before:top-0 before:bottom-0 before:w-[1px] before:bg-gradient-to-b before:from-transparent before:via-[#f4a261]/50 before:to-transparent">
                {EXPERIENCE.map((exp, index) => (
                    <div key={exp.id} className={`flex flex-col md:flex-row items-center gap-8 md:gap-0 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                        <div className="flex-1 w-full"></div>
                        <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-[#f4a261] rounded-full shadow-[0_0_15px_#f4a261] z-10 mt-1.5 md:mt-0 outline outline-4 outline-[#013328]"></div>
                        <div className={`flex-1 w-full pl-12 md:pl-0 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                            <div onMouseEnter={() => soundService.playHover()} className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 md:p-10 rounded-3xl hover:border-[#f4a261]/30 transition-all duration-300">
                                <span className="inline-block px-4 py-1.5 bg-[#f4a261]/10 text-[#f4a261] text-xs font-bold rounded-full mb-4 uppercase tracking-widest">
                                    {exp.period}
                                </span>
                                <h3 className="text-2xl md:text-3xl font-bold text-[#ede9d6] mb-1">{exp.role}</h3>
                                <h4 className="text-[#f4a261] font-medium text-lg mb-4">{exp.company}</h4>
                                <p className="text-gray-400 text-base leading-relaxed">
                                    {exp.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>

        <section id="skills" ref={skillsSectionRef} className="py-24 px-5 text-center max-w-6xl mx-auto reveal relative z-10">
            <h2 className="text-3xl md:text-4xl text-[#f4a261] border-b-2 border-[#f4a261] inline-block mb-12 pb-2 font-bold uppercase tracking-widest">Skillsets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-left">
                <div className="skill-category">
                    <h3 className="text-[#ede9d6] border-b border-white/10 pb-4 mb-8 font-bold text-2xl flex items-center gap-3">
                      <i className="fas fa-drafting-compass text-[#f4a261]"></i> Architecture & Design
                    </h3>
                    {SKILLS.filter(s => s.category === 'Architecture').map(s => (
                        <div key={s.name} className="mb-8">
                            <div className="flex justify-between font-medium text-[#ede9d6]/70 mb-2 text-sm tracking-widest uppercase"><span>{s.name}</span><span>{s.level}%</span></div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="progress-bar-fill h-full bg-gradient-to-r from-[#f4a261] to-[#e67e22] rounded-full shadow-[0_0_10px_rgba(244,162,97,0.4)]" style={{ width: skillsAnimated ? `${s.level}%` : '0' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="skill-category">
                    <h3 className="text-[#ede9d6] border-b border-white/10 pb-4 mb-8 font-bold text-2xl flex items-center gap-3">
                      <i className="fas fa-code text-[#f4a261]"></i> Development & Web
                    </h3>
                    {SKILLS.filter(s => s.category === 'Development').map(s => (
                        <div key={s.name} className="mb-8">
                            <div className="flex justify-between font-medium text-[#ede9d6]/70 mb-2 text-sm tracking-widest uppercase"><span>{s.name}</span><span>{s.level}%</span></div>
                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="progress-bar-fill h-full bg-gradient-to-r from-[#f4a261] to-[#e67e22] rounded-full shadow-[0_0_10px_rgba(244,162,97,0.4)]" style={{ width: skillsAnimated ? `${s.level}%` : '0' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        <section id="projects" className="py-24 px-5 text-center max-w-7xl mx-auto reveal relative z-10">
            <h2 className="text-3xl md:text-4xl text-[#f4a261] border-b-2 border-[#f4a261] inline-block mb-12 pb-2 font-bold uppercase tracking-widest">Portfolio</h2>
            <div className="flex justify-center gap-6 mb-16 flex-wrap">
                {['all', 'Architecture', 'Development'].map(cat => (
                    <button 
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`px-8 py-3 rounded-xl font-bold transition-all duration-300 border-2 ${activeCategory === cat ? 'bg-[#f4a261] text-[#013328] border-[#f4a261] shadow-[0_0_20px_rgba(244,162,97,0.4)]' : 'text-[#f4a261] border-white/10 hover:border-[#f4a261]'}`}
                    >
                        {cat === 'all' ? 'All' : cat}
                    </button>
                ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 min-h-[400px]">
                {projects
                    .filter(proj => proj.visible !== false)
                    .map((proj) => {
                        const show = activeCategory === 'all' || proj.category === activeCategory;
                        if (!show) return null;
                        const shouldUseScreenshot = proj.category === 'Development' && proj.link && proj.link.startsWith('http');
                        const displayImage = shouldUseScreenshot 
                            ? `https://api.microlink.io/?url=${encodeURIComponent(proj.link!)}&screenshot=true&meta=false&embed=screenshot.url`
                            : proj.imageUrl;
                        return (
                            <a 
                                key={proj.id} 
                                href={proj.link || '#'} 
                                target="_blank" 
                                rel="noreferrer"
                                onMouseEnter={handleProjectHover}
                                onClick={() => soundService.playTap()}
                                className="project-card group block bg-[#ede9d6] rounded-3xl overflow-hidden shadow-2xl hover:shadow-[0_40px_80px_rgba(0,0,0,0.5)] transition-all duration-300 show cursor-pointer no-underline text-[#333] flex flex-col h-full"
                                onMouseMove={handleTiltMove}
                                onMouseLeave={handleTiltLeave}
                            >
                                <div className="card-light" />
                                <div className="overflow-hidden w-full h-64 border-b-4 border-[#013328] shrink-0 relative">
                                    <div className="absolute inset-0 bg-[#013328]/10 group-hover:bg-transparent transition-colors z-10" />
                                    <img 
                                        src={displayImage} 
                                        alt={proj.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
                                        onError={(e) => { 
                                            const target = e.currentTarget;
                                            if (shouldUseScreenshot && target.src !== proj.imageUrl && proj.imageUrl) {
                                                target.src = proj.imageUrl;
                                            } else {
                                                target.src = 'https://placehold.co/600x400/013328/ede9d6?text=Project';
                                            }
                                        }}
                                    />
                                </div>
                                <div className="p-8 flex-1 flex flex-col relative z-10">
                                    <div className="flex justify-between items-start mb-4">
                                      <h3 className="text-[#013328] font-bold text-2xl group-hover:text-[#e67e22] transition-colors line-clamp-1">{proj.title}</h3>
                                      <i className="fas fa-arrow-right-long text-[#f4a261] -rotate-45 group-hover:rotate-0 transition-transform text-xl"></i>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {proj.technologies && proj.technologies.slice(0, 4).map((tech, index) => (
                                            <span key={index} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-[#013328]/5 text-[#013328] rounded-lg">
                                                {tech}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{proj.description}</p>
                                </div>
                            </a>
                        );
                    })}
                {projects.length === 0 && <p className="col-span-full text-gray-400 py-20 italic">Initializing portfolio projects...</p>}
            </div>
        </section>

        <section id="contact" className="py-24 px-5 text-center max-w-6xl mx-auto reveal relative z-10">
            <h2 className="text-3xl md:text-4xl text-[#f4a261] border-b-2 border-[#f4a261] inline-block mb-16 pb-2 font-bold uppercase tracking-widest">Connect</h2>
            <div className="flex flex-wrap justify-center gap-16 text-left">
                <form className="w-full md:flex-1 flex flex-col gap-6" onSubmit={handleContactSubmit}>
                    <div className="relative group">
                      <input 
                          placeholder="Full Name" 
                          required 
                          type="text" 
                          value={contactForm.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          disabled={contactStatus === 'sending' || contactStatus === 'success'}
                          className="p-5 bg-white/5 border border-white/10 rounded-2xl text-white w-full focus:outline-none focus:border-[#f4a261] transition-all"
                      />
                    </div>
                    <input 
                        placeholder="Email Address" 
                        required 
                        type="email" 
                        value={contactForm.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={contactStatus === 'sending' || contactStatus === 'success'}
                        className="p-5 bg-white/5 border border-white/10 rounded-2xl text-white w-full focus:outline-none focus:border-[#f4a261] transition-all"
                    />
                    <textarea 
                        placeholder="Message Details" 
                        required 
                        rows={6} 
                        value={contactForm.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        disabled={contactStatus === 'sending' || contactStatus === 'success'}
                        className="p-5 bg-white/5 border border-white/10 rounded-2xl text-white w-full focus:outline-none focus:border-[#f4a261] transition-all resize-none"
                    ></textarea>
                    {contactStatus === 'error' && (
                        <div className="p-4 bg-red-500/10 border border-red-500/50 text-red-100 rounded-xl text-sm flex items-center gap-3">
                            <i className="fas fa-exclamation-triangle text-red-500"></i>
                            {errorMessage || 'Failed to send. Please check your connection.'}
                        </div>
                    )}
                    <button 
                        type="submit" 
                        disabled={contactStatus === 'sending' || contactStatus === 'success'}
                        className={`p-5 font-bold rounded-2xl transition-all w-full flex justify-center items-center gap-3 text-lg ${
                            contactStatus === 'success' ? 'bg-green-600 text-white' :
                            'bg-[#f4a261] text-[#013328] hover:bg-[#e67e22] shadow-[0_10px_30px_rgba(244,162,97,0.3)] hover:-translate-y-1'
                        }`}
                    >
                        {contactStatus === 'sending' && (
                            <><div className="w-5 h-5 border-3 border-[#013328] border-t-transparent rounded-full animate-spin"></div>Processing...</>
                        )}
                        {contactStatus === 'success' && <><i className="fas fa-check-circle"></i> Message Delivered</>}
                        {(contactStatus === 'idle' || contactStatus === 'error') && 'Initialize Inquiry'}
                    </button>
                </form>
                <div className="w-full md:flex-1 bg-white/5 backdrop-blur-md border border-white/10 p-10 md:p-12 rounded-[2.5rem] text-white shadow-2xl">
                    <h3 className="text-[#f4a261] text-3xl font-bold mb-8 mt-0 tracking-tight">Direct Information</h3>
                    <div className="space-y-6 mb-10">
                        <p className="flex items-center gap-4 text-lg text-[#ede9d6]/80 hover:text-[#f4a261] transition-colors"><i className="fas fa-phone-alt text-[#f4a261] w-6"></i> +251 908 786 726</p>
                        <p className="flex items-center gap-4 text-lg text-[#ede9d6]/80 hover:text-[#f4a261] transition-colors"><i className="fas fa-envelope-open text-[#f4a261] w-6"></i> pawlob.21@gmail.com</p>
                        <p className="flex items-center gap-4 text-lg text-[#ede9d6]/80"><i className="fas fa-location-dot text-[#f4a261] w-6"></i> Addis Ababa, Ethiopia</p>
                    </div>
                    <div className="w-full h-[240px] bg-[#013328] rounded-3xl overflow-hidden relative mb-10 border border-white/10 shadow-inner">
                        <iframe className="w-full h-full border-0 grayscale opacity-80" src="https://maps.google.com/maps?width=600&height=400&hl=en&q=pawlos%20art&t=p&z=18&ie=UTF8&iwloc=B&output=embed" title="Map"></iframe>
                    </div>
                    <div className="flex gap-5">
                        {[
                            { name: 'Facebook', url: 'https://facebook.com', icon: 'fa-facebook-f', color: 'hover:bg-[#1877F2]' },
                            { name: 'Instagram', url: 'https://instagram.com', icon: 'fa-instagram', color: 'hover:bg-[#E4405F]' },
                            { name: 'LinkedIn', url: 'https://linkedin.com', icon: 'fa-linkedin-in', color: 'hover:bg-[#0A66C2]' },
                            { name: 'Telegram', url: 'https://t.me/', icon: 'fa-telegram-plane', color: 'hover:bg-[#0088cc]' }
                        ].map((social) => (
                            <a key={social.name} href={social.url} target="_blank" rel="noreferrer" onMouseEnter={() => soundService.playHover()} onClick={() => soundService.playTap()} className={`group w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-300 hover:-translate-y-2 shadow-xl ${social.color}`} aria-label={social.name}>
                                <i className={`fab ${social.icon} text-2xl text-[#f4a261] group-hover:text-white transition-colors duration-300`}></i>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </section>

        <footer className="bg-[#ede9d6] text-[#013328] text-center py-10 font-bold mt-20 px-4 relative z-10 rounded-t-[4rem]">
            <p className="tracking-[0.5em] uppercase text-xs mb-2">Designed & Engineered By</p>
            <h4 className="text-2xl mb-4 tracking-tighter">PAWLOS MULUGETA</h4>
            <div className="w-20 h-1 bg-[#013328] mx-auto mb-6 opacity-20 rounded-full"></div>
            <p className="text-sm opacity-60">© {new Date().getFullYear()} Architectural Portfolio — Version 2.0</p>
        </footer>

        <button onClick={scrollToTop} className={`fixed right-8 bottom-8 w-14 h-14 bg-[#f4a261] rounded-2xl flex items-center justify-center z-50 transition-all duration-500 hover:scale-110 shadow-2xl hover:shadow-[#f4a261]/50 ${showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`} aria-label="Go to top">
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-[#013328]"><path d="M12 4l-7 7h4v7h6v-7h4L12 4z"></path></svg>
        </button>

        {/* Sound Control Toggle */}
        <button 
            onClick={toggleMute}
            className="fixed left-8 bottom-8 w-14 h-14 bg-[#021a15]/80 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center z-50 transition-all duration-300 hover:scale-110 hover:border-[#f4a261] shadow-2xl"
            aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
        >
            {isMuted ? <VolumeX className="text-gray-400" size={24} /> : <Volume2 className="text-[#f4a261] animate-pulse" size={24} />}
        </button>
        </>
      ) : (
        <CMSDashboard />
      )}
    </div>
  );
}
