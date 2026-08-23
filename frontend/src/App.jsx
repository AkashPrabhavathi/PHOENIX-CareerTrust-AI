import { useState } from 'react'
import './App.css'

function App() {
  const [jobText, setJobText] = useState('')
  const [skills, setSkills] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    setLoading(true)
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

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>CareerTrust AI</h1>
      <p>Paste a job/internship offer and your skills to analyze it.</p>

      <label>Job Offer Text:</label>
      <textarea
        rows="6"
        style={{ width: '100%', marginBottom: '12px' }}
        value={jobText}
        onChange={(e) => setJobText(e.target.value)}
        placeholder="Paste the job or internship message here..."
      />

      <label>Your Skills:</label>
      <input
        type="text"
        style={{ width: '100%', marginBottom: '12px' }}
        value={skills}
        onChange={(e) => setSkills(e.target.value)}
        placeholder="e.g. React, Python, SQL"
      />

      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Analyze'}
      </button>

      {result && (
        <pre style={{ background: '#f4f4f4', padding: '12px', marginTop: '20px' }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}

export default App