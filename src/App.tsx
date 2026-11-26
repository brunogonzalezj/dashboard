import { FC, lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Navigate,
  Outlet,
  Route,
  Routes,
} from 'react-router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/LoginPage';
import Layout from './components/Layout.tsx';
import { PageLoader } from './components/ui/Spinner';

// Importaciones dinámicas
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Users = lazy(() => import('./pages/Users'));
const CsvUpload = lazy(() => import('./pages/CsvUpload'));

const LoadingFallback = () => <PageLoader />;

const PrivateRoute: FC = () => {
  const { isAuthenticated, isCheckingAuth } = useAuth();
  if (isAuthenticated) return <Outlet />;
  if (isCheckingAuth) return <LoadingFallback />;
  return <Navigate to='/login' replace />;
};

// Si la sesión ya es válida, el login lleva directo al inicio
const PublicOnlyRoute: FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to='/' replace /> : <Outlet />;
};

const App: FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path='/login' element={<Login />} />
            </Route>
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path='/' element={<Dashboard />} />
                <Route path='/users' element={<Users />} />
                <Route path='/csv-upload' element={<CsvUpload />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
};

export default App;
