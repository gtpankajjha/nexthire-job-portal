import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Application, ApplicationStatus, Job, User } from '../../types';
import { cleanData } from '../utils/clean-data';

export const applicationService = {
  async apply(applicationData: Omit<Application, 'id' | 'appliedAt' | 'status'>): Promise<Application> {
    const q = query(collection(db, 'applications'), where('jobId', '==', applicationData.jobId), where('seekerId', '==', applicationData.seekerId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) throw new Error('You have already applied for this job.');
    const newAppData = cleanData({ ...applicationData, status: ApplicationStatus.APPLIED, appliedAt: Date.now() });
    const docRef = await addDoc(collection(db, 'applications'), newAppData);
    return { id: docRef.id, ...newAppData } as Application;
  },

  async getSeekerApplications(seekerId: string): Promise<(Application & { job?: Job })[]> {
    const snapshot = await getDocs(query(collection(db, 'applications'), where('seekerId', '==', seekerId)));
    const applications = snapshot.docs.map(applicationDoc => ({ id: applicationDoc.id, ...applicationDoc.data() } as Application));
    const enriched = await Promise.all(applications.map(async application => {
      try {
        const jobDoc = await getDoc(doc(db, 'jobs', application.jobId));
        return { ...application, job: jobDoc.exists() ? { id: jobDoc.id, ...jobDoc.data() } as Job : undefined };
      } catch (error) {
        return { ...application, job: undefined };
      }
    }));
    return enriched.sort((a, b) => b.appliedAt - a.appliedAt);
  },

  async getEmployerApplications(employerId: string, jobId?: string): Promise<(Application & { seeker?: User, job?: Job })[]> {
    const constraints: any[] = [where('employerId', '==', employerId)];
    if (jobId) constraints.push(where('jobId', '==', jobId));
    const snapshot = await getDocs(query(collection(db, 'applications'), ...constraints));
    const applications = snapshot.docs.map(applicationDoc => ({ id: applicationDoc.id, ...applicationDoc.data() } as Application));
    const enriched = await Promise.all(applications.map(async application => {
      try {
        const seekerDoc = await getDoc(doc(db, 'users', application.seekerId));
        const jobDoc = await getDoc(doc(db, 'jobs', application.jobId));
        return {
          ...application,
          seeker: seekerDoc.exists() ? { id: seekerDoc.id, ...seekerDoc.data() } as User : undefined,
          job: jobDoc.exists() ? { id: jobDoc.id, ...jobDoc.data() } as Job : undefined
        };
      } catch (error) {
        return { ...application };
      }
    }));
    return enriched.sort((a, b) => b.appliedAt - a.appliedAt);
  },

  async updateStatus(appId: string, status: ApplicationStatus): Promise<void> {
    await updateDoc(doc(db, 'applications', appId), { status });
  }
};