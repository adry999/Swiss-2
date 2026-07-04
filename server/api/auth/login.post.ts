import { z } from 'zod'
import { db } from '../../db'
import { verifyPassword } from '../../utils/password'

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid request' })
  }
  const { email, password } = parsed.data

  const user = await db.query.users.findFirst({
    where: (t, { eq }) => eq(t.email, email.toLowerCase().trim()),
  })

  if (!user || !user.isActive || !(await verifyPassword(password, user.passwordHash))) {
    throw createError({ statusCode: 401, statusMessage: 'Email sau parolă incorecte' })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      sellerId: user.sellerId,
    },
  })

  return { ok: true }
})
