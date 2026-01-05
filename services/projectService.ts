
import { Project } from '../types';
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query } from 'firebase/firestore';
import { localDb } from './db';

const COLLECTION_NAME = 'projects';

class ProjectService {
  
  async getProjects(): Promise<Project[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME));
      const querySnapshot = await getDocs(q);
      const projects: Project[] = [];
      
      querySnapshot.forEach((doc) => {
        projects.push({ id: doc.id, ...doc.data() } as Project);
      });

      // If Firebase returns empty, check if we should fallback to local (e.g. if we expect initial data)
      if (projects.length === 0) {
          const localData = await localDb.projects.getAll();
          // Only use local if it actually has data
          if (localData.length > 0) return localData;
      }

      return projects;
    } catch (error: any) {
      // Permission denied or offline -> Use Local Backend
      if (this.shouldFallback(error)) {
        console.warn("Using Local Backend for Projects");
        return await localDb.projects.getAll();
      }
      console.error("Error fetching projects:", error);
      return [];
    }
  }

  async addProject(project: Omit<Project, 'id'>): Promise<Project> {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), project);
      const newProject = { id: docRef.id, ...project };
      this.notify();
      return newProject;
    } catch (error: any) {
      if (this.shouldFallback(error)) {
          const newProject = await localDb.projects.add(project);
          this.notify();
          return newProject;
      }
      throw error;
    }
  }

  async updateProject(project: Project): Promise<void> {
    try {
      // If ID starts with 'local_', skip Firebase and go straight to local DB
      if (String(project.id).startsWith('local_')) {
          await localDb.projects.update(project);
          this.notify();
          return;
      }

      const projectRef = doc(db, COLLECTION_NAME, String(project.id));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...data } = project;
      await updateDoc(projectRef, data);
      this.notify();
    } catch (error: any) {
      if (this.shouldFallback(error)) {
          await localDb.projects.update(project);
          this.notify();
          return;
      }
      throw error;
    }
  }

  async deleteProject(id: string | number): Promise<void> {
    try {
      if (String(id).startsWith('local_')) {
          await localDb.projects.delete(id);
          this.notify();
          return;
      }

      await deleteDoc(doc(db, COLLECTION_NAME, String(id)));
      this.notify();
    } catch (error: any) {
      if (this.shouldFallback(error)) {
          await localDb.projects.delete(id);
          this.notify();
          return;
      }
      throw error;
    }
  }

  private notify() {
    window.dispatchEvent(new Event('project-change'));
  }

  private shouldFallback(error: any): boolean {
      const code = error.code || '';
      return (
          code === 'permission-denied' || 
          code === 'unavailable' || 
          code.includes('offline') ||
          error.message?.includes('Missing or insufficient permissions')
      );
  }
}

export const projectService = new ProjectService();
