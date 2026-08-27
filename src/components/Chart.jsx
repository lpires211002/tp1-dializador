import { useRef } from 'react'
import { P } from '../lib/palette.js'
import { svgToPng } from '../lib/exportPng.js'

const W = 720
const H = 380
const PAD = { t: 22, r: 26, b: 48, l: 66 }

/** Ticks "redondos" dentro de un dominio. */
function ticks(min, max, count = 5) {
  const raw = (max - min) / count
  const mag = 10 ** Math.floor(Math.log10(raw))
  const norm = raw / mag
  const step = (norm >= 5 ? 10 : norm >= 2 ? 5 : norm >= 1 ? 2 : 1) * mag
  const out = []
  for (let v = Math.ceil(min / step) * step; v <= max + step * 1e-9; v += step) {
    out.push(Number(v.toFixed(10)))
  }
  return out
}

/**
 * Gráfico de línea. Una sola serie, reglas finas, marcador que sigue el estado
 * actual del simulador. Sin librería: así el PNG exportado es idéntico a lo
 * que se ve en pantalla.
 */
export default function Chart({
  points,
  xLabel,
  yLabel,
  marker,
  target,
  filename = 'grafico',
  title,
  caption,
  fmtX = (v) => String(v),
  fmtY = (v) => String(v)
}) {
  const svgRef = useRef(null)

  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const x0 = Math.min(...xs)
  const x1 = Math.max(...xs)
  const y0 = 0
  const y1 = Math.max(...ys, target?.y ?? 0, marker?.y ?? 0) * 1.08

  const px = (x) => PAD.l + ((x - x0) / (x1 - x0 || 1)) * (W - PAD.l - PAD.r)
  const py = (y) => H - PAD.b - ((y - y0) / (y1 - y0 || 1)) * (H - PAD.t - PAD.b)

  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${px(p.x).toFixed(2)} ${py(p.y).toFixed(2)}`).join(' ')
  const area = `${d} L ${px(x1).toFixed(2)} ${py(0).toFixed(2)} L ${px(x0).toFixed(2)} ${py(0).toFixed(2)} Z`

  return (
    <figure className="figure">
      <div className="figure__frame">
        <div className="figure__head">
          <span className="figure__title">{title}</span>
          <button type="button" className="pngbtn" onClick={() => svgToPng(svgRef.current, filename)}>
            Descargar PNG
          </button>
        </div>

        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label={`${title}. ${caption ?? ''}`}>
          <defs>
            <linearGradient id={`fill-${filename}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={P.accent} stopOpacity="0.16" />
              <stop offset="100%" stopColor={P.accent} stopOpacity="0" />
            </linearGradient>
          </defs>

          {ticks(y0, y1).map((t) => (
            <g key={`y${t}`}>
              <line x1={PAD.l} y1={py(t)} x2={W - PAD.r} y2={py(t)} stroke={P.rule} strokeWidth="1" />
              <text x={PAD.l - 12} y={py(t) + 4} textAnchor="end" fontSize="11.5" fill={P.ink3}>
                {fmtY(t)}
              </text>
            </g>
          ))}

          {ticks(x0, x1).map((t) => (
            <text key={`x${t}`} x={px(t)} y={H - PAD.b + 22} textAnchor="middle" fontSize="11.5" fill={P.ink3}>
              {fmtX(t)}
            </text>
          ))}

          <line x1={PAD.l} y1={H - PAD.b} x2={W - PAD.r} y2={H - PAD.b} stroke={P.ruleStrong} strokeWidth="1" />
          <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={H - PAD.b} stroke={P.ruleStrong} strokeWidth="1" />

          <path d={area} fill={`url(#fill-${filename})`} />
          <path d={d} fill="none" stroke={P.accentDeep} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />

          {target && (
            <g>
              <line
                x1={PAD.l} y1={py(target.y)} x2={W - PAD.r} y2={py(target.y)}
                stroke={P.deep} strokeWidth="1.4" strokeDasharray="5 4"
              />
              <text x={W - PAD.r} y={py(target.y) - 9} textAnchor="end" fontSize="11.5" fill={P.deep} fontWeight="500">
                {target.label}
              </text>
            </g>
          )}

          {marker && (
            <g>
              <line x1={px(marker.x)} y1={py(marker.y)} x2={px(marker.x)} y2={H - PAD.b} stroke={P.accent} strokeWidth="1" strokeDasharray="3 3" />
              <circle cx={px(marker.x)} cy={py(marker.y)} r="6.5" fill={P.paper} stroke={P.accentDeep} strokeWidth="2.5" />
              <text
                x={px(marker.x) + (px(marker.x) > W * 0.66 ? -13 : 13)}
                y={py(marker.y) - 12}
                textAnchor={px(marker.x) > W * 0.66 ? 'end' : 'start'}
                fontSize="12.5"
                fill={P.ink}
                fontWeight="500"
              >
                {marker.label}
              </text>
            </g>
          )}

          <text x={W - PAD.r} y={H - 8} textAnchor="end" fontSize="11" fill={P.ink2} letterSpacing="0.08em">
            {xLabel}
          </text>
          <text x={PAD.l - 12} y={PAD.t - 6} textAnchor="end" fontSize="11" fill={P.ink2} letterSpacing="0.08em">
            {yLabel}
          </text>
        </svg>
      </div>
      {caption && <figcaption dangerouslySetInnerHTML={{ __html: caption }} />}
    </figure>
  )
}
