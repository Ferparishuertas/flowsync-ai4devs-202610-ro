import Task from '#models/task'
import User from '#models/user'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Lo que cada tarea muestra de su responsable. Cubre los tres scenarios del
 * requisito «Lo que cada tarea muestra de su responsable» de
 * `openspec/specs/tasks/spec.md`: responsable identificable, la tarea que no
 * filtra datos de cuenta (suelta y dentro de la lista), y el responsable sin
 * nombre.
 */
test.group('Tasks | responsable', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  async function sesion(client: any) {
    await User.create({
      fullName: 'Quien Mira',
      email: 'mira@example.com',
      password: 'secreto123',
    })

    const response = await client
      .post('/api/v1/auth/login')
      .json({ email: 'mira@example.com', password: 'secreto123' })

    return response.body().data.token as string
  }

  async function tareaDe(fullName: string | null, email: string) {
    const responsable = await User.create({ fullName, email, password: 'secreto123' })

    return Task.create({ title: 'Preparar la demo', status: 'pending', assigneeId: responsable.id })
  }

  test('el responsable llega con su nombre y sus iniciales', async ({ client, assert }) => {
    const token = await sesion(client)
    const tarea = await tareaDe('Ada Lovelace', 'ada@example.com')

    const response = await client
      .get(`/api/v1/tasks/${tarea.id}`)
      .qs({ today: '2026-11-08' })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.equal(response.body().data.assignee.fullName, 'Ada Lovelace')
    assert.equal(response.body().data.assignee.initials, 'AL')
  })

  test('el responsable no trae el email ni otros datos de la cuenta, suelta o en la lista', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client)
    const tarea = await tareaDe('Ada Lovelace', 'ada@example.com')

    const suelta = await client
      .get(`/api/v1/tasks/${tarea.id}`)
      .qs({ today: '2026-11-08' })
      .header('Authorization', `Bearer ${token}`)
    const lista = await client.get('/api/v1/tasks').header('Authorization', `Bearer ${token}`)

    suelta.assertStatus(200)
    lista.assertStatus(200)

    const tareas = lista.body().data as Array<{ id: number; assignee: Record<string, unknown> }>
    const enLista = tareas.find((t) => t.id === tarea.id)
    assert.isDefined(enLista)

    for (const assignee of [suelta.body().data.assignee, enLista?.assignee]) {
      assert.notProperty(assignee, 'email')
      assert.notProperty(assignee, 'createdAt')
      assert.notProperty(assignee, 'updatedAt')
      assert.notProperty(assignee, 'password')
    }
  })

  test('un responsable sin nombre llega con nombre nulo e iniciales', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client)
    const tarea = await tareaDe(null, 'ada@example.com')

    const response = await client
      .get(`/api/v1/tasks/${tarea.id}`)
      .qs({ today: '2026-11-08' })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.isNull(response.body().data.assignee.fullName)
    assert.equal(response.body().data.assignee.initials, 'AE')
  })

  test('sin nombre, las iniciales del responsable se derivan de su email y no de otro dato', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client)
    const tarea = await tareaDe(null, 'grace@hopper.org')

    const response = await client
      .get(`/api/v1/tasks/${tarea.id}`)
      .qs({ today: '2026-11-08' })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)

    const { assignee } = response.body().data
    assert.isNull(assignee.fullName)
    assert.equal(assignee.initials, 'GH')
    assert.match(assignee.initials, /^[A-Z]{2}$/)
  })

  /**
   * Las lecturas que el requisito también alcanza y que los tests de arriba no
   * tocan: la lista para los scenarios de nombre, y las respuestas de crear una
   * tarea y de cambiarle el estado, que devuelven «una tarea» con su responsable.
   */
  const CLAVES_DEL_RESPONSABLE = ['fullName', 'id', 'initials']

  test('en la lista, el responsable llega con su nombre y sus iniciales', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client)
    const tarea = await tareaDe('Ada Lovelace', 'ada@example.com')

    const response = await client.get('/api/v1/tasks').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)

    const tareas = response.body().data as Array<{ id: number; assignee: Record<string, unknown> }>
    const enLista = tareas.find((t) => t.id === tarea.id)

    assert.equal(enLista?.assignee.fullName, 'Ada Lovelace')
    assert.equal(enLista?.assignee.initials, 'AL')
  })

  test('en la lista, un responsable sin nombre llega con nombre nulo e iniciales', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client)
    const tarea = await tareaDe(null, 'grace@hopper.org')

    const response = await client.get('/api/v1/tasks').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)

    const tareas = response.body().data as Array<{ id: number; assignee: Record<string, unknown> }>
    const enLista = tareas.find((t) => t.id === tarea.id)

    assert.isNull(enLista?.assignee.fullName)
    assert.equal(enLista?.assignee.initials, 'GH')
  })

  test('en la lista, el responsable trae solo id, nombre e iniciales', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client)
    const tarea = await tareaDe('Ada Lovelace', 'ada@example.com')

    const response = await client.get('/api/v1/tasks').header('Authorization', `Bearer ${token}`)

    const tareas = response.body().data as Array<{ id: number; assignee: Record<string, unknown> }>
    const enLista = tareas.find((t) => t.id === tarea.id)

    assert.deepEqual(Object.keys(enLista!.assignee).sort(), CLAVES_DEL_RESPONSABLE)
  })

  test('al crear una tarea, el responsable trae solo id, nombre e iniciales', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client)

    const response = await client
      .post('/api/v1/tasks')
      .json({ title: 'Preparar la demo' })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(201)
    const { assignee } = response.body().data as { assignee: Record<string, unknown> }
    assert.deepEqual(Object.keys(assignee).sort(), CLAVES_DEL_RESPONSABLE)
    assert.notInclude(JSON.stringify(response.body()), 'mira@example.com')
  })

  test('al cambiar el estado de una tarea, el responsable trae solo id, nombre e iniciales', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client)
    const tarea = await tareaDe('Ada Lovelace', 'ada@example.com')

    const response = await client
      .patch(`/api/v1/tasks/${tarea.id}/status`)
      .json({ status: 'in_progress' })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    assert.deepEqual(Object.keys(response.body().data.assignee).sort(), CLAVES_DEL_RESPONSABLE)
    assert.notInclude(JSON.stringify(response.body()), 'ada@example.com')
  })
})
