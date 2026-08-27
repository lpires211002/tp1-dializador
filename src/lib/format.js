/** Utilidades de formato. Todo número que se muestra pasa por acá. */

/** Notación científica legible: 1.0000e-5 -> "1,0000 × 10⁻⁵" */
export function sci(value, digits = 4) {
  if (!isFinite(value)) return '—'
  if (value === 0) return '0'
  const exp = Math.floor(Math.log10(Math.abs(value)))
  const mant = value / 10 ** exp
  return `${mant.toFixed(digits).replace('.', ',')} × 10${sup(exp)}`
}

const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' }
export const sup = (n) => String(n).split('').map((c) => SUP[c] ?? c).join('')

/** Decimales con coma, al estilo del informe en castellano. */
export function num(value, digits = 2) {
  if (!isFinite(value)) return '—'
  return value.toFixed(digits).replace('.', ',')
}
