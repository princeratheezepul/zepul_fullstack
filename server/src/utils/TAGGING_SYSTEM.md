# Resume Tagging System

## Overview
The resume tagging system automatically categorizes resumes into one of five categories based on the job title and description for which the resume is uploaded.

## Available Tags
- **Engineering**: Software development, technical roles, programming, infrastructure
- **Marketing**: Digital marketing, content creation, branding, advertising
- **Sales**: Sales representatives, account executives, business development
- **Customer Support**: Help desk, technical support, customer service
- **Finance**: Accounting, financial analysis, bookkeeping, auditing

## How It Works

### Automatic Tagging
When a resume is uploaded with a job ID, the system:
1. Fetches the job details (title and description)
2. Analyzes the text for keywords related to each category
3. Assigns the tag with the highest keyword match count
4. If no matches are found, defaults to "Engineering"

### Manual Tag Updates
Resumes can have their tags manually updated using the API endpoint:
```
PATCH /api/resumes/:resumeId/tag
Body: { "tag": "Marketing" }
```

## API Endpoints

### Get Resumes by Tag
```
GET /api/resumes/tag/:tag
```
Returns all resumes with the specified tag.

### Update Resume Tag
```
PATCH /api/resumes/:resumeId/tag
Body: { "tag": "Sales" }
```
Updates the tag of a specific resume.

## Keyword Categories

### Engineering Keywords
- engineer, engineering, developer, programmer, software, frontend, backend, fullstack
- devops, data engineer, machine learning, ai, artificial intelligence, system, infrastructure
- cloud, aws, azure, gcp, database, api, mobile, ios, android, web, react, angular
- vue, node, python, java, javascript, typescript, sql, nosql, docker, kubernetes
- microservices, architecture, testing, qa, quality assurance, technical, coding, programming

### Marketing Keywords
- marketing, digital marketing, social media, content, seo, sem, ppc, google ads
- facebook ads, brand, branding, campaign, advertising, public relations, pr, communications
- growth, acquisition, lead generation, email marketing, influencer, analytics, google analytics
- facebook pixel, conversion, optimization, creative, design, graphic, copywriting, copywriter
- marketing manager, marketing specialist, marketing coordinator, brand manager, product marketing

### Sales Keywords
- sales, sales representative, sales manager, account executive, business development
- sales development, inside sales, outside sales, territory, quota, commission, prospecting
- lead generation, cold calling, pipeline, crm, salesforce, closing, negotiation, relationship
- client, customer, revenue, target, b2b, b2c, enterprise, sdr, bdr, sales director
- regional sales, national sales, international sales, channel sales, partnership

### Customer Support Keywords
- customer support, customer service, help desk, technical support, support specialist
- customer care, client services, customer success, customer experience, cx, support engineer
- tier 1, tier 2, tier 3, escalation, troubleshooting, resolution, satisfaction, feedback
- chat support, phone support, email support, live chat, zendesk, freshdesk, intercom
- customer advocate, customer liaison, support coordinator, support manager

### Finance Keywords
- finance, financial, accountant, accounting, bookkeeper, bookkeeping, auditor, audit
- controller, cfo, financial analyst, investment, banking, credit, risk, compliance
- tax, taxation, payroll, treasury, budget, forecasting, financial planning, fp&a
- cost accounting, managerial accounting, gaap, ifrs, quickbooks, xero, sage, erp
- financial reporting, reconciliation, general ledger, accounts payable, accounts receivable

## Usage Examples

### Automatic Tagging (when saving resume with job)
```javascript
// The system automatically determines the tag based on job details
const resume = await saveResumeWithJob({
  jobId: "job123",
  name: "John Doe",
  // ... other resume data
});
// Tag will be automatically set based on job title and description
```

### Manual Tag Update
```javascript
// Update a resume's tag manually
const response = await fetch('/api/resumes/resume123/tag', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ tag: 'Marketing' })
});
```

### Get Resumes by Tag
```javascript
// Get all marketing resumes
const marketingResumes = await fetch('/api/resumes/tag/Marketing');
``` 