/**
 * Construction demo industry: full landing content for a general contractor / construction company.
 * Same content shape as healthcare/dental for template reuse.
 */
export const constructionDemoContent = {
	header: {
		navLinks: [] as { label: string; href: string }[],
		ctaLabel: 'Get a quote'
	},
	hero: {
		badge: 'Licensed & insured',
		tagline: 'Quality construction in your community',
		taglineWithCity: 'Quality construction in {city}',
		subtext:
			'From renovations and repairs to new builds. We deliver on time and on budget with clear communication every step of the way.',
		subheadline: 'Residential and commercial. Licensed. Free estimates.',
		trustBadges: [] as string[],
		urgencyText: '',
		image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80',
		imageAlt: 'Construction site and team at work',
		ctaPrimary: 'Get a free quote',
		ctaSecondary: 'Call us'
	},
	whyUs: {
		heading: 'Why choose us',
		subtext: 'We treat your project like our own. Clear quotes, reliable scheduling, and quality work you can count on.',
		items: [
			{
				title: 'Licensed & insured',
				description:
					'Fully licensed and insured for your peace of mind. We handle permits and compliance so you don\'t have to.'
			},
			{
				title: 'On time, on budget',
				description:
					'We provide detailed quotes and stick to timelines. No surprise costs. We communicate clearly from day one.'
			},
			{
				title: 'Experienced team',
				description:
					'Years of experience in residential and commercial projects. Skilled tradespeople and project management you can trust.'
			}
		]
	},
	services: {
		heading: 'Our services',
		subtext: 'From small repairs to full renovations and new construction. We handle it all.',
		items: [
			{
				title: 'Renovations',
				description:
					'Kitchens, bathrooms, basements, and whole-home renovations. We work with you on design and execution.',
				icon: 'Building2'
			},
			{
				title: 'New construction',
				description:
					'New builds and additions. We coordinate from foundation to finish and keep the project on track.',
				icon: 'Hammer'
			},
			{
				title: 'Repairs & maintenance',
				description:
					'Repairs, maintenance, and emergency fixes. When something breaks, we get it done right.',
				icon: 'Wrench'
			}
		]
	},
	about: {
		heading: 'About us',
		subtext:
			'We\'re a local construction company built on word-of-mouth and repeat clients. We show up, do the job right, and leave your space better than we found it.',
		subtext2:
			'We work with homeowners, property managers, and businesses. Every project gets the same attention to quality and communication.',
		bullets: [
			'Clear, written quotes with no hidden fees.',
			'Respect for your property and your schedule.',
			'Licensed, insured, and committed to code.'
		],
		image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80',
		imageAlt: 'Construction team and finished work'
	},
	newPatients: {
		heading: 'How it works',
		subtext: 'Getting a quote is simple. Here\'s the process.',
		steps: [
			{
				title: 'Contact us',
				description: 'Call or use the button above to tell us about your project. We\'ll ask a few questions and schedule a site visit.'
			},
			{
				title: 'Free estimate',
				description: 'We come out, assess the work, and provide a detailed written quote. No obligation.'
			},
			{
				title: 'We get to work',
				description: 'Once you approve, we schedule the job and keep you updated. We show up when we say we will.'
			}
		],
		ctaLabel: 'Get a free quote',
		switchingEasy: 'No project is too small to get a professional quote.',
		whatToBringTitle: 'What we need',
		whatToBring: [
			'Project address and access details',
			'Description of the work you want done',
			'Preferred timeline or deadline',
			'Photos or plans if you have them (optional)'
		]
	},
	whatToExpect: {
		heading: 'What to expect',
		subtext: 'We keep the process straightforward and transparent.',
		items: [
			'We schedule a visit to see the site and discuss your needs.',
			'You receive a written quote with scope, timeline, and price.',
			'We start work on the agreed date and keep you in the loop.',
			'We clean up and walk you through the completed work.'
		]
	},
	hours: {
		heading: 'Business hours',
		lines: ['Monday – Friday: 7:00 AM – 5:00 PM', 'Saturday: By appointment', 'Sunday: Closed']
	},
	testimonials: {
		heading: 'What our clients say',
		subtext: 'Real feedback from homeowners and businesses we\'ve worked with.',
		ratingDisplay: '4.8',
		reviewCount: '50+ reviews',
		items: [
			{
				quote: 'They did our kitchen reno on time and on budget. Clean, professional, and the quality is there. Would hire again.',
				author: 'Mike R.',
				role: 'Homeowner',
				rating: 5
			},
			{
				quote: 'We use them for all our property maintenance. Reliable and fair pricing. No surprises.',
				author: 'Sarah L.',
				role: 'Property manager',
				rating: 5
			},
			{
				quote: 'Needed a bathroom fix in a hurry. They came out, gave a clear quote, and had it done in a few days. Great experience.',
				author: 'James K.',
				role: 'Homeowner',
				rating: 5
			}
		]
	},
	insurance: {
		heading: 'Insurance & payment',
		body: 'We are fully insured and provide written contracts for all projects. Payment terms are outlined in your quote. We accept various payment methods and can work with your timeline.'
	},
	stats: [
		{ value: '15+', label: 'Years in business' },
		{ value: '500+', label: 'Projects completed' },
		{ value: '100%', label: 'Licensed & insured' }
	],
	contact: {
		heading: 'Contact us',
		subtext: 'Ready to start your project? Get in touch for a free estimate.',
		address: '1 Yonge Finch Plaza, Toronto, ON',
		phone: '+1 (289) 513-5055',
		email: 'hello@example-construction.com',
		ctaLabel: 'Get a quote'
	},
	faq: {
		heading: 'Frequently asked questions',
		items: [
			{ q: 'Do you offer free estimates?', a: 'Yes. We provide free, no-obligation estimates after a site visit. We\'ll outline scope, timeline, and cost in writing.' },
			{ q: 'Are you licensed and insured?', a: 'Yes. We are fully licensed and carry liability and workers\' compensation insurance. We can provide proof upon request.' },
			{ q: 'How do I get a quote?', a: 'Use the "Get a quote" button or call us. We\'ll ask about your project and schedule a time to come out and provide a written estimate.' },
			{ q: 'Do you do small jobs?', a: 'Yes. We take on everything from small repairs to large renovations and new construction. No project is too small for a professional quote.' },
			{ q: 'What areas do you serve?', a: 'We serve the local area and surrounding regions. Contact us with your address and we\'ll confirm we can take on your project.' },
			{ q: 'How long does a typical project take?', a: 'It depends on scope. We\'ll give you a timeline in your quote and keep you updated. We stick to schedules and communicate any changes.' },
			{ q: 'What payment terms do you offer?', a: 'Payment terms are in your contract. We typically work with a deposit and progress or completion payments. We can discuss options when we quote.' }
		]
	},
	footer: {
		links: [
			{ label: 'Services', href: '#services' },
			{ label: 'About us', href: '#about' },
			{ label: 'How it works', href: '#new-patients' },
			{ label: 'FAQ', href: '#faq' },
			{ label: 'Contact', href: '#contact' }
		],
		ctaLabel: 'Get a quote',
		ctaHeading: 'Get a quote',
		copyright: 'All rights reserved.'
	},
	cta: {
		heading: 'Ready to start your project?',
		subtext: 'Get a free estimate today. No obligation.',
		microReassurance: 'We respond within 24 hours.',
		button: 'Get a free quote',
		phoneLabel: 'Or call us'
	}
} as const;
