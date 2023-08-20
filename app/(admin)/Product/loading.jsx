"use client";
import Spnr from "../components/Spnr";

export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="grid min-h-screen place-items-center">
      <Spnr scale={3} bgcolor={"#575757"} color={"#646ce8"} />
    </div>
  );
}
