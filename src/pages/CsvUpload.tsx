import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Upload, AlertTriangle, Download } from 'lucide-react';

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
  };

  const wipeFormData = async () => {
    try {
      const result = await Swal.fire({
        title: '¿Está seguro de que desea eliminar todos los datos del formulario?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      });

      if (!result.isConfirmed) return;

      await axios.get(`${import.meta.env.VITE_API_URL}/data/wipeForm`, {
        withCredentials: true,
      });
      await Swal.fire({
        title: '¡Éxito!',
        text: 'Todos los datos del formulario han sido eliminados.',
        icon: 'success',
      });
    }
    catch (error) {
      console.error('Error wiping form data:', error);
      await Swal.fire({
        title: 'Error',
        text: 'Ocurrió un problema al eliminar los datos del formulario.',
        icon: 'error',
      });
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current CSV Upload */}
        <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Cargar CSV Actual</h2>
          <div className="space-y-6">
            <div className="relative">
              <label
                htmlFor="current-file-upload"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Seleccionar archivo CSV
              </label>
              <div className="flex items-center justify-center">
                <label
                  htmlFor="current-file-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="text-sm text-gray-500">
                      Clic para subir o arrastrar CSV
                    </p>
                    {currentFile && (
                      <p className="mt-2 text-xs text-gray-500 truncate max-w-full">
                        {currentFile.name}
                      </p>
                    )}
                  </div>
                  <input
                    id="current-file-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleCurrentFileChange}
                  />
                </label>
              </div>
            </div>

            <button
              onClick={handleUploadCurrent}
              disabled={isUploading || !currentFile}
              className={`w-full py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200 ${
                isUploading || !currentFile
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 hover:shadow-md'
              }`}
            >
              {isUploading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Cargando...
                </div>
              ) : !currentFile ? (
                'Seleccione un archivo'
              ) : (
                'Cargar CSV'
              )}
            </button>

            {message && (
              <div
                className={`p-4 rounded-lg text-sm font-medium ${
                  message.includes('Error')
                    ? 'bg-red-50 text-red-800'
                    : 'bg-green-50 text-green-800'
                }`}
              >
                {message}
              </div>
            )}
          </div>
        </div>

        {/* History CSV Upload */}
        <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-200 hover:shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Cargar CSV Histórico</h2>
          <div className="space-y-6">
            <div className="relative">
              <label
                htmlFor="file-upload-history"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Seleccionar archivo CSV
              </label>
              <div className="flex items-center justify-center">
                <label
                  htmlFor="file-upload-history"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="text-sm text-gray-500">
                      Clic para subir o arrastrar CSV
                    </p>
                    {historyFile && (
                      <p className="mt-2 text-xs text-gray-500 truncate max-w-full">
                        {historyFile.name}
                      </p>
                    )}
                  </div>
                  <input
                    id="file-upload-history"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleHistoryFileChange}
                  />
                </label>
              </div>
            </div>

            <button
              onClick={handleUploadHistory}
              disabled={isUploadingHistory || !historyFile}
              className={`w-full py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200 ${
                isUploadingHistory || !historyFile
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 hover:shadow-md'
              }`}
            >
              {isUploadingHistory ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                  Cargando...
                </div>
              ) : !historyFile ? (
                'Seleccione un archivo'
              ) : (
                'Cargar CSV'
              )}
            </button>

            {messageHistory && (
              <div
                className={`p-4 rounded-lg text-sm font-medium ${
                  messageHistory.includes('Error')
                    ? 'bg-red-50 text-red-800'
                    : 'bg-green-50 text-green-800'
                }`}
              >
                {messageHistory}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Utilities Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Utilidades</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleMigrate}
            disabled={isMigrating}
            className={`w-full sm:w-auto py-3 px-6 rounded-lg shadow-sm text-sm font-medium text-white transition-all duration-200 flex items-center justify-center gap-2 ${
              isMigrating
                ? 'bg-green-300 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 hover:shadow-md'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            {isMigrating ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Migrando...
              </div>
            ) : (
              'Migrar Datos Históricos'
            )}
          </button>

          <button
            onClick={handleDownloadFormData}
            className="w-full sm:w-auto py-3 px-6 rounded-lg shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Descargar Formulario
          </button>
          <button
            onClick={wipeFormData}
            className="w-full sm:w-auto py-3 px-6 rounded-lg shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            Eliminar Datos del Formulario
          </button>
        </div>

        {migrationMessage && (
          <div
            className={`mt-6 p-4 rounded-lg text-sm font-medium ${
              migrationMessage.includes('Error')
                ? 'bg-red-50 text-red-800'
                : 'bg-green-50 text-green-800'
            }`}
          >
            {migrationMessage}
          </div>
        )}
      </div>
    </div>
  );
}