"use client";
import { redirect } from "next/navigation";
import useCurrentUser from "@/hooks/useCurrentUser";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useCurrentUser();
  useEffect(() => {
    if (!loading) if (!user) redirect("/login");
  }, [user, loading]);

  if (loading)
    return (
      <div className="grid w-full h-screen place-items-center">
        <h1>Loading</h1>
      </div>
    );
  if (!user)
    return (
      <div className="grid w-full h-screen place-items-center">
        <h1>Redirecting...</h1>
      </div>
    );
  return children;
}
