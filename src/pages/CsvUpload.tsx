import React, { useState } from 'react';
import axios from 'axios';

const CsvUpload: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage('Por favor, seleccione un archivo CSV');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:3001/upload-csv', formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage(response.data.message || 'Archivo CSV cargado exitosamente');
        } catch (error) {
            console.error('Error uploading CSV:', error);
            setMessage('Error al cargar el archivo CSV');
        }
    };

    return (
        <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Cargar CSV</h2>
            <div className="space-y-4">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="w-full p-2 border rounded"
                />
                <button
                    onClick={handleUpload}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Cargar CSV
                </button>
                {message && <div className="text-sm font-medium text-teal-500">{message}</div>}
            </div>
        </div>
    );
};

export default CsvUpload;