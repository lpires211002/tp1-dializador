/**
 * dialyzers.js — Dializadores comerciales, como referencia de orden de magnitud.
 *
 * ⚠ Estos valores son APROXIMADOS y sirven sólo para contrastar la escala del
 * modelo contra la realidad. Los clearances reales dependen del caudal de
 * sangre (Qb), del caudal de dializado (Qd) y de la ultrafiltración, y cada
 * fabricante los publica en su propia tabla.
 *
 * Para el informe: descargá el data sheet oficial, tomá el valor a Qb = 300 y
 * Qd = 500 mL/min, y citá el documento. La interfaz permite sobrescribir el
 * clearance con el número que encuentres.
 */

export const DIALYZERS = [
  {
    id: 'f160',
    name: 'Optiflux F160NR',
    maker: 'Fresenius',
    material: 'Polisulfona (Fresenius Polysulfone®)',
    flux: 'High-flux',
    area: 1.5,
    ureaApprox: 245
  },
  {
    id: 'fx80',
    name: 'FX80',
    maker: 'Fresenius',
    material: 'Helixone® (polisulfona modificada)',
    flux: 'High-flux',
    area: 1.8,
    ureaApprox: 255
  },
  {
    id: 'revaclear',
    name: 'Revaclear 300',
    maker: 'Baxter',
    material: 'Polyarylethersulfona / PVP',
    flux: 'High-flux',
    area: 1.4,
    ureaApprox: 240
  },
  {
    id: 'elisio17h',
    name: 'Elisio-17H',
    maker: 'Nipro',
    material: 'Polyethersulfona (Polynephron®)',
    flux: 'High-flux',
    area: 1.7,
    ureaApprox: 250
  }
]

/** Caudal de sangre de referencia al que se suelen tabular los clearances. */
export const QB_REF = 300
export const QD_REF = 500
