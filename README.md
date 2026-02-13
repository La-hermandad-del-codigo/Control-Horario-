# RelojTiktak - Control de Jornada Laboral

## Descripción
App para controlar tu jornada laboral. Los usuarios pueden iniciar sesión, marcar inicio, pausa, reanudación y fin de su jornada. Los datos se guardan en Supabase. 

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

## Arquitectura Lógica
Usuario → Interfaz (React) → Estado local → MCP Antigravity → Supabase → UI actualizada