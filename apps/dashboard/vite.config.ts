import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import path from "path";

export default defineConfig(({ mode }) => {
	// Load env file based on `mode` in the current working directory.
	// Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
	const env = loadEnv(mode, process.cwd(), '');
	
	return {
		resolve: {
			alias: {
				$lib: path.resolve('./src/lib'),
				$components: path.resolve('./src/components'),
				$utils: path.resolve('./src/utils'),
				$routes: path.resolve('./src/routes'),
				$app: path.resolve('./src/app'),
				$hooks: path.resolve('./src/hooks')
			}
		},
		plugins: [tailwindcss(), sveltekit()],
	};
});
