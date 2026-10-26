# Alcance MVP de FlowSync

## El terreno que ya existe
Hay cuentas con registro, login y logout con token, y un perfil protegido, en backend y frontend. No hay tareas, estados ni tiempo real. Todo lo del alcance se construye encima de esa base de identidad y no hay que volver a especificarla.

## 1. Problema
Los equipos remotos pequeños no pueden ver en qué está trabajando cada persona sin interrumpir a alguien. El síntoma es la ronda de «¿en qué estás?», que ocupa la mitad de la daily de 15 minutos y se repite por Slack durante el día. El coste real: dos personas tocaron el mismo módulo la misma semana sin saberlo y se perdieron dos días.

La daily no desaparece entera. La parte de bloqueos sigue y este MVP no la resuelve.

## 2. Usuarios
- **Quién:** los pares de un equipo remoto de 3 a 10 personas, con roles planos: todos ven y editan lo mismo. No hay un lead que reciba reportes.
- **Caso de estudio:** un equipo de producto SaaS de 6 personas en 3 husos horarios, con un gestor de tareas pesado y una daily por videollamada. Es un caso de estudio, no un cliente real.
- **Supuesto anotado:** no existe la entidad «equipo». Hay un único espacio compartido y quien crea una cuenta ya ve todo. Varios equipos, o personas en más de uno, quedan fuera.

## 3. Propuesta de valor
El estado del equipo se ve de un vistazo en la lista donde ya se trabaja. Cambiarlo cuesta dos clics, sin campos obligatorios ni decisiones de sprint o estimación.

Quien actualiza cobra en el momento: esa lista es su cola de trabajo y deja de recibir interrupciones preguntándole cómo va. La decisión que cambia es no empezar algo que otra persona ya está tocando y elegir lo siguiente sabiendo qué está libre. Una tarea sin responsable es una tarea libre.

- **Éxito a una semana de uso real:** el equipo cancela la ronda de «¿en qué estás?» y nadie pide que vuelva.
- **Riesgo nº 1 a validar:** si la información se queda vieja, el producto pierde el sentido. La mitigación es que actualizar cueste dos clics, no obligar a nadie.

## 4. Alcance (7 cosas: la cuenta, que ya existe, y 6 nuevas)
1. Cuenta e inicio de sesión (ya existe). Al crear la cuenta se accede a todo el espacio.
2. Una única lista de tareas compartida por todo el equipo.
3. Crear una tarea con solo el título. El responsable no es obligatorio, y se puede asignar o cambiar después. El estado inicial es «Por hacer», sin elegirlo.
4. Cambiar el estado de una tarea en dos clics. Hay tres estados fijos: «Por hacer», «En progreso» y «Hecho».
5. Fecha de vencimiento, con las vencidas marcadas.
6. Filtrar por estado para centrarse en lo pendiente.
7. Ver los cambios de estado sin refrescar la página.


## 5. NO-alcance
Cada exclusión lleva la hipótesis que no ayuda a validar.

1. **Resumen de «qué se ha movido desde la última vez que miraste».**
   - **No valida:** que el tiempo real por sí solo basta para no solaparse con otra persona.
   - **Por qué:** exige recordar cuándo miró cada persona y decidir qué cuenta como cambio. Es una capa de producto encima de la lista. Si el equipo mantiene el estado al día, la lista ya responde a «qué está libre».
2. **Entidad «equipo», jerarquías, invitaciones y gestión de acceso.**
   - **No valida:** que la lista compartida evita solaparse con otra persona. Eso se prueba con un único espacio abierto.
   - **Por qué:** es otra funcionalidad, con su propio modelo y flujos, y no toca la hipótesis. Queda como supuesto: quien crea una cuenta ve todo.
3. **Varios equipos o gente en más de uno.**
   - **No valida:** que un solo equipo deja de hacer la ronda.
   - **Por qué:** multi-equipo añade modelo y permisos sin tocar la hipótesis.
4. **Presencia y «quién está conectado».**
   - **No valida:** que ver el estado de la tarea basta para decidir qué coger.
   - **Por qué:** la hipótesis es frescura de la tarea, no actividad de la persona. Un indicador de presencia es vigilancia, y se rechaza a propósito.
5. **Notificaciones push.**
   - **No valida:** que ver la lista basta. Un aviso interrumpe, y eso reproduce el problema original.
   - **Por qué:** el estado se consulta cuando uno abre la lista, no se empuja a nadie. Quien vuelve de una reunión mira la lista y ve el estado actual de cada tarea.
6. **Integración con Slack.**
   - **No valida:** nada del núcleo, que es el estado tecleado en segundos.
   - **Por qué:** añade OAuth de terceros y un canal de interrupción, igual que las push.
7. **Derivar el estado de Git, PRs, CI o calendario.**
   - **No valida:** que la persona actualiza el estado porque le compensa. Si se deriva solo, no se prueba esa conducta.
   - **Por qué:** es otro producto, con integraciones y OAuth de terceros.
8. **Importar o sincronizar tareas de otro gestor.**
   - **No valida:** que FlowSync sustituye al gestor actual, que es donde se hace el trabajo y no donde se cuenta.
   - **Por qué:** convivir exige doble actualización, que es como muere esta categoría.
9. **Roles y permisos avanzados.**
   - **No valida:** nada con 3 a 10 personas que se fían entre sí.
   - **Por qué:** solo añade fricción, y los roles planos son una decisión de producto.
10. **Sprints, estimaciones, épicas y backlog priorizado.**
    - **No valida:** que el estado se ve de un vistazo.
    - **Por qué:** un equipo que los necesita no es nuestro usuario, y exigirlos contradice «menos rollo que Jira».
11. **Analítica e informes.**
    - **No valida:** el criterio de éxito, que es cancelar la ronda.
    - **Por qué:** el valor es de los pares, no hacia arriba. Un manager no lo pide y no hay lector del reporte.
12. **Comentarios en tareas y chat.**
    - **No valida:** que ver el estado evita interrumpir.
    - **Por qué:** «tiempo real» aquí es frescura de estado, no conversación ni colaboración simultánea.
13. **Resolver los bloqueos de la daily.**
    - **No valida:** nada de lo que se promete. La ronda de «¿en qué estás?» es lo único que se elimina.
    - **Por qué:** prometerlo vendería de más.
14. **Campos obligatorios y flujos de estados configurables.**
    - **No valida:** que actualizar cuesta dos clics.
    - **Por qué:** cada campo obligatorio es fricción que mata la frescura, que es el riesgo nº 1.

---

## Las tres líneas (Parte B)
1. **Los dos números:** la IA propuso 8 cosas dentro del alcance; tras el recorte quedan 7. De las 7, una es la cuenta que ya existía.
2. **Tres cosas que dejé fuera y por qué:**
   - **Ver qué se ha movido desde la última vez que miraste.** No ayuda a validar que ver el estado actual basta para no solaparse: con el último estado de cada tarea vale.
   - **Que el responsable sea obligatorio.** Lo quité para que crear una tarea cueste segundos. Además, una tarea sin responsable es una tarea libre, que es información útil.
   - **El equipo y las jerarquías.** Son otra funcionalidad y no ayudan a validar que la lista compartida evita solaparse.
3. **La exclusión de la que menos seguro estoy:** ver qué se ha movido. Creo que puede ser una funcionalidad interesante. Se contradicen lo que cuesta construirlo (recordar cuándo miró cada persona) y lo que valida (que no hace falta mirar la lista de forma continua). Entraría si, tras una semana de uso, el equipo sigue preguntando «¿qué ha cambiado?» aunque el estado esté al día.

