"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import Nav from "@/components/Nav";

export default function RootLayout({ children }) {
  return (
    <html className="dark" lang="en">
      <head>
        <title>CMS</title>
      </head>
      <body className="relative">
        <ProtectedRoute>
          <div className="fixed z-50 w-full">
            <Nav />
          </div>
          <div className="py-24">{children}</div>
        </ProtectedRoute>
      </body>
    </html>
  );
}
