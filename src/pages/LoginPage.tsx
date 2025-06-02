import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Eye, EyeOff, LogIn } from "lucide-react"

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username.trim() || !password.trim()) {
      setError("Por favor, ingrese usuario y contraseña.")
      return
    }

    setLoading(true)

    try {
      await login(username, password)
      navigate("/")
    } catch (error: any) {
      console.error("Login error:", error)

      if (error.response) {
        if (error.response.status === 401) {
          setError("Usuario o contraseña inválidos.")
        } else if (error.response.status === 403) {
          setError("Su cuenta está bloqueada. Contacte al administrador del sistema.")
        } else if (error.response.status === 500) {
          setError("Error del servidor. Intente más tarde.")
        } else {
          setError(`Error ${error.response.status}: Por favor, intente de nuevo.`)
        }
      } else if (error.request) {
        setError("Error de red. Verifique su conexión.")
      } else {
        setError("Ocurrió un error inesperado. Por favor, intente de nuevo.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-cover bg-center"
      style={{ backgroundImage: "url(/bg_login.svg)" }}
    >
      <div className="max-w-md w-full space-y-8 bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl">
        <div className="flex flex-col items-center">
          <img 
            className="h-16 w-auto transform hover:scale-105 transition-transform duration-200" 
            src="/soy_header.webp" 
            alt="Logo" 
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar sesión
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 text-sm font-medium text-center border border-red-200 rounded-lg p-4 animate-fade-in">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                placeholder="Ingresa tu usuario"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                  placeholder="Ingresa tu contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex items-center justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Iniciando sesión...
              </div>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Iniciar sesión
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginPage