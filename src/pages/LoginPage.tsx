import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            await login(username, password);
            navigate('/');
        } catch (error) {
            setError('Error al iniciar sesión');
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundImage: 'url(/bg_login.svg)', backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}>
          <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
              <div>
                  <div className="flex justify-center">
                      <img className="h-16 w-auto" src="/soy_header.png" alt="Workflow"/>
                  </div>
                  <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
                      Iniciar sesión
                  </h2>
              </div>
              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                  <div className="rounded-md shadow-sm -space-y-px">
                      <div>
                          <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Nombre de usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                          />
                      </div>
                      <div className="relative">
                          <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            required
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 z-10 right-0 pr-3 flex items-center"
                            onClick={togglePasswordVisibility}
                          >
                              {showPassword ? (
                                <Eye className="h-5 w-5 text-gray-400" />
                              ) : (
                                <EyeOff className="h-5 w-5 text-gray-400" />
                              )}
                          </button>
                      </div>
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm text-center">{error}</div>
                  )}

                  <div>
                      <button
                        type="submit"
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                      >
                          Iniciar sesión
                      </button>
                  </div>
              </form>
          </div>
      </div>
    );
};

export default LoginPage;

