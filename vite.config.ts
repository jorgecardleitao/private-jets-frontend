import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [preact()],
	appType: 'spa',
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					'vendor-preact': ['preact', 'preact/hooks', 'preact/compat', 'preact-router'],
					'vendor-mui': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
					'vendor-charts': ['@mui/x-charts'],
					'vendor-maps': ['react-simple-maps'],
					'vendor-table': ['@tanstack/react-table'],
				},
			},
		},
	},
});
