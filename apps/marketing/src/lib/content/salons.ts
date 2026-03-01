/**
 * Salons demo industry: full landing content for a hair salon / beauty salon.
 * Same content shape as healthcare/dental/construction for template reuse.
 */
export const salonsDemoContent = {
	header: {
		navLinks: [] as { label: string; href: string }[],
		ctaLabel: 'Book an appointment'
	},
	hero: {
		badge: 'Welcome to our salon',
		tagline: 'Your neighbourhood salon',
		taglineWithCity: 'Your go-to salon in {city}',
		subtext:
			'Hair, nails, and skincare in a relaxed, friendly space. We use quality products and take the time to get it right.',
		subheadline: 'Hair • Nails • Skin. Walk-ins welcome when we have availability.',
		trustBadges: [] as string[],
		urgencyText: '',
		image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80',
		imageAlt: 'Salon interior with styling station',
		ctaPrimary: 'Book an appointment',
		ctaSecondary: 'View services'
	},
	whyUs: {
		heading: 'Why choose us',
		subtext: 'We love what we do and it shows. A welcoming atmosphere, skilled stylists, and products we stand behind.',
		items: [
			{
				title: 'Skilled stylists',
				description:
					'Our team stays current on techniques and trends. Whether you want a classic look or something new, we\'re here for you.'
			},
			{
				title: 'Quality products',
				description:
					'We use professional-grade products that protect your hair and skin. No compromise on quality.'
			},
			{
				title: 'Relaxed vibe',
				description:
					'Book your slot and enjoy a calm, friendly visit. We run on time when we can and keep the mood light.'
			}
		]
	},
	services: {
		heading: 'Our services',
		subtext: 'From cuts and colour to nails and skincare. One place for your routine or a full treat-yourself day.',
		items: [
			{
				title: 'Hair',
				description:
					'Cuts, colour, highlights, treatments, and styling. We work with all hair types and help you find the look you love.',
				icon: 'Scissors'
			},
			{
				title: 'Nails',
				description:
					'Manicures, pedicures, gel, and nail art. Clean, careful service and a lasting finish.',
				icon: 'Sparkles'
			},
			{
				title: 'Skin & beauty',
				description:
					'Facials, waxing, and lash services. We tailor treatments to your skin and preferences.',
				icon: 'Palette'
			}
		]
	},
	about: {
		heading: 'About us',
		subtext:
			'We\'re a local salon that\'s been part of the community for years. Our goal is simple: send every client out the door feeling great.',
		subtext2:
			'We offer a full range of hair, nail, and skin services under one roof. Book one service or make a day of it.',
		bullets: [
			'Friendly, experienced stylists and technicians who listen.',
			'Clean, modern space with a relaxed atmosphere.',
			'We use professional products and take pride in our work.'
		],
		image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
		imageAlt: 'Salon styling area'
	},
	newPatients: {
		heading: 'Your first visit',
		subtext: 'Booking is easy. Here\'s what to expect.',
		steps: [
			{
				title: 'Book online or call',
				description: 'Choose your service and pick a time that works. We\'ll confirm your appointment and send a reminder.'
			},
			{
				title: 'Arrive a few minutes early',
				description: 'Check in, get comfortable, and we\'ll get you in the chair or at the station on time.'
			},
			{
				title: 'Relax and enjoy',
				description: 'We\'ll walk you through your service and make sure you\'re happy with the result. Rebook before you go if you like.'
			}
		],
		ctaLabel: 'Book an appointment',
		switchingEasy: 'New clients are always welcome.',
		whatToBringTitle: 'Before your visit',
		whatToBring: [
			'Any allergies or sensitivities we should know about',
			'Photo inspiration for hair or nails (optional)',
			'We accept card, cash, and most digital payments'
		]
	},
	whatToExpect: {
		heading: 'What to expect',
		subtext: 'We want your visit to be smooth and enjoyable.',
		items: [
			'Check in when you arrive. We\'ll get you set up with your stylist or technician.',
			'We\'ll discuss what you want and confirm the service and timing.',
			'Relax while we work. We\'ll keep you informed and make sure you\'re comfortable.',
			'We\'ll finish up, go over aftercare if needed, and you can rebook at the front.'
		]
	},
	hours: {
		heading: 'Salon hours',
		lines: ['Tuesday – Saturday: 9:00 AM – 6:00 PM', 'Sunday: 10:00 AM – 4:00 PM', 'Monday: Closed']
	},
	testimonials: {
		heading: 'What our clients say',
		subtext: 'Real feedback from people who visit us.',
		ratingDisplay: '4.9',
		reviewCount: '120+ reviews',
		items: [
			{
				quote: 'Best haircut I\'ve had in years. They actually listened to what I wanted and the colour is exactly what I asked for. Will be back.',
				author: 'Alex M.',
				role: 'Client, 1 year',
				rating: 5
			},
			{
				quote: 'I get my nails done here every few weeks. Always clean, friendly, and my manicure lasts. Love this place.',
				author: 'Jordan K.',
				role: 'Client, 2 years',
				rating: 5
			},
			{
				quote: 'Came in for a facial and left feeling so relaxed. The whole team is lovely and the space is so calm. Highly recommend.',
				author: 'Sam T.',
				role: 'Client, 6 months',
				rating: 5
			}
		]
	},
	insurance: {
		heading: 'Payment & policies',
		body: 'We accept card, cash, and popular digital payment methods. Gratuities are appreciated but never required. Cancellations: please give us at least 24 hours notice so we can offer the slot to someone else.'
	},
	stats: [
		{ value: '10+', label: 'Years in business' },
		{ value: '5k+', label: 'Happy clients' },
		{ value: '4.9', label: 'Star rating' }
	],
	contact: {
		heading: 'Visit us',
		subtext: 'Book online, call, or drop by. We\'d love to see you.',
		address: '1 Yonge Finch Plaza, Toronto, ON',
		phone: '+1 (289) 513-5055',
		email: 'hello@example-salon.com',
		ctaLabel: 'Book an appointment'
	},
	faq: {
		heading: 'Frequently asked questions',
		items: [
			{ q: 'Do I need to book in advance?', a: 'We recommend booking so we can reserve time for you. We do take walk-ins when we have availability. Call or pop in to check.' },
			{ q: 'What payment methods do you accept?', a: 'We accept card, cash, and most digital payment apps. Payment is due at the end of your service.' },
			{ q: 'How do I book an appointment?', a: 'Use the "Book an appointment" button on this page or call us during salon hours. We\'ll confirm your appointment and send a reminder.' },
			{ q: 'Do you do kids\' hair?', a: 'Yes. We welcome clients of all ages. Let us know when you book if you\'re bringing a child so we can allow the right amount of time.' },
			{ q: 'What is your cancellation policy?', a: 'Please cancel or reschedule at least 24 hours in advance so we can offer the appointment to another client. Late cancellations may be subject to a fee.' },
			{ q: 'Do you use sustainable or cruelty-free products?', a: 'We carry a range of professional products; many are cruelty-free and we can recommend options. Ask your stylist or technician.' }
		]
	},
	footer: {
		links: [
			{ label: 'Services', href: '#services' },
			{ label: 'About us', href: '#about' },
			{ label: 'Your first visit', href: '#new-patients' },
			{ label: 'FAQ', href: '#faq' },
			{ label: 'Visit us', href: '#contact' }
		],
		ctaLabel: 'Book an appointment',
		ctaHeading: 'Book an appointment',
		copyright: 'All rights reserved.'
	},
	cta: {
		heading: 'Ready for your next appointment?',
		subtext: 'Book online or give us a call. We can\'t wait to see you.',
		microReassurance: 'Easy online booking.',
		button: 'Book an appointment',
		phoneLabel: 'Or call to book'
	}
} as const;
