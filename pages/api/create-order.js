import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

const PLAN_PRICES = {
  standard: 1000,
  pro: 1500,
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { plan, userId } = req.body

  if (!PLAN_PRICES[plan]) return res.status(400).json({ error: 'Invalid plan' })

  try {
    const order = await razorpay.orders.create({
      amount: PLAN_PRICES[plan],
      currency: 'INR',
      receipt: `receipt_${userId}_${Date.now()}`,
      notes: { plan, userId },
    })

    res.status(200).json({ orderId: order.id, amount: order.amount })
  } catch (err) {
    console.error('Razorpay error:', err)
    res.status(500).json({ error: 'Failed to create order' })
  }
}
