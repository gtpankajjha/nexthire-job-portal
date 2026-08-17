import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, getBlob } from 'firebase/storage';
import { auth, db, storage } from './firebase';
import { User, Job, Application, SavedJob, Company, UserRole, JobStatus, ApplicationStatus } from './types';

// --- Utilities ---
export const cleanData = (obj: any): any => {
  const cleaned: any = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  });
  return cleaned;
};

// --- Auth Service ---
export const authService = {
  async login(email: string, password?: string): Promise<User> {
    if (!password) throw new Error("Password is required");
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User profile not found in database.');
    }
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
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const userRef = doc(db, 'users', userId);
    const cleanUpdates = cleanData(updates);
    await updateDoc(userRef, cleanUpdates);
    const updatedDoc = await getDoc(userRef);
    return { id: updatedDoc.id, ...updatedDoc.data() } as User;
  }
};

// --- Storage Service ---
export const storageService = {
  async uploadResume(userId: string, file: File): Promise<string> {
    const storageRef = ref(storage, `resumes/${userId}/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  },
  
  async getResumeBlob(url: string): Promise<Blob> {
    // Create a reference from the existing download URL
    const storageRef = ref(storage, url);
    // Fetch the file securely via the Firebase SDK
    return await getBlob(storageRef);
  }
};

// --- Company Service ---
export const companyService = {
  async getCompanyByEmployer(employerId: string): Promise<Company | null> {
    const q = query(collection(db, 'companies'), where('employerId', '==', employerId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Company;
    }
    return null;
  },

  async saveCompany(employerId: string, companyData: Partial<Company>): Promise<Company> {
    const existing = await this.getCompanyByEmployer(employerId);
    const cleanCompanyData = cleanData(companyData);

    // Prevent overwriting protected fields during update
    delete cleanCompanyData.id;
    delete cleanCompanyData.employerId;
    delete cleanCompanyData.createdAt;

    if (existing) {
      const companyRef = doc(db, 'companies', existing.id);
      await updateDoc(companyRef, cleanCompanyData);
      return { ...existing, ...cleanCompanyData };
    } else {
      const newCompany = cleanData({
        ...cleanCompanyData,
        employerId,
        createdAt: Date.now()
      });
      const docRef = await addDoc(collection(db, 'companies'), newCompany);
      return { id: docRef.id, ...newCompany } as Company;
    }
  }
};

// --- Job Service ---
export const jobService = {
  async getJobs(filters?: any): Promise<Job[]> {
    let q = collection(db, 'jobs');
    let constraints: any[] = [];

    // 1. Firestore Queries (Exact matches to utilize indexes efficiently)
    if (!filters?.includeAllStatuses) {
      constraints.push(where('status', '==', JobStatus.ACTIVE));
    }
    if (filters?.employerId) {
      constraints.push(where('employerId', '==', filters.employerId));
    }
    if (filters?.type) {
      constraints.push(where('type', '==', filters.type));
    }
    if (filters?.mode) {
      constraints.push(where('mode', '==', filters.mode));
    }

    const finalQuery = constraints.length > 0 ? query(q, ...constraints) : q;
    const querySnapshot = await getDocs(finalQuery);
    
    let jobs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job));

    // 2. In-Memory Filtering 
    // (Firestore lacks native full-text search and multiple inequality filters across different fields)
    
    if (filters?.keyword) {
      const kw = filters.keyword.toLowerCase();
      jobs = jobs.filter(j => 
        j.title.toLowerCase().includes(kw) || 
        j.company.toLowerCase().includes(kw) ||
        (j.skills && j.skills.some(s => s.toLowerCase().includes(kw)))
      );
    }
    
    if (filters?.location) {
      const loc = filters.location.toLowerCase();
      jobs = jobs.filter(j => j.location.toLowerCase().includes(loc));
    }

    if (filters?.minSalary) {
      const minSal = Number(filters.minSalary);
      // Include jobs where the maximum salary offered is at least the requested minimum
      jobs = jobs.filter(j => j.salaryMax >= minSal);
    }

    if (filters?.experience) {
      const exp = Number(filters.experience);
      // Include jobs where the required minimum experience is less than or equal to the user's experience
      jobs = jobs.filter(j => j.experienceMin <= exp);
    }

    // 3. Sorting
    if (filters?.sort === 'salary-desc') {
      jobs.sort((a, b) => b.salaryMax - a.salaryMax);
    } else if (filters?.sort === 'salary-asc') {
      jobs.sort((a, b) => a.salaryMin - b.salaryMin);
    } else {
      // Default: Newest first
      jobs.sort((a, b) => b.createdAt - a.createdAt);
    }
    
    return jobs;
  },

  async getJobById(id: string): Promise<Job | null> {
    try {
      const jobDoc = await getDoc(doc(db, 'jobs', id));
      if (jobDoc.exists()) {
        return { id: jobDoc.id, ...jobDoc.data() } as Job;
      }
      return null;
    } catch (error) {
      console.warn("Could not fetch job details (may be inactive or deleted):", error);
      return null;
    }
  },

  async createJob(jobData: Omit<Job, 'id' | 'createdAt'>): Promise<Job> {
    const newJobData = cleanData({
      ...jobData,
      createdAt: Date.now()
    });
    
    const docRef = await addDoc(collection(db, 'jobs'), newJobData);
    return { id: docRef.id, ...newJobData } as Job;
  },

  async updateJob(id: string, updates: Partial<Job>): Promise<Job> {
    const jobRef = doc(db, 'jobs', id);
    const cleanUpdates = cleanData(updates);
    await updateDoc(jobRef, cleanUpdates);
    const updatedDoc = await getDoc(jobRef);
    return { id: updatedDoc.id, ...updatedDoc.data() } as Job;
  }
};

// --- Application Service ---
export const applicationService = {
  async apply(applicationData: Omit<Application, 'id' | 'appliedAt' | 'status'>): Promise<Application> {
    const q = query(
      collection(db, 'applications'), 
      where('jobId', '==', applicationData.jobId),
      where('seekerId', '==', applicationData.seekerId)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      throw new Error('You have already applied for this job.');
    }

    const newAppData = cleanData({
      ...applicationData,
      status: ApplicationStatus.APPLIED,
      appliedAt: Date.now()
    });
    
    const docRef = await addDoc(collection(db, 'applications'), newAppData);
    return { id: docRef.id, ...newAppData } as Application;
  },

  async getSeekerApplications(seekerId: string): Promise<(Application & { job?: Job })[]> {
    const q = query(collection(db, 'applications'), where('seekerId', '==', seekerId));
    const snapshot = await getDocs(q);
    const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
    
    const appsWithJobs = await Promise.all(apps.map(async (app) => {
      try {
        const jobDoc = await getDoc(doc(db, 'jobs', app.jobId));
        return { 
          ...app, 
          job: jobDoc.exists() ? { id: jobDoc.id, ...jobDoc.data() } as Job : undefined 
        };
      } catch (error) {
        return { ...app, job: undefined };
      }
    }));
    
    return appsWithJobs.sort((a, b) => b.appliedAt - a.appliedAt);
  },

  async getEmployerApplications(employerId: string, jobId?: string): Promise<(Application & { seeker?: User, job?: Job })[]> {
    let constraints: any[] = [where('employerId', '==', employerId)];
    if (jobId) {
      constraints.push(where('jobId', '==', jobId));
    }
    
    const q = query(collection(db, 'applications'), ...constraints);
    const snapshot = await getDocs(q);
    const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
    
    const enrichedApps = await Promise.all(apps.map(async (app) => {
      try {
        const seekerDoc = await getDoc(doc(db, 'users', app.seekerId));
        const jobDoc = await getDoc(doc(db, 'jobs', app.jobId));
        return { 
          ...app, 
          seeker: seekerDoc.exists() ? { id: seekerDoc.id, ...seekerDoc.data() } as User : undefined,
          job: jobDoc.exists() ? { id: jobDoc.id, ...jobDoc.data() } as Job : undefined
        };
      } catch (error) {
        return { ...app };
      }
    }));

    return enrichedApps.sort((a, b) => b.appliedAt - a.appliedAt);
  },

  async updateStatus(appId: string, status: ApplicationStatus): Promise<void> {
    const appRef = doc(db, 'applications', appId);
    await updateDoc(appRef, { status });
  }
};

// --- Saved Jobs Service ---
export const savedJobService = {
  async toggleSave(seekerId: string, jobId: string): Promise<boolean> {
    const q = query(
      collection(db, 'saved_jobs'), 
      where('seekerId', '==', seekerId),
      where('jobId', '==', jobId)
    );
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const docId = snapshot.docs[0].id;
      await deleteDoc(doc(db, 'saved_jobs', docId));
      return false;
    } else {
      await addDoc(collection(db, 'saved_jobs'), {
        seekerId,
        jobId,
        savedAt: Date.now()
      });
      return true;
    }
  },

  async getSavedJobs(seekerId: string): Promise<Job[]> {
    const q = query(collection(db, 'saved_jobs'), where('seekerId', '==', seekerId));
    const snapshot = await getDocs(q);
    const savedJobIds = snapshot.docs.map(doc => doc.data().jobId);
    
    if (savedJobIds.length === 0) return [];

    const jobs = await Promise.all(savedJobIds.map(async (id) => {
      try {
        const jobDoc = await getDoc(doc(db, 'jobs', id));
        return jobDoc.exists() ? { id: jobDoc.id, ...jobDoc.data() } as Job : null;
      } catch (error) {
        return null;
      }
    }));
    
    return jobs.filter(j => j !== null) as Job[];
  },
  
  async isSaved(seekerId: string, jobId: string): Promise<boolean> {
    const q = query(
      collection(db, 'saved_jobs'), 
      where('seekerId', '==', seekerId),
      where('jobId', '==', jobId)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  }
};
