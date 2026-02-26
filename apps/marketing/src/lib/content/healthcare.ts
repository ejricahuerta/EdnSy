/**
 * Healthcare demo: local physician clinic (Canadian, OHIP/PIPEDA). Not a large healthcare company.
 */
export const healthcareDemoContent = {
	header: {
		navLinks: [
			{ label: 'Services', href: '#services' },
			{ label: 'About', href: '#about' },
			{ label: 'Our Team', href: '#about' },
			{ label: 'Testimonials', href: '#testimonials' },
			{ label: 'Contact', href: '#contact' }
		],
		ctaLabel: 'Book an appointment'
	},
	hero: {
		badge: 'New patients welcome',
		badgeIcon: 'leaf',
		headline: 'Healthcare that puts you first',
		headlineHighlight: 'puts you first',
		subtext: 'Our family physicians and care team provide personalized care in a welcoming neighbourhood clinic. Book in-person or virtual visits. We work with OHIP and provincial health. Your health card is all you need for covered services.',
		ctaPrimary: 'Book an appointment',
		ctaSecondary: 'Our services',
		stats: [
			{ value: '15+', label: 'Years in practice' },
			{ value: '5', label: 'Physicians on our team' },
			{ value: '4.9', label: 'Patient rating' }
		],
		image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80',
		imageAlt: 'Doctor in clinic with tablet',
		hipaaBadge: 'PIPEDA Compliant',
		hipaaSubtext: 'Your data is secure under Canadian privacy law'
	},
	trustedBy: {
		heading: 'PROUD TO SERVE OUR COMMUNITY',
		brands: ['OHIP', 'College of Physicians & Surgeons of Ontario', 'Local hospital referrals', 'Provincial health', 'PIPEDA compliant', 'Family health team']
	},
	services: {
		subtitle: 'OUR SERVICES',
		heading: 'Care for every stage of life',
		subtext: 'From routine check-ups to ongoing care, we offer the services you need under one roof. Most visits are covered by OHIP; we bill directly where applicable.',
		items: [
			{ title: 'Virtual visits', description: 'Connect with your physician from home when appropriate. Secure video or phone: same care, from your couch.', icon: 'Video' },
			{ title: 'Primary care', description: 'Our family doctors provide preventive care, chronic disease management, and same-day concerns. Your medical home.', icon: 'Heart' },
			{ title: 'Mental health', description: 'Support for anxiety, depression, and wellness. We work with local therapists and can refer when needed; some services OHIP-covered.', icon: 'Brain' },
			{ title: 'Preventive care', description: 'Check-ups, screenings, and health advice. We help you stay on top of your health with a personal touch.', icon: 'Activity' },
			{ title: 'Billing & OHIP', description: 'We work with OHIP and provincial health. Transparent billing and direct submission. Bring your health card.', icon: 'FileCheck' },
			{ title: 'Same-day visits', description: 'Urgent but non-emergency care when you need it. Call for same-day availability at our clinic.', icon: 'Calendar' }
		]
	},
	innovation: {
		heading: 'Modern care, personal touch',
		body: 'We’re a local clinic that combines a friendly, familiar environment with today’s tools. Virtual visits when they make sense, in-person when you prefer. Your information is always protected under PIPEDA.',
		bullets: [
			'Family physicians who know you and your history',
			'Virtual visits available for many appointment types',
			'PIPEDA-compliant: your data stays in Canada and is protected',
			'OHIP and provincial health: we bill directly where applicable'
		],
		image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80',
		imageAlt: 'Patient on video call with doctor',
		statBadge: '98%',
		statLabel: 'Patient satisfaction'
	},
	statsBar: [
		{ value: '15+', label: 'Years serving our community.' },
		{ value: '98%', label: 'Patient satisfaction at our clinic.' },
		{ value: 'Same-day', label: 'Appointments when available.' },
		{ value: 'Friendly', label: 'Front desk and care team.' }
	],
	testimonials: {
		subtitle: 'TESTIMONIALS',
		heading: 'Hear from our patients',
		subtext: 'What our patients say about their experience at our clinic.',
		items: [
			{ quote: 'Finally have a family doctor who remembers my name and my history. OHIP billing was seamless.', author: 'Sarah M.', role: 'Patient since 2018', rating: 5 },
			{ quote: 'Same-day appointments saved us more than once. The team is caring and efficient.', author: 'James L.', role: 'Parent of two', rating: 5 },
			{ quote: 'Welcoming clinic, clear explanations, and they work with my health card. No surprises.', author: 'Priya K.', role: 'Patient since 2021', rating: 5 }
		]
	},
	cta: {
		heading: 'Your health starts here',
		subtext: 'Join our practice and book your first visit. New patients are welcome; we’ll take care of the rest.',
		buttonPrimary: 'Book an appointment',
		buttonSecondary: 'Learn more',
		image: 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800&q=80',
		imageAlt: 'Care team at our clinic'
	},
	contact: {
		address: '1 Yonge Finch Plaza, Toronto, ON',
		phone: '+1 (289) 513-5055',
		email: 'hello@example.com'
	}
} as const;
