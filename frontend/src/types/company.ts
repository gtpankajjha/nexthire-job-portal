export interface Company {
  id: string;
  employerId: string;
  name: string;
  logo?: string;
  description?: string;
  website?: string;
  location?: string;
  industry?: string;
  size?: string;
  createdAt: number;
}