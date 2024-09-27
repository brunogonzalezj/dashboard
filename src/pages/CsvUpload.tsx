import React, { useState } from 'react'
import Layout from '../components/Layout'

export default function CsvUpload() {
    const [file, setFile] = useState<File | null>(null)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0])
        }
    }

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file')
            return
        }

        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch('http://localhost:3001/upload-csv', {
                method: 'POST',
                body: formData,
                credentials: 'include',
            })

            if (response.ok) {
                setSuccess('CSV uploaded successfully')
                setError('')
            } else {
                throw new Error('Error uploading CSV')
            }
        } catch (error) {
            setError('Error uploading CSV')
            setSuccess('')
        }
    }

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-6">CSV Upload</h1>
            <div className="space-y-4">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
                />
                <button
                    onClick={handleUpload}
                    disabled={!file}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    Upload CSV
                </button>
            </div>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            {success && <p className="text-green-500 mt-4">{success}</p>}
        </Layout>
    )
}