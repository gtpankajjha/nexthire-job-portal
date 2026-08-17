import { UserRole, JobType, WorkMode, JobStatus, Job, User } from './types';

export const MOCK_USERS: User[] = [
  {
    id: 'admin1',
    email: 'admin@nexthire.com',
    role: UserRole.ADMIN,
    name: 'System Admin',
    createdAt: Date.now() - 10000000,
  },
  {
    id: 'emp1',
    email: 'hr@techcorp.com',
    role: UserRole.EMPLOYER,
    name: 'Sarah Jenkins',
    companyName: 'TechCorp Solutions',
    industry: 'Software Development',
    createdAt: Date.now() - 8000000,
    companyLogo: 'https://picsum.photos/seed/techcorp/100/100'
  },
  {
    id: 'emp2',
    email: 'recruitment@innovate.io',
    role: UserRole.EMPLOYER,
    name: 'Mike Ross',
    companyName: 'Innovate.io',
    industry: 'IT & Services',
    createdAt: Date.now() - 7000000,
    companyLogo: 'https://picsum.photos/seed/innovate/100/100'
  },
  {
    id: 'seeker1',
    email: 'john.doe@example.com',
    role: UserRole.SEEKER,
    name: 'John Doe',
    headline: 'Senior Frontend Developer',
    location: 'San Francisco, CA',
    skills: ['React', 'TypeScript', 'Tailwind CSS'],
    experience: 5,
    createdAt: Date.now() - 5000000,
    profilePhoto: 'https://picsum.photos/seed/john/150/150'
  }
];

export const MOCK_JOBS: Job[] = [
  {
    id: 'job1',
    employerId: 'emp1',
    title: 'Senior React Developer',
    company: 'TechCorp Solutions',
    companyLogo: 'https://picsum.photos/seed/techcorp/100/100',
    location: 'San Francisco, CA',
    type: JobType.FULL_TIME,
    mode: WorkMode.HYBRID,
    salaryMin: 120000,
    salaryMax: 160000,
    experienceMin: 4,
    experienceMax: 8,
    description: 'We are looking for an experienced React developer to lead our frontend team. You will be responsible for architecting and building scalable web applications.',
    skills: ['React', 'TypeScript', 'Redux', 'Next.js'],
    status: JobStatus.ACTIVE,
    createdAt: Date.now() - 86400000 * 2,
    openings: 2
  },
  {
    id: 'job2',
    employerId: 'emp1',
    title: 'Backend Engineer (Node.js)',
    company: 'TechCorp Solutions',
    companyLogo: 'https://picsum.photos/seed/techcorp/100/100',
    location: 'Remote',
    type: JobType.FULL_TIME,
    mode: WorkMode.REMOTE,
    salaryMin: 110000,
    salaryMax: 150000,
    experienceMin: 3,
    experienceMax: 6,
    description: 'Join our backend team to build robust APIs and microservices using Node.js and PostgreSQL.',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'Docker'],
    status: JobStatus.ACTIVE,
    createdAt: Date.now() - 86400000 * 5,
    openings: 1
  },
  {
    id: 'job3',
    employerId: 'emp2',
    title: 'UI/UX Designer',
    company: 'Innovate.io',
    companyLogo: 'https://picsum.photos/seed/innovate/100/100',
    location: 'New York, NY',
    type: JobType.CONTRACT,
    mode: WorkMode.OFFICE,
    salaryMin: 80000,
    salaryMax: 110000,
    experienceMin: 2,
    experienceMax: 5,
    description: 'Looking for a creative UI/UX designer to revamp our core product interface. Must have a strong portfolio.',
    skills: ['Figma', 'Prototyping', 'User Research', 'CSS'],
    status: JobStatus.ACTIVE,
    createdAt: Date.now() - 86400000 * 1,
    openings: 1
  },
  {
    id: 'job4',
    employerId: 'emp2',
    title: 'Data Scientist',
    company: 'Innovate.io',
    companyLogo: 'https://picsum.photos/seed/innovate/100/100',
    location: 'Austin, TX',
    type: JobType.FULL_TIME,
    mode: WorkMode.HYBRID,
    salaryMin: 130000,
    salaryMax: 180000,
    experienceMin: 3,
    experienceMax: 7,
    description: 'Help us extract insights from massive datasets. Experience with machine learning models is required.',
    skills: ['Python', 'TensorFlow', 'SQL', 'Data Visualization'],
    status: JobStatus.ACTIVE,
    createdAt: Date.now() - 86400000 * 10,
    openings: 3
  }
];

export const CATEGORIES = [
  'Software Development', 'IT & Services', 'Data Science', 'Design',
  'Marketing', 'Sales', 'Finance', 'HR', 'Operations', 'Customer Support'
];

export const POPULAR_SKILLS = [
  'React', 'Node.js', 'Python', 'Java', 'TypeScript', 'AWS', 'Docker',
  'Figma', 'SQL', 'Machine Learning', 'Project Management'
];
