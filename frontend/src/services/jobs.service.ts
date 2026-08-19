import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Job, JobStatus } from '../../types';
import { cleanData } from '../utils/clean-data';

export const jobService = {
  async getJobs(filters?: any): Promise<Job[]> {
    let q = collection(db, 'jobs');
    const constraints: any[] = [];
    if (!filters?.includeAllStatuses) constraints.push(where('status', '==', JobStatus.ACTIVE));
    if (filters?.employerId) constraints.push(where('employerId', '==', filters.employerId));
    if (filters?.type) constraints.push(where('type', '==', filters.type));
    if (filters?.mode) constraints.push(where('mode', '==', filters.mode));
    const finalQuery = constraints.length > 0 ? query(q, ...constraints) : q;
    const querySnapshot = await getDocs(finalQuery);
    let jobs = querySnapshot.docs.map(jobDoc => ({ id: jobDoc.id, ...jobDoc.data() } as Job));

    if (filters?.keyword) {
      const keyword = filters.keyword.toLowerCase();
      jobs = jobs.filter(job => job.title.toLowerCase().includes(keyword) || job.company.toLowerCase().includes(keyword) || (job.skills && job.skills.some(skill => skill.toLowerCase().includes(keyword))));
    }
    if (filters?.location) {
      const location = filters.location.toLowerCase();
      jobs = jobs.filter(job => job.location.toLowerCase().includes(location));
    }
    if (filters?.minSalary) jobs = jobs.filter(job => job.salaryMax >= Number(filters.minSalary));
    if (filters?.experience) jobs = jobs.filter(job => job.experienceMin <= Number(filters.experience));

    if (filters?.sort === 'salary-desc') jobs.sort((a, b) => b.salaryMax - a.salaryMax);
    else if (filters?.sort === 'salary-asc') jobs.sort((a, b) => a.salaryMin - b.salaryMin);
    else jobs.sort((a, b) => b.createdAt - a.createdAt);
    return jobs;
  },

  async getJobById(id: string): Promise<Job | null> {
    try {
      const jobDoc = await getDoc(doc(db, 'jobs', id));
      return jobDoc.exists() ? { id: jobDoc.id, ...jobDoc.data() } as Job : null;
    } catch (error) {
      console.warn("Could not fetch job details (may be inactive or deleted):", error);
      return null;
    }
  },

  async createJob(jobData: Omit<Job, 'id' | 'createdAt'>): Promise<Job> {
    const newJobData = cleanData({ ...jobData, createdAt: Date.now() });
    const docRef = await addDoc(collection(db, 'jobs'), newJobData);
    return { id: docRef.id, ...newJobData } as Job;
  },

  async updateJob(id: string, updates: Partial<Job>): Promise<Job> {
    const jobRef = doc(db, 'jobs', id);
    await updateDoc(jobRef, cleanData(updates));
    const updatedDoc = await getDoc(jobRef);
    return { id: updatedDoc.id, ...updatedDoc.data() } as Job;
  }
};