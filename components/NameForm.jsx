import { useState, useEffect } from 'react';
import { submitName, getReversedName } from '../lib/api/names';

export default function NameForm() {
  const [nameInput,    setNameInput]    = useState('');
  const [reversedName, setReversedName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError,  setSubmitError]  = useState(null);
  const [successMsg,   setSuccessMsg]   = useState('');

  useEffect(() => {
    async function loadStoredName() {
      const { data } = await getReversedName();
      if (data?.reversed_name) setReversedName(data.reversed_name);
    }
    loadStoredName();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSuccessMsg('');
    const { data, error } = await submitName(nameInput);
    if (error) {
      setSubmitError(error);
    } else {
      setReversedName(data.reversed);
      setSuccessMsg(data.message ?? 'Saved');
      setNameInput('');
    }
    setIsSubmitting(false);
  }

  return (
    <div className="widget">
      <h2 className="widget-title"><span className="widget-icon">🔄</span>Name Reversal (Custom REST API)</h2>
      <div className="widget-body">
        <form onSubmit={handleSubmit} className="name-form" noValidate>
          <div className="form-row">
            <input
              type="text"
              className="form-input"
              placeholder='e.g. "Eko"'
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              disabled={isSubmitting}
              aria-label="Name to submit"
              maxLength={100}
            />
            <button type="submit" className="form-btn" disabled={isSubmitting || !nameInput.trim()}>
              {isSubmitting ? 'Submitting…' : 'Submit'}
            </button>
          </div>
          {submitError && (
            <div className="state-box state-box--error form-feedback" role="alert">
              <span className="state-icon">⚠</span><p>{submitError}</p>
            </div>
          )}
          {successMsg && !submitError && <p className="form-success">✓ {successMsg}</p>}
        </form>
        {reversedName ? (
          <div className="reversed-result">
            <p className="widget-sub">Reversed name from WordPress:</p>
            <p className="widget-value reversed-value">{reversedName}</p>
          </div>
        ) : (
          <p className="widget-sub">Submit a name above to see it reversed by WordPress.</p>
        )}
      </div>
    </div>
  );
}