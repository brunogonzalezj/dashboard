import type React from "react"
import { createContext, useState, useEffect, useContext } from "react"
import axios from "axios"

interface AuthContextProps {
    isAuthenticated: boolean
    userRole: string | null
    username: string | null
    login: (username: string, password: string) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextProps>({
    isAuthenticated: false,
    userRole: null,
    username: null,
    login: async () => {},
    logout: () => {},
})

interface AuthProviderProps {
    children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        return localStorage.getItem('isAuthenticated') === 'true';
    });
    const [userRole, setUserRole] = useState<string | null>(() => {
        return localStorage.getItem('userRole');
    });
    const [username, setUsername] = useState<string | null>(() => {
        return localStorage.getItem('username');
    });

    useEffect(() => {
        const storedIsAuthenticated = localStorage.getItem("isAuthenticated")
        const storedUserRole = localStorage.getItem("userRole")
        const storedUsername = localStorage.getItem("username")

        if (storedIsAuthenticated === "true") {
            setIsAuthenticated(true)
        }
        if (storedUserRole) {
            setUserRole(storedUserRole)
        }
        if (storedUsername) {
            setUsername(storedUsername)
        }
    }, [])

    const login = async (username: string, password: string) => {
        try {
            const response = await axios.post(
              `${import.meta.env.VITE_API_URL}/auth/login`,
              { username, password },
              {
                  withCredentials: true,
              },
            )
            setIsAuthenticated(true)
            setUserRole(response.data.role)
            setUsername(response.data.username)

            localStorage.setItem("isAuthenticated", "true")
            localStorage.setItem("userRole", response.data.role)
            localStorage.setItem("username", response.data.username)
        } catch (error) {
            console.error("Login failed:", error)
            setIsAuthenticated(false)
            setUserRole(null)
            setUsername(null)

            localStorage.removeItem("isAuthenticated")
            localStorage.removeItem("userRole")
            localStorage.removeItem("username")

            // Rethrow the error so it can be caught by the LoginPage component
            throw error
        }
    }

    const logout = () => {
        setIsAuthenticated(false)
        setUserRole(null)
        setUsername(null)

        localStorage.removeItem("isAuthenticated")
        localStorage.removeItem("userRole")
        localStorage.removeItem("username")
    }

    const value: AuthContextProps = {
        isAuthenticated,
        userRole,
        username,
        login,
        logout,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    return useContext(AuthContext)
}

