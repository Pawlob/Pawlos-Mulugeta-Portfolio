
import { User } from '../types';
import { auth } from './firebase';
import * as firebaseAuth from 'firebase/auth';

class AuthService {
  private currentUser: User | null = null;

  constructor() {
    // Initialize listener for real Firebase Auth
    firebaseAuth.onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        this.currentUser = this.mapFirebaseUser(firebaseUser);
      } else {
        this.currentUser = null;
      }
      window.dispatchEvent(new Event('auth-change'));
    });
  }

  async login(email: string, password: string): Promise<User> {
    try {
      // Attempt real Firebase Login
      const userCredential = await firebaseAuth.signInWithEmailAndPassword(auth, email, password);
      const user = this.mapFirebaseUser(userCredential.user);
      this.currentUser = user;
      return user;
    } catch (error: any) {
      console.warn("Firebase Login Failed:", error.code);
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  async logout(): Promise<void> {
    try {
        await firebaseAuth.signOut(auth);
    } catch (e) {
        console.error("Logout error", e);
    }
    this.currentUser = null;
    window.dispatchEvent(new Event('auth-change'));
  }

  async updateCurrentUser(updates: Partial<User>): Promise<void> {
    if (!this.currentUser) throw new Error("No user logged in");

    try {
        // Update Firebase if a real user exists
        if (auth.currentUser) {
            await firebaseAuth.updateProfile(auth.currentUser, {
                displayName: updates.name,
                photoURL: updates.photoUrl
            });
        }

        // Update local state
        this.currentUser = { ...this.currentUser, ...updates };

        // Notify UI
        window.dispatchEvent(new Event('auth-change'));

    } catch (error) {
        console.error("Failed to update profile", error);
        throw error;
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  private mapFirebaseUser(firebaseUser: firebaseAuth.User): User {
    return {
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Admin',
      photoUrl: firebaseUser.photoURL || '',
      title: 'Administrator', // Default title for firebase users
      token: 'firebase-token'
    };
  }

  private getErrorMessage(code: string): string {
    switch (code) {
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/user-disabled':
        return 'This user account has been disabled.';
      case 'auth/user-not-found':
        return 'No user found with this email.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/configuration-not-found':
      case 'auth/operation-not-allowed':
        return 'Login service not configured. Please contact the administrator.';
      case 'auth/network-request-failed':
        return 'Network error. Check your connection.';
      default:
        return 'Login failed. Please check credentials.';
    }
  }
}

export const authService = new AuthService();
