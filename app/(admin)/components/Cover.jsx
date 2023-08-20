"use client";
export default function Cover({ Message }) {
  return (
    <div className="absolute z-10 w-full h-full overflow-hidden rounded-md">
      <div className="absolute w-full h-full border-2 border-gray-100 pointer-events-none bg-neutral-950 bg-opacity-40 blur-xl backdrop-blur-[0.5px]" />
      <div className="absolute grid w-full h-full text-white pointer-events-none place-items-center">
        {Message}
      </div>
    </div>
  );
}
