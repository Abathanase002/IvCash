// Script to set a user as admin
// Run with: npx ts-node prisma/setAdmin.ts <email>

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.log('Usage: npx ts-node prisma/setAdmin.ts <email>')
    console.log('Example: npx ts-node prisma/setAdmin.ts admin@ashesi.edu.gh')
    process.exit(1)
  }

  const user = await prisma.user.update({
    where: { email },
    data: { role: 'admin' },
  })

  console.log(`✅ User ${user.email} is now an admin!`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
