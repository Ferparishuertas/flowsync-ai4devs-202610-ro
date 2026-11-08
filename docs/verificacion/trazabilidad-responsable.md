# Trazabilidad: «Lo que cada tarea muestra de su responsable»

Fuente: `openspec/specs/tasks/spec.md` (línea 97).

Scenarios en el requisito: 3 · Cubiertos: 0

| Scenario | Test que lo cubre | Estado |
|---|---|---|
| Responsable identificable: una tarea de "Ada Lovelace" trae `assignee` con nombre e iniciales | — | No cubierto |
| La tarea no filtra datos de cuenta: el `assignee` no incluye email ni datos de acceso | — | No cubierto |
| Responsable sin nombre: el nombre llega nulo y las iniciales siguen llegando | — | No cubierto |

## Notas

- Búsqueda: no existe ningún test que mencione `task` ni `assignee` en `backend/tests/` (solo hay `functional/auth/*`; `tests/unit/` no existe) ni en el frontend (sin runner).
- Tests cercanos que **no** cuentan: `Auth | iniciales` (cubre el requisito «Iniciales de la cuenta» de auth, vía login) y `una cuenta puede quedarse sin nombre` (signup). Ejercitan `UserTransformer`, no `TaskAssigneeTransformer`, que es lo que serializa el `assignee` de la tarea.
- La implementación existe (`backend/app/transformers/task_assignee_transformer.ts` solo expone `id`, `fullName`, `initials`); lo que falta es el test que lo demuestre.
