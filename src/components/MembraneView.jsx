import { useEffect, useRef, useState } from 'react'

/**
 * MembraneView — corte transversal vivo de la membrana.
 *
 * Panel superior: la geometría física. El espesor del polímero cambia a escala
 * cuando se mueve L, y las partículas cruzan a velocidad proporcional a J.
 * Panel inferior: el perfil C(x) que el modelo asume — plano en sangre, rampa
 * lineal a través del polímero, cero en el dializado. Los dos paneles comparten
 * el eje x, así se ve que la pendiente de la rampa ES el gradiente de Fick.
 */

const W = 760
const H = 348
const SCENE_TOP = 34
const SCENE_BOT = 180
const PROF_TOP = 232
const PROF_BOT = 330
const L_MIN = 10
const L_MAX = 150
const PX_MIN = 26
const PX_MAX = 210

const bandWidth = (Lum) => {
  const t = (Math.min(Math.max(Lum, L_MIN), L_MAX) - L_MIN) / (L_MAX - L_MIN)
  return PX_MIN + t * (PX_MAX - PX_MIN)
}

export default function MembraneView({ L_um, J, C, Cd = 0, soluteName }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(0)
  const particlesRef = useRef([])
  const [reduced, setReduced] = useState(false)

  const memW = bandWidth(L_um)
  const memX = (W - memW) / 2
  const memEnd = memX + memW

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])

  // Estado vivo leído por el bucle de animación sin re-suscribirlo en cada frame.
  const liveRef = useRef({ J, memX, memEnd })
  liveRef.current = { J, memX, memEnd }

  useEffect(() => {
    if (reduced) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = W * dpr
    canvas.height = (SCENE_BOT - SCENE_TOP) * dpr
    ctx.scale(dpr, dpr)

    if (particlesRef.current.length === 0) {
      particlesRef.current = Array.from({ length: 30 }, () => ({
        x: Math.random() * W,
        y: 12 + Math.random() * (SCENE_BOT - SCENE_TOP - 24),
        r: 1.6 + Math.random() * 1.5,
        jitter: Math.random() * Math.PI * 2
      }))
    }

    let last = performance.now()
    const frame = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const { J: jNow, memX: mx, memEnd: me } = liveRef.current
      // Velocidad relativa al caso base del TP (J = 1e-5 mol/m²·s).
      const speed = Math.min(Math.max(jNow / 1e-5, 0.12), 4.2) * 74

      ctx.clearRect(0, 0, W, SCENE_BOT - SCENE_TOP)
      for (const p of particlesRef.current) {
        // Dentro del polímero el avance es más lento: es difusión, no flujo.
        const inMembrane = p.x > mx && p.x < me
        p.x += speed * dt * (inMembrane ? 0.42 : 1)
        p.jitter += dt * 3
        if (p.x > W + 8) {
          p.x = -8
          p.y = 12 + Math.random() * (SCENE_BOT - SCENE_TOP - 24)
        }
        const wobble = Math.sin(p.jitter) * (inMembrane ? 0.7 : 1.8)
        // Se van "gastando" hacia la derecha: la concentración cae.
        const alpha = p.x < mx ? 0.85 : p.x > me ? 0.3 : 0.85 - 0.55 * ((p.x - mx) / Math.max(me - mx, 1))
        ctx.beginPath()
        ctx.arc(p.x, p.y + wobble, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(15, 164, 127, ${alpha})`
        ctx.fill()
      }
      rafRef.current = requestAnimationFrame(frame)
    }
    rafRef.current = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(rafRef.current)
  }, [reduced])

  // El eje vertical va de 0 (abajo) a C (arriba). Si el dializado no está en
  // cero, la rampa termina en la altura de Cd y el gradiente es menor.
  const yFor = (c) => PROF_BOT - (C > 0 ? c / C : 0) * (PROF_BOT - PROF_TOP)
  const yEnd = yFor(Math.min(Cd, C))
  const profile = `M 0 ${PROF_TOP} L ${memX} ${PROF_TOP} L ${memEnd} ${yEnd} L ${W} ${yEnd}`
  const profileFill = `${profile} L ${W} ${PROF_BOT} L 0 ${PROF_BOT} Z`

  return (
    <div className="membrane">
      <div className="membrane__stack">
        <svg
          className="membrane__svg"
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Corte de la membrana con espesor ${L_um} micrómetros. Perfil de concentración lineal desde ${C} milimolar en sangre hasta cero en el dializado.`}
        >
          <defs>
            <linearGradient id="mv-blood" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0fa47f" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#0fa47f" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="mv-ramp" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0fa47f" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0fa47f" stopOpacity="0.02" />
            </linearGradient>
            <pattern id="mv-fiber" width="7" height="7" patternUnits="userSpaceOnUse">
              <rect width="7" height="7" fill="#0d323f" />
              <path d="M0 0 L0 7" stroke="#1d4b5c" strokeWidth="1.6" />
            </pattern>
          </defs>

          {/* Rótulos de compartimento */}
          <text className="mv-tag" x="0" y="20">SANGRE · C = {C} mM</text>
          <text className="mv-tag mv-tag--mid" x={memX + memW / 2} y="20" textAnchor="middle">MEMBRANA</text>
          <text className="mv-tag" x={W} y="20" textAnchor="end">
            DIALIZADO · C = {Cd > 0 ? `${String(Cd).replace('.', ',')} mM` : '0'}
          </text>

          {/* Compartimentos */}
          <rect x="0" y={SCENE_TOP} width={memX} height={SCENE_BOT - SCENE_TOP} fill="url(#mv-blood)" />
          <rect x={memEnd} y={SCENE_TOP} width={W - memEnd} height={SCENE_BOT - SCENE_TOP} fill="#e3ece9" opacity="0.55" />
          <rect
            x={memX}
            y={SCENE_TOP}
            width={memW}
            height={SCENE_BOT - SCENE_TOP}
            fill="url(#mv-fiber)"
            style={{ transition: 'x 260ms cubic-bezier(.22,.61,.36,1), width 260ms cubic-bezier(.22,.61,.36,1)' }}
          />

          {/* Cota del espesor */}
          <g className="mv-dim" style={{ transition: 'transform 260ms cubic-bezier(.22,.61,.36,1)' }}>
            <line x1={memX} y1="192" x2={memEnd} y2="192" />
            <line x1={memX} y1="186" x2={memX} y2="198" />
            <line x1={memEnd} y1="186" x2={memEnd} y2="198" />
            <text className="mv-dimtext" x={memX + memW / 2} y="213" textAnchor="middle">
              L = {L_um} µm
            </text>
          </g>

          {/* Perfil de concentración */}
          <text className="mv-axis" x="0" y={PROF_TOP - 12}>C(x)</text>
          <line className="mv-rule" x1="0" y1={PROF_BOT} x2={W} y2={PROF_BOT} />
          <path d={profileFill} fill="url(#mv-ramp)" style={{ transition: 'd 260ms' }} />
          <path className="mv-profile" d={profile} style={{ transition: 'd 260ms' }} />
          <line className="mv-guide" x1={memX} y1={PROF_TOP - 6} x2={memX} y2={PROF_BOT + 6} />
          <line className="mv-guide" x1={memEnd} y1={PROF_TOP - 6} x2={memEnd} y2={PROF_BOT + 6} />
          {Cd > 0 && (
            <>
              <line className="mv-guide" x1="0" y1={PROF_BOT} x2={W} y2={PROF_BOT} />
              <text className="mv-tag" x={W} y={yEnd - 8} textAnchor="end">
                gradiente reducido · ΔC = {String(Math.round((C - Cd) * 10) / 10).replace('.', ',')} mM
              </text>
            </>
          )}
          <text className="mv-slope" x={memX + memW / 2} y={PROF_TOP + (PROF_BOT - PROF_TOP) / 2 - 8} textAnchor="middle">
            dC/dx
          </text>
        </svg>

        {!reduced && (
          <canvas
            ref={canvasRef}
            className="membrane__canvas"
            aria-hidden="true"
            style={{ top: `${(SCENE_TOP / H) * 100}%`, height: `${((SCENE_BOT - SCENE_TOP) / H) * 100}%` }}
          />
        )}
      </div>

      <p className="membrane__caption">
        El polímero se dibuja a escala: al mover <b>L</b> la pared cambia de ancho y la rampa de{' '}
        <b>C(x)</b> cambia de pendiente. Esa pendiente es <code>dC/dx</code>, y su producto por{' '}
        <b>D</b> es el flujo. Las partículas de {soluteName.toLowerCase()} cruzan a velocidad
        proporcional a <b>J</b>. Si subís la concentración del dializado, la rampa deja de bajar
        hasta cero y el gradiente se achica.
      </p>
    </div>
  )
}
