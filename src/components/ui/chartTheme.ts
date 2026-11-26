/** Categorías sin orden (cursos, áreas): tonos de la marca bien separados entre sí */
export const CATEGORICAL = ['#3a69aa', '#e39a0b', '#178474', '#c8553d', '#6b7f99', '#8a9a3b'];

/** Categorías con orden (edad, educación, experiencia): rampa del azul de la marca, de claro a oscuro */
export const SEQUENTIAL = ['#bcd0ea', '#8fb0dc', '#5f8ccb', '#3a69aa', '#2a4f84', '#1b3152'];

/** Colores históricos de cada curso (los del diseño anterior, pedidos por el cliente) */
export const COURSE_COLORS: Record<string, string> = {
  'Alimento Balanceado': '#DDA338',
  Avicultura: '#FFCE00',
  Acuacultura: '#85D5FC',
  Porcicultura: '#9E2A2B',
  'Ganado Lechero': '#6E6059',
};

/** Color estable por curso: el mismo curso tiene el mismo color en todos los gráficos */
export const courseColor = (course: string, index = 0) =>
  COURSE_COLORS[course] ?? CATEGORICAL[index % CATEGORICAL.length];

export const GENDER_COLORS: Record<string, string> = { Hombre: '#3a69aa', Mujer: '#e39a0b' };

export const CHART_AXIS = {
  tick: { fontSize: 12, fill: '#5b6878' },
  tickLine: false,
  axisLine: { stroke: '#dfe3e9' },
} as const;

export const CHART_GRID = { stroke: '#edf0f3', vertical: false } as const;

