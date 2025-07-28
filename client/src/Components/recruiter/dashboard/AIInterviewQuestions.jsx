import React, { useState, useEffect, useRef } from 'react';
import { Plus, RefreshCw, HelpCircle, Edit2, ArrowLeft, Upload } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { GoogleGenerativeAI } from "@google/generative-ai";
import toast from 'react-hot-toast';
import AddAnswersPage from './AddAnswersPage';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API);

const AIInterviewQuestions = ({ onBack, jobDetails, resumeData }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [interviewScheduled, setInterviewScheduled] = useState(false);
  const [selectedScheduleData, setSelectedScheduleData] = useState(null);
  const [showAnswersPage, setShowAnswersPage] = useState(false);
  
  const [schedule, setSchedule] = useState([]);
  const [selectedDate, setSelectedDate] = useState(0);
  const [editingTime, setEditingTime] = useState(null);
  const [timeValue, setTimeValue] = useState("04:00 PM");

  const newQuestionRef = useRef(null);
  const [newQuestionIndex, setNewQuestionIndex] = useState(null);

  // Check if interview is already scheduled
  useEffect(() => {
    if (resumeData?.interviewScheduled) {
      setInterviewScheduled(true);
      setQuestions(resumeData.interviewQuestions || []);
      setSelectedScheduleData({
        dayOfWeek: resumeData.interviewDay,
        dateOfMonth: resumeData.interviewDate,
        time: resumeData.interviewTime
      });
      setLoading(false);
    } else {
      fetchAIQuestions();
    }
  }, [resumeData]);

  const fetchAIQuestions = async () => {
    setLoading(true);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
            Based on the following job and resume, generate 4 distinct interview questions.
            
            Job Title: ${jobDetails.position}
            Candidate's Name: ${resumeData.name}
            Candidate's Key Skills: ${resumeData.skills.join(", ")}
            Candidate's Experience: ${resumeData.aiSummary.technicalExperience}

            Return the questions in a pure JSON array format like this: 
            [
                {"category": "Technical Experience", "text": "Question text here..."},
                {"category": "Problem Solving", "text": "Question text here..."},
                {"category": "Team Collaboration", "text": "Question text here..."},
                {"category": "Critical Thinking", "text": "Question text here..."}
            ]

            Do not repeat questions you have generated before. Ensure the questions are insightful and relevant to the candidate's profile and the job role.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const cleanedText = text.replace(/```json|```/g, "").trim();
        const parsedQuestions = JSON.parse(cleanedText);
        setQuestions(parsedQuestions);

    } catch (error) {
        console.error("Failed to fetch AI questions:", error);
        // Fallback to mock questions on error
        const mockQuestions = [
            { category: 'Technical Experience', text: `Describe your experience with React.js and modern frontend technologies. Can you share a specific project where you built reusable components?` },
            { category: 'Problem Solving', text: `Describe a complex technical challenge you faced and how you approached solving it. What was the outcome?` },
            { category: 'Team Collaboration', text: `How do you handle disagreements with team members or stakeholders regarding technical decisions?` },
            { category: 'Critical Thinking', text: `How do you stay updated with the latest trends and best practices in frontend development?` }
        ];
        setQuestions(mockQuestions);
    } finally {
        setLoading(false);
    }
  };
  
  useEffect(() => {
    const today = new Date();
    const futureDays = Array.from({ length: 4 }, (_, i) => {
        const day = addDays(today, i);
        return {
            date: day,
            dayOfWeek: format(day, 'EEE'),
            dateOfMonth: format(day, 'MMM d'),
            time: '04:00 PM'
        };
    });
    setSchedule(futureDays);
    setSelectedDate(futureDays[0].date.toISOString());
  }, []);

  const handleQuestionChange = (index, newText) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].text = newText;
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions(prev => {
      const updated = [...prev, { category: 'New Question', text: 'Enter your question here...' }];
      setNewQuestionIndex(updated.length - 1);
      return updated;
    });
  };

  useEffect(() => {
    if (newQuestionIndex !== null && newQuestionRef.current) {
      newQuestionRef.current.focus();
      setNewQuestionIndex(null);
    }
  }, [questions, newQuestionIndex]);

  const handleTimeChange = (e) => {
    setTimeValue(e.target.value);
  }

  const saveTime = (index) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[index].time = timeValue;
    setSchedule(updatedSchedule);
    setEditingTime(null);
  }

  const handleScheduleInterview = async () => {
    const selectedSchedule = schedule.find(day => day.date.toISOString() === selectedDate);
    if (!selectedSchedule) return;

    setScheduling(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/resumes/${resumeData._id}/schedule-interview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewDay: selectedSchedule.dayOfWeek,
          interviewDate: selectedSchedule.dateOfMonth,
          interviewTime: selectedSchedule.time,
          questions: questions
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule interview');
      }

      const result = await response.json();
      setInterviewScheduled(true);
      setSelectedScheduleData({
        dayOfWeek: selectedSchedule.dayOfWeek,
        dateOfMonth: selectedSchedule.dateOfMonth,
        time: selectedSchedule.time
      });
      toast.success('Interview scheduled successfully! Email sent to candidate.');
    } catch (error) {
      console.error('Error scheduling interview:', error);
      toast.error('Failed to schedule interview. Please try again.');
    } finally {
      setScheduling(false);
    }
  };

  const handleUploadTranscript = () => {
    setShowAnswersPage(true);
  };

  const handleBackFromAnswers = () => {
    setShowAnswersPage(false);
  };

  // Show answers page if it's active
  if (showAnswersPage) {
    // Filter out placeholder questions before passing to AddAnswersPage
    const filteredQuestions = questions.filter(q => 
      q.text !== 'Enter your question here...' && 
      q.text !== '' && 
      q.text.trim() !== ''
    );
    
    return (
      <AddAnswersPage
        onBack={handleBackFromAnswers}
        questions={filteredQuestions}
        jobDetails={jobDetails}
        resumeData={resumeData}
      />
    );
  }

  return (
    <div className="bg-gray-50/50 p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
             <button onClick={onBack} className="text-gray-500 hover:text-gray-800">
                <ArrowLeft size={24} />
            </button>
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">AI Powered Interview Question</h1>
                <p className="text-gray-600">AI Powered Interview Question for {jobDetails.position}</p>
            </div>
        </div>
        
        {/* AI Generated Questions Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80 mb-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {interviewScheduled ? 'Interview Questions' : 'AI Generated Questions'}
                </h2>
                {!interviewScheduled && (
                  <button onClick={fetchAIQuestions} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                      <RefreshCw size={16} />
                      Regenerate
                  </button>
                )}
            </div>
            
            {loading ? (
                 <div className="space-y-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>)}
                 </div>
            ) : (
                <div className="space-y-4">
                    {questions.map((q, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50/80">
                             <HelpCircle size={20} className="text-gray-400 mt-1 flex-shrink-0" />
                             <div className="flex-grow">
                                <h3 className="font-semibold text-gray-800">{q.category}</h3>
                                {interviewScheduled ? (
                                  <p className="text-gray-600">{q.text}</p>
                                ) : (
                                  <textarea 
                                      ref={index === questions.length - 1 ? newQuestionRef : null}
                                      value={q.text}
                                      placeholder="Enter your question here"
                                      onFocus={e => {
                                        if (q.text === 'Enter your question here...') {
                                          handleQuestionChange(index, '');
                                        }
                                      }}
                                      onChange={(e) => handleQuestionChange(index, e.target.value)}
                                      className="w-full text-gray-600 bg-transparent border-none focus:ring-0 resize-none p-0 m-0"
                                      rows={2}
                                  />
                                )}
                             </div>
                             {!interviewScheduled && (
                               <button className="text-gray-400 hover:text-gray-600">
                                  <Edit2 size={16} />
                               </button>
                             )}
                        </div>
                    ))}
                </div>
            )}
            
            {!interviewScheduled && (
              <div className="mt-6">
                  <button onClick={addQuestion} className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer">
                      <Plus size={18} />
                      Add Question
                  </button>
              </div>
            )}
        </div>

        {/* Smart Questions for Today Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Schedule Interview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {interviewScheduled && selectedScheduleData ? (
                  // Show only the selected schedule after interview is scheduled
                  <div className="p-4 rounded-xl text-center bg-blue-600 text-white shadow-lg">
                    <p className="font-bold text-lg">{selectedScheduleData.dayOfWeek}</p>
                    <p className="text-sm text-blue-200">{selectedScheduleData.dateOfMonth}</p>
                    <p className="font-semibold mt-2">{selectedScheduleData.time}</p>
                  </div>
                ) : (
                  // Show all 4 options before scheduling
                  schedule.map((day, index) => (
                    <div 
                        key={index} 
                        onClick={() => setSelectedDate(day.date.toISOString())}
                        className={`p-4 rounded-xl text-center cursor-pointer relative group transition-all duration-300 ${
                          selectedDate === day.date.toISOString() 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                    >
                        <p className="font-bold text-lg">{day.dayOfWeek}</p>
                        <p className={`text-sm ${selectedDate === day.date.toISOString() ? 'text-blue-200' : 'text-gray-500'}`}>{day.dateOfMonth}</p>
                       
                        {editingTime === index ? (
                             <input type="text" value={timeValue} onChange={handleTimeChange} onBlur={() => saveTime(index)} autoFocus className="w-20 bg-gray-700 text-white rounded mt-2 text-center" />
                        ) : (
                             <p className="font-semibold mt-2">{day.time}</p>
                        )}
                        
                        <button onClick={(e) => { 
                          e.stopPropagation();
                          setEditingTime(index); 
                          setTimeValue(day.time); 
                        }} className="absolute top-2 right-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Edit2 size={14} />
                        </button>
                    </div>
                  ))
                )}
            </div>
            {interviewScheduled ? (
              <button 
                onClick={handleUploadTranscript}
                className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Upload size={18} />
                  Transcript
              </button>
            ) : (
              <button 
                onClick={handleScheduleInterview}
                disabled={scheduling}
                className="w-full md:w-auto px-6 py-2 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                {scheduling ? 'Scheduling...' : 'Continue'}
              </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default AIInterviewQuestions; 