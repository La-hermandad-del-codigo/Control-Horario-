/**
 * Archivo de configuración global de los tests con Vitest.
 *
 * Este archivo se ejecuta ANTES de cada archivo de test y configura
 * el entorno de testing para toda la aplicación.
 *
 * Funciones:
 * 1. Importa los matchers de jest-dom (como `toBeInTheDocument`, `toHaveClass`, etc.)
 *    que extienden las aserciones de Vitest para trabajar con el DOM.
 * 2. Ejecuta `cleanup()` de testing-library después de cada test para limpiar
 *    el DOM virtual y evitar que elementos de un test contaminen otro.
 *
 * Este archivo se referencia en la configuración de Vitest (vite.config.ts)
 * mediante la opción `test.setupFiles`.
 */

// Importa matchers extendidos de jest-dom para aserciones del DOM.
// Ejemplo: expect(element).toBeInTheDocument(), expect(element).toHaveTextContent('...')
import '@testing-library/jest-dom'

// cleanup: limpia el DOM renderizado por testing-library entre tests.
import { cleanup } from '@testing-library/react'

// afterEach: hook de Vitest que se ejecuta después de cada caso de test.
import { afterEach } from 'vitest'

// Limpia el DOM después de cada test para asegurar aislamiento entre tests.
afterEach(() => {
    cleanup()
})
