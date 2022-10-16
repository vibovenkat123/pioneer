import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import pkg from './package.json';

const config: UserConfig = {
	plugins: [sveltekit()],
	ssr: {
		noExternal: Object.keys(pkg.dependencies || {})
	}
};

export default config;