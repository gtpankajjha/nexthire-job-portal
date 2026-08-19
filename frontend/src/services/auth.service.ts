import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { User, UserRole } from '../../types';
import { cleanData } from '../utils/clean-data';

export const authService = {
  async login(email: string, password?: string): Promise<User> {
    if (!password) throw new Error("Password is required");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (!userDoc.exists()) throw new Error('User profile not found in database.');
    return { id: userDoc.id, ...userDoc.data() } as User;
  },

  async register(userData: Partial<User>, password?: string): Promise<User> {
    if (!password) throw new Error("Password is required");
    if (!userData.email) throw new Error("Email is required");
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
    const uid = userCredential.user.uid;
    const newUser = cleanData({
      id: uid,
      email: userData.email,
      role: userData.role || UserRole.SEEKER,
      name: userData.name || 'New User',
      createdAt: Date.now(),
      ...userData
    });
    await setDoc(doc(db, 'users', uid), newUser);
    return newUser as User;
  },

  async getCurrentUser(uid: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } as User : null;
  },

  async logout(): Promise<void> {
    await signOut(auth);
  }
};