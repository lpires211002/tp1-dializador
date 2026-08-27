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


/**
 * Coeficientes de difusión de la Vitamina B12 reportados para distintos
 * materiales. Sirven para mostrar que D es propiedad del par soluto–material
 * y no de la molécula sola.
 *
 * ⚠ Sólo el Cuprophane es utilizable para el TP: es el único caso donde la
 * MISMA fuente midió también la urea sobre el MISMO material, que es lo que
 * hace trasladable el cociente entre solutos.
 */
export const B12_MATERIALES = [
  { id: 'agua', nombre: 'Agua libre', tipo: 'Referencia, sin material', D: 3.79e-10,
    fuente: 'Colton 1971, Tabla I' },
  { id: 'gellan', nombre: 'Gellan gum', tipo: 'Hidrogel de polisacárido', D: 1.70e-10,
    fuente: 'Ferris & in het Panhuis 2010' },
  { id: 'gellan-cnt', nombre: 'Gellan gum + nanotubos', tipo: 'Compuesto', D: 0.70e-10,
    fuente: 'Ferris & in het Panhuis 2010' },
  { id: 'cuprophane', nombre: 'Cuprophane PT-150', tipo: 'Membrana de diálisis', D: 1.9243e-11,
    fuente: 'Colton 1971, Tablas III y VII', usable: true },
  { id: 'mof', nombre: 'TbMOF-100', tipo: 'Estructura metal-orgánica', D: 1.833e-20,
    fuente: 'Valencia 2012' }
]


/**
 * Datos clínicos de clearance de Vitamina B12 en pacientes reales.
 *
 * Casino, F. G., Mostacci, S. D., Santarsia, G. & Lopez, T. (2004).
 * "Vitamin B12 clearance (Kd-B12) in hemodialysis (HD) and hemodiafiltration
 * (HDF)". Giornale italiano di nefrologia, 21 Supl. 30, S217-222.
 * PMID 15750989. Recuperado de PubMed.
 *
 * KoA es el coeficiente de transferencia de masa por área: KoA = P·A = (D/L)·A.
 * Es decir, exactamente la misma cantidad que calcula este modelo, de modo que
 * se puede comparar sin conversión.
 */
export const B12_CLINICO = {
  n: 62,
  area: 1.9,
  areaSd: 0.3,
  koa: 211,
  koaSd: 92,
  kdHd: 105,
  kdHdSd: 13,
  kdHdf: 152,
  kdHdfSd: 34,
  fuente: 'Casino et al. 2004 · PMID 15750989'
}
