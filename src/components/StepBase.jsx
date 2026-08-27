import MembraneView from './MembraneView.jsx'
import { num, sci } from '../lib/format.js'

const BASE = { L: 50, A: 1, C: 5, D: 1e-10, CL: 120 }

/** Paso 1 — Replicar el modelo base y verificar los 120 mL/min. */
export default function StepBase({ s, derived }) {
  const atBase =
    Math.abs(s.L_um - BASE.L) < 0.51 &&
    Math.abs(s.A_m2 - BASE.A) < 0.006 &&
    Math.abs(s.dUreaMem - BASE.D) < 2.6e-12 &&
    s.soluteId === 'urea'

  const ok = atBase && Math.abs(derived.clMlMin - BASE.CL) < 1.5

  return (
    <section className="step step--first" id="paso-1">
      <p className="step__eyebrow">Desarrollo · Paso 1</p>
      <h2 className="step__title">Replicar el modelo base</h2>
      <p className="step__intro">
        Con los parámetros del Anexo I —espesor de 50 µm y área de 1 m²— el clearance de urea
        tiene que dar aproximadamente 120 mL/min.
      </p>

      <div className="step__body">
        <div className="verify">
          <dl className="verify__list">
            <div className="verify__item">
              <dt>Concentración de urea en sangre</dt>
              <dd>{num(s.C_mM, 1)} mM</dd>
            </div>
            <div className="verify__item">
              <dt>Espesor de la membrana (L)</dt>
              <dd>{num(s.L_um, 1)} µm</dd>
            </div>
            <div className="verify__item">
              <dt>Área de la membrana (A)</dt>
              <dd>{num(s.A_m2, 2)} m²</dd>
            </div>
            <div className="verify__item">
              <dt>Coeficiente de difusión (D)</dt>
              <dd>{sci(derived.D, 2)} m²/s</dd>
            </div>
            <div className="verify__item">
              <dt>Flujo de masa (J)</dt>
              <dd>{sci(derived.J)} mol/(m²·s)</dd>
            </div>
            <div className="verify__item">
              <dt>Flujo total (ṁ)</dt>
              <dd>{sci(derived.mDot)} mol/s</dd>
            </div>
          </dl>

          <div className="verify__badge" data-ok={ok}>
            <span className="verify__badgelabel">{ok ? 'Resultado verificado' : 'Resultado actual'}</span>
            <span className="verify__badgevalue">{num(derived.clMlMin, 1)}</span>
            <span className="verify__badgehint">
              {ok ? 'mL/min · coincide con la consigna' : 'mL/min · fuera de los parámetros base'}
            </span>
          </div>
        </div>

        <MembraneView L_um={s.L_um} J={derived.J} C={s.C_mM} Cd={s.Cd_mM} soluteName={s.soluteName} />
      </div>
    </section>
  )
}
