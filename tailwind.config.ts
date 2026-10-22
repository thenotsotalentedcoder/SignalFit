import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: { ink: '#102a43', canvas: '#f6f7f5', line: '#d6dcd8', muted: '#52606d', brand: '#0b6b57', 'brand-soft': '#e3f2ec', warn: '#8a5a00', 'warn-soft': '#fff4d6', danger: '#a12a1f', 'danger-soft': '#fdeceb', coral: '#e8583a' },
      borderRadius: { DEFAULT: '6px', md: '6px', lg: '8px' },
      fontFamily: { sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'] }
    }
  },
  plugins: []
};
export default config;
