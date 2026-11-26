import { ReactNode, useEffect, useEffectEvent, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface ModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Ventana modal accesible: se cierra con Escape o clic afuera, enfoca el primer campo
 * y devuelve el foco al elemento que la abrió.
 */
export function Modal({ open, title, description, onClose, children }: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  // onClose suele llegar como función nueva en cada render. Con useEffectEvent el efecto usa
  // siempre la última sin volver a correr, así no le roba el foco al campo que se está editando.
  const closeOnEscape = useEffectEvent((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  });

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const first = panelRef.current?.querySelector<HTMLElement>('input, select, textarea, button:not([data-close])');
    first?.focus();
    const onKey = (e: KeyboardEvent) => closeOnEscape(e);
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open]);

  // En celular la hoja sube desde abajo; en pantallas grandes el panel aparece con una leve escala
  const isSheet = typeof window !== 'undefined' && !window.matchMedia('(min-width: 640px)').matches;
  const enterEase = [0.16, 1, 0.3, 1] as const;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-primary-950/50"
            onClick={onClose}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="relative w-full sm:max-w-lg max-h-[92dvh] overflow-y-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-[0_20px_60px_-15px_rgba(12,22,38,0.45)]"
            initial={isSheet ? { y: '100%' } : { opacity: 0, scale: 0.97, y: 8 }}
            animate={
              isSheet
                ? { y: 0, transition: { duration: 0.36, ease: enterEase } }
                : { opacity: 1, scale: 1, y: 0, transition: { duration: 0.26, ease: enterEase } }
            }
            exit={
              isSheet
                ? { y: '100%', transition: { duration: 0.22, ease: 'easeIn' } }
                : { opacity: 0, scale: 0.98, transition: { duration: 0.14, ease: 'easeIn' } }
            }
          >
            <div className="sticky top-0 z-1 flex items-start justify-between gap-4 bg-white px-5 sm:px-6 pt-5 pb-3">
              <div>
                <h2 id={titleId} className="text-lg font-semibold">{title}</h2>
                {description && <p className="card-subtitle">{description}</p>}
              </div>
              <button type="button" data-close onClick={onClose} className="icon-btn -mr-2 -mt-1" aria-label="Cerrar">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-5 sm:px-6 pb-5 sm:pb-6">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
