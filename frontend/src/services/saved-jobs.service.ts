import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Job } from '../../types';

export const savedJobService = {
  async toggleSave(seekerId: string, jobId: string): Promise<boolean> {
    const snapshot = await getDocs(query(collection(db, 'saved_jobs'), where('seekerId', '==', seekerId), where('jobId', '==', jobId)));
    if (!snapshot.empty) {
      await deleteDoc(doc(db, 'saved_jobs', snapshot.docs[0].id));
      return false;
    }
    await addDoc(collection(db, 'saved_jobs'), { seekerId, jobId, savedAt: Date.now() });
    return true;
  },

  async getSavedJobs(seekerId: string): Promise<Job[]> {
    const snapshot = await getDocs(query(collection(db, 'saved_jobs'), where('seekerId', '==', seekerId)));
    const savedJobIds = snapshot.docs.map(savedJobDoc => savedJobDoc.data().jobId);
    if (savedJobIds.length === 0) return [];
    const jobs = await Promise.all(savedJobIds.map(async id => {
      try {
        const jobDoc = await getDoc(doc(db, 'jobs', id));
        return jobDoc.exists() ? { id: jobDoc.id, ...jobDoc.data() } as Job : null;
      } catch (error) {
        return null;
      }
    }));
    return jobs.filter(job => job !== null) as Job[];
  },

  async isSaved(seekerId: string, jobId: string): Promise<boolean> {
    const snapshot = await getDocs(query(collection(db, 'saved_jobs'), where('seekerId', '==', seekerId), where('jobId', '==', jobId)));
    return !snapshot.empty;
  }
};