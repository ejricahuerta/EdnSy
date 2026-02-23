Standard Operating Procedure: Automated Mock-up Generation and Outreach
1. Data Scraping and Import
Scrape relevant business data (company name, phone, email, website) for targeted SMEs.

Import data into Notion CRM table with a default status like 'Prospect' or 'Demo Needed'.

2. Automated Trigger and Analysis
Change the status in Notion to 'Generate Demo'.

A webhook is triggered, activating a serverless function (e.g., Netlify Functions or Cloudflare Workers).

The function calls the v0 API to generate personalized mock-ups based on the client's website data.

3. Deployment and Status Update
v0 deploys the mock-up to Vercel, generating a unique link.

The serverless function updates the Notion status to 'Demo Created'.

4. Personalized Email Delivery
A second webhook is triggered when the status is 'Demo Created'.

Resend sends a personalized cold email to the client with a catchy subject line, the mock-up link, and a clear call to action for scheduling a discussion.