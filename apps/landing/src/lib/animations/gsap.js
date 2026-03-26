/**
 * Central GSAP setup for ednsy.com landing. Import from here only (ScrollTrigger + plugins registered once).
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';

if (typeof window !== 'undefined') {
	gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);
}

/** True when user prefers reduced motion (evaluated at module load on client). */
export const prefersReduced =
	typeof window !== 'undefined' &&
	window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const ST_SCROLL = {
	start: 'top 78%',
	once: true,
};

function motionOk() {
	return typeof window !== 'undefined' && !prefersReduced;
}

/**
 * @param {string} str
 * @returns {{ prefix: string; value: number; suffix: string; decimals: number; useGrouping: boolean } | null}
 */
function parseNumberLike(str) {
	const trimmed = String(str).trim();
	const match = trimmed.match(/^(\D*?)(-?[\d.,]+)(.*)$/);
	if (!match) return null;
	const prefix = match[1] ?? '';
	const rawNumber = match[2] ?? '';
	const suffix = match[3] ?? '';
	const normalized = rawNumber.replace(/,/g, '');
	const value = Number.parseFloat(normalized);
	if (!Number.isFinite(value)) return null;
	const decimals = (normalized.split('.')[1] ?? '').length;
	const useGrouping = rawNumber.includes(',');
	return { prefix, value, suffix, decimals, useGrouping };
}

/**
 * @param {{ prefix: string; value: number; suffix: string; decimals: number; useGrouping: boolean }} parts
 * @param {number} current
 */
function formatAnimatedNumber(parts, current) {
	const formatter = new Intl.NumberFormat(undefined, {
		useGrouping: parts.useGrouping,
		minimumFractionDigits: parts.decimals,
		maximumFractionDigits: parts.decimals,
	});
	return `${parts.prefix}${formatter.format(current)}${parts.suffix}`;
}

export { gsap, ScrollTrigger };

/** Call after client navigations / layout shifts. */
export function refreshScrollTrigger() {
	if (typeof window !== 'undefined') ScrollTrigger.refresh();
}

/**
 * @param {HTMLElement} node
 * @param {{ y?: number; duration?: number; delay?: number; ease?: string }} opts
 */
export function fadeUp(node, opts = {}) {
	if (!motionOk()) return;
	const { y = 40, duration = 0.65, delay = 0, ease = 'power3.out' } = opts;
	gsap.set(node, { opacity: 0, y });
	const anim = gsap.to(node, {
		opacity: 1,
		y: 0,
		duration,
		delay,
		ease,
		scrollTrigger: { trigger: node, ...ST_SCROLL },
	});
	return {
		destroy() {
			anim.scrollTrigger?.kill();
			anim.kill();
		},
	};
}

/**
 * @param {HTMLElement} node
 * @param {{ stagger?: number; y?: number; duration?: number; ease?: string; selector?: string }} opts
 */
export function staggerIn(node, opts = {}) {
	if (!motionOk()) return;
	const {
		stagger = 0.08,
		y = 30,
		duration = 0.55,
		ease = 'power2.out',
		selector = ':scope > *',
	} = opts;
	const children = gsap.utils.toArray(node.querySelectorAll(selector));
	if (!children.length) return;
	gsap.set(children, { opacity: 0, y });
	const anim = gsap.to(children, {
		opacity: 1,
		y: 0,
		duration,
		ease,
		stagger,
		scrollTrigger: { trigger: node, ...ST_SCROLL },
	});
	return {
		destroy() {
			anim.scrollTrigger?.kill();
			anim.kill();
		},
	};
}

/**
 * @param {HTMLElement} node
 * @param {{ stagger?: number; duration?: number; delay?: number; immediate?: boolean }} opts
 */
export function revealWords(node, opts = {}) {
	if (!motionOk()) return;
	const { stagger = 0.06, duration = 0.7, delay = 0, immediate = false } = opts;
	const text = node.textContent ?? '';
	const parts = text.split(/(\s+)/);
	const frag = document.createDocumentFragment();
	for (const chunk of parts) {
		if (/^\s+$/.test(chunk)) {
			frag.appendChild(document.createTextNode(chunk));
			continue;
		}
		if (!chunk) continue;
		const outer = document.createElement('span');
		outer.style.display = 'inline-block';
		outer.style.overflow = 'hidden';
		outer.style.verticalAlign = 'bottom';
		const inner = document.createElement('span');
		inner.style.display = 'inline-block';
		inner.textContent = chunk;
		inner.className = 'gsap-reveal-word-inner';
		outer.appendChild(inner);
		frag.appendChild(outer);
	}
	node.replaceChildren(frag);
	const inners = node.querySelectorAll('.gsap-reveal-word-inner');
	gsap.set(inners, { yPercent: 110, opacity: 0.65 });
	const tweenVars = {
		yPercent: 0,
		opacity: 1,
		duration,
		stagger,
		delay,
		ease: 'power3.out',
	};
	let anim;
	if (immediate) {
		anim = gsap.to(inners, tweenVars);
	} else {
		anim = gsap.to(inners, {
			...tweenVars,
			scrollTrigger: { trigger: node, ...ST_SCROLL },
		});
	}
	return {
		destroy() {
			anim.scrollTrigger?.kill();
			anim.kill();
		},
	};
}

