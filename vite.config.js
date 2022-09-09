import { sveltekit } from '@sveltejs/kit/vite';
/** @type {import('vite').UserConfig} */
const config = {
	plugins: [sveltekit()],
	envPrefix: 'MERMAID_',
	optimizeDeps: { include: ['mermaid'] },
	server: {
		port: 3000,
		host: true
	},
	preview: {
		port: 3000,
		host: true
	},
	test: {
		environment: 'jsdom',
		// in-source testing
		includeSource: ['src/**/*.{js,ts,svelte}'],
		setupFiles: ['./src/tests/setup.ts'],
		coverage: {
			exclude: ['src/mocks', '.svelte-kit', 'src/**/*.test.ts'],
			reporter: ['text', 'json', 'html', 'lcov']
		}
	}
};
export default config;
