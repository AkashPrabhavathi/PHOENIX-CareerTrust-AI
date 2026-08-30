import { useState } from 'react'
import './App.css'

function App() {
  const [jobText, setJobText] = useState('')
  const [skills, setSkills] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [comparisonList, setComparisonList] = useState([])
  const [showSignup, setShowSignup] = useState(false)
  const [signupData, setSignupData] = useState({ name: '', email: '', phone: '' })
  const [signupStatus, setSignupStatus] = useState('')

  const handleAnalyze = async () => {
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
    } catch (error) {
      setResult({ error: 'Could not connect to backend. Is it running?' })
    }
    setLoading(false)
  }

  const handleSignup = async () => {
    if (!signupData.name || !signupData.email) {
      setSignupStatus('Please enter at least your name and email.')
      return
    }
    try {
      const response = await fetch('http://127.0.0.1:8000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData),
      })
      const data = await response.json()
      setSignupStatus(data.message || 'Signed up!')
      setSignupData({ name: '', email: '', phone: '' })
    } catch (error) {
      setSignupStatus('Could not connect to backend.')
    }
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

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e8f8f5 0%, #eaf2fb 100%)', fontFamily: 'sans-serif' }}>

      {/* NAVBAR */}
      <div style={{ background: 'linear-gradient(90deg, #028090, #02c39a)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        <div style={{ fontSize: '22px', fontWeight: 'bold' }}>🛡️ CareerTrust AI</div>
        <div>
          <button onClick={() => setShowSignup(!showSignup)} style={{ background: '#fff', color: '#028090', border: 'none', padding: '8px 18px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer', marginRight: '8px' }}>
            {showSignup ? 'Close' : 'Sign Up Free'}
          </button>
          <button style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid #fff', padding: '8px 18px', borderRadius: '20px', cursor: 'pointer' }}>
            About
          </button>
        </div>
      </div>

      {/* SIGNUP PANEL */}
      {showSignup && (
        <div style={{ maxWidth: '420px', margin: '20px auto 0', background: '#fff', borderRadius: '14px', padding: '22px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}>
          <h3 style={{ marginTop: 0, color: '#028090' }}>Try CareerTrust AI — Sign Up</h3>
          <input
            type="text" placeholder="Your Name" value={signupData.name}
            onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
          <input
            type="email" placeholder="Email Address" value={signupData.email}
            onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
          <input
            type="text" placeholder="Phone Number (optional)" value={signupData.phone}
            onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '14px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
          <button onClick={handleSignup} style={{ width: '100%', background: '#02c39a', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            Sign Up
          </button>
          {signupStatus && <p style={{ marginTop: '10px', color: '#028090', fontSize: '13px' }}>{signupStatus}</p>}
        </div>
      )}

      {/* HERO */}
      <div style={{ textAlign: 'center', padding: '30px 20px 10px' }}>
        <h1 style={{ color: '#0b2e33', fontSize: '32px', marginBottom: '6px' }}>CareerTrust AI</h1>
        <p style={{ color: '#5b6e73' }}>Paste a job/internship offer and your details to analyze it.</p>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 16px 40px' }}>

        {/* FORM CARD */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '22px', boxShadow: '0 8px 24px rgba(0,0,0,0.08)', marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', color: '#0b2e33' }}>🏢 Company Name:</label>
          <input
            type="text"
            style={{ width: '100%', marginBottom: '14px', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', marginTop: '6px' }}
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="e.g. Wipro, Infosys"
          />

          <label style={{ fontWeight: 'bold', color: '#0b2e33' }}>💬 Job Offer Text:</label>
          <div style={{ background: '#e9fdf3', borderRadius: '12px', padding: '10px', marginTop: '6px', marginBottom: '14px', border: '1px solid #b6e8d5' }}>
            <div style={{ fontSize: '11px', color: '#028090', marginBottom: '4px' }}>📱 Paste message as received (WhatsApp / Email)</div>
            <textarea
              rows="6"
              style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '1px solid #b6e8d5', background: '#fff', fontFamily: 'sans-serif' }}
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Paste the job or internship message here..."
            />
          </div>

          <label style={{ fontWeight: 'bold', color: '#0b2e33' }}>🧠 Your Skills:</label>
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
            style={{ width: '100%', background: 'linear-gradient(90deg, #028090, #02c39a)', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', opacity: loading || !jobText ? 0.6 : 1 }}
          >
            {loading ? '⏳ Analyzing...' : '🔍 Analyze Opportunity'}
          </button>
        </div>

        {result && result.error && (
          <p style={{ color: 'red', marginTop: '20px' }}>{result.error}</p>
        )}

        {result && !result.error && (
          <div>
            {/* Message bubble preview */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: '#5b6e73', marginBottom: '6px' }}>📩 Message received:</div>
              <div style={{ background: '#dcf8c6', borderRadius: '12px', borderTopLeftRadius: 0, padding: '12px 16px', maxWidth: '90%', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', fontSize: '13.5px', color: '#1b1b1b' }}>
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

            <button onClick={addToComparison} style={{ marginBottom: '16px', background: '#2e7d32', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              ➕ Add to Comparison
            </button>

            {/* AI Suggested Companies */}
            {result.suggested_companies && result.suggested_companies.length > 0 && (
              <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', marginBottom: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                <h3 style={{ marginTop: 0, color: '#0b2e33' }}>🤖 AI Suggested Companies For Your Skills</h3>
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

            <h3>🚩 Scam Indicators Found ({result.scam_indicators.length})</h3>
            {result.scam_indicators.length === 0 && (
              <p>No scam keywords detected. Still verify the company and recruiter independently.</p>
            )}
            {result.scam_indicators.map((w) => (
              <div key={w.id} style={{ border: '1px solid #ddd', borderLeft: '4px solid #c62828', borderRadius: '8px', padding: '12px', marginBottom: '10px', background: '#fff' }}>
                <strong>{w.title}</strong> <span style={{ color: '#888' }}>(+{w.points} points)</span>
                <p style={{ margin: '6px 0' }}>{w.reason}</p>
                <p style={{ margin: 0, fontStyle: 'italic', color: '#555' }}>Evidence: {w.evidence}</p>
              </div>
            ))}

            {result.sensitive_data_check && result.sensitive_data_check.sensitive_data_requested && (
              <div style={{ border: '1px solid #ddd', borderLeft: '4px solid #c62828', borderRadius: '8px', padding: '12px', marginBottom: '10px', background: '#fff3f3' }}>
                <strong>🔒 Sensitive Information Requested: {result.sensitive_data_check.types_detected.join(', ')}</strong>
                <p style={{ margin: '6px 0 0 0' }}>{result.sensitive_data_check.warning}</p>
              </div>
            )}

            <h3 style={{ marginTop: '20px' }}>🏢 Company Verification</h3>
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '12px', marginBottom: '10px', background: '#fff' }}>
              <p style={{ margin: '4px 0' }}><strong>Status:</strong> {result.company_verification.status}</p>
              <p style={{ margin: '4px 0', color: '#555' }}>{result.company_verification.note}</p>
            </div>

            <h3 style={{ marginTop: '20px' }}>👤 Recruiter Verification</h3>
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '12px', marginBottom: '10px', background: '#fff' }}>
              <p style={{ margin: '4px 0' }}><strong>Email Found:</strong> {result.recruiter_verification.email_found || 'None'}</p>
              <p style={{ margin: '4px 0' }}><strong>Domain Type:</strong> {result.recruiter_verification.domain_type}</p>
              <p style={{ margin: '4px 0', color: '#555' }}>{result.recruiter_verification.note}</p>
            </div>

            {result.link_check.suspicious_links.length > 0 && (
              <div style={{ border: '1px solid #ddd', borderLeft: '4px solid #ef6c00', borderRadius: '8px', padding: '12px', marginBottom: '10px', background: '#fff' }}>
                <strong>⚠️ Suspicious Links Detected</strong>
                <p style={{ margin: '6px 0' }}>{result.link_check.note}</p>
              </div>
            )}

            <h3 style={{ marginTop: '20px' }}>💰 Salary Analysis</h3>
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '12px', marginBottom: '10px', background: '#fff' }}>
              <p style={{ margin: '4px 0' }}><strong>Offered:</strong> {result.salary_analysis.offered_salary ? `₹${result.salary_analysis.offered_salary}` : 'Not mentioned'}</p>
              <p style={{ margin: '4px 0' }}><strong>Typical Range:</strong> {result.salary_analysis.estimated_range}</p>
              <p style={{ margin: '4px 0' }}><strong>Status:</strong> {result.salary_analysis.status}</p>
              <p style={{ margin: '4px 0', color: '#555' }}>{result.salary_analysis.explanation}</p>
            </div>

            <h3 style={{ marginTop: '20px' }}>🧠 Skill Match</h3>
            <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '12px', marginBottom: '10px', background: '#fff' }}>
              <p style={{ margin: '4px 0' }}><strong>Match:</strong> {result.skill_match.skill_match_percent}%</p>
              <p style={{ margin: '4px 0' }}><strong>Matched Skills:</strong> {result.skill_match.matched_skills.join(', ') || 'None found'}</p>
              <p style={{ margin: '4px 0' }}><strong>Missing Skills:</strong> {result.skill_match.missing_skills.join(', ') || 'None detected'}</p>
              <p style={{ margin: '4px 0', color: '#555' }}>{result.skill_match.recommendation}</p>
            </div>

            <h3 style={{ marginTop: '20px' }}>✅ Safe Apply Checklist</h3>
            <ul style={{ background: '#fff', borderRadius: '8px', padding: '16px 30px' }}>
              {result.safe_apply_checklist.map((item, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}>{item}</li>
              ))}
            </ul>

            <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
              ⚠️ {result.disclaimer}
            </p>
          </div>
        )}

        {comparisonList.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <h2>📊 Opportunity Comparison ({comparisonList.length})</h2>
            <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '10px', padding: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
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
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{entry.companyName}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd', color: getRiskColor(entry.risk_level) }}>
                        {entry.risk_score}/100 ({entry.risk_level})
                      </td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{entry.opportunity_score}/100</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{entry.salary_status}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{entry.skill_match_percent}%</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{entry.missing_skills.join(', ') || 'None'}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>{getRecommendation(entry)}</td>
                      <td style={{ padding: '8px', border: '1px solid #ddd' }}>
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
      </div>

      <div style={{ textAlign: 'center', padding: '20px', color: '#5b6e73', fontSize: '12px' }}>
        Built by Team PHOENIX &bull; HackSpora 2.0 &bull; Karpagam College
      </div>
    </div>
  )
}

export default App