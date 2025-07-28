import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ChangeEmail = () => {
    const { id, token } = useParams();
    const [message, setMessage] = useState("Processing...");

    useEffect(() => {
        const changeEmail = async () => {
            try {
                const res = await fetch(`http://localhost:5880/api/manager/change-email/${id}/${token}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const data = await res.json();

                if (res.ok) {
                    setMessage(data.message);
                } else {
                    setMessage(data.message || "Failed to update email.");
                }
            } catch (error) {
                console.error("Fetch error:", error);
                setMessage("An error occurred while updating email.");
            }
        };

        changeEmail();
    }, [id, token]);

    return (
        <div className="p-4">
            <h2>{message}</h2>
        </div>
    );
};

export default ChangeEmail;
