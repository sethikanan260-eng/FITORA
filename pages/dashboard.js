import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/router'
import { calcPlan, EXERCISE_LIBRARY, DAY_LABELS, WEEK_DAYS } from '../lib/plan'

const DIETS = ['nonveg', 'veg', 'vegan', 'keto']
const EXPERIENCE = ['beginner', 'intermediate', 'advanced']

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [stage, setStage] = useState('form')
  const [form, setForm] = useState({ diet: 'nonveg', weight: '', height: '', age: '', sex: 'male', activity: 'light', experience: 'beginner', daysPerWeek: '4' })
  const [plan, setPlan] = useState(null)
  const [selectedDay, setSelectedDay] = useState(0)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUser(data.user)
      const { data: p } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
      setProfile(p || { tier: 'free' })
    })
  }, [])

  function generate() {
    if (!form.weight || !form.height || !form.age) return
    setPlan(calcPlan(form))
    setStage('plan')
    setSelectedDay(0)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const tier = profile?.tier || 'free'
  const isPro = tier === 'pro'
  const isStandard = tier === 'standard' || tier === 'pro'

  if (!user || !profile) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0E0D0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#A39A82' }}>Loading...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0E0D0B', color: '#E8DCC4' }}>
      <div style={{ borderBottom: '1px solid #3A3528', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="stencil-font" style={{ fontSize: '24px' }}>FITORA</span>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#A39A82', textTransform: 'uppercase', backgroundColor: '#1A1712', padding: '4px 10px', border: '1px solid #3A3528' }}>{tier}</span>
          <button onClick={() => router.push('/pricing')} style={{ fontSize: '12px', color: '#E8542E', background: 'none', border: 'none', cursor: 'pointer' }}>Upgrade</button>
          <button onClick={logout} style={{ fontSize: '12px', color: '#6B6452', background: 'none', border: 'none', cursor: 'pointer' }}>Log out</button>
        </div>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 24px' }}>
        {stage === 'form' && (
          <div>
            <h2 className="stencil-font" style={{ fontSize: '36px', marginBottom: '8px' }}>Build your plan</h2>
            <p style={{ color: '#A39A82', marginBottom: '32px', fontSize: '14px' }}>Enter your details and get a full week of meals and workouts.</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              {[['Weight (kg)', 'weight', '72'], ['Height (cm)', 'height', '175'], ['Age', 'age', '24']].map(([label, key, ph]) => (
                <div key={key}>
                  <label style={{ display: 'block', color: '#A39A82', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '6px' }}>{label}</label>
                  <input type="number" placeholder={ph} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: '100%', backgroundColor: '#1A1712', border: '2px solid #4A4434', color: '#E8DCC4', padding: '10px 14px', fontSize: '16px', outline: 'none', borderRadius: '4px' }} />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', color: '#A39A82', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '6px' }}>Sex</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['male', 'female'].map(s => (
                    <button key={s} onClick={() => setForm(f => ({ ...f, sex: s }))}
                      style={{ padding: '10px 16px', border: `2px solid ${form.sex === s ? '#E8542E' : '#4A4434'}`, backgroundColor: form.sex === s ? 'rgba(232,84,46,0.1)' : 'transparent', color: form.sex === s ? '#E8542E' : '#C4B89E', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                      {s[0].toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#A39A82', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>Diet</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {DIETS.map(d => (
                  <button key={d} onClick={() => setForm(f => ({ ...f, diet: d }))}
                    style={{ padding: '8px 16px', border: `2px solid ${form.diet === d ? '#E8542E' : '#4A4434'}`, backgroundColor: form.diet === d ? 'rgba(232,84,46,0.1)' : 'transparent', color: form.diet === d ? '#E8542E' : '#C4B89E', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#A39A82', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>Experience</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {EXPERIENCE.map(e => (
                  <button key={e} onClick={() => setForm(f => ({ ...f, experience: e }))}
                    style={{ padding: '8px 16px', border: `2px solid ${form.experience === e ? '#E8542E' : '#4A4434'}`, backgroundColor: form.experience === e ? 'rgba(232,84,46,0.1)' : 'transparent', color: form.experience === e ? '#E8542E' : '#C4B89E', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                    {e[0].toUpperCase() + e.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', color: '#A39A82', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>Training days/week</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['3','4','5','6'].map(d => (
                  <button key={d} onClick={() => setForm(f => ({ ...f, daysPerWeek: d }))}
                    style={{ padding: '8px 20px', border: `2px solid ${form.daysPerWeek === d ? '#E8542E' : '#4A4434'}`, backgroundColor: form.daysPerWeek === d ? 'rgba(232,84,46,0.1)' : 'transparent', color: form.daysPerWeek === d ? '#E8542E' : '#C4B89E', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={generate} disabled={!form.weight || !form.height || !form.age}
              style={{ width: '100%', backgroundColor: '#E8542E', color: '#0E0D0B', padding: '16px', fontSize: '16px', fontWeight: '800', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Generate my plan →
            </button>
          </div>
        )}

        {stage === 'plan' && plan && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
              <h2 className="stencil-font" style={{ fontSize: '32px' }}>Your plan</h2>
              <button onClick={() => setStage('form')} style={{ fontSize: '12px', color: '#A39A82', background: 'none', border: 'none', cursor: 'pointer' }}>← Edit details</button>
            </div>

            <div style={{ backgroundColor: '#1A1712', padding: '24px', marginBottom: '24px', border: '1px solid #3A3528' }}>
              <div className="stencil-font" style={{ fontSize: '56px', color: '#E8DCC4' }}>{plan.calorieTarget}</div>
              <div style={{ color: '#A39A82', fontSize: '12px', marginBottom: '16px' }}>kcal / day target</div>
              {[['Protein', plan.proteinG, '#9CAA5C'], ['Carbs', plan.carbG, '#E8542E'], ['Fats', plan.fatG, '#8B6F56']].map(([label, g, color]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ width: '60px', textAlign: 'right', fontSize: '11px', color: '#A39A82' }}>{label}</div>
                  <div style={{ flex: 1, backgroundColor: '#241F16', height: '8px', borderRadius: '2px' }}>
                    <div style={{ width: `${Math.min(100, (g / Math.max(plan.proteinG, plan.carbG, plan.fatG)) * 100)}%`, height: '100%', backgroundColor: color, borderRadius: '2px' }} />
                  </div>
                  <div style={{ width: '50px', fontWeight: '800', color, fontSize: '14px' }}>{g}g</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', overflowX: 'auto' }}>
              {WEEK_DAYS.map((d, di) => (
                <button key={d} onClick={() => setSelectedDay(di)}
                  style={{ flex: 1, minWidth: '48px', padding: '10px 4px', border: `2px solid ${selectedDay === di ? '#E8542E' : '#3A3528'}`, backgroundColor: selectedDay === di ? 'rgba(232,84,46,0.1)' : 'transparent', borderRadius: '4px', cursor: 'pointer' }}>
                  <div style={{ fontSize: '10px', color: selectedDay === di ? '#E8542E' : '#A39A82', fontWeight: '700' }}>{d}</div>
                  <div style={{ fontSize: '9px', color: plan.weeklySchedule[di] ? '#9CAA5C' : '#5C5747', marginTop: '2px' }}>
                    {plan.weeklySchedule[di] ? 'train' : 'rest'}
                  </div>
                </button>
              ))}
            </div>

            <div style={{ backgroundColor: '#1A1712', padding: '20px', marginBottom: '24px', border: '1px solid #3A3528' }}>
              <h3 style={{ color: '#9CAA5C', fontWeight: '800', marginBottom: '16px', fontSize: '16px' }}>
                {WEEK_DAYS[selectedDay]}'s workout — {plan.weeklySchedule[selectedDay] ? DAY_LABELS[plan.weeklySchedule[selectedDay]] : 'Rest Day'}
              </h3>
              {plan.weeklySchedule[selectedDay] ? (
                EXERCISE_LIBRARY[plan.weeklySchedule[selectedDay]].map((ex, idx) => (
                  <div key={ex.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid #2A2719' }}>
                    <div style={{ fontWeight: '800', fontSize: '20px', color: '#3A3528', minWidth: '28px' }}>{String(idx+1).padStart(2,'0')}</div>
                    <div style={{ flex: 1, fontWeight: '600' }}>{ex.name}</div>
                    <div style={{ color: '#E8542E', fontWeight: '700', fontSize: '13px' }}>{ex.sets[form.experience]}</div>
                    {isStandard && (
                      <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + ' proper form')}`}
                        target="_blank" rel="noreferrer"
                        style={{ color: '#9CAA5C', fontSize: '11px', textDecoration: 'none', border: '1px solid #9CAA5C', padding: '2px 8px', borderRadius: '3px' }}>
                        ▶ Video
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <p style={{ color: '#A39A82', fontSize: '14px' }}>Rest day — light walking or stretching is fine.</p>
              )}
            </div>

            <div style={{ backgroundColor: '#1A1712', padding: '20px', border: '1px solid #3A3528' }}>
              <h3 style={{ color: '#E8542E', fontWeight: '800', marginBottom: '4px', fontSize: '16px' }}>{WEEK_DAYS[selectedDay]}'s meals</h3>
              <p style={{ color: '#6B6452', fontSize: '12px', marginBottom: '16px' }}>
                {isPro ? 'Full recipes unlocked.' : isStandard ? 'Upgrade to Pro to unlock full recipes.' : 'Upgrade to Standard or Pro for more features.'}
              </p>
              {[
                ['Breakfast', `~${Math.round(plan.proteinG * 0.25)}g protein`, '420 kcal'],
                ['Mid-morning snack', `~${Math.round(plan.proteinG * 0.12)}g protein`, '200 kcal'],
                ['Lunch', `~${Math.round(plan.proteinG * 0.28)}g protein`, '560 kcal'],
                ['Evening snack', `~${Math.round(plan.proteinG * 0.1)}g protein`, '180 kcal'],
                ['Dinner', `~${Math.round(plan.proteinG * 0.25)}g protein`, '520 kcal'],
              ].map(([name, protein, kcal]) => (
                <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #2A2719' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{name}</div>
                    <div style={{ color: '#6B6452', fontSize: '12px' }}>{kcal}</div>
                  </div>
                  <div style={{ color: '#9CAA5C', fontWeight: '700', fontSize: '14px' }}>{protein}</div>
                </div>
              ))}
            </div>

            {!isPro && (
              <div style={{ marginTop: '24px', padding: '20px', border: '2px solid #E8542E', backgroundColor: 'rgba(232,84,46,0.05)', borderRadius: '4px', textAlign: 'center' }}>
                <p style={{ color: '#E8DCC4', marginBottom: '12px', fontSize: '14px' }}>Unlock full recipes, Gym Bro chat, and smart compensation with Pro</p>
                <button onClick={() => router.push('/pricing')}
                  style={{ backgroundColor: '#E8542E', color: '#0E0D0B', padding: '10px 24px', border: 'none', borderRadius: '4px', fontWeight: '800', cursor: 'pointer' }}>
                  Upgrade to Pro — ₹15/mo
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
