import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, userId } = req.body

  const body = razorpay_order_id + '|' + razorpay_payment_id
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex')

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false, error: 'Invalid signature' })
  }

  const { error } = await supabaseAdmin.from('profiles').upsert({
    id: userId,
    tier: plan,
    payment_id: razorpay_payment_id,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error('Supabase error:', error)
    return res.status(500).json({ success: false, error: 'Failed to update subscription' })
  }

  res.status(200).json({ success: true })
}
