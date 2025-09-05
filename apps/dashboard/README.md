# EdnSy Dashboard - Internal Metrics Platform

A comprehensive internal monitoring platform for EdnSy business operations, providing real-time insights into billing, automation workflows, and website analytics.

## 🚀 Features

### Core Integrations
- **Stripe Billing Dashboard** - Monitor revenue, subscriptions, and payment metrics
- **n8n Workflow Monitoring** - Track automation performance and system health
- **PostHog Analytics** - Website traffic and user behavior analytics
- **Supabase Authentication** - Secure user management and access control

### Dashboard Components
- Real-time metrics and KPIs
- Interactive charts and visualizations
- Performance monitoring and alerts
- User-friendly interface with responsive design

## 🛠️ Tech Stack

- **Framework**: SvelteKit 5 with TypeScript
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Shadcn-svelte
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Charts**: LayerChart (D3-based)
- **Icons**: Lucide Svelte

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your API keys:
   - Supabase configuration
   - Stripe API keys
   - n8n API configuration
   - PostHog API keys

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Required Environment Variables

#### Supabase (Authentication & Database)
```bash
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### Stripe (Billing Dashboard)
```bash
STRIPE_SECRET_KEY=your_stripe_secret_key
PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

#### n8n (Workflow Monitoring)
```bash
N8N_API_KEY=your_n8n_api_key
N8N_BASE_URL=http://localhost:5678
```

#### PostHog (Website Analytics)
```bash
POSTHOG_API_KEY=your_posthog_api_key
POSTHOG_PROJECT_ID=your_posthog_project_id
```

## 📊 Dashboard Sections

### 1. Main Dashboard (`/dashboard`)
- Overview of all key metrics
- Quick access to all integrations
- Summary cards and charts

### 2. Stripe Billing (`/stripe`)
- Monthly Recurring Revenue (MRR)
- Annual Recurring Revenue (ARR)
- Active subscriptions count
- Churn rate analysis
- Payment success rates
- Revenue trends

### 3. n8n Workflows (`/n8n`)
- Active workflows monitoring
- Execution success/failure rates
- Average execution times
- Recent workflow executions
- System health status
- Performance metrics

### 4. Analytics (`/analytics`)
- Website traffic metrics
- User behavior analysis
- Top performing pages
- Traffic sources breakdown
- Real-time user activity
- User retention data

## 🏗️ Project Structure

```
dashboard/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ui/                 # Shadcn-svelte components
│   │   │   ├── app-sidebar.svelte  # Main navigation
│   │   │   ├── stripe-dashboard.svelte
│   │   │   ├── n8n-dashboard.svelte
│   │   │   └── analytics-dashboard.svelte
│   │   ├── services/
│   │   │   ├── stripe.ts           # Stripe API integration
│   │   │   ├── n8n.ts             # n8n API integration
│   │   │   └── analytics.ts        # PostHog Analytics integration
│   │   └── supabase.ts             # Supabase client
│   ├── routes/
│   │   ├── dashboard/              # Main dashboard
│   │   ├── stripe/                 # Stripe billing dashboard
│   │   ├── n8n/                   # n8n workflow dashboard
│   │   ├── analytics/              # Analytics dashboard
│   │   └── auth/                   # Authentication routes
│   └── app.html
├── static/                         # Static assets
├── tasks/                          # Task management files
└── env.example                     # Environment variables template
```

## 🔌 API Integrations

### Stripe Integration
- Fetches billing metrics and subscription data
- Calculates MRR, ARR, and churn rates
- Monitors payment success rates
- Tracks customer lifetime value

### n8n Integration
- Monitors workflow execution status
- Tracks performance metrics
- Provides system health indicators
- Shows recent execution history

### PostHog Analytics Integration
- Website traffic analysis
- User behavior tracking
- Real-time activity monitoring
- Conversion rate analysis

## 🚀 Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment
1. Build the application:
   ```bash
   npm run build
   ```
2. Deploy the `build` directory to your hosting provider

## 🔒 Security

- All API keys are stored as environment variables
- Server-side API calls for sensitive data
- Supabase Row Level Security (RLS) enabled
- Authentication required for all dashboard access

## 🐛 Troubleshooting

### Common Issues

1. **API Key Errors**
   - Ensure all environment variables are set correctly
   - Check API key permissions and scopes
   - Verify API endpoints are accessible

2. **Authentication Issues**
   - Verify Supabase configuration
   - Check Google OAuth setup
   - Ensure proper redirect URLs

3. **Data Not Loading**
   - Check browser console for errors
   - Verify API endpoints are responding
   - Check network connectivity

## 📈 Future Enhancements

- [ ] Real-time notifications and alerts
- [ ] Custom dashboard widgets
- [ ] Export functionality for reports
- [ ] Advanced filtering and date ranges
- [ ] Mobile app companion
- [ ] Integration with additional services

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions
