Product Requirements Document (PRD)
===================================

Product Name
------------

Lead Capture & Excel Automation Tool

Overview
--------

This product is a lightweight internal tool that allows a developer or sales person to quickly log outreach call results through a form. The submitted information automatically populates an Excel or Google Sheet used as a lead tracking system.

The goal is to eliminate manual spreadsheet entry and make it faster to record call outcomes, follow-ups, and deal stages.

Problem Statement
=================

When doing outreach calls for website development services, leads are often tracked manually in Excel. This creates several problems:

*   Time wasted manually entering data
    
*   Missing follow-up reminders
    
*   Inconsistent formatting
    
*   Hard to track lead progress
    

A simple form-based system can streamline the process by automatically inserting structured data into the spreadsheet.

Goals
=====

1.  Reduce manual spreadsheet editing
    
2.  Allow quick lead entry after calls
    
3.  Automatically append new lead records to Excel
    
4.  Maintain structured and consistent data
    
5.  Enable easy follow-up tracking
    

Target Users
============

Primary users:

*   Freelance developers
    
*   Small web agencies
    
*   Sales outreach teams
    

User characteristics:

*   Conduct outreach calls
    
*   Need quick logging after calls
    
*   Prefer simple tools over complex CRM systems
    

User Workflow
=============

### Step 1

User opens the lead entry form.

### Step 2

User fills the call details:

*   Business name
    
*   Contact person
    
*   Phone
    
*   Website status
    
*   Lead interest
    
*   Notes
    
*   Follow-up date
    

### Step 3

User submits the form.

### Step 4

Backend API processes the request.

### Step 5

The system automatically appends a new row to the Excel or Google Sheet.

Core Features
=============

1\. Lead Entry Form
-------------------

A form for entering lead information.

Fields:

*   Business Name
    
*   Contact Person
    
*   Phone Number
    
*   Email
    
*   City
    
*   Industry
    
*   Website Status
    
*   Call Status
    
*   Lead Status
    
*   Interest Level
    
*   What They Need
    
*   Budget Range
    
*   Decision Maker
    
*   Next Action
    
*   Next Follow Up Date
    
*   Notes
    
*   Source
    
*   Deal Stage
    

Form requirements:

*   Mobile friendly
    
*   Fast submission
    
*   Required fields validation
    

2\. Spreadsheet Integration
===========================

The system should automatically append form submissions to a spreadsheet.

Supported options:

Option A: Excel fileOption B: Google Sheets (recommended)

Each submission should create a new row.

3\. API Endpoint
================

Example endpoint:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   POST /api/leads   `

Payload example:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   {  "businessName": "XYZ Bags",  "contactPerson": "Rajesh Kumar",  "phone": "9876543210",  "city": "Muzaffarpur",  "industry": "Manufacturing",  "callStatus": "Called",  "leadStatus": "Interested",  "interestLevel": "High",  "need": "Ecommerce",  "budget": "30000",  "decisionMaker": "Owner",  "nextAction": "Send proposal",  "followUp": "2026-03-08",  "notes": "Asked for product catalog",  "source": "Google Maps",  "dealStage": "Interested"}   `

4\. Data Validation
===================

Required fields:

*   Business Name
    
*   Phone Number
    
*   Call Status
    
*   Lead Status
    

Validation rules:

*   Phone must be numeric
    
*   Follow-up must be valid date
    
*   Dropdown fields restricted to predefined values
    

5\. Status Dropdown Values
==========================

### Call Status

*   Not Called
    
*   Called
    
*   No Answer
    

### Lead Status

*   Interested
    
*   Follow Up
    
*   Not Interested
    

### Interest Level

*   High
    
*   Medium
    
*   Low
    

### Deal Stage

*   Lead Found
    
*   Contacted
    
*   Interested
    
*   Proposal Sent
    
*   Negotiation
    
*   Won
    
*   Lost
    

Non-Functional Requirements
===========================

### Performance

Form submission should complete within 1–2 seconds.

### Reliability

No data loss during submission.

### Scalability

Support up to 10,000 leads.

### Security

*   API requests are authenticated via an `X-API-Key` header checked against a server-side `API_KEY` environment variable. If `API_KEY` is not set, auth is bypassed for development convenience.

*   HTTP security headers (Content-Security-Policy, Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options, X-XSS-Protection) are enforced via Helmet.

*   CORS is restricted to an explicit allowlist of origins defined in `ALLOWED_ORIGINS` (production) or `localhost:5173` / `localhost:4000` (development).

*   Rate limiting is applied globally (100 requests / 15 min per IP) and more strictly on lead creation (20 requests / 15 min per IP).

*   All string inputs in request bodies are sanitized to strip XSS / HTML payloads before validation.

*   Request body size is capped at 16 KB.

*   HTTP parameter pollution is prevented via the hpp middleware.

*   Production error responses never expose stack traces or internal details.

*   Docker containers run as a non-root user.

Tech Stack Recommendation
=========================

Frontend

*   React / Next.js
    
*   Tailwind
    

Backend

*   Node.js
    
*   Express
    

Data Integration

Option 1:

*   ExcelJS (for .xlsx)
    

Option 2 (Recommended):

*   Google Sheets API
    

Data Model
==========

Lead Object

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Lead{ businessName contactPerson phone email city industry websiteStatus callStatus leadStatus interestLevel need budget decisionMaker nextAction followUp notes source dealStage createdAt}   `

Future Enhancements
===================

### 1\. Reminder System

Automatic alerts when follow-up date arrives.

### 2\. Pipeline Dashboard

Kanban board showing lead stages.

Example:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   Lead Found → Contacted → Interested → Proposal → Won   `

### 3\. Call Logging

Store call notes and timestamps.

### 4\. Analytics

Track:

*   total leads
    
*   conversion rate
    
*   deals closed
    
*   revenue
    

Success Metrics
===============

The product will be successful if:

*   Lead entry time < 20 seconds
    
*   100% structured data entries
    
*   Increased follow-up completion
    
*   Better sales tracking