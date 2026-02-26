/**
 * Solo professionals demo: Canadian-focused. Consultants, coaches, accountants, etc.
 */
export const soloProfessionalsDemoContent = {
	header: {
		navLinks: [] as { label: string; href: string }[],
		ctaLabel: 'Book a consultation'
	},
	hero: {
		badge: 'Professional services',
		tagline: 'Expert guidance when you need it',
		taglineWithCity: 'Trusted professional in {city}',
		subtext:
			'One-on-one consulting, clear advice, and ongoing support. I help Canadian individuals and small businesses reach their goals with a personal touch, Ontario and nationwide.',
		subheadline: 'Consultation • Strategy • Ongoing support. Book a call or send an enquiry.',
		trustBadges: [] as string[],
		urgencyText: '',
		image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80',
		imageAlt: 'Professional consultation meeting',
		ctaPrimary: 'Book a consultation',
		ctaSecondary: 'View services'
	},
	whyUs: {
		heading: 'Why work with me',
		subtext: 'I focus on a limited number of clients so each one gets the attention and clarity they deserve.',
		items: [
			{
				title: 'Experienced',
				description:
					'Years of experience in my field. I stay current on best practices and bring that knowledge to every engagement.'
			},
			{
				title: 'Clear communication',
				description:
					'No jargon or runaround. I explain options plainly and help you make informed decisions.'
			},
			{
				title: 'Personal approach',
				description:
					'You work directly with me. No handoffs or generic plans: advice tailored to your situation.'
			}
		]
	},
	services: {
		heading: 'Services',
		subtext: 'From one-off consultations to ongoing retainer work. We find the right fit for your needs.',
		items: [
			{
				title: 'Initial consultation',
				description:
					'A focused session to understand your situation, outline options, and agree on next steps. Often the best place to start.',
				icon: 'MessageCircle'
			},
			{
				title: 'Strategy & planning',
				description:
					'Structured support to set goals, build a plan, and stay on track. Ideal for projects or longer-term objectives.',
				icon: 'Target'
			},
			{
				title: 'Ongoing support',
				description:
					'Retainer or regular check-ins so you have consistent access to advice and accountability when you need it.',
				icon: 'CalendarCheck'
			}
		]
	},
	about: {
		heading: 'About me',
		subtext:
			'I built my practice on referrals and repeat clients across Canada. My job is to give you clear, actionable guidance so you can move forward with confidence.',
		subtext2:
			'I work with Canadian individuals and small businesses. Every engagement is confidential and tailored to your goals.',
		bullets: [
			'Clear scope and pricing before we start; no surprise fees.',
			'Flexible scheduling including evening and weekend calls when needed.',
			'Professional standards and discretion you can count on.'
		],
		image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80',
		imageAlt: 'Professional headshot'
	},
	newPatients: {
		heading: 'How we get started',
		subtext: 'A short intro call helps us both decide if we\'re a good fit.',
		steps: [
			{
				title: 'Book a call',
				description: 'Use the button above or email to schedule a short intro call. No obligation.'
			},
			{
				title: 'We discuss your needs',
				description: 'I\'ll ask a few questions and outline how I can help. You\'ll get a clear sense of scope and fees.'
			},
			{
				title: 'We get to work',
				description: 'If we both agree it\'s a fit, we schedule our first session and take it from there.'
			}
		],
		ctaLabel: 'Book a consultation',
		switchingEasy: 'Intro calls are free and confidential.',
		whatToBringTitle: 'Before the call',
		whatToBring: [
			'A brief description of what you\'re looking to achieve',
			'Any key documents or numbers (if relevant)',
			'Your preferred meeting format (video call or phone)'
		]
	},
	whatToExpect: {
		heading: 'What to expect',
		subtext: 'I keep the process simple and transparent.',
		items: [
			'You book a time that works. I\'ll send a calendar link and any short prep if needed.',
			'We meet (video or phone). I listen, ask questions, and outline how I can help.',
			'You get a clear proposal with scope and fee. No pressure; you decide.',
			'If you\'re in, we schedule the first session and go from there.'
		]
	},
	hours: {
		heading: 'Availability',
		lines: ['Monday – Friday: 9:00 AM – 6:00 PM', 'Weekends: By arrangement', 'Response within 24 hours']
	},
	testimonials: {
		heading: 'What clients say',
		subtext: 'Feedback from people I\'ve worked with.',
		ratingDisplay: '5.0',
		reviewCount: '40+ reviews',
		items: [
			{
				quote: 'Exactly the clarity I needed. One consultation gave me a roadmap I could actually follow. Highly recommend.',
				author: 'R. M.',
				role: 'Client',
				rating: 5
			},
			{
				quote: 'Professional, responsive, and straight to the point. Felt like I had a real partner in my corner.',
				author: 'J. K.',
				role: 'Client',
				rating: 5
			},
			{
				quote: 'We did a short engagement that turned into ongoing support. Worth every penny for the peace of mind.',
				author: 'S. T.',
				role: 'Client',
				rating: 5
			}
		]
	},
	insurance: {
		heading: 'Fees & payment',
		body: 'Fees are agreed in advance. I accept bank transfer, e-transfer, and major cards. Invoices provided for all paid work. Cancellations: 24 hours notice for scheduled calls so the time can be reallocated.'
	},
	stats: [
		{ value: '10+', label: 'Years experience' },
		{ value: '200+', label: 'Clients helped' },
		{ value: '100%', label: 'Confidential' }
	],
	contact: {
		heading: 'Get in touch',
		subtext: 'Book a consultation or send a message. I respond within 24 hours.',
		address: '1 Yonge Finch Plaza, Toronto, ON',
		phone: '+1 (289) 513-5055',
		email: 'hello@example-professional.com',
		ctaLabel: 'Book a consultation'
	},
	faq: {
		heading: 'Frequently asked questions',
		items: [
			{ q: 'How do I book a consultation?', a: 'Use the "Book a consultation" button or email me. I\'ll send a link to choose a time and we\'ll have a short intro call.' },
			{ q: 'What does the intro call cost?', a: 'The initial intro call is free. It\'s a chance for us both to see if the fit is right before any paid engagement.' },
			{ q: 'What are your fees?', a: 'Fees depend on scope: one-off consultation, project, or retainer. I\'ll outline options and pricing clearly after we discuss your needs.' },
			{ q: 'Do you work remotely?', a: 'Yes. Most work is by video call or phone. I can also meet in person in the local area when needed.' },
			{ q: 'How quickly can we start?', a: 'I typically have availability within a few days. Urgent requests can often be accommodated; just ask.' }
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
		ctaLabel: 'Book a consultation',
		ctaHeading: 'Book a consultation',
		copyright: 'All rights reserved.'
	},
	cta: {
		heading: 'Ready to get started?',
		subtext: 'Book a free intro call. No obligation.',
		microReassurance: 'I respond within 24 hours.',
		button: 'Book a consultation',
		phoneLabel: 'Or send an email'
	}
} as const;
