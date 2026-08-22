import { db } from '../firebase.js';
import type { NotificationJob, NotificationUser } from '../types.js';

export async function getUser(userId: string): Promise<NotificationUser | null> {
  const snapshot = await db.doc(`users/${userId}`).get();
  if (!snapshot.exists) return null;

  const data = snapshot.data() as Partial<NotificationUser>;
  if (!data.email || !data.name || !data.role) return null;

  return {
    id: snapshot.id,
    email: data.email,
    name: data.name,
    role: data.role
  };
}

export async function getJob(jobId: string): Promise<NotificationJob | null> {
  const snapshot = await db.doc(`jobs/${jobId}`).get();
  if (!snapshot.exists) return null;

  const data = snapshot.data() as Partial<NotificationJob>;
  if (!data.title || !data.company) return null;

  return {
    id: snapshot.id,
    title: data.title,
    company: data.company
  };
}
