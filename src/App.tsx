import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LoginPage from "./pages/LoginPage.tsx";
import RegisterPage from "./pages/RegisterPage.tsx";
import WelcomePage from "./pages/WelcomePage.tsx";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage/>} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/welcome" element={<WelcomePage />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;