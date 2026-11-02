# Comparación con y sin harness — FLOW-4 (login en el frontend)

Mismo encargo en las dos copias. Con harness: `flowsync-ai4devs-202610-ro` (`/priority-ticket`, CLAUDE.md, subagente). Sin harness: `flowsync-ai4devs-202610-ro-clean` (misma instrucción escrita a mano). Los prompts exactos están en `prompts.md`.

| | Con harness | Sin harness |
|---|---|---|
| **1. Archivos que propone tocar** | **17** nombrados en el plan (vite.config.ts, tsconfig.app.json, components.json, 5 `ui/*`, `lib/api.ts`, `auth/AuthContext.tsx`, `auth/ProtectedRoute.tsx`, 3 páginas, App.tsx, main.tsx, borrar App.css) + package.json implícito. Resultado real: 23 en el commit (incluye lockfile). | **22** listados (package.json, vite.config.ts, tsconfig.json, tsconfig.app.json, components.json, main.tsx, App.tsx, index.css, `lib/{api,auth,utils}`, 5 `ui/*`, 3 páginas, `.prettierrc`, `.prettierignore`, borrar App.css). Resultado real: 20 archivos sin contar lockfiles. |
| **2. Convenciones** | **Respetó:** rama nueva antes de tocar código; `backend/` intacto; leyó `signupValidator` y metió `passwordConfirmation` y `fullName` desde el plan, sin que se lo dijeran; commit convencional `tipo(scope): descripción`; PR abierto. **No respetó:** el PR no cumple "responder solo con la URL" (hubo conversación); `/commit` no se usó (commit a mano); el PR salió contra `s1/start` del fork porque `gh` apuntaba por defecto a `main` del upstream, sin historia común; `adversarial-reviewer` aún sin lanzar; el plan no mencionó Prettier y no se añadió script `format`. | **No había ninguna escrita** (sin CLAUDE.md), esa es la respuesta. En la práctica: no creó rama (sigue en `s1/start`); no tocó `backend/` (porque el prompt 2 se lo dijo); `passwordConfirmation` y Prettier entraron solo tras corregirlo; no hay commit ni PR. Sí dejó `format` / `format:check` y `.prettierrc` con `printWidth` 100. |
| **3. Intervenciones** | **0 correcciones.** 2 prompts de `prompts.md` (invocar la skill; aprobar el plan, aceptando la discrepancia que el propio plan señaló). Más: 1 pausa («espera»), 1 pregunta («cual es el plan»), 1 comando rechazado (el `gh pr create` que apuntaba al repo equivocado). | **1 corrección con 3 puntos** (prompt 2): añadir `passwordConfirmation` a los criterios, no tocar el backend, usar Prettier. Total 3 prompts (encargo, corrección, «adelante»). |
| **4. Qué arreglar a mano**  lanzar `adversarial-reviewer`; falta script `format` y `printWidth` por defecto (80) frente a 100 en la otra copia; aviso de lint en `ui/button.tsx` (código generado por shadcn); todo sin probar en navegador, solo build, lint y curl. | Crear la rama; commit y PR; `cn` y `shadcn` metidos como dependencias de producción (`package.json`), no son necesarios en ejecución; mismo aviso de lint en `ui/button.tsx`; sin probar en navegador. Build, lint y `format:check` pasan (comprobado). |



1. **Hasta qué pieza llegaste, y cuál te costó más de lo que esperabas.**

- Fue todo bastante fluido. 13 minutos con harness ya que revise el plan, y 26 sin harness

2. **La primera diferencia que viste entre las dos salidas, y en qué te fijaste para verla.**

- Sin harness tuve que intervenir para dar direccion de las cosas que no estban especificadas pero son convenciones habituales, prettier, y el passwordConfirmation

3. **Algo que dejaste escrito en el harness y que el agente no cumplió igualmente.**

- no se ejecuto el adversarial-reviewer con la creacion del PR que hice en mi repor para probar. Lo tuve que hacer a mano, y No se hicieron pruebas en el navegador