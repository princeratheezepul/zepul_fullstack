// ChangeEmailRequest.jsx
import { useState } from 'react';

const ChangeEmailRequest = () => {
  const [currentEmail, setCurrentEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5880/api/manager/change-email-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentEmail, newEmail }),
      });

      const data = await res.json();
      setMessage(data.message || "Something went wrong.");
    } catch (err) {
      console.error(err);
      setMessage("Request failed.");
    }
  };

  return (
    <div>
      <h2>Request Email Change</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Current Email"
          value={currentEmail}
          onChange={(e) => setCurrentEmail(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="New Email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          required
        />
        <button type="submit">Request Change</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ChangeEmailRequest;
