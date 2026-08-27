import { useMemo, useState } from 'react'
import Console from './components/Console.jsx'
import StepBase from './components/StepBase.jsx'
import StepThickness from './components/StepThickness.jsx'
import StepArea from './components/StepArea.jsx'
import StepCutoff from './components/StepCutoff.jsx'
import StepReal from './components/StepReal.jsx'
import { getSolute } from './lib/solutes.js'
import { clearance, clearanceMlMin, flux, gradientFactor, massRate, membraneDiffusivity } from './lib/model.js'

/** Parámetros iniciales del Anexo I. El botón de reset vuelve exactamente acá. */
const INITIAL = {
  L_um: 50,
  A_m2: 1,
  C_mM: 5,
  Cd_mM: 0,
  dUreaMem: 1e-10,
  soluteId: 'urea',
  diffModel: 'colton',
  rPore: 2,
  targetMlMin: 150,
  fifthL: 150
}

export default function App() {
  const [st, setSt] = useState(INITIAL)

  const set = useMemo(() => {
    const make = (key) => (value) => setSt((p) => ({ ...p, [key]: value }))
    return Object.fromEntries(Object.keys(INITIAL).map((k) => [k, make(k)]))
  }, [])

  const solute = getSolute(st.soluteId)

  const derived = useMemo(() => {
    const L = st.L_um * 1e-6
    const D = solute.anchor && st.diffModel !== 'renkin'
      ? st.dUreaMem
      : membraneDiffusivity(solute, {
          model: st.diffModel,
          rPore: st.rPore,
          dUreaMem: st.dUreaMem
        })

    const factor = gradientFactor({ C: st.C_mM, Cd: st.Cd_mM })

    return {
      D,
      factor,
      J: flux({ D, C: st.C_mM, L, Cd: st.Cd_mM }),
      mDot: massRate({ D, C: st.C_mM, L, A: st.A_m2, Cd: st.Cd_mM }),
      clSI: clearance({ D, A: st.A_m2, L }) * factor,
      clMlMin: clearanceMlMin({ D, A: st.A_m2, L, factor })
    }
  }, [st, solute])

  const s = { ...st, soluteName: solute.name }

  return (
    <div className="shell">
      <header className="masthead">
        <p className="masthead__kicker">
          <span>ITBA · Ciencias de la Vida</span>
          <span>Órganos Artificiales</span>
          <span>TP N°1</span>
        </p>
        <h1 className="masthead__title">
          Diseño y simulación del rendimiento de un <em>dializador</em>
        </h1>
        <p className="masthead__lede">
          Un simulador de la transferencia de masa a través de una membrana polimérica. Mové los
          parámetros del panel y todo el documento se recalcula: la tabla, los gráficos y el corte
          de la membrana responden al mismo modelo.
        </p>
        <div className="masthead__law">
          <span className="masthead__eq">
            <b>Cl</b> = D · A / L
          </span>
          <span className="masthead__eqnote">
            Primera Ley de Fick · estado estacionario · gradiente lineal · sin convección
          </span>
        </div>
      </header>

      <Console s={s} set={set} reset={() => setSt(INITIAL)} derived={derived} />

      <main>
        <StepBase s={s} derived={derived} />
        <StepThickness s={s} set={set} derived={derived} />
        <StepArea s={s} set={set} derived={derived} />
        <StepCutoff s={s} set={set} derived={derived} />
        <StepReal s={s} derived={derived} />
      </main>

      <footer className="colophon">
        <span>TP N°1 · Diseño y Simulación del Rendimiento de un Dializador</span>
        <span>Modelo del Anexo I · Ratner &amp; Hoffman, Biomaterials Science (2020)</span>
      </footer>
    </div>
  )
}
