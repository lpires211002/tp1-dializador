import { useState } from 'react'
import Field from './Field.jsx'
import Panel from './Panel.jsx'
import { SOLUTES } from '../lib/solutes.js'
import { num, sci } from '../lib/format.js'

/**
 * Consola de control. Queda fija mientras se recorre el documento y cada
 * bloque se pliega, para que entre entera en una pantalla sin hacer scroll.
 */
export default function Console({ s, set, reset, derived }) {
  const { clMlMin, clSI, J, mDot, D } = derived
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className="console" aria-label="Panel de control de la simulación">
      <div className="console__panel readout">
        <p className="console__legend">Clearance</p>
        <strong className="readout__value">{num(clMlMin, 1)}</strong>
        <span className="readout__unit">mL/min · {s.soluteName}</span>

        <div className="readout__grid">
          <div className="readout__row">
            <span className="readout__k">Flujo de masa <i>J</i></span>
            <span className="readout__v">{sci(J)} mol/m²·s</span>
          </div>
          <div className="readout__row">
            <span className="readout__k">Flujo total <i>ṁ</i></span>
            <span className="readout__v">{sci(mDot)} mol/s</span>
          </div>
          <div className="readout__row">
            <span className="readout__k">Clearance (SI)</span>
            <span className="readout__v">{sci(clSI)} m³/s</span>
          </div>
          <div className="readout__row">
            <span className="readout__k">Difusividad <i>D</i></span>
            <span className="readout__v">{sci(D, 3)} m²/s</span>
          </div>
        </div>

        <button
          type="button"
          className="readout__collapse"
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((v) => !v)}
        >
          {collapsed ? 'Mostrar controles' : 'Ocultar controles'}
        </button>
      </div>

      {!collapsed && (
        <>
          <Panel legend="Soluto" summary={s.soluteName} defaultOpen={false}>
            <div className="picker">
              {SOLUTES.map((sol) => (
                <button
                  key={sol.id}
                  type="button"
                  className="picker__opt"
                  aria-pressed={s.soluteId === sol.id}
                  onClick={() => set.soluteId(sol.id)}
                >
                  {sol.name}
                  <span className="picker__mw">{sol.mw.toLocaleString('es-AR')} g/mol · {sol.clase}</span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel legend="Geometría de la membrana" summary={`L ${num(s.L_um, 1)} µm · A ${num(s.A_m2, 2)} m²`}>
            <Field
              symbol="L" name="Espesor"
              value={s.L_um} display={`${num(s.L_um, 1)} µm`}
              min={10} max={150} step={0.5}
              onChange={set.L_um} scale={['10 µm', '150 µm']}
            />
            <Field
              symbol="A" name="Área"
              value={s.A_m2} display={`${num(s.A_m2, 2)} m²`}
              min={0.1} max={2.5} step={0.01}
              onChange={set.A_m2} scale={['0,10 m²', '2,50 m²']}
            />
          </Panel>

          <Panel
            legend="Condiciones"
            summary={`C ${num(s.C_mM, 1)} · Cd ${num(s.Cd_mM, 1)} mM`}
            defaultOpen={false}
          >
            <Field
              symbol="C" name="Soluto en sangre"
              value={s.C_mM} display={`${num(s.C_mM, 1)} mM`}
              min={1} max={30} step={0.5}
              onChange={set.C_mM} scale={['1 mM', '30 mM']}
            />
            <Field
              symbol="Cd" name="Soluto en el dializado"
              value={s.Cd_mM} display={`${num(s.Cd_mM, 1)} mM`}
              min={0} max={s.C_mM} step={0.1}
              onChange={set.Cd_mM} scale={['0 · Anexo I', `${num(s.C_mM, 1)} mM · sin gradiente`]}
            />
            <Field
              symbol="D" name="Difusividad de la urea"
              value={s.dUreaMem * 1e10} display={`${num(s.dUreaMem * 1e10, 2)} × 10⁻¹⁰ m²/s`}
              min={0.2} max={5} step={0.05}
              onChange={(v) => set.dUreaMem(v * 1e-10)} scale={['0,2', '5,0']}
            />
          </Panel>

          <div className="console__panel">
            <button type="button" className="reset" onClick={reset}>
              Volver a los datos de cátedra
            </button>
          </div>
        </>
      )}
    </aside>
  )
}
