import { useEffect } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'motion/react';

interface AnimatedNumberProps {
  value: number;
  className?: string;
  /** Sufijo pegado al número, por ejemplo "%" */
  suffix?: string;
}

/**
 * Número que cuenta desde su valor anterior hasta el nuevo. Muestra el cambio cuando
 * llegan datos o se aplica un filtro. Con "reducir movimiento" salta directo al valor.
 */
export function AnimatedNumber({ value, className, suffix = '' }: AnimatedNumberProps) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? value : 0);
  const text = useTransform(mv, (v) => `${Math.round(v).toLocaleString('es')}${suffix}`);

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: 0.7, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [value, reduce, mv]);

  return (
    <motion.span className={className} aria-label={`${value.toLocaleString('es')}${suffix}`}>
      {text}
    </motion.span>
  );
}

interface AnimatedBarProps {
  /** Proporción entre 0 y 1 */
  ratio: number;
  color: string;
  className?: string;
  delay?: number;
}

/** Barra que se llena desde la izquierda (transform, sin recalcular el layout) */
export function AnimatedBar({ ratio, color, className, delay = 0 }: AnimatedBarProps) {
  return (
    <motion.span
      className={className}
      style={{ background: color, transformOrigin: 'left center', width: '100%' }}
      initial={{ scaleX: 0 }}
      animate={{ scaleX: Math.max(0, Math.min(1, ratio)) }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    />
  );
}
