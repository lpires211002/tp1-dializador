# Simulador de dializador — TP N°1, Órganos Artificiales (ITBA)

Simulación interactiva de la transferencia de masa a través de la membrana de un
dializador, según el modelo del Anexo I del trabajo práctico.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre en `http://localhost:5173`.

## El modelo

Membrana plana de espesor constante, transporte puramente difusivo en estado
estacionario, gradiente lineal, sin convección ni retrofiltración.

```
J  = D · (C − C_d) / L          flujo de masa      [mol/(m²·s)]
ṁ  = J · A                      flujo total        [mol/s]
Cl = ṁ / C = (D·A/L)(1 − C_d/C) clearance          [m³/s]
```

Con `C_d = 0` —la hipótesis del Anexo I— el clearance se reduce a `D·A/L` y
**no depende de la concentración**: es una propiedad geométrica y material de la
membrana.

Unidades: `1 mM = 1 mmol/L = 1 mol/m³`, por eso el código original asigna
`C_sangre_mol_m3 = C_sangre_mM` sin factor de conversión.

Verificación del caso base (L = 50 µm, A = 1 m², D = 1×10⁻¹⁰ m²/s):

| Magnitud | Valor |
|---|---|
| J | 1,0000 × 10⁻⁵ mol/(m²·s) |
| ṁ | 1,0000 × 10⁻⁵ mol/s |
| Cl | 2,0000 × 10⁻⁶ m³/s = **120,00 mL/min** |

## Qué cubre cada sección

1. **Modelo base** — verificación de los 120 mL/min y corte vivo de la membrana.
2. **Sensibilidad al espesor** — tabla de cinco espesores (la quinta fila es
   editable, porque la consigna pide cinco datos y enumera cuatro) y curva
   `Cl ∝ 1/L`.
3. **Optimización del área** — despeje de `A = Cl·L/D`. Para 150 mL/min a 50 µm
   da **1,25 m²**.
4. **Cut-off** — clearance de la Vitamina B12 y del resto de los solutos, con
   tres modelos de difusividad seleccionables.
5. **Contraste real** — el modelo evaluado al área de dializadores comerciales.

## Modelos de difusividad (sección 4)

Los tres están **anclados** al único dato que da la cátedra, `D_urea = 1×10⁻¹⁰ m²/s`,
de modo que la urea siempre reproduce 120 mL/min.

- **Stokes–Einstein** — `D ∝ M^(−1/3)`. Es el nivel de detalle que pide la
  consigna. Su límite se ve solo: predice que la albúmina atraviesa la membrana,
  lo cual es físicamente falso.
- **Renkin** — agrega exclusión estérica e impedimento hidrodinámico en el poro,
  con radio de poro ajustable. Acá aparece el cut-off. La porosidad/tortuosidad
  efectiva `ε/τ` se despeja de la urea, así el modelo nunca contradice el dato
  de la cátedra.
- **Bibliografía** — para cargar el `D` que encuentres y puedas citar.

## Sobre los datos

⚠ **El único coeficiente que da la cátedra es el de la urea.** Todo lo demás
—difusividades en agua, radios de Stokes, clearances de dializadores
comerciales— son valores típicos cargados como punto de partida para explorar.
La interfaz los marca en ocre con la etiqueta `verificar` o `estimado`.

**No son citas.** Antes de que un número entre al informe, buscá la fuente,
verificá el polímero y la temperatura, y citala. La consigna pide explícitamente
investigar el coeficiente de difusión de la Vitamina B12.

## Estructura

```
src/
├── lib/model.js       física pura, sin React — testeable sola
├── lib/solutes.js     biblioteca de solutos
├── lib/dialyzers.js   dializadores comerciales de referencia
├── lib/exportPng.js   serialización SVG → PNG para el informe
└── components/        consola, corte de membrana, gráficos y secciones
```

Los gráficos son SVG propio, sin librería: el PNG exportado es idéntico a lo que
se ve en pantalla.

## Bibliografía

- Ratner & Hoffman (2020). *Biomaterials Science. An Introduction to Materials in Medicine.*
- Renkin, E. M. (1954). Filtration, diffusion and molecular sieving through porous cellulose membranes. *J. Gen. Physiol.*
