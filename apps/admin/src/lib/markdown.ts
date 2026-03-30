import { marked } from 'marked';
import type { Tokens } from 'marked';

marked.use({
	renderer: {
		link(this: { parser: { parseInline: (tokens: Tokens.Generic[]) => string } }, token: Tokens.Link) {
			const href = token.href;
			const titleAttr = token.title ? ` title="${token.title}"` : '';
			const text = this.parser.parseInline(token.tokens);
			return `<a href="${href}" target="_blank" rel="noopener noreferrer"${titleAttr} class="text-[var(--sage)] underline hover:no-underline">${text}</a>`;
		}
	}
});

/**
 * Convert markdown to HTML. Links get target="_blank" and rel="noopener noreferrer".
 * Content is from trusted docs only; no sanitization applied.
 */
export function markdownToHtml(md: string): string {
	if (!md?.trim()) return '';
	return marked.parse(md, { async: false }) as string;
}
