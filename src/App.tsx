import React, { Suspense } from 'react';
import { BrowserRouter as Router, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/LoginPage';
import Layout from './components/Layout.tsx';

// Importaciones dinámicas
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Users = React.lazy(() => import('./pages/Users'));
const CsvUpload = React.lazy(() => import('./pages/CsvUpload'));

const PrivateRoute: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

// Componente de carga
const LoadingFallback = () =>
  <div className={`flex items-center justify-center h-screen w-full`}>
  <span className="loading loading-ring loading-lg"></span>
  </div>
const App: React.FC = () => {
  return (
    <Router>
    <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/csv-upload" element={<CsvUpload />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
};

export default App;