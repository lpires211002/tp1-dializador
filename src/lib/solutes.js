/**
 * solutes.js — Biblioteca de solutos.
 *
 * ⚠ SOBRE LAS FUENTES
 * El único dato que da la cátedra es D_urea en la membrana = 1e-10 m²/s.
 * Todo lo demás de este archivo son valores típicos de literatura cargados
 * como punto de partida para explorar, NO como cita.
 *
 *   · mw      peso molecular [g/mol] — dato duro, verificable.
 *   · dWater  difusividad en agua diluida [m²/s], orden de magnitud aceptado.
 *             Depende de la temperatura (25 °C vs 37 °C cambia ~25 %).
 *   · rs      radio de Stokes [nm], valor típico de la literatura de membranas.
 *
 * Antes de poner cualquiera de estos números en el informe, buscá la fuente,
 * verificá la temperatura y citala. La interfaz marca en ocre todo valor que
 * necesita respaldo propio.
 */

export const SOLUTES = [
  {
    id: 'urea',
    name: 'Urea',
    formula: 'CH₄N₂O',
    mw: 60.06,
    dWater: 1.38e-9,
    rs: 0.22,
    clase: 'Pequeña',
    anchor: true,
    nota: 'El soluto de referencia del TP. Marcador estándar de adecuación de diálisis (Kt/V).'
  },
  {
    id: 'creatinina',
    name: 'Creatinina',
    formula: 'C₄H₇N₃O',
    mw: 113.12,
    dWater: 1.29e-9,
    rs: 0.30,
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
    clase: 'Pequeña',
    nota: 'Ion hidratado: su radio efectivo es mayor de lo que sugiere su masa. El tamaño manda, no el peso.'
  },
  {
    id: 'b12',
    name: 'Vitamina B12',
    formula: 'C₆₃H₈₈CoN₁₄O₁₄P',
    mw: 1355,
    dWater: 3.8e-10,
    rs: 0.85,
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
    clase: 'Media-grande',
    nota: 'Su acumulación causa amiloidosis asociada a diálisis. Es el objetivo real de las membranas high-flux.'
  },
  {
    id: 'albumina',
    name: 'Albúmina',
    formula: 'Proteína, 585 aa',
    mw: 66500,
    dWater: 6.1e-11,
    rs: 3.5,
    keep: true,
    clase: 'Grande',
    nota: 'NO debe atravesar la membrana: perderla es una complicación clínica. Define el techo del cut-off.'
  }
]

export const getSolute = (id) => SOLUTES.find((s) => s.id === id) ?? SOLUTES[0]
