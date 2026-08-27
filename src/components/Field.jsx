/** Control deslizante con lectura viva y extremos rotulados. */
export default function Field({ symbol, name, value, display, min, max, step, onChange, scale }) {
  return (
    <label className="field">
      <span className="field__top">
        <span className="field__label">
          <b>{symbol}</b> {name}
        </span>
        <span className="field__value">{display}</span>
      </span>
      <input
        className="field__range"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${name} (${symbol})`}
      />
      <span className="field__scale" aria-hidden="true">
        <span>{scale[0]}</span>
        <span>{scale[1]}</span>
      </span>
    </label>
  )
}
