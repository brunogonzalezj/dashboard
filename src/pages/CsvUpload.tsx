import { useId, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { ArchiveRestore, Check, Download, FileSpreadsheet, Trash2, TriangleAlert, Upload, X } from 'lucide-react';
import { useFormStatus, useCursos, useToggleFormStatus, useToggleCurso, useMigrate } from '../hooks/queries';
import { Skeleton } from '../components/ui/Skeleton';
import { Spinner } from '../components/ui/Spinner';
import { cn } from '../lib/utils';

type Feedback = { kind: 'success' | 'error'; text: string } | null;

function FeedbackNotice({ feedback, className }: { feedback: Feedback; className?: string }) {
  if (!feedback) return null;
  const Icon = feedback.kind === 'success' ? Check : TriangleAlert;
  return (
    <p className={cn(feedback.kind === 'success' ? 'notice-success' : 'notice-error', className)} role={feedback.kind === 'error' ? 'alert' : 'status'}>
      <Icon className="mt-0.5 h-4 w-4 flex-shrink-0" />
      {feedback.text}
    </p>
  );
}

/** Interruptor accesible (role="switch") */
function Switch({ checked, onChange, disabled, label }: { checked: boolean; onChange: () => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={cn(
        'relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60',
        checked ? 'bg-emerald-600' : 'bg-[#c3cad4]',
      )}
    >
      <span className={cn('inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200', checked ? 'translate-x-[22px]' : 'translate-x-0.5')} />
    </button>
  );
}

interface DropzoneProps {
  title: string;
  description: string;
  file: File | null;
  onFile: (file: File | null) => void;
  onUpload: () => void;
  uploading: boolean;
  feedback: Feedback;
}

/** Zona para elegir o arrastrar un CSV */
function CsvDropzone({ title, description, file, onFile, onUpload, uploading, feedback }: DropzoneProps) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);

  return (
    <section className="dashboard-card flex flex-col">
      <h3 className="card-title">{title}</h3>
      <p className="card-subtitle mb-4">{description}</p>

      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const dropped = e.dataTransfer.files?.[0];
          if (dropped) onFile(dropped);
        }}
        className={cn(
          'flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-5 text-center transition-colors',
          'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-500 has-[:focus-visible]:ring-offset-2',
          dragging ? 'border-secondary-500 bg-secondary-50' : file ? 'border-emerald-300 bg-emerald-50/60' : 'border-[#cfd5dd] bg-[#f9fafb] hover:border-[#aeb7c3] hover:bg-[#f4f6f8]',
        )}
      >
        {file ? (
          <>
            <FileSpreadsheet className="h-6 w-6 text-emerald-700" />
            <p className="max-w-full truncate text-sm font-semibold text-[color:var(--text-strong)]">{file.name}</p>
            <p className="text-xs text-[color:var(--text-muted)]">{(file.size / 1024).toLocaleString('es', { maximumFractionDigits: 0 })} KB · toca para cambiarlo</p>
          </>
        ) : (
          <>
            <Upload className="h-6 w-6 text-[color:var(--text-muted)]" />
            <p className="text-sm font-medium text-[color:var(--text-strong)]">Elige un archivo CSV o arrástralo aquí</p>
            <p className="text-xs text-[color:var(--text-muted)]">Solo archivos .csv</p>
          </>
        )}
        <input
          id={inputId}
          type="file"
          accept=".csv"
          className="sr-only"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
      </label>

      <div className="mt-4 flex items-center gap-2">
        <button onClick={onUpload} disabled={uploading || !file} className="btn-primary flex-1">
          {uploading ? <Spinner /> : <Upload className="h-4 w-4" />}
          {uploading ? 'Cargando…' : 'Cargar CSV'}
        </button>
        {file && !uploading && (
          <button onClick={() => onFile(null)} className="icon-btn" aria-label="Quitar archivo" title="Quitar archivo">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <FeedbackNotice feedback={feedback} className="mt-3" />
    </section>
  );
}

