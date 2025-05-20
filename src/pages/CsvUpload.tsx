import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function CsvUpload() {
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [historyFile, setHistoryFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [messageHistory, setMessageHistory] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingHistory, setIsUploadingHistory] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationMessage, setMigrationMessage] = useState('');

  const handleMigrate = async () => {
    const result = await Swal.fire({
      title: '¿Está seguro de que desea migrar los datos?',
      text: 'Esto moverá los datos actuales a la tabla histórica.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, migrar',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) {
      return;
    }

    setIsMigrating(true);
    setMigrationMessage('');

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/data/migrate`,
        {
          withCredentials: true,
        },
      );
      setMigrationMessage(response.data.message);
    } catch (error) {
      console.error('Error durante la migración:', error);
      setMigrationMessage(`Error durante la migración: ${error}`);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleCurrentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCurrentFile(e.target.files[0]);
    }
  };

  const handleHistoryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setHistoryFile(e.target.files[0]);
    }
  };

  const handleUploadCurrent = async () => {
    if (!currentFile) {
      setMessage('Por favor, seleccione un archivo CSV');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', currentFile);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/data/upload-csv`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      setMessage(response.data.message || 'Archivo CSV cargado exitosamente');
    } catch (error) {
      console.error('Error uploading CSV:', error);
      setMessage('Error al cargar el archivo CSV');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadHistory = async () => {
    if (!historyFile) {
      setMessageHistory('Por favor, seleccione un archivo CSV');
      return;
    }

    const result = await Swal.fire({
      title: '¿Está seguro de que desea subir el archivo CSV?',
      text: '¡Esto reemplazará los datos históricos actuales!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, subir',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) {
      return;
    }

    setIsUploadingHistory(true);
    const formData = new FormData();
    formData.append('file', historyFile);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/data/upload-history`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      setMessageHistory(
        response.data.message || 'Archivo CSV cargado exitosamente',
      );
    } catch (error) {
      console.error('Error uploading CSV:', error);
      setMessageHistory('Error al cargar el archivo CSV');
    } finally {
      setIsUploadingHistory(false);
    }
  };

  const handleDownloadFormData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/data/getFormData`,
        {
          withCredentials: true,
          responseType: 'blob',
        },
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Formulario.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading form data:', error);
    }
  }

  return (
    <div className='flex-row items-center justify-center h-full'>
      <div className={'flex gap-x-2 items-center justify-center h-full '}>
        <div className='w-full max-w-md p-4 bg-white rounded-lg shadow-md'>
          <h2 className='text-xl font-bold text-center text-gray-900 mb-4'>
            Cargar CSV Actual
          </h2>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='current-file-upload'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Seleccionar archivo CSV
              </label>
              <div className='flex items-center justify-center'>
                <label
                  htmlFor='current-file-upload'
                  className='flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100'
                >
                  <div className='flex flex-col items-center justify-center pt-2 pb-3'>
                    <svg
                      className='w-6 h-6 mb-1 text-gray-500'
                      aria-hidden='true'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 20 16'
                    >
                      <path
                        stroke='currentColor'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2'
                      />
                    </svg>
                    <p className='text-xs text-gray-500'>
                      Clic para subir o arrastrar CSV
                    </p>
                  </div>
                  <input
                    id='current-file-upload'
                    type='file'
                    accept='.csv'
                    className='hidden'
                    onChange={handleCurrentFileChange}
                  />
                </label>
              </div>
            </div>
            {currentFile && (
              <p className='text-xs text-gray-500 text-center truncate'>
                Archivo: {currentFile.name}
              </p>
            )}
            <button
              onClick={handleUploadCurrent}
              disabled={isUploading || !currentFile}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isUploading || !currentFile
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {isUploading ? 'Cargando...' : ''}
              {!currentFile ? 'Seleccione un archivo' : 'Cargar CSV'}
            </button>
            {message && (
              <div
                className={`text-xs font-medium text-center p-2 rounded ${
                  message.includes('Error')
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {message}
              </div>
            )}
          </div>
        </div>

        {/* History CSV */}
        <div className='w-full max-w-md p-4 bg-white rounded-lg shadow-md'>
          <h2 className='text-xl font-bold text-center text-gray-900 mb-4'>
            Cargar CSV Histórico
          </h2>
          <div className='space-y-4'>
            <div>
              <label
                htmlFor='file-upload-history'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Seleccionar archivo CSV
              </label>
              <div className='flex items-center justify-center'>
                <label
                  htmlFor='file-upload-history'
                  className='flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100'
                >
                  <div className='flex flex-col items-center justify-center pt-2 pb-3'>
                    <svg
                      className='w-6 h-6 mb-1 text-gray-500'
                      aria-hidden='true'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 20 16'
                    >
                      <path
                        stroke='currentColor'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2'
                      />
                    </svg>
                    <p className='text-xs text-gray-500'>
                      Clic para subir o arrastrar CSV
                    </p>
                  </div>
                  <input
                    id='file-upload-history'
                    type='file'
                    accept='.csv'
                    className='hidden'
                    onChange={handleHistoryFileChange}
                  />
                </label>
              </div>
            </div>
            {historyFile && (
              <p className='text-xs text-gray-500 text-center truncate'>
                Archivo: {historyFile.name}
              </p>
            )}
            <button
              onClick={handleUploadHistory}
              disabled={isUploadingHistory || !historyFile}
              className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                isUploadingHistory || !historyFile
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              {isUploadingHistory ? 'Cargando...' : ''}
              {!historyFile ? 'Seleccione un archivo' : 'Cargar CSV'}
            </button>
            {messageHistory && (
              <div
                className={`text-xs font-medium text-center p-2 rounded ${
                  messageHistory.includes('Error')
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}
              >
                {messageHistory}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className={'flex justify-center mt-6'}>
        <div className='flex flex-col w-[20%] items-center justify-center bg-white rounded-lg shadow-md p-4 '>
          <h2 className='text-xl font-bold text-center text-gray-900 mb-4'>
            Utilidades
          </h2>
          <button
            onClick={handleMigrate}
            disabled={isMigrating}
            className={` py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isMigrating
                ? 'bg-green-300 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
            }`}
          >
            {isMigrating ? (
              <div className={'flex items-center justify-center'}>
                <span className='loading loading-ring loading-lg'></span>
              </div>
            ) : (
              'Migrar Datos Históricos'
            )}
          </button>
          <button
            onClick={handleDownloadFormData}
            className={`mt-2 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            Descargar Formulario
          </button>
          {migrationMessage && (
            <div
              className={`mt-2 text-sm font-medium text-center p-2 rounded ${
                migrationMessage.includes('Error')
                  ? 'bg-red-100 text-red-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {migrationMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
