import { type Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import forms from "@tailwindcss/forms";
import aspectRatio from "@tailwindcss/aspect-ratio";
import containerQueries from "@tailwindcss/container-queries";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "2rem",
    },
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
      },
      colors: {
        terracotta: {
          DEFAULT: "#D06B4E",
          foreground: "#111827",
        },
        bone: {
          DEFAULT: "#F5F1EB",
          foreground: "#111827",
        },
        destructive: {
          DEFAULT: "#DC2626",
        },
        offwhite: {
          DEFAULT: "#FDFCF9",
        },
      },
    },
  },
  plugins: [
    typography,
    forms,
    aspectRatio,
    containerQueries,
  ],
} satisfies Config;