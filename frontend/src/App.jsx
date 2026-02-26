import { useEffect, useState } from 'react';

const API_BASE = `${import.meta.env.VITE_API_BASE || 'http://localhost:4000'}/api`;

const defaultForm = {
  question: '',
  issueType: 'user story',
  description: '',
  dueDate: '',
  hasCustomerImpact: false,
  components: '',
  fixedVersion: '',
  labels: '',
  byWhen: '',
  csatFeedback: '',
  helpTopic: '',
  assignee: '',
  component: '',
  supportStatus: 'Open'
};

function App() {
  const [meta, setMeta] = useState({ issueTypes: [], mandatoryFields: [], boards: [] });
  const [tip, setTip] = useState('');
  const [mistakes, setMistakes] = useState([]);
  const [kbMode, setKbMode] = useState('all');
  const [kbItems, setKbItems] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [coach, setCoach] = useState(null);
  const [sla, setSla] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/meta`).then((r) => r.json()),
      fetch(`${API_BASE}/tip`).then((r) => r.json()),
      fetch(`${API_BASE}/mistakes`).then((r) => r.json())
    ]).then(([metaData, tipData, mistakeData]) => {
      setMeta(metaData);
      setTip(tipData.tip);
      setMistakes(mistakeData.mistakes);
    });
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/kb?mode=${kbMode}`)
      .then((r) => r.json())
      .then((data) => setKbItems(data.items));
  }, [kbMode]);

  const onChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const submitCoach = async (event) => {
    event.preventDefault();
    setError('');
    const payload = {
      question: form.question,
      issueType: form.issueType,
      description: form.description,
      dueDate: form.dueDate,
      hasCustomerImpact: form.hasCustomerImpact,
      components: form.components,
      fixedVersion: form.fixedVersion,
      labels: form.labels,
      byWhen: form.byWhen
    };

    const response = await fetch(`${API_BASE}/coach`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!response.ok) {
      setCoach(null);
      setError(data.error ? `${data.error}: ${data.missingFields?.join(', ') || ''}` : 'Failed to fetch coaching response');
      return;
    }
    setCoach(data);
  };

  const checkSla = async () => {
    const response = await fetch(`${API_BASE}/support/sla`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: form.supportStatus, enteredAt: new Date().toISOString() })
    });
    setSla(await response.json());
  };

  return (
    <div className="container">
      <header>
        <h1>JiraSense AI Scrum Coach</h1>
        <p>Unified assistant for Jira + Azure DevOps + Sprint/Kanban board workflows.</p>
      </header>

      <section className="card">
        <h2>Tip of the Day</h2>
        <p>{tip}</p>
      </section>

      <section className="grid two-col">
        <article className="card">
          <h2>Knowledge Base</h2>
          <div className="toggle-row">
            {['all', 'scraped', 'ai'].map((mode) => (
              <button
                key={mode}
                className={kbMode === mode ? 'active' : ''}
                onClick={() => setKbMode(mode)}
              >
                {mode.toUpperCase()}
              </button>
            ))}
          </div>
          <ul>
            {kbItems.map((item) => (
              <li key={item.id}>
                <strong>{item.title}</strong>: {item.snippet}
              </li>
            ))}
          </ul>
        </article>

        <article className="card">
          <h2>Mistakes to Avoid</h2>
          <ul>
            {mistakes.map((mistake) => (
              <li key={mistake}>{mistake}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="card">
        <h2>Issue Assistant</h2>
        <p>Issue types: {meta.issueTypes.join(', ')}</p>
        <p>Mandatory fields: {meta.mandatoryFields.join(', ')}</p>
        <p>Supported boards: {meta.boards.join(', ')}</p>

        <form onSubmit={submitCoach} className="form-grid">
          <label>Question<input name="question" value={form.question} onChange={onChange} required /></label>
          <label>Issue Type
            <select name="issueType" value={form.issueType} onChange={onChange}>
              {meta.issueTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
          </label>
          <label>Description<textarea name="description" value={form.description} onChange={onChange} /></label>
          <label>Due Date<input type="date" name="dueDate" value={form.dueDate} onChange={onChange} required /></label>
          <label>Components<input name="components" value={form.components} onChange={onChange} required /></label>
          <label>Fixed Version<input name="fixedVersion" value={form.fixedVersion} onChange={onChange} required /></label>
          <label>Labels<input name="labels" value={form.labels} onChange={onChange} required /></label>
          <label>By When<input type="date" name="byWhen" value={form.byWhen} onChange={onChange} required /></label>
          <label className="check"><input type="checkbox" name="hasCustomerImpact" checked={form.hasCustomerImpact} onChange={onChange} />Customer Impact</label>
          <button type="submit">Get AI Suggestions</button>
          {error && <p className="error">{error}</p>}
        </form>

        {coach && (
          <div className="result">
            <h3>AI Response</h3>
            <p>{coach.answer}</p>
            <p><strong>Story points:</strong> {coach.suggestedStoryPoints}</p>
            <p><strong>Priority:</strong> {coach.suggestedPriority}</p>
            <p><strong>Template sections:</strong> {coach.recommendedTemplateSections.join(', ')}</p>
          </div>
        )}
      </section>

      <section className="card">
        <h2>Support Ticket Fields + SLA Helper</h2>
        <div className="form-grid">
          <label>CSAT Feedback<input name="csatFeedback" value={form.csatFeedback} onChange={onChange} required /></label>
          <label>Help Topic<input name="helpTopic" value={form.helpTopic} onChange={onChange} required /></label>
          <label>Assignee<input name="assignee" value={form.assignee} onChange={onChange} required /></label>
          <label>Component<input name="component" value={form.component} onChange={onChange} required /></label>
          <label>Status
            <select name="supportStatus" value={form.supportStatus} onChange={onChange}>
              <option>Open</option>
              <option>Waiting for Information</option>
              <option>Hold</option>
              <option>Resolved</option>
            </select>
          </label>
          <button type="button" onClick={checkSla}>Check 5-day SLA Logic</button>
        </div>

        {sla && (
          <div className="result">
            {sla.slaPaused ? (
              <p>SLA paused. Remaining hold/waiting window: {sla.remainingDays} day(s).</p>
            ) : (
              <p>SLA clock active.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default App;
