---
name: rpsoft-ui
description: "Skill que define la apariencia, estructura y reglas de diseño de toda la UI del ecosistema RPSoft."
---

# RPSoft UI Skill

Esta skill establece las reglas, convenciones y estándares visuales para construir interfaces dentro del ecosistema RPSoft. Todo componente, página o feature debe seguir estas directrices.

---

## Stack Obligatorio

| Tecnología   | Uso                              |
|--------------|----------------------------------|
| React        | Librería de UI                   |
| TypeScript   | Tipado estático                  |
| TailwindCSS  | Utilidades de estilo             |

### Componentes base (Sprint 0)

Si el proyecto incluye un Sprint 0, los componentes iniciales deben ser:

- `Button` (variantes: primary, secondary, danger)
- `Input` (con label, error y aria tags)
- `Card` (contenedor visual uniforme)
- `Table` (listados tabulares)
- `Sidebar`, `Header`, `MainContent` (layout)

---

## Reglas de UI

### 1. Layout tipo Dashboard RPSoft

```
┌──────────────────────────────────────────────┐
│  Header (h-16, sticky top, z-50)             │
├────────────┬─────────────────────────────────┤
│  Sidebar   │  Contenido principal            │
│  (w-64,    │  (overflow-y-auto, p-6)         │
│  fixed,    │                                 │
│  left,     │                                 │
│  h-full)   │                                 │
└────────────┴─────────────────────────────────┘
```

- **Sidebar**: fija a la izquierda, `w-64`, altura completa, fondo oscuro (`bg-gray-900` o similar).
- **Header**: superior, sticky, altura `h-16`, sombra `shadow-sm`, `z-50`.
- **Contenido**: scrollable con `overflow-y-auto`, padding `p-6`.
- **Spacing estándar**: usar múltiplos de 4px (`gap-2`, `gap-4`, `gap-6`, `gap-8`).
- **Tipografía base**: `font-sans` (Inter o sistema). Tamaños: `text-sm` para cuerpo, `text-lg` / `text-xl` para títulos de sección, `text-2xl` para títulos de página.
- **Colores permitidos**:
  - Primario: `blue-600` / `blue-700`
  - Fondo: `gray-50` (claro), `gray-900` (oscuro/sidebar)
  - Texto: `gray-900` (principal), `gray-500` (secundario)
  - Danger: `red-600`
  - Success: `green-600`
  - Warning: `yellow-500`
- **Sombras permitidas**: `shadow-sm`, `shadow`, `shadow-md`. No usar `shadow-lg` o superiores salvo modales.

---

### 2. Componentes Obligatorios

#### Button

```tsx
// Variantes: primary | secondary | danger
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}
```

| Variante    | Clases TailwindCSS                                                        |
|-------------|---------------------------------------------------------------------------|
| `primary`   | `bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2`          |
| `secondary` | `bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg px-4 py-2`       |
| `danger`    | `bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2`            |

Todos los botones deben incluir `focus:outline-none focus:ring-2 focus:ring-offset-2`.

#### Input

```tsx
interface InputProps {
  label: string;
  name: string;
  error?: string;
  type?: string;
  placeholder?: string;
}
```

Reglas:
- Siempre incluir `<label>` vinculado con `htmlFor`.
- Incluir `aria-invalid` y `aria-describedby` cuando hay error.
- Mostrar mensaje de error debajo del input con `text-red-600 text-sm`.
- Clases base: `border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500`.

#### Card

```tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
}
```

Clases base: `bg-white rounded-xl shadow-sm border border-gray-200 p-6`.

#### Table

- Usar `<table>` semántico con `<thead>`, `<tbody>`, `<th>`, `<td>`.
- Header: `bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider`.
- Filas: `border-b border-gray-200 hover:bg-gray-50`.
- Celdas: `px-4 py-3 text-sm text-gray-900`.

---

### 3. Naming Conventions

| Elemento           | Convención    | Ejemplo                    |
|--------------------|---------------|----------------------------|
| Componentes React  | `PascalCase`  | `UserCard`, `SidebarNav`   |
| Funciones/hooks    | `camelCase`   | `useAuth`, `handleSubmit`  |
| Archivos           | `kebab-case`  | `user-card.tsx`, `use-auth.ts` |
| Tipos/Interfaces   | `PascalCase`  | `UserProfile`, `ButtonProps`   |
| Constantes         | `UPPER_SNAKE` | `MAX_RETRIES`, `API_URL`   |

#### Reglas de Tailwind

- **No duplicar utilidades**: revisar antes de agregar clases que ya existen en un componente padre.
- **Extraer clases repetidas** a variables o componentes cuando se repiten en 3+ lugares.
- **Orden de clases** sugerido: layout → sizing → spacing → typography → colors → effects → responsive.
- **No usar `@apply`** salvo en estilos globales justificados.

---

### 4. Accesibilidad Mínima (a11y)

| Requisito                 | Detalle                                                                 |
|---------------------------|-------------------------------------------------------------------------|
| **Labels**                | Todo `<input>`, `<select>`, `<textarea>` debe tener un `<label>` asociado. |
| **aria-label**            | Elementos interactivos sin texto visible deben usar `aria-label`.       |
| **Focus visible**         | Todos los elementos interactivos deben mostrar `focus:ring` o equivalente. |
| **Contraste AA**          | Ratio mínimo 4.5:1 para texto normal, 3:1 para texto grande.           |
| **Navegación por teclado**| Todos los elementos interactivos deben ser alcanzables con `Tab` y activables con `Enter`/`Space`. |

---

## DoD UI – Definition of Done

Antes de considerar cualquier feature o componente como **terminado**, debe cumplir todos estos criterios:

- [ ] **No errores de consola**: cero errores en la consola del navegador.
- [ ] **No warnings de React o TS**: cero warnings de React (`key`, `useEffect` deps, etc.) y cero errores de TypeScript.
- [ ] **Responsive mínimo**: funcional en viewport ≥ 320px (mobile friendly). Probar en al menos mobile y desktop.
- [ ] **Consistencia del layout**: sidebar, header y contenido respetan la estructura definida. No hay desbordes ni roturas visuales.
- [ ] **Stack obligatorio**: todo componente usa React + TypeScript + TailwindCSS. No se permite CSS-in-JS, SCSS ni CSS plano adicional sin justificación.
- [ ] **Naming conventions**: archivos, componentes, funciones y tipos siguen las convenciones definidas.
- [ ] **Accesibilidad (a11y)**: cumple los 5 requisitos mínimos documentados arriba.
