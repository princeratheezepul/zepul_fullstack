import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Or useRouter() for Next.js
import ResumeParser from "../../../components/ResumeParser";

const ApplyJob = () => {
    const { jobid } = useParams(); // useRouter().query.id in Next.js
    console.log(jobid)
    const [job, setJob] = useState(null);
    const [resume, setResume] = useState(null);

    const fetchJob = async () => {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/job/${jobid}`);
        const data = await res.json();
        if (data?.job) setJob(data.job);
    };

    useEffect(() => {
        fetchJob();
    }, []);

    const handleResumeUpload = async () => {
        const formData = new FormData();
        formData.append("resume", resume);
        formData.append("jobId", jobid);

        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/apply`, {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        alert(data.message);
    };

    return (
        <div>
            <ResumeParer/>
        </div>
    );
};

export default ApplyJob;
