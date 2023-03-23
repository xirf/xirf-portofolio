/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			borderWidth: {
				'1': '1px',
			},
			colors: {
				'primary': '#ededf7',
			}
		},
	},
	plugins: [],
}
