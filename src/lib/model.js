import { UREA_REF } from './solutes.js'

/**
 * model.js — Transferencia de masa a través de la membrana de un dializador.
 *
 * Todo el módulo trabaja en Sistema Internacional. No importa React:
 * es física pura y se puede testear sola.
 *
 * Hipótesis del modelo (Anexo I del TP):
 *   · Membrana = placa plana de espesor constante L.
 *   · Transporte puramente difusivo (Primera Ley de Fick).
 *   · Estado estacionario: el perfil de concentración no cambia con el tiempo.
 *   · Gradiente lineal a través del espesor  =>  dC/dx = ΔC/Δx.
 *   · C = C_sangre en x=0 y C = 0 en x=L (dializado como sumidero perfecto).
 *   · Sin convección ni ultrafiltración/retrofiltración.
 *
 * Nota de unidades: 1 mM = 1 mmol/L = 1 mol/m³.
 * Por eso el código del Anexo I asigna C_sangre_mol_m3 = C_sangre_mM sin
 * factor de conversión, y está bien.
 */

/** 1 m³/s expresado en mL/min: 1e6 mL/m³ × 60 s/min. */
export const M3S_TO_ML_MIN = 6e7

/** 1 mil (milésima de pulgada) en metros. Colton tabula espesores en mils. */
export const MIL_TO_M = 2.54e-5

/** Peso molecular de la urea, g/mol. Referencia del escalado de difusividad. */
export const MW_UREA = 60.06

/**
 * Flujo difusivo de masa a través de la membrana.
 *   J = D · ΔC / L        [mol/(m²·s)]
 * El signo negativo de la Ley de Fick indica que el flujo va a favor del
 * gradiente; acá devolvemos la magnitud en el sentido sangre → dializado.
 */
export function flux({ D, C, L, Cd = 0 }) {
  return (D * (C - Cd)) / L
}

/**
 * Flujo total de masa que atraviesa toda el área de intercambio.
 *   ṁ = J · A            [mol/s]
 */
export function massRate({ D, C, L, A, Cd = 0 }) {
  return flux({ D, C, L, Cd }) * A
}

/**
 * Factor de agotamiento del gradiente.
 *
 * El Anexo I asume dializado como sumidero perfecto (C_dializado = 0). Si el
 * dializado se carga, el gradiente que empuja el transporte no es C sino
 * (C − C_d), y el clearance cae en la misma proporción:
 *
 *   Cl = (D·A/L) · (1 − C_d/C)
 *
 * Con C_d = 0 el factor vale 1 y se recupera exactamente la fórmula del TP.
 */
export function gradientFactor({ C, Cd = 0 }) {
  if (C <= 0) return 0
  return Math.max(0, 1 - Cd / C)
}

/**
 * Clearance (aclaramiento): volumen de sangre depurado por unidad de tiempo.
 *   Cl = ṁ / C = D · A / L    [m³/s]
 *
 * La concentración se cancela. En este modelo el clearance es una propiedad
 * geométrica y material de la membrana: NO depende de cuán urémico esté el
 * paciente. Es el resultado conceptual central del TP.
 */
export function clearance({ D, A, L }) {
  return (D * A) / L
}

/** Clearance en las unidades clínicas habituales [mL/min].
 *  `factor` permite aplicar el agotamiento del gradiente (1 − C_d/C). */
export function clearanceMlMin({ D, A, L, factor = 1 }) {
  return clearance({ D, A, L }) * factor * M3S_TO_ML_MIN
}

/**
 * Área de membrana necesaria para alcanzar un clearance objetivo.
 *   A = Cl · L / D        [m²]
 * Inversión directa de Cl = D·A/L (relación lineal en A).
 */
export function areaForClearance({ targetMlMin, D, L, factor = 1 }) {
  if (factor <= 0) return Infinity
  return ((targetMlMin / M3S_TO_ML_MIN) * L) / (D * factor)
}

/**
 * Espesor necesario para alcanzar un clearance objetivo.
 *   L = D · A / Cl        [m]
 * Relación hiperbólica: Cl ∝ 1/L.
 */
export function thicknessForClearance({ targetMlMin, D, A }) {
  return (D * A) / (targetMlMin / M3S_TO_ML_MIN)
}

/**
 * Escalado de difusividad por Stokes–Einstein.
 *
 *   D = k_B·T / (6·π·η·r_h)   =>   D ∝ 1/r_h
 * y para una molécula compacta de densidad aproximadamente constante
 *   r_h ∝ M^(1/3)             =>   D ∝ M^(-1/3)
 *
 * Devuelve el factor D(soluto)/D(referencia) = (M_ref / M_soluto)^(1/3).
 */
export function stokesEinsteinFactor(mw, mwRef = MW_UREA) {
  return Math.cbrt(mwRef / mw)
}

/**
 * Factor de difusión estorbada dentro de un poro cilíndrico (Renkin).
 *
 *   λ = r_soluto / r_poro
 *   H(λ) = (1-λ)² · (1 - 2.104λ + 2.089λ³ - 0.948λ⁵)
 *
 * El término (1-λ)² es la exclusión estérica (qué fracción de la sección del
 * poro es accesible al centro del soluto) y el paréntesis es el impedimento
 * hidrodinámico por la cercanía de la pared. Válido hasta λ ≈ 0.6; por encima
 * el soluto queda prácticamente excluido y devolvemos 0.
 */
