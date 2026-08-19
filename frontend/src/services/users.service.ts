import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { User } from '../../types';
import { cleanData } from '../utils/clean-data';

export const userService = {
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, cleanData(updates));
    const updatedDoc = await getDoc(userRef);
    return { id: updatedDoc.id, ...updatedDoc.data() } as User;
  }
};