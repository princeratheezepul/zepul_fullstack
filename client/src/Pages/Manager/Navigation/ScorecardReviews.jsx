import React, { useEffect, useState } from 'react';

const ScorecardReviews = () => {
  const [scorecards, setScorecards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actions, setActions] = useState({});

  useEffect(() => {
    const fetchScorecards = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/scorecard/get-scorecard`);
        if (!response.ok) throw new Error('Failed to fetch scorecards');
        const data = await response.json();
        setScorecards(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchScorecards();
  }, []);

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
console.log(userInfo);
  const managerName = userInfo?.data.user.fullname;
  console.log(managerName)
  const sendEmail = async (scorecardId, toEmail, managerName) => {
    try {
      console.log("Sending email to:",scorecardId, toEmail, managerName);

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/scorecard/reqanotherround`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toEmail, managerName }),
      });

      if (!response.ok) throw new Error('Failed to send email');

      updateAction(scorecardId, { emailSent: true }, {
        requestAnotherRound: true,
        emailSent: true,
      });
    } catch (err) {
      console.error('Email sending failed:', err.message);
    }
  };


  const sendUpdateToBackend = async (id, payload) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/scorecard/update/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Failed to update scorecard');
    } catch (err) {
      console.error('Error updating scorecard:', err.message);
    }
  };

  const updateAction = (id, newActionState, backendPayload = null) => {
    setActions((prev) => ({ ...prev, [id]: { ...prev[id], ...newActionState } }));
    if (backendPayload) sendUpdateToBackend(id, backendPayload);
  };

  if (loading) return <div>Loading scorecards...</div>;
  if (error) return <div>Error: {error}</div>;
console.log(scorecards);
  return (
    <div>
      {scorecards.length === 0 ? (
        <p>No scorecards found.</p>
      ) : (
        scorecards.map((scorecard) => {
          const action = actions[scorecard._id] || {};
          const {
            isApproved,
            isRejected,
            requestAnotherRound
          } = scorecard;

          const isFinalized = isApproved || isRejected || requestAnotherRound;

          return (
            <div key={scorecard._id} style={{ border: '1px solid gray', padding: '10px', marginBottom: '20px' }}>
              <h3>Candidate ID: {scorecard.candidateId}</h3>
              <p>Average Score: {scorecard.averageScore}</p>

              <div>
                <h4>Skill Scores:</h4>
                {scorecard.skillScores?.length > 0 ? (
                  <ul>
                    {scorecard.skillScores.map((skill) => (
                      <li key={skill._id}>
                        <strong>{skill.skill}:</strong> {skill.score}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No skill scores available.</p>
                )}
              </div>

              {isApproved && <p>✅ Scorecard approved and submitted to client.</p>}
              {isRejected && <p>❌ Scorecard rejected with feedback.</p>}
              {requestAnotherRound && <p>🔁 Another interview round requested.</p>}

              {!isFinalized && (
                <>
                  {!action.approveStarted && !action.requestRoundStarted && !action.rejectStarted && (
                    <button onClick={() => updateAction(scorecard._id, { approveStarted: true })}>
                      Approve
                    </button>
                  )}

                  {action.approveStarted && !action.feedbackGiven && (
                    <>
                      <textarea
                        placeholder="Add feedback..."
                        value={action.feedback || ''}
                        onChange={(e) =>
                          updateAction(scorecard._id, { feedback: e.target.value })
                        }
                        rows={3}
                        style={{ width: '100%', marginTop: '10px' }}
                      />
                      <button
                        onClick={() => {
                          updateAction(scorecard._id, { feedbackGiven: true }, {
                            isApproved: false,
                            feedback: action.feedback || '',
                          });
                        }}
                        disabled={!action.feedback?.trim()}
                      >
                        Add Feedback
                      </button>
                    </>
                  )}

                  {action.feedbackGiven && !action.clientSubmissionAdded && (
                    <button
                      onClick={() =>
                        updateAction(scorecard._id, { clientSubmissionAdded: true }, {
                          isApproved: true,
                          feedback: action.feedback || '',
                        })
                      }
                    >
                      Add for Client Submission
                    </button>
                  )}

                  {!action.approveStarted && !action.requestRoundStarted && !action.rejectStarted && (
                    <button
                      style={{ marginLeft: '10px' }}
                      onClick={() => updateAction(scorecard._id, { requestRoundStarted: true })}
                    >
                      Request Another Round
                    </button>
                  )}

                  {action.requestRoundStarted && !action.emailSent && (
                    <button
                      onClick={() =>
                        sendEmail(scorecard._id, scorecard.resume.email_address, managerName)
                      }
                      style={{ marginTop: '10px' }}
                    >
                      Send Email
                    </button>
                  )}


                  {!action.approveStarted && !action.requestRoundStarted && !action.rejectStarted && (
                    <button
                      style={{ marginLeft: '10px' }}
                      onClick={() => updateAction(scorecard._id, { rejectStarted: true })}
                    >
                      Reject
                    </button>
                  )}

                  {action.rejectStarted && !action.rejectFeedbackGiven && (
                    <>
                      <textarea
                        placeholder="Add rejection feedback..."
                        value={action.rejectFeedback || ''}
                        onChange={(e) =>
                          updateAction(scorecard._id, { rejectFeedback: e.target.value })
                        }
                        rows={3}
                        style={{ width: '100%', marginTop: '10px' }}
                      />
                      <button
                        onClick={() =>
                          updateAction(scorecard._id, { rejectFeedbackGiven: true }, {
                            isRejected: true,
                            rejectFeedback: action.rejectFeedback || '',
                          })
                        }
                        disabled={!action.rejectFeedback?.trim()}
                      >
                        Add Feedback
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default ScorecardReviews;