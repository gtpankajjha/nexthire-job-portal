import { addDoc, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Company } from '../../types';
import { cleanData } from '../utils/clean-data';

export const companyService = {
  async getCompanyByEmployer(employerId: string): Promise<Company | null> {
    const snapshot = await getDocs(query(collection(db, 'companies'), where('employerId', '==', employerId)));
    if (snapshot.empty) return null;
    const companyDoc = snapshot.docs[0];
    return { id: companyDoc.id, ...companyDoc.data() } as Company;
  },

  async saveCompany(employerId: string, companyData: Partial<Company>): Promise<Company> {
    const existing = await this.getCompanyByEmployer(employerId);
    const cleanCompanyData = cleanData(companyData);
    delete cleanCompanyData.id;
    delete cleanCompanyData.employerId;
    delete cleanCompanyData.createdAt;

    if (existing) {
      await updateDoc(doc(db, 'companies', existing.id), cleanCompanyData);
      return { ...existing, ...cleanCompanyData };
    }

    const newCompany = cleanData({ ...cleanCompanyData, employerId, createdAt: Date.now() });
    const docRef = await addDoc(collection(db, 'companies'), newCompany);
    return { id: docRef.id, ...newCompany } as Company;
  }
};