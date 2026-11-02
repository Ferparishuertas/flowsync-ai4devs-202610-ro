## Purpose

Permitir que una persona cree una cuenta en FlowSync, inicie y cierre sesión, y consulte su perfil, tanto a través de la API como desde las pantallas de la aplicación web. Este documento describe el comportamiento actual observable del sistema, no el deseado.

## Requirements

### Requirement: Registro de cuenta por API

El sistema SHALL permitir crear una cuenta mediante `POST /api/v1/auth/signup` con `fullName` (texto o `null`), `email`, `password` y `passwordConfirmation`. Si los datos son válidos, el sistema SHALL responder con el usuario creado (identificador, nombre completo, email, iniciales y fechas de creación y actualización) y un token de acceso, ambos dentro de un envoltorio `data`, de modo que la persona queda con sesión iniciada sin un paso adicional. La respuesta SHALL NOT incluir la contraseña.

#### Scenario: Registro correcto

- **WHEN** se envía una petición de registro con un email que no está registrado, una contraseña de entre 8 y 32 caracteres y una `passwordConfirmation` idéntica a la contraseña
- **THEN** el sistema responde con éxito y un cuerpo `{ "data": { "user": {...}, "token": "..." } }`, y ese token es válido para consultar el perfil

### Requirement: Validación de los datos de registro

El sistema SHALL rechazar con estado 422 un registro cuyos datos no cumplan las reglas: el email SHALL ser una dirección válida de como máximo 254 caracteres y SHALL NOT estar ya registrado; la contraseña y su confirmación SHALL tener entre 8 y 32 caracteres; la confirmación SHALL coincidir con la contraseña; y las claves `fullName`, `email`, `password` y `passwordConfirmation` SHALL estar presentes (`fullName` puede valer `null`). La respuesta de error SHALL listar cada incumplimiento con el campo afectado y la regla incumplida, y el sistema SHALL NOT crear la cuenta.

#### Scenario: Email ya registrado

- **WHEN** se envía una petición de registro con un email que ya pertenece a otra cuenta
- **THEN** el sistema responde 422 con un error sobre el campo `email` de regla de unicidad y no crea ninguna cuenta ni token

#### Scenario: Contraseñas que no coinciden

- **WHEN** se envía una petición de registro en la que `passwordConfirmation` difiere de `password`
- **THEN** el sistema responde 422 con un error sobre el campo `passwordConfirmation` indicando que no coincide con `password`

#### Scenario: Contraseña demasiado corta

- **WHEN** se envía una petición de registro con una contraseña de menos de 8 caracteres
- **THEN** el sistema responde 422 con un error de longitud mínima sobre el campo `password`

### Requirement: Inicio de sesión por API

El sistema SHALL permitir iniciar sesión mediante `POST /api/v1/auth/login` con `email` y `password`. Si las credenciales son correctas, el sistema SHALL responder con el usuario y un token de acceso nuevo dentro de `data`, con la misma forma que el registro. Cada inicio de sesión SHALL generar un token distinto sin invalidar los emitidos anteriormente.

#### Scenario: Credenciales correctas

- **WHEN** se envía una petición de login con el email de una cuenta existente y su contraseña correcta
- **THEN** el sistema responde con éxito y `{ "data": { "user": {...}, "token": "..." } }`

#### Scenario: Credenciales incorrectas

- **WHEN** se envía una petición de login con un email que no existe, o con un email existente y una contraseña errónea
- **THEN** el sistema responde 400 con un error de credenciales inválidas, sin campo asociado y sin distinguir si falló el email o la contraseña

#### Scenario: Datos de login mal formados

- **WHEN** se envía una petición de login sin `password` o con un `email` que no es una dirección válida
- **THEN** el sistema responde 422 con un error de validación sobre el campo correspondiente y no comprueba las credenciales

### Requirement: Consulta del perfil por API

El sistema SHALL responder a `GET /api/v1/account/profile` con los datos del usuario propietario del token enviado en la cabecera `Authorization: Bearer <token>`, dentro de `data`: identificador, nombre completo (o `null`), email, iniciales, fecha de creación y fecha de actualización. Las iniciales SHALL calcularse, en mayúsculas, con la primera letra de las dos primeras palabras del nombre completo separadas por un espacio; si el nombre tiene una sola palabra, con sus dos primeras letras; si no hay nombre, con la primera letra de la parte local del email y la primera letra de su dominio.

#### Scenario: Perfil con token válido

