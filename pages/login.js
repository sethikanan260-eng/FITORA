import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const router = useRouter()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Check your email to confirm your account, then log in.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0E0D0B', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <h1 className="stencil-font" style={{ fontSize: '48px', color: '#E8DCC4', marginBottom: '8px' }}>FITORA</h1>
        <p style={{ color: '#A39A82', marginBottom: '40px', fontSize: '14px' }}>Eat right. Lift heavy. Grow.</p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#A39A82', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{ width: '100%', backgroundColor: '#1A1712', border: '2px solid #4A4434', color: '#E8DCC4', padding: '12px 16px', fontSize: '16px', outline: 'none', borderRadius: '4px' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#A39A82', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', backgroundColor: '#1A1712', border: '2px solid #4A4434', color: '#E8DCC4', padding: '12px 16px', fontSize: '16px', outline: 'none', borderRadius: '4px' }}
            />
          </div>

          {error && <p style={{ color: '#E8542E', marginBottom: '16px', fontSize: '14px' }}>{error}</p>}
          {message && <p style={{ color: '#9CAA5C', marginBottom: '16px', fontSize: '14px' }}>{message}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', backgroundColor: '#E8542E', color: '#0E0D0B', padding: '14px', fontSize: '16px', fontWeight: '800', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Log In'}
          </button>
        </form>

        <button
          onClick={() => { setIsSignUp(!isSignUp); setError(null); setMessage(null) }}
          style={{ marginTop: '16px', background: 'none', border: 'none', color: '#A39A82', fontSize: '14px', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isSignUp ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  )
}
