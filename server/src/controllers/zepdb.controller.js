import Resume from "../models/resume.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const processZepDBQuery = async (req, res) => {
  try {
    const { query } = req.body;
    const recruiterId = req.user._id; // From auth middleware

    if (!query || !query.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: "Query is required" 
      });
    }

    // Step 1: Use Gemini API to extract structured information
    const extractedInfo = await extractQueryInfoWithGemini(query);
    
    // Step 2: Query database based on extracted information
    const candidates = await fetchCandidatesFromDB(extractedInfo, recruiterId);
    
    // Step 3: Format response
    const formattedCandidates = formatCandidatesForResponse(candidates);

    res.status(200).json({
      success: true,
      data: {
        query,
        extractedInfo,
        candidates: formattedCandidates,
        totalCount: formattedCandidates.length
      }
    });

  } catch (error) {
    console.error('ZepDB Query Error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to process query",
      error: error.message
    });
  }
};

const extractQueryInfoWithGemini = async (userQuery) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    You are an AI assistant that extracts structured information from recruitment queries for a resume database.
    
    Extract the following information from this query: "${userQuery}"
    
    Return ONLY a JSON object with these fields:
    {
      "role": "extracted role or empty string",
      "minExperience": number (0 if not specified),
      "maxExperience": number (null if not specified),
      "skills": ["array", "of", "skills"],
      "location": "extracted location or empty string",
      "status": "all" (default)
    }
    
    Detailed Rules:
    - For ROLE: Be VERY SPECIFIC and extract the exact job role mentioned. 
      * "software developer" → "software developer" 
      * "frontend developer" → "frontend developer"
      * "backend engineer" → "backend engineer"
      * "full stack developer" → "full stack developer"
      * "java developer" → "java developer"
      * "react developer" → "react developer"
      * DO NOT extract generic terms like just "developer" if a specific type is mentioned
      * DO NOT confuse roles: "product manager" is NOT a "developer"
    
    - For experience: Extract numbers followed by "years", "yrs", "year", "experience"
      Examples: "3+ years" → minExperience: 3, "2-5 years" → minExperience: 2, maxExperience: 5
      "greater than 1 year" → minExperience: 1, "more than 2 years" → minExperience: 2
    
    - For skills: Look for technical skills like React, Node.js, Python, Java, JavaScript, TypeScript, Angular, Vue, Django, Spring Boot, etc.
      Also include frameworks and tools: AWS, Docker, Kubernetes, MongoDB, MySQL, PostgreSQL, etc.
    
    - For location: Extract city names, states, or countries mentioned
    
    - For status: Look for status keywords like "shortlisted", "rejected", "screening", "submitted"
    
    - Be PRECISE and SPECIFIC in extraction
    - If no specific criteria found, use empty strings or 0 values
    - Return ONLY the JSON, no other text or markdown formatting
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Gemini Raw Response:', text);
    
    // Clean the response and parse JSON
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    const extracted = JSON.parse(cleanedText);
    
    console.log('Extracted Info:', extracted);
    
    return extracted;
  } catch (error) {
    console.error('Gemini API Error:', error);
    // Fallback to simple parsing if Gemini fails
    return fallbackQueryParsing(userQuery);
  }
};

