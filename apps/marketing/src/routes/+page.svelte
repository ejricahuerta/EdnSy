<script lang="ts">
	import {
		ClipboardList,
		Sparkles,
		Pencil,
		Send,
		Building2,
		Laptop,
		Users
	} from 'lucide-svelte';
</script>

<svelte:head>
	<title>Lead Rosetta: Cold Outreach That Shows Up With Their Site Already Built</title>
</svelte:head>

<section class="hero">
	<div class="hero-inner">
		<div class="eyebrow">COLD OUTREACH, REINVENTED</div>
		<h1>Stop pitching.<br /><em>Show up with their site already built.</em></h1>
		<p class="hero-sub">
			Lead Rosetta finds everything publicly known about your prospect (their reviews, their services, their gaps) and builds them a personalized demo site. Instantly. You send it. They see their own business, fixed. <em>That's</em> why they reply.
		</p>
		<div class="hero-ctas">
			<a href="/try" class="lr-btn-primary">Try free: one demo →</a>
			<a href="#how" class="btn-outline">See how it works</a>
		</div>
	</div>
	<div style="width: 100%; text-align: center; box-sizing: border-box;">
		<p class="hero-note" style="display: block; width: 100%; max-width: none; margin: 0; padding: 0 2.5rem; font-size: 0.8rem; color: var(--muted); text-align: center; box-sizing: border-box;">No account needed to try · No credit card · Your lead data is never stored</p>
	</div>
</section>

<div class="preview-strip" id="how">
	<div class="preview-label">HOW IT WORKS: FOUR STEPS, MINUTES NOT DAYS</div>
	<div class="demo-flow">
		<div class="demo-step">
			<div class="step-icon">
				<ClipboardList size={22} strokeWidth={1.75} />
			</div>
			<div class="step-num">Step 1</div>
			<div class="step-title">Drop in your prospects</div>
			<div class="step-desc">
				A business name is all it takes. Lead Rosetta finds the rest: their Google profile, reviews, services, and gaps.
			</div>
		</div>
		<div class="step-arrow">→</div>
		<div class="demo-step">
			<div class="step-icon">
				<Sparkles size={22} strokeWidth={1.75} />
			</div>
			<div class="step-num">Step 2</div>
			<div class="step-title">We build their site</div>
			<div class="step-desc">
				AI scrapes their GBP, reviews, and socials. Builds a real, personalized demo. No website needed on their end. Instantly.
			</div>
		</div>
		<div class="step-arrow">→</div>
		<div class="demo-step">
			<div class="step-icon">
				<Pencil size={22} strokeWidth={1.75} />
			</div>
			<div class="step-num">Step 3</div>
			<div class="step-title">Review & approve</div>
			<div class="step-desc">Check it looks right. Adjust anything. Approve before it goes out.</div>
		</div>
		<div class="step-arrow">→</div>
		<div class="demo-step">
			<div class="step-icon">
				<Send size={22} strokeWidth={1.75} />
			</div>
			<div class="step-num">Step 4</div>
			<div class="step-title">They receive a gift</div>
			<div class="step-desc">
				"We built this for you. Want to keep it?" They click. They reply.
			</div>
		</div>
	</div>
</div>

<section class="section">
	<div class="two-col">
		<div>
			<div class="section-label">THE PROBLEM</div>
			<h2>Cold outreach<br />is <em>broken.</em></h2>
			<ul class="problem-list">
				<li>Generic "we build websites" emails get deleted in 2 seconds</li>
				<li>Everyone's pitching the same thing in the same way</li>
				<li>Prospects can't visualize what you're actually selling</li>
				<li>Response rates under 2% for most cold email campaigns</li>
				<li>Building a custom demo for each prospect takes hours</li>
			</ul>
		</div>
		<div>
			<div class="section-label">THE LEAD ROSETTA WAY</div>
			<h2>Send a <em>gift,</em><br />not a pitch.</h2>
			<ul class="solution-list">
				<li>Show up with their website already built, for free</li>
				<li>They open it because it has their name and logo on it</li>
				<li>They can see exactly what they're getting before saying yes</li>
				<li>The pitch writes itself: "want to keep it?"</li>
				<li>Generate 20 personalized demos in the time it took to write one cold email</li>
				<li>Works even if they have no website at all</li>
			</ul>
		</div>
	</div>
</section>

<hr class="divider" />

