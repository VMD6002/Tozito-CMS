"use client";
import VisitNav from "@/components/VisitNav";

export default function RootLayout({ children }) {
  return (
    <html className="dark" lang="en">
      <head>
        <title>Tozito CMS Login</title>
      </head>
      <body>
        <VisitNav />
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
