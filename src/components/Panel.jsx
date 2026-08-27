import { useId, useState } from 'react'

/** Sección plegable de la consola. El resumen sigue visible al cerrarla,
 *  así se puede colapsar todo y que el panel entre en una pantalla. */
export default function Panel({ legend, summary, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)
  const id = useId()

  return (
    <div className="console__panel" data-open={open}>
      <button
        type="button"
        className="console__toggle"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="console__legend">{legend}</span>
        {!open && summary && <span className="console__summary">{summary}</span>}
        <svg className="console__chev" viewBox="0 0 12 12" aria-hidden="true" width="12" height="12">
          <path d="M2.5 4.5 L6 8 L9.5 4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="console__content" id={id} hidden={!open}>
        {children}
      </div>
    </div>
  )
}
