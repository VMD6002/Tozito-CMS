"use client";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <>
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>TOZITO CMS</title>
        <meta name="description" content="CMS of Tozito website/app" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      {children}
    </>
  );
}
