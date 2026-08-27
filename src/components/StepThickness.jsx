import Chart from './Chart.jsx'
import Note from './Note.jsx'
import { clearanceMlMin, sweepThickness } from '../lib/model.js'
import { num } from '../lib/format.js'

const FIXED = [25, 50, 75, 100]

/** Paso 2 — Análisis de sensibilidad al espesor, con área fija. */
export default function StepThickness({ s, set, derived }) {
  const D = derived.D
  const A = s.A_m2
  const factor = derived.factor

  const rows = [...FIXED, s.fifthL]
    .map((L) => ({ L, cl: clearanceMlMin({ D, A, L: L * 1e-6, factor }), editable: !FIXED.includes(L) && L === s.fifthL }))
    .sort((a, b) => a.L - b.L)

  const ref = clearanceMlMin({ D, A, L: 50e-6, factor })
  const curve = sweepThickness({ D, A, factor })

  return (
    <section className="step" id="paso-2">
      <p className="step__eyebrow">Desarrollo · Paso 2</p>
      <h2 className="step__title">Sensibilidad al espesor</h2>
      <p className="step__intro">
        Con el área fija en {num(A, 2)} m², el clearance depende sólo de <i>L</i>. La consigna pide
        una tabla de cinco datos pero enumera cuatro espesores: la quinta fila es editable para que
        elijas el valor que quieras justificar en el informe.
      </p>

      <div className="step__body">
        <div className="scroller">
          <table className="table">
            <caption>Clearance de {s.soluteName.toLowerCase()} en función del espesor · A = {num(A, 2)} m²</caption>
            <thead>
              <tr>
                <th scope="col">Espesor L</th>
                <th scope="col">Clearance</th>
                <th scope="col">Relativo a 50 µm</th>
                <th scope="col">Lectura</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.L} data-current={Math.abs(r.L - s.L_um) < 0.5} data-base={r.L === 50}>
                  <td>
                    {r.editable ? (
                      <input
                        className="table__input"
                        type="number"
                        min="5"
                        max="400"
                        step="5"
                        value={s.fifthL}
                        onChange={(e) => set.fifthL(Number(e.target.value) || 5)}
                        aria-label="Quinto espesor, editable"
                      />
                    ) : (
                      num(r.L, 0)
                    )}
                    {' µm'}
                  </td>
                  <td>{num(r.cl, 2)} mL/min</td>
                  <td className="table__delta">×&thinsp;{num(r.cl / ref, 2)}</td>
                  <td className="table__delta">
                    {r.L === 50 ? 'Parámetro del Anexo I' : r.cl > ref ? 'Más fina, más depura' : 'Más gruesa, menos depura'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="step__figure">
          <Chart
            points={curve}
            marker={{ x: s.L_um, y: derived.clMlMin, label: `${num(s.L_um, 0)} µm · ${num(derived.clMlMin, 0)} mL/min` }}
            xLabel="Espesor L (µm)"
            yLabel="Cl (mL/min)"
            title={`Clearance vs. espesor · A = ${num(A, 2)} m²`}
            filename="clearance-vs-espesor"
            fmtX={(v) => num(v, 0)}
            fmtY={(v) => num(v, 0)}
            caption="La relación es <b>hiperbólica</b>, no lineal: <code>Cl ∝ 1/L</code>. Duplicar el espesor no resta una cantidad fija de clearance, lo parte a la mitad. Por eso el rendimiento se degrada rápido al engrosar la pared y mejora con rendimientos decrecientes al afinarla."
          />
        </div>

        <Note label="Lo que el modelo no ve">
          La curva sugiere que afinando la membrana el clearance crece sin techo, y no es así. En un
          dializador real el clearance está acotado por el <b>caudal de sangre</b>: no se puede
          depurar más sangre por minuto que la que entra al cartucho. Además, menos espesor es
          <b> menos resistencia mecánica</b> frente a la presión transmembrana, y una fibra que
          colapsa o se rompe es una falla clínica. Ese compromiso entre transporte y resistencia
          es el argumento de biomaterial que cierra el objetivo del TP.
        </Note>
      </div>
    </section>
  )
}
