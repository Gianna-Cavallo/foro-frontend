import { test, expect } from '@playwright/test'

// Tests E2E del flujo de login con Playwright.
//
// No hace falta levantar el BFF: con page.route interceptamos las llamadas
// que hace el navegador a http://localhost:4000 y respondemos nosotros.
// Así probamos el comportamiento del frontend de forma aislada y repetible.

test('login con credenciales inválidas muestra un mensaje de error', async ({ page }) => {
  // El BFF "responde" 401 con el mensaje de error
  await page.route('http://localhost:4000/auth/login', (route) =>
    route.fulfill({ status: 401, json: { error: 'Credenciales inválidas' } }),
  )

  await page.goto('/login')
  await page.fill('#email', 'malena@uap.edu.ar')
  await page.fill('#password', 'incorrecta')
  await page.click('button[type="submit"]')

  // El error aparece en el cartel con role="alert" y seguimos en /login.
  // Filtramos por texto porque Next.js agrega otro role="alert" oculto (vacío).
  await expect(page.getByRole('alert').filter({ hasText: 'Credenciales inválidas' })).toBeVisible()
  await expect(page).toHaveURL(/\/login$/)
})

test('login con credenciales válidas redirige a /foros', async ({ page }) => {
  // El BFF "responde" OK con los datos del usuario
  await page.route('http://localhost:4000/auth/login', (route) =>
    route.fulfill({
      status: 200,
      json: { user: { id: '1', email: 'malena@uap.edu.ar', username: 'malena', role: 'user' } },
    }),
  )
  // /foros pide la lista de foros al BFF apenas carga: respondemos una lista vacía
  await page.route('http://localhost:4000/foros', (route) => route.fulfill({ status: 200, json: [] }))

  await page.goto('/login')
  await page.fill('#email', 'malena@uap.edu.ar')
  await page.fill('#password', 'password123')
  await page.click('button[type="submit"]')

  // Redirige a /foros y el header muestra el usuario logueado
  await expect(page).toHaveURL(/\/foros$/)
  await expect(page.getByText('malena').first()).toBeVisible()
})
