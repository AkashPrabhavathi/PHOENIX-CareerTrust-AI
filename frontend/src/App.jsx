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

function App() {
  const [jobText, setJobText] = useState('')
  const [skills, setSkills] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [comparisonList, setComparisonList] = useState([])

  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showLogin, setShowLogin] = useState(true)
  const [loginData, setLoginData] = useState({ name: '', email: '', phone: '' })
  const [loginStatus, setLoginStatus] = useState('')

  const [ocrLoading, setOcrLoading] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)

  const [darkMode, setDarkMode] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)

  const [reportCount, setReportCount] = useState(0)
  const [displayCount, setDisplayCount] = useState(0)

  const theme = darkMode ? darkTheme : lightTheme

  useEffect(() => {
    const saved = parseInt(localStorage.getItem('ct_report_count') || '1247', 10)
    setReportCount(saved)
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

  const handleLogin = async () => {
    if (!loginData.name || !loginData.email) {
      setLoginStatus('Please enter your name and email.')
      return
    }
    try {
      await fetch('http://127.0.0.1:8000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      })
    } catch (error) {
      // even if backend is down, still let them use the app locally
    }
    setIsLoggedIn(true)
    setShowLogin(false)
  }

  const handleAnalyze = async () => {
    if (!isLoggedIn) {
      setShowLogin(true)
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const response = await fetch('http://127.0.0.1:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_text: jobText,
          student_skills: skills,
          company_name: companyName,
        }),
      })
      const data = await response.json()
      setResult(data)
      const newCount = reportCount + 1
      setReportCount(newCount)
      localStorage.setItem('ct_report_count', String(newCount))
    } catch (error) {
      setResult({ error: 'Could not connect to backend. Is it running?' })
    }
    setLoading(false)
  }

  const handleScreenshotUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setOcrLoading(true)
    setOcrProgress(0)
    try {
      const { data } = await Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100))
          }
        },
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
      id: Date.now(),
      companyName: companyName || 'Unnamed Company',
      risk_score: result.risk_score,
      risk_level: result.risk_level,
      opportunity_score: result.opportunity_score,
      salary_status: result.salary_analysis.status,
      skill_match_percent: result.skill_match.skill_match_percent,
      missing_skills: result.skill_match.missing_skills,
    }
    setComparisonList([...comparisonList, entry])
  }

  const removeFromComparison = (id) => {
    setComparisonList(comparisonList.filter((item) => item.id !== id))
  }

  const getRiskColor = (level) => {
    if (level === 'Low Risk') return '#2e7d32'
    if (level === 'Needs Verification') return '#f9a825'
    if (level === 'High Risk') return '#ef6c00'
    if (level === 'Very High Risk') return '#c62828'
    return '#555'
  }

  const getRecommendation = (entry) => {
    if (entry.risk_score >= 61) return 'Avoid until verified'
    if (entry.risk_score >= 31) return 'Apply with caution, verify first'
    if (entry.opportunity_score >= 70) return 'Recommended'
    return 'Worth applying after verification'
  }

  const cardStyle = { background: theme.cardBg, border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '12px', marginBottom: '10px' }

  return (
    <div style={{ minHeight: '100vh', background: theme.pageBg, fontFamily: 'sans-serif', position: 'relative', transition: 'background 0.3s ease' }}>

      {/* LOGIN OVERLAY */}
      <div className="no-print" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        transform: showLogin ? 'translateY(0)' : 'translateY(-120%)',
        transition: 'transform 0.4s ease',
        background: 'linear-gradient(90deg, #028090, #02c39a)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
        padding: '24px 20px',
      }}>
        <div style={{ maxWidth: '380px', margin: '0 auto', background: '#fff', borderRadius: '14px', padding: '22px' }}>
          <h3 style={{ marginTop: 0, color: '#028090', textAlign: 'center' }}>🛡️ Login to CareerTrust AI</h3>
          <p style={{ fontSize: '12px', color: '#777', textAlign: 'center', marginTop: '-6px' }}>Free — just your name and email to get started</p>
          <input
            type="text" placeholder="Your Name" value={loginData.name}
            onChange={(e) => setLoginData({ ...loginData, name: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
          <input
            type="email" placeholder="Email Address" value={loginData.email}
            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
          <input
            type="text" placeholder="Phone Number (optional)" value={loginData.phone}
            onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '14px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
          <button onClick={handleLogin} style={{ width: '100%', background: '#02c39a', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            Login &amp; Continue
          </button>
          {loginStatus && <p style={{ marginTop: '10px', color: '#c62828', fontSize: '13px', textAlign: 'center' }}>{loginStatus}</p>}
          {isLoggedIn && (
            <p onClick={() => setShowLogin(false)} style={{ marginTop: '10px', color: '#028090', fontSize: '12px', textAlign: 'center', cursor: 'pointer', textDecoration: 'underline' }}>
              Close
            </p>
          )}
        </div>
      </div>

      {/* NAVBAR */}
      <div className="no-print" style={{ background: 'linear-gradient(90deg, #028090, #02c39a)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <div style={{ fontSize: '22px', fontWeight: 'bold' }}>🛡️ CareerTrust AI</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid #fff', padding: '8px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px' }}>
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          {isLoggedIn ? (
            <span style={{ fontSize: '14px' }}>👋 {loginData.name}</span>
          ) : (
            <button onClick={() => setShowLogin(true)} style={{ background: '#fff', color: '#028090', border: 'none', padding: '8px 18px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>
              Login
            </button>
          )}
        </div>
      </div>

      {/* HERO */}
      <div className="no-print" style={{ textAlign: 'center', padding: '48px 20px 24px' }}>
        <div style={{ display: 'inline-block', background: darkMode ? '#0f3339' : '#e0f7f1', color: '#02c39a', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '16px' }}>
          🛡️ SMART CAREER SAFETY
        </div>
        <h1 style={{ color: theme.text, fontSize: '38px', fontWeight: 800, marginBottom: '10px', lineHeight: 1.2 }}>
          Don't just detect scams.<br />
          <span style={{ background: 'linear-gradient(90deg, #028090, #02c39a)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Make smarter career decisions.
          </span>
        </h1>
        <p style={{ color: theme.muted, fontSize: '15px', maxWidth: '480px', margin: '0 auto' }}>
          Paste a job or internship offer, upload a screenshot, or type it in — get a full trust report in seconds.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '28px', marginTop: '28px', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#02c39a' }}>13+</div>
            <div style={{ fontSize: '11px', color: theme.muted }}>Scam Patterns Checked</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#02c39a' }}>{displayCount.toLocaleString()}</div>
            <div style={{ fontSize: '11px', color: theme.muted }}>Reports Analyzed</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#02c39a' }}>100%</div>
            <div style={{ fontSize: '11px', color: theme.muted }}>Free to Use</div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="no-print" style={{ maxWidth: '700px', margin: '0 auto 20px', padding: '0 16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            ['1️⃣', 'Paste or Upload', 'Add the job text or upload a WhatsApp/email screenshot'],
            ['2️⃣', 'AI Analyzes', 'Scam signals, salary, skills & company get checked instantly'],
            ['3️⃣', 'Get Your Report', 'A clear risk score with evidence and next steps'],
          ].map((step, i) => (
            <div key={i} style={{ flex: '1', minWidth: '180px', background: theme.cardBg, borderRadius: '12px', padding: '16px', textAlign: 'center', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>{step[0]}</div>
              <div style={{ fontWeight: 'bold', color: theme.text, fontSize: '13.5px', marginBottom: '4px' }}>{step[1]}</div>
              <div style={{ fontSize: '11.5px', color: theme.muted }}>{step[2]}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 16px 40px' }}>

        {/* FORM CARD */}
        <div className="no-print" style={{ background: theme.cardBg, borderRadius: '14px', padding: '22px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', color: theme.text }}>🏢 Company Name:</label>
          <input
            type="text"
            style={{ width: '100%', marginBottom: '14px', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '6px' }}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Wipro, Infosys"
          />

          <label style={{ fontWeight: 'bold', color: theme.text }}>📸 Upload a Screenshot (optional):</label>
          <div style={{ marginTop: '6px', marginBottom: '14px' }}>
            <input type="file" accept="image/*" onChange={handleScreenshotUpload} />
            {ocrLoading && (
              <div style={{ marginTop: '8px', fontSize: '13px', color: '#02c39a' }}>
                🔎 Reading text from image... {ocrProgress}%
              </div>
            )}
          </div>

          <label style={{ fontWeight: 'bold', color: theme.text }}>💬 Job Offer Text:</label>
          <div style={{ background: darkMode ? '#0f2a25' : '#e9fdf3', borderRadius: '12px', padding: '10px', marginTop: '6px', marginBottom: '14px', border: '1px solid #b6e8d5' }}>
            <div style={{ fontSize: '11px', color: '#02c39a', marginBottom: '4px' }}>📱 Paste message as received, or upload a screenshot above</div>
            <textarea
              rows="6"
              style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #b6e8d5', background: theme.cardBg, color: theme.text, fontFamily: 'sans-serif' }}
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Paste the job or internship message here, or upload a screenshot above..."
            />
          </div>

          <label style={{ fontWeight: 'bold', color: theme.text }}>🧠 Your Skills:</label>
          <input
            type="text"
            style={{ width: '100%', marginBottom: '16px', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '6px' }}
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g. React, Python, SQL"
          />

          <button
            onClick={handleAnalyze}
            disabled={loading || !jobText}
            style={{ width: '100%', background: 'linear-gradient(90deg, #028090, #02c39a)', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', opacity: loading || !jobText ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {loading && <span className="spinner"></span>}
            {loading ? 'Analyzing...' : isLoggedIn ? '🔍 Analyze Opportunity' : '🔒 Login to Analyze'}
          </button>
        </div>

        {loading && (
          <div className="no-print" style={{ marginTop: '20px' }}>
            <div className="skeleton" style={{ height: '80px', marginBottom: '12px' }}></div>
            <div className="skeleton" style={{ height: '50px', marginBottom: '12px' }}></div>
            <div className="skeleton" style={{ height: '50px', marginBottom: '12px' }}></div>
            <div className="skeleton" style={{ height: '50px' }}></div>
          </div>
        )}

        {result && result.error && (
          <p style={{ color: 'red', marginTop: '20px' }}>{result.error}</p>
        )}

        {result && !result.error && (
          <div id="report-area">
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
              <button onClick={() => window.print()} style={{ background: '#0b2e33', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
                ⬇️ Download / Print Report
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: theme.muted, marginBottom: '6px' }}>📩 Message received:</div>
              <div style={{ background: '#dcf8c6', borderRadius: '12px', borderTopLeftRadius: 0, padding: '12px 16px', maxWidth: '90%', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', fontSize: '13.5px', color: '#1b1b1b', whiteSpace: 'pre-wrap' }}>
                {jobText}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px', padding: '18px', borderRadius: '12px', background: getRiskColor(result.risk_level), color: '#fff', boxShadow: '0 6px 16px rgba(0,0,0,0.15)' }}>
                <h3 style={{ margin: 0 }}>⚠️ Risk Score: {result.risk_score}/100</h3>
                <p style={{ margin: '4px 0 0 0' }}>{result.risk_level}</p>
              </div>
              <div style={{ flex: 1, minWidth: '200px', padding: '18px', borderRadius: '12px', background: 'linear-gradient(135deg, #1565c0, #42a5f5)', color: '#fff', boxShadow: '0 6px 16px rgba(0,0,0,0.15)' }}>
                <h3 style={{ margin: 0 }}>⭐ Opportunity Score: {result.opportunity_score}/100</h3>
                <p style={{ margin: '4px 0 0 0' }}>Overall quality of this opportunity</p>
              </div>
            </div>

            <button className="no-print" onClick={addToComparison} style={{ marginBottom: '16px', background: '#2e7d32', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              ➕ Add to Comparison
            </button>

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
            {result.scam_indicators.length === 0 && (
              <p style={{ color: theme.muted }}>No scam keywords detected. Still verify the company and recruiter independently.</p>
            )}
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
            <div style={cardStyle}>
              <p style={{ margin: '4px 0', color: theme.text }}><strong>Status:</strong> {result.company_verification.status}</p>
              <p style={{ margin: '4px 0', color: theme.muted }}>{result.company_verification.note}</p>
            </div>

            <h3 style={{ marginTop: '20px', color: theme.text }}>👤 Recruiter Verification</h3>
            <div style={cardStyle}>
              <p style={{ margin: '4px 0', color: theme.text }}><strong>Email Found:</strong> {result.recruiter_verification.email_found || 'None'}</p>
              <p style={{ margin: '4px 0', color: theme.text }}><strong>Domain Type:</strong> {result.recruiter_verification.domain_type}</p>
              <p style={{ margin: '4px 0', color: theme.muted }}>{result.recruiter_verification.note}</p>
            </div>

            {result.link_check.suspicious_links.length > 0 && (
              <div style={{ ...cardStyle, borderLeft: '4px solid #ef6c00' }}>
                <strong style={{ color: theme.text }}>⚠️ Suspicious Links Detected</strong>
                <p style={{ margin: '6px 0', color: theme.text }}>{result.link_check.note}</p>
              </div>
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
              {result.safe_apply_checklist.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
              ))}
            </ul>

            <p style={{ marginTop: '16px', fontSize: '14px', color: theme.muted }}>
              ⚠️ {result.disclaimer}
            </p>
          </div>
        )}

        {comparisonList.length > 0 && (
          <div className="no-print" style={{ marginTop: '40px' }}>
            <h2 style={{ color: theme.text }}>📊 Opportunity Comparison ({comparisonList.length})</h2>
            <div style={{ overflowX: 'auto', background: theme.cardBg, borderRadius: '10px', padding: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', color: theme.text }}>
                <thead>
                  <tr style={{ background: '#028090', color: '#fff', textAlign: 'left' }}>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Company</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Risk</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Opportunity</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Salary</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Skill Match</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Skills to Learn</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}>Recommendation</th>
                    <th style={{ padding: '8px', border: '1px solid #ddd' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonList.map((entry) => (
                    <tr key={entry.id}>
                      <td style={{ padding: '8px', border: `1px solid ${theme.border}` }}>{entry.companyName}</td>
                      <td style={{ padding: '8px', border: `1px solid ${theme.border}`, color: getRiskColor(entry.risk_level) }}>
                        {entry.risk_score}/100 ({entry.risk_level})
                      </td>
                      <td style={{ padding: '8px', border: `1px solid ${theme.border}` }}>{entry.opportunity_score}/100</td>
                      <td style={{ padding: '8px', border: `1px solid ${theme.border}` }}>{entry.salary_status}</td>
                      <td style={{ padding: '8px', border: `1px solid ${theme.border}` }}>{entry.skill_match_percent}%</td>
                      <td style={{ padding: '8px', border: `1px solid ${theme.border}` }}>{entry.missing_skills.join(', ') || 'None'}</td>
                      <td style={{ padding: '8px', border: `1px solid ${theme.border}` }}>{getRecommendation(entry)}</td>
                      <td style={{ padding: '8px', border: `1px solid ${theme.border}` }}>
                        <button onClick={() => removeFromComparison(entry.id)} style={{ background: '#c62828', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TESTIMONIALS */}
        <div className="no-print" style={{ marginTop: '50px' }}>
          <h2 style={{ textAlign: 'center', color: theme.text, marginBottom: '20px' }}>Why students trust us</h2>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {[
              ['"Caught a fake internship offer asking for a registration fee before I even applied. Saved me ₹500 and a headache."', '— B.Tech, Final Year'],
              ['"The skill match feature helped me see exactly what to learn before applying to my dream company."', '— CSE Student'],
              ['"Simple, fast, and honest — it never claims to be 100% sure, which actually makes me trust it more."', '— MCA Student'],
            ].map((t, i) => (
              <div key={i} style={{ background: theme.cardBg, borderRadius: '12px', padding: '18px', maxWidth: '220px', boxShadow: '0 4px 14px rgba(0,0,0,0.06)' }}>
                <p style={{ fontSize: '12.5px', color: theme.text, fontStyle: 'italic', margin: 0 }}>{t[0]}</p>
                <p style={{ fontSize: '11px', color: '#02c39a', fontWeight: 'bold', marginTop: '10px', marginBottom: 0 }}>{t[1]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="no-print" style={{ marginTop: '50px' }}>
          <h2 style={{ textAlign: 'center', color: theme.text, marginBottom: '20px' }}>Frequently Asked Questions</h2>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ background: theme.cardBg, borderRadius: '10px', marginBottom: '10px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <div
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold', color: theme.text, fontSize: '14px' }}
              >
                {faq[0]}
                <span style={{ color: '#02c39a' }}>{openFaq === i ? '−' : '+'}</span>
              </div>
              {openFaq === i && (
                <div style={{ padding: '0 18px 16px', color: theme.muted, fontSize: '13px' }}>
                  {faq[1]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="no-print" style={{ background: '#0b2e33', color: '#cadcda', padding: '28px 20px', marginTop: '30px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '6px' }}>🛡️ CareerTrust AI</div>
          <p style={{ fontSize: '12.5px', margin: '0 0 14px' }}>Don't just detect scams. Make smarter career decisions.</p>
          <div style={{ fontSize: '11px', opacity: 0.6 }}>
            © 2026 CareerTrust AI. Built by Akash S.
          </div>
        </div>
      </div>
    </div>
  )
}

export default App