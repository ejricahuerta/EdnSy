/**
 * Healthcare demo industry: full landing content for a Canadian clinic / family practice.
 * CTAs read like a real clinic. In Canada you need a family doctor – copy reflects that.
 */
export const healthcareDemoContent = {
	header: {
		navLinks: [
			{ label: 'Services', href: '#services' },
			{ label: 'About us', href: '#about' },
			{ label: 'New patients', href: '#new-patients' },
			{ label: 'FAQ', href: '#faq' },
			{ label: 'Location & contact', href: '#contact' }
		],
		ctaLabel: 'Book an appointment'
	},
	hero: {
		badge: 'Accepting new patients',
		tagline: 'Your family doctor in the community',
		taglineWithCity: 'Family doctors in {city} accepting new patients',
		subtext:
			"In Canada, having a family physician means better ongoing care. We're here for you and your family: preventive care, same-day visits, and a team that knows your name.",
		subheadline: 'Same-week appointments. Covered by OHIP. Trusted by 2,000+ families.',
		trustBadges: ['OHIP covered', 'Board certified', 'Same-day available'],
		urgencyText: '',
		image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=80',
		imageAlt: 'Healthcare professional in a modern clinic setting',
		ctaPrimary: 'Book an appointment',
		ctaSecondary: 'New patient? Book here'
	},
	whyUs: {
		heading: 'Why choose us',
		subtext: 'We put your health and comfort first, every step of the way.',
		items: [
			{
				title: 'Experienced team',
				description:
					"Our doctors and staff take time to listen. You're not a number; you're a person we're here to support for the long term."
			},
			{
				title: 'Modern facility',
				description:
					"Clean, welcoming spaces and up-to-date equipment. We've designed our clinic so you feel comfortable from the moment you walk in."
			},
			{
				title: 'Easy scheduling',
				description:
					'Book online or by phone at your convenience. Same-day and next-day appointments when you need them.'
			}
		]
	},
	services: {
		heading: 'Our services',
		subtext: "From routine check-ups to same-day care. We're here for you and your family.",
		items: [
			{
				title: 'Family medicine',
				description:
					'Your regular family doctor for check-ups, ongoing care, and when you need someone who knows your history. We care for all ages.',
				icon: 'Stethoscope'
			},
			{
				title: 'Preventive care',
				description:
					'Vaccinations, wellness visits, and early detection to keep you healthy. We focus on preventing illness, not just treating it.',
				icon: 'HeartPulse'
			},
			{
				title: 'Same-day appointments',
				description:
					"We work to get you in when you need us. Urgent concerns get priority so you don't have to wait in uncertainty.",
				icon: 'CalendarCheck'
			}
		]
	},
	about: {
		heading: 'About us',
		subtext:
			'We believe everyone in Canada deserves a family doctor. Our team is dedicated to providing compassionate, ongoing care in a welcoming environment, so you have a medical home for life.',
		subtext2:
			'We work with your provincial health plan and focus on building long-term relationships with our patients and their families.',
		bullets: [
			'Friendly staff who take the time to listen and explain.',
			'Continuity of care: see the same provider when possible.',
			'Support in multiple languages; we welcome everyone.'
		],
		image: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800&q=80',
		imageAlt: 'Modern medical care environment'
	},
	newPatients: {
		heading: 'New patients',
		subtext: 'Joining our practice is straightforward. Here’s what to expect.',
		steps: [
			{
				title: 'Book your first visit',
				description: "Use the button above or call us. We'll ask a few questions to make sure we're a good fit."
			},
			{
				title: 'Bring your documents',
				description: 'Provincial health card, ID, and a list of current medications. New patient forms can be completed online or at the clinic.'
			},
			{
				title: 'Meet your care team',
				description: "Your first visit is a chance for us to get to know you and your health goals. We'll review your history and plan ongoing care."
			}
		],
		ctaLabel: 'Book your first appointment',
		switchingEasy: 'We make switching family doctors easy.',
		whatToBring: [
			'Provincial health card (e.g. OHIP)',
			'Photo ID',
			'List of current medications',
			'Any medical records from your previous provider (optional)'
		]
	},
	whatToExpect: {
		heading: 'What to expect',
		subtext: 'We want your visit to be calm and clear.',
		items: [
			'Check in at reception with your health card.',
			"You'll be called to an exam room when ready.",
			'Your provider will review your concerns and work with you on a plan.',
			"Before you leave, we'll book any follow-ups and answer questions."
		]
	},
	hours: {
		heading: 'Office hours',
		lines: ['Monday – Friday: 8:00 AM – 6:00 PM', 'Saturday: 9:00 AM – 1:00 PM', 'Sunday: Closed']
	},
	testimonials: {
		heading: 'What our patients say',
		subtext: 'Real feedback from people in our care.',
		ratingDisplay: '4.8',
		reviewCount: '120+ reviews',
		items: [
			{
				quote: "Finally have a family doctor who remembers my name and my history. Makes such a difference.",
				author: 'Sarah M.',
				role: 'Patient, 3 years',
				rating: 5
			},
			{
				quote: "Same-day appointments saved us more than once. The team is caring and efficient.",
				author: 'James L.',
				role: 'Parent of two',
				rating: 5
			},
			{
				quote: "Welcoming clinic, clear explanations, and they work with my health card. No surprises.",
				author: 'Priya K.',
				role: 'Patient, 1 year',
				rating: 5
			}
		]
	},
	insurance: {
		heading: 'Billing & insurance',
		body: 'We bill your provincial health plan directly. Bring your health card to every visit. No upfront fees for insured services; uninsured services (e.g. forms, notes) at reasonable rates.'
	},
	stats: [
		{ value: '15+', label: 'Years in practice' },
		{ value: '10k+', label: 'Patients in our care' },
		{ value: '98%', label: 'Patient satisfaction' }
	],
	contact: {
		heading: 'Contact us',
		subtext: "Have questions or ready to book? Get in touch. We're happy to help.",
		address: '1 Yonge Finch Plaza, Toronto, ON',
		phone: '+1 (289) 513-5055',
		email: 'hello@example.com',
		ctaLabel: 'Book an appointment'
	},
	faq: {
		heading: 'Frequently asked questions',
		items: [
			{
				q: 'Are you accepting new patients?',
				a: 'Yes. We are currently accepting new patients. Book an appointment using the button above or call us to register as a new patient.'
			},
			{
				q: 'Do I need a health card?',
				a: 'Yes. Please bring your provincial health card (e.g. OHIP in Ontario) to your first visit. We bill publicly for insured services.'
			},
			{
				q: 'How do I book an appointment?',
				a: 'You can book online using the "Book an appointment" button, or call us during office hours. We also offer same-day appointments when available.'
			},
			{
				q: 'What should I bring to my first visit?',
				a: 'Bring your health card, ID, and any current medications or medical records from your previous provider. New patients may need to complete a short intake form.'
			},
			{
				q: 'Do you offer telehealth visits?',
				a: 'Yes. We offer phone and video visits for many appointment types. Choose telehealth when booking if you prefer.'
			},
			{
				q: 'Do you offer same-day visits?',
				a: 'Yes. We reserve slots for urgent same-day appointments. Call in the morning or book online to check availability.'
			},
			{
				q: 'Is parking available?',
				a: 'Yes. Free parking is available for patients in our lot. Street parking is also available nearby.'
			},
			{
				q: 'How long is a typical first visit?',
				a: 'New patient appointments are usually 30 to 45 minutes so we can review your history and address your concerns.'
			},
			{
				q: 'What is your cancellation policy?',
				a: 'Please cancel or reschedule at least 24 hours in advance so we can offer the slot to another patient. Repeated no-shows may affect future booking.'
			},
			{
				q: 'Is bloodwork covered by OHIP?',
				a: 'Most routine bloodwork ordered by your doctor is covered by your provincial health plan. We can advise at your visit.'
			}
		]
	},
	footer: {
		links: [
			{ label: 'Services', href: '#services' },
			{ label: 'About us', href: '#about' },
			{ label: 'New patients', href: '#new-patients' },
			{ label: 'FAQ', href: '#faq' },
			{ label: 'Location & contact', href: '#contact' }
		],
		ctaLabel: 'Book an appointment',
		copyright: 'All rights reserved.'
	},
	cta: {
		heading: 'Ready to see a doctor this week?',
		subtext: 'Book an appointment today. New patients welcome.',
		microReassurance: 'Booking takes less than 60 seconds.',
		button: 'Book an appointment',
		phoneLabel: 'Or call to book'
	}
} as const;
