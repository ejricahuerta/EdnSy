/**
 * Legal demo: lawyers, paralegals, law firms.
 * Same content shape as other industries for template reuse.
 */
export const legalDemoContent = {
	header: { navLinks: [] as { label: string; href: string }[], ctaLabel: 'Book a consultation' },
	hero: {
		badge: 'Confidential consultation',
		tagline: 'Clear legal advice when you need it',
		taglineWithCity: 'Legal services in {city}',
		subtext: 'From initial consultation to resolution, I provide straightforward legal guidance. Confidentiality and clear communication are at the core of my practice.',
		subheadline: 'Consultation • Representation • Peace of mind. Book a confidential call.',
		trustBadges: [] as string[],
		urgencyText: '',
		image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80',
		imageAlt: 'Legal office',
		ctaPrimary: 'Book a consultation',
		ctaSecondary: 'View practice areas'
	},
	whyUs: {
		heading: 'Why choose this practice',
		subtext: 'I focus on giving you a clear understanding of your options and a practical path forward.',
		items: [
			{ title: 'Experienced', description: 'Years of experience in my practice areas. I stay current on law and procedure so you get sound advice.' },
			{ title: 'Clear communication', description: 'Legal matters can be confusing. I explain things in plain language and keep you informed at every step.' },
			{ title: 'Confidential', description: 'Attorney-client privilege and strict confidentiality. What you share stays between us.' }
		]
	},
	services: {
		heading: 'Practice areas',
		subtext: 'I provide advice and representation in the following areas. Not sure if I can help? Book a consultation.',
		items: [
			{ title: 'Family law', description: 'Divorce, separation, custody, support, and related matters. Sensitive handling and clear guidance through difficult times.', icon: 'Scale' },
			{ title: 'Real estate & property', description: 'Purchases, sales, refinancing, and title issues. I work with your realtor and lender to close smoothly.', icon: 'FileText' },
			{ title: 'Wills & estates', description: 'Wills, powers of attorney, and estate administration. Plan ahead or get help when someone has passed.', icon: 'ShieldCheck' }
		]
	},
	about: {
		heading: 'About this practice',
		subtext: 'I built my practice on referrals and repeat clients. My job is to give you clear advice and effective representation so you can make informed decisions.',
		subtext2: 'I work with individuals and families. Every matter is treated with confidentiality and respect.',
		bullets: ['Clear fee structure—you know what to expect before we start.', 'Responsive communication. You\'ll hear back promptly.', 'Professional standards and strict confidentiality.'],
		image: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800&q=80',
		imageAlt: 'Professional legal environment'
	},
	newPatients: {
		heading: 'Your first consultation',
		subtext: 'We start with a confidential conversation to understand your situation and how I can help.',
		steps: [
			{ title: 'Book a consultation', description: 'Use the button above or call to schedule. I\'ll send a short intake form so we use our time well.' },
			{ title: 'We meet (in person or video)', description: 'You tell me about your situation. I\'ll ask questions and outline your options and next steps.' },
			{ title: 'You decide how to proceed', description: 'I\'ll give you a clear scope and fee quote. No pressure—you decide whether to retain me.' }
		],
		ctaLabel: 'Book a consultation',
		switchingEasy: 'Consultations are confidential. No obligation.',
		whatToBringTitle: 'For the consultation',
		whatToBring: ['Any relevant documents (agreements, court papers, etc.)', 'A brief summary of your situation and goals', 'Questions you want to ask']
	},
	whatToExpect: {
		heading: 'What to expect',
		subtext: 'I keep the process clear and confidential.',
		items: [
			'You book a consultation. I may send a short intake form to review before we meet.',
			'We meet (in person or by video). You explain your situation; I ask questions and outline options.',
			'You receive a clear summary of advice and, if applicable, a fee quote and next steps.',
			'If you retain me, we proceed according to the agreed scope. I keep you updated throughout.'
		]
	},
	hours: { heading: 'Office hours', lines: ['Monday – Friday: 9:00 AM – 5:00 PM', 'Consultations by appointment', 'Urgent matters: call to discuss'] },
	testimonials: {
		heading: 'What clients say',
		subtext: 'Feedback from people I\'ve represented (details kept confidential).',
		ratingDisplay: '5.0',
		reviewCount: '50+ reviews',
		items: [
			{ quote: 'Explained everything clearly and got me through a difficult situation. Professional and compassionate.', author: 'Client', role: 'Family law', rating: 5 },
			{ quote: 'Handled our real estate closing smoothly. Responsive and easy to work with. Would use again.', author: 'Client', role: 'Real estate', rating: 5 },
			{ quote: 'Updated our wills and POAs. Straightforward process and peace of mind. Highly recommend.', author: 'Client', role: 'Estates', rating: 5 }
		]
	},
	insurance: {
		heading: 'Fees & billing',
		body: 'Fees are discussed at the consultation. I offer hourly and fixed-fee options depending on the matter. Retainers may be required. You will receive a clear fee agreement before any work begins. All communications are confidential.'
	},
	stats: [
		{ value: '15+', label: 'Years in practice' },
		{ value: '500+', label: 'Clients represented' },
		{ value: '100%', label: 'Confidential' }
	],
	contact: {
		heading: 'Contact the office',
		subtext: 'Book a consultation or send a confidential enquiry.',
		address: '1 Yonge Finch Plaza, Toronto, ON',
		phone: '+1 (289) 513-5055',
		email: 'hello@example-legal.com',
		ctaLabel: 'Book a consultation'
	},
	faq: {
		heading: 'Frequently asked questions',
		items: [
			{ q: 'How do I book a consultation?', a: 'Use the "Book a consultation" button or call the office. We\'ll find a time and send any intake form. Consultations are confidential.' },
			{ q: 'What does a consultation cost?', a: 'Consultation fees are explained when you book. Many matters start with a fixed-fee consultation so you know the cost upfront.' },
			{ q: 'Is everything I say confidential?', a: 'Yes. Attorney-client privilege applies. What you share in a consultation or after retaining me is confidential.' },
			{ q: 'Do you offer payment plans?', a: 'Depending on the matter, we can discuss payment arrangements. This is addressed at the consultation.' }
		]
	},
	footer: {
		links: [
			{ label: 'Practice areas', href: '#services' },
			{ label: 'About', href: '#about' },
			{ label: 'Consultation', href: '#new-patients' },
			{ label: 'FAQ', href: '#faq' },
			{ label: 'Contact', href: '#contact' }
		],
		ctaLabel: 'Book a consultation',
		ctaHeading: 'Book a consultation',
		copyright: 'All rights reserved.'
	},
	cta: {
		heading: 'Need legal advice?',
		subtext: 'Book a confidential consultation. No obligation.',
		microReassurance: 'All communications are confidential.',
		button: 'Book a consultation',
		phoneLabel: 'Or call the office'
	}
} as const;
