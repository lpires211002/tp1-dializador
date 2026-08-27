import Field from './Field.jsx'
import { SOLUTES } from '../lib/solutes.js'
import { clearanceMlMin, membraneDiffusivity, effectivePorosity } from '../lib/model.js'
import { num, sci } from '../lib/format.js'

const MODELS = [
  {
    id: 'colton',
    name: 'Colton 1971 (medido)',
    desc: 'Cociente de resistencias en Cuprophane PT-150.'
  },
  {
    id: 'stokes',
    name: 'Escalado Stokes–Einstein',
    desc: 'D ∝ M^(−1/3) desde la urea. Sólo tamaño molecular.'
  },
  {
    id: 'renkin',
    name: 'Difusión estorbada (Renkin)',
    desc: 'Suma exclusión estérica e impedimento en el poro.'
  }
]

/** Paso 4 — Cálculo de eficiencia y cut-off de la membrana. */
export default function StepCutoff({ s, set, derived }) {
  const opts = { model: s.diffModel, rPore: s.rPore, dUreaMem: s.dUreaMem }
  const L = s.L_um * 1e-6

  const rows = SOLUTES.map((sol) => {
    const D = sol.anchor && s.diffModel !== 'renkin' ? s.dUreaMem : membraneDiffusivity(sol, opts)
    const medido = s.diffModel === 'colton' && !!sol.rmColton
    return { ...sol, D, medido, cl: clearanceMlMin({ D, A: s.A_m2, L, factor: derived.factor }) }
  })

  const max = Math.max(...rows.map((r) => r.cl), 1e-9)
  const urea = rows[0]
  const b12 = rows.find((r) => r.id === 'b12')
  const epsTau = effectivePorosity({ rPore: s.rPore, dUreaMem: s.dUreaMem })

  return (
    <section className="step" id="paso-4">
      <p className="step__eyebrow">Desarrollo · Paso 4</p>
      <h2 className="step__title">Cálculo de eficiencia y cut-off</h2>
      <p className="step__intro">
        Clearance de la Vitamina B12 y del resto de los solutos. Como la geometría es la misma para
        todos, el cociente de clearances es el cociente de difusividades.
      </p>

      <div className="step__body">
        <p className="models__legend">
          Cómo se obtiene <i>D</i> para los solutos distintos de la urea
        </p>
        <div className="models" role="group" aria-label="Modelo de estimación de la difusividad">
          {MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              className="models__opt"
              aria-pressed={s.diffModel === m.id}
              onClick={() => set.diffModel(m.id)}
            >
              <span className="models__name">{m.name}</span>
              <span className="models__desc">{m.desc}</span>
            </button>
          ))}
        </div>

        {s.diffModel === 'renkin' && (
          <div className="poro">
            <Field
              symbol="rₚ" name="Radio de poro"
              value={s.rPore} display={`${num(s.rPore, 2)} nm`}
              min={0.8} max={6} step={0.05}
              onChange={set.rPore} scale={['0,8 nm · low-flux', '6,0 nm · high-flux']}
            />
            <p className="poro__note">
              Porosidad/tortuosidad efectiva despejada del anclaje de la urea:{' '}
              <b>ε/τ = {num(epsTau, 3)}</b>.
            </p>
          </div>
        )}

        <div className="bars">
          {rows.map((r) => (
            <div className="bar" key={r.id} data-highlight={r.highlight} data-keep={r.keep}>
              <span className="bar__name">
                {r.name}
                <span className="bar__mw">{r.mw.toLocaleString('es-AR')} g/mol · rₛ ≈ {num(r.rs, 2)} nm</span>
              </span>
              <span className="bar__track">
                <span className="bar__fill" style={{ width: `${Math.max((r.cl / max) * 100, 0.4)}%` }} />
              </span>
              <span className="bar__val">
                {r.cl < 0.005 ? '≈ 0' : num(r.cl, r.cl < 10 ? 2 : 1)} <span>mL/min</span>
              </span>
            </div>
          ))}
        </div>

        <div className="scroller">
          <table className="table">
            <caption>
              Difusividades y clearance · L = {num(s.L_um, 1)} µm · A = {num(s.A_m2, 2)} m²
            </caption>
            <thead>
              <tr>
                <th scope="col">Soluto</th>
                <th scope="col">M (g/mol)</th>
                <th scope="col">D en agua · 37 °C</th>
                <th scope="col">D en membrana</th>
                <th scope="col">Cl</th>
                <th scope="col">Cl / Cl urea</th>
                <th scope="col">Fuente</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} data-current={r.id === s.soluteId}>
                  <td>{r.name}</td>
                  <td>{r.mw.toLocaleString('es-AR')}</td>
                  <td>{sci(r.dWater, 2)}</td>
                  <td>
                    {sci(r.D, 2)}
                    {!r.anchor && !r.medido && <span className="flagmark">estimado</span>}
                  </td>
                  <td>{r.cl < 0.005 ? sci(r.cl, 2) : num(r.cl, 2)}</td>
                  <td className="table__delta">{r.cl / urea.cl < 0.001 ? sci(r.cl / urea.cl, 2) : num(r.cl / urea.cl, 4)}</td>
                  <td className="table__delta">{r.fuente ? 'Colton 1971' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="figure__note">
          <b>Figura 4.</b> El clearance cae al aumentar el tamaño del soluto: la urea depura{' '}
          {num(urea.cl, 1)} mL/min y la Vitamina B12 solo {num(b12.cl, 2)} mL/min, un factor{' '}
          {num(urea.cl / b12.cl, 1)}× menor. Como la geometría es idéntica para todos, la diferencia
          se explica enteramente por la difusividad efectiva en la membrana. La albúmina queda
          prácticamente excluida, que es lo que clínicamente se busca.
        </p>

        <p className="figure__note">
          <b>Fuente.</b> Colton, Smith, Merrill &amp; Farrell (1971), <i>Permeability Studies with
          Cellulosic Membranes</i>, J. Biomed. Mater. Res. 5(6), 459–488. Las difusividades en agua
          salen de la Tabla I (solución salina isotónica, 37 °C) y las resistencias de membrana de
          la Tabla III (Cuprophane PT-150, 37 °C). Los valores marcados como <i>estimados</i>{' '}
          corresponden a solutos que no figuran en ese trabajo.
        </p>
      </div>
    </section>
  )
}
