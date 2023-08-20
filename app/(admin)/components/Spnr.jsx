"use client";
export default function Spnr({ scale, color, bgcolor }) {
  return (
    <div
      style={{
        scale: scale,
        borderColor: `${color} ${bgcolor} ${bgcolor} ${bgcolor}`,
      }}
      className="w-8 border-4 rounded-full animate-spin aspect-square"
    />
  );
}