const fallbackQueryParsing = (userQuery) => {
  const prompt = userQuery.toLowerCase();
  
  const extracted = {
    role: '',
    minExperience: 0,
    maxExperience: null,
    skills: [],
    location: '',
    status: 'all'
  };

  // Extract role - More comprehensive role matching
  const roleKeywords = [
    'product manager', 'project manager', 'program manager',
    'software developer', 'developer', 'programmer', 'engineer', 
    'frontend developer', 'backend developer', 'full stack developer', 
    'web developer', 'software engineer', 'data scientist', 'data analyst',
    'senior developer', 'junior developer', 'lead developer', 'tech lead',
    'devops engineer', 'qa engineer', 'test engineer', 'ui/ux designer'
  ];
  
  for (const keyword of roleKeywords) {
    if (prompt.includes(keyword)) {
      extracted.role = keyword;
      break;
    }
  }

  // Extract experience - More sophisticated experience matching
  const experiencePatterns = [
    /(\d+)\+?\s*(?:years?|yrs?|year)/i,
    /(\d+)-(\d+)\s*(?:years?|yrs?|year)/i,
    /experience\s*(?:of\s*)?(\d+)\s*(?:years?|yrs?|year)/i
  ];
  
  for (const pattern of experiencePatterns) {
    const match = prompt.match(pattern);
    if (match) {
      if (match[2]) {
        // Range format: "3-5 years"
        extracted.minExperience = parseInt(match[1]);
        extracted.maxExperience = parseInt(match[2]);
      } else {
        // Single number: "3 years" or "3+ years"
        extracted.minExperience = parseInt(match[1]);
        if (prompt.includes('+')) {
          extracted.maxExperience = extracted.minExperience + 3;
        } else {
          extracted.maxExperience = extracted.minExperience + 2;
        }
      }
      break;
    }
  }

  // Extract skills - More comprehensive skill matching
  const skillKeywords = [
    'react', 'node', 'python', 'java', 'javascript', 'typescript', 'angular', 'vue',
    'django', 'spring boot', 'express', 'mongodb', 'mysql', 'postgresql', 'aws',
    'docker', 'kubernetes', 'git', 'html', 'css', 'bootstrap', 'tailwind',
    'redux', 'next.js', 'nuxt.js', 'php', 'c#', 'c++', 'go', 'rust', 'scala'
  ];
  
  for (const skill of skillKeywords) {
    if (prompt.includes(skill)) {
      extracted.skills.push(skill);
    }
  }

  // Extract location
  const locationKeywords = [
    'bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune', 'kolkata',
    'remote', 'onsite', 'hybrid', 'india', 'usa', 'uk', 'canada', 'australia'
  ];
  
  for (const location of locationKeywords) {
    if (prompt.includes(location)) {
      extracted.location = location;
      break;
    }
  }

  // Extract status
  const statusKeywords = ['shortlisted', 'rejected', 'screening', 'submitted', 'scheduled'];
  for (const status of statusKeywords) {
    if (prompt.includes(status)) {
      extracted.status = status;
      break;
    }
  }

  console.log('Fallback Parsing Result:', extracted);

  return extracted;
};

