
export interface Project {
  id: number | string;
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  link?: string;
  category: 'Architecture' | 'Development';
  visible?: boolean;
}

export interface Experience {
  id: number | string;
  role: string;
  company: string;
  period: string;
  description: string;
}

export interface Skill {
  name: string;
  level: number; // 0-100
  category: 'Architecture' | 'Development';
}

export interface Service {
  id: number;
  title: string;
  icon: string;
  description: string;
}

export interface User {
  email: string;
  name: string;
  photoUrl?: string;
  title?: string;
  token?: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  content: string;
  date: string;
  read: boolean;
}