- **WHEN** se solicita el perfil con un token vigente de una cuenta cuyo nombre completo es "Ada Lovelace"
- **THEN** el sistema responde con éxito y `data` contiene el email de la cuenta, `"fullName": "Ada Lovelace"` e `"initials": "AL"`

#### Scenario: Perfil de una cuenta sin nombre

- **WHEN** se solicita el perfil con un token vigente de una cuenta registrada con `fullName` a `null` y el email `grace@ejemplo.com`
- **THEN** el sistema responde con `"fullName": null` e `"initials": "GE"` (inicial de `grace` e inicial de `ejemplo.com`)

#### Scenario: Nombre con espacios repetidos

- **WHEN** se solicita el perfil con un token vigente de una cuenta cuyo nombre completo es "Ada  Lovelace" (con dos espacios entre las palabras)
- **THEN** el sistema responde con `"initials": "AD"`, porque la primera "palabra" tras el primer espacio es una cadena vacía

#### Scenario: Perfil sin token válido

- **WHEN** se solicita el perfil sin cabecera `Authorization`, con un token inexistente o con un token ya revocado
- **THEN** el sistema responde 401 y no devuelve datos de ningún usuario

### Requirement: Cierre de sesión por API

El sistema SHALL revocar el token usado en la petición cuando reciba `POST /api/v1/account/logout` autenticada, y SHALL responder con éxito y el cuerpo `{ "message": "Logged out successfully" }` (sin el envoltorio `data`). Solo SHALL revocarse ese token; los demás tokens de la misma cuenta SHALL seguir siendo válidos.

#### Scenario: Logout con token válido

- **WHEN** se envía una petición de logout con un token vigente
- **THEN** el sistema responde con éxito y el mensaje "Logged out successfully", y una consulta posterior del perfil con ese mismo token responde 401

#### Scenario: Logout sin autenticar

- **WHEN** se envía una petición de logout sin token o con un token ya revocado
- **THEN** el sistema responde 401

### Requirement: Protección de las rutas de cuenta

El sistema SHALL exigir un token válido en todas las rutas de cuenta (perfil y logout) y SHALL permitir sin token las de registro y login. Todas las respuestas de la API SHALL ser JSON, incluidos los errores.

#### Scenario: Rutas públicas accesibles sin token

- **WHEN** se llama a registro o login sin cabecera `Authorization`
- **THEN** el sistema procesa la petición con normalidad en lugar de responder 401

### Requirement: Pantalla de registro

La aplicación SHALL ofrecer en `/register` un formulario titulado "Crea tu cuenta" con los campos "Nombre completo (opcional)", "Email", "Contraseña" (con la ayuda "Entre 8 y 32 caracteres.") y "Repite la contraseña", un botón "Crear cuenta" y un enlace "Inicia sesión" hacia el login. Si el nombre se deja vacío o con solo espacios, la aplicación SHALL enviarlo como `null`. Al enviar, el botón SHALL mostrar "Creando cuenta…" y quedar deshabilitado hasta recibir respuesta. Si el registro tiene éxito, la persona SHALL quedar con sesión iniciada y ser llevada a su perfil.

#### Scenario: Registro correcto desde la pantalla

- **WHEN** una persona sin sesión rellena email, contraseña y repetición idénticas y válidas, y pulsa "Crear cuenta"
- **THEN** la aplicación la lleva a la pantalla de perfil con su sesión iniciada

#### Scenario: Contraseñas distintas

- **WHEN** una persona escribe una contraseña y una repetición diferentes y pulsa "Crear cuenta"
- **THEN** la aplicación muestra bajo "Repite la contraseña" el mensaje "Las contraseñas no coinciden." sin llegar a contactar con el servidor

#### Scenario: Email ya registrado

- **WHEN** una persona intenta registrarse con un email que ya tiene cuenta
- **THEN** la aplicación muestra bajo el campo "Email" el mensaje "Ese email ya está registrado. Inicia sesión en su lugar." y mantiene lo escrito en el formulario

### Requirement: Mensajes de error de los formularios

La aplicación SHALL traducir los errores de validación a castellano y mostrarlos bajo el campo afectado: email inválido ("Introduce una dirección de email válida."), campo obligatorio vacío ("Falta rellenar …"), longitud mínima o máxima incumplida ("… debe tener al menos N caracteres." / "… no puede superar los N caracteres."). Cuando el error no corresponda a ningún campo visible en la pantalla, o no esté asociado a un campo, la aplicación SHALL mostrarlo en un aviso destacado encima del formulario. Si no se puede contactar con el servidor, el aviso SHALL decir "No se pudo conectar con el servidor. Comprueba que el backend está arrancado."; ante un error inesperado del servidor, "Algo ha ido mal en el servidor. Inténtalo de nuevo en un momento.".

