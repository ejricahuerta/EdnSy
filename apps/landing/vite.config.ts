import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
	// Load env file based on `mode` in the current working directory.
	// Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
	const env = loadEnv(mode, process.cwd(), '');
	
	return {
		plugins: [tailwindcss(), sveltekit()],
		// Avoid ENOENT when a transitive/cached dep references @vercel/analytics but the package is not installed
		optimizeDeps: {
			exclude: ['@vercel/analytics']
		}
	};
});
