# Testing (E2E con Playwright)

## Requisitos

- Node 18+

## Primera vez

```bash
npm install
npx playwright install chromium
```

## Correr los tests

```bash
npm run test:e2e
```

Para ver el navegador mientras corre:

```bash
npx playwright test --headed
```

## Notas

- Los tests interceptan al BFF con `page.route`, así que **no hace falta levantar el BFF ni el backend** para correrlos.
- `playwright.config.ts` levanta el frontend automáticamente (`npm run dev`) si no está corriendo ya en `http://localhost:3000`.
- Los tests viven en `e2e/`.
