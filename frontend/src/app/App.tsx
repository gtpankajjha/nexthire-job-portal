import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { AuthProvider } from '../features/auth/context/AuthContext';
import { AppRoutes } from './routes';
import { Layout } from '../components/layout';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <AppRoutes />
        </Layout>
      </Router>
    </AuthProvider>
  );
}