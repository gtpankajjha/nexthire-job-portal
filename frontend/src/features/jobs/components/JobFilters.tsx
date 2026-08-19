import React from 'react';
import { X } from 'lucide-react';
import { Button, Input, Select } from '../../../components/ui';
import { JobType, WorkMode } from '../../../../types';

interface JobFiltersProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  location: string;
  onLocationChange: (value: string) => void;
  minSalary: string;
  onMinSalaryChange: (value: string) => void;
  experience: string;
  onExperienceChange: (value: string) => void;
  type: string;
  onTypeChange: (value: string) => void;
  mode: string;
  onModeChange: (value: string) => void;
  clearFilters: () => void;
  setIsMobileFiltersOpen?: (isOpen: boolean) => void;
}

export const JobFilters: React.FC<JobFiltersProps> = ({
  keyword,
  onKeywordChange,
  location,
  onLocationChange,
  minSalary,
  onMinSalaryChange,
  experience,
  onExperienceChange,
  type,
  onTypeChange,
  mode,
  onModeChange,
  clearFilters,
  setIsMobileFiltersOpen
}) => (
  <div className="space-y-5">
    {setIsMobileFiltersOpen && (
      <div className="flex justify-between items-center md:hidden mb-4">
        <h3 className="font-bold text-lg">Filters</h3>
        <button onClick={() => setIsMobileFiltersOpen(false)}><X className="w-6 h-6 text-gray-500" /></button>
      </div>
    )}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
      <Input placeholder="Job title, skills, company" value={keyword} onChange={event => onKeywordChange(event.target.value)} />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
      <Input placeholder="City, state, or remote" value={location} onChange={event => onLocationChange(event.target.value)} />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Min Salary (INR)</label>
      <Input type="number" placeholder="e.g. 500000" value={minSalary} onChange={event => onMinSalaryChange(event.target.value)} />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Your Experience (Years)</label>
      <Input type="number" step="any" placeholder="e.g. 4" value={experience} onChange={event => onExperienceChange(event.target.value)} />
    </div>
    <Select label="Job Type" value={type} onChange={event => onTypeChange(event.target.value)} options={Object.values(JobType).map(value => ({ value, label: value }))} />
    <Select label="Work Mode" value={mode} onChange={event => onModeChange(event.target.value)} options={Object.values(WorkMode).map(value => ({ value, label: value }))} />
    <Button variant="outline" className="w-full mt-4" onClick={clearFilters}>Clear All Filters</Button>
  </div>
);
