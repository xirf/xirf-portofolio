/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: "#212331",
					50: "#f5f5f5",
					100: "#ebebeb",
					200: "#d1d1d1",
					300: "#b7b7b7",
					400: "#9d9d9d",
					500: "#838383",
					600: "#696969",
					700: "#4f4f4f",
					800: "#353535",
					900: "#1b1b1b",
				},
			},
			padding: {
				"s": "1rem",
				"m": "2rem",
				"l": "3rem",
				"xl": "4rem",
				"xxl": "5rem",
				"4": "4%",
				"8": "8%",
				"16": "16%",
				"24": "24%",
			},
		},
	},
	plugins: [],
};
