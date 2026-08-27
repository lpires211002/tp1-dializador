/** Apostilla al margen. `flag` la pinta en ocre: eso significa "necesita fuente propia". */
export default function Note({ label, flag = false, children }) {
  return (
    <aside className={flag ? 'note note--flag' : 'note'}>
      <span className="note__label">{label}</span>
      <p className="note__body">{children}</p>
    </aside>
  )
}
