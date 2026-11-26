import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Upload, AlertTriangle, Download, Check, X } from 'lucide-react';
import { useFormStatus, useCursos, useToggleFormStatus, useToggleCurso, useMigrate } from '../hooks/queries';
import { Skeleton } from '../components/ui/Skeleton';



export default function CsvUpload() {
  const { data: formStatusData, isLoading: isFormStatusLoading } = useFormStatus();
  const formEnabled = formStatusData?.habilitado;
  const toggleFormStatusMutation = useToggleFormStatus();
  const isLoadingFormStatus = isFormStatusLoading || toggleFormStatusMutation.isPending;

  const { data: cursos = [], isLoading: isLoadingCursos } = useCursos();
  const toggleCursoMutation = useToggleCurso();

  const migrateMutation = useMigrate();
  const isMigrating = migrateMutation.isPending;

  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [historyFile, setHistoryFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [messageHistory, setMessageHistory] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingHistory, setIsUploadingHistory] = useState(false);
  const [migrationMessage, setMigrationMessage] = useState('');
  const [cursosMessage, setCursosMessage] = useState('');
  const [formStatusMessage, setFormStatusMessage] = useState('');

  const toggleFormStatus = async () => {
    setFormStatusMessage('');
    try {
      const result = await toggleFormStatusMutation.mutateAsync({ habilitado: !formEnabled });
      setFormStatusMessage(result.message);
      setTimeout(() => setFormStatusMessage(''), 3000);
    } catch (error) {
      console.error('Error al cambiar el estado del formulario:', error);
      setFormStatusMessage('Error al cambiar el estado del formulario');
    }
  };

  const toggleCursoActivo = async (cursoId: number, activo: boolean) => {
    try {
      await toggleCursoMutation.mutateAsync({ cursoId, activo: !activo });
      setCursosMessage(`Curso ${!activo ? 'activado' : 'desactivado'} correctamente`);
      setTimeout(() => setCursosMessage(''), 3000);
    } catch (error) {
      console.error('Error al cambiar estado del curso:', error);
      setCursosMessage('Error al cambiar estado del curso');
    }
  };

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

    if (!result.isConfirmed) return;

    setMigrationMessage('');
    try {
      const data = await migrateMutation.mutateAsync();
      setMigrationMessage(data.message);
    } catch (error) {
      console.error('Error durante la migración:', error);
      setMigrationMessage(`Error durante la migración: ${error}`);
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
    <div className="space-y-6">
      <h1 className="section-title">Gestión de Datos</h1>

      {/* Form Status */}
      <div className="dashboard-card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Estado del Formulario</h2>

        {isLoadingFormStatus ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${formEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                <p className="text-sm font-medium text-gray-700">
                  Formulario {formEnabled ? 'habilitado' : 'deshabilitado'}
                </p>
              </div>
              <button
                onClick={toggleFormStatus}
                disabled={isLoadingFormStatus}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all ${
                  isLoadingFormStatus
                    ? 'bg-gray-300 cursor-not-allowed'
                    : formEnabled
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {formEnabled ? 'Deshabilitar' : 'Habilitar'}
              </button>
            </div>

            {formStatusMessage && (
              <div className={`mt-3 p-3 rounded-lg text-sm font-medium ${
                formStatusMessage.includes('Error')
                  ? 'bg-red-50 text-red-700'
                  : 'bg-green-50 text-green-700'
              }`}>
                {formStatusMessage}
              </div>
            )}
          </>
        )}
      </div>

      {/* Courses Config */}
      <div className="dashboard-card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Configuración de Cursos</h2>

        {isLoadingCursos ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">
              Seleccione los cursos visibles en el formulario:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {cursos.map((curso) => (
                <div
                  key={curso.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    curso.activo
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <span className="text-sm font-medium text-gray-700">{curso.nombre}</span>
                  <button
                    onClick={() => toggleCursoActivo(curso.id, curso.activo)}
                    className={`p-1.5 rounded-full transition-colors ${
                      curso.activo
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    {curso.activo ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </button>
                </div>
              ))}
            </div>

            {cursosMessage && (
              <div className={`mt-3 p-3 rounded-lg text-sm font-medium ${
                cursosMessage.includes('Error')
                  ? 'bg-red-50 text-red-700'
                  : 'bg-green-50 text-green-700'
              }`}>
                {cursosMessage}
              </div>
            )}
          </>
        )}
      </div>

      {/* CSV Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current CSV */}
        <div className="dashboard-card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Cargar CSV Actual</h2>
          <div className="space-y-4">
            <label
              htmlFor="current-file-upload"
              className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-amber-300 transition-colors"
            >
              <Upload className="w-6 h-6 mb-1.5 text-gray-400" />
              <p className="text-sm text-gray-500">Clic para subir CSV</p>
              {currentFile && (
                <p className="mt-1 text-xs text-amber-600 font-medium truncate max-w-[90%]">
                  {currentFile.name}
                </p>
              )}
              <input
                id="current-file-upload"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleCurrentFileChange}
              />
            </label>

            <button
              onClick={handleUploadCurrent}
              disabled={isUploading || !currentFile}
              className={`w-full py-2.5 rounded-lg text-sm font-medium text-white transition-all ${
                isUploading || !currentFile
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-600'
              }`}
            >
              {isUploading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="loading loading-ring loading-sm"></span>
                  Cargando...
                </span>
              ) : !currentFile ? 'Seleccione un archivo' : 'Cargar CSV'}
            </button>

            {message && (
              <div className={`p-3 rounded-lg text-sm font-medium ${
                message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
              }`}>
                {message}
              </div>
            )}
          </div>
        </div>

        {/* History CSV */}
        <div className="dashboard-card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Cargar CSV Histórico</h2>
          <div className="space-y-4">
            <label
              htmlFor="file-upload-history"
              className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-amber-300 transition-colors"
            >
              <Upload className="w-6 h-6 mb-1.5 text-gray-400" />
              <p className="text-sm text-gray-500">Clic para subir CSV</p>
              {historyFile && (
                <p className="mt-1 text-xs text-amber-600 font-medium truncate max-w-[90%]">
                  {historyFile.name}
                </p>
              )}
              <input
                id="file-upload-history"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleHistoryFileChange}
              />
            </label>

            <button
              onClick={handleUploadHistory}
              disabled={isUploadingHistory || !historyFile}
              className={`w-full py-2.5 rounded-lg text-sm font-medium text-white transition-all ${
                isUploadingHistory || !historyFile
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-amber-500 hover:bg-amber-600'
              }`}
            >
              {isUploadingHistory ? (
                <span className="inline-flex items-center gap-2">
                  <span className="loading loading-ring loading-sm"></span>
                  Cargando...
                </span>
              ) : !historyFile ? 'Seleccione un archivo' : 'Cargar CSV'}
            </button>

            {messageHistory && (
              <div className={`p-3 rounded-lg text-sm font-medium ${
                messageHistory.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
              }`}>
                {messageHistory}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Utilities */}
      <div className="dashboard-card">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Utilidades</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleMigrate}
            disabled={isMigrating}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all ${
              isMigrating
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            {isMigrating ? 'Migrando...' : 'Migrar Datos Históricos'}
          </button>

          <button
            onClick={handleDownloadFormData}
            className="btn-primary"
          >
            <Download className="w-4 h-4" />
            Descargar Formulario
          </button>

          <button
            onClick={wipeFormData}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-all"
          >
            <AlertTriangle className="w-4 h-4" />
            Eliminar Datos del Formulario
          </button>
        </div>

        {migrationMessage && (
          <div className={`mt-3 p-3 rounded-lg text-sm font-medium ${
            migrationMessage.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {migrationMessage}
          </div>
        )}
      </div>
    </div>
  );
}