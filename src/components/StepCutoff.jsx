import Note from './Note.jsx'
import Field from './Field.jsx'
import { SOLUTES } from '../lib/solutes.js'
import {
  clearanceMlMin,
  membraneDiffusivity,
  stokesEinsteinFactor,
  effectivePorosity
} from '../lib/model.js'
import { num, sci } from '../lib/format.js'

const MODELS = [
  {
    id: 'stokes',
    name: 'Escalado Stokes–Einstein',
    desc: 'D ∝ M^(−1/3) desde la urea. Sólo tamaño molecular.'
  },
  {
    id: 'renkin',
    name: 'Difusión estorbada (Renkin)',
    desc: 'Suma exclusión estérica e impedimento en el poro.'
  },
  {
    id: 'manual',
    name: 'Valor de bibliografía',
    desc: 'El D que encuentres y puedas citar.'
  }
]

/** Paso 4 — Cálculo de eficiencia y cut-off de la membrana. */
export default function StepCutoff({ s, set, derived }) {
  const opts = { model: s.diffModel, rPore: s.rPore, dUreaMem: s.dUreaMem, manual: s.manualD }
  const L = s.L_um * 1e-6

  const rows = SOLUTES.map((sol) => {
    const D = sol.anchor && s.diffModel !== 'renkin' ? s.dUreaMem : membraneDiffusivity(sol, opts)
    return { ...sol, D, cl: clearanceMlMin({ D, A: s.A_m2, L, factor: derived.factor }) }
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
        La consigna pide el clearance de la Vitamina B12 y la explicación de por qué es tanto menor
        que el de la urea. Como <code>Cl = D·A/L</code> y la geometría es la misma para todos los
        solutos, el cociente de clearances <b>es exactamente el cociente de difusividades</b>. Todo
        el problema se reduce a estimar <i>D</i>.
      </p>

      <div className="step__body">
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
              La porosidad/tortuosidad efectiva se despeja del anclaje de la urea, así el modelo
              nunca contradice el dato de la cátedra: <b>ε/τ = {num(epsTau, 3)}</b>. Mové el radio y
              mirá cómo se desploma la β₂-microglobulina antes que la B12.
            </p>
          </div>
        )}

        {s.diffModel === 'manual' && (
          <div className="target">
            <div className="target__field">
              <span className="target__label">D de {s.soluteName} en la membrana (× 10⁻¹² m²/s)</span>
              <input
                className="target__input"
                type="number"
                min="0.01"
                max="1000"
                step="0.5"
                value={Number((s.manualD * 1e12).toFixed(3))}
                onChange={(e) => set.manualD((Number(e.target.value) || 0.01) * 1e-12)}
                aria-label="Difusividad manual en la membrana"
              />
            </div>
            <p className="poro__note">
              Cargá acá el valor que encuentres en bibliografía. Anotá la fuente, el polímero y la
              temperatura: son los tres datos que hacen citable un coeficiente de difusión.
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
                {r.cl < 0.05 ? '< 0,05' : num(r.cl, r.cl < 10 ? 2 : 1)} <span>mL/min</span>
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
                <th scope="col">D en agua</th>
                <th scope="col">D en membrana</th>
                <th scope="col">Cl</th>
                <th scope="col">Cl / Cl urea</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} data-current={r.id === s.soluteId}>
                  <td>{r.name}</td>
                  <td>{r.mw.toLocaleString('es-AR')}</td>
                  <td>
                    {sci(r.dWater, 2)}
                    {!r.anchor && <span className="flagmark">verificar</span>}
                  </td>
                  <td>
                    {sci(r.D, 2)}
                    {!r.anchor && <span className="flagmark">estimado</span>}
                  </td>
                  <td>{r.cl < 0.05 ? '< 0,05' : num(r.cl, 2)}</td>
                  <td className="table__delta">{num(r.cl / urea.cl, 3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Note label="La respuesta que pide la consigna">
          El clearance de la B12 sale <b>{num(b12.cl, 1)} mL/min</b> contra{' '}
          <b>{num(urea.cl, 1)} mL/min</b> de la urea: un factor{' '}
          <b>{num(urea.cl / b12.cl, 1)}×</b>. La causa es puramente difusiva. Por{' '}
          Stokes–Einstein <code>D = k_B·T / (6πηr)</code>, y como el radio de una molécula compacta
          escala con <code>M^(1/3)</code>, resulta <code>D ∝ M^(−1/3)</code>. Con 1355 g/mol contra
          60,06, el factor es <code>(60,06/1355)^(1/3) = {num(stokesEinsteinFactor(1355), 3)}</code>:
          la B12 pesa 22 veces más pero difunde sólo ~3 veces más lento, porque la dependencia con
          la masa es débil.
        </Note>

        <Note label="Por qué eso no alcanza como explicación completa">
          El escalado por tamaño trata a la membrana como si fuera agua. No lo es: es un sólido con
          poros de radio finito. Cuando el soluto deja de ser despreciable frente al poro aparecen
          dos efectos que <b>no</b> están en Stokes–Einstein — la <b>exclusión estérica</b>, que le
          niega al centro de la molécula la corona exterior del poro, y el{' '}
          <b>impedimento hidrodinámico</b> de la pared cercana. Juntos hacen que la caída sea mucho
          más abrupta que <code>M^(−1/3)</code>.
          {s.diffModel === 'stokes' && (
            <>
              {' '}La falla se ve sola en la tabla de arriba: con escalado puro por tamaño, la{' '}
              <b>albúmina sale con {num(rows[rows.length - 1].cl, 1)} mL/min</b>, y eso es
              físicamente falso — una membrana que deja pasar albúmina es una membrana defectuosa.
            </>
          )}{' '}
          Probá el modelo de Renkin y movés el radio de poro: ahí aparece el <b>cut-off</b>, la
          albúmina cae a cero como corresponde, y se ve cuál es la propiedad de estructura que
          define si una membrana es low-flux o high-flux.
        </Note>

        <Note label="Antes de copiar cualquier número al informe" flag>
          El único coeficiente que da la cátedra es el de la urea. Todo valor marcado en ocre lo
          calculó este simulador a partir de ese anclaje, o es un valor típico de literatura cargado
          como punto de partida. <b>No son citas.</b> Buscá la fuente, verificá el polímero y la
          temperatura, cargá el valor en «Valor de bibliografía» y citá el paper. La consigna pide
          explícitamente investigar el coeficiente de difusión de la B12: ese es el punto.
        </Note>
      </div>
    </section>
  )
}
