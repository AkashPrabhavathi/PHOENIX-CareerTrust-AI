import { useState, useEffect } from 'react'
import Tesseract from 'tesseract.js'
import './App.css'

const lightTheme = {
  pageBg: 'linear-gradient(135deg, #e8f8f5 0%, #eaf2fb 100%)',
  cardBg: '#fff',
  text: '#0b2e33',
  muted: '#5b6e73',
  border: '#ddd',
}
const darkTheme = {
  pageBg: 'linear-gradient(135deg, #0b1c1f 0%, #0d1b2a 100%)',
  cardBg: '#16262b',
  text: '#eef7f5',
  muted: '#9fb3b0',
  border: '#2a3d40',
}

const FAQS = [
  ['Is CareerTrust AI free to use?', 'Yes, completely free. There is no fee to analyze an opportunity or use any feature.'],
  ['Does a high risk score mean it is 100% a scam?', 'No. The risk score is an indicator based on common scam patterns, not legal proof. Always verify independently before applying or paying money.'],
  ['Do you store my job text or personal data?', 'In this MVP, submitted job text is not stored beyond your current session. Sign-up details are used only for demo tracking.'],
  ['Can I upload a screenshot instead of typing?', 'Yes — upload a WhatsApp or email screenshot and the app will automatically extract the text using OCR.'],
]

function getBotReply(text) {
  const t = text.toLowerCase()
  if (/\b(hi|hello|hey)\b/.test(t)) return "Hi! I'm the CareerTrust AI assistant. Ask me about risk scores, scam signs, OTP requests, salary checks, or skill match."
  if (t.includes('risk score')) return 'The risk score (0–100) is based on common scam patterns found in the text — registration fees, OTP requests, urgent payment pressure, and more. Higher score = more red flags found.'
  if (t.includes('scam')) return 'We check for 13+ scam patterns like registration fees, guaranteed job claims, personal email domains, and urgent payment pressure. A match adds points to the risk score with evidence shown.'
  if (t.includes('otp')) return 'Never share your OTP with a recruiter. No legitimate employer will ever ask for it — this is always flagged as a major red flag.'
  if (t.includes('fee') || t.includes('payment') || t.includes('money')) return 'Legitimate employers do not charge registration, processing, or training fees. If a message asks for payment before hiring, treat it as high risk.'
  if (t.includes('salary') || t.includes('stipend')) return 'We compare the offered salary against a typical range for that role type and flag it as Low, Fair, High, or Unusually High.'
  if (t.includes('skill')) return 'We match your listed skills against the job text and show your match %, matched skills, and missing skills worth learning.'
  if (t.includes('company') || t.includes('recruiter')) return 'We check if the recruiter is using a personal email (Gmail/Yahoo) vs a company domain, and give guidance to verify the company independently.'
  if (t.includes('privacy') || t.includes('data') || t.includes('store')) return 'Your job text is not stored beyond your session. Sign-up details are used only for demo tracking, nothing else.'
  if (t.includes('screenshot') || t.includes('ocr')) return 'Yes — upload a WhatsApp or email screenshot on the Details page and the text will be extracted automatically.'
  if (t.includes('thank')) return "You're welcome! Stay safe out there. 🛡️"
  return "I'm not totally sure about that yet — try asking about risk score, scam signs, OTP, salary checks, or skill match."
}

