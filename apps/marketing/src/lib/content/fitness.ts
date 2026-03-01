/**
 * Fitness demo: gyms, studios, personal trainers.
 * Same content shape as other industries for template reuse.
 */
export const fitnessDemoContent = {
	header: {
		navLinks: [] as { label: string; href: string }[],
		ctaLabel: 'Book a class'
	},
	hero: {
		badge: 'New members welcome',
		tagline: 'Train. Sweat. Feel great.',
		taglineWithCity: 'Your fitness community in {city}',
		subtext:
			'Group classes, personal training, and a supportive environment. Whether you\'re new to fitness or levelling up, we\'re here for you.',
		subheadline: 'Classes • Personal training • Open gym. First class free for new members.',
		trustBadges: [] as string[],
		urgencyText: '',
		image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80',
		imageAlt: 'Fitness class in progress',
		ctaPrimary: 'Book a class',
		ctaSecondary: 'View schedule'
	},
	whyUs: {
		heading: 'Why train with us',
		subtext: 'We combine effective programming with a community that keeps you coming back.',
		items: [
			{
				title: 'Expert coaches',
				description:
					'Certified trainers who scale workouts to your level. Form and safety come first, then intensity.'
			},
			{
				title: 'Inclusive vibe',
				description:
					'All fitness levels welcome. We focus on progress, not comparison. You\'ll feel supported from day one.'
			},
			{
				title: 'Flexible options',
				description:
					'Drop-in classes, memberships, and personal training. Find what fits your schedule and goals.'
			}
		]
	},
	services: {
		heading: 'What we offer',
		subtext: 'From group classes to one-on-one training. Something for every goal and schedule.',
		items: [
			{
				title: 'Group classes',
				description:
					'HIIT, strength, yoga, and more. Led by coaches in a group setting. Book your spot and show up.',
				icon: 'Dumbbell'
			},
			{
				title: 'Personal training',
				description:
					'One-on-one sessions tailored to your goals. Programming, form check, and accountability.',
				icon: 'HeartPulse'
			},
			{
				title: 'Open gym',
				description:
					'Access to equipment and space for your own workouts. Perfect for members who like to train on their own.',
				icon: 'Trophy'
			}
		]
	},
	about: {
		heading: 'About us',
		subtext:
			'We\'re a local gym and studio built on community. Our mission is to make fitness accessible, effective, and something you actually enjoy.',
		subtext2:
			'We welcome beginners and experienced athletes. Every class can be scaled. You work at your level and progress from there.',
		bullets: [
			'Certified, experienced coaches in every class.',
			'Clean facility and well-maintained equipment.',
			'No long-term contract required. Month-to-month available.'
		],
		image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c149e?w=800&q=80',
		imageAlt: 'Gym interior and equipment'
	},
	newPatients: {
		heading: 'Your first visit',
		subtext: 'New here? Your first class is free. Here\'s how it works.',
		steps: [
			{
				title: 'Book your first class',
				description: 'Use the button above to pick a class and time. We\'ll send you a confirmation and quick waiver.'
			},
			{
				title: 'Arrive 10–15 minutes early',
				description: 'Check in at the front. We\'ll give you a quick tour and the coach will intro the workout.'
			},
			{
				title: 'Train and decide',
				description: 'Take the class at your pace. Afterward we can chat about memberships or packages if you\'re interested.'
			}
		],
		ctaLabel: 'Book your first class',
		switchingEasy: 'First class free. No obligation.',
		whatToBringTitle: 'What to bring',
		whatToBring: [
			'Comfortable workout clothes and sneakers',
			'Water bottle (we have refill stations)',
			'Completed waiver (we\'ll send the link when you book)'
		]
	},
	whatToExpect: {
		heading: 'What to expect',
		subtext: 'We keep it simple so you can focus on the workout.',
		items: [
			'Check in at the front desk. First time? We\'ll show you around.',
			'The coach explains the workout and scales options for different levels.',
			'You train. We encourage you; we don\'t judge.',
			'Cool down, stretch, and head out. Rebook or sign up when you\'re ready.'
		]
	},
	hours: {
		heading: 'Gym hours',
		lines: ['Monday – Friday: 6:00 AM – 9:00 PM', 'Saturday: 8:00 AM – 4:00 PM', 'Sunday: 8:00 AM – 12:00 PM']
	},
	testimonials: {
		heading: 'What members say',
		subtext: 'Real feedback from our community.',
		ratingDisplay: '4.9',
		reviewCount: '200+ reviews',
		items: [
			{
				quote: 'I was nervous to start. The coaches made me feel welcome and the workouts are tough but doable. Addicted now.',
				author: 'Maya R.',
				role: 'Member, 6 months',
				rating: 5
			},
			{
				quote: 'Best gym in the area. Clean, great energy, and the classes actually work. I\'ve seen real results.',
				author: 'James L.',
				role: 'Member, 1 year',
				rating: 5
			},
			{
				quote: 'I do PT once a week and drop into classes. Flexible and the trainers know their stuff. Highly recommend.',
				author: 'Sam K.',
				role: 'Member',
				rating: 5
			}
		]
	},
	insurance: {
		heading: 'Membership & payment',
		body: 'We offer drop-in rates, class packs, and monthly memberships. No long-term contract required for most options. Payment by card or pre-authorized debit. Freeze and cancellation policies are explained when you sign up.'
	},
	stats: [
		{ value: '8+', label: 'Years in business' },
		{ value: '500+', label: 'Active members' },
		{ value: '4.9', label: 'Star rating' }
	],
	contact: {
		heading: 'Visit us',
		subtext: 'Drop in, book a class, or ask about memberships.',
		address: '1 Yonge Finch Plaza, Toronto, ON',
		phone: '+1 (289) 513-5055',
		email: 'hello@example-fitness.com',
		ctaLabel: 'Book a class'
	},
	faq: {
		heading: 'Frequently asked questions',
		items: [
			{ q: 'Is the first class really free?', a: 'Yes. New members can try one class free. We\'ll send a waiver to complete before you come. No obligation to join.' },
			{ q: 'Do I need to be in shape to start?', a: 'No. All levels are welcome. Coaches scale every workout. You work at your pace and build from there.' },
			{ q: 'How do I book a class?', a: 'Use the "Book a class" button, call, or drop in. We recommend booking in advance so we save you a spot.' },
			{ q: 'What are the membership options?', a: 'We have drop-ins, class packs, and monthly memberships. No long-term contract for standard memberships. Details at the front desk or by phone.' }
		]
	},
	footer: {
		links: [
			{ label: 'What we offer', href: '#services' },
			{ label: 'About us', href: '#about' },
			{ label: 'First visit', href: '#new-patients' },
			{ label: 'FAQ', href: '#faq' },
			{ label: 'Contact', href: '#contact' }
		],
		ctaLabel: 'Book a class',
		ctaHeading: 'Book a class',
		copyright: 'All rights reserved.'
	},
	cta: {
		heading: 'Ready to train?',
		subtext: 'Book your first class free. No obligation.',
		microReassurance: 'First class free for new members.',
		button: 'Book a class',
		phoneLabel: 'Or call us'
	}
} as const;
