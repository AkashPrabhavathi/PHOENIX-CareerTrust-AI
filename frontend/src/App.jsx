import { useState } from 'react'
import './App.css'

function App() {
  const [jobText, setJobText] = useState('')
  const [skills, setSkills] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

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

  const getRiskColor = (level) => {
    if (level === 'Low Risk') return '#2e7d32'
    if (level === 'Needs Verification') return '#f9a825'
    if (level === 'High Risk') return '#ef6c00'
    if (level === 'Very High Risk') return '#c62828'
    return '#555'
  }

  return (
    <div style={{ maxWidth: '650px', margin: '40px auto', fontFamily: 'sans-serif', padding: '0 16px' }}>
      <h1>CareerTrust AI</h1>
      <p>Paste a job/internship offer and your details to analyze it.</p>

      <label>Company Name:</label>
      <input
        type="text"
        style={{ width: '100%', marginBottom: '12px', padding: '8px' }}
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        placeholder="e.g. Wipro, Infosys"
      />

      <label>Job Offer Text:</label>
      <textarea
        rows="6"
        style={{ width: '100%', marginBottom: '12px', padding: '8px' }}
        value={jobText}
        onChange={(e) => setJobText(e.target.value)}
        placeholder="Paste the job or internship message here..."
      />

      <label>Your Skills:</label>
      <input
        type="text"
        style={{ width: '100%', marginBottom: '12px', padding: '8px' }}
        value={skills}
        onChange={(e) => setSkills(e.target.value)}
        placeholder="e.g. React, Python, SQL"
      />

      <button onClick={handleAnalyze} disabled={loading || !jobText}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>

      {result && result.error && (
        <p style={{ color: 'red', marginTop: '20px' }}>{result.error}</p>
      )}

      {result && !result.error && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px', padding: '16px', borderRadius: '8px', background: getRiskColor(result.risk_level), color: '#fff' }}>
              <h3 style={{ margin: 0 }}>Risk Score: {result.risk_score}/100</h3>
              <p style={{ margin: '4px 0 0 0' }}>{result.risk_level}</p>
            </div>
            <div style={{ flex: 1, minWidth: '200px', padding: '16px', borderRadius: '8px', background: '#1565c0', color: '#fff' }}>
              <h3 style={{ margin: 0 }}>Opportunity Score: {result.opportunity_score}/100</h3>
              <p style={{ margin: '4px 0 0 0' }}>Overall quality of this opportunity</p>
            </div>
          </div>

          <h3>Scam Indicators Found ({result.scam_indicators.length})</h3>
          {result.scam_indicators.length === 0 && (
            <p>No scam keywords detected. Still verify the company and recruiter independently.</p>
          )}
          {result.scam_indicators.map((w) => (
            <div key={w.id} style={{ border: '1px solid #ddd', borderLeft: '4px solid #c62828', borderRadius: '4px', padding: '12px', marginBottom: '10px' }}>
              <strong>{w.title}</strong> <span style={{ color: '#888' }}>(+{w.points} points)</span>
              <p style={{ margin: '6px 0' }}>{w.reason}</p>
              <p style={{ margin: 0, fontStyle: 'italic', color: '#555' }}>Evidence: {w.evidence}</p>
            </div>
          ))}

          {result.sensitive_data_check && result.sensitive_data_check.sensitive_data_requested && (
            <div style={{ border: '1px solid #ddd', borderLeft: '4px solid #c62828', borderRadius: '4px', padding: '12px', marginBottom: '10px', background: '#fff3f3' }}>
              <strong>🔒 Sensitive Information Requested: {result.sensitive_data_check.types_detected.join(', ')}</strong>
              <p style={{ margin: '6px 0 0 0' }}>{result.sensitive_data_check.warning}</p>
            </div>
          )}

          <h3 style={{ marginTop: '20px' }}>Company Verification</h3>
          <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '12px', marginBottom: '10px' }}>
            <p style={{ margin: '4px 0' }}><strong>Status:</strong> {result.company_verification.status}</p>
            <p style={{ margin: '4px 0', color: '#555' }}>{result.company_verification.note}</p>
          </div>

          <h3 style={{ marginTop: '20px' }}>Recruiter Verification</h3>
          <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '12px', marginBottom: '10px' }}>
            <p style={{ margin: '4px 0' }}><strong>Email Found:</strong> {result.recruiter_verification.email_found || 'None'}</p>
            <p style={{ margin: '4px 0' }}><strong>Domain Type:</strong> {result.recruiter_verification.domain_type}</p>
            <p style={{ margin: '4px 0', color: '#555' }}>{result.recruiter_verification.note}</p>
          </div>

          {result.link_check.suspicious_links.length > 0 && (
            <div style={{ border: '1px solid #ddd', borderLeft: '4px solid #ef6c00', borderRadius: '4px', padding: '12px', marginBottom: '10px' }}>
              <strong>⚠️ Suspicious Links Detected</strong>
              <p style={{ margin: '6px 0' }}>{result.link_check.note}</p>
            </div>
          )}

          <h3 style={{ marginTop: '20px' }}>Salary Analysis</h3>
          <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '12px', marginBottom: '10px' }}>
            <p style={{ margin: '4px 0' }}><strong>Offered:</strong> {result.salary_analysis.offered_salary ? `₹${result.salary_analysis.offered_salary}` : 'Not mentioned'}</p>
            <p style={{ margin: '4px 0' }}><strong>Typical Range:</strong> {result.salary_analysis.estimated_range}</p>
            <p style={{ margin: '4px 0' }}><strong>Status:</strong> {result.salary_analysis.status}</p>
            <p style={{ margin: '4px 0', color: '#555' }}>{result.salary_analysis.explanation}</p>
          </div>

          <h3 style={{ marginTop: '20px' }}>Skill Match</h3>
          <div style={{ border: '1px solid #ddd', borderRadius: '4px', padding: '12px', marginBottom: '10px' }}>
            <p style={{ margin: '4px 0' }}><strong>Match:</strong> {result.skill_match.skill_match_percent}%</p>
            <p style={{ margin: '4px 0' }}><strong>Matched Skills:</strong> {result.skill_match.matched_skills.join(', ') || 'None found'}</p>
            <p style={{ margin: '4px 0' }}><strong>Missing Skills:</strong> {result.skill_match.missing_skills.join(', ') || 'None detected'}</p>
            <p style={{ margin: '4px 0', color: '#555' }}>{result.skill_match.recommendation}</p>
          </div>

          <h3 style={{ marginTop: '20px' }}>Safe Apply Checklist</h3>
          <ul>
            {result.safe_apply_checklist.map((item, idx) => (
              <li key={idx} style={{ marginBottom: '4px' }}>{item}</li>
            ))}
          </ul>

          <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
            ⚠️ {result.disclaimer}
          </p>
        </div>
      )}
    </div>
  )
}

export default App