export function renkinFactor(rSolute, rPore) {
  const lambda = rSolute / rPore
  if (lambda >= 1) return 0
  const steric = (1 - lambda) ** 2
  const hydro =
    1 - 2.104 * lambda + 2.089 * lambda ** 3 - 0.948 * lambda ** 5
  return Math.max(0, steric * Math.max(0, hydro))
}

/**
 * Difusividad efectiva a partir de las resistencias medidas por Colton (1971).
 *
 * En la Tabla III todos los solutos se midieron sobre la MISMA membrana
 * (Cuprophane PT-150, 37 °C), así que el espesor y el área se cancelan y
 *
 *   P_m(soluto) / P_m(urea) = R_m(urea) / R_m(soluto)
 *
 * Ese cociente de permeabilidades es también el cociente de clearances. Lo
 * aplicamos sobre el D de la urea que da la cátedra, de modo que la urea sigue
 * reproduciendo 120 mL/min y el resto queda anclado a datos experimentales.
 */
export function coltonFactor(rmSolute, rmUrea = 17.0) {
  return rmUrea / rmSolute
}

/**
 * Difusividad efectiva de un soluto DENTRO de la membrana.
 *
 * Tres modelos, todos calibrados para que la urea reproduzca exactamente el
 * D = 1e-10 m²/s que da la consigna. Así el Paso 1 siempre cierra en
 * 120 mL/min y los demás solutos se mueven relativos a ese anclaje.
 *
 *   'stokes'  D = D_urea,mem · (M_urea/M)^(1/3)
 *             Sólo tamaño molecular. Es el nivel de detalle que pide la
 *             consigna para explicar la Vitamina B12.
 *
 *   'renkin'  D = D_agua · H(λ) · (ε/τ)
 *             Suma exclusión estérica e impedimento hidrodinámico en el poro.
 *             (ε/τ) se despeja de la urea, de modo que el modelo queda anclado
 *             al dato de la cátedra en vez de ser un número inventado.
 *
 *   'colton'  D = D_urea,mem · R_m(urea)/R_m(soluto)
 *             Cociente de resistencias medidas en Cuprophane PT-150.
 *             Es el único modelo respaldado por medición y no por estimación.
 *             Si el soluto no figura en Colton 1971, cae a 'stokes'.
 */
export function membraneDiffusivity(solute, { model, rPore, dUreaMem }) {
  if (model === 'colton') {
    if (!solute.rmColton) return dUreaMem * stokesEinsteinFactor(solute.mw)
    return dUreaMem * coltonFactor(solute.rmColton)
  }

  if (model === 'renkin') {
    const hUrea = renkinFactor(UREA_REF.rs, rPore)
    if (hUrea <= 0) return 0
    // Porosidad/tortuosidad efectiva despejada del anclaje de la urea.
    const epsOverTau = dUreaMem / (UREA_REF.dWater * hUrea)
    return solute.dWater * renkinFactor(solute.rs, rPore) * epsOverTau
  }

  return dUreaMem * stokesEinsteinFactor(solute.mw)
}

/** Porosidad/tortuosidad efectiva implícita, para mostrarla como diagnóstico. */
export function effectivePorosity({ rPore, dUreaMem }) {
  const h = renkinFactor(UREA_REF.rs, rPore)
  return h > 0 ? dUreaMem / (UREA_REF.dWater * h) : NaN
}

/**
 * Difusividad efectiva MEDIDA, a partir de la resistencia de membrana.
 *
 * Colton tabula R_m [min/cm] y el espesor húmedo t_m [mils]. La permeabilidad
 * es P = 1/R_m, y por definición P = K_s·D_m/L, de donde
 *
 *   K_s · D_m = L / R_m        [m²/s]
 *
 * Ese producto es exactamente el "D" del modelo del TP, porque el clearance se
 * define contra la concentración del lado de la sangre: Cl = (K_s·D_m/L)·A.
 * Dividiendo por el coeficiente de partición K_s se obtiene la difusividad
 * dentro de la fase membrana propiamente dicha.
 */
export function measuredKsD(rmMinCm, thicknessMils) {
  const rmSecPerM = rmMinCm * 60 * 100
  return (thicknessMils * MIL_TO_M) / rmSecPerM
}

export function measuredDm(rmMinCm, thicknessMils, ks) {
  return measuredKsD(rmMinCm, thicknessMils) / ks
}

/** Barrido de clearance en función del espesor. Devuelve puntos {L_um, cl}. */
export function sweepThickness({ D, A, factor = 1, from = 10, to = 150, steps = 140 }) {
  const pts = []
  for (let i = 0; i <= steps; i++) {
    const Lum = from + ((to - from) * i) / steps
    pts.push({ x: Lum, y: clearanceMlMin({ D, A, L: Lum * 1e-6, factor }) })
  }
  return pts
}

/** Barrido de clearance en función del área. Devuelve puntos {A_m2, cl}. */
export function sweepArea({ D, L, factor = 1, from = 0, to = 2.5, steps = 120 }) {
  const pts = []
  for (let i = 0; i <= steps; i++) {
    const A = from + ((to - from) * i) / steps
    pts.push({ x: A, y: clearanceMlMin({ D, A, L, factor }) })
  }
  return pts
}
