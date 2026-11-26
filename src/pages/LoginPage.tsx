import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { isAxiosError } from "axios"
import { useAuth } from "../contexts/AuthContext"
import { Eye, EyeOff, Loader2, LogIn, TriangleAlert } from "lucide-react"

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null)
  const navigate = useNavigate()
  const { login } = useAuth()

  // Rehabilita el botón cuando vence el bloqueo por rate limit (429)
  useEffect(() => {
    if (blockedUntil === null) return
    const timer = setTimeout(() => setBlockedUntil(null), Math.max(0, blockedUntil - Date.now()))
    return () => clearTimeout(timer)
  }, [blockedUntil])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (blockedUntil !== null) return
    setError("")

    if (!username.trim() || !password.trim()) {
      setError("Por favor, ingrese usuario y contraseña.")
      return
    }

    setLoading(true)

    try {
      await login(username, password)
      navigate("/")
    } catch (error) {
      console.error("Login error:", error)

      if (!isAxiosError(error)) {
        setError("Ocurrió un error inesperado. Por favor, intente de nuevo.")
      } else if (error.response) {
        if (error.response.status === 429) {
          const retryAfter = Number(error.response.headers?.["retry-after"])
          if (Number.isFinite(retryAfter) && retryAfter > 0) {
            const minutes = Math.ceil(retryAfter / 60)
            setBlockedUntil(Date.now() + retryAfter * 1000)
            setError(
              `Demasiados intentos de inicio de sesión. Espera ${minutes} ${minutes === 1 ? "minuto" : "minutos"} e intenta de nuevo.`
            )
          } else {
            setError("Demasiados intentos de inicio de sesión. Espera unos minutos e intenta de nuevo.")
          }
        } else if (error.response.status === 401) {
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
      className="min-h-dvh flex items-center justify-center px-4 py-10 bg-cover bg-center"
      style={{ backgroundImage: "url(/bg_login.svg)" }}
    >
      <main className="login-in w-full max-w-[400px] rounded-2xl bg-white p-7 sm:p-9 shadow-[0_24px_60px_-20px_rgba(120,53,15,0.45)]">
        <div className="flex flex-col items-center text-center">
          <img className="h-14 w-auto" src="/soy_header.webp" alt="SOY Excellence Center" />
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
          <p className="mt-1 text-sm text-(--text-muted)">Panel de cursos de Excelencia de la Soya</p>
        </div>

        <form className="mt-7 space-y-4" onSubmit={handleSubmit} noValidate>
          {error && (
            <p className="notice-error" role="alert">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          <div>
            <label htmlFor="username" className="form-label">Usuario</label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field h-11"
              placeholder="Tu usuario"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="form-label">Contraseña</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field h-11 pr-12"
                placeholder="Tu contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="icon-btn absolute right-0.5 top-1/2 -translate-y-1/2"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || blockedUntil !== null}
            className="btn-primary w-full h-11! mt-6!"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            {loading ? "Iniciando sesión…" : "Iniciar sesión"}
          </button>
        </form>
      </main>
    </div>
  )
}

export default LoginPage
