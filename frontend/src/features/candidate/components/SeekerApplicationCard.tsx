import React from 'react';
import { Link } from 'react-router-dom';
import { Building, MapPin } from 'lucide-react';
import { Button, Card } from '../../../components/ui';
import type { Application, Job } from '../../../../types';

type SeekerApplicationCardProps = {
  application: Application & { job?: Job };
};

const statusColors: Record<string, string> = {
  Applied: 'bg-blue-100 text-blue-800',
  Shortlisted: 'bg-purple-100 text-purple-800',
  Interview: 'bg-indigo-100 text-indigo-800',
  Selected: 'bg-green-100 text-green-800',
  Rejected: 'bg-red-100 text-red-800'
};

export const SeekerApplicationCard: React.FC<SeekerApplicationCardProps> = ({ application }) => (
  <Card className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
    <div>
      <h3 className="text-lg font-semibold text-gray-900">{application.job?.title || 'Unknown Job'}</h3>
      <p className="text-sm text-gray-600 flex items-center mt-1"><Building className="w-4 h-4 mr-1" /> {application.job?.company}</p>
      <p className="text-sm text-gray-500 flex items-center mt-1"><MapPin className="w-4 h-4 mr-1" /> {application.job?.location || 'Location not specified'}</p>
      <p className="text-xs text-gray-400 mt-2">Applied on {new Date(application.appliedAt).toLocaleDateString()}</p>
    </div>
    <div className="flex flex-col items-end gap-3">
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[application.status] || 'bg-gray-100 text-gray-800'}`}>{application.status}</span>
      <Link to={`/jobs/${application.jobId}`}><Button variant="outline" size="sm">View Job</Button></Link>
    </div>
  </Card>
);
