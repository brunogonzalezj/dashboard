import React from 'react';
import {BrowserRouter as Router, Route, Routes, Navigate, Outlet} from 'react-router-dom';
import {AuthProvider, useAuth} from './contexts/AuthContext';
import Login from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import CsvUpload from './pages/CsvUpload';
import Layout from "./components/Layout.tsx";

const PrivateRoute: React.FC = () => {
    const {isAuthenticated} = useAuth();
    return isAuthenticated ? <Outlet/> : <Navigate to="/login"/>;
};

const App: React.FC = () => {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login/>}/>
                    <Route element={<PrivateRoute/>}>
                        <Route element={<Layout/>}>
                            <Route path="/" element={<Dashboard/>}/>
                            <Route path="/users" element={<Users/>}/>
                            <Route path="/csv-upload" element={<CsvUpload/>}/>
                        </Route>
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
};

export default App;