<section class="section">
	<div style="text-align: center; margin-bottom: 3.5rem;">
		<div class="section-label">WHAT YOUR PROSPECT RECEIVES</div>
		<h2>One email. Built their site.<br /><em>They replied in 24 hours.</em></h2>
		<p class="section-sub" style="max-width: 32rem; margin: 0.75rem auto 0; color: var(--muted); font-size: 0.95rem;">
			Real example: we built <a href="https://ohmyglass.ca" target="_blank" rel="noopener noreferrer" class="email-link">ohmyglass.ca</a> for Jann, after overhauling a site full of gambling, porn, and unrelated pages left by other website builders.
		</p>
	</div>
	<div class="email-mock">
		<div class="email-header">
			<div class="email-dot dot-r"></div>
			<div class="email-dot dot-y"></div>
			<div class="email-dot dot-g"></div>
			<div style="flex: 1; text-align: center; font-size: 0.75rem; color: var(--muted);">
				New Email
			</div>
		</div>
		<div class="email-body">
			<div class="email-meta">
				<div class="email-field">From: <span>Ed @ Ed & Sy</span></div>
				<div class="email-field">To: <span>Jann, OhMyGlass</span></div>
				<div class="email-field">Subject: <span>I rebuilt your site. (You're welcome.)</span></div>
			</div>
			<hr class="email-divider" />
			<div class="email-text">
				<p class="email-greeting">Hey Jann,</p>
				<p>Your old site had gambling, porn, and random pages from other builders. So we built you a real one: your services, your GTA coverage, 24/7 AI phone answering. The works.</p>
				<div class="email-snippet">
					<div class="email-snippet-browser">
						<span class="email-snippet-dot"></span>
						<span class="email-snippet-dot"></span>
						<span class="email-snippet-dot"></span>
						<span class="email-snippet-url">ohmyglass.ca</span>
					</div>
					<div class="email-snippet-preview" aria-hidden="true"></div>
					<div class="email-snippet-caption"><strong>Your demo site</strong>: ohmyglass.ca</div>
				</div>
				<p class="email-cta-line">
					<a class="email-body-link" href="https://ohmyglass.ca" target="_blank" rel="noopener noreferrer">View your site → ohmyglass.ca</a>
				</p>
				<p>Have a look when you get a sec. No catch. (We might send a follow-up.)</p>
				<p class="email-signature">- Ed</p>
			</div>
			<div class="email-reply-badge">↩ Reply confirmed: "When can we call?"</div>
		</div>
	</div>
</section>

<hr class="divider" />

<section class="section">
	<div class="section-label">WHO IT'S FOR</div>
	<h2>Built for anyone who closes deals<br /><em>by showing up first.</em></h2>
	<div class="who-grid">
		<div class="who-card">
			<div class="who-icon">
				<Building2 size={28} strokeWidth={1.5} />
			</div>
			<div class="who-title">Web & SEO Agencies</div>
			<div class="who-desc">
				Send 50 personalized demos in the time it took to write one pitch. Your prospects see their own business, fixed, before you've said a word.
			</div>
		</div>
		<div class="who-card">
			<div class="who-icon">
				<Laptop size={28} strokeWidth={1.5} />
			</div>
			<div class="who-title">Freelancers</div>
			<div class="who-desc">
				Show up like an agency on a freelancer budget. Your prospect gets a real demo site with their name on it. Not a template. Not a promise.
			</div>
		</div>
		<div class="who-card">
			<div class="who-icon">
				<Users size={28} strokeWidth={1.5} />
			</div>
			<div class="who-title">B2B Cold Outreach Teams</div>
			<div class="who-desc">
				Your SDRs are sending the same email as everyone else. Lead Rosetta turns cold outreach into a moment that stops the scroll.
			</div>
		</div>
	</div>
</section>

<hr class="divider" />

<section class="section" id="pricing">
	<div style="text-align: center; margin-bottom: 0.5rem;">
		<div class="section-label">PRICING</div>
		<h2>Simple. <em>No surprises.</em></h2>
		<p class="section-sub" style="max-width: 32rem; margin: 0.5rem auto 0; color: var(--muted); font-size: 0.95rem;">
			Try one demo free — no account, no credit card.<br />
			Then pick a plan when it works.
		</p>
	</div>
	<div class="pricing-grid">
		<div class="pricing-card">
			<div class="plan-name">Starter</div>
			<div class="price">$49</div>
			<div class="price-period">per month</div>
			<p style="color: var(--muted); font-size: 0.9rem; margin-bottom: 1rem;">For freelancers closing 2–3 clients a month</p>
			<ul class="plan-features">
				<li>30 demo pages/month</li>
				<li>CSV upload</li>
				<li>Manual send (copy link)</li>
				<li>Open tracking</li>
				<li>Unused demos roll over 30 days</li>
			</ul>
			<a href="/auth/login" class="btn-plan">Get started →</a>
		</div>

		<div class="pricing-card featured">
			<div class="featured-badge">Most Popular</div>
			<div class="plan-name">Pro</div>
			<div class="price">$99</div>
			<div class="price-period">per month</div>
			<p style="color: var(--muted); font-size: 0.9rem; margin-bottom: 1rem;">For agencies running outreach at scale</p>
			<ul class="plan-features">
				<li>100 demo pages/month</li>
				<li>CSV + CRM connection</li>
				<li>Email template suite (cold + follow-up)</li>
				<li>Copy templates, send from your tool</li>
				<li>Review & approve before send</li>
				<li>Custom sender name · Notifications via Resend</li>
				<li>Unused demos roll over 30 days</li>
			</ul>
			<a href="/auth/login" class="btn-plan btn-plan-primary">Start Pro →</a>
		</div>

		<div class="pricing-card">
			<div class="plan-name">Agency</div>
			<div class="price">$299</div>
			<div class="price-period">per month</div>
			<p style="color: var(--muted); font-size: 0.9rem; margin-bottom: 1rem;">For teams selling on behalf of clients</p>
			<ul class="plan-features">
				<li>Unlimited demo pages</li>
				<li>Everything in Pro</li>
				<li>White-label demos (your branding)</li>
				<li>Team seats (up to 5)</li>
				<li>Client dashboard</li>
				<li>Priority support</li>
			</ul>
			<a href="mailto:?subject=Lead%20Rosetta%20Agency%20plan" class="btn-plan">Contact us</a>
		</div>
	</div>
	<div style="width: 100%; text-align: center; box-sizing: border-box;">
		<p class="pricing-testimonial" style="display: block; width: 100%; max-width: none; margin: 2rem 0 0; padding: 0; color: var(--muted); font-size: 0.95rem; text-align: center; box-sizing: border-box;">"One demo closed a client for us. If it works once, it pays for itself."</p>
	</div>
</section>

<section class="section" style="text-align: center; padding-top: 2rem; padding-bottom: 5rem;">
	<h2 style="margin-bottom: 0.75rem;">Ready to try?</h2>
	<p style="color: var(--muted); margin-bottom: 1.5rem; font-size: 1rem;">See what your prospect gets in one demo. No account needed.</p>
	<a href="/try" class="lr-btn-primary">Try free: one demo →</a>
</section>
