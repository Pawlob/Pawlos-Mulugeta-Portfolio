
import { Project, Experience, Skill, Service } from './types';

// --- CONFIGURATION ---
export const PROFILE_IMAGE_URL = "https://i.postimg.cc/c4F6j8wP/pawlos_profile.png"; // Path to file in public folder OR external URL
export const LOGO_URL = "https://i.postimg.cc/JhFV45cX/logo.png"; // Updated to user provided link

export const HERO_TITLE = "Bridging Physical Architecture & Digital Experiences";
export const HERO_SUBTITLE = "I'm Pawlos Mulugeta, an Architect and Creative Developer based in Addis Ababa, Ethiopia. I design sustainable spaces and build robust digital solutions.";

export const PROJECTS: Project[] = [
  {
    id: 1,
    title: "Urban Eco-Center Design",
    description: "A sustainable community center design focused on renewable energy integration and green spaces.",
    technologies: ["Revit", "Lumion", "AutoCAD"],
    imageUrl: "https://picsum.photos/600/400?random=10",
    link: "#",
    category: "Architecture",
    visible: true
  },
  {
    id: 2,
    title: "E-Commerce Analytics Dashboard",
    description: "A comprehensive dashboard for visualizing sales data and user trends in real-time.",
    technologies: ["React", "TypeScript", "D3.js"],
    imageUrl: "https://picsum.photos/600/400?random=1",
    link: "#",
    category: "Development",
    visible: true
  },
  {
    id: 3,
    title: "Modern Residential Complex",
    description: "3D visualization and planning for a 20-unit luxury residential complex in Addis Ababa.",
    technologies: ["SketchUp", "V-Ray", "Photoshop"],
    imageUrl: "https://picsum.photos/600/400?random=11",
    link: "#",
    category: "Architecture",
    visible: true
  },
  {
    id: 4,
    title: "AI-Powered Content Generator",
    description: "An application leveraging generative AI to help marketers create content efficiently.",
    technologies: ["Next.js", "Gemini API", "Tailwind CSS"],
    imageUrl: "https://picsum.photos/600/400?random=2",
    link: "#",
    category: "Development",
    visible: true
  }
];

export const EXPERIENCE: Experience[] = [
  {
    id: 1,
    role: "Senior Architect & Developer",
    company: "Freelance / Self-Employed",
    period: "2024 - Present",
    description: "Combining architectural design services with full-stack web development for diverse clients. Specializing in 3D visualization and responsive web apps."
  },
  {
    id: 2,
    role: "Junior Architect",
    company: "City Planning Bureau",
    period: "2019 - 2021",
    description: "Collaborated on urban planning projects, drafted blueprints using AutoCAD, and created 3D models for public spaces."
  },
  {
    id: 3,
    role: "Web Developer",
    company: "Innovate Web Agency",
    period: "2018 - 2019",
    description: "Developed custom web solutions using the MERN stack while studying architectural principles."
  }
];

export const SKILLS: Skill[] = [
  { name: "AutoCAD", level: 95, category: "Architecture" },
  { name: "SketchUp", level: 90, category: "Architecture" },
  { name: "Revit / BIM", level: 90, category: "Architecture" },
  { name: "3D Rendering", level: 85, category: "Architecture" },
  { name: "UI/UX Design", level: 95, category: "Development" },
  { name: "React", level: 92, category: "Development" },
  { name: "TypeScript", level: 94, category: "Development" },
  { name: "Tailwind CSS", level: 94, category: "Development" },
  { name: "JavaScript", level: 90, category: "Development" },
  { name: "Python", level: 75, category: "Development" },
];

export const SERVICES: Service[] = [
  {
    id: 1,
    title: "Architectural Design",
    icon: "fa-drafting-compass",
    description: "Comprehensive architectural planning, sustainable design, and interior layouts tailored to modern living standards."
  },
  {
    id: 2,
    title: "Web Development",
    icon: "fa-laptop-code",
    description: "Building responsive, high-performance websites and web applications using modern technologies like React, TypeScript, and Tailwind."
  },
  {
    id: 3,
    title: "3D Visualization",
    icon: "fa-cube",
    description: "High-quality 3D modeling and photorealistic rendering to visualize architectural projects before construction."
  }
];
