/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");

module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.tsx", "./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  corePlugins: {
    space: false,
  },
  theme: {
    // NOTE to AI: You can extend the theme with custom colors or styles here.
    extend: {
      colors: {
        // Workly brand colors - vibrant royal blue theme matching the app icon
        workly: {
          accent: '#2979FF',           // Vibrant royal blue (primary CTA)
          'accent-light': '#82B1FF',   // Light blue highlight
          'accent-dark': '#1565C0',    // Deep navy blue (from icon bg)
          'bg-dark': '#0D1B3E',        // Deep navy background
          'bg-card': '#0F2152',        // Rich blue card background
          'bg-input': '#163068',       // Blue input background
          border: '#1E3A7A',           // Blue border
          // Keep teal as secondary for backwards compatibility
          teal: '#2979FF',
          'teal-light': '#82B1FF',
          'teal-dark': '#1565C0',
          // Additional palette
          sky: '#5C9BFF',              // Sky blue for secondary elements
          muted: '#7BA7E0',            // Muted blue for secondary text
          // Blue-toned replacements for grey/slate
          'text-dim': '#7BA7E0',       // Replaces slate-400 (dim text)
          'text-subtle': '#4A6FA5',    // Replaces slate-500/600 (subtle text)
          'icon-dim': '#4A6FA5',       // Replaces grey icons
        },
      },
      fontSize: {
        xs: "10px",
        sm: "12px",
        base: "14px",
        lg: "18px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        "4xl": "40px",
        "5xl": "48px",
        "6xl": "56px",
        "7xl": "64px",
        "8xl": "72px",
        "9xl": "80px",
      },
    },
  },
  darkMode: "class",
  plugins: [
    plugin(({ matchUtilities, theme }) => {
      const spacing = theme("spacing");

      // space-{n}  ->  gap: {n}
      matchUtilities(
        { space: (value) => ({ gap: value }) },
        { values: spacing, type: ["length", "number", "percentage"] }
      );

      // space-x-{n}  ->  column-gap: {n}
      matchUtilities(
        { "space-x": (value) => ({ columnGap: value }) },
        { values: spacing, type: ["length", "number", "percentage"] }
      );

      // space-y-{n}  ->  row-gap: {n}
      matchUtilities(
        { "space-y": (value) => ({ rowGap: value }) },
        { values: spacing, type: ["length", "number", "percentage"] }
      );
    }),
  ],
};

