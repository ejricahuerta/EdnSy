# Ednsy Demo Platform

This is the interactive demo platform for Ednsy, allowing local businesses to experience AI automation in action before committing to implementation services.

## Features

- **Google OAuth Authentication**: Secure sign-in with Google accounts
- **Credit System**: 200 credits per user for exploring 8-10 demo scenarios
- **Industry-Specific Demos**: Tailored automation scenarios for different business types
- **Interactive Demo Experience**: Step-by-step walkthroughs with progress tracking
- **Consultation Booking**: Seamless transition from demo to consultation booking
- **Mobile Responsive**: Optimized for business owners on-the-go

## Demo Categories

### Restaurant & Food Service (25-40 credits per demo)
- Online ordering system with kitchen integration
- Reservation management and waitlist handling
- Review and social media automation
- Inventory tracking and supplier reordering
- Staff scheduling based on demand forecasting

### Professional Services (20-35 credits per demo)
- Appointment scheduling with automated reminders
- Client intake form processing and CRM updates
- Automated follow-up sequences
- Document generation and e-signature workflows
- Payment processing and invoice generation

### Retail & E-commerce (30-45 credits per demo)
- Customer segmentation and personalized campaigns
- Inventory management with low-stock alerts
- Abandoned cart recovery automation
- Loyalty program management
- Social media content scheduling

### Home Services (25-40 credits per demo)
- Lead qualification and appointment booking
- Service reminder and maintenance scheduling
- Estimate generation and proposal automation
- Customer communication throughout service lifecycle
- Review and referral request automation

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

### Consultations Table
- `user_id`: User requesting consultation
- `industry`: User's industry
- `demo_activity_summary`: Summary of demo engagement
- `consultation_type`: in-person/phone/video
- `scheduled_at`: Consultation appointment time
- `status`: scheduled/completed/cancelled

## User Flow

1. **Landing Page**: User visits existing Ednsy landing page
2. **Demo Onboarding**: User clicks "Try Demo Platform" and selects industry
3. **Google OAuth**: User signs in with Google account
4. **Credit Allocation**: User receives 200 credits automatically
5. **Demo Catalog**: User sees industry-specific demos
6. **Demo Experience**: User interacts with step-by-step automation scenarios
7. **Consultation Booking**: User can book consultation after demo completion
8. **Lead Capture**: Demo activity and consultation requests captured for sales team

## Integration Points

### With Existing Landing Page
- Demo platform links added to existing landing page
- Industry pages link to relevant demos
- Seamless navigation between existing site and demo platform

### With CRM Systems
- Demo completion data flows to HubSpot/Pipedrive
- Consultation bookings integrated with Calendly
- Lead scoring based on demo engagement

### Analytics Integration
- Google Analytics 4 tracking for demo engagement
- Custom analytics for demo completion rates
- A/B testing framework for demo optimization

## Security Features

- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Demo data is anonymized and isolated
- GDPR compliance features included
- Secure OAuth integration with Google

## Performance Optimization

- Demo load times under 3 seconds
- Lighthouse score >90 across all metrics
- Real-time credit updates within 300ms
- Mobile-optimized for business owners on-the-go
- CDN integration for global performance

## Next Steps

1. **Set up Supabase project** and configure environment variables
2. **Run database schema script** to create tables and sample data
3. **Configure Google OAuth** in Supabase dashboard
4. **Test demo platform** with sample user accounts
5. **Integrate with existing landing page** by adding demo links
6. **Set up analytics tracking** for demo performance monitoring
7. **Configure consultation booking** with Calendly integration
8. **Deploy to production** and monitor performance

## Support

For technical support or questions about the demo platform, please contact the development team. 