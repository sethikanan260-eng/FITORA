import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) router.push('/dashboard')
      else router.push('/login')
    })
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0E0D0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#A39A82' }}>Loading...</p>
    </div>
  )
}
