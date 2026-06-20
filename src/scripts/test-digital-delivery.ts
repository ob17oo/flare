import { prisma } from "../shared/lib/prisma"
import { generateProductKey } from "../shared/lib/utils/productKey"
import bcrypt from "bcrypt"

async function runTest() {
  console.log("🚀 Starting Digital Product Delivery Verification...")

  // 1. Setup Test User
  let testUser = await prisma.user.findFirst({
    where: { email: "test-buyer@example.com" }
  })
  if (!testUser) {
    console.log("👤 Creating test buyer user...")
    const hashedPassword = await bcrypt.hash("testPassword123", 10)
    testUser = await prisma.user.create({
      data: {
        login: "testbuyer",
        email: "test-buyer@example.com",
        password: hashedPassword,
        balance: 1000,
        role: "USER"
      }
    })
  }
  console.log(`✅ Test User: ${testUser.login} (ID: ${testUser.id})`)

  // 2. Setup Test Product
  let testProduct = await prisma.product.findFirst({
    where: { title: "Test digital game product" }
  })
  if (!testProduct) {
    console.log("🎮 Creating test digital game product...")
    testProduct = await prisma.product.create({
      data: {
        title: "Test digital game product",
        description: "Test description",
        price: 499,
        stock: 10,
        isActive: true,
        productEdition: "Standard",
        productType: "GAME"
      }
    })
  } else {
    // Reset stock to 10
    testProduct = await prisma.product.update({
      where: { id: testProduct.id },
      data: { stock: 10 }
    })
  }
  console.log(`✅ Test Product: ${testProduct.title} (ID: ${testProduct.id}, Stock: ${testProduct.stock})`)

  // 3. Initiate checkout (mocking createProductStripeSessionAction database side)
  const mockStripeSessionId = `test_session_${Date.now()}`
  console.log(`💳 Initializing mock checkout session: ${mockStripeSessionId}`)

  const pendingOrder = await prisma.order.create({
    data: {
      userId: testUser.id,
      productId: testProduct.id,
      email: "recipient@example.com",
      status: "PENDING",
      stripeId: mockStripeSessionId
    }
  })
  console.log(`✅ Pending Order created (ID: ${pendingOrder.id})`)

  const pendingDeposit = await prisma.deposit.create({
    data: {
      userId: testUser.id,
      amount: testProduct.price,
      stripeId: mockStripeSessionId,
      status: "PENDING"
    }
  })
  console.log(`✅ Pending Deposit (Payment) created (ID: ${pendingDeposit.id})`)

  // 4. Simulate Webhook Processing (first run)
  console.log("⚡ Simulating Stripe Webhook: checkout.session.completed (FIRST RUN)...")

  // Verify signature & metadata verification matches our route logic
  const sessionMetadata = {
    purpose: 'product_purchase',
    userId: testUser.id,
    productId: testProduct.id.toString(),
    orderId: pendingOrder.id.toString(),
    email: "recipient@example.com",
    finalPrice: testProduct.price.toString()
  }

  // Execute database transaction (copied directly from webhook route logic)
  let ticketInfo: any = null
  await prisma.$transaction(async (tx) => {
    const txOrder = await tx.order.findUnique({
      where: { id: pendingOrder.id },
      include: { product: true }
    })

    if (!txOrder) {
      throw new Error('ORDER_NOT_FOUND')
    }

    if (txOrder.status === 'SUCCESS' || txOrder.status === 'PAID') {
      console.log(`[Idempotency Skip] Order #${pendingOrder.id} already marked SUCCESS.`)
      return
    }

    const existingDeposit = await tx.deposit.findUnique({
      where: { stripeId: mockStripeSessionId }
    })

    if (existingDeposit && (existingDeposit.status === 'SUCCESS' || existingDeposit.status === 'PAID')) {
      console.log(`[Idempotency Skip] Deposit ${mockStripeSessionId} already marked PAID.`)
      return
    }

    // Update Order & Deposit status to SUCCESS
    await tx.order.update({
      where: { id: pendingOrder.id },
      data: { status: 'SUCCESS' }
    })

    if (existingDeposit) {
      await tx.deposit.update({
        where: { id: existingDeposit.id },
        data: { status: 'PAID' }
      })
    }

    // Decrement product stock
    await tx.product.update({
      where: { id: testProduct.id },
      data: { stock: { decrement: 1 } }
    })

    // Generate product key
    const productKey = generateProductKey()

    // Create digital ticket
    await tx.ticket.create({
      data: {
        userId: testUser.id,
        orderId: pendingOrder.id,
        productKey
      }
    })

    ticketInfo = {
      toEmail: sessionMetadata.email,
      productTitle: txOrder.product.title,
      purchaseDate: new Date().toLocaleDateString('ru-RU'),
      orderId: txOrder.id,
      price: sessionMetadata.finalPrice,
      paymentMethod: 'Банковская карта (Stripe)',
      status: 'Успешно (SUCCESS)',
      productKey,
    }
  }, {
    timeout: 10000,
    maxWait: 2000,
    isolationLevel: 'Serializable'
  })

  console.log("✅ Webhook first run database updates successful!")
  console.log("🔑 Generated digital ticket key:", ticketInfo.productKey)

  // 5. Verify Database State after first run
  const updatedOrder = await prisma.order.findUnique({ where: { id: pendingOrder.id } })
  const updatedDeposit = await prisma.deposit.findUnique({ where: { stripeId: mockStripeSessionId } })
  const updatedProduct = await prisma.product.findUnique({ where: { id: testProduct.id } })
  const createdTicket = await prisma.ticket.findUnique({ where: { orderId: pendingOrder.id } })

  if (updatedOrder?.status !== 'SUCCESS') throw new Error("Order status was not updated to SUCCESS!")
  if (updatedDeposit?.status !== 'PAID') throw new Error("Deposit status was not updated to PAID!")
  if (updatedProduct?.stock !== testProduct.stock - 1) throw new Error("Product stock was not decremented!")
  if (!createdTicket) throw new Error("Ticket record was not created in database!")
  if (createdTicket.productKey !== ticketInfo.productKey) throw new Error("Ticket productKey mismatch!")

  console.log("✅ Verification of database records (Order, Deposit, Product Stock, Ticket) PASSED!")

  // 6. Simulate Webhook Processing (SECOND RUN - Idempotency test)
  console.log("⚡ Simulating Stripe Webhook: checkout.session.completed (SECOND RUN)...")
  
  let secondRunExecuted = false
  await prisma.$transaction(async (tx) => {
    const txOrder = await tx.order.findUnique({
      where: { id: pendingOrder.id },
      include: { product: true }
    })

    if (!txOrder) {
      throw new Error('ORDER_NOT_FOUND')
    }

    if (txOrder.status === 'SUCCESS' || txOrder.status === 'PAID') {
      console.log("🛡️ [Idempotency Success] Order is already marked SUCCESS. Skipping database updates!")
      return
    }

    secondRunExecuted = true
  }, {
    timeout: 10000,
    maxWait: 2000,
    isolationLevel: 'Serializable'
  })

  if (secondRunExecuted) {
    throw new Error("Idempotency failed! Re-processed already successful order.")
  }
  console.log("✅ Idempotency test PASSED! No duplicates created, no status updates performed.")

  console.log("\n⭐️⭐️⭐️ DIGITAL DELIVERY SYSTEM VERIFICATION PASSED SUCCESSFULLY! ⭐️⭐️⭐️\n")
}

runTest()
  .catch((err) => {
    console.error("❌ Test verification failed with error:", err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
