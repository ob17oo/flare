import { prisma } from "@/shared/lib/prisma"

async function resetTable() {
  const TABLE_NAME = 'Product' // 👈 ИЗМЕНИ НА СВОЮ ТАБЛИЦУ
  
  console.log(`🗑️ Очищаю таблицу ${TABLE_NAME}...`)
  
  // 1. Удаляем все записи
  const deleteResult = await prisma.product.deleteMany({})
  console.log(`Удалено записей: ${deleteResult.count}`)
  
  // 2. Сбрасываем автоинкремент (только для Int/BigInt id)
  try {
    await prisma.$executeRaw`ALTER SEQUENCE "${TABLE_NAME}_id_seq" RESTART WITH 1;`
    console.log('🔁 Автоинкремент сброшен')
  } catch (error) {
    console.log('Автоинкремент не требуется (возможно UUID)')
  }
  
  console.log('✅ Готово!')
}

// Запуск
resetTable()
  .catch(console.error)
  .finally(() => prisma.$disconnect())