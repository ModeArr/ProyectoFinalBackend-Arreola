/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui"

module.exports = {
  content: ["./src/views/*.handlebars", "./src/views/layouts/*.handlebars"],
  theme: {
    extend: {},
  },
  plugins: [
    daisyui,
  ],
}

