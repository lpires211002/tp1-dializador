import { P } from './palette.js'

/**
 * Exporta un <svg> a PNG a 2× sobre fondo de papel, listo para pegar en el
 * informe. Serializa el nodo, lo pasa por un blob de imagen y lo pinta en un
 * canvas — sin dependencias.
 */
export function svgToPng(svgEl, filename) {
  if (!svgEl) return

  const clone = svgEl.cloneNode(true)
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

  const vb = (svgEl.getAttribute('viewBox') || '0 0 720 380').split(/\s+/).map(Number)
  const w = vb[2]
  const h = vb[3]
  clone.setAttribute('width', w)
  clone.setAttribute('height', h)

  // La tipografía del sistema no viaja en el blob: la fijamos explícitamente.
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
  style.textContent = `text{font-family:'IBM Plex Mono',ui-monospace,Menlo,monospace}`
  clone.insertBefore(style, clone.firstChild)

  const svgText = new XMLSerializer().serializeToString(clone)
  const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const img = new Image()
  img.onload = () => {
    const scale = 2
    const canvas = document.createElement('canvas')
    canvas.width = w * scale
    canvas.height = h * scale
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = P.paper
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    URL.revokeObjectURL(url)

    canvas.toBlob((png) => {
      if (!png) return
      const a = document.createElement('a')
      a.href = URL.createObjectURL(png)
      a.download = `${filename}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(a.href), 1000)
    }, 'image/png')
  }
  img.onerror = () => URL.revokeObjectURL(url)
  img.src = url
}
