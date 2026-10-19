import type { Config } from 'tailwindcss';
const config: Config = { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'], theme: { extend: { colors: { ink: '#102a43', mint: '#d9f7e8', coral: '#ff7657' } } }, plugins: [] };
export default config;
