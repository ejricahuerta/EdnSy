/**
 * Format assistant chat message for display: escape HTML and convert
 * markdown-style **bold** and * list items to HTML so they render properly.
 */
export function formatChatMessage(content: string): string {
	if (!content) return '';

	const escape = (s: string) =>
		s
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;');

	let out = escape(content);

	// **bold** -> <strong>bold</strong> (non-greedy)
	out = out.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

	// List marker " * " (space asterisk space) -> line break + bullet
	out = out.replace(/ \* /g, ' <br>• ');

	// Line that starts with * (list item) -> bullet
	out = out.replace(/^\* /gm, '• ');

	// Newlines -> <br>
	out = out.replace(/\n/g, '<br>');

	return out;
}