#### Scenario: Email con formato inválido

- **WHEN** una persona envía el formulario de registro o de login con un texto que no es un email válido
- **THEN** la aplicación muestra bajo el campo "Email" el mensaje "Introduce una dirección de email válida."

#### Scenario: Servidor inaccesible

- **WHEN** una persona envía cualquiera de los formularios y el servidor no responde
- **THEN** la aplicación muestra el aviso "No se pudo conectar con el servidor. Comprueba que el backend está arrancado." y vuelve a habilitar el botón

### Requirement: Pantalla de inicio de sesión

La aplicación SHALL ofrecer en `/login` un formulario titulado "Inicia sesión" con los campos "Email" y "Contraseña", un botón "Entrar" y un enlace "Crea una" hacia el registro. Al enviar, el botón SHALL mostrar "Entrando…" y quedar deshabilitado hasta recibir respuesta. Si las credenciales son correctas, la persona SHALL ser llevada a su perfil. Si son incorrectas, la aplicación SHALL mostrar el aviso "El email o la contraseña no son correctos." encima del formulario, sin indicar cuál de los dos falló.

#### Scenario: Login correcto

- **WHEN** una persona sin sesión introduce el email y la contraseña de su cuenta y pulsa "Entrar"
- **THEN** la aplicación la lleva a la pantalla de perfil

#### Scenario: Credenciales incorrectas

- **WHEN** una persona introduce un email y una contraseña que no corresponden a ninguna cuenta y pulsa "Entrar"
- **THEN** la aplicación muestra el aviso "El email o la contraseña no son correctos." y permanece en el login

### Requirement: Restauración de la sesión al abrir la aplicación

La aplicación SHALL conservar el token de la sesión en el navegador y, al cargarse, validarlo consultando el perfil antes de dar la sesión por válida. Mientras esa comprobación esté en curso, la aplicación SHALL mostrar un indicador de carga a pantalla completa y SHALL NOT redirigir. Si el servidor rechaza el token (401), la aplicación SHALL descartarlo, dejar a la persona sin sesión y mostrar en el login "Tu sesión ha caducado. Vuelve a iniciar sesión.". Si el servidor no responde o falla de otro modo, la aplicación SHALL dejar a la persona sin sesión mostrando el motivo en el login, pero SHALL conservar el token guardado.

#### Scenario: Recarga con sesión vigente

- **WHEN** una persona con un token guardado y vigente recarga la página o abre la aplicación
- **THEN** la aplicación muestra brevemente el indicador de carga y después su perfil, sin pasar por el login

#### Scenario: Token caducado o revocado

- **WHEN** una persona abre la aplicación con un token guardado que el servidor rechaza con 401
- **THEN** la aplicación la lleva al login mostrando "Tu sesión ha caducado. Vuelve a iniciar sesión." y elimina el token guardado

#### Scenario: Servidor caído al abrir la aplicación

- **WHEN** una persona abre la aplicación con un token guardado y el servidor no responde
- **THEN** la aplicación la lleva al login mostrando el aviso de que no se pudo conectar con el servidor, y el token sigue guardado en el navegador

### Requirement: Acceso según estado de sesión

La aplicación SHALL permitir ver el perfil solo con sesión iniciada y SHALL redirigir al login a quien no la tenga. A quien ya tenga sesión, la aplicación SHALL redirigirle al perfil cuando intente abrir el login o el registro. Cualquier otra dirección desconocida SHALL redirigir al perfil (y, por lo anterior, al login si no hay sesión).

#### Scenario: Perfil sin sesión

- **WHEN** una persona sin sesión abre la dirección `/profile`
- **THEN** la aplicación la redirige a `/login`

#### Scenario: Login con sesión iniciada

- **WHEN** una persona con sesión iniciada abre `/login` o `/register`
- **THEN** la aplicación la redirige a `/profile`

#### Scenario: Dirección desconocida

- **WHEN** una persona abre una dirección que la aplicación no define, como `/inexistente`
- **THEN** la aplicación la redirige a `/profile`, o a `/login` si no tiene sesión

### Requirement: Pantalla de perfil

La aplicación SHALL mostrar en `/profile` una tarjeta con las iniciales de la persona en un círculo, su nombre completo (o "Sin nombre" si no lo tiene), su email, la fecha "Miembro desde" en formato largo en castellano (por ejemplo, "31 de octubre de 2026") y un botón "Cerrar sesión".

