import Chart from './Chart.jsx'
import { areaForClearance, sweepArea } from '../lib/model.js'
import { num } from '../lib/format.js'

/** Paso 3 — Desafío de optimización: qué área hace falta para el objetivo. */
export default function StepArea({ s, set, derived }) {
  const D = derived.D
  const L = s.L_um * 1e-6
  const factor = derived.factor
  const needed = areaForClearance({ targetMlMin: s.targetMlMin, D, L, factor })
  const curve = sweepArea({ D, L, factor, to: Math.max(2.5, Math.min(needed * 1.35, 40)) })

  return (
    <section className="step" id="paso-3">
      <p className="step__eyebrow">Desarrollo · Paso 3</p>
      <h2 className="step__title">Desafío de optimización</h2>
      <p className="step__intro">
        Manteniendo el espesor en {num(s.L_um, 1)} µm, ¿qué área de membrana hace falta para
        alcanzar el clearance objetivo? El despeje es directo: <b>A = Cl · L / D</b>.
      </p>

      <div className="step__body">
        <div className="target">
          <div className="target__field">
            <span className="target__label">Clearance objetivo</span>
            <input
              className="target__input"
              type="number"
              min="10"
              max="600"
              step="5"
              value={s.targetMlMin}
              onChange={(e) => set.targetMlMin(Number(e.target.value) || 10)}
              aria-label="Clearance objetivo en mL/min"
            />
          </div>

          <span className="target__arrow" aria-hidden="true">→</span>

          <div className="target__field">
            <span className="target__label">Área necesaria</span>
            <span className="target__answer">
              {num(needed, 3)}<small>m²</small>
            </span>
          </div>

          <button type="button" className="target__apply" onClick={() => set.A_m2(Number(needed.toFixed(2)))}>
            Aplicar al simulador
          </button>
        </div>

        <Chart
          points={curve}
          marker={{ x: s.A_m2, y: derived.clMlMin, label: `${num(s.A_m2, 2)} m² · ${num(derived.clMlMin, 0)} mL/min` }}
          target={{ y: s.targetMlMin, label: `objetivo ${num(s.targetMlMin, 0)} mL/min` }}
          xLabel="Área A (m²)"
          yLabel="Cl (mL/min)"
          title={`Clearance vs. área · L = ${num(s.L_um, 1)} µm`}
          filename="clearance-vs-area"
          fmtX={(v) => num(v, 1)}
          fmtY={(v) => num(v, 0)}
          caption="<b>Figura 3.</b> La relación es lineal y pasa por el origen, con pendiente <code>D/L</code>. Para alcanzar 150 mL/min manteniendo L = 50 µm se necesitan 1,25 m² de membrana. A diferencia del espesor, duplicar el área duplica el clearance sin rendimientos decrecientes."
        />
      </div>
    </section>
  )
}
