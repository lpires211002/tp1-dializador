import { useState } from 'react'
import { DIALYZERS, QB_REF, QD_REF } from '../lib/dialyzers.js'
import { clearanceMlMin } from '../lib/model.js'
import { num } from '../lib/format.js'

/**
 * Anexo opcional — contraste contra dializadores comerciales.
 * No forma parte de los cuatro puntos de la consigna, así que viene plegado.
 */
export default function StepReal({ s, derived }) {
  const [open, setOpen] = useState(false)
  const L = s.L_um * 1e-6

  const rows = DIALYZERS.map((d) => {
    const modelo = clearanceMlMin({ D: derived.D, A: d.area, L, factor: derived.factor })
    return { ...d, modelo, ratio: d.ureaApprox / modelo }
  })

  return (
    <section className="step step--anexo" id="anexo">
      <h2 className="anexo__head">
        <button
          type="button"
          className="anexo__toggle"
          aria-expanded={open}
          aria-controls="anexo-cuerpo"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="anexo__labels">
            <span className="anexo__eyebrow">Anexo opcional · fuera de la consigna</span>
            <span className="anexo__title">Qué dice un dializador real</span>
          </span>
          <span className="anexo__action">{open ? 'Ocultar' : 'Ver'}</span>
          <svg className="anexo__chev" viewBox="0 0 12 12" width="13" height="13" aria-hidden="true">
            <path d="M2.5 4.5 L6 8 L9.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </h2>

      <div className="anexo__body" id="anexo-cuerpo" hidden={!open}>
        <p className="step__intro">
          El modelo evaluado al área real de cada cartucho, comparado contra el clearance publicado
          a Qb = {QB_REF} y Qd = {QD_REF} mL/min.
        </p>

        <div className="step__body">
          <div className="real">
            <div className="realrow realrow--head">
              <span className="realcell">Dializador</span>
              <span className="realcell">Área</span>
              <span className="realcell">Cl urea publicado</span>
              <span className="realcell">Modelo a esa área</span>
            </div>
            {rows.map((d) => (
              <div className="realrow" key={d.id}>
                <span className="realcell realcell--name">
                  {d.maker} {d.name}
                  <span className="realcell--sub">{d.material} · {d.flux}</span>
                </span>
                <span className="realcell">{num(d.area, 2)} m²</span>
                <span className="realcell">
                  ≈ {d.ureaApprox}<span className="flagmark">verificar</span>
                </span>
                <span className="realcell realcell--gap">
                  {num(d.modelo, 0)} <span className="realcell--sub">×{num(d.ratio, 2)} por debajo</span>
                </span>
              </div>
            ))}
          </div>

          <p className="figure__note">
            Evaluado al área de cartuchos comerciales, el modelo queda por debajo del clearance
            publicado. La diferencia se debe a que no contempla el aporte convectivo ni el flujo en
            contracorriente, y a que la difusividad real del polímero no tiene por qué ser
            1×10⁻¹⁰ m²/s. El modelo difusivo puro da una cota inferior del rendimiento.
          </p>

          <p className="figure__note figure__note--flag">
            Clearances de referencia aproximados. Verificar contra el data sheet oficial antes de
            citarlos.
          </p>
        </div>
      </div>
    </section>
  )
}
