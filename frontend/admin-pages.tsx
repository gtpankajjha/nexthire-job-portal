import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Briefcase, ShieldAlert } from 'lucide-react';
import { Card, Badge } from './ui-components';
import { DashboardLayout } from './layout';
import { jobService } from './services';
import { Job, User } from './types';

const sidebarLinks = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
];

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ users: 0, jobs: 0, applications: 0 });

  useEffect(() => {
    // In a real app, this would be a single aggregate API call
    const users = JSON.parse(localStorage.getItem('nh_users') || '[]');
    const jobs = JSON.parse(localStorage.getItem('nh_jobs') || '[]');
    const apps = JSON.parse(localStorage.getItem('nh_applications') || '[]');
    
    setStats({
      users: users.length,
      jobs: jobs.length,
      applications: apps.length
    });
  }, []);

  return (
    <DashboardLayout sidebarLinks={sidebarLinks}>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.users}</p>
        </Card>
        <Card className="p-6 border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-medium">Total Jobs</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.jobs}</p>
        </Card>
        <Card className="p-6 border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm font-medium">Total Applications</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.applications}</p>
        </Card>
      </div>
      
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">System Status</h3>
        <div className="flex items-center text-green-600">
          <ShieldAlert className="w-5 h-5 mr-2" />
          <span>All systems operational. Mock database is active.</span>
        </div>
      </Card>
    </DashboardLayout>
  );
};
