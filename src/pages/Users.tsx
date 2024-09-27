import { useState, useEffect } from 'react'
import Layout from '../components/Layout'

type User = {
    id: number
    username: string
    email: string
    role: string
}

export default function Users() {
    const [users, setUsers] = useState<User[]>([])
    const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: '' })
    const [error, setError] = useState('')

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const response = await fetch('http://localhost:3001/users', {
                credentials: 'include',
            })
            if (response.ok) {
                const data = await response.json()
                setUsers(data)
            } else {
                throw new Error('Failed to fetch users')
            }
        } catch (error) {
            setError('Error fetching users')
        }
    }

    const createUser = async () => {
        try {
            const response = await fetch('http://localhost:3001/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
                credentials: 'include',
            })
            if (response.ok) {
                setNewUser({ username: '', email: '', password: '', role: '' })
                fetchUsers()
            } else {
                throw new Error('Failed to create user')
            }
        } catch (error) {
            setError('Error creating user')
        }
    }

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-6">User Management</h1>
            <div className="mb-6 space-y-4">
                <input
                    className="w-full p-2 border rounded"
                    placeholder="Username"
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />
                <input
                    className="w-full p-2 border rounded"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <input
                    className="w-full p-2 border rounded"
                    placeholder="Password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
                <input
                    className="w-full p-2 border rounded"
                    placeholder="Role"
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                />
                <button
                    className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={createUser}
                >
                    Create User
                </button>
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <table className="w-full">
                <thead>
                <tr className="bg-gray-200">
                    <th className="p-2 text-left">Username</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Role</th>
                </tr>
                </thead>
                <tbody>
                {users.map((user) => (
                    <tr key={user.id} className="border-b">
                        <td className="p-2">{user.username}</td>
                        <td className="p-2">{user.email}</td>
                        <td className="p-2">{user.role}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </Layout>
    )
}