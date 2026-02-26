/**
 * Construction demo: Canadian-focused (Ontario & Canada projects). Aligned with construction.jpg mockup.
 */
export const constructionDemoContent = {
	header: {
		brandTagline: 'CONSTRUCTION & DEVELOPMENT',
		navLinks: [
			{ label: 'Projects', href: '#projects' },
			{ label: 'Services', href: '#services' },
			{ label: 'About', href: '#about' },
			{ label: 'Contact', href: '#contact' }
		],
		ctaLabel: 'Get a quote'
	},
	hero: {
		eyebrow: 'PROJECTS | PRACTICE',
		companyName: 'IRONCLAD®',
		trademark: false,
		image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80',
		imageAlt: 'Modern high-rise under construction',
		body: 'IRONCLAD® CONSTRUCTION is a Canadian team of modern building specialists for an elevated and seamless build experience. We\'re a diverse group of engineers and architects with decades of experience delivering landmark projects across Ontario and Canada, from commercial towers to residential and infrastructure.',
		ctaLabel: 'VIEW PROJECTS'
	},
	featuredProjects: {
		heading: 'Featured Projects',
		subheading: 'SELECTED WORK: 2021 - 2024',
		items: [
			{ title: 'The Meridian Residences', category: 'Residential', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80', number: '01' },
			{ title: 'Apex Tower', category: 'Commercial', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&q=80', number: '02' },
			{ title: 'Berlings Loft Restoration', category: 'Renovation', image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80', number: '03' }
		]
	},
	stats: [
		{ value: '250+', label: 'PROJECTS COMPLETED' },
		{ value: '28', label: 'YEARS OF EXPERIENCE' },
		{ value: '95%', label: 'CLIENT SATISFACTION' },
		{ value: '48', label: 'EXPERTS ON STAFF' }
	],
	services: {
		heading: 'Our Services',
		subheading: 'COMPREHENSIVE INDUSTRY SOLUTIONS',
		items: [
			{ title: 'Residential', description: 'Custom home and housing developments built with precision and care. From single-family bespoke, to luxury complexes.', icon: 'Home' },
			{ title: 'Commercial', description: 'Office towers, retail spaces, and mixed-use developments that define city skylines and drive business growth.', icon: 'Building2' },
			{ title: 'Innovation', description: 'Breathe new life into existing structures. Heritage, industrials, modern-utility, and complete interior transformations.', icon: 'Lightbulb' },
			{ title: 'Project Management', description: 'End-to-end construction management ensuring your project is delivered on time, on budget, and to the highest standard.', icon: 'ClipboardList' }
		]
	},
	integrity: {
		heading: 'Built on Integrity',
		subheading: 'SINCE 1996',
		body: 'Our principles and approach have defined us for nearly three decades across the Canadian construction industry. We combine experience with innovation to deliver projects that stand the test of time, from Ontario to Western Canada. Every build is a partnership; we listen, we plan, and we execute with transparency and accountability.',
		team: [
			{ name: 'Marcus Hale', title: 'Founder & CEO' },
			{ name: 'Sarah Chen', title: 'Head of Architecture' }
		]
	},
	registerInterest: {
		heading: 'Register interest now',
		subtext: 'Projects to get more in-progress, despite now. Completion early 2027.',
		form: {
			fullName: 'Full name*',
			email: 'Email*',
			phone: 'Phone Number*',
			placeholderName: 'Your full name',
			placeholderEmail: 'your@email.com',
			placeholderPhone: '+1 (555) 000-0000',
			submit: 'SUBMIT'
		}
	},
	contact: {
		address: '1 Yonge Finch Plaza, Toronto, ON',
		phone: '+1 (289) 513-5055',
		email: 'hello@example-construction.com'
	},
	footer: {
		copyright: '© Copyright IroncladCo LLC',
		contacts: [
			{ name: 'Marcus Hale', title: 'Founder & CEO', phone: '+1 (555) 555-5555', email: 'marcus@ironcladconstruction.com' },
			{ name: 'Sarah Chen', title: 'Head of Architecture', phone: '+1 (555) 555-5555', email: 'sarah@ironcladconstruction.com' }
		]
	}
} as const;
