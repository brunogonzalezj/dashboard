import { useState, useEffect } from 'react'
import Layout from '../components/Layout'

type User = {
    id: number
    username: string
    password: string
    role: string
    company: string
}

export default function Users() {
    const [users, setUsers] = useState<User[]>([])
    const [newUser, setNewUser] = useState({ username: '', company: '' })
    const [error, setError] = useState('')
    const [csvColumns, setCsvColumns] = useState<string[]>([])
    const [selectedColumn, setSelectedColumn] = useState('')

    useEffect(() => {
        fetchUsers()
        fetchCsvColumns()
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

    const fetchCsvColumns = async () => {
        try {
            const response = await fetch('http://localhost:3001/csv-columns', {
                credentials: 'include',
            })
            if (response.ok) {
                const data = await response.json()
                setCsvColumns(data)
                if (data.length > 0) {
                    setSelectedColumn(data[0])
                }
            } else {
                throw new Error('Failed to fetch CSV columns')
            }
        } catch (error) {
            setError('Error fetching CSV columns')
        }
    }

    const createUser = async () => {
        try {
            const response = await fetch('http://localhost:3001/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...newUser, column: selectedColumn }),
                credentials: 'include',
            })
            if (response.ok) {
                setNewUser({ username: '', company: '' })
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
            <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-lg rounded-xl p-8">
                <h1 className="text-3xl font-bold mb-6 text-white">User Management</h1>
                <div className="mb-6 space-y-4">
                    <input
                        className="w-full p-2 border rounded bg-white bg-opacity-20 text-white placeholder-gray-300"
                        placeholder="Username"
                        value={newUser.username}
                        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                    />
                    <select
                        className="w-full p-2 border rounded bg-white bg-opacity-20 text-white"
                        value={selectedColumn}
                        onChange={(e) => setSelectedColumn(e.target.value)}
                    >
                        {csvColumns.map((column) => (
                            <option key={column} value={column}>
                                {column}
                            </option>
                        ))}
                    </select>
                    <input
                        className="w-full p-2 border rounded bg-white bg-opacity-20 text-white placeholder-gray-300"
                        placeholder="Company"
                        value={newUser.company}
                        onChange={(e) => setNewUser({ ...newUser, company: e.target.value })}
                    />
                    <button
                        className="w-full p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition duration-150 ease-in-out"
                        onClick={createUser}
                    >
                        Create User
                    </button>
                </div>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <table className="w-full text-white">
                    <thead>
                    <tr className="bg-white bg-opacity-20">
                        <th className="p-2 text-left">Username</th>
                        <th className="p-2 text-left">Password</th>
                        <th className="p-2 text-left">Role</th>
                        <th className="p-2 text-left">Company</th>
                    </tr>
                    </thead>
                    <tbody>
                    {users.map((user) => (
                        <tr key={user.id} className="border-b border-white border-opacity-20">
                            <td className="p-2">{user.username}</td>
                            <td className="p-2">{user.password}</td>
                            <td className="p-2">{user.role}</td>
                            <td className="p-2">{user.company}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    )
}