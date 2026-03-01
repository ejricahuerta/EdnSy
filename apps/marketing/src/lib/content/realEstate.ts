/**
 * Real estate demo: agents and brokerages.
 * Same content shape as other industries for template reuse.
 */
export const realEstateDemoContent = {
	header: {
		navLinks: [] as { label: string; href: string }[],
		ctaLabel: 'Schedule a viewing'
	},
	hero: {
		badge: 'Local market expert',
		tagline: 'Your partner in finding the right place',
		taglineWithCity: 'Real estate in {city}',
		subtext:
			'Buying, selling, or renting. I help you navigate the market with local knowledge and a straightforward process.',
		subheadline: 'Buy • Sell • Rent. Free market evaluations. Schedule a call or viewing.',
		trustBadges: [] as string[],
		urgencyText: '',
		image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80',
		imageAlt: 'Modern home exterior',
		ctaPrimary: 'Schedule a viewing',
		ctaSecondary: 'Get a home evaluation'
	},
	whyUs: {
		heading: 'Why work with me',
		subtext: 'I know the local market and focus on clear communication so you can make confident decisions.',
		items: [
			{
				title: 'Local expertise',
				description:
					'Years in the area. I know the neighbourhoods, trends, and what buyers and sellers are looking for.'
			},
			{
				title: 'Clear process',
				description:
					'From listing to closing (or from search to keys), I explain each step so you\'re never in the dark.'
			},
			{
				title: 'Dedicated support',
				description:
					'You work with me directly. Responsive, organized, and focused on getting you to the right outcome.'
			}
		]
	},
	services: {
		heading: 'What I offer',
		subtext: 'Full-service support for buying, selling, and renting in the local market.',
		items: [
			{
				title: 'Buy',
				description:
					'Find the right property with tailored searches, viewings, and guidance through offers and closing.',
				icon: 'Home'
			},
			{
				title: 'Sell',
				description:
					'Market evaluation, staging advice, listing strategy, and negotiation to get you the best result.',
				icon: 'TrendingUp'
			},
			{
				title: 'Rent',
				description:
					'Help finding a rental or placing tenants. Lease support and ongoing landlord assistance when needed.',
				icon: 'Key'
			}
		]
	},
	about: {
		heading: 'About me',
		subtext:
			'I\'ve helped hundreds of clients buy, sell, and rent in this market. My goal is to make the process as smooth and transparent as possible.',
		subtext2:
			'I work with first-time buyers, move-up sellers, investors, and renters. Every situation gets the same attention to detail.',
		bullets: [
			'Free, no-obligation market evaluations for sellers.',
			'Clear fee structure and no hidden costs.',
			'Responsive communication and organized follow-through.'
		],
		image: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&q=80',
		imageAlt: 'Real estate professional'
	},
	newPatients: {
		heading: 'How we get started',
		subtext: 'Whether you\'re buying, selling, or renting, the first step is a conversation.',
		steps: [
			{
				title: 'Get in touch',
				description: 'Schedule a call or request a home evaluation. Tell me a bit about what you\'re looking for.'
			},
			{
				title: 'We discuss your goals',
				description: 'I\'ll ask about your timeline, budget, and preferences. For sellers, I\'ll outline market value and strategy.'
			},
			{
				title: 'We take action',
				description: 'List your property, start your search, or set up viewings. I\'ll guide you through each step.'
			}
		],
		ctaLabel: 'Schedule a call',
		switchingEasy: 'No obligation. Just a conversation.',
		whatToBringTitle: 'Helpful to have',
		whatToBring: [
			'Your budget or price range (buyers/renters)',
			'Preferred areas and must-haves',
			'Timeline (when you want to move or list)'
		]
	},
	whatToExpect: {
		heading: 'What to expect',
		subtext: 'I keep the process clear from first contact to closing or lease signing.',
		items: [
			'We have a short call or meeting to discuss your situation and goals.',
			'You get a clear plan: search criteria, listing strategy, or next steps.',
			'We view properties, prepare offers, or market your home, with updates at every stage.',
			'We close the deal together. I coordinate with lawyers, lenders, and other parties as needed.'
		]
	},
	hours: {
		heading: 'Availability',
		lines: ['Monday – Sunday: By appointment', 'Calls returned within a few hours', 'Viewings scheduled around your schedule']
	},
	testimonials: {
		heading: 'What clients say',
		subtext: 'Feedback from buyers and sellers I\'ve worked with.',
		ratingDisplay: '5.0',
		reviewCount: '80+ reviews',
		items: [
			{
				quote: 'Sold our house in two weeks at over asking. Professional from start to finish. Couldn\'t have asked for better.',
				author: 'Lisa & Mark',
				role: 'Sellers',
				rating: 5
			},
			{
				quote: 'First-time buyer and felt completely supported. Found us the right place and made the process understandable.',
				author: 'David T.',
				role: 'Buyer',
				rating: 5
			},
			{
				quote: 'We\'ve used them for two purchases and one sale. Always responsive and straight-talking. Highly recommend.',
				author: 'Sarah K.',
				role: 'Client',
				rating: 5
			}
		]
	},
	insurance: {
		heading: 'Fees & commission',
		body: 'Commission structure is explained clearly before you sign anything. For buyers, my fee is typically covered by the listing. For sellers, we discuss marketing and commission in our initial meeting. No hidden fees.'
	},
	stats: [
		{ value: '15+', label: 'Years in market' },
		{ value: '300+', label: 'Happy clients' },
		{ value: '5.0', label: 'Star rating' }
	],
	contact: {
		heading: 'Contact me',
		subtext: 'Schedule a viewing, get a home evaluation, or ask a question.',
		address: '1 Yonge Finch Plaza, Toronto, ON',
		phone: '+1 (289) 513-5055',
		email: 'hello@example-realestate.com',
		ctaLabel: 'Schedule a viewing'
	},
	faq: {
		heading: 'Frequently asked questions',
		items: [
			{ q: 'How do I schedule a viewing?', a: 'Use the button above or call/email. Tell me which listing or area you\'re interested in and I\'ll set it up.' },
			{ q: 'Is the home evaluation free?', a: 'Yes. I provide a free, no-obligation market evaluation for sellers. We\'ll discuss value and strategy.' },
			{ q: 'Do you work with first-time buyers?', a: 'Yes. I help first-time buyers understand the process, get pre-approved, and find the right property.' },
			{ q: 'What areas do you cover?', a: 'I focus on the local market and surrounding areas. Contact me with your area and I\'ll confirm I can help.' }
		]
	},
	footer: {
		links: [
			{ label: 'Services', href: '#services' },
			{ label: 'About me', href: '#about' },
			{ label: 'Get started', href: '#new-patients' },
			{ label: 'FAQ', href: '#faq' },
			{ label: 'Contact', href: '#contact' }
		],
		ctaLabel: 'Schedule a viewing',
		ctaHeading: 'Schedule a viewing',
		copyright: 'All rights reserved.'
	},
	cta: {
		heading: 'Ready to buy, sell, or rent?',
		subtext: 'Schedule a call or viewing. No obligation.',
		microReassurance: 'I respond within a few hours.',
		button: 'Schedule a viewing',
		phoneLabel: 'Or call me'
	}
} as const;
