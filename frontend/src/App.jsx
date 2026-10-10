import { useState, useEffect, useRef } from 'react'
import Tesseract from 'tesseract.js'
import './App.css'

const lightTheme = { pageBg: 'linear-gradient(135deg, #eefaf7 0%, #eaf1fb 100%)', cardBg: '#ffffff', text: '#08222a', muted: '#5f7378', border: '#e2e8e8' }
const darkTheme = { pageBg: 'linear-gradient(160deg, #071a1f 0%, #0a1626 100%)', cardBg: '#132126', text: '#f2fbf9', muted: '#8fa6a3', border: '#233234' }

const T = {
  en: {
    home: '1. Home', details: '2. Details', result: '3. Result', history: '4. History', about: '5. About', profile: '6. Profile',
    logout: 'Logout', scamNews: '🚨 Scam News', interviewTips: '💡 Interview Tips', careerGuide: '📚 Career Guide', reportScam: '🔴 Report Scam', scamMap: '🗺️ Scam Map',
    heroBadge: '🛡️ SMART CAREER SAFETY', heroLine1: "Don't just detect scams.", heroLine2: 'Make smarter career decisions.',
    heroSub: 'Paste a job or internship offer, upload a screenshot, or type it in — get a full trust report in seconds.',
    statPatterns: 'Scam Patterns Checked', statReports: 'Reports Analyzed', statFree: 'Free to Use', getStarted: "Get Started — It's Free 🚀",
    loginTitle: '🛡️ Login to Continue', loginSub: 'Free — just your name and email', namePh: 'Your Name', emailPh: 'Email Address', phonePh: 'Phone Number (optional)',
    loginBtn: 'Login & Continue →', formTitle: 'Tell us about the opportunity', formSub: 'Add as much detail as you can for the most accurate report.',
    companyLabel: '🏢 Company Name:', screenshotLabel: '📸 Upload a Screenshot (optional):', jobTextLabel: '💬 Job Offer Text:',
    jobTextHint: '📱 Paste message as received, upload a screenshot, or use the mic', skillsLabel: '🧠 Your Skills:', back: '← Back',
    analyzeBtn: '🔍 Analyze Opportunity', newAnalysis: '🔄 New Analysis', download: '⬇️ Download / Print', addCompare: '➕ Add to Comparison',
    shareWA: '📲 Share on WhatsApp', shareMail: '✉️ Share via Email', viewCompare: '📊 View Comparison', historyTitle: '📜 Report History',
    clearAll: 'Clear All', noHistory: 'No past reports yet. Analyze an opportunity to see it here.', view: 'View →',
    aboutTitle: 'About CareerTrust AI', profileTitle: '👤 My Profile', saveProfile: 'Save Profile', reportsCount: 'Reports Analyzed',
    memberSince: 'Member Since', defaultSkillsLabel: 'Default Skills (auto-filled in forms):',
  },
  ta: {
    home: '1. முகப்பு', details: '2. விவரங்கள்', result: '3. முடிவு', history: '4. வரலாறு', about: '5. எங்களைப் பற்றி', profile: '6. சுயவிவரம்',
    logout: 'வெளியேறு', scamNews: '🚨 ஏமாற்று செய்திகள்', interviewTips: '💡 நேர்காணல் குறிப்புகள்', careerGuide: '📚 கரியர் வழிகாட்டி', reportScam: '🔴 ஏமாற்று அறிக்கை', scamMap: '🗺️ ஏமாற்று வரைபடம்',
  },
}

const FAQS = [
  ['Is CareerTrust AI free to use?', 'Yes, completely free. There is no fee to analyze an opportunity or use any feature.'],
  ['Does a high risk score mean it is 100% a scam?', 'No. The risk score is an indicator based on common scam patterns, not legal proof. Always verify independently before applying or paying money.'],
  ['Do you store my job text or personal data?', 'In this MVP, submitted job text is not stored beyond your current session. Sign-up details are used only for demo tracking.'],
  ['Can I upload a screenshot instead of typing?', 'Yes — upload a WhatsApp or email screenshot and the app will automatically extract the text using OCR.'],
]

function BuildFX({ count = 8, radius = 34, className, durationMs = 600 }) {
  const shards = Array.from({ length: count })
  return shards.map((_, i) => {
    const angle = (i / count) * Math.PI * 2
    const sx = Math.cos(angle) * radius
    const sy = Math.sin(angle) * radius
    return (
      <span key={i} className={className} style={{ '--sx': `${sx}px`, '--sy': `${sy}px`, animationDelay: `${i * 12}ms`, animationDuration: `${durationMs}ms` }} />
    )
  })
}

function BuildIcon({ icon, trigger }) {
  return (
    <span className="build-icon-wrap" key={trigger}>
      <BuildFX count={8} radius={26} className="build-shard" durationMs={550} />
      <span className="build-icon-core">{icon}</span>
    </span>
  )
}

function SplashScreen({ visible }) {
  return (
    <div className={`splash-screen${visible ? '' : ' splash-out'}`}>
      <div className="splash-logo-wrap">
        <div className="splash-ring" />
        <BuildFX count={10} radius={70} className="splash-shard" durationMs={900} />
        <span className="splash-shield">🛡️</span>
      </div>
      <div className="splash-title">Career<span>Trust</span> AI</div>
      <div className="splash-sub">Smart Career Safety</div>
      <div className="splash-bar"><div className="splash-bar-fill" /></div>
    </div>
  )
}

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [splashFading, setSplashFading] = useState(false)
  const [page, setPage] = useState('login')
  const [lang, setLang] = useState('en')
  const L = T[lang]

  const [jobText, setJobText] = useState('')
  const [skills, setSkills] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [comparisonList, setComparisonList] = useState([])
  const [historyList, setHistoryList] = useState([])
  const [scamNewsList, setScamNewsList] = useState([])
  const [scamNewsLoading, setScamNewsLoading] = useState(false)

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginData, setLoginData] = useState({ name: '', email: '', phone: '' })
  const [loginStatus, setLoginStatus] = useState('')
  const [memberSince, setMemberSince] = useState('')
  const [defaultSkills, setDefaultSkills] = useState('')

  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef(null)

  const [darkMode, setDarkMode] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [reportCount, setReportCount] = useState(0)
  const [displayCount, setDisplayCount] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([{ sender: 'bot', text: "Hi! I'm your CareerTrust AI assistant. Ask me anything about staying safe with job offers. 🛡️" }])
  const [chatInput, setChatInput] = useState('')
  const [botTyping, setBotTyping] = useState(false)

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const theme = darkMode ? darkTheme : lightTheme

  useEffect(() => {
    const t1 = setTimeout(() => setSplashFading(true), 2000)
    const t2 = setTimeout(() => setShowSplash(false), 2500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  useEffect(() => {
    const saved = parseInt(localStorage.getItem('ct_report_count') || '1247', 10)
    setReportCount(saved)
    try { setHistoryList(JSON.parse(localStorage.getItem('ct_history') || '[]')) } catch (e) { setHistoryList([]) }
    const savedSkills = localStorage.getItem('ct_default_skills') || ''
    setDefaultSkills(savedSkills)
  }, [])

  useEffect(() => {
    let start = 0
    const end = reportCount
    if (end === 0) return
    const stepTime = Math.max(Math.floor(900 / end), 8)
    const timer = setInterval(() => {
      start += Math.ceil(end / 60)
      if (start >= end) { setDisplayCount(end); clearInterval(timer) } else setDisplayCount(start)
    }, stepTime)
    return () => clearInterval(timer)
  }, [reportCount])

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(email)

  const handleLogin = async () => {
    if (!loginData.name || !loginData.email) { setLoginStatus('Please enter your name and email.'); return }
    if (!isValidEmail(loginData.email)) { setLoginStatus('Please enter a valid email address.'); return }
    try {
      const res = await fetch('http://127.0.0.1:8000/verify-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: loginData.email }) })
      const data = await res.json()
      if (!data.valid) { setLoginStatus(data.reason || 'Please enter a valid email address.'); return }
    } catch (error) {}
    try { await fetch('http://127.0.0.1:8000/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginData) }) } catch (error) {}
    setLoginStatus('')
    setIsLoggedIn(true)
    const since = localStorage.getItem('ct_member_since') || new Date().toLocaleDateString()
    localStorage.setItem('ct_member_since', since)
    setMemberSince(since)
    if (defaultSkills) setSkills(defaultSkills)
    setPage('form')
  }

  const handleLogout = () => {
    setIsLoggedIn(false); setLoginData({ name: '', email: '', phone: '' }); setJobText(''); setSkills(''); setCompanyName(''); setResult(null); setPage('login')
  }

  const handleAnalyze = async () => {
    setLoading(true); setResult(null)
    try {
      const API = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'
      const response = await fetch(`${API}/analyze`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ job_text: jobText, student_skills: skills, company_name: companyName }) })
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
    } catch (error) { setResult({ error: 'Could not connect to backend. Is it running?' }); setPage('result') }
    setLoading(false)
  }

  const fetchScamNews = async () => {
    setScamNewsLoading(true)
    try {
      const API = import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'
      const response = await fetch(`${API}/scam-news`)
      const data = await response.json()
      setScamNewsList(data.articles || [])
    } catch (error) {
      console.error('Scam news error:', error)
      setScamNewsList([])
    }
    setScamNewsLoading(false)
  }

  useEffect(() => {
    if (page === 'scam-news' && scamNewsList.length === 0) {
      fetchScamNews()
    }
  }, [page])

  const viewHistoryEntry = (entry) => { setJobText(entry.jobText); setSkills(entry.skills); setCompanyName(entry.companyName); setResult(entry.result); setPage('result') }
  const clearHistory = () => { setHistoryList([]); localStorage.removeItem('ct_history') }

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return
    setOcrLoading(true); setOcrProgress(0)
    try {
      const { data } = await Tesseract.recognize(file, 'eng', { logger: (m) => { if (m.status === 'recognizing text') setOcrProgress(Math.round(m.progress * 100)) } })
      setJobText(data.text.trim())
    } catch (error) { alert('Could not read text from this image. Try pasting the text manually.') }
    setOcrLoading(false)
  }

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) { alert('Voice input is not supported in this browser.'); return }
    if (listening) { recognitionRef.current && recognitionRef.current.stop(); setListening(false); return }
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-IN'
    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setJobText((prev) => (prev ? prev + ' ' + transcript : transcript))
    }
    recognitionRef.current = recognition
    recognition.start()
  }

  const closeMenu = () => setMobileMenuOpen(false)
  const navBtn = (active) => ({ background: active ? '#fff' : 'rgba(255,255,255,0.15)', color: active ? '#028090' : '#fff', border: '1px solid rgba(255,255,255,0.6)', padding: '7px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: active ? 'bold' : 'normal' })
  const cardStyle = { background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '12px', marginBottom: '10px' }

  return (
    <div style={{ minHeight: '100vh', background: theme.pageBg, fontFamily: 'sans-serif', position: 'relative' }}>
      {showSplash && <SplashScreen visible={!splashFading} />}

      {showConfetti && ['🎉', '✅', '🎊'].map((e, i) => (
        <span key={i} className="confetti-piece" style={{ left: `${10 + i * 20}%`, animationDelay: `${i * 0.15}s` }}>{e}</span>
      ))}

      <button className="hamburger-btn no-print" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>☰</button>
      {mobileMenuOpen && <div className="sidebar-overlay no-print" onClick={() => setMobileMenuOpen(false)}></div>}

      <div className={`no-print sidebar${mobileMenuOpen ? ' mobile-open' : ''}`}>
        <div className="sidebar-brand" onClick={() => { setPage('login'); closeMenu() }}>
          <BuildIcon icon="🛡️" trigger={page} />
          <span>CareerTrust AI</span>
        </div>
        
        <button onClick={() => { setPage('login'); closeMenu() }} style={navBtn(page === 'login')}>🏠 {L.home}</button>
        <button onClick={() => { isLoggedIn ? setPage('form') : setPage('login'); closeMenu() }} style={navBtn(page === 'form')}>📋 {L.details}</button>
        <button onClick={() => { result && setPage('result'); closeMenu() }} disabled={!result} style={{ ...navBtn(page === 'result'), opacity: result ? 1 : 0.5 }}>✅ {L.result}</button>
        <button onClick={() => { isLoggedIn ? setPage('history') : setPage('login'); closeMenu() }} style={navBtn(page === 'history')}>📜 {L.history}</button>
        
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.2)', margin: '8px 0' }}></div>
        
        <button onClick={() => { setPage('scam-news'); closeMenu() }} style={navBtn(page === 'scam-news')}>{L.scamNews}</button>
        <button onClick={() => { setPage('interview-tips'); closeMenu() }} style={navBtn(page === 'interview-tips')}>{L.interviewTips}</button>
        <button onClick={() => { setPage('career-guide'); closeMenu() }} style={navBtn(page === 'career-guide')}>{L.careerGuide}</button>
        <button onClick={() => { setPage('report-scam'); closeMenu() }} style={navBtn(page === 'report-scam')}>{L.reportScam}</button>
        <button onClick={() => { setPage('scam-map'); closeMenu() }} style={navBtn(page === 'scam-map')}>{L.scamMap}</button>
        
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.2)', margin: '8px 0' }}></div>
        
        <button onClick={() => { setPage('about'); closeMenu() }} style={navBtn(page === 'about')}>ℹ️ {L.about}</button>
        <button onClick={() => { isLoggedIn ? setPage('profile') : setPage('login'); closeMenu() }} style={navBtn(page === 'profile')}>👤 {L.profile}</button>
        
        <div style={{ flex: 1 }} />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '12px' }}>
          <button onClick={() => setLang(lang === 'en' ? 'ta' : 'en')} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid #fff', padding: '7px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px' }}>{lang === 'en' ? 'தமிழ்' : 'EN'}</button>
          <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid #fff', padding: '7px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px' }}>{darkMode ? '☀️' : '🌙'}</button>
          {isLoggedIn && <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid #fff', padding: '7px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px' }}>{L.logout}</button>}
        </div>
      </div>

      <div className="main-content">

      {page === 'login' && (
        <div className="page-fade" style={{ textAlign: 'center', padding: '48px 20px 24px' }}>
          <h1 style={{ color: theme.text, fontSize: '38px', fontWeight: 800, marginBottom: '20px' }}>{L.heroLine1}<br /><span style={{ background: 'linear-gradient(90deg, #028090, #02c39a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{L.heroLine2}</span></h1>
          <p style={{ color: theme.muted, fontSize: '15px', maxWidth: '480px', margin: '0 auto 28px' }}>{L.heroSub}</p>
          
          <div id="login-card" style={{ maxWidth: '400px', margin: '20px auto 40px', background: theme.cardBg, borderRadius: '16px', padding: '26px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0, color: theme.text }}>{L.loginTitle}</h3>
            <input type="text" placeholder={L.namePh} value={loginData.name} onChange={(e) => setLoginData({ ...loginData, name: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
            <input type="email" placeholder={L.emailPh} value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
            <input type="text" placeholder={L.phonePh} value={loginData.phone} onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '14px', borderRadius: '8px', border: '1px solid #ccc' }} />
            <button onClick={handleLogin} style={{ width: '100%', background: '#02c39a', color: '#fff', border: 'none', padding: '13px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{L.loginBtn}</button>
            {loginStatus && <p style={{ marginTop: '10px', color: '#c62828', fontSize: '13px' }}>{loginStatus}</p>}
          </div>

          <div style={{ maxWidth: '700px', margin: '0 auto 40px', padding: '0 16px' }}>
            {FAQS.slice(0, 2).map((faq, i) => (
              <div key={i} style={{ ...cardStyle, textAlign: 'left', marginBottom: '10px' }}>
                <div onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ cursor: 'pointer', fontWeight: 'bold', color: theme.text }}>
                  {faq[0]} <span style={{ color: '#02c39a' }}>{openFaq === i ? '−' : '+'}</span>
                </div>
                {openFaq === i && <p style={{ margin: '6px 0 0 0', color: theme.muted, fontSize: '13px' }}>{faq[1]}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {page === 'form' && (
        <div className="page-fade" style={{ maxWidth: '650px', margin: '0 auto', padding: '40px 16px' }}>
          <h1 style={{ color: theme.text, fontSize: '26px', textAlign: 'center', marginBottom: '6px' }}>{L.formTitle}</h1>
          <div style={{ background: theme.cardBg, borderRadius: '14px', padding: '22px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
            <label style={{ fontWeight: 'bold', color: theme.text }}>{L.companyLabel}</label>
            <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={{ width: '100%', marginBottom: '14px', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '6px' }} placeholder="e.g. Wipro, Infosys" />
            <label style={{ fontWeight: 'bold', color: theme.text }}>{L.screenshotLabel}</label>
            <div style={{ marginTop: '6px', marginBottom: '14px' }}>
              <input type="file" accept="image/*" onChange={handleScreenshotUpload} />
              {ocrLoading && <div style={{ marginTop: '8px', fontSize: '13px', color: '#02c39a' }}>🔎 Reading text... {ocrProgress}%</div>}
            </div>
            <label style={{ fontWeight: 'bold', color: theme.text }}>{L.jobTextLabel}</label>
            <textarea rows="6" value={jobText} onChange={(e) => setJobText(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #b6e8d5', background: theme.cardBg, color: theme.text, fontFamily: 'sans-serif', marginBottom: '14px' }} placeholder="Paste the job message here..." />
            <label style={{ fontWeight: 'bold', color: theme.text }}>{L.skillsLabel}</label>
            <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)} style={{ width: '100%', marginBottom: '20px', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '6px' }} placeholder="e.g. React, Python, SQL" />
            <button onClick={() => setPage('login')} style={{ background: 'transparent', color: theme.text, border: `1px solid ${theme.border}`, padding: '14px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', marginRight: '10px' }}>{L.back}</button>
            <button onClick={handleAnalyze} disabled={loading || !jobText} style={{ background: 'linear-gradient(90deg, #028090, #02c39a)', color: '#fff', border: 'none', padding: '14px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', opacity: loading || !jobText ? 0.6 : 1 }}>
              {loading ? 'Analyzing...' : L.analyzeBtn}
            </button>
          </div>
        </div>
      )}

      {page === 'scam-news' && (
        <div className="page-fade" style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 16px' }}>
          <h1 style={{ color: theme.text, textAlign: 'center', marginBottom: '6px' }}>🚨 Latest Job Scam Alerts</h1>
          <p style={{ color: theme.muted, textAlign: 'center', marginBottom: '26px' }}>Recent job scam news from India — stay informed, stay safe.</p>
          {scamNewsLoading ? (
            <div style={{ textAlign: 'center', color: theme.muted }}>Loading news...</div>
          ) : scamNewsList.length === 0 ? (
            <div style={cardStyle}>No news available right now.</div>
          ) : (
            scamNewsList.map((article, i) => (
              <div key={i} style={cardStyle}>
                <h3 style={{ marginTop: 0, color: theme.text }}>{article.title}</h3>
                <p style={{ color: theme.muted, fontSize: '13px', margin: '6px 0' }}>{article.description}</p>
                <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ color: '#02c39a', fontSize: '12px' }}>Read more →</a>
              </div>
            ))
          )}
        </div>
      )}

      {page === 'interview-tips' && (
        <div className="page-fade" style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 16px' }}>
          <h1 style={{ color: theme.text, textAlign: 'center', marginBottom: '26px' }}>💡 Interview Tips</h1>
          <div style={cardStyle}><h3 style={{ marginTop: 0 }}>Before the Interview</h3><p>✓ Research the company<br/>✓ Verify interview details<br/>✓ Test audio/video setup</p></div>
          <div style={cardStyle}><h3 style={{ marginTop: 0 }}>During the Interview</h3><p>✓ Be professional<br/>✓ Ask about the role<br/>✓ Never agree to pay</p></div>
          <div style={cardStyle}><h3 style={{ marginTop: 0 }}>Red Flags</h3><p>✗ Ask for sensitive info<br/>✗ Ask for registration fees<br/>✗ Vague job details</p></div>
        </div>
      )}

      {page === 'career-guide' && (
        <div className="page-fade" style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 16px' }}>
          <h1 style={{ color: theme.text, textAlign: 'center', marginBottom: '26px' }}>📚 Career Guide</h1>
          <div style={cardStyle}><h3 style={{ marginTop: 0 }}>Full Stack Developer</h3><p>HTML + CSS + JS → React → Node.js → Databases → Deploy</p></div>
          <div style={cardStyle}><h3 style={{ marginTop: 0 }}>Data Science</h3><p>Python → Pandas → SQL → ML → Portfolio Projects</p></div>
          <div style={cardStyle}><h3 style={{ marginTop: 0 }}>Cloud & DevOps</h3><p>Linux → Git → Docker → AWS/Azure → Kubernetes</p></div>
        </div>
      )}

      {page === 'report-scam' && (
        <div className="page-fade" style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 16px' }}>
          <h1 style={{ color: theme.text, textAlign: 'center', marginBottom: '26px' }}>🔴 Report a Scam</h1>
          <div style={cardStyle}>
            <p>Help protect others by reporting scams:</p>
            <ul><li>Indian Cybercrime: cybercrime.gov.in</li><li>NASSCOM: antispam.nasscom.in</li><li>File FIR with local police</li><li>Share with us</li></ul>
          </div>
        </div>
      )}

      {page === 'scam-map' && (
        <div className="page-fade" style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 16px' }}>
          <h1 style={{ color: theme.text, textAlign: 'center', marginBottom: '26px' }}>🗺️ Scam Hotspots</h1>
          <div style={cardStyle}><strong>Tier-1 Cities:</strong> Fake MNC offers, work-from-home scams</div>
          <div style={cardStyle}><strong>Tier-2 Cities:</strong> "Call center" recruitment scams</div>
          <div style={cardStyle}><strong>Online (Pan-India):</strong> Crypto, data entry, affiliate marketing scams</div>
        </div>
      )}

      {page === 'result' && result && (
        <div className="page-fade" style={{ maxWidth: '700px', margin: '0 auto', padding: '30px 16px 50px' }}>
          <button onClick={() => { setJobText(''); setSkills(defaultSkills); setCompanyName(''); setResult(null); setPage('form') }} style={{ background: theme.cardBg, color: theme.text, border: `1px solid ${theme.border}`, padding: '9px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', marginBottom: '18px' }}>🔄 New Analysis</button>
          {result.error ? <p style={{ color: 'red' }}>{result.error}</p> : <p style={{ color: theme.text }}>Report generated successfully ✓</p>}
        </div>
      )}

      {page === 'history' && (
        <div className="page-fade" style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 16px' }}>
          <h1 style={{ color: theme.text, marginBottom: '20px' }}>{L.historyTitle}</h1>
          {historyList.length === 0 ? <p style={{ color: theme.muted }}>{L.noHistory}</p> : historyList.map((entry) => (
            <div key={entry.id} style={cardStyle}>
              <div style={{ fontWeight: 'bold', color: theme.text }}>{entry.companyName}</div>
              <div style={{ fontSize: '11px', color: theme.muted }}>{entry.timestamp}</div>
              <button onClick={() => { viewHistoryEntry(entry); closeMenu() }} style={{ background: '#02c39a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', marginTop: '10px' }}>{L.view}</button>
            </div>
          ))}
        </div>
      )}

      {page === 'about' && (
        <div className="page-fade" style={{ maxWidth: '700px', margin: '0 auto', padding: '40px 16px 60px' }}>
          <h1 style={{ color: theme.text, textAlign: 'center', marginBottom: '8px' }}>{L.aboutTitle}</h1>
          <p style={{ color: theme.muted, textAlign: 'center', margin: '0 auto 30px' }}>CareerTrust AI helps students make safer career decisions.</p>
          <div style={{ background: theme.cardBg, borderRadius: '14px', padding: '24px' }}>
            <h3 style={{ marginTop: 0, color: theme.text }}>Our Mission</h3>
            <p style={{ color: theme.muted }}>Protecting students from fake job offers and scams.</p>
          </div>
        </div>
      )}

      {page === 'profile' && (
        <div className="page-fade" style={{ maxWidth: '550px', margin: '0 auto', padding: '40px 16px 60px' }}>
          <h1 style={{ color: theme.text, textAlign: 'center', marginBottom: '24px' }}>{L.profileTitle}</h1>
          <div style={{ background: theme.cardBg, borderRadius: '14px', padding: '24px' }}>
            <label style={{ fontWeight: 'bold', color: theme.text }}>Name:</label>
            <input type="text" value={loginData.name} onChange={(e) => setLoginData({ ...loginData, name: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '14px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '6px' }} />
            <button onClick={() => { localStorage.setItem('ct_default_skills', defaultSkills); alert('Profile saved!') }} style={{ width: '100%', background: '#02c39a', color: '#fff', border: 'none', padding: '13px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{L.saveProfile}</button>
          </div>
        </div>
      )}

      </div>

      <div className="no-print" style={{ background: '#0b2e33', color: '#cadcda', padding: '24px 20px', marginTop: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>🛡️ CareerTrust AI</div>
        <div style={{ fontSize: '11px', opacity: 0.6 }}>© 2026 CareerTrust AI. Stay safe.</div>
      </div>
    </div>
  )
}

export default App
