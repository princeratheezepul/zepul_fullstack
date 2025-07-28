/**
 * Utility function to determine resume tag based on job title and description
 * @param {string} jobTitle - The job title
 * @param {string} jobDescription - The job description
 * @returns {string} - The determined tag (Engineering, Marketing, Sales, Customer Support, Finance)
 */
export const determineResumeTag = (jobTitle, jobDescription) => {
  const title = (jobTitle || '').toLowerCase();
  const description = (jobDescription || '').toLowerCase();
  const combinedText = `${title} ${description}`;

  // Engineering keywords
  const engineeringKeywords = [
    'engineer', 'engineering', 'developer', 'programmer', 'software', 'frontend', 'backend', 'fullstack',
    'devops', 'data engineer', 'machine learning', 'ai', 'artificial intelligence', 'system', 'infrastructure',
    'cloud', 'aws', 'azure', 'gcp', 'database', 'api', 'mobile', 'ios', 'android', 'web', 'react', 'angular',
    'vue', 'node', 'python', 'java', 'javascript', 'typescript', 'sql', 'nosql', 'docker', 'kubernetes',
    'microservices', 'architecture', 'testing', 'qa', 'quality assurance', 'technical', 'coding', 'programming'
  ];

  // Marketing keywords
  const marketingKeywords = [
    'marketing', 'digital marketing', 'social media', 'content', 'seo', 'sem', 'ppc', 'google ads',
    'facebook ads', 'brand', 'branding', 'campaign', 'advertising', 'public relations', 'pr', 'communications',
    'growth', 'acquisition', 'lead generation', 'email marketing', 'influencer', 'analytics', 'google analytics',
    'facebook pixel', 'conversion', 'optimization', 'creative', 'design', 'graphic', 'copywriting', 'copywriter',
    'marketing manager', 'marketing specialist', 'marketing coordinator', 'brand manager', 'product marketing'
  ];

  // Sales keywords
  const salesKeywords = [
    'sales', 'sales representative', 'sales manager', 'account executive', 'business development',
    'sales development', 'inside sales', 'outside sales', 'territory', 'quota', 'commission', 'prospecting',
    'lead generation', 'cold calling', 'pipeline', 'crm', 'salesforce', 'closing', 'negotiation', 'relationship',
    'client', 'customer', 'revenue', 'target', 'b2b', 'b2c', 'enterprise', 'sdr', 'bdr', 'sales director',
    'regional sales', 'national sales', 'international sales', 'channel sales', 'partnership'
  ];

  // Customer Support keywords
  const customerSupportKeywords = [
    'customer support', 'customer service', 'help desk', 'technical support', 'support specialist',
    'customer care', 'client services', 'customer success', 'customer experience', 'cx', 'support engineer',
    'tier 1', 'tier 2', 'tier 3', 'escalation', 'troubleshooting', 'resolution', 'satisfaction', 'feedback',
    'chat support', 'phone support', 'email support', 'live chat', 'zendesk', 'freshdesk', 'intercom',
    'customer advocate', 'customer liaison', 'support coordinator', 'support manager'
  ];

  // Finance keywords
  const financeKeywords = [
    'finance', 'financial', 'accountant', 'accounting', 'bookkeeper', 'bookkeeping', 'auditor', 'audit',
    'controller', 'cfo', 'financial analyst', 'investment', 'banking', 'credit', 'risk', 'compliance',
    'tax', 'taxation', 'payroll', 'treasury', 'budget', 'forecasting', 'financial planning', 'fp&a',
    'cost accounting', 'managerial accounting', 'gaap', 'ifrs', 'quickbooks', 'xero', 'sage', 'erp',
    'financial reporting', 'reconciliation', 'general ledger', 'accounts payable', 'accounts receivable'
  ];

  // Count matches for each category
  const engineeringMatches = engineeringKeywords.filter(keyword => combinedText.includes(keyword)).length;
  const marketingMatches = marketingKeywords.filter(keyword => combinedText.includes(keyword)).length;
  const salesMatches = salesKeywords.filter(keyword => combinedText.includes(keyword)).length;
  const customerSupportMatches = customerSupportKeywords.filter(keyword => combinedText.includes(keyword)).length;
  const financeMatches = financeKeywords.filter(keyword => combinedText.includes(keyword)).length;

  // Find the category with the most matches
  const matches = [
    { category: 'Engineering', count: engineeringMatches },
    { category: 'Marketing', count: marketingMatches },
    { category: 'Sales', count: salesMatches },
    { category: 'Customer Support', count: customerSupportMatches },
    { category: 'Finance', count: financeMatches }
  ];

  // Sort by match count (descending) and return the category with most matches
  matches.sort((a, b) => b.count - a.count);
  
  // If no matches found, default to Engineering
  return matches[0].count > 0 ? matches[0].category : 'Engineering';
}; 