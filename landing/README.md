# Ednsy Demo Platform

This is the interactive demo platform for Ednsy, designed to help local businesses experience the value of AI automation before committing to implementation services.

## What is Ednsy?

Ednsy empowers local businesses—such as service providers, retailers, and professionals—to streamline operations, save time, and make smarter decisions using AI-powered automation. Our platform lets business owners try out real-world automations in a risk-free, hands-on environment.

## Who is it for?

- Local service businesses (restaurants, salons, clinics, home services)
- Retail shops and small e-commerce
- Professional service providers (consultants, agencies, etc.)

## Core Demos

The Ednsy Demo Platform features **four interactive demos** where users input their information and see AI automation in action:

### 1. AI Assistant Demo (Chat or Voice)
- Users provide their business information and website details
- Experience an AI assistant that can answer customer questions, take orders, or handle inquiries
- Available in both chat and voice interfaces
- Simulates real customer interactions to show how AI can enhance customer service

### 2. Data Insights Demo
- Users upload or input their data (PDF, CSV, website, or any form of data)
- See how Ednsy automatically generates actionable insights from business data
- Demonstrates AI-driven analytics for better decision-making
- Shows trends, patterns, and recommendations from your actual data

### 3. Automation Demo (Email and Phone)
- Users choose from sample automation flows
- Configure email and phone number automation scenarios
- Experience automated workflows like appointment reminders, follow-ups, and notifications
- Shows how routine tasks can be automated to save time

### 4. AI Agent Demo (Combination of All)
- Users input their business information and preferences
- Experience a comprehensive AI agent that combines all capabilities
- Available in both voice and chat interfaces
- Demonstrates the full power of Ednsy's integrated automation platform

## User Experience

- **Interactive Input:** Users provide their real business information to see personalized results
- **Real-time Demo:** Experience AI automation working with your actual data and scenarios
- **No Commitment:** The platform is designed to educate and build confidence in automation
- **Consultation Path:** After trying the demos, users can book a consultation to discuss custom automation for their business

## Setup Instructions

### 1. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to Settings > API to get your project URL and anon key
3. Enable Google OAuth in Authentication > Providers > Google
4. Run the database schema script in `scripts/setup-database.sql`

### 2. Environment Variables

Create a `.env` file in the landing directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Google OAuth Configuration

1. Go to Google Cloud Console (https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
   - `http://localhost:5173/auth/callback` (for development)
6. Copy Client ID and Client Secret to Supabase Google OAuth settings

### 4. Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Database Schema

### Users Table
- `id`: UUID (references auth.users)
- `email`: User's email address
- `industry_preference`: Selected industry during onboarding
- `demo_credits`: Available credits (starts with 200)
- `total_demos_completed`: Number of completed demos

### Demos Table
- `id`: Demo identifier
- `title`: Demo title
- `description`: Demo description
- `industry`: Industry category
- `credit_cost`: Credits required for this demo
- `estimated_time`: Estimated completion time in minutes
- `difficulty`: beginner/intermediate/advanced

### Demo Sessions Table
- `user_id`: User who started the demo
- `demo_id`: Demo being attempted
- `started_at`: When demo was started
- `completed_at`: When demo was completed
- `credits_used`: Credits consumed
- `progress_data`: JSON data for resume functionality
- `user_input_data`: User's provided information for the demo

### Consultations Table
- `user_id`: User requesting consultation
- `industry`: User's industry
- `demo_activity_summary`: Summary of demo engagement
- `consultation_type`: in-person/phone/video
- `scheduled_at`: Consultation appointment time
- `status`: scheduled/completed/cancelled

## User Flow

1. **Landing Page:** User visits the Ednsy landing page
2. **Demo Onboarding:** User clicks "Try Demo Platform" and selects industry
3. **Google OAuth:** User signs in with Google account
4. **Credit Allocation:** User receives 200 credits automatically
5. **Demo Selection:** User chooses from the four available demos
6. **Data Input:** User provides their business information, data, or preferences
7. **Interactive Demo:** User experiences AI automation working with their input
8. **Consultation Booking:** User can book consultation after demo completion
9. **Lead Capture:** Demo activity and consultation requests captured for sales team

## Integration Points

- Demo platform links added to existing landing page
- Consultation bookings integrated with Calendly
- Demo completion data flows to CRM (e.g., HubSpot, Pipedrive)
- Analytics tracking for demo engagement and completion

## Security & Performance

- Row Level Security (RLS) enabled on all tables
- GDPR compliance features included
- Secure OAuth integration with Google
- Demo load times under 3 seconds
- Mobile-optimized for business owners on-the-go
- Secure handling of user input data

## Support

For technical support or questions about the demo platform, please contact the development team.
