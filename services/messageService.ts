
import { Message } from '../types';
import { db } from './firebase';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { localDb } from './db';

const COLLECTION_NAME = 'messages';

class MessageService {

  async sendMessage(data: Omit<Message, 'id' | 'date' | 'read'>): Promise<Message> {
    const messageData = {
        ...data,
        date: new Date().toISOString(),
        read: false
    };

    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), messageData);
      const newMessage = { id: docRef.id, ...messageData };
      this.notify();
      return newMessage;
    } catch (error: any) {
      if (this.shouldFallback(error)) {
          console.warn("Using Local Backend for Messages");
          const newMessage = await localDb.messages.add(messageData as Message);
          this.notify();
          return newMessage;
      }
      console.error("Error sending message:", error);
      throw error;
    }
  }

  async getMessages(): Promise<Message[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const messages: Message[] = [];
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as Message);
      });
      return messages;
    } catch (error: any) {
      if (this.shouldFallback(error)) {
          const localMessages = await localDb.messages.getAll();
          // Local DB doesn't support complex sorting automatically, so sort manually here
          return localMessages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }
      console.warn("Error fetching messages:", error);
      return [];
    }
  }

  async markAsRead(id: string): Promise<void> {
    try {
      if (id.startsWith('local_')) {
         // Find msg locally
         const msgs = await localDb.messages.getAll();
         const msg = msgs.find(m => m.id === id);
         if (msg) {
             await localDb.messages.update({ ...msg, read: true });
             this.notify();
         }
         return;
      }

      const msgRef = doc(db, COLLECTION_NAME, id);
      await updateDoc(msgRef, { read: true });
      this.notify();
    } catch (error: any) {
       if (this.shouldFallback(error)) {
           // Fallback logic duplicated for safety
           const msgs = await localDb.messages.getAll();
           const msg = msgs.find(m => m.id === id);
           if (msg) {
               await localDb.messages.update({ ...msg, read: true });
               this.notify();
           }
       }
    }
  }

  async deleteMessage(id: string): Promise<void> {
    try {
      if (id.startsWith('local_')) {
          await localDb.messages.delete(id);
          this.notify();
          return;
      }

      await deleteDoc(doc(db, COLLECTION_NAME, id));
      this.notify();
    } catch (error: any) {
      if (this.shouldFallback(error)) {
          await localDb.messages.delete(id);
          this.notify();
      }
    }
  }
  
  async getUnreadCount(): Promise<number> {
    const messages = await this.getMessages();
    return messages.filter(m => !m.read).length;
  }

  private notify() {
    window.dispatchEvent(new Event('message-change'));
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

export const messageService = new MessageService();