#### Scenario: Perfil de una cuenta con nombre

- **WHEN** una persona con sesión iniciada y nombre "Ada Lovelace" abre su perfil
- **THEN** la aplicación muestra el círculo "AL", el nombre "Ada Lovelace", su email y la fecha de alta como "Miembro desde"

#### Scenario: Perfil de una cuenta sin nombre

- **WHEN** una persona con sesión iniciada que se registró sin nombre abre su perfil
- **THEN** la aplicación muestra "Sin nombre" como título, junto con su email y las iniciales derivadas del email

### Requirement: Cierre de sesión desde la aplicación

Al pulsar "Cerrar sesión", la aplicación SHALL eliminar la sesión local (token y datos del usuario) de inmediato y llevar a la persona al login. La aplicación SHALL solicitar al servidor la revocación del token, pero SHALL cerrar la sesión local aunque esa petición falle.

#### Scenario: Cierre de sesión correcto

- **WHEN** una persona con sesión iniciada pulsa "Cerrar sesión"
- **THEN** la aplicación la lleva al login, elimina el token guardado y el token queda revocado en el servidor

#### Scenario: Cierre de sesión con el servidor caído

- **WHEN** una persona con sesión iniciada pulsa "Cerrar sesión" y el servidor no responde
- **THEN** la aplicación la lleva igualmente al login y elimina el token guardado, aunque el token pueda seguir siendo válido en el servidor

---

# Parte B

## 1. Requisitos escritos y comprobados

- Requisitos escritos por el agente: 13
- Requisitos que comprobé yo abriendo el código: 10

## 2. Incoherencias que aparecieron al escribirla

- Con nombre, las iniciales son las de sus dos primeras palabras; sin nombre, la misma regla se aplica al email separado por la arroba y sale la inicial de la parte local más la del dominio (`grace@ejemplo.com` → `GE`), algo que difícilmente era la intención. Además, un nombre con espacios repetidos ("Ada  Lovelace") da `AD`. Se ve en la respuesta del perfil y en el círculo de la pantalla de perfil.
- Un token inválido responde 401, pero unas credenciales inválidas en el login responden 400. Se ve en la respuesta de `POST /api/v1/auth/login` frente a la de `GET /api/v1/account/profile`.
- El logout es la única respuesta de éxito sin el envoltorio `data`, y su mensaje está en inglés ("Logged out successfully") mientras la interfaz está en castellano. Se ve en la respuesta de `POST /api/v1/account/logout`.
- La contraseña se limita a 32 caracteres en el registro pero no en el login. Se ve al registrarse con 33 caracteres (422) frente a iniciar sesión con 33 (se comprueban las credenciales).
- El nombre es opcional en la pantalla de registro, pero la API exige que la clave `fullName` viaje siempre (aunque valga `null`). Se ve al omitirla en `POST /api/v1/auth/signup` (422 "must be defined").
- Los errores de la API están en inglés; la pantalla los traduce a castellano, y sustituye cualquier 400 por "El email o la contraseña no son correctos.".

## 3. Lo que no supe decidir si era bug o contrato

- Al abrir la aplicación con el servidor caído, la persona queda en el login sin sesión pero el token sigue guardado. Lectura A: decisión consciente, para no cerrar la sesión por un corte pasajero. Lectura B: bug de experiencia, porque la persona ve el login aunque su token siga siendo válido y debe recargar para recuperarla. Desde fuera no se distingue.
- Los tokens no caducan nunca, hasta que se revocan con el logout: en el código no hay ninguna caducidad configurada. Lectura A: contrato (sesiones indefinidas). Lectura B: omisión de una caducidad que nadie configuró. El código dice que no hay caducidad, pero no dice si alguien lo decidió.
- Al cerrar sesión con el servidor caído, la sesión local se cierra pero el token puede seguir válido en el servidor. Lectura A: la persona queda desconectada, que es lo que pidió. Lectura B: queda un token activo sin que nadie lo sepa.
- Al pulsar "Cerrar sesión", el botón está programado para mostrar "Cerrando sesión…", pero la sesión local se borra y se redirige al login al instante, así que esa etiqueta prácticamente no llega a verse. Lectura A: comportamiento correcto, la etiqueta es un detalle secundario. Lectura B: bug, porque el estado de carga nunca cumple su función. No lo pude comprobar a ojo y no lo incluí como requisito.
