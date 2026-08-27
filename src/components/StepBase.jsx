import MembraneView from './MembraneView.jsx'
import Note from './Note.jsx'
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
        tiene que dar aproximadamente 120 mL/min. Es el control de que la cadena de unidades
        está bien armada antes de tocar nada.
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

        <Note label="Por qué el clearance no depende de la concentración">
          El flujo <b>ṁ = D·A·C/L</b> sí crece con la uremia del paciente, pero el clearance se
          define como <code>ṁ / C</code>, y ahí <b>C se cancela</b>: queda{' '}
          <code>Cl = D·A/L</code>. Movés el slider de concentración y vas a ver que <i>J</i> y{' '}
          <i>ṁ</i> cambian mientras el clearance no se mueve. El clearance es una propiedad de la
          membrana, no del paciente: mide cuánto volumen se depura, no cuánto soluto se extrae.
        </Note>

        <Note label="¿Está bien asumir el dializado en cero?">
          Es una <b>hipótesis de sumidero perfecto</b>, y es la que fija el Anexo I. No es que la
          concentración del dializado sea realmente nula —el líquido que sale del dializador lleva
          urea, por eso se descarta— sino que se supone que se renueva tan rápido que en cada punto
          de la membrana la ve como cero. La aproximación se sostiene porque el dializado corre a{' '}
          <b>Qd ≈ 500 mL/min contra Qb ≈ 300</b>, y en <b>contracorriente</b>: el dializado más
          limpio se cruza con la sangre más limpia, lo que mantiene el gradiente alto a lo largo de
          toda la fibra en vez de agotarlo. Aun así es un <b>límite optimista</b>: con dializado
          real el gradiente es <code>C − C_d</code> y el clearance cae en el factor{' '}
          <code>(1 − C_d/C)</code>. Movés el slider <i>C_d</i> en «Condiciones» y lo ves: la rampa
          del perfil deja de tocar el piso y el clearance baja proporcionalmente. Es un buen punto
          para mencionar en la discusión, porque muestra que entendiste que la hipótesis acota el
          resultado en vez de ser un dato.
        </Note>

        <Note label="El detalle de unidades que conviene explicitar">
          En el código del Anexo I la línea <code>C_sangre_mol_m3 = C_sangre_mM</code> no lleva
          factor de conversión, y está bien: <b>1 mM = 1 mmol/L = 1 mol/m³</b>. Conviene aclararlo
          en el informe, porque a simple vista parece un error y en realidad es la única
          equivalencia que hace que todo el cálculo cierre en SI.
        </Note>
      </div>
    </section>
  )
}
