import { DIALYZERS, QB_REF, QD_REF } from '../lib/dialyzers.js'
import { clearanceMlMin } from '../lib/model.js'
import { num } from '../lib/format.js'

/** Paso 5 — Contraste contra dializadores comerciales. */
export default function StepReal({ s, derived }) {
  const L = s.L_um * 1e-6
  const rows = DIALYZERS.map((d) => {
    const modelo = clearanceMlMin({ D: derived.D, A: d.area, L, factor: derived.factor })
    return { ...d, modelo, ratio: d.ureaApprox / modelo }
  })

  return (
    <section className="step" id="paso-5">
      <p className="step__eyebrow">Contraste · Datos de referencia</p>
      <h2 className="step__title">Qué dice un dializador real</h2>
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
          <b>Figura 5.</b> Evaluado al área de cartuchos comerciales, el modelo queda por debajo del
          clearance publicado. La diferencia se debe a que no contempla el aporte convectivo ni el
          flujo en contracorriente, y a que la difusividad real del polímero no tiene por qué ser
          1×10⁻¹⁰ m²/s. Concluimos que el modelo difusivo puro da una cota inferior del rendimiento.
        </p>

        <p className="figure__note figure__note--flag">
          Clearances de referencia aproximados. Verificar contra el data sheet oficial antes de
          citarlos.
        </p>
      </div>
    </section>
  )
}
