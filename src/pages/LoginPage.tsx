import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { Eye, EyeOff } from "lucide-react"

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

    // Clear previous errors
    setError("")

    // Validate inputs
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.")
      return
    }

    setLoading(true)

    try {
      await login(username, password)
      navigate("/")
    } catch (error: any) {
      console.error("Login error:", error) // Add logging for debugging

      if (error.response) {
        if (error.response.status === 401) {
          setError("Invalid username or password.")
        } else if (error.response.status === 403) {
          setError("Your account is locked. Please contact the system administrator.")
        } else if (error.response.status === 500) {
          setError("Server error. Try again later.")
        } else {
          setError(`Error ${error.response.status}: Please try again.`)
        }
      } else if (error.request) {
        // Request was made but no response received
        setError("Network error. Check your connection.")
      } else {
        // Something else caused the error
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
      style={{ backgroundImage: "url(/bg_login.svg)", backgroundRepeat: "no-repeat", backgroundSize: "cover" }}
    >
      <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-10 rounded-xl shadow-2xl">
        <div>
          <div className="flex justify-center">
            <img className="h-12 sm:h-16 w-auto" src="/soy_header.webp" alt="Workflow" />
          </div>
          <h2 className="mt-6 text-center text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
            Iniciar sesión
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Error message - moved outside of other form elements for better visibility */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm font-semibold text-center border border-red-300 rounded p-3 mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {" "}
            {/* Changed from -space-y-px to space-y-4 for better spacing */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder= "Ingresa tu usuario"
                required
              />
            </div>
            <div className="relative mt-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder= "Ingresa tu contraseña"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
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
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Cargando...
                </span>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage

