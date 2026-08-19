import { getBlob, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../../firebase';

export const storageService = {
  async uploadResume(userId: string, file: File): Promise<string> {
    const storageRef = ref(storage, `resumes/${userId}/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  },

  async getResumeBlob(url: string): Promise<Blob> {
    return await getBlob(ref(storage, url));
  }
};