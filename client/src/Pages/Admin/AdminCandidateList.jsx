// components/CandidateList.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminCandidateList({ onSelect }) {
  const [candidates, setCandidates] = useState([]);
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
const navigate=useNavigate();
  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/candidates`,{
            headers: {
              Authorization: `Bearer ${userInfo.data.accessToken}`,
            },
          })
      .then((res) => res.json())
      .then(setCandidates);
  }, []);
  console.log(candidates)
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Candidates</h2>
      <ul>
        {candidates.map((cand) => (
          <li
            key={cand.resumeId}
            className="cursor-pointer p-2 border mb-2 rounded hover:bg-gray-100"
            onClick={() => navigate(`/admin/candidates/${cand.resumeId}`)}
          >
            <div className="font-medium">{cand.name}</div>
            <div className="text-sm text-gray-600">{cand.email}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
