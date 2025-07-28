import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const AdminCandidateDetails = () => {
  const [scorecards, setScorecards] = useState([]);
  const [notes, setNotes] = useState({});
  const [noteInputs, setNoteInputs] = useState({});
  const { resumeId } = useParams();
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    if (resumeId && userInfo?.data?.accessToken) {
      fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/candidates/${resumeId}`,
        {
          headers: {
            Authorization: `Bearer ${userInfo.data.accessToken}`,
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          setScorecards(data.scorecard);

          // Initialize notes and noteInputs for each scorecard
          const initialNotes = {};
          const initialNoteInputs = {};
          data.scorecard.forEach((card, i) => {
            initialNotes[i] = card.note || "";
            initialNoteInputs[i] = ""; // input only shown if no note
          });
          setNotes(initialNotes);
          setNoteInputs(initialNoteInputs);
        })
        .catch((err) => console.error("Error fetching details:", err));
    }
  }, [resumeId]);

  // Handle typing inside note input
  const handleNoteInputChange = (index, value) => {
    setNoteInputs({ ...noteInputs, [index]: value });
  };

  // Save note to backend
  const handleSaveNote = (index) => {
    const note = noteInputs[index]?.trim();
    if (!note) {
      alert("Note cannot be empty");
      return;
    }

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/note/${resumeId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.data.accessToken}`,
      },
      body: JSON.stringify({ note }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert("Note saved!");

        // Update local state with new note and clear input
        setNotes({ ...notes, [index]: note });
        setNoteInputs({ ...noteInputs, [index]: "" });

        // Optionally update scorecards state for consistency
        setScorecards((prev) => {
          const updated = [...prev];
          updated[index].note = note;
          return updated;
        });
      })
      .catch((err) => console.error("Error saving note:", err));
  };

  if (!scorecards || scorecards.length === 0)
    return <div className="p-4">No scorecards found.</div>;

  return (
    <div className="p-4 space-y-6">
      {scorecards.map((card, index) => {
        const {
          resume,
          answers,
          evaluatedAnswers,
          averageScore,
          feedback,
          isApproved,
          isRejected,
          rejectFeedback,
          note,
        } = card;

        return (
          <div key={index} className="border p-4 rounded shadow-sm">
            <h2 className="text-xl font-bold mb-2">{resume.name}</h2>
            <p className="text-sm">Email: {resume.email_address}</p>
            <p className="text-sm">Location: {resume.location}</p>
            <p className="text-sm">ATS Score: {resume.ats_score}</p>

            <div className="mt-2 font-semibold text-sm">
              Final Scorecard (Average Score): {averageScore ?? "N/A"}
            </div>

            {isRejected && (
              <p className="text-red-600 mt-1">❌ Rejected: {rejectFeedback}</p>
            )}
            {isApproved && <p className="text-green-600 mt-1">✅ Approved</p>}

            <div className="mt-4">
              <h3 className="font-semibold">Answers:</h3>
              {answers?.length > 0 ? (
                <ul className="list-disc pl-4">
                  {answers.map((ans, i) => (
                    <li key={i}>
                      Answer {i + 1}: <strong>{ans}</strong>
                      {evaluatedAnswers?.[i]?.total !== undefined && (
                        <span className="ml-2 text-sm text-gray-600">
                          (Score: {evaluatedAnswers[i].total})
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No answers available.</p>
              )}
            </div>

            {feedback && (
              <div className="mt-2">
                <h4 className="font-semibold">Feedback:</h4>
                <p>{feedback}</p>
              </div>
            )}

            {/* Display note or add note input */}
            <div className="mt-4">
              {note && note.trim() !== "" ? (
                <div>
                  <h4 className="font-semibold">Admin Note:</h4>
                  <p className="bg-gray-100 p-3 rounded">{note}</p>
                </div>
              ) : (
                <div>
                  <h4 className="font-semibold">Add Admin Note:</h4>
                  <textarea
                    className="w-full p-2 border rounded mt-1"
                    rows={3}
                    value={noteInputs[index] || ""}
                    onChange={(e) =>
                      handleNoteInputChange(index, e.target.value)
                    }
                    placeholder="Add a note..."
                  />
                  <button
                    className="mt-2 px-4 py-1 bg-blue-600 text-white rounded"
                    onClick={() => handleSaveNote(index)}
                  >
                    Save Note
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AdminCandidateDetails;
