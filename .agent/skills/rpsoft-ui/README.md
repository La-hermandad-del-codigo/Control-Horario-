# RPSoft UI Skill

## ¿Qué es?

Skill que define la apariencia, estructura y reglas de diseño de toda la UI del ecosistema RPSoft. Cualquier agente o desarrollador que trabaje en la interfaz debe leer `skill.md` antes de escribir código.

## ¿Cómo usarla?

1. **Leer `skill.md`** antes de crear o modificar cualquier componente de UI.
2. **Seguir el stack obligatorio**: React + TypeScript + TailwindCSS.
3. **Aplicar las reglas** de layout, componentes, naming y accesibilidad documentadas en la skill.
4. **Verificar el DoD UI** antes de marcar cualquier tarea como completada.

## ¿Dónde colocar componentes?

```
src/
  components/
    ui/            ← Componentes base (Button, Input, Card, Table)
    layout/        ← Sidebar, Header, MainContent
    features/      ← Componentes específicos de cada feature
  hooks/           ← Custom hooks (useAuth, useForm, etc.)
  types/           ← Interfaces y tipos compartidos
```

## ¿Cómo aplicar las reglas en nuevas features?

1. **Crear archivos** usando `kebab-case` (ej: `user-card.tsx`).
2. **Nombrar componentes** en `PascalCase` (ej: `UserCard`).
3. **Usar los componentes base** (`Button`, `Input`, `Card`, `Table`) en lugar de crear elementos ad-hoc.
4. **Respetar el layout dashboard**: sidebar + header + contenido scrollable.
5. **Incluir accesibilidad**: labels, aria-label, focus visible, contraste AA.
6. **Revisar el DoD UI** de `skill.md` como checklist final.
