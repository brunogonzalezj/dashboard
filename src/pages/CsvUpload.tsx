import React, { useState } from 'react';
import axios from 'axios';

export default function CsvUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [message, setMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);

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

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:3001/data/upload-csv', formData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage(response.data.message || 'Archivo CSV cargado exitosamente');
        } catch (error) {
            console.error('Error uploading CSV:', error);
            setMessage('Error al cargar el archivo CSV');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-full ">
            <div className="w-full max-w-md p-4 bg-white rounded-lg shadow-md">
                <h2 className="text-xl font-bold text-center text-gray-900 mb-4">
                    Cargar CSV
                </h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
                            Seleccionar archivo CSV
                        </label>
                        <div className="flex items-center justify-center">
                            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-2 pb-3">
                                    <svg className="w-6 h-6 mb-1 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                    </svg>
                                    <p className="text-xs text-gray-500">Clic para subir o arrastrar CSV</p>
                                </div>
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept=".csv"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                    </div>
                    {file && (
                        <p className="text-xs text-gray-500 text-center truncate">
                            Archivo: {file.name}
                        </p>
                    )}
                    <button
                        onClick={handleUpload}
                        disabled={isUploading || !file}
                        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                            isUploading || !file
                                ? 'bg-teal-500 cursor-not-allowed'
                                : 'bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                        }`}
                    >
                        {isUploading ? 'Cargando...' : ''}
                        {!file ? 'Seleccione un archivo' : 'Cargar CSV'}
                    </button>
                    {message && (
                        <div className={`text-xs font-medium text-center p-2 rounded ${
                            message.includes('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}