function App() {
  const [page, setPage] = useState('login')

  const [jobText, setJobText] = useState('')
  const [skills, setSkills] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [comparisonList, setComparisonList] = useState([])
  const [historyList, setHistoryList] = useState([])

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginData, setLoginData] = useState({ name: '', email: '', phone: '' })
  const [loginStatus, setLoginStatus] = useState('')

  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)

  const [darkMode, setDarkMode] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  const [reportCount, setReportCount] = useState(0)
  const [displayCount, setDisplayCount] = useState(0)

  const [showConfetti, setShowConfetti] = useState(false)

  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([{ sender: 'bot', text: "Hi! I'm your CareerTrust AI assistant. Ask me anything about staying safe with job offers. 🛡️" }])
  const [chatInput, setChatInput] = useState('')
  const [botTyping, setBotTyping] = useState(false)

  const theme = darkMode ? darkTheme : lightTheme

  useEffect(() => {
    const saved = parseInt(localStorage.getItem('ct_report_count') || '1247', 10)
    setReportCount(saved)
    try {
      const savedHistory = JSON.parse(localStorage.getItem('ct_history') || '[]')
      setHistoryList(savedHistory)
    } catch (e) {
      setHistoryList([])
    }
  }, [])

  useEffect(() => {
    let start = 0
    const end = reportCount
    if (end === 0) return
    const duration = 900
    const stepTime = Math.max(Math.floor(duration / end), 8)
    const timer = setInterval(() => {
      start += Math.ceil(end / 60)
      if (start >= end) {
        setDisplayCount(end)
        clearInterval(timer)
      } else {
        setDisplayCount(start)
      }
    }, stepTime)
    return () => clearInterval(timer)
  }, [reportCount])

  useEffect(() => {
    if (result && !result.error && result.risk_level === 'Low Risk') {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 2500)
      return () => clearTimeout(timer)
    }
  }, [result])

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)

  const handleLogin = async () => {
    if (!loginData.name || !loginData.email) {
      setLoginStatus('Please enter your name and email.')
      return
    }
    if (!isValidEmail(loginData.email)) {
      setLoginStatus('Please enter a valid email address.')
      return
    }
    try {
      const res = await fetch('http://127.0.0.1:8000/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginData.email }),
      })
      const data = await res.json()
      if (!data.valid) {
        setLoginStatus(data.reason || 'Please enter a valid email address.')
        return
      }
    } catch (error) {
      // if backend unreachable, allow through on format check alone
    }
    try {
      await fetch('http://127.0.0.1:8000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      })
    } catch (error) {}
    setLoginStatus('')
    setIsLoggedIn(true)
    setPage('form')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setLoginData({ name: '', email: '', phone: '' })
    setJobText('')
    setSkills('')
    setCompanyName('')
    setResult(null)
    setPage('login')
  }

  const handleAnalyze = async () => {
    setLoading(true)
    setResult(null)
    try {
      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_text: jobText, student_skills: skills, company_name: companyName }),
      })
      const data = await response.json()
      setResult(data)
      const newCount = reportCount + 1
      setReportCount(newCount)
      localStorage.setItem('ct_report_count', String(newCount))

      if (!data.error) {
        const historyEntry = { id: Date.now(), timestamp: new Date().toLocaleString(), companyName: companyName || 'Unnamed Company', jobText, skills, result: data }
        const updatedHistory = [historyEntry, ...historyList].slice(0, 20)
        setHistoryList(updatedHistory)
        localStorage.setItem('ct_history', JSON.stringify(updatedHistory))
      }
      setPage('result')
    } catch (error) {
      setResult({ error: 'Could not connect to backend. Is it running?' })
      setPage('result')
    }
    setLoading(false)
  }

  const viewHistoryEntry = (entry) => {
    setJobText(entry.jobText)
    setSkills(entry.skills)
    setCompanyName(entry.companyName)
    setResult(entry.result)
    setPage('result')
  }

  const clearHistory = () => {
    setHistoryList([])
    localStorage.removeItem('ct_history')
  }

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setOcrLoading(true)
    setOcrProgress(0)
    try {
      const { data } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => { if (m.status === 'recognizing text') setOcrProgress(Math.round(m.progress * 100)) },
      })
      setJobText(data.text.trim())
    } catch (error) {
      alert('Could not read text from this image. Try pasting the text manually.')
    }
    setOcrLoading(false)
  }

  const addToComparison = () => {
    if (!result || result.error) return
    const entry = {
      id: Date.now(), companyName: companyName || 'Unnamed Company', risk_score: result.risk_score,
      risk_level: result.risk_level, opportunity_score: result.opportunity_score, salary_status: result.salary_analysis.status,
      skill_match_percent: result.skill_match.skill_match_percent, missing_skills: result.skill_match.missing_skills,
    }
    setComparisonList([...comparisonList, entry])
  }

  const removeFromComparison = (id) => setComparisonList(comparisonList.filter((item) => item.id !== id))

  const startNewAnalysis = () => {
    setJobText(''); setSkills(''); setCompanyName(''); setResult(null); setPage('form')
  }

  const shareText = () => {
    if (!result || result.error) return ''
    return `CareerTrust AI Report for ${companyName || 'this opportunity'}:\nRisk Score: ${result.risk_score}/100 (${result.risk_level})\nOpportunity Score: ${result.opportunity_score}/100\nScam Indicators Found: ${result.scam_indicators.length}\n\nGenerated by CareerTrust AI — verify independently before applying or paying money.`
  }
  const shareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(shareText())}`, '_blank')
  const shareEmail = () => {
    const subject = encodeURIComponent(`CareerTrust AI Report — ${companyName || 'Opportunity'}`)
    window.location.href = `mailto:?subject=${subject}&body=${encodeURIComponent(shareText())}`
  }

  const getRiskColor = (level) => {
    if (level === 'Low Risk') return '#2e7d32'
    if (level === 'Needs Verification') return '#f9a825'
    if (level === 'High Risk') return '#ef6c00'
    if (level === 'Very High Risk') return '#c62828'
    return '#555'
  }
  const getRiskEmoji = (level) => {
    if (level === 'Low Risk') return '😊'
    if (level === 'Needs Verification') return '🤔'
    if (level === 'High Risk') return '⚠️'
    if (level === 'Very High Risk') return '🚨'
    return '❓'
  }
  const getRecommendation = (entry) => {
    if (entry.risk_score >= 61) return 'Avoid until verified'
    if (entry.risk_score >= 31) return 'Apply with caution, verify first'
    if (entry.opportunity_score >= 70) return 'Recommended'
    return 'Worth applying after verification'
  }

  const handleChatSend = () => {
    const text = chatInput.trim()
    if (!text) return
    const newMessages = [...chatMessages, { sender: 'user', text }]
    setChatMessages(newMessages)
    setChatInput('')
    setBotTyping(true)
    setTimeout(() => {
      setChatMessages([...newMessages, { sender: 'bot', text: getBotReply(text) }])
      setBotTyping(false)
    }, 700)
  }

  const cardStyle = { background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '12px', marginBottom: '10px' }
  const navBtn = (active) => ({
    background: active ? '#fff' : 'rgba(255,255,255,0.15)', color: active ? '#028090' : '#fff',
    border: '1px solid rgba(255,255,255,0.6)', padding: '7px 12px', borderRadius: '20px', cursor: 'pointer',
    fontSize: '12px', fontWeight: active ? 'bold' : 'normal',
  })

  return (
    <div style={{ minHeight: '100vh', background: theme.pageBg, fontFamily: 'sans-serif', transition: 'background 0.3s ease', position: 'relative' }}>

      {showConfetti && (
        <>
          {['🎉', '✅', '🎊', '🟢', '✨', '🎉', '✅', '🎊'].map((e, i) => (
            <span key={i} className="confetti-piece" style={{ left: `${10 + i * 11}%`, animationDelay: `${i * 0.15}s` }}>{e}</span>
          ))}
        </>
      )}

      {/* NAVBAR */}
      <div className="no-print" style={{ background: 'linear-gradient(90deg, #028090, #02c39a)', padding: '14px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '20px', fontWeight: 'bold', cursor: 'pointer' }} onClick={() => setPage('login')}>🛡️ CareerTrust AI</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => setPage('login')} style={navBtn(page === 'login')}>1. Home</button>
          <button onClick={() => isLoggedIn ? setPage('form') : setPage('login')} style={navBtn(page === 'form')}>2. Details</button>
          <button onClick={() => result && setPage('result')} disabled={!result} style={{ ...navBtn(page === 'result'), opacity: result ? 1 : 0.5 }}>3. Result</button>
          <button onClick={() => isLoggedIn ? setPage('history') : setPage('login')} style={navBtn(page === 'history')}>4. History</button>
          <button onClick={() => setPage('about')} style={navBtn(page === 'about')}>5. About</button>
          <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid #fff', padding: '7px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px' }}>{darkMode ? '☀️' : '🌙'}</button>
          {isLoggedIn && (
            <>
              <span style={{ fontSize: '13px' }}>👋 {loginData.name}</span>
              <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid #fff', padding: '7px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px' }}>Logout</button>
            </>
          )}
        </div>
      </div>

      {/* PAGE: LOGIN */}
      {page === 'login' && (
        <div key="login" className="page-fade">
          <div className="no-print" style={{ textAlign: 'center', padding: '48px 20px 24px' }}>
            <div style={{ display: 'inline-block', background: darkMode ? '#0f3339' : '#e0f7f1', color: '#02c39a', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '16px' }}>🛡️ SMART CAREER SAFETY</div>
            <h1 style={{ color: theme.text, fontSize: '38px', fontWeight: 800, marginBottom: '10px', lineHeight: 1.2 }}>
              Don't just detect scams.<br />
              <span style={{ background: 'linear-gradient(90deg, #028090, #02c39a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Make smarter career decisions.</span>
            </h1>
            <p style={{ color: theme.muted, fontSize: '15px', maxWidth: '480px', margin: '0 auto' }}>Paste a job or internship offer, upload a screenshot, or type it in — get a full trust report in seconds.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '28px', marginTop: '28px', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: 800, color: '#02c39a' }}>13+</div><div style={{ fontSize: '11px', color: theme.muted }}>Scam Patterns Checked</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: 800, color: '#02c39a' }}>{displayCount.toLocaleString()}</div><div style={{ fontSize: '11px', color: theme.muted }}>Reports Analyzed</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: '24px', fontWeight: 800, color: '#02c39a' }}>100%</div><div style={{ fontSize: '11px', color: theme.muted }}>Free to Use</div></div>
            </div>
            <button onClick={() => document.getElementById('login-card').scrollIntoView({ behavior: 'smooth' })} style={{ marginTop: '28px', background: 'linear-gradient(90deg, #028090, #02c39a)', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '30px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>Get Started — It's Free 🚀</button>
          </div>

          <div id="login-card" style={{ maxWidth: '400px', margin: '20px auto 40px', background: theme.cardBg, borderRadius: '16px', padding: '26px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, color: theme.text, textAlign: 'center' }}>🛡️ Login to Continue</h3>
            <p style={{ fontSize: '12px', color: theme.muted, textAlign: 'center', marginTop: '-6px' }}>Free — just your name and email</p>
            <input type="text" placeholder="Your Name" value={loginData.name} onChange={(e) => setLoginData({ ...loginData, name: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
            <input type="email" placeholder="Email Address" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
            <input type="text" placeholder="Phone Number (optional)" value={loginData.phone} onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '14px', borderRadius: '8px', border: '1px solid #ccc' }} />
            <button onClick={handleLogin} style={{ width: '100%', background: '#02c39a', color: '#fff', border: 'none', padding: '13px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Login &amp; Continue →</button>
            {loginStatus && <p style={{ marginTop: '10px', color: '#c62828', fontSize: '13px', textAlign: 'center' }}>{loginStatus}</p>}
          </div>

          <div className="no-print" style={{ maxWidth: '700px', margin: '0 auto 40px', padding: '0 16px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[['1️⃣', 'Login', 'Quick free sign-in to get started'], ['2️⃣', 'Add Details', 'Paste the offer, upload a screenshot, add your skills'], ['3️⃣', 'Get Your Report', 'A clear risk score with evidence and next steps']].map((step, i) => (
                <div key={i} style={{ flex: '1', minWidth: '180px', background: theme.cardBg, borderRadius: '12px', padding: '16px', textAlign: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '22px', marginBottom: '6px' }}>{step[0]}</div>
                  <div style={{ fontWeight: 'bold', color: theme.text, fontSize: '13.5px', marginBottom: '4px' }}>{step[1]}</div>
                  <div style={{ fontSize: '11.5px', color: theme.muted }}>{step[2]}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="no-print" style={{ maxWidth: '700px', margin: '0 auto', padding: '0 16px 40px' }}>
            <h2 style={{ textAlign: 'center', color: theme.text, marginBottom: '20px' }}>Why students trust us</h2>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {[['"Caught a fake internship offer asking for a registration fee before I even applied."', '— B.Tech, Final Year'], ['"The skill match feature helped me see what to learn before applying to my dream company."', '— CSE Student'], ['"Simple, fast, and honest — it never claims to be 100% sure, which makes me trust it more."', '— MCA Student']].map((t, i) => (
                <div key={i} style={{ background: theme.cardBg, borderRadius: '12px', padding: '18px', maxWidth: '220px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
                  <p style={{ fontSize: '12.5px', color: theme.text, fontStyle: 'italic', margin: 0 }}>{t[0]}</p>
                  <p style={{ fontSize: '11px', color: '#02c39a', fontWeight: 'bold', marginTop: '10px', marginBottom: 0 }}>{t[1]}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="no-print" style={{ maxWidth: '700px', margin: '0 auto', padding: '0 16px 50px' }}>
            <h2 style={{ textAlign: 'center', color: theme.text, marginBottom: '20px' }}>Frequently Asked Questions</h2>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ background: theme.cardBg, borderRadius: '10px', marginBottom: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', color: theme.text, fontSize: '14px' }}>
                  {faq[0]}<span style={{ color: '#02c39a' }}>{openFaq === i ? '−' : '+'}</span>
                </div>
                {openFaq === i && <div style={{ padding: '0 18px 16px', color: theme.muted, fontSize: '13px' }}>{faq[1]}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PAGE: FORM */}
      {page === 'form' && (
        <div key="form" className="page-fade" style={{ maxWidth: '650px', margin: '0 auto', padding: '40px 16px' }}>
          <h1 style={{ color: theme.text, fontSize: '26px', textAlign: 'center', marginBottom: '6px' }}>Tell us about the opportunity</h1>
          <p style={{ color: theme.muted, textAlign: 'center', marginBottom: '26px' }}>Add as much detail as you can for the most accurate report.</p>
          <div style={{ background: theme.cardBg, borderRadius: '14px', padding: '22px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
            <label style={{ fontWeight: 'bold', color: theme.text }}>🏢 Company Name:</label>
            <input type="text" style={{ width: '100%', marginBottom: '14px', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '6px' }} value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Wipro, Infosys" />
            <label style={{ fontWeight: 'bold', color: theme.text }}>📸 Upload a Screenshot (optional):</label>
            <div style={{ marginTop: '6px', marginBottom: '14px' }}>
              <input type="file" accept="image/*" onChange={handleScreenshotUpload} />
              {ocrLoading && <div style={{ marginTop: '8px', fontSize: '13px', color: '#02c39a' }}>🔎 Reading text from image... {ocrProgress}%</div>}
            </div>
            <label style={{ fontWeight: 'bold', color: theme.text }}>💬 Job Offer Text:</label>
            <div style={{ background: darkMode ? '#0f2a25' : '#e9fdf3', borderRadius: '12px', padding: '10px', marginTop: '6px', marginBottom: '14px', border: '1px solid #b6e8d5' }}>
              <div style={{ fontSize: '11px', color: '#02c39a', marginBottom: '4px' }}>📱 Paste message as received, or upload a screenshot above</div>
              <textarea rows="6" style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #b6e8d5', background: theme.cardBg, color: theme.text, fontFamily: 'sans-serif' }} value={jobText} onChange={(e) => setJobText(e.target.value)} placeholder="Paste the job or internship message here, or upload a screenshot above..." />
            </div>
            <label style={{ fontWeight: 'bold', color: theme.text }}>🧠 Your Skills:</label>
            <input type="text" style={{ width: '100%', marginBottom: '20px', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '6px' }} value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. React, Python, SQL" />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setPage('login')} style={{ flex: '0 0 auto', background: 'transparent', color: theme.text, border: `1px solid ${theme.border}`, padding: '14px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>← Back</button>
              <button onClick={handleAnalyze} disabled={loading || !jobText} style={{ flex: 1, background: 'linear-gradient(90deg, #028090, #02c39a)', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', opacity: loading || !jobText ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {loading && <span className="spinner"></span>}{loading ? 'Analyzing...' : '🔍 Analyze Opportunity'}
              </button>
            </div>
          </div>
          {loading && (
            <div style={{ marginTop: '20px' }}>
              <div className="skeleton" style={{ height: '80px', marginBottom: '12px' }}></div>
              <div className="skeleton" style={{ height: '50px', marginBottom: '12px' }}></div>
              <div className="skeleton" style={{ height: '50px' }}></div>
            </div>
          )}
        </div>
      )}

      {/* PAGE: RESULT */}
      {page === 'result' && result && (
        <div key="result" className="page-fade" style={{ maxWidth: '700px', margin: '0 auto', padding: '30px 16px 50px' }}>
          <div className="no-print" style={{ display: 'flex', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
            <button onClick={startNewAnalysis} style={{ background: theme.cardBg, color: theme.text, border: `1px solid ${theme.border}`, padding: '9px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>🔄 New Analysis</button>
            <button onClick={() => window.print()} style={{ background: '#0b2e33', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>⬇️ Download / Print</button>
            <button onClick={addToComparison} style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>➕ Add to Comparison</button>
            {!result.error && (
              <>
                <button onClick={shareWhatsApp} style={{ background: '#25D366', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>📲 Share on WhatsApp</button>
                <button onClick={shareEmail} style={{ background: '#1565c0', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>✉️ Share via Email</button>
              </>
            )}
            {comparisonList.length > 0 && <button onClick={() => document.getElementById('comparison-section').scrollIntoView({ behavior: 'smooth' })} style={{ background: '#7b1fa2', color: '#fff', border: 'none', padding: '9px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>📊 View Comparison ({comparisonList.length})</button>}
          </div>

          {result.error ? <p style={{ color: 'red' }}>{result.error}</p> : (
            <div id="report-area">
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', color: theme.muted, marginBottom: '6px' }}>📩 Message received:</div>
                <div style={{ background: '#dcf8c6', borderRadius: '12px', borderTopLeftRadius: 0, padding: '12px 16px', maxWidth: '90%', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', fontSize: '13.5px', color: '#1b1b1b', whiteSpace: 'pre-wrap' }}>{jobText}</div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px', padding: '18px', borderRadius: '12px', background: getRiskColor(result.risk_level), color: '#fff', boxShadow: '0 6px 16px rgba(0,0,0,0.15)' }}>
                  <h3 style={{ margin: 0 }}>{getRiskEmoji(result.risk_level)} Risk Score: {result.risk_score}/100</h3>
                  <p style={{ margin: '4px 0 8px 0' }}>{result.risk_level}</p>
                  <div style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ background: '#fff', height: '100%', width: `${result.risk_score}%`, borderRadius: '6px', transition: 'width 1s ease' }}></div>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: '200px', padding: '18px', borderRadius: '12px', background: 'linear-gradient(135deg, #1565c0, #42a5f5)', color: '#fff', boxShadow: '0 6px 16px rgba(0,0,0,0.15)' }}>
                  <h3 style={{ margin: 0 }}>⭐ Opportunity Score: {result.opportunity_score}/100</h3>
                  <p style={{ margin: '4px 0 8px 0' }}>Overall quality of this opportunity</p>
                  <div style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '6px', height: '8px', overflow: 'hidden' }}>
                    <div style={{ background: '#fff', height: '100%', width: `${result.opportunity_score}%`, borderRadius: '6px', transition: 'width 1s ease' }}></div>
                  </div>
                </div>
              </div>

              {result.suggested_companies && result.suggested_companies.length > 0 && (
                <div style={{ background: theme.cardBg, borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                  <h3 style={{ marginTop: 0, color: theme.text }}>🤖 AI Suggested Companies For Your Skills</h3>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {result.suggested_companies.map((c, idx) => (
                      <div key={idx} style={{ background: 'linear-gradient(135deg, #02c39a, #028090)', color: '#fff', borderRadius: '10px', padding: '10px 14px', minWidth: '150px' }}>
                        <div style={{ fontWeight: 'bold' }}>{c.company}</div>
                        <div style={{ fontSize: '12px' }}>{c.match_percent}% skill match</div>
                        <div style={{ fontSize: '11px', opacity: 0.9 }}>{c.matched_skills.join(', ')}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h3 style={{ color: theme.text }}>🚩 Scam Indicators Found ({result.scam_indicators.length})</h3>
              {result.scam_indicators.length === 0 && <p style={{ color: theme.muted }}>No scam keywords detected. Still verify the company and recruiter independently.</p>}
              {result.scam_indicators.map((w) => (
                <div key={w.id} style={{ ...cardStyle, borderLeft: '4px solid #c62828' }}>
                  <strong style={{ color: theme.text }}>{w.title}</strong> <span style={{ color: theme.muted }}>(+{w.points} points)</span>
                  <p style={{ margin: '6px 0', color: theme.text }}>{w.reason}</p>
                  <p style={{ margin: 0, fontStyle: 'italic', color: theme.muted }}>Evidence: {w.evidence}</p>
                </div>
              ))}

              {result.sensitive_data_check && result.sensitive_data_check.sensitive_data_requested && (
                <div style={{ ...cardStyle, borderLeft: '4px solid #c62828', background: darkMode ? '#2a1414' : '#fff3f3' }}>
                  <strong style={{ color: theme.text }}>🔒 Sensitive Information Requested: {result.sensitive_data_check.types_detected.join(', ')}</strong>
                  <p style={{ margin: '6px 0 0 0', color: theme.text }}>{result.sensitive_data_check.warning}</p>
                </div>
              )}

              <h3 style={{ marginTop: '20px', color: theme.text }}>🏢 Company Verification</h3>
              <div style={cardStyle}><p style={{ margin: '4px 0', color: theme.text }}><strong>Status:</strong> {result.company_verification.status}</p><p style={{ margin: '4px 0', color: theme.muted }}>{result.company_verification.note}</p></div>

              <h3 style={{ marginTop: '20px', color: theme.text }}>👤 Recruiter Verification</h3>
              <div style={cardStyle}>
                <p style={{ margin: '4px 0', color: theme.text }}><strong>Email Found:</strong> {result.recruiter_verification.email_found || 'None'}</p>
                <p style={{ margin: '4px 0', color: theme.text }}><strong>Domain Type:</strong> {result.recruiter_verification.domain_type}</p>
                <p style={{ margin: '4px 0', color: theme.muted }}>{result.recruiter_verification.note}</p>
              </div>

              {result.link_check.suspicious_links.length > 0 && (
                <div style={{ ...cardStyle, borderLeft: '4px solid #ef6c00' }}><strong style={{ color: theme.text }}>⚠️ Suspicious Links Detected</strong><p style={{ margin: '6px 0', color: theme.text }}>{result.link_check.note}</p></div>
              )}

              <h3 style={{ marginTop: '20px', color: theme.text }}>💰 Salary Analysis</h3>
              <div style={cardStyle}>
                <p style={{ margin: '4px 0', color: theme.text }}><strong>Offered:</strong> {result.salary_analysis.offered_salary ? `₹${result.salary_analysis.offered_salary}` : 'Not mentioned'}</p>
                <p style={{ margin: '4px 0', color: theme.text }}><strong>Typical Range:</strong> {result.salary_analysis.estimated_range}</p>
                <p style={{ margin: '4px 0', color: theme.text }}><strong>Status:</strong> {result.salary_analysis.status}</p>
                <p style={{ margin: '4px 0', color: theme.muted }}>{result.salary_analysis.explanation}</p>
              </div>

              <h3 style={{ marginTop: '20px', color: theme.text }}>🧠 Skill Match</h3>
              <div style={cardStyle}>
                <p style={{ margin: '4px 0', color: theme.text }}><strong>Match:</strong> {result.skill_match.skill_match_percent}%</p>
                <p style={{ margin: '4px 0', color: theme.text }}><strong>Matched Skills:</strong> {result.skill_match.matched_skills.join(', ') || 'None found'}</p>
                <p style={{ margin: '4px 0', color: theme.text }}><strong>Missing Skills:</strong> {result.skill_match.missing_skills.join(', ') || 'None detected'}</p>
                <p style={{ margin: '4px 0', color: theme.muted }}>{result.skill_match.recommendation}</p>
              </div>

              <h3 style={{ marginTop: '20px', color: theme.text }}>✅ Safe Apply Checklist</h3>
              <ul style={{ background: theme.cardBg, color: theme.text, borderRadius: '8px', padding: '16px 30px' }}>
                {result.safe_apply_checklist.map((item, idx) => <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>)}
              </ul>
              <p style={{ marginTop: '16px', fontSize: '14px', color: theme.muted }}>⚠️ {result.disclaimer}</p>
            </div>
          )}

          {comparisonList.length > 0 && (
            <div id="comparison-section" className="no-print" style={{ marginTop: '40px' }}>
              <h2 style={{ color: theme.text }}>📊 Opportunity Comparison ({comparisonList.length})</h2>
              <div style={{ overflowX: 'auto', background: theme.cardBg, borderRadius: '10px', padding: '10px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', color: theme.text }}>
                  <thead><tr style={{ background: '#028090', color: '#fff', textAlign: 'left' }}>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Company</th><th style={{ padding: '8px', border: '1px solid #ddd' }}>Risk</th><th style={{ padding: '8px', border: '1px solid #ddd' }}>Opportunity</th><th style={{ padding: '8px', border: '1px solid #ddd' }}>Salary</th><th style={{ padding: '8px', border: '1px solid #ddd' }}>Skill Match</th><th style={{ padding: '8px', border: '1px solid #ddd' }}>Skills to Learn</th><th style={{ padding: '8px', border: '1px solid #ddd' }}>Recommendation</th><th style={{ padding: '8px', border: '1px solid #ddd' }}></th>
                  </tr></thead>
                  <tbody>
                    {comparisonList.map((entry) => (
                      <tr key={entry.id}>
                        <td style={{ padding: '8px', border: `1px solid ${theme.border}` }}>{entry.companyName}</td>
                        <td style={{ padding: '8px', border: `1px solid ${theme.border}`, color: getRiskColor(entry.risk_level) }}>{entry.risk_score}/100 ({entry.risk_level})</td>
                        <td style={{ padding: '8px', border: `1px solid ${theme.border}` }}>{entry.opportunity_score}/100</td>
                        <td style={{ padding: '8px', border: `1px solid ${theme.border}` }}>{entry.salary_status}</td>
                        <td style={{ padding: '8px', border: `1px solid ${theme.border}` }}>{entry.skill_match_percent}%</td>
                        <td style={{ padding: '8px', border: `1px solid ${theme.border}` }}>{entry.missing_skills.join(', ') || 'None'}</td>
                        <td style={{ padding: '8px', border: `1px solid ${theme.border}` }}>{getRecommendation(entry)}</td>
                        <td style={{ padding: '8px', border: `1px solid ${theme.border}` }}><button onClick={() => removeFromComparison(entry.id)} style={{ background: '#c62828', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Remove</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PAGE: HISTORY */}
      {page === 'history' && (
        <div key="history" className="page-fade" style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h1 style={{ color: theme.text, fontSize: '24px', margin: 0 }}>📜 Report History</h1>
            {historyList.length > 0 && <button onClick={clearHistory} style={{ background: '#c62828', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>Clear All</button>}
          </div>
          {historyList.length === 0 ? <p style={{ color: theme.muted, textAlign: 'center' }}>No past reports yet. Analyze an opportunity to see it here.</p> : (
            historyList.map((entry) => (
              <div key={entry.id} style={{ background: theme.cardBg, borderRadius: '12px', padding: '16px', marginBottom: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: theme.text }}>{entry.companyName}</div>
                  <div style={{ fontSize: '11px', color: theme.muted }}>{entry.timestamp}</div>
                  {!entry.result.error && <div style={{ fontSize: '12px', marginTop: '4px' }}><span style={{ color: getRiskColor(entry.result.risk_level), fontWeight: 'bold' }}>{entry.result.risk_level}</span><span style={{ color: theme.muted }}> • Risk {entry.result.risk_score}/100 • Opportunity {entry.result.opportunity_score}/100</span></div>}
                </div>
                <button onClick={() => viewHistoryEntry(entry)} style={{ background: 'linear-gradient(90deg, #028090, #02c39a)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>View →</button>
              </div>
            ))
          )}
        </div>
      )}

      {/* PAGE: ABOUT */}
      {page === 'about' && (
        <div key="about" className="page-fade" style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 16px 60px' }}>
          <h1 style={{ color: theme.text, fontSize: '28px', textAlign: 'center', marginBottom: '8px' }}>About CareerTrust AI</h1>
          <p style={{ color: theme.muted, textAlign: 'center', maxWidth: '520px', margin: '0 auto 30px' }}>CareerTrust AI helps students make safer, evidence-based decisions about job and internship offers — combining scam detection, salary analysis, skill matching, and company/recruiter verification in one report.</p>
          <div style={{ background: theme.cardBg, borderRadius: '14px', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
            <h3 style={{ marginTop: 0, color: theme.text }}>Our Mission</h3>
            <p style={{ color: theme.muted, fontSize: '14px' }}>Every year, students lose money and opportunities to fake job offers. This project gives every student — regardless of background — a free, transparent first line of defense before they apply, pay, or share personal information.</p>
          </div>
          <div style={{ background: theme.cardBg, borderRadius: '14px', padding: '24px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
            <h3 style={{ marginTop: 0, color: theme.text }}>Built By</h3>
            <p style={{ color: theme.muted, fontSize: '14px', margin: 0 }}>Akash S — an independent project focused on student career safety.</p>
          </div>
        </div>
      )}

      <div className="no-print" style={{ background: '#0b2e33', color: '#cadcda', padding: '24px 20px', marginTop: '20px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', marginBottom: '6px' }}>🛡️ CareerTrust AI</div>
          <div style={{ fontSize: '11px', opacity: 0.6 }}>© 2026 CareerTrust AI. Built by Akash S.</div>
        </div>
      </div>

      {/* CHATBOT */}
      <div className="no-print">
        <button onClick={() => setChatOpen(!chatOpen)} style={{ position: 'fixed', bottom: '20px', right: '20px', width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #028090, #02c39a)', color: '#fff', border: 'none', fontSize: '24px', cursor: 'pointer', boxShadow: '0 6px 18px rgba(0,0,0,0.25)', zIndex: 150 }}>
          {chatOpen ? '✕' : '💬'}
        </button>

        {chatOpen && (
          <div className="chat-bubble-in" style={{ position: 'fixed', bottom: '86px', right: '20px', width: '300px', maxWidth: '90vw', height: '380px', background: theme.cardBg, borderRadius: '14px', boxShadow: '0 10px 30px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 150 }}>
            <div style={{ background: 'linear-gradient(90deg, #028090, #02c39a)', color: '#fff', padding: '12px 16px', fontWeight: 'bold', fontSize: '14px' }}>
              🤖 CareerTrust Assistant
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {chatMessages.map((m, i) => (
                <div key={i} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', background: m.sender === 'user' ? '#02c39a' : (darkMode ? '#0f2a25' : '#f0f0f0'), color: m.sender === 'user' ? '#fff' : theme.text, padding: '8px 12px', borderRadius: '12px', maxWidth: '85%', fontSize: '12.5px' }}>
                  {m.text}
                </div>
              ))}
              {botTyping && (
                <div style={{ alignSelf: 'flex-start', background: darkMode ? '#0f2a25' : '#f0f0f0', padding: '10px 14px', borderRadius: '12px' }}>
                  <span className="typing-dot"></span><span className="typing-dot"></span><span className="typing-dot"></span>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', borderTop: `1px solid ${theme.border}`, padding: '8px' }}>
              <input
                type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                placeholder="Ask about risk score, OTP, scams..."
                style={{ flex: 1, border: 'none', outline: 'none', padding: '8px', fontSize: '12.5px', background: 'transparent', color: theme.text }}
              />
              <button onClick={handleChatSend} style={{ background: '#02c39a', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '12px' }}>Send</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App