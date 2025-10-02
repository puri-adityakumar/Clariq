import localFont from "next/font/local";

// Centralized font loading using local fonts from public/fonts directory
// Heading Font: Karla, Body Font: Inconsolata, Logo/Brand Font: Unica One

export const karla = localFont({
  src: [
    {
      path: "../public/fonts/Karla-VariableFont_wght.ttf",
      weight: "400 700",
      style: "normal",
    },
    {
      path: "../public/fonts/Karla-Italic-VariableFont_wght.ttf", 
      weight: "400 700",
      style: "italic",
    },
  ],
  variable: "--font-karla",
  display: "swap",
});

export const inconsolata = localFont({
  src: "../public/fonts/Inconsolata-VariableFontt.ttf",
  variable: "--font-inconsolata", 
  display: "swap",
});

export const unicaOne = localFont({
  src: "../public/fonts/UnicaOne-Regular.ttf",
  weight: "400",
  variable: "--font-unica-one",
  display: "swap",
});

export const fontClasses = [
  karla.variable,
  inconsolata.variable,
  unicaOne.variable,
].join(" ");
