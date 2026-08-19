import React from 'react';
import { ExternalLink, FileText } from 'lucide-react';
import { Badge, Modal, ResumeViewerButton, formatINR } from '../../../components/ui';
import type { User } from '../../../../types';

type ApplicantProfileModalProps = {
  applicant: User | null;
  onClose: () => void;
};

export const ApplicantProfileModal: React.FC<ApplicantProfileModalProps> = ({ applicant, onClose }) => (
  <Modal isOpen={!!applicant} onClose={onClose} title="Candidate Profile">
    {applicant && (
      <div className="space-y-6">
        <div className="flex items-center gap-4 border-b pb-4">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl">{applicant.name.charAt(0)}</div>
          <div><h2 className="text-xl font-bold text-gray-900">{applicant.name}</h2><p className="text-gray-600">{applicant.headline}</p></div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500 block">Email</span><span className="font-medium">{applicant.email}</span></div>
          <div><span className="text-gray-500 block">Phone</span><span className="font-medium">{applicant.phone || 'N/A'}</span></div>
          <div><span className="text-gray-500 block">Location</span><span className="font-medium">{applicant.location || 'N/A'}</span></div>
          <div><span className="text-gray-500 block">Experience</span><span className="font-medium">{applicant.totalExperience} Years</span></div>
          <div><span className="text-gray-500 block">Current Company</span><span className="font-medium">{applicant.currentCompany || 'N/A'}</span></div>
          <div><span className="text-gray-500 block">Expected Salary</span><span className="font-medium">{applicant.expectedSalary ? formatINR(applicant.expectedSalary) : 'N/A'}</span></div>
        </div>
        <div><span className="text-gray-500 block text-sm mb-1">Skills</span><div className="flex flex-wrap gap-1">{applicant.skills?.map(skill => <Badge key={skill}>{skill}</Badge>)}</div></div>
        {applicant.resumeUrl && <div className="pt-4 border-t"><ResumeViewerButton resumeUrl={applicant.resumeUrl} variant="ghost" className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium p-0 h-auto"><FileText className="w-4 h-4 mr-2" /> View Resume <ExternalLink className="w-3 h-3 ml-1" /></ResumeViewerButton></div>}
      </div>
    )}
  </Modal>
);
