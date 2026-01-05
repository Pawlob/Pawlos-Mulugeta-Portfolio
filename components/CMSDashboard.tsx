
import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, X, Save, Image, Tag, Code, 
  Inbox, Briefcase, MailOpen, Clock, Loader2, Search,
  ExternalLink, CheckCircle, LayoutDashboard, Settings, User as UserIcon,
  Eye, EyeOff
} from 'lucide-react';
import { Project, Message, User } from '../types';
import { projectService } from '../services/projectService';
import { messageService } from '../services/messageService';
import { authService } from '../services/authService';

const CMSDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'projects' | 'inbox' | 'profile'>('projects');
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());
  
  // Projects State
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({});
  const [loading, setLoading] = useState(false);

  // Messages State
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Profile Edit State
  const [profileForm, setProfileForm] = useState({ name: '', title: '', photoUrl: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadProjects();
    loadMessages();

    // Listen for auth changes (e.g. when profile is updated)
    const handleAuthChange = () => {
        const user = authService.getCurrentUser();
        setCurrentUser(user);
        if (user) {
            setProfileForm({
                name: user.name || '',
                title: user.title || '',
                photoUrl: user.photoUrl || ''
            });
        }
    };

    window.addEventListener('project-change', loadProjects);
    window.addEventListener('message-change', loadMessages);
    window.addEventListener('auth-change', handleAuthChange);
    
    // Initialize profile form
    handleAuthChange();
    
    return () => {
        window.removeEventListener('project-change', loadProjects);
        window.removeEventListener('message-change', loadMessages);
        window.removeEventListener('auth-change', handleAuthChange);
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProjects(projects);
    } else {
      const lower = searchQuery.toLowerCase();
      setFilteredProjects(projects.filter(p => 
        p.title.toLowerCase().includes(lower) || 
        p.description.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower)
      ));
    }
  }, [searchQuery, projects]);

  const loadProjects = async () => {
    setLoading(true);
    const data = await projectService.getProjects();
    setProjects(data);
    setFilteredProjects(data);
    setLoading(false);
  };

  const loadMessages = async () => {
      const msgs = await messageService.getMessages();
      setMessages(msgs);
      setUnreadCount(msgs.filter(m => !m.read).length);
  };

  const handleAddNew = () => {
    setCurrentProject({
      title: '',
      description: '',
      category: 'Development',
      technologies: [],
      imageUrl: '',
      link: '#',
      visible: true
    });
    setIsEditing(true);
  };

  const handleEdit = (project: Project) => {
    setCurrentProject({ ...project });
    setIsEditing(true);
  };

  const handleDelete = async (id: number | string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      await projectService.deleteProject(id);
    }
  };

  const handleToggleVisibility = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = { ...project, visible: !project.visible };
    await projectService.updateProject(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject.title || !currentProject.description) return;

    // Handle tech string to array
    const techInput = typeof currentProject.technologies === 'string' 
      ? (currentProject.technologies as string).split(',').map((t: string) => t.trim()) 
      : currentProject.technologies || [];

    const projectData = {
      ...currentProject,
      technologies: techInput,
      category: (currentProject.category as 'Architecture' | 'Development') || 'Development',
      visible: currentProject.visible ?? true
    };

    if (currentProject.id) {
      await projectService.updateProject(projectData as Project);
    } else {
      await projectService.addProject(projectData as Omit<Project, 'id'>);
    }
    setIsEditing(false);
  };

  const handleTechChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Temporarily store as string for input editing
    setCurrentProject({ ...currentProject, technologies: e.target.value as any });
  };

  const handleDeleteMessage = async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if(window.confirm('Delete this message?')) {
          await messageService.deleteMessage(id);
      }
  };

  const handleMarkRead = async (id: string) => {
      await messageService.markAsRead(id);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage({ type: '', text: '' });

    try {
        await authService.updateCurrentUser({
            name: profileForm.name,
            title: profileForm.title,
            photoUrl: profileForm.photoUrl
        });
        setProfileMessage({ type: 'success', text: 'Profile updated successfully!' });
        
        // Clear success message after 3s
        setTimeout(() => setProfileMessage({ type: '', text: '' }), 3000);
    } catch (error) {
        console.error(error);
        setProfileMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
        setIsSavingProfile(false);
    }
  };

  // Stats
  const totalProjects = projects.length;

  return (
    <div className="container mx-auto px-4 md:px-8 py-24 min-h-screen flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-72 flex-shrink-0 bg-[#021a15]/50 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col h-fit sticky top-24">
            <div className="flex items-center gap-3 mb-8 px-2">
                <div className="w-12 h-12 rounded-full bg-highlight text-primary flex items-center justify-center font-bold text-lg overflow-hidden border-2 border-highlight">
                    {currentUser?.photoUrl ? (
                        <img src={currentUser.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        currentUser?.name.charAt(0).toUpperCase() || 'A'
                    )}
                </div>
                <div className="overflow-hidden">
                    <h3 className="font-bold text-accent truncate">{currentUser?.name || 'Admin'}</h3>
                    <p className="text-xs text-accent/50 truncate">{currentUser?.title || 'Administrator'}</p>
                </div>
            </div>

            <nav className="flex flex-col gap-2 flex-1">
                <button 
                    onClick={() => setActiveTab('projects')}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 group ${activeTab === 'projects' ? 'bg-highlight text-primary font-bold shadow-[0_0_15px_rgba(244,162,97,0.3)]' : 'text-accent hover:bg-white/5'}`}
                >
                    <div className="flex items-center gap-3">
                        <LayoutDashboard size={20} className={activeTab === 'projects' ? '' : 'text-accent/50 group-hover:text-accent'} />
                        Projects
                    </div>
                    {activeTab === 'projects' && <CheckCircle size={16} />}
                </button>
                <button 
                    onClick={() => setActiveTab('inbox')}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 group ${activeTab === 'inbox' ? 'bg-highlight text-primary font-bold shadow-[0_0_15px_rgba(244,162,97,0.3)]' : 'text-accent hover:bg-white/5'}`}
                >
                     <div className="flex items-center gap-3">
                        <Inbox size={20} className={activeTab === 'inbox' ? '' : 'text-accent/50 group-hover:text-accent'} />
                        Inbox
                    </div>
                    {unreadCount > 0 ? (
                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">{unreadCount}</span>
                    ) : (
                         activeTab === 'inbox' && <CheckCircle size={16} />
                    )}
                </button>
                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all duration-300 group ${activeTab === 'profile' ? 'bg-highlight text-primary font-bold shadow-[0_0_15px_rgba(244,162,97,0.3)]' : 'text-accent hover:bg-white/5'}`}
                >
                     <div className="flex items-center gap-3">
                        <Settings size={20} className={activeTab === 'profile' ? '' : 'text-accent/50 group-hover:text-accent'} />
                        Profile
                    </div>
                    {activeTab === 'profile' && <CheckCircle size={16} />}
                </button>
            </nav>

            <div className="mt-8 pt-6 border-t border-white/10 px-2">
                <p className="text-xs font-bold text-accent/40 uppercase mb-4 tracking-wider">Overview</p>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-3 rounded-lg">
                        <p className="text-2xl font-bold text-accent">{totalProjects}</p>
                        <p className="text-[10px] text-accent/50">Total Projects</p>
                    </div>
                    <div className="bg-white/5 p-3 rounded-lg">
                        <p className="text-2xl font-bold text-highlight">{unreadCount}</p>
                        <p className="text-[10px] text-accent/50">New Messages</p>
                    </div>
                </div>
            </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
            {activeTab === 'projects' && (
                <div className="space-y-6">
                    {/* Header Action Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#021a15]/30 p-4 rounded-2xl border border-white/5">
                        <div>
                            <h2 className="text-2xl font-bold text-accent">Portfolio</h2>
                            <p className="text-sm text-accent/50">Manage your work and showcase.</p>
                        </div>
                        {!isEditing && (
                            <div className="flex w-full sm:w-auto gap-3">
                                <div className="relative flex-1 sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-accent/30" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Search projects..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-[#013328] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-accent text-sm focus:outline-none focus:border-highlight transition-colors"
                                    />
                                </div>
                                <button 
                                    onClick={handleAddNew}
                                    className="bg-highlight text-primary px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#e67e22] transition-colors shadow-lg whitespace-nowrap"
                                >
                                    <Plus size={18} /> <span className="hidden sm:inline">Add New</span>
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-accent/50">
                            <Loader2 size={40} className="animate-spin text-highlight mb-4" />
                            <p>Loading projects...</p>
                        </div>
                    ) : (
                    <>
                        {isEditing ? (
                            <div className="bg-[#ede9d6] p-6 md:p-8 rounded-2xl shadow-2xl animate-fade-in-up text-primary">
                                <div className="flex justify-between items-center mb-6 pb-4 border-b border-primary/10">
                                    <div>
                                        <h2 className="text-2xl font-bold text-primary">
                                            {currentProject.id ? 'Edit Project' : 'New Project'}
                                        </h2>
                                        <p className="text-sm text-primary/60">Fill in the details below to update your portfolio.</p>
                                    </div>
                                    <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-primary/5 rounded-full transition-colors text-primary/50 hover:text-red-500">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSave} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Left Column */}
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-bold text-primary mb-2">Project Title</label>
                                                <input 
                                                    type="text" 
                                                    value={currentProject.title} 
                                                    onChange={e => setCurrentProject({...currentProject, title: e.target.value})}
                                                    className="w-full p-3 bg-white border border-primary/20 rounded-xl text-primary focus:border-highlight focus:ring-2 focus:ring-highlight/20 outline-none transition-all"
                                                    placeholder="e.g. Modern Villa Design"
                                                    required 
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold text-primary mb-2 flex items-center gap-1">
                                                        <Briefcase size={16} /> Category
                                                    </label>
                                                    <select 
                                                        value={currentProject.category}
                                                        onChange={e => setCurrentProject({...currentProject, category: e.target.value as any})}
                                                        className="w-full p-3 bg-white border border-primary/20 rounded-xl text-primary focus:border-highlight outline-none cursor-pointer"
                                                    >
                                                        <option value="Architecture">Architecture</option>
                                                        <option value="Development">Development</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold text-primary mb-2 flex items-center gap-1">
                                                        <Code size={16} /> Link
                                                    </label>
                                                    <input 
                                                        type="text" 
                                                        value={currentProject.link || ''} 
                                                        onChange={e => setCurrentProject({...currentProject, link: e.target.value})}
                                                        className="w-full p-3 bg-white border border-primary/20 rounded-xl text-primary focus:border-highlight outline-none"
                                                        placeholder="https://..."
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-primary mb-2 flex items-center gap-1">
                                                    <Tag size={16} /> Technologies (comma separated)
                                                </label>
                                                <input 
                                                    type="text" 
                                                    value={Array.isArray(currentProject.technologies) ? currentProject.technologies.join(', ') : currentProject.technologies} 
                                                    onChange={handleTechChange}
                                                    className="w-full p-3 bg-white border border-primary/20 rounded-xl text-primary focus:border-highlight outline-none"
                                                    placeholder="React, AutoCAD, Revit..."
                                                />
                                            </div>

                                             <div>
                                                <label className="block text-sm font-bold text-primary mb-2">Description</label>
                                                <textarea 
                                                    value={currentProject.description}
                                                    onChange={e => setCurrentProject({...currentProject, description: e.target.value})}
                                                    rows={5}
                                                    className="w-full p-3 bg-white border border-primary/20 rounded-xl text-primary focus:border-highlight outline-none resize-none"
                                                    placeholder="Describe the project details, challenges, and outcome..."
                                                    required
                                                ></textarea>
                                            </div>

                                            <div className="flex items-center gap-3 bg-primary/5 p-4 rounded-xl">
                                                <input 
                                                    type="checkbox" 
                                                    id="visibleOnSite"
                                                    checked={currentProject.visible ?? true}
                                                    onChange={e => setCurrentProject({...currentProject, visible: e.target.checked})}
                                                    className="w-5 h-5 rounded border-primary/20 text-highlight focus:ring-highlight"
                                                />
                                                <label htmlFor="visibleOnSite" className="text-sm font-bold text-primary cursor-pointer select-none">
                                                    Visible on main website
                                                </label>
                                            </div>
                                        </div>

                                        {/* Right Column (Image) */}
                                        <div className="space-y-4">
                                             <div>
                                                <label className="block text-sm font-bold text-primary mb-2 flex items-center gap-1">
                                                    <Image size={16} /> Image URL
                                                </label>
                                                <input 
                                                    type="text" 
                                                    value={currentProject.imageUrl} 
                                                    onChange={e => setCurrentProject({...currentProject, imageUrl: e.target.value})}
                                                    className="w-full p-3 bg-white border border-primary/20 rounded-xl text-primary focus:border-highlight outline-none"
                                                    placeholder="https://source.unsplash.com/..."
                                                />
                                            </div>
                                            
                                            {/* Image Preview */}
                                            <div className="mt-2 w-full h-64 bg-primary/5 rounded-xl border-2 border-dashed border-primary/10 flex items-center justify-center overflow-hidden relative group">
                                                {currentProject.imageUrl ? (
                                                    <>
                                                        <img 
                                                            src={currentProject.imageUrl} 
                                                            alt="Preview" 
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <p className="text-white font-medium">Image Preview</p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="text-center text-primary/40">
                                                        <Image size={48} className="mx-auto mb-2 opacity-50" />
                                                        <p className="text-sm">No image selected</p>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-xs text-primary/50 text-center">
                                                Enter a valid image URL to see a preview above.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-6 border-t border-primary/10">
                                        <button 
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-6 py-3 rounded-xl text-primary hover:bg-primary/5 font-bold transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit"
                                            className="px-8 py-3 bg-primary text-[#ede9d6] rounded-xl font-bold hover:bg-[#021a15] flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
                                        >
                                            <Save size={18} /> Save Project
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredProjects.length === 0 && (
                                <div className="col-span-full py-20 text-center bg-white/5 rounded-2xl border border-dashed border-white/10">
                                    <Search size={48} className="mx-auto text-accent/20 mb-4" />
                                    <p className="text-accent/60 font-medium">No projects found matching your search.</p>
                                    <button onClick={() => setSearchQuery('')} className="mt-4 text-highlight text-sm hover:underline">Clear Search</button>
                                </div>
                            )}

                            {filteredProjects.map((project) => {
                                // Logic to display screenshot if dev project has valid link
                                const shouldUseScreenshot = project.category === 'Development' && project.link && project.link.startsWith('http');
                                const displayImage = shouldUseScreenshot 
                                    ? `https://api.microlink.io/?url=${encodeURIComponent(project.link!)}&screenshot=true&meta=false&embed=screenshot.url`
                                    : project.imageUrl;
                                
                                return (
                                <div key={project.id} className={`bg-[#ede9d6] rounded-2xl overflow-hidden shadow-lg border border-transparent hover:border-highlight/50 transition-all duration-300 group flex flex-col h-full ${project.visible === false ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                                    <div className="h-48 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors z-10"></div>
                                        <img 
                                        src={displayImage} 
                                        alt={project.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => { 
                                            const target = e.currentTarget;
                                            if (shouldUseScreenshot && target.src !== project.imageUrl && project.imageUrl) {
                                                target.src = project.imageUrl;
                                            } else {
                                                target.src = 'https://placehold.co/600x400/013328/ede9d6?text=Project'; 
                                            }
                                        }}
                                        />
                                        <div className="absolute top-3 right-3 z-20 flex gap-2">
                                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                                                project.category === 'Development' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                            }`}>
                                                {project.category}
                                            </span>
                                        </div>

                                        {project.visible === false && (
                                            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                                                <span className="bg-black/70 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-sm">Hidden</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="p-5 flex-1 flex flex-col">
                                        <h3 className="text-lg font-bold text-primary mb-2 group-hover:text-highlight transition-colors">{project.title}</h3>
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {project.technologies.slice(0, 3).map(tech => (
                                                <span key={tech} className="text-[10px] bg-primary/5 text-primary/70 px-2 py-0.5 rounded-full border border-primary/5">
                                                    {tech}
                                                </span>
                                            ))}
                                            {project.technologies.length > 3 && (
                                                <span className="text-[10px] bg-primary/5 text-primary/70 px-2 py-0.5 rounded-full">+{project.technologies.length - 3}</span>
                                            )}
                                        </div>
                                        
                                        <div className="flex justify-between items-center pt-4 border-t border-primary/10 mt-auto">
                                            <div className="flex gap-1">
                                                <button 
                                                    onClick={(e) => handleToggleVisibility(project, e)}
                                                    className={`p-2 rounded-lg transition-colors ${project.visible !== false ? 'text-highlight hover:bg-highlight hover:text-white' : 'text-gray-400 hover:bg-gray-400 hover:text-white'}`}
                                                    title={project.visible !== false ? "Hide Project" : "Show Project"}
                                                >
                                                    {project.visible !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                                                </button>
                                                <button 
                                                    onClick={() => handleEdit(project)}
                                                    className="p-2 text-primary/70 hover:bg-primary hover:text-white rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                {project.link && project.link !== '#' && (
                                                    <a 
                                                        href={project.link}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="p-2 text-primary/70 hover:bg-primary hover:text-white rounded-lg transition-colors"
                                                        title="View Live"
                                                    >
                                                        <ExternalLink size={16} />
                                                    </a>
                                                )}
                                            </div>
                                            <button 
                                                onClick={() => handleDelete(project.id)}
                                                className="p-2 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )})}
                            </div>
                        )}
                    </>
                    )}
                </div>
            )}

            {activeTab === 'inbox' && (
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8 bg-[#021a15]/30 p-4 rounded-2xl border border-white/5">
                        <div>
                             <h2 className="text-2xl font-bold text-accent">Inbox</h2>
                             <p className="text-sm text-accent/50">Messages from potential clients.</p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-accent/60 bg-[#013328] px-3 py-1.5 rounded-lg border border-white/5">
                            <MailOpen size={14} />
                            <span>{messages.filter(m => m.read).length} Read</span>
                            <span className="w-1 h-1 bg-white/20 rounded-full mx-1"></span>
                            <span className="text-highlight font-bold">{messages.filter(m => !m.read).length} Unread</span>
                        </div>
                    </div>
                    
                    {messages.length === 0 ? (
                        <div className="text-center py-24 bg-white/5 rounded-3xl border border-dashed border-white/10 flex flex-col items-center">
                            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                                <Inbox size={40} className="text-accent/30" />
                            </div>
                            <h3 className="text-xl font-bold text-accent mb-2">No Messages Yet</h3>
                            <p className="text-accent/50 max-w-xs">When people contact you via the contact form, their messages will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((msg) => (
                                <div 
                                    key={msg.id} 
                                    onClick={() => handleMarkRead(msg.id)}
                                    className={`bg-[#ede9d6] rounded-xl border transition-all cursor-pointer relative group overflow-hidden ${msg.read ? 'border-transparent opacity-90' : 'border-l-8 border-l-highlight border-t-transparent border-r-transparent border-b-transparent shadow-xl scale-[1.01]'}`}
                                >
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                {!msg.read && <div className="w-2.5 h-2.5 bg-highlight rounded-full animate-pulse shadow-[0_0_8px_#f4a261]"></div>}
                                                <h3 className={`text-lg ${msg.read ? 'text-primary/70 font-medium' : 'text-primary font-bold'}`}>{msg.name}</h3>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-primary/50 bg-primary/5 px-2 py-1 rounded">
                                                <Clock size={12} />
                                                {new Date(msg.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 mb-4 text-sm text-primary/70 font-mono bg-white/50 px-3 py-1 rounded w-fit">
                                            <span>From:</span>
                                            <span className="select-all">{msg.email}</span>
                                        </div>
                                        
                                        <p className="text-primary/90 leading-relaxed mb-6 whitespace-pre-wrap text-sm md:text-base border-l-2 border-primary/10 pl-4">
                                            {msg.content}
                                        </p>
                                        
                                        <div className="flex justify-between items-center pt-4 border-t border-primary/10">
                                            <a 
                                                href={`mailto:${msg.email}?subject=Re: Portfolio Inquiry`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-primary/70 hover:text-highlight flex items-center gap-2 text-sm font-bold transition-colors"
                                            >
                                                <MailOpen size={16} /> Reply via Email
                                            </a>
                                            <button 
                                                onClick={(e) => handleDeleteMessage(msg.id, e)}
                                                className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 text-xs uppercase font-bold tracking-wider"
                                                title="Delete Message"
                                            >
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Unread indicator background accent */}
                                    {!msg.read && (
                                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-highlight/20 to-transparent pointer-events-none"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'profile' && (
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-8 bg-[#021a15]/30 p-4 rounded-2xl border border-white/5">
                        <div>
                             <h2 className="text-2xl font-bold text-accent">Edit Profile</h2>
                             <p className="text-sm text-accent/50">Update your personal information.</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#013328] flex items-center justify-center border border-white/10">
                            <Settings size={20} className="text-accent" />
                        </div>
                    </div>

                    <div className="bg-[#ede9d6] p-6 md:p-8 rounded-2xl shadow-xl">
                        <form onSubmit={handleSaveProfile} className="space-y-6">
                             {profileMessage.text && (
                                <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-2 ${
                                    profileMessage.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
                                }`}>
                                    {profileMessage.type === 'success' ? <CheckCircle size={16}/> : <X size={16}/>}
                                    {profileMessage.text}
                                </div>
                            )}

                            <div className="flex flex-col items-center mb-6">
                                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-4 border-primary/5 mb-4 relative group">
                                    {profileForm.photoUrl ? (
                                        <img src={profileForm.photoUrl} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon size={40} className="text-primary/30" />
                                    )}
                                </div>
                                <p className="text-xs text-primary/50">Profile Picture Preview</p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-primary mb-2">Display Name</label>
                                    <input 
                                        type="text" 
                                        value={profileForm.name} 
                                        onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                                        className="w-full p-3 bg-white border border-primary/20 rounded-xl text-primary focus:border-highlight outline-none transition-all"
                                        placeholder="Your Name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-primary mb-2">Job Title</label>
                                    <input 
                                        type="text" 
                                        value={profileForm.title} 
                                        onChange={e => setProfileForm({...profileForm, title: e.target.value})}
                                        className="w-full p-3 bg-white border border-primary/20 rounded-xl text-primary focus:border-highlight outline-none transition-all"
                                        placeholder="e.g. Senior Architect"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-primary mb-2 flex items-center gap-1">
                                        <Image size={16} /> Profile Photo URL
                                    </label>
                                    <input 
                                        type="text" 
                                        value={profileForm.photoUrl} 
                                        onChange={e => setProfileForm({...profileForm, photoUrl: e.target.value})}
                                        className="w-full p-3 bg-white border border-primary/20 rounded-xl text-primary focus:border-highlight outline-none transition-all"
                                        placeholder="https://..."
                                    />
                                    <p className="text-xs text-primary/50 mt-2">Paste a direct link to an image (e.g. from Unsplash or GitHub).</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-primary/10">
                                <button 
                                    type="submit" 
                                    disabled={isSavingProfile}
                                    className="w-full py-3 bg-primary text-[#ede9d6] rounded-xl font-bold hover:bg-[#021a15] flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-70"
                                >
                                    {isSavingProfile ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} /> Update Profile
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    </div>
  );
};

export default CMSDashboard;
