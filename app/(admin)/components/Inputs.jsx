"use client";
export const InputType = ({ Label, Type, Placeholder, Ref }) => {
  return (
    <label className="block">
      <span>{Label}</span>
      <input
        type={Type}
        className="block w-full mt-1 text-white placeholder:text-white/40 form-input bg-white/30 backdrop-blur-sm"
        placeholder={Placeholder}
        ref={Ref}
      />
    </label>
  );
};
export const TextArea = ({ Label, Placeholder, Ref }) => {
  return (
    <label className="block">
      <span>{Label}</span>
      <textarea
        className="block w-full mt-1 text-white placeholder:text-white/40 form-input bg-white/30 backdrop-blur-sm"
        rows="5"
        placeholder={Placeholder}
        ref={Ref}
      />
    </label>
  );
};
