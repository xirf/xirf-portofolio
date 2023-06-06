/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: ['class'],
	daisyui: {
		themes: ['winter']	
	},
	theme: {
		extend: {
			borderWidth: {
				'1': '1px',
			},
			colors: {
				'primary': '#f6f9fc',
			},
			boxShadow: {
				default: "0px 8px 15px rgba(0, 0, 0, 0.1);",
				hover: "0px 15px 20px rgba(0, 0, 0, 0.1);"
			},
			// min height
			minHeight: {
				'0': '0',
				"xl": "36rem",
				"2xl": "42rem",
				"3xl": "48rem",
				"4xl": "56rem",
				"5xl": "64rem",
				"6xl": "72rem",
			}
		},
	},
	plugins: [require('daisyui')],
}
