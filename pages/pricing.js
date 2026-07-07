import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

const PLANS = [
  {
    key: 'free',
    label: 'Free',
    price: 0,
    tagline: 'The basics.',
    features: ['Full meal plan & workout split', 'Calorie + macro targets', 'Diet type selection'],
    locked: ['No recipes', 'No workout videos', 'No daily logging'],
  },
  {
    key: 'standard',
    label: 'Standard',
    price: 10,
    tagline: 'Track your day.',
    features: ['Everything in Free', 'Workout video tutorials', 'Daily diet log', 'Skip or swap a single meal'],
    locked: ['No recipes', 'No smart compensation'],
  },
  {
    key: 'pro',
    label: 'Pro',
    price: 15,
    tagline: 'Adapts to your day.',
    features: ['Everything in Standard', 'Full recipes unlocked', 'Smart workout reschedule', 'Junk food logger with AI compensation'],
    locked: [],
  },
]

export default function Pricing() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [currentTier, setCurrentTier] = useState('free')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      supabase.from('profiles').select('tier').eq('id', data.user.id).single()
        .then(({ data: profile }) => { if (profile) setCurrentTier(profile.tier) })
    })
  }, [])

  async function handleSelectPlan(plan) {
    if (!user) return
    if (plan.price === 0) {
      await supabase.from('profiles').upsert({ id: user.id, tier: 'free' })
      router.push('/dashboard')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.key, userId: user.id }),
      })
      const data = await res.json()
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: 'INR',
        name: 'Fitora',
        description: `${plan.label} Plan - ₹${plan.price}/month`,
        order_id: data.orderId,
        handler: async function(response) {
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, plan: plan.key, userId: user.id }),
          })
          const verifyData = await verifyRes.json()
          if (verifyData.success) router.push('/dashboard')
          else alert('Payment verification failed. Please contact support.')
        },
        prefill: { email: user.email },
        theme: { color: '#E8542E' },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      alert('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <>
      <script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div style={{ minHeight: '100vh', backgroundColor: '#0E0D0B', padding: '48px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1 className="stencil-font" style={{ fontSize: '40px', color: '#E8DCC4', marginBottom: '8px' }}>Choose your plan</h1>
          <p style={{ color: '#A39A82', marginBottom: '48px' }}>All plans include a full meal plan and workout split. What you unlock changes by tier.</p>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {PLANS.map(plan => (
              <div
                key={plan.key}
                style={{
                  flex: '1', minWidth: '240px', padding: '28px',
                  backgroundColor: '#1A1712',
                  border: `2px solid ${plan.key === 'pro' ? '#E8542E' : '#4A4434'}`,
                  borderRadius: '4px', position: 'relative'
                }}
              >
                {plan.key === 'pro' && (
                  <div style={{ position: 'absolute', top: '-12px', right: '16px', backgroundColor: '#E8542E', color: '#0E0D0B', fontSize: '10px', fontWeight: '800', padding: '4px 10px', letterSpacing: '0.12em' }}>
                    ★ BEST VALUE
                  </div>
                )}
                <div style={{ fontSize: '11px', color: '#A39A82', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>{plan.label}</div>
                <div className="stencil-font" style={{ fontSize: '48px', color: '#E8DCC4' }}>₹{plan.price}</div>
                {plan.price > 0 && <div style={{ fontSize: '12px', color: '#6B6452', marginBottom: '8px' }}>per month</div>}
                <div style={{ fontSize: '14px', color: '#A39A82', marginBottom: '20px' }}>{plan.tagline}</div>
                <ul style={{ listStyle: 'none', marginBottom: '24px' }}>
                  {plan.features.map((f, i) => (
                    <li key={i} style={{ fontSize: '12px', color: '#C4B89E', marginBottom: '6px' }}>✓ {f}</li>
                  ))}
                  {plan.locked.map((f, i) => (
                    <li key={i} style={{ fontSize: '12px', color: '#5C5747', marginBottom: '6px' }}>✕ {f}</li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={loading || currentTier === plan.key}
                  style={{
                    width: '100%', padding: '12px',
                    backgroundColor: currentTier === plan.key ? '#3A3528' : '#E8542E',
                    color: currentTier === plan.key ? '#6B6452' : '#0E0D0B',
                    border: 'none', borderRadius: '4px', fontWeight: '800',
                    cursor: currentTier === plan.key ? 'default' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {currentTier === plan.key ? 'Current plan' : plan.price === 0 ? 'Get started free' : `Get ${plan.label}`}
                </button>
              </div>
            ))}
          </div>

          <p style={{ color: '#5C5747', fontSize: '11px', marginTop: '32px' }}>
            Payments processed securely via Razorpay. Cancel anytime.
          </p>
        </div>
      </div>
    </>
  )
}
