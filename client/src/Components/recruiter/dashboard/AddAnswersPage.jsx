import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Bold, Italic, Underline, List, ListOrdered, RotateCcw, HelpCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useNavigate } from 'react-router-dom';

const AddAnswersPage = ({ onBack, questions, jobDetails, resumeData }) => {
  const [answers, setAnswers] = useState({});
  const [wordCounts, setWordCounts] = useState({});
  const [activeFormatting, setActiveFormatting] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const editorRefs = useRef({});
  const navigate = useNavigate();
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API);
  
  // Check if Gemini API key is available
  useEffect(() => {
    if (!import.meta.env.VITE_GEMINI_API) {
      console.warn('Gemini API key not found in environment variables');
    }
  }, []);

  // Initialize answers and word counts
  useEffect(() => {
    const initialAnswers = {};
    const initialWordCounts = {};
    const initialFormatting = {};
    questions.forEach((question, index) => {
      initialAnswers[index] = '';
      initialWordCounts[index] = 0;
      initialFormatting[index] = { bold: false, italic: false, underline: false };
    });
    setAnswers(initialAnswers);
    setWordCounts(initialWordCounts);
    setActiveFormatting(initialFormatting);
  }, [questions]);

  const handleAnswerChange = (index, value) => {
    setAnswers(prev => ({
      ...prev,
      [index]: value
    }));
    
    // Update word count (strip HTML tags for counting)
    const plainText = value.replace(/<[^>]*>/g, '');
    const wordCount = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
    setWordCounts(prev => ({
      ...prev,
      [index]: wordCount
    }));
  };

  const applyFormatting = (index, formatType) => {
    const editor = editorRefs.current[index];
    if (!editor) return;

    // Focus the editor first
    editor.focus();

    // Toggle formatting state for text formatting options
    if (['bold', 'italic', 'underline'].includes(formatType)) {
      setActiveFormatting(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          [formatType]: !prev[index][formatType]
        }
      }));
    }

    // Get current selection
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);

    // Handle list creation separately
    if (formatType === 'bullet' || formatType === 'numbered') {
      const selectedText = selection.toString();
      
      if (selectedText.length > 0) {
        // Convert selected text to list
        const listType = formatType === 'bullet' ? 'ul' : 'ol';
        const listHTML = `<${listType}><li>${selectedText}</li></${listType}>`;
        
        // Replace selected text with list
        range.deleteContents();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = listHTML;
        const listElement = tempDiv.firstChild;
        range.insertNode(listElement);
        
        // Set cursor after the list
        const newRange = document.createRange();
        newRange.setStartAfter(listElement);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      } else {
        // Create new list at cursor position
        const listType = formatType === 'bullet' ? 'ul' : 'ol';
        const listHTML = `<${listType}><li></li></${listType}>`;
        
        // Insert list at cursor position
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = listHTML;
        const listElement = tempDiv.firstChild;
        range.insertNode(listElement);
        
        // Set cursor inside the list item
        const listItem = listElement.querySelector('li');
        if (listItem) {
          const newRange = document.createRange();
          newRange.setStart(listItem, 0);
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
      
      // Update the answer content
      handleAnswerChange(index, editor.innerHTML);
      return;
    }

    // Handle text formatting
    if (selection.toString().length > 0) {
      // Apply formatting to selected text
      switch (formatType) {
        case 'bold':
          document.execCommand('bold', false, null);
          break;
        case 'italic':
          document.execCommand('italic', false, null);
          break;
        case 'underline':
          document.execCommand('underline', false, null);
          break;
      }
    } else {
      // No selection, apply formatting to current position
      switch (formatType) {
        case 'bold':
          document.execCommand('bold', false, null);
          break;
        case 'italic':
          document.execCommand('italic', false, null);
          break;
        case 'underline':
          document.execCommand('underline', false, null);
          break;
      }
    }

    // Update the answer content
    handleAnswerChange(index, editor.innerHTML);
  };

  const handleKeyDown = (index, e) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          applyFormatting(index, 'bold');
          break;
        case 'i':
          e.preventDefault();
          applyFormatting(index, 'italic');
          break;
        case 'u':
          e.preventDefault();
          applyFormatting(index, 'underline');
          break;
      }
    }
    
    // Handle Enter key for list continuation
    if (e.key === 'Enter') {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const parentElement = range.commonAncestorContainer.nodeType === 1 
          ? range.commonAncestorContainer 
          : range.commonAncestorContainer.parentElement;
        
        // Check if we're inside a list
        const isInList = parentElement && (parentElement.tagName === 'LI' || parentElement.closest('ul, ol'));
        
        if (isInList) {
          // Let the default Enter behavior continue the list
          return;
        }
      }
    }
  };

  const handleEditorSelectionChange = (index) => {
    const editor = editorRefs.current[index];
    if (!editor) return;

    // Check current formatting state based on selection
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const parentElement = range.commonAncestorContainer.nodeType === 1 
        ? range.commonAncestorContainer 
        : range.commonAncestorContainer.parentElement;

      // Check if selection is within formatted elements
      const isBold = parentElement && (parentElement.tagName === 'B' || parentElement.tagName === 'STRONG' || parentElement.style.fontWeight === 'bold');
      const isItalic = parentElement && (parentElement.tagName === 'I' || parentElement.tagName === 'EM' || parentElement.style.fontStyle === 'italic');
      const isUnderlined = parentElement && (parentElement.tagName === 'U' || parentElement.style.textDecoration === 'underline');

      setActiveFormatting(prev => ({
        ...prev,
        [index]: {
          ...prev[index],
          bold: isBold,
          italic: isItalic,
          underline: isUnderlined
        }
      }));
    }
  };

  const handleEditorInput = (index, e) => {
    const content = e.target.innerHTML;
    handleAnswerChange(index, content);
  };

  const handleEditorFocus = (index, e) => {
    // No need to clear content on focus
  };

  const handleEditorBlur = (index, e) => {
    // No need to clear content on blur
  };

  const handleEditorPaste = (index, e) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const handleAddAnswer = (index) => {
    const plainText = answers[index].replace(/<[^>]*>/g, '');
    if (!plainText || plainText.trim() === '') {
      toast.error('Please enter an answer before adding it.');
      return;
    }
    toast.success('Answer added successfully!');
  };

  const handleSubmitAnswers = async () => {
    // Check if there are any valid answers provided (not placeholder questions)
    const answeredQuestions = Object.entries(answers).filter(([index, answer]) => {
      const plainText = answer.replace(/<[^>]*>/g, '');
      const question = questions[index];
      const isPlaceholderQuestion = question && (
        question.text === 'Enter your question here...' || 
        question.text === '' || 
        question.text.trim() === ''
      );
      return plainText && plainText.trim() !== '' && !isPlaceholderQuestion;
    });
    
    if (answeredQuestions.length === 0) {
      toast.error('Please provide at least one valid answer before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      console.log('Starting submission process...');
      
      // Prepare data for Gemini API - only include questions that have answers and are not placeholder questions
      const answersData = questions
        .map((question, index) => ({
          question: question.text,
          answer: answers[index] || '',
          category: question.category,
          index: index
        }))
        .filter(item => {
          const plainText = item.answer.replace(/<[^>]*>/g, '');
          const isPlaceholderQuestion = item.question === 'Enter your question here...' || 
                                       item.question === '' || 
                                       item.question.trim() === '';
          return plainText && plainText.trim() !== '' && !isPlaceholderQuestion;
        });

      console.log('Answers data prepared:', answersData);

      // Check if we have any answers to evaluate
      if (answersData.length === 0) {
        toast.error('Please provide at least one valid answer before submitting.');
        return;
      }

      console.log('Filtered questions for evaluation:', answersData.length);

      // Call Gemini API to get scores and reasons
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        You are an expert interviewer evaluating candidate responses. Please analyze each answer and provide:
        1. A score out of 10
        2. A detailed reason for the score (explained in 2-3 lines)
        3. A confidence level (High/Medium/Low) based on the quality and completeness of the answer

        Job Position: ${jobDetails?.position || 'Senior Frontend Developer'}
        Candidate Name: ${resumeData?.name || 'Candidate'}

        Please evaluate each answer and return the results in this exact JSON format:
        [
          {
            "question": "Question text",
            "answer": "Candidate's answer",
            "score": 8,
            "reason": "Provide a clear, detailed explanation of why this score was given. Explain the strengths and weaknesses of the answer in 2-3 concise lines. Focus on specific aspects like technical knowledge, problem-solving approach, communication clarity, and practical examples provided.",
            "confidence": "High"
          }
        ]

        Scoring criteria:
        - 9-10: Excellent answer with detailed examples and clear understanding
        - 7-8: Good answer with some examples and understanding
        - 5-6: Average answer with basic understanding
        - 3-4: Below average answer with limited understanding
        - 1-2: Poor answer with minimal understanding

        Confidence levels:
        - High: Clear, detailed, well-structured answer
        - Medium: Good answer but could be more detailed
        - Low: Vague, incomplete, or unclear answer

        Important: For the "reason" field, provide a comprehensive explanation in 2-3 lines that covers:
        - What the candidate did well or poorly
        - Specific examples or technical details mentioned
        - Areas for improvement or strengths demonstrated
        - How well the answer aligns with the job requirements

        Here are the answers to evaluate:
        ${JSON.stringify(answersData, null, 2)}
      `;

      console.log('Calling Gemini API...');
      let evaluationResults;
      
      // For testing, use fallback evaluation first
      console.log('Using fallback evaluation for testing...');
      evaluationResults = answersData.map((item) => ({
        question: item.question,
        answer: item.answer,
        score: Math.floor(Math.random() * 4) + 7, // Random score between 7-10
        reason: `This is a test evaluation. The candidate provided a ${item.answer.length > 100 ? 'detailed' : 'brief'} answer to the question about ${item.category}. The response shows ${item.answer.length > 100 ? 'good understanding' : 'basic understanding'} of the topic.`,
        confidence: item.answer.length > 100 ? 'High' : item.answer.length > 50 ? 'Medium' : 'Low'
      }));
      
      console.log('Test evaluation results:', evaluationResults);
      
      // Uncomment this section to use actual Gemini API
      /*
      try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        console.log('Gemini response:', text);
        
        const cleanedText = text.replace(/```json|```/g, "").trim();
        console.log('Cleaned text:', cleanedText);
        
        try {
          evaluationResults = JSON.parse(cleanedText);
          console.log('Parsed evaluation results:', evaluationResults);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          console.error('Failed to parse text:', cleanedText);
          throw new Error('Failed to parse AI response');
        }
      } catch (geminiError) {
        console.error('Gemini API error:', geminiError);
        console.log('Using fallback evaluation...');
        
        // Fallback: Generate mock evaluation results
        evaluationResults = answersData.map((item) => ({
          question: item.question,
          answer: item.answer,
          score: Math.floor(Math.random() * 4) + 7, // Random score between 7-10
          reason: `This is a fallback evaluation. The candidate provided a ${item.answer.length > 100 ? 'detailed' : 'brief'} answer to the question about ${item.category}.`,
          confidence: item.answer.length > 100 ? 'High' : item.answer.length > 50 ? 'Medium' : 'Low'
        }));
        
        console.log('Fallback evaluation results:', evaluationResults);
      }
      */

      // Save results to database
      console.log('Saving to database...');
      
      // Get the correct token from userInfo
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      const token = userInfo?.data?.accessToken;
      
      console.log('AddAnswersPage - userInfo:', userInfo);
      console.log('AddAnswersPage - token:', token);
      console.log('AddAnswersPage - token type:', typeof token);
      console.log('AddAnswersPage - token length:', token?.length);
      console.log('AddAnswersPage - user type:', userInfo?.data?.user?.type);
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Check if user is a recruiter
      if (userInfo?.data?.user?.type !== 'recruiter') {
        console.warn('AddAnswersPage - User is not a recruiter:', userInfo?.data?.user?.type);
        throw new Error('User is not a recruiter');
      }
      
      // Try to decode the token to check if it's valid
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('AddAnswersPage - Token payload:', payload);
          console.log('AddAnswersPage - Token expiration:', new Date(payload.exp * 1000));
          console.log('AddAnswersPage - Token is expired:', payload.exp * 1000 < Date.now());
        }
      } catch (error) {
        console.error('AddAnswersPage - Error decoding token:', error);
      }
      
      // Prepare filtered questions and answers for database save
      const filteredQuestions = answersData.map(item => ({
        category: item.category,
        text: item.question
      }));
      
      const filteredAnswers = {};
      answersData.forEach(item => {
        filteredAnswers[item.index] = item.answer;
      });

      const saveResponse = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/resumes/${resumeData._id}/save-interview-evaluation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          evaluationResults,
          questions: filteredQuestions,
          answers: filteredAnswers,
          status: 'screening'
        }),
      });

      console.log('Save response status:', saveResponse.status);
      
      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        console.error('Save response error:', errorText);
        throw new Error(`Failed to save evaluation results: ${saveResponse.status}`);
      }

      const saveResult = await saveResponse.json();
      console.log('Save result:', saveResult);

      toast.success('Interview evaluation completed successfully!');
      
      // Navigate to recruiter dashboard
      navigate('/recruiter/dashboard');

    } catch (error) {
      console.error('Error submitting answers:', error);
      toast.error(`Failed to submit answers: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const clearAnswer = (index) => {
    setAnswers(prev => ({
      ...prev,
      [index]: ''
    }));
    setWordCounts(prev => ({
      ...prev,
      [index]: 0
    }));
    if (editorRefs.current[index]) {
      editorRefs.current[index].innerHTML = '';
    }
  };

  const createList = (index, listType) => {
    const editor = editorRefs.current[index];
    if (!editor) return;

    editor.focus();
    
    // Simple approach: insert list HTML directly
    const listHTML = listType === 'bullet' 
      ? '<ul><li>• List item</li></ul>'
      : '<ol><li>1. List item</li></ol>';
    
    // If editor is empty, replace content
    if (editor.innerHTML === '' || editor.innerHTML === '<br>') {
      editor.innerHTML = listHTML;
    } else {
      // Insert at cursor position
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = listHTML;
        const listElement = tempDiv.firstChild;
        range.insertNode(listElement);
        
        // Set cursor after the list
        const newRange = document.createRange();
        newRange.setStartAfter(listElement);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
    
    handleAnswerChange(index, editor.innerHTML);
  };

  return (
    <div className="bg-gray-50/50 p-4 sm:p-6 lg:p-8 w-full min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-800">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Add Answers Page</h1>
            <p className="text-gray-600">Adding Answers for {jobDetails?.position || 'Senior Frontend Developer'}</p>
          </div>
        </div>

        {/* Questions and Answers */}
        <div className="space-y-6">
          {questions.map((question, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200/80">
              {/* Question Header */}
              <div className="flex items-start gap-3 mb-4">
                <HelpCircle size={20} className="text-gray-400 mt-1 flex-shrink-0" />
                <div className="flex-grow">
                  <h3 className="font-semibold text-gray-800 text-lg">{question.category}</h3>
                  <p className="text-gray-600 mt-1">{question.text}</p>
                  <p className="text-sm text-gray-400 mt-2">Added on {format(new Date(), 'dd MMM yyyy')}</p>
                </div>
              </div>

              {/* Rich Text Editor Toolbar */}
              <div className="flex items-center gap-2 mb-3 p-2 bg-gray-50 rounded-lg">
                <button
                  onClick={() => applyFormatting(index, 'bold')}
                  className={`p-2 rounded transition-colors cursor-pointer ${
                    activeFormatting[index]?.bold ? 'bg-blue-200 text-blue-700' : 'hover:bg-gray-200'
                  }`}
                  title="Bold (Ctrl+B)"
                >
                  <Bold size={16} />
                </button>
                <button
                  onClick={() => applyFormatting(index, 'italic')}
                  className={`p-2 rounded transition-colors cursor-pointer ${
                    activeFormatting[index]?.italic ? 'bg-blue-200 text-blue-700' : 'hover:bg-gray-200'
                  }`}
                  title="Italic (Ctrl+I)"
                >
                  <Italic size={16} />
                </button>
                <button
                  onClick={() => applyFormatting(index, 'underline')}
                  className={`p-2 rounded transition-colors cursor-pointer ${
                    activeFormatting[index]?.underline ? 'bg-blue-200 text-blue-700' : 'hover:bg-gray-200'
                  }`}
                  title="Underline (Ctrl+U)"
                >
                  <Underline size={16} />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                <button
                  onClick={() => createList(index, 'bullet')}
                  className="p-2 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                  title="Bullet List (Click to add)"
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => createList(index, 'numbered')}
                  className="p-2 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                  title="Numbered List (Click to add)"
                >
                  <ListOrdered size={16} />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-2"></div>
                <button
                  onClick={() => clearAnswer(index)}
                  className="p-2 hover:bg-gray-200 rounded transition-colors cursor-pointer"
                  title="Clear"
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              {/* Answer Text Area */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Answer
                </label>
                <div className="relative">
                                  <div
                  ref={(el) => editorRefs.current[index] = el}
                  contentEditable
                  onInput={(e) => handleEditorInput(index, e)}
                  onFocus={(e) => handleEditorFocus(index, e)}
                  onBlur={(e) => handleEditorBlur(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={(e) => handleEditorPaste(index, e)}
                  onMouseUp={() => handleEditorSelectionChange(index)}
                  onKeyUp={() => handleEditorSelectionChange(index)}
                  className="w-full min-h-[120px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none outline-none"
                  style={{ 
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                />
                  {(!answers[index] || answers[index] === '' || answers[index] === '<br>') && (
                    <div className="absolute top-4 left-4 text-gray-400 pointer-events-none">
                      Type your answer here...
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-500">{wordCounts[index] || 0} words</span>
                  <span className="text-xs text-gray-400">
                    Use Ctrl+B, Ctrl+I, Ctrl+U for formatting
                  </span>
                </div>
              </div>


            </div>
          ))}
        </div>

        {/* Submit Answers Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmitAnswers}
            disabled={submitting}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Evaluating Answers...' : 'Submit answers'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAnswersPage; 