const fetchCandidatesFromDB = async (filters, recruiterId) => {
  try {
    // Build query based on filters
    let query = { recruiterId };
    let sortCriteria = { overallScore: -1, ats_score: -1 }; // Sort by score first
    
    // Initialize $and array for combining multiple conditions
    query.$and = [];

    // Filter by role/title - ULTRA STRICT role matching for accuracy
    if (filters.role) {
      const exactRolePhrase = filters.role.toLowerCase().trim();
      const roleKeywords = exactRolePhrase.split(' ');
      
      // Create exact phrase matching regex
      const exactPhraseRegex = new RegExp(`\\b${exactRolePhrase.replace(/\s+/g, '\\s+')}\\b`, 'i');
      
      // Create conditions that require ALL keywords to be present
      const allKeywordsConditions = [];
      
      // For each field, check if it contains the exact phrase OR all individual keywords
      const fieldsToCheck = ['title', 'applicationDetails.position', 'tag'];
      
      fieldsToCheck.forEach(field => {
        // Exact phrase match
        allKeywordsConditions.push({ [field]: exactPhraseRegex });
        
        // All keywords must be present (for cases like "product manager" where both words should exist)
        if (roleKeywords.length > 1) {
          const keywordAndConditions = roleKeywords.map(keyword => ({
            [field]: new RegExp(`\\b${keyword}\\b`, 'i')
          }));
          allKeywordsConditions.push({ $and: keywordAndConditions });
        }
      });
      
      // Handle recommended_job_roles separately since it might be an array
      // For arrays, we need to check if any element matches
      allKeywordsConditions.push({ 'recommended_job_roles': exactPhraseRegex });
      if (roleKeywords.length > 1) {
        const keywordAndConditions = roleKeywords.map(keyword => ({
          'recommended_job_roles': new RegExp(`\\b${keyword}\\b`, 'i')
        }));
        allKeywordsConditions.push({ $and: keywordAndConditions });
      }
      
      // Add role filter as AND condition - must match at least one field with exact criteria
      query.$and.push({
        $or: allKeywordsConditions
      });
    }

    // Filter by experience - More precise experience matching
    if (filters.minExperience > 0) {
      const experienceConditions = [];
      
      // Create more precise experience patterns
      const minExp = filters.minExperience;
      const maxExp = filters.maxExperience || (minExp + 10); // Default range
      
      // Match experience patterns more precisely
      for (let i = minExp; i <= Math.min(maxExp, minExp + 8); i++) {
        experienceConditions.push(
          new RegExp(`\\b${i}\\s*(?:years?|yrs?)\\b`, 'i'),
          new RegExp(`\\b${i}\\+\\s*(?:years?|yrs?)\\b`, 'i'),
          new RegExp(`\\b${i}-\\d+\\s*(?:years?|yrs?)\\b`, 'i')
        );
      }
      
      // Also match ranges that include our minimum
      for (let start = Math.max(0, minExp - 2); start <= minExp; start++) {
        for (let end = minExp; end <= minExp + 5; end++) {
          if (start < end) {
            experienceConditions.push(
              new RegExp(`\\b${start}-${end}\\s*(?:years?|yrs?)\\b`, 'i')
            );
          }
        }
      }
      
      query.$and.push({
        $or: [
          { experience: { $in: experienceConditions } },
          { 'aiSummary.technicalExperience': { $in: experienceConditions } }
        ]
      });
    }

    // Filter by skills - More focused skill matching
    if (filters.skills && filters.skills.length > 0) {
      const skillConditions = [];
      
      filters.skills.forEach(skill => {
        const skillRegex = new RegExp(`\\b${skill}\\b`, 'i'); // Word boundary for exact match
        skillConditions.push(
          { skills: skillRegex },
          { 'aiSummary.technicalExperience': skillRegex },
          { 'aiSummary.skillMatch': skillRegex }
        );
      });
      
      query.$and.push({
        $or: skillConditions
      });
    }

    // Filter by location - More precise location matching
    if (filters.location) {
      const locationRegex = new RegExp(`\\b${filters.location}\\b`, 'i');
      
      query.$and.push({
        $or: [
          { location: locationRegex },
          { 'applicationDetails.location': locationRegex }
        ]
      });
    }

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      query.status = filters.status;
    }

    // Add higher score-based filtering for better quality results
    query.$and.push({
      $or: [
        { overallScore: { $gte: 60 } }, // Higher minimum score threshold
        { ats_score: { $gte: 60 } }
      ]
    });

    // If no specific filters applied, don't return all candidates
    if (query.$and.length === 1) { // Only score filter
      query.$and.push({
        $or: [
          { overallScore: { $gte: 70 } }, // Even higher threshold for general queries
          { ats_score: { $gte: 70 } }
        ]
      });
    }

    console.log('ZepDB Query:', JSON.stringify(query, null, 2));

    // Execute query with population and better sorting
    const candidates = await Resume.find(query)
      .populate('jobId', 'jobtitle company skills experience location')
      .sort(sortCriteria)
      .limit(50); // Reduced limit for more relevant results

    console.log(`ZepDB Found ${candidates.length} candidates`);

    // Post-process results for ULTRA STRICT accuracy
    const filteredCandidates = candidates.filter(candidate => {
      // Additional STRICT role filtering if role was specified
      if (filters.role) {
        const exactRolePhrase = filters.role.toLowerCase().trim();
        const roleKeywords = exactRolePhrase.split(' ');
        
        // Get all candidate role fields - handle different data types
        const candidateFields = [
          (candidate.title || '').toString().toLowerCase(),
          (candidate.applicationDetails?.position || '').toString().toLowerCase(),
          // Handle recommended_job_roles which might be an array or string
          Array.isArray(candidate.recommended_job_roles) 
            ? candidate.recommended_job_roles.join(' ').toLowerCase()
            : (candidate.recommended_job_roles || '').toString().toLowerCase(),
          (candidate.tag || '').toString().toLowerCase()
        ];
        
        // Check if ANY field contains the exact phrase
        const exactPhraseMatch = candidateFields.some(field => {
          // Remove extra spaces and check for exact phrase
          const cleanField = field.replace(/\s+/g, ' ').trim();
          return cleanField.includes(exactRolePhrase);
        });
        
        // Check if ANY field contains ALL keywords (for multi-word roles)
        const allKeywordsMatch = candidateFields.some(field => {
          return roleKeywords.every(keyword => 
            new RegExp(`\\b${keyword}\\b`, 'i').test(field)
          );
        });
        
        // Must have either exact phrase match OR all keywords present
        const roleMatch = exactPhraseMatch || allKeywordsMatch;
        
        if (!roleMatch) {
          const candidateRoleInfo = candidateFields.filter(f => f.length > 0).join(' | ');
          console.log(`Filtered out ${candidate.name} - Role mismatch: "${candidateRoleInfo}" vs "${filters.role}"`);
          return false;
        }
        
        // Additional check: For specific roles, exclude obvious mismatches
        if (exactRolePhrase === 'product manager') {
          const hasProductManager = candidateFields.some(field => 
            /\bproduct\s+manager\b/i.test(field) || 
            /\bpm\b/i.test(field) ||
            field.includes('product management')
          );
          
          const isNotProductManager = candidateFields.some(field => 
            /\bsoftware\s+(developer|engineer)\b/i.test(field) ||
            /\bfrontend\s+(developer|engineer)\b/i.test(field) ||
            /\bbackend\s+(developer|engineer)\b/i.test(field) ||
            /\bfull\s?stack\s+(developer|engineer)\b/i.test(field) ||
            /\bdata\s+(scientist|analyst|engineer)\b/i.test(field) ||
            /\bdevops\s+engineer\b/i.test(field)
          );
          
          if (!hasProductManager || isNotProductManager) {
            console.log(`Filtered out ${candidate.name} - Not a product manager: "${candidateFields.filter(f => f.length > 0).join(' | ')}"`);
            return false;
          }
        }
        
        // Similar check for software developer
        if (exactRolePhrase.includes('software developer') || exactRolePhrase.includes('developer')) {
          const hasDeveloper = candidateFields.some(field => 
            /\b(software\s+)?(developer|engineer|programmer)\b/i.test(field) ||
            /\b(frontend|backend|full\s?stack)\s+(developer|engineer)\b/i.test(field)
          );
          
          const isNotDeveloper = candidateFields.some(field => 
            /\bproduct\s+manager\b/i.test(field) ||
            /\bproject\s+manager\b/i.test(field) ||
            /\bmarketing\s+manager\b/i.test(field) ||
            /\bsales\s+(manager|executive)\b/i.test(field) ||
            /\bhr\s+(manager|executive)\b/i.test(field)
          );
          
          if (!hasDeveloper || isNotDeveloper) {
            console.log(`Filtered out ${candidate.name} - Not a developer: "${candidateFields.filter(f => f.length > 0).join(' | ')}"`);
            return false;
          }
        }
      }
      
      return true;
    });

    console.log(`After post-filtering: ${filteredCandidates.length} candidates`);

    return filteredCandidates;
  } catch (error) {
    console.error('Database Query Error:', error);
    throw error;
  }
};

const formatCandidatesForResponse = (candidates) => {
  return candidates.map(candidate => ({
    id: candidate._id,
    name: candidate.name || 'N/A',
    email: candidate.email || 'N/A',
    phone: candidate.phone || 'N/A',
    appliedDate: candidate.applicationDetails?.date || 
                 candidate.createdAt?.toLocaleDateString() || 'N/A',
    score: candidate.overallScore ? `${Math.round(candidate.overallScore)}%` : 
           candidate.ats_score ? `${Math.round(candidate.ats_score)}%` : 'N/A',
    status: candidate.status || 'submitted',
    experience: candidate.experience || 'N/A',
    skills: candidate.skills || [],
    non_technical_skills: candidate.non_technical_skills || [],
    role: candidate.title || candidate.applicationDetails?.position || 'N/A',
    location: candidate.location || 'N/A',
    jobTitle: candidate.jobId?.jobtitle || 'N/A',
    company: candidate.jobId?.company || 'N/A',
    overallScore: candidate.overallScore || candidate.ats_score || 0,
    aiSummary: candidate.aiSummary || {},
    recommendation: candidate.recommendation || '',
    keyStrength: candidate.keyStrength || [],
    potentialConcern: candidate.potentialConcern || [],
    tag: candidate.tag || 'Engineering',
    // Add score breakdown for better insights
    scoreBreakdown: {
      skillMatch: candidate.ats_breakdown?.skill_match?.score || 0,
      experienceRelevance: candidate.ats_breakdown?.experience_relevance?.score || 0,
      projectAchievement: candidate.ats_breakdown?.project_achievement?.score || 0,
      resumeQuality: candidate.ats_breakdown?.resume_quality?.score || 0,
      interviewPrediction: candidate.ats_breakdown?.interview_prediction?.score || 0
    },
    // Add AI scorecard
    aiScorecard: candidate.aiScorecard || {
      technicalSkillMatch: 0,
      competitiveFit: 0,
      consistencyCheck: 0,
      teamLeadership: 0
    },
    // Add application details
    applicationDetails: candidate.applicationDetails || {},
    // Add notice period and source
    noticePeriod: candidate.applicationDetails?.noticePeriod || 'N/A',
    source: candidate.applicationDetails?.source || 'N/A'
  }));
};

// Get candidate statistics for status tabs
export const getZepDBStats = async (req, res) => {
  try {
    const recruiterId = req.user._id;
    
    const stats = await Resume.aggregate([
      { $match: { recruiterId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = {
      all: 0,
      scheduled: 0,
      screening: 0,
      submitted: 0,
      shortlisted: 0,
      rejected: 0,
      offered: 0,
      hired: 0
    };

    stats.forEach(stat => {
      statusCounts[stat._id] = stat.count;
      statusCounts.all += stat.count;
    });

    res.status(200).json({
      success: true,
      data: statusCounts
    });

  } catch (error) {
    console.error('ZepDB Stats Error:', error);
    res.status(500).json({
      success: false,
      message: "Failed to get statistics",
      error: error.message
    });
  }
};
