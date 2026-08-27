import Note from './Note.jsx'
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
        La consigna pide investigar valores típicos de clearance de urea en dializadores
        comerciales. Acá el modelo se evalúa al área real de cada cartucho, con el espesor y la
        difusividad que tenés cargados, y se compara contra el orden de magnitud publicado.
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

        <Note label="De dónde sale la diferencia">
          El modelo queda corto, y las razones son las hipótesis que la propia consigna enumera.
          Falta la <b>convección</b>: en hemodiálisis real hay ultrafiltración, y el soluto también
          es arrastrado por el solvente. Falta la <b>difusividad efectiva verdadera</b> del polímero
          comercial, que no tiene por qué ser 1×10⁻¹⁰. Y falta el efecto del{' '}
          <b>contracorriente</b>: el modelo asume dializado con concentración cero en todo el largo
          de la fibra, cuando en realidad el dializado se va cargando. Del otro lado, el modelo
          tampoco ve el techo: ningún dializador puede superar el caudal de sangre que lo atraviesa
          ({QB_REF} mL/min de referencia, con Qd = {QD_REF}).
        </Note>

        <Note label="Estos números necesitan tu fuente" flag>
          Los clearances de la tabla son valores aproximados cargados para dar escala, no citas.
          Cada fabricante publica su tabla en función de Qb, Qd y Qf. Descargá el data sheet del
          modelo que elijas, tomá el valor a Qb = {QB_REF} y Qd = {QD_REF} mL/min, y citá el
          documento con su fecha de revisión.
        </Note>
      </div>
    </section>
  )
}