export default function CsvUpload() {
  const { data: formStatusData, isLoading: isFormStatusLoading } = useFormStatus();
  const formEnabled = Boolean(formStatusData?.habilitado);
  const toggleFormStatusMutation = useToggleFormStatus();

  const { data: cursos = [], isLoading: isLoadingCursos } = useCursos();
  const toggleCursoMutation = useToggleCurso();

  const migrateMutation = useMigrate();
  const isMigrating = migrateMutation.isPending;

  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [historyFile, setHistoryFile] = useState<File | null>(null);
  const [currentFeedback, setCurrentFeedback] = useState<Feedback>(null);
  const [historyFeedback, setHistoryFeedback] = useState<Feedback>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingHistory, setIsUploadingHistory] = useState(false);
  const [migrationFeedback, setMigrationFeedback] = useState<Feedback>(null);
  const [cursosFeedback, setCursosFeedback] = useState<Feedback>(null);
  const [formFeedback, setFormFeedback] = useState<Feedback>(null);
  const [pendingCurso, setPendingCurso] = useState<number | null>(null);

  const flash = (set: (f: Feedback) => void, f: Feedback) => {
    set(f);
    if (f?.kind === 'success') setTimeout(() => set(null), 3000);
  };

  const toggleFormStatus = async () => {
    setFormFeedback(null);
    try {
      const result = await toggleFormStatusMutation.mutateAsync({ habilitado: !formEnabled });
      flash(setFormFeedback, { kind: 'success', text: result.message ?? 'Estado actualizado' });
    } catch (error) {
      console.error('Error al cambiar el estado del formulario:', error);
      setFormFeedback({ kind: 'error', text: 'No se pudo cambiar el estado del formulario. Intenta de nuevo.' });
    }
  };

  const toggleCursoActivo = async (cursoId: number, activo: boolean) => {
    setPendingCurso(cursoId);
    try {
      await toggleCursoMutation.mutateAsync({ cursoId, activo: !activo });
      flash(setCursosFeedback, { kind: 'success', text: `Curso ${!activo ? 'visible' : 'oculto'} en el formulario` });
    } catch (error) {
      console.error('Error al cambiar estado del curso:', error);
      setCursosFeedback({ kind: 'error', text: 'No se pudo cambiar el curso. Intenta de nuevo.' });
    } finally {
      setPendingCurso(null);
    }
  };

  const handleMigrate = async () => {
    const result = await Swal.fire({
      title: '¿Pasar los datos actuales al histórico?',
      text: 'Los participantes de los cursos activos se mueven a la tabla histórica.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, pasar al histórico',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    });
    if (!result.isConfirmed) return;

    setMigrationFeedback(null);
    try {
      const data = await migrateMutation.mutateAsync();
      setMigrationFeedback({ kind: 'success', text: data.message ?? 'Datos pasados al histórico' });
    } catch (error) {
      console.error('Error durante la migración:', error);
      setMigrationFeedback({ kind: 'error', text: 'No se pudieron pasar los datos al histórico. No se movió nada.' });
    }
  };

  const handleUploadCurrent = async () => {
    if (!currentFile) {
      setCurrentFeedback({ kind: 'error', text: 'Elige un archivo CSV primero.' });
      return;
    }
    setIsUploading(true);
    setCurrentFeedback(null);
    const formData = new FormData();
    formData.append('file', currentFile);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/data/upload-csv`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCurrentFeedback({ kind: 'success', text: response.data.message || 'Archivo CSV cargado' });
      setCurrentFile(null);
    } catch (error) {
      console.error('Error uploading CSV:', error);
      setCurrentFeedback({ kind: 'error', text: 'No se pudo cargar el archivo. Revisa que sea el CSV correcto e intenta de nuevo.' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadHistory = async () => {
    if (!historyFile) {
      setHistoryFeedback({ kind: 'error', text: 'Elige un archivo CSV primero.' });
      return;
    }
    const result = await Swal.fire({
      title: '¿Reemplazar el histórico?',
      text: 'Los datos históricos actuales se reemplazan por los de este archivo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, reemplazar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: { confirmButton: 'is-danger' },
    });
    if (!result.isConfirmed) return;

    setIsUploadingHistory(true);
    setHistoryFeedback(null);
    const formData = new FormData();
    formData.append('file', historyFile);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/data/upload-history`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setHistoryFeedback({ kind: 'success', text: response.data.message || 'Archivo CSV cargado' });
      setHistoryFile(null);
    } catch (error) {
      console.error('Error uploading CSV:', error);
      setHistoryFeedback({ kind: 'error', text: 'No se pudo cargar el archivo. El histórico no cambió.' });
    } finally {
      setIsUploadingHistory(false);
    }
  };

  const handleDownloadFormData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/data/getFormData`, {
        withCredentials: true,
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Formulario.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading form data:', error);
      await Swal.fire({ title: 'No se pudo descargar', text: 'Puede que el formulario todavía no tenga respuestas.', icon: 'error' });
    }
  };

  const wipeFormData = async () => {
    try {
      const result = await Swal.fire({
        title: '¿Eliminar todas las respuestas del formulario?',
        text: 'Se borran todas las respuestas recibidas. Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        customClass: { confirmButton: 'is-danger' },
      });
      if (!result.isConfirmed) return;

      await axios.get(`${import.meta.env.VITE_API_URL}/data/wipeForm`, { withCredentials: true });
      await Swal.fire({ title: 'Respuestas eliminadas', text: 'El formulario quedó sin respuestas.', icon: 'success' });
    } catch (error) {
      console.error('Error wiping form data:', error);
      await Swal.fire({ title: 'No se pudieron eliminar', text: 'Las respuestas siguen guardadas. Intenta de nuevo.', icon: 'error' });
    }
  };

  const activeCount = cursos.filter((c) => c.activo).length;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="page-title">Datos y formulario</h1>
        <p className="page-subtitle">Carga los CSV de participantes y controla qué se muestra en el formulario público.</p>
      </header>

      {/* Formulario público */}
      <section className="space-y-3" aria-labelledby="sec-formulario">
        <h2 id="sec-formulario" className="section-title">Formulario público</h2>
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
          <div className="dashboard-card">
            {isFormStatusLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="card-title">Recibir respuestas</h3>
                    <p className="card-subtitle">
                      {formEnabled ? 'El formulario está abierto.' : 'El formulario está cerrado.'}
                    </p>
                  </div>
                  <Switch
                    checked={formEnabled}
                    onChange={toggleFormStatus}
                    disabled={toggleFormStatusMutation.isPending}
                    label="Recibir respuestas en el formulario"
                  />
                </div>
                <p className={cn('mt-4 badge-dot', formEnabled ? 'badge-success' : 'badge-neutral')}>
                  {formEnabled ? 'Abierto' : 'Cerrado'}
                </p>
                <FeedbackNotice feedback={formFeedback} className="mt-3" />
              </>
            )}
          </div>

          <div className="dashboard-card lg:col-span-2">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <div>
                <h3 className="card-title">Cursos en el formulario</h3>
                <p className="card-subtitle">Los cursos activados aparecen como opción para elegir.</p>
              </div>
              {!isLoadingCursos && (
                <span className="text-[13px] text-[color:var(--text-muted)] tabular whitespace-nowrap">
                  {activeCount} de {cursos.length} visibles
                </span>
              )}
            </div>
            {isLoadingCursos ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : cursos.length === 0 ? (
              <p className="py-6 text-center text-[13px] text-[color:var(--text-muted)]">No hay cursos configurados.</p>
            ) : (
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {cursos.map((curso) => (
                  <li
                    key={curso.id}
                    className={cn(
                      'flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 transition-colors',
                      curso.activo ? 'border-emerald-200 bg-emerald-50/50' : 'border-[color:var(--border)]',
                    )}
                  >
                    <span className={cn('text-sm font-medium', curso.activo ? 'text-[color:var(--text-strong)]' : 'text-[color:var(--text-muted)]')}>
                      {curso.nombre}
                    </span>
                    <Switch
                      checked={curso.activo}
                      onChange={() => toggleCursoActivo(curso.id, curso.activo)}
                      disabled={pendingCurso === curso.id}
                      label={`Mostrar ${curso.nombre} en el formulario`}
                    />
                  </li>
                ))}
              </ul>
            )}
            <FeedbackNotice feedback={cursosFeedback} className="mt-3" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={handleDownloadFormData} className="btn-secondary">
            <Download className="h-4 w-4" />
            Descargar respuestas (Excel)
          </button>
        </div>
      </section>

      {/* Carga de CSV */}
      <section className="space-y-3" aria-labelledby="sec-csv">
        <h2 id="sec-csv" className="section-title">Cargar participantes</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CsvDropzone
            title="Cursos activos"
            description="Actualiza los participantes que se ven en “Cursos activos”."
            file={currentFile}
            onFile={(f) => {
              setCurrentFile(f);
              setCurrentFeedback(null);
            }}
            onUpload={handleUploadCurrent}
            uploading={isUploading}
            feedback={currentFeedback}
          />
          <CsvDropzone
            title="Histórico"
            description="Reemplaza por completo los datos de cursos anteriores."
            file={historyFile}
            onFile={(f) => {
              setHistoryFile(f);
              setHistoryFeedback(null);
            }}
            onUpload={handleUploadHistory}
            uploading={isUploadingHistory}
            feedback={historyFeedback}
          />
        </div>
      </section>

      {/* Acciones de cierre de ciclo */}
      <section className="space-y-3" aria-labelledby="sec-zona">
        <h2 id="sec-zona" className="section-title">Cierre de ciclo</h2>
        <div className="dashboard-card divide-y divide-[color:var(--border)] !py-0">
          <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="card-title">Pasar cursos activos al histórico</h3>
              <p className="card-subtitle">Al terminar un ciclo, mueve los participantes actuales a la tabla histórica.</p>
            </div>
            <button onClick={handleMigrate} disabled={isMigrating} className="btn-secondary sm:flex-shrink-0">
              {isMigrating ? <Spinner /> : <ArchiveRestore className="h-4 w-4" />}
              {isMigrating ? 'Pasando…' : 'Pasar al histórico'}
            </button>
          </div>
          <FeedbackNotice feedback={migrationFeedback} className="my-3" />
          <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="card-title text-red-800">Eliminar respuestas del formulario</h3>
              <p className="card-subtitle">Borra todas las respuestas recibidas. No se puede deshacer.</p>
            </div>
            <button onClick={wipeFormData} className="btn-danger-outline sm:flex-shrink-0">
              <Trash2 className="h-4 w-4" />
              Eliminar respuestas
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
