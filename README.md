# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

## 🚀 Despliegue en Vercel

### Requisitos previos

- Tener una cuenta en [Vercel](https://vercel.com)
- Tener el repositorio del proyecto en **GitHub**, **GitLab** o **Bitbucket**
- Tener configurado tu proyecto de [Supabase](https://supabase.com) con la URL y la clave anónima

### Paso 1: Importar el proyecto

1. Inicia sesión en [Vercel](https://vercel.com/login)
2. Haz clic en **"Add New..."** → **"Project"**
3. Conecta tu proveedor de Git (GitHub, GitLab o Bitbucket) si aún no lo has hecho
4. Selecciona el repositorio **Control-Horario-** de la lista

### Paso 2: Configurar el proyecto

Vercel detectará automáticamente que es un proyecto **Vite**. Verifica que la configuración sea la siguiente:

| Configuración        | Valor            |
| -------------------- | ---------------- |
| **Framework Preset** | Vite             |
| **Build Command**    | `npm run build`  |
| **Output Directory** | `dist`           |
| **Install Command**  | `npm install`    |

### Paso 3: Variables de entorno

Antes de desplegar, configura las variables de entorno en la sección **"Environment Variables"**:

| Variable                 | Descripción                          |
| ------------------------ | ------------------------------------ |
| `VITE_SUPABASE_URL`      | URL de tu proyecto en Supabase       |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima (anon key) de Supabase |

> ⚠️ **Importante:** No uses las claves de tipo `service_role`, ya que estas se exponen en el frontend. Usa únicamente la clave `anon`.

### Paso 4: Desplegar

1. Haz clic en **"Deploy"**
2. Espera a que el proceso de build termine (normalmente toma 1-2 minutos)
3. Una vez completado, Vercel te proporcionará una URL pública para acceder a tu aplicación

### Configuración de SPA (ya incluida)

Este proyecto ya incluye un archivo `vercel.json` que redirige todas las rutas a `index.html`, necesario para que **React Router** funcione correctamente:

```json
{
    "rewrites": [
        {
            "source": "/(.*)",
            "destination": "/index.html"
        }
    ]
}
```

### Despliegues automáticos

Una vez conectado el repositorio, Vercel desplegará automáticamente cada vez que hagas `push` a la rama principal. También generará **Preview Deployments** para cada Pull Request.

### Solución de problemas comunes

- **Error de build:** Asegúrate de que `npm run build` funcione correctamente en local antes de desplegar
- **Variables de entorno no encontradas:** Verifica que las variables estén configuradas en Vercel y que usen el prefijo `VITE_`
- **Página en blanco después del deploy:** Confirma que el `vercel.json` esté en la raíz del proyecto y que el **Output Directory** sea `dist`
- **Errores de Supabase:** Verifica que la URL y la clave anónima sean correctas y que las políticas de seguridad (RLS) en Supabase permitan el acceso desde el dominio de Vercel

