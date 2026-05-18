const config = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF1FF',
          100: '#DDE3FF',
          500: '#3D52F5',
          600: '#2A3FE0',
          700: '#1F30B8',
          900: '#0F1A6B',
        },
        accent: {
          50: '#FFF1EC',
          500: '#FF8A65',
          600: '#F76B43',
        },
        neutral: {
          0: '#FFFFFF',
          50: '#FAFAF7',
          100: '#F4F4EF',
          200: '#E8E8E2',
          400: '#9CA3AF',
          600: '#4B5563',
          900: '#1A1A1A',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['var(--font-noto-sans-georgian)', 'var(--font-inter)', 'sans-serif'],
        numeric: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        display: ['72px', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
        h1: ['48px', { lineHeight: '1.1', letterSpacing: '-0.01em', fontWeight: '700' }],
        h2: ['32px', { lineHeight: '1.2', fontWeight: '600' }],
        h3: ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        h4: ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        body: ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['13px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '10px',
        card: '14px',
        modal: '20px',
        full: '9999px',
      },
      boxShadow: {
        rest: '0 1px 2px rgba(16, 24, 40, 0.04)',
        hover: '0 4px 12px rgba(16, 24, 40, 0.08)',
        modal: '0 24px 48px rgba(16, 24, 40, 0.16)',
        focus: '0 0 0 3px rgba(61, 82, 245, 0.12)',
      },
      transitionTimingFunction: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
};

export default config;
