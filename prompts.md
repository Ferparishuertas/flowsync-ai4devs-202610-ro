# Prompts

Aquí van **todos los prompts que lanzaste** para hacer el ejercicio, en el orden en que los
lanzaste, con el modelo y la herramienta de cada uno.

Esto no es papeleo. Lo que se revisa es **cómo pediste las cosas**, no solo lo que salió: un
resultado flojo con un prompt bueno y un resultado flojo con un prompt vago necesitan feedback
distinto, y sin este archivo no se distinguen.

## Cómo rellenarlo

- Un apartado `## Prompt N` por cada prompt.
- **Pega el prompt tal cual lo lanzaste**, dentro del bloque de código, aunque ocupe diez líneas
  y aunque tenga faltas. No lo reescribas para que quede bien: el que arreglaste mentalmente
  después no es el que lanzaste.
- Incluye también los que **no funcionaron**. Suelen ser los más útiles de leer.
- `Modelo` y `Herramienta` en todos. Si cambiaste de una a otra a mitad, se nota aquí.

Borra el ejemplo de abajo cuando escribas el primero.

---

## Prompt 1

**Modelo:** Sonnet 5.5
**Herramienta:** Claude Code

```
Escribeme un resumem de las funcionalidades, capacidades del proyecto, el modelo de datos y todo lo funcional del este repo
```

**Qué salió:** Resumen correcto del terreno existente (solo auth).

## Prompt 2

**Modelo:** Sonnet 5.5
**Herramienta:** Claude Code

```
sEta es la base de mi PRD. "Quiero que FlowSync sea una herramienta para que los equipos remotos sepan en qué está trabajando cada uno sin tener que hacer reuniones de sincronización. Algo tipo tareas compartidas pero más en tiempo real y menos rollo que Jira."

Hazme las  cinco preguntas que más reducirían la incertidumbre sobre el problema, los usuarios y el alcance
No puedes bajar al modelo de datos o al detalle  los endpoints
```

**Qué salió:** Cinco preguntas en una sola ronda, sin bajar a datos ni endpoints.

## Prompt 3

**Modelo:** Sonnet 5.5
**Herramienta:** Claude Code

```
porque me lo vas a poner en cinco bloques?
```

**Qué salió:** La IA se había adelantado al formato sin que se lo pidiera.

## Prompt 4

**Modelo:** Sonnet 5.5
**Herramienta:** Claude Code

```
Aqui tienes las respuestas

[ficha de hechos del README, pegada entera]
```

**Qué salió:** Propuso un alcance con 8 cosas y detectó tensiones.

## Prompt 5

**Modelo:** Sonnet 5.5
**Herramienta:** Claude Code

```
Quiero que lo estructures en formato 

 Problema · usuarios · propuesta de valor · alcance · NO-alcance

y que justifiques cada ecvlusion, no alcance
```

**Qué salió:** Cinco bloques con 12 exclusiones justificadas.

## Prompt 6

**Modelo:** Sonnet 5.5
**Herramienta:** Claude Code

```
el requistio 8 ponlo en no alcance
el responsbale es opcional , y el estado inicial es por defecto
El equipo esta en no alcance. Una vez creas la cuentas ya ves todo por ahora
```

**Qué salió:** Recorte mío: el resumen de «qué se ha movido» pasó al NO-alcance.

## Prompt 7

**Modelo:** Sonnet 5.5
**Herramienta:** Claude Code

```
2,3 y 5 ok
1 queria deci rque quite obligatoriedad
El equipo jerraquias es otra funcionalidad
Estados, hay que definir 3 minimo, Por hacer en progreso y hecho
```

**Qué salió:** Corrigió las incoherencias que señaló el revisor adversarial.