/**
 * @param {SVGSVGElement} node
 * @param {{ duration?: number; stagger?: number; delay?: number }} opts
 */
export function drawSVG(node, opts = {}) {
	if (!motionOk()) return;
	if (!(node instanceof SVGSVGElement)) return;
	const { duration = 1.2, stagger = 0.15, delay = 0 } = opts;
	const shapes = gsap.utils.toArray(
		node.querySelectorAll('path,circle,line,polyline,polygon,ellipse,rect')
	);
	if (!shapes.length) return;
	const anim = gsap.from(shapes, {
		drawSVG: 0,
		duration,
		stagger,
		delay,
		ease: 'power2.inOut',
		scrollTrigger: { trigger: node, ...ST_SCROLL },
	});
	return {
		destroy() {
			anim.scrollTrigger?.kill();
			anim.kill();
		},
	};
}

/**
 * @param {HTMLElement} node
 * @param {{ y?: number; scale?: number; duration?: number }} opts
 */
export function hoverLift(node, opts = {}) {
	if (!motionOk()) return;
	const { y = -5, scale = 1.01, duration = 0.25 } = opts;
	const onEnter = () => {
		gsap.to(node, { y, scale, duration, ease: 'power2.out', overwrite: 'auto' });
	};
	const onLeave = () => {
		gsap.to(node, { y: 0, scale: 1, duration, ease: 'power2.out', overwrite: 'auto' });
	};
	node.addEventListener('mouseenter', onEnter);
	node.addEventListener('mouseleave', onLeave);
	return {
		destroy() {
			node.removeEventListener('mouseenter', onEnter);
			node.removeEventListener('mouseleave', onLeave);
			gsap.killTweensOf(node);
		},
	};
}

/**
 * @param {HTMLElement} node
 * @param {{ y?: number; duration?: number; delay?: number }} opts
 */
export function floatLoop(node, opts = {}) {
	if (!motionOk()) return;
	const { y = 8, duration = 3, delay = 0 } = opts;
	const anim = gsap.to(node, {
		y: `+=${y}`,
		duration,
		ease: 'sine.inOut',
		yoyo: true,
		repeat: -1,
		delay,
	});
	return {
		destroy() {
			anim.kill();
		},
	};
}

/**
 * Animate numeric text. Set data-counter-static="true" to skip. Uses data-counter-end for final string or parses textContent.
 * Optional: data-count as numeric target with prefix/suffix from opts.
 *
 * @param {HTMLElement} node
 * @param {{ duration?: number; prefix?: string; suffix?: string }} opts
 */
export function counterUp(node, opts = {}) {
	if (!motionOk()) return;
	if (node.dataset.counterStatic === 'true') return;

	const { duration = 1.5, prefix: optPrefix, suffix: optSuffix } = opts;
	const endStr =
		node.dataset.counterEnd != null && node.dataset.counterEnd !== ''
			? node.dataset.counterEnd
			: (node.textContent ?? '');

	let parts;
	if (node.dataset.count !== undefined && node.dataset.count !== '') {
		const n = Number.parseFloat(node.dataset.count);
		if (!Number.isFinite(n)) return;
		parts = {
			prefix: optPrefix ?? '',
			value: n,
			suffix: optSuffix ?? '',
			decimals: Number(node.dataset.countDecimals ?? 0) || 0,
			useGrouping: node.dataset.countGrouping === 'true',
		};
	} else {
		parts = parseNumberLike(endStr);
		if (!parts) return;
	}

	const state = { val: 0 };
	node.textContent = formatAnimatedNumber(parts, 0);

	const anim = gsap.to(state, {
		val: parts.value,
		duration,
		ease: 'power2.out',
		scrollTrigger: { trigger: node, start: 'top 85%', once: true },
		onUpdate: () => {
			node.textContent = formatAnimatedNumber(parts, state.val);
		},
	});

	return {
		destroy() {
			anim.scrollTrigger?.kill();
			anim.kill();
		},
	};
}
