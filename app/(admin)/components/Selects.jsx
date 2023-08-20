"use client";

const deleteByIndex = (func, index) =>
  func((oldValues) => oldValues.filter((_, i) => i !== index));

const AddValToUseState = (func, val) =>
  func((oldValues) => [...oldValues, val]);

const deleteByValandProp = (func, val, prop) =>
  func((oldValues) => {
    let tempVal = oldValues.filter((x) => x[prop] === val)[0]?.images;
    tempVal?.map((k) => URL.revokeObjectURL(k.Url));
    return oldValues.filter((x) => x[prop] !== val);
  });

export const SelectColor = ({
  Val,
  Colors,
  Label,
  setShow,
  setColors,
  setVal,
  setCurrentColorGroup,
}) => {
  return (
    <fieldset className="block">
      <div className="flex justify-between w-full">
        <legend>{Label}</legend>
        <button type="button" onClick={() => console.log(localStorage.clear())}>
          Reset Colors
        </button>
      </div>
      <div className="flex justify-center items-center pt-3 pb-2 px-3 border-t-[1.5px] w-full ">
        <span className="pr-6">Add color</span>
        <button
          type="button"
          onClick={() => setShow(true)}
          className="h-8 w-8 blur-[1px] bg-gradient-to-br from-red-800 via-blue-600 to-green-600 my-auto rounded-md"
        />
      </div>
      <ul className="mt-2 transition-all relative grid grid-cols-2 w-full border-t-[1.5px]  min-h-[8rem]">
        {!Colors.length && (
          <div className="absolute inset-0 grid w-full h-full place-items-center">
            <span>Loading Colors ...</span>
          </div>
        )}
        {Colors?.map((obj, index) => (
          <li
            key={`Color${index}`}
            className="py-2 px-3 w-full flex justify-between border-b-[1.5px] odd:border-r-0 "
          >
            <label className="inline-flex items-center">
              <input
                className="rounded-md form-checkbox bg-white/60"
                onChange={(o) =>
                  o.target.checked
                    ? AddValToUseState(setVal, {
                        Name: obj.Name,
                        Color: obj.Color,
                        images: [],
                        Sizes: [],
                      })
                    : (setCurrentColorGroup((e) => ({ ...e, Color: 0 })),
                      deleteByValandProp(setVal, obj.Name, "Name"))
                }
                checked={Val.filter((d) => d.Name === obj.Name)[0] || false}
                type="checkbox"
              />
              <span className="flex">
                <div className="flex">
                  <div
                    style={{ backgroundColor: obj.Color }}
                    className="mr-2 ml-3 h-4 w-4 border-[1.5px] border-black my-auto rounded-full"
                  />
                </div>
                {obj.Name}
              </span>
            </label>
            <button
              type="button"
              onClick={() => (
                deleteByIndex(setColors, index),
                deleteByValandProp(setVal, obj.Name, "Name")
              )}
              className="px-3 py-1 font-bold text-white scale-50 bg-red-600 rounded-full"
            >
              X
            </button>
          </li>
        ))}
      </ul>
    </fieldset>
  );
};

// Break

const deletValInArrayInObjectInUseState = (func, val, index) =>
  func((oldVal) => {
    let tempObj = oldVal[index];
    let x = tempObj.Sizes;
    x.splice(x.indexOf(x.filter((j) => j.Name === val)[0]), 1);
    return oldVal.map((k, i) => (i === index ? tempObj : k));
  });

const addValToArrayInObjectInUseState = (func, val, index) =>
  func((oldVal) =>
    oldVal.map((k, i) => (i === index ? { ...k, Sizes: [...k.Sizes, val] } : k))
  );

export const Select = ({
  arr,
  setVal,
  Val,
  CurrentColorGroup,
  setCurrentColorGroup,
}) => {
  return (
    <fieldset className="block">
      <ul className="mt-2 grid grid-cols-2 border-t-[1.5px] ">
        {arr?.map((obj, index) => (
          <li key={`Size${index}`} className="py-2 px-3 border-b-[1.5px] ">
            <label className="inline-flex items-center">
              <input
                className="rounded-md form-checkbox bg-white/60"
                onChange={(o) =>
                  o.target.checked
                    ? addValToArrayInObjectInUseState(
                        setVal,
                        {
                          Name: obj.Name,
                          Price: { OG: 0, OFFER: 0 },
                        },
                        CurrentColorGroup.Color
                      )
                    : (setCurrentColorGroup((e) => ({ ...e, Size: 0 })),
                      deletValInArrayInObjectInUseState(
                        setVal,
                        obj.Name,
                        CurrentColorGroup.Color
                      ))
                }
                type="checkbox"
                checked={
                  Val[CurrentColorGroup.Color]?.Sizes.filter(
                    (l) => l.Name === obj.Name
                  )[0]
                    ? true
                    : false
                }
              />
              <span className="flex ml-2">{obj.Name}</span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
};
