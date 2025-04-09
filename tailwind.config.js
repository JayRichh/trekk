export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        black: '#000000',
        white: '#FFFFFF',
        primary: {
          DEFAULT: '#2A5F4F',
          50: '#EAF2EF',
          100: '#C6E0D8',
          200: '#9ECBBE',
          300: '#75B6A3',
          400: '#4D9A87',
          500: '#2A5F4F',
          600: '#1F4638',
          700: '#173127',
          800: '#0E1D18',
          900: '#060C08'
        },
        accent: {
          DEFAULT: '#E76F51',
          50: '#FCE9E4',
          100: '#F8CAC0',
          200: '#F2A992',
          300: '#EC8970',
          400: '#E76F51',
          500: '#D14725',
          600: '#9D361D',
          700: '#692414',
          800: '#35120A',
          900: '#140703'
        },
        forest: {
          DEFAULT: '#193D30',
          light: '#2A5F4F',
          dark: '#0F2A21',
          muted: '#4A7164',
          green: '#2F714F'
        },
        earth: {
          DEFAULT: '#C8A992',
          clay: '#C8A992',
          sand: '#E6D7C3',
          stone: '#A5978B',
          bark: '#9C8578',
          soil: '#8D7566',
          gold: '#E9C46A'
        },
        sky: {
          DEFAULT: '#84B9E3',
          light: '#A2CCF0',
          dark: '#5A96C6',
          pale: '#D6E8F8'
        },
        background: '#F8FAFC',
        surface: '#FFFFFF',
        text: {
          DEFAULT: '#293241',
          light: '#4A5568',
          muted: '#718096',
          inverted: '#FFFFFF'
        },
        border: '#E2E8F0',
        // Removed low-opacity hover states in favor of using Tailwind's built-in shade system
        // For hover states, use darker shades (e.g., bg-accent hover:bg-accent-700)
        // For active states, use even darker shades (e.g., active:bg-accent-800)
        // This provides better contrast and readability during interactions
        focus: '#EBF4FF',
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6'
        },
        difficulty: {
          easy: '#22C55E',
          moderate: '#F59E0B',
          difficult: '#EF4444',
          extreme: '#8B5CF6'
        },
        elevation: {
          low: '#22C55E',
          medium: '#F59E0B',
          high: '#EF4444',
          extreme: '#8B5CF6'
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827'
        },
        blue: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8'
        }
      },
      spacing: {
        xs: '0.25rem',
        sm: '0.5rem',
        md: '1rem',
        lg: '1.5rem',
        xl: '2rem',
        '2xl': '2.5rem',
        '3xl': '3rem',
        '4xl': '4rem',
        '5xl': '5rem',
        '6xl': '6rem'
      },
      borderRadius: {
        none: '0',
        sm: '0.25rem',
        DEFAULT: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
        full: '9999px'
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
        DEFAULT: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.05), 0 4px 6px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.05), 0 10px 10px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px rgba(0, 0, 0, 0.12)',
        inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        subtle: '0 2px 3px rgba(0, 0, 0, 0.02), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        card: '0 4px 6px rgba(0, 0, 0, 0.03), 0 1px 3px rgba(0, 0, 0, 0.08)',
        none: 'none'
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['IBM Plex Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }]
      },
      letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0em',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em'
      },
      lineHeight: {
        none: '1',
        tight: '1.25',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
        body: '1.625'
      },
      zIndex: {
        0: '0',
        10: '10',
        20: '20',
        30: '30',
        40: '40',
        50: '50',
        100: '100',
        modal: '999',
        tooltip: '1000'
      },
      opacity: {
        0: '0',
        5: '0.05',
        10: '0.1',
        20: '0.2',
        25: '0.25',
        30: '0.3',
        40: '0.4',
        50: '0.5',
        60: '0.6',
        70: '0.7',
        75: '0.75',
        80: '0.8',
        90: '0.9',
        95: '0.95',
        100: '1'
      },
      transitionProperty: {
        DEFAULT: 'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform',
        colors: 'background-color, border-color, color, fill, stroke',
        opacity: 'opacity',
        shadow: 'box-shadow',
        transform: 'transform',
        height: 'height',
        spacing: 'margin, padding',
        width: 'width'
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
        linear: 'linear',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      transitionDuration: {
        DEFAULT: '150ms',
        75: '75ms',
        100: '100ms',
        150: '150ms',
        200: '200ms',
        300: '300ms',
        500: '500ms',
        700: '700ms',
        1000: '1000ms'
      },
      borderWidth: {
        DEFAULT: '1px',
        0: '0',
        1: '1px',
        2: '2px',
        3: '3px',
        4: '4px',
        5: '5px',
        6: '6px',
        8: '8px'
      },
      animation: {
        none: 'none',
        spin: 'spin 1s linear infinite',
        ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        bounce: 'bounce 1s infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'scale-in': 'scaleIn 0.3s ease-in-out',
        'slide-in-right': 'slideInRight 0.3s ease-in-out',
        'slide-in-left': 'slideInLeft 0.3s ease-in-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        }
      },
      height: {
        screen: '100vh',
        min: 'min-content',
        max: 'max-content',
        fit: 'fit-content'
      },
      minHeight: {
        0: '0px',
        full: '100%',
        screen: '100vh',
        min: 'min-content',
        max: 'max-content',
        fit: 'fit-content'
      },
      maxHeight: {
        full: '100%',
        screen: '100vh',
        min: 'min-content',
        max: 'max-content',
        fit: 'fit-content'
      },
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
      }
    }
  },
  plugins: []
}
