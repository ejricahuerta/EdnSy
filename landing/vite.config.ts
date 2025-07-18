import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	resolve: {
		alias: {
			'@/components': path.resolve('./src/lib/components'),
			'@/routes': path.resolve('./src/routes'),
			'@/lib': path.resolve('./src/lib'),
			'@/stores': path.resolve('./src/lib/stores'),
			'@/services': path.resolve('./src/lib/services'),
			'@/utils': path.resolve('./src/lib/utils')
		}
	}
});
