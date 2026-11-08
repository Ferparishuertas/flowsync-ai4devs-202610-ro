## Prompt 1

**Modelo:** Sonnet5.5 Medium
**Herramienta:** Claude Code


```
Quiero generar una matriz de trazabilidad del requisito "Lo que cada tarea muestra de su responsable"
una fila por scenario y cuatro columnas. Encima, dos números: cuántos scenarios tiene el requisito y cuántos resultaron cubiertos — el primero se anota al empezar, el segundo al terminar.

El scenario, en una línea. Qué se espera y en qué situación. Si no cabe en una línea, es que estás juntando dos.

Qué test lo cubre, con el nombre exacto que aparece en la suite. Sin el nombre concreto, la columna va vacía: "seguro que algo lo cubre" no es una fila.

Cubierto · No cubierto · No lo sé. Los tres estados son válidos, y el tercero no es un fallo: es el resultado más informativo de los tres.



Así quedaria la tabla. Los dos números van encima — el primero antes de empezar, el segundo al terminar:

Scenarios en el requisito: 4 · Cubiertos: ___ 

```

## Prompt 2

**Modelo:** Sonnet5.5 Medium
**Herramienta:** Claude Code


```

Por cada fila en No cubierto, escribe el test que falta — uno por scenario — siguiendo el estilo de los que ya existen en el proyecto. Sin tocar nada fuera de la carpeta de tests. Cuando los tengas, ejecútalos.

```

**Modelo:** Sonnet5.5 Medium
**Herramienta:** Claude Code


```


Define un test que comprueba que las iniciales que llegan en el caso de que el nombre sea nulo, sea las correctas

```