/** @type {import('tailwindcss').Config} */
module.exports = {
  content: {
     content: ['./src/**/*.{js,ts,jsx,tsx}'],
  },
  theme: {
    extend: {
        colors: {
            bg: 'var(--color-bg)', 'bg-second': 'var(--color-bg-second)',
            text: 'var(--color-text)', 'text-second': 'var(--color-text-second)',
            accent: 'var(--color-accent)',
            success: 'var(--color-success)',
            warning: 'var(--color-warning)',
            error: 'var(--color-error)',
        }
    },
  },
  plugins: [],
};
