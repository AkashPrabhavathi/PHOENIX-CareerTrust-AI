import { useState } from 'react'
import './App.css'

function App() {
  const [jobText, setJobText] = useState('')
  const [skills, setSkills] = useState('')
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
      <p>Paste a job/internship offer and your skills to analyze it.</p>

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
          <div
            style={{
              padding: '16px',
              borderRadius: '8px',
              background: getRiskColor(result.risk_level),
              color: '#fff',
              marginBottom: '16px',
            }}
          >
            <h2 style={{ margin: 0 }}>Risk Score: {result.risk_score}/100</h2>
            <p style={{ margin: '4px 0 0 0' }}>{result.risk_level}</p>
          </div>

          <h3>Scam Indicators Found ({result.scam_indicators.length})</h3>
          {result.scam_indicators.length === 0 && (
            <p>No scam keywords detected. Still verify the company and recruiter independently.</p>
          )}
          {result.scam_indicators.map((w) => (
            <div
              key={w.id}
              style={{
                border: '1px solid #ddd',
                borderLeft: '4px solid #c62828',
                borderRadius: '4px',
                padding: '12px',
                marginBottom: '10px',
              }}
            >
              <strong>{w.title}</strong> <span style={{ color: '#888' }}>(+{w.points} points)</span>
              <p style={{ margin: '6px 0' }}>{w.reason}</p>
              <p style={{ margin: 0, fontStyle: 'italic', color: '#555' }}>Evidence: {w.evidence}</p>
            </div>
          ))}

          <p style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
            ⚠️ {result.disclaimer}
          </p>
        </div>
      )}
    </div>
  )
}

export default App