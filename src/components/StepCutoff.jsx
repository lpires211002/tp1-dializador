import Field from './Field.jsx'
import { SOLUTES, TM_CUPROPHANE_MILS } from '../lib/solutes.js'
import {
  clearanceMlMin, membraneDiffusivity, effectivePorosity, measuredKsD, measuredDm
} from '../lib/model.js'
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

  // Respuesta directa a la consigna: D de la B12 medido en un polímero real.
  const b12Ref = SOLUTES.find((x) => x.id === 'b12')
  const ksD = measuredKsD(b12Ref.rmColton, TM_CUPROPHANE_MILS)
  const dm = measuredDm(b12Ref.rmColton, TM_CUPROPHANE_MILS, b12Ref.ksColton)
  const clMedido = clearanceMlMin({ D: ksD, A: s.A_m2, L, factor: derived.factor })

  return (
    <section className="step" id="paso-4">
      <p className="step__eyebrow">Desarrollo · Paso 4</p>
      <h2 className="step__title">Cálculo de eficiencia y cut-off</h2>
      <p className="step__intro">
        Clearance de la Vitamina B12 y del resto de los solutos. Como la geometría es la misma para
        todos, el cociente de clearances es el cociente de difusividades.
      </p>

      <div className="step__body">
        <div className="answer">
          <p className="answer__legend">
            Coeficiente de difusión investigado · Vitamina B12 en celulosa regenerada
          </p>
          <div className="answer__given">
            <span><i>R</i><sub>m</sub> = {b12Ref.rmColton} min/cm</span>
            <span><i>t</i><sub>m</sub> = {num(TM_CUPROPHANE_MILS, 2)} mils = {num(TM_CUPROPHANE_MILS * 25.4, 1)} µm</span>
            <span><i>K</i><sub>s</sub> = {num(b12Ref.ksColton, 2)}</span>
          </div>
          <p className="answer__src">Cuprophane PT-150 · 37 °C · Colton 1971, Tablas III y VII</p>

          <div className="answer__rows">
            <div className="answer__row">
              <span className="answer__eq"><i>K</i><sub>s</sub>·<i>D</i><sub>m</sub> = <i>t</i><sub>m</sub> / <i>R</i><sub>m</sub></span>
              <strong className="answer__val">{sci(ksD, 2)} m²/s</strong>
              <span className="answer__why">es el <i>D</i> que usa el modelo del TP</span>
            </div>
            <div className="answer__row">
              <span className="answer__eq"><i>D</i><sub>m</sub> = <i>K</i><sub>s</sub>·<i>D</i><sub>m</sub> / <i>K</i><sub>s</sub></span>
              <strong className="answer__val">{sci(dm, 2)} m²/s</strong>
              <span className="answer__why">dentro de la fase membrana</span>
            </div>
            <div className="answer__row answer__row--out">
              <span className="answer__eq">Clearance con ese <i>D</i></span>
              <strong className="answer__val">{num(clMedido, 2)} mL/min</strong>
              <span className="answer__why">a L = {num(s.L_um, 1)} µm y A = {num(s.A_m2, 2)} m²</span>
            </div>
          </div>

          <p className="answer__nota">
            El simulador de abajo mantiene el anclaje de la cátedra (<i>D</i> urea = 1×10⁻¹⁰ m²/s) y
            por eso da un clearance menor para la B12. La diferencia es real y tiene explicación: el
            Cuprophane que midió Colton es <b>2,74× más permeable a la urea</b> que la membrana
            genérica de la consigna, así que el mismo soluto rinde más en él.
          </p>
        </div>

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
                <th scope="col">Origen de D</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} data-current={r.id === s.soluteId}>
                  <td>{r.name}</td>
                  <td>{r.mw.toLocaleString('es-AR')}</td>
                  <td>
                    {sci(r.dWater, 2)}
                    {r.dWaterAcc && <span className="acc">± {r.dWaterAcc} %</span>}
                    {r.dWaterKind === 'correlación' && <span className="flagmark">correlación</span>}
                    {!r.dWaterSrc && <span className="flagmark">sin fuente</span>}
                  </td>
                  <td>
                    {sci(r.D, 2)}
                    {!r.anchor && !r.medido && <span className="flagmark">estimado</span>}
                  </td>
                  <td>{r.cl < 0.005 ? sci(r.cl, 2) : num(r.cl, 2)}</td>
                  <td className="table__delta">{r.cl / urea.cl < 0.001 ? sci(r.cl / urea.cl, 2) : num(r.cl / urea.cl, 4)}</td>
                  <td className="table__delta">
                    {s.diffModel === 'colton' && r.dMemSrc ? r.dMemSrc : 'Estimado'}
                  </td>
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
          <b>Procedencia de los datos.</b> La Tabla I de Colton no involucra membranas: son
          difusividades en solución libre (salina isotónica, 37 °C). Distingue por columnas si el
          valor fue medido, tomado de literatura o estimado por correlación, y declara la precisión
          de cada uno. El de la Vitamina B12 <b>no fue medido</b>: es una estimación por la
          correlación de Polson con ± 15 % declarado. Fosfato y β₂-microglobulina no figuran en ese
          trabajo y están cargados como valores típicos sin verificar.
          La difusividad de la urea <i>en la membrana</i> es la que da la consigna, no Colton: lo
          que aporta el paper es la resistencia de cada soluto (Tabla III, Cuprophane PT-150,
          37 °C), cuyo cociente contra la urea permite derivar las demás. La resistencia de la
          albúmina se midió a 27 °C (Tabla V), no a 37 como el resto.
        </p>

        <p className="figure__note">
          Colton, C. K., Smith, K. A., Merrill, E. W. &amp; Farrell, P. C. (1971).{' '}
          <i>Permeability Studies with Cellulosic Membranes</i>. Journal of Biomedical Materials
          Research, 5(6), 459–488.
        </p>
      </div>
    </section>
  )
}
