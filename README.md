# RelojTiktak - Control de Jornada Laboral

## Descripción
App para controlar tu jornada laboral. Los usuarios pueden iniciar sesión, marcar inicio, pausa, reanudación y fin de su jornada. Los datos se guardan en Supabase. 

## Arquitectura Lógica
Usuario → Interfaz (React) → Estado local → MCP Antigravity → Supabase → UI actualizada

## Cómo correr el proyecto

```bash
# 1. Clona el repositorio
git clone https://github.com/La-hermandad-del-codigo/Control-Horario-.git
cd Control-Horario-

# 2. Instala las dependencias
npm install

# 3. Configura las variables de entorno
# Crea un archivo .env.local y pega esto:
VITE_SUPABASE_URL=https://tuproyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon

# 4. Inicia el proyecto
npm run dev
```

## `🚀 Despliegue en Vercel

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

