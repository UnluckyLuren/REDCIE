export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:                  'rgb(var(--color-primary) / <alpha-value>)',
        'primary-container':      'rgb(var(--color-primary-container) / <alpha-value>)',
        secondary:                'rgb(var(--color-secondary) / <alpha-value>)',
        surface:                  'rgb(var(--color-surface) / <alpha-value>)',
        'surface-container-lowest': 'rgb(var(--color-surface-container-lowest) / <alpha-value>)',
        'surface-container-low':  'rgb(var(--color-surface-container-low) / <alpha-value>)',
        'surface-container':      'rgb(var(--color-surface-container) / <alpha-value>)',
        'surface-container-high': 'rgb(var(--color-surface-container-high) / <alpha-value>)',
        'on-surface':             'rgb(var(--color-on-surface) / <alpha-value>)',
        'on-surface-variant':     'rgb(var(--color-on-surface-variant) / <alpha-value>)',
        'on-primary':             'rgb(var(--color-on-primary) / <alpha-value>)',
        'on-primary-container':   'rgb(var(--color-on-primary-container) / <alpha-value>)',
        error:                    '#ba1a1a',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        inter:  ['Inter', 'sans-serif'],
      },
      fontSize: {
        'display-lg':   ['48px', { lineHeight: '56px', fontWeight: '700' }],
        'headline-lg':  ['36px', { lineHeight: '44px', fontWeight: '600' }],
        'headline-md':  ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'headline-sm':  ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg':      ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md':      ['15px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm':      ['13px', { lineHeight: '20px', fontWeight: '400' }],
        'label-lg':     ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'label-md':     ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'label-sm':     ['11px', { lineHeight: '16px', fontWeight: '500' }],
      },
      boxShadow: {
        'sidebar':  '0 1px 8px rgba(0,0,0,0.04)',
        'card':     '0 1px 4px rgba(0,0,0,0.06)',
        'elevated': '0 4px 12px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        'card': '0.75rem',
        'pill': '9999px',
      },
    },
  },
  plugins: [],
};
