/**
 * Dental demo industry: full landing content for a family dental practice.
 * Same content shape as healthcare for template reuse; copy tailored for dentistry.
 */
export const dentalDemoContent = {
	header: {
		navLinks: [
			{ label: 'Services', href: '#services' },
			{ label: 'About us', href: '#about' },
			{ label: 'First visit', href: '#new-patients' },
			{ label: 'FAQ', href: '#faq' },
			{ label: 'Location & contact', href: '#contact' }
		],
		ctaLabel: 'Book an appointment'
	},
	hero: {
		badge: 'Accepting new patients',
		tagline: 'Your family dentist in the community',
		taglineWithCity: 'Family dentistry in {city}',
		subtext:
			'From checkups and cleanings to crowns and cosmetic care. We keep your whole family smiling in a comfortable, modern practice.',
		subheadline: 'Routine cleanings. Insurance accepted. Same-day emergency appointments when you need them.',
		trustBadges: [] as string[],
		urgencyText: '',
		image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1200&q=80',
		imageAlt: 'Modern dental practice reception and treatment area',
		ctaPrimary: 'Book an appointment',
		ctaSecondary: 'New patient? Book here'
	},
	whyUs: {
		heading: 'Why choose us',
		subtext: 'We combine gentle care with up-to-date technology so you and your family feel at ease.',
		items: [
			{
				title: 'Experienced team',
				description:
					'Our dentists and hygienists take time to explain every step. We focus on prevention and long-term oral health.'
			},
			{
				title: 'Modern facility',
				description:
					'Clean, bright operatories and digital X-rays. We use current techniques to make treatments faster and more comfortable.'
			},
			{
				title: 'Easy scheduling',
				description:
					'Book online or by phone. We offer morning, evening, and Saturday appointments to fit your schedule.'
			}
		]
	},
	services: {
		heading: 'Our services',
		subtext: "From routine care to cosmetic and restorative treatments. We're here for your whole family.",
		items: [
			{
				title: 'Checkups & cleanings',
				description:
					'Regular exams and professional cleanings to prevent cavities and gum disease. We recommend visits every six months.',
				icon: 'Stethoscope'
			},
			{
				title: 'Fillings & restorative',
				description:
					'Tooth-colored fillings, crowns, and repair work to restore your smile and function. We match materials to your needs.',
				icon: 'HeartPulse'
			},
			{
				title: 'Emergency dental',
				description:
					'Tooth pain or a knocked-out tooth? We reserve time for same-day emergencies so you get relief quickly.',
				icon: 'CalendarCheck'
			}
		]
	},
	about: {
		heading: 'About us',
		subtext:
			'We believe everyone deserves a dentist they trust. Our team is dedicated to gentle, clear care so you and your family look forward to visits.',
		subtext2:
			'We work with most insurance plans and offer flexible payment options. Your comfort and oral health are our priority.',
		bullets: [
			'Friendly staff who explain every step and answer your questions.',
			'Care for all ages, from first checkups to ongoing adult care.',
			'Direct billing to insurance when possible; we handle the paperwork.'
		],
		image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=80',
		imageAlt: 'Dental practice treatment room'
	},
	newPatients: {
		heading: 'First visit',
		subtext: "We make your first visit simple and stress-free. Here's what to expect.",
		steps: [
			{
				title: 'Book your appointment',
				description: "Use the button above or call us. We'll ask a few quick questions and find a time that works for you."
			},
			{
				title: 'Bring your information',
				description: 'Bring your insurance card and ID. New patient forms can be completed online before your visit or at the office.'
			},
			{
				title: 'Meet your dental team',
				description: "Your first visit includes an exam and cleaning (if appropriate). We'll discuss your goals and any concerns."
			}
		],
		ctaLabel: 'Book your first appointment',
		switchingEasy: 'We make switching dentists easy.',
		whatToBring: [
			'Dental and/or medical insurance card',
			'Photo ID',
			'List of current medications',
			'Any X-rays or records from your previous dentist (optional)'
		]
	},
	whatToExpect: {
		heading: 'What to expect',
		subtext: 'We want your visit to be comfortable and clear.',
		items: [
			'Check in at reception with your insurance card and ID.',
			"We may take X-rays if you're new or it's been a while.",
			'Your hygienist or dentist will perform an exam and cleaning (as needed).',
			"We'll discuss findings, answer questions, and book any follow-ups."
		]
	},
	hours: {
		heading: 'Office hours',
		lines: ['Monday – Friday: 8:00 AM – 6:00 PM', 'Saturday: 9:00 AM – 2:00 PM', 'Sunday: Closed']
	},
	testimonials: {
		heading: 'What our patients say',
		subtext: 'Real feedback from our practice.',
		ratingDisplay: '4.9',
		reviewCount: '80+ reviews',
		items: [
			{
				quote: "Best dental experience I've had. They explained everything and my cleaning was painless. My whole family comes here now.",
				author: 'Maria S.',
				role: 'Patient, 2 years',
				rating: 5
			},
			{
				quote: 'I was nervous about a crown. The dentist was so calm and the result looks great. Highly recommend.',
				author: 'David T.',
				role: 'Patient, 1 year',
				rating: 5
			},
			{
				quote: "Got in same day for a toothache. They fixed it and I was out in under an hour. So grateful.",
				author: 'Jen K.',
				role: 'Patient, 3 years',
				rating: 5
			}
		]
	},
	insurance: {
		heading: 'Billing & insurance',
		body: "We direct-bill most insurance plans. Bring your plan details and we'll handle the rest. For patients without insurance, we offer clear pricing and payment plans."
	},
	stats: [
		{ value: '12+', label: 'Years in practice' },
		{ value: '5k+', label: 'Patients' },
		{ value: '99%', label: 'Would recommend' }
	],
	contact: {
		heading: 'Contact us',
		subtext: 'Have questions or ready to book? Get in touch.',
		address: '1 Yonge Finch Plaza, Toronto, ON',
		phone: '+1 (289) 513-5055',
		email: 'hello@example-dental.com',
		ctaLabel: 'Book an appointment'
	},
	faq: {
		heading: 'Frequently asked questions',
		items: [
			{ q: 'Are you accepting new patients?', a: 'Yes. Book online or call us. We welcome new patients and same-day emergencies when possible.' },
			{ q: 'Do you direct-bill insurance?', a: "Yes. We direct-bill most dental plans. Bring your insurance card and we'll submit claims for you." },
			{ q: 'How do I book an appointment?', a: 'Use the "Book an appointment" button on this page or call us during office hours. You can also request a callback.' },
			{ q: 'What should I bring to my first visit?', a: 'Bring your insurance card, ID, and a list of medications. New patient forms can be filled out online before your visit.' },
			{ q: 'Do you see children?', a: 'Yes. We see patients of all ages and help kids feel comfortable with regular checkups and cleanings.' },
			{ q: 'Do you offer same-day or emergency appointments?', a: "Yes. We reserve time for dental emergencies. Call as early as possible and we'll do our best to see you the same day." },
			{ q: 'Is parking available?', a: 'Yes. Free parking is available for patients. We can give you directions when you book.' },
			{ q: 'What is your cancellation policy?', a: 'Please cancel or reschedule at least 24 hours in advance so we can offer the time to another patient.' }
		]
	},
	footer: {
		links: [
			{ label: 'Services', href: '#services' },
			{ label: 'About us', href: '#about' },
			{ label: 'First visit', href: '#new-patients' },
			{ label: 'FAQ', href: '#faq' },
			{ label: 'Location & contact', href: '#contact' }
		],
		ctaLabel: 'Book an appointment',
		copyright: 'All rights reserved.'
	},
	cta: {
		heading: 'Ready for a healthier smile?',
		subtext: 'Book your appointment today. New patients welcome.',
		microReassurance: 'Booking takes less than 60 seconds.',
		button: 'Book an appointment',
		phoneLabel: 'Or call to book'
	}
} as const;
