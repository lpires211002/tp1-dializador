/**
 * solutes.js — Biblioteca de solutos.
 *
 * FUENTE PRINCIPAL
 * Colton, C. K., Smith, K. A., Merrill, E. W. & Farrell, P. C. (1971).
 * "Permeability Studies with Cellulosic Membranes".
 * Journal of Biomedical Materials Research, 5(6), 459–488.
 *
 *   · dWater  Tabla I, columna "Value used this study": difusividad en solución
 *             salina isotónica a 37 °C, dilución infinita [m²/s].
 *   · rmColton  Tabla III, Cuprophane PT-150 sin soluto no marcado, 37 °C,
 *             espesor húmedo 1,10 mils (28 µm). Resistencia de membrana
 *             R_m [min/cm]. Como todos se midieron en la MISMA membrana, el
 *             cociente R_m(urea)/R_m(soluto) es directamente el cociente de
 *             permeabilidades, y por lo tanto de clearances.
 *
 * Los solutos sin rmColton no figuran en el trabajo de Colton: para esos, el
 * simulador estima D y lo marca como estimado.
 */

/** Resistencia de la urea en Cuprophane PT-150 [min/cm]. Referencia del cociente. */
export const RM_UREA_COLTON = 17.0

/**
 * Referencia de la urea usada para anclar los modelos estimativos.
 * Es la ÚNICA definición de estos valores: model.js la importa de acá para
 * que no puedan quedar desincronizados.
 */
export const UREA_REF = { rs: 0.22, dWater: 1.81e-9 }

export const SOLUTES = [
  {
    id: 'urea',
    name: 'Urea',
    formula: 'CH₄N₂O',
    mw: 60.06,
    dWater: 1.81e-9,
    rs: 0.22,
    rmColton: 17.0,
    fuente: 'Colton 1971, Tablas I y III',
    clase: 'Pequeña',
    anchor: true,
    nota: 'El soluto de referencia del TP. Marcador estándar de adecuación de diálisis (Kt/V).'
  },
  {
    id: 'creatinina',
    name: 'Creatinina',
    formula: 'C₄H₇N₃O',
    mw: 113.1,
    dWater: 1.29e-9,
    rs: 0.30,
    rmColton: 30.8,
    fuente: 'Colton 1971, Tablas I y III',
    clase: 'Pequeña',
    nota: 'Casi el doble de masa que la urea, pero difunde casi igual: la dependencia con M^(1/3) es débil.'
  },
  {
    id: 'fosfato',
    name: 'Fosfato',
    formula: 'HPO₄²⁻',
    mw: 95.0,
    dWater: 0.76e-9,
    rs: 0.28,
    fuente: null,
    clase: 'Pequeña',
    nota: 'No figura en Colton 1971. Ion hidratado: su radio efectivo es mayor de lo que sugiere su masa.'
  },
  {
    id: 'b12',
    name: 'Vitamina B12',
    formula: 'C₆₃H₈₈CoN₁₄O₁₄P',
    mw: 1355,
    dWater: 3.79e-10,
    rs: 0.85,
    rmColton: 242,
    fuente: 'Colton 1971, Tablas I y III',
    highlight: true,
    clase: 'Media',
    nota: 'El soluto que pide analizar la consigna. Marcador clásico del rango de "moléculas medias".'
  },
  {
    id: 'b2m',
    name: 'β₂-microglobulina',
    formula: 'Proteína, 99 aa',
    mw: 11800,
    dWater: 8.0e-11,
    rs: 1.6,
    fuente: null,
    clase: 'Media-grande',
    nota: 'No figura en Colton 1971 (su rol clínico se describió después). Objetivo de las membranas high-flux.'
  },
  {
    id: 'albumina',
    name: 'Albúmina',
    formula: 'Proteína, 585 aa',
    mw: 66000,
    dWater: 9.09e-11,
    rs: 3.5,
    rmColton: 5.9e5,
    rmColtonTemp: 27,
    fuente: 'Colton 1971, Tabla I (37 °C) y Tabla V (R_m a 27 °C)',
    keep: true,
    clase: 'Grande',
    nota: 'Colton midió permeación medible pero extremadamente lenta: la medición con Cuprophane requirió 96 h.'
  }
]

export const getSolute = (id) => SOLUTES.find((s) => s.id === id) ?? SOLUTES[0]
