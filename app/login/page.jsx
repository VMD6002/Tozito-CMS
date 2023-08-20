"use client";
import { auth } from "@/Firebase/firebase";
import { useEffect, useRef } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import useCurrentUser from "@/hooks/useCurrentUser";
import { redirect } from "next/navigation";

export default function Home() {
  const EmailRef = useRef();
  const PasswordRef = useRef();
  const { loading, user } = useCurrentUser();
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(
        auth,
        EmailRef.current.value,
        PasswordRef.current.value
      ).then(() => {
        redirect("/");
      });
    } catch (err) {
      console.log(err.message);
    }
  };

  useEffect(() => {
    if (!loading) if (user) redirect("/");
  }, [loading, user]);

  if (loading)
    return (
      <div className="grid w-full h-screen place-items-center">
        <h1>Loading...</h1>
      </div>
    );
  if (user)
    return (
      <div className="grid w-full h-screen place-items-center">
        <h1>Redirecting...</h1>
      </div>
    );

  return (
    <main className="grid min-h-screen place-items-center">
      <form onSubmit={(e) => onSubmit(e)}>
        <div className="flex max-w-sm mx-auto overflow-hidden rounded-lg shadow-lg dark:bg-slate-800 dark:text-white">
          <div className="w-full p-8">
            <h1 className="text-4xl font-semibold text-center">Login</h1>
            <div className="mt-4">
              <label className="block mb-2 text-sm font-bold">
                Email Address
              </label>
              <input
                className="block w-full px-4 py-2 text-black bg-gray-200 border border-gray-300 rounded appearance-none focus:outline-none focus:shadow-outline"
                type="email"
                required={true}
                ref={EmailRef}
              />
            </div>
            <div className="mt-4">
              <div className="flex justify-between">
                <label className="block mb-2 text-sm font-bold">Password</label>
              </div>
              <input
                className="block w-full px-4 py-2 text-black bg-gray-200 border border-gray-300 rounded appearance-none focus:outline-none focus:shadow-outline"
                type="password"
                required={true}
                ref={PasswordRef}
              />
            </div>
            <div className="mt-8">
              <button className="w-full px-4 py-2 font-bold text-white bg-gray-600 rounded hover:bg-gray-700">
                Submit
              </button>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
