import React, { ReactNode, useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

type ProtectedRouteProps = {
    children: ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('http://localhost:3001/protected', {
                    credentials: 'include',
                })
                setIsAuthenticated(response.ok)
            } catch (error) {
                console.error('Error checking auth:', error)
                setIsAuthenticated(false)
            }
        }

        checkAuth()
    }, [])

    if (isAuthenticated === null) {
        return <div>Loading...</div>
    }

    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export default ProtectedRoute