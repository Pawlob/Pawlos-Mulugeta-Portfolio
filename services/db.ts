
import { Project, Message } from '../types';
import { PROJECTS as INITIAL_PROJECTS } from '../constants';

const DB_PREFIX = 'pawlos_local_db_';

/**
 * A generic collection class that simulates a database table/collection
 * using localStorage with async methods to mimic API calls.
 */
class Collection<T extends { id: string | number }> {
    private name: string;

    constructor(name: string, initialData: T[] = []) {
        this.name = name;
        // Seed data if collection doesn't exist
        if (!localStorage.getItem(DB_PREFIX + name)) {
            this.save(initialData);
        }
    }

    private load(): T[] {
        const data = localStorage.getItem(DB_PREFIX + this.name);
        return data ? JSON.parse(data) : [];
    }

    private save(data: T[]) {
        localStorage.setItem(DB_PREFIX + this.name, JSON.stringify(data));
    }

    async getAll(): Promise<T[]> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 400));
        return this.load();
    }

    async add(item: Omit<T, 'id'>): Promise<T> {
        await new Promise(resolve => setTimeout(resolve, 400));
        const items = this.load();
        
        // Generate a robust string ID
        const newItem = { 
            ...item, 
            id: `local_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` 
        } as T;
        
        this.save([newItem, ...items]); // Add to top of list
        return newItem;
    }

    async update(item: T): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 400));
        const items = this.load();
        const index = items.findIndex(i => String(i.id) === String(item.id));
        
        if (index !== -1) {
            items[index] = item;
            this.save(items);
        }
    }

    async delete(id: string | number): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, 400));
        const items = this.load();
        const filtered = items.filter(i => String(i.id) !== String(id));
        this.save(filtered);
    }
}

/**
 * LocalBackend acts as the source of truth when Firebase is unavailable.
 */
class LocalBackend {
    projects: Collection<Project>;
    messages: Collection<Message>;

    constructor() {
        // Initialize collections
        this.projects = new Collection<Project>('projects', INITIAL_PROJECTS);
        this.messages = new Collection<Message>('messages', []);
    }
}

export const localDb = new LocalBackend();
