"use client";
import { useCallback, useEffect, useRef, useState } from "react";
// Icons
import { RiTShirt2Fill, RiErrorWarningFill } from "react-icons/ri";
import { AiOutlineDown, AiOutlineUp, AiFillCheckCircle } from "react-icons/ai";
import { BiMaleSign, BiFemaleSign } from "react-icons/bi";
// Tailwind Flowbite (Used for Modal in this site)
import { Modal } from "flowbite-react";
// 3rd Party Libreries
import { HexColorPicker } from "react-colorful";
import imageCompression from "browser-image-compression";
// Custom Components
import { InputType, TextArea } from "../../components/Inputs";
import { SelectColor, Select } from "../../components/Selects";
import Cover from "../../components/Cover";
import Spnr from "../../components/Spnr";
// Default Datas
import Data from "../Data";
// Firebase
import { db, storage, timestamp } from "@/Firebase/firebase";
import { setDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useSearchParams } from "next/navigation";

const AllSizes = Data.AllSizes;
const AllColors = Data.AllColors;

// Upload Files
async function uploadFiles(fileBlobs, Path) {
  const uploadPromises = fileBlobs.map(async (fileBlob, index) => {
    const fileRef = ref(storage, `${Path}/${index}`);
    await uploadBytes(fileRef, fileBlob);
    return getDownloadURL(fileRef);
  });

  const downloadURLs = await Promise.all(uploadPromises);
  return downloadURLs;
}

// This function is run on every image to compress and resize it
const ProccessImage = async (imageFile) => {
  const options = {
    maxSizeMB: 0.05,
    maxWidthOrHeight: 600,
    useWebWorker: true,
    fileType: "image/webp",
  };
  try {
    const compressedFile = await imageCompression(imageFile, options);
    // console.log(compressedFile);
    return {
      Url: URL.createObjectURL(compressedFile),
      file: compressedFile,
    }; // write your own logic
  } catch (error) {
    alert(`There was a problem while proccessing the images. Error : ${error}`);
  }
};

const getStorageValue = (key, defaultValue) => {
  const saved = localStorage.getItem(key);
  const initial = JSON.parse(saved)?.length ? JSON.parse(saved) : defaultValue;
  return initial;
};

export default function Dress() {
  // Stores all the data of the product that is going to be Published
  const DocParams = useSearchParams();
  const Gender = DocParams.get("g");
  const DocID = DocParams.get("id");
  const Color = DocParams.get("c");
  const [ColorGroup, setColorGroup] = useState([]);
  alert(`Gender: ${Gender}, DocID: ${DocID}, Color: ${Color}`);
  // Stores the curreent Color and size group index
  const [CurrentColorGroup, setCurrentColorGroup] = useState({
    Color: 0,
    Size: 0,
  });

  // Stores the progress data to present to the ui
  const [Uploading, setUploading] = useState({ State: 3, Progress: [] });

  // This Stores the selectable colors (Will be filled on Load. Check useEffect to see how)
  const [Colors, setColors] = useState([]);

  // Used to open up the Modal to add custom Color
  const [showColor, setShowColor] = useState(false);

  // This ref used to get the custom color and add it
  const [CustomColor, setCustomColor] = useState("#807c8b");

  // Refs Used to
  const CustomColorName = useRef();
  const ProductNameRef = useRef();
  const DescriptionRef = useRef();

  // Proccess Image to desired options
  const handleImageChange = useCallback(
    (e) => {
      for (let i = 0; i < e.target.files.length; i++)
        ProccessImage(e.target.files[i]).then((v) => {
          let newVal = [...ColorGroup];
          let x = newVal[CurrentColorGroup.Color].images;
          x.push(v);
          setColorGroup(newVal);
        });
    },
    [setColorGroup, CurrentColorGroup, ColorGroup]
  );

  // This is a very specific function to delete images from a color group
  const deleteByIndexInImgGroup = useCallback(
    (index) => {
      let temp = [...ColorGroup];
      let x = temp[CurrentColorGroup.Color].images;
      x.splice(index, 1);
      setColorGroup(temp);
    },
    [CurrentColorGroup, ColorGroup]
  );

  // Used to swap images in color group
  const UseStateNestedArraySwap = useCallback(
    (index1, index2, prop) => {
      let tempArray = [...ColorGroup];
      let x = tempArray[CurrentColorGroup.Color][prop];
      let temp = x[index1];
      x[index1] = x[index2];
      x[index2] = temp;
      setColorGroup(tempArray);
    },
    [ColorGroup, CurrentColorGroup, setColorGroup]
  );

  // Used to swap Color Groups
  const UseStateArrayObjectSwap = useCallback(
    (index1, index2) => {
      let x = [...ColorGroup];
      let temp = x[index1];
      x[index1] = x[index2];
      x[index2] = temp;
      setColorGroup(x);
    },
    [ColorGroup, setColorGroup]
  );

  const WritingtoPrice = useCallback(
    (val, type) => {
      let temp = [...ColorGroup];
      let x = temp[CurrentColorGroup.Color].Sizes[CurrentColorGroup.Size].Price;
      switch (type) {
        case "OG":
          x.OG = val;
          break;
        case "OFFER":
          x.OFFER = val;
          break;
      }
      setColorGroup(temp);
    },
    [setColorGroup, ColorGroup, CurrentColorGroup]
  );

  useEffect(() => {
    setColors(() => getStorageValue("SavedColors", AllColors));
  }, []);

  useEffect(() => {
    localStorage.setItem("SavedColors", JSON.stringify(Colors));
  }, [Colors]);

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const AvaColors = ColorGroup.map((d) => ({
        Name: d.Name,
        Color: d.Color,
        Sizes: d.Sizes.map((d) => d.Name),
      }));
      const CommonData = {
        ProductName: ProductNameRef.current.value,
        Description: DescriptionRef.current.value,
        AvaColors: AvaColors,
        createdAt: timestamp(),
      };
      setUploading(() => {
        let temp = ColorGroup.map((g) => ({
          Name: g.Name,
          Color: g.Color,
          Progress: 0,
        }));
        return { State: 0, Progress: temp };
      });
      const MainDocRef = doc(db, `DressMen/${DocID}`);
      ColorGroup.map((k, i) => {
        let DocRef = doc(db, `DressMen/${DocID}/MenDressData/${k.Name}`);
        let temp = {
          ...k,
          ...CommonData,
        };
        setUploading((e) => {
          let temp = { ...e };
          temp.Progress[i].Progress = 1;
          return temp;
        });
        let tempImages = k.images.map((k) => k.file);
        let blobUrls = k.images.map((k) => k.Url);
        console.log(blobUrls);
        try {
          console.log(`Uploading ${k.Name}'s Images `);
          uploadFiles(tempImages, `DressMen/${DocID}/${k.Name}`).then((e) => {
            temp.images = e;
            console.log(temp.images);
            console.log(`Creating ${k.Name}'s Document`);
            setDoc(DocRef, temp);
            if (!i) {
              setDoc(MainDocRef, temp);
            }
            setUploading((e) => {
              let temp = { ...e };
              temp.Progress[i].Progress = 2;
              return temp;
            });
            console.log(`Finished uploading ${k.Name}'s document`);
            blobUrls.map((h) => URL.revokeObjectURL(h));
          });
        } catch (err) {
          setUploading((e) => {
            let temp = { ...e };
            temp.Progress[i].Progress = 3;
            return temp;
          });
          console.log(`There was an error uploading ${k.Name}'s document`);
          alert(err.message);
        }
      });
      ProductNameRef.current.value = " ";
      DescriptionRef.current.value = " ";
      console.log("Whaat");
      setUploading((g) => ({ ...g, State: 1 }));
      setColorGroup([]);
    },
    [ColorGroup, setUploading, setColorGroup]
  );

  return (
    <div className="grid place-items-center">
      <Modal
        className="min-h-screen"
        show={showColor}
        onClose={() => setShowColor(false)}
      >
        <Modal.Header>Select Color</Modal.Header>
        <Modal.Body>
          <div className="grid w-11/12 m-auto sm:grid-cols-2 place-items-center">
            <div className="grid place-items-center">
              <HexColorPicker color={CustomColor} onChange={setCustomColor} />
            </div>
            <div className="grid h-full mt-6 sm:my-auto place-items-center">
              <div className="space-y-2 text-center">
                <label className="text-xl text-white">Color Name</label>
                <input
                  ref={CustomColorName}
                  type="text"
                  className="w-11/12 text-center rounded-md"
                  placeholder="eg: Tellow Sky Green"
                />
              </div>
              <div className="grid w-11/12 my-3 space-y-2 text-center">
                <label className="text-xl text-white">Color</label>
                <div className="flex overflow-hidden">
                  <div className="w-6/12 px-3 py-2 text-center bg-white">
                    {CustomColor}
                  </div>
                  <div
                    className="w-6/12 h-full"
                    style={{ backgroundColor: CustomColor }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={() =>
              setColors((oldvals) => [
                ...oldvals,
                {
                  Name: CustomColorName.current.value,
                  Color: `${CustomColor}`,
                },
              ])
            }
            className="px-5 py-2 m-auto bg-indigo-200 rounded-md"
          >
            Add Color
          </button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={!Uploading.State || Uploading.State === 1}
        onClose={() => setUploading((g) => ({ ...g, State: 3 }))}
        className="min-h-screen"
      >
        {Boolean(Uploading.State) && (
          <Modal.Header>Uploading Proccess Complete</Modal.Header>
        )}
        <Modal.Body className={Uploading.State && "opacity-50"}>
          <div
            className={
              "flex items-center justify-between w-full text-xl text-white " +
              (Uploading.State && "opacity-50")
            }
          >
            <h1>Uploading Product Data ....</h1>
            {!Uploading.State ? (
              <Spnr scale={1} color={"#4099ed"} bgcolor={"#999999"} />
            ) : (
              <Spnr scale={1} color={"#999999"} bgcolor={"#999999"} />
            )}
          </div>
          <div className="w-full h-[2px] my-4 bg-gray-400 rounded-full" />
          {Uploading.Progress.map((d, s) => (
            <div
              key={s}
              className="flex items-center justify-between mt-3 text-white opacity-100"
            >
              <h2>{d.Name}</h2>
              {!d.Progress && (
                <Spnr scale={0.7} color={"#999999"} bgcolor={"#999999"} />
              )}
              {d.Progress === 1 && (
                <Spnr scale={0.7} color={"#4099ed"} bgcolor={"#999999"} />
              )}
              {d.Progress === 2 && (
                <div className="text-xl text-green-500">
                  <AiFillCheckCircle />
                </div>
              )}
              {d.Progress === 3 && (
                <div className="text-xl text-red-500">
                  <RiErrorWarningFill />
                </div>
              )}
            </div>
          ))}
        </Modal.Body>
      </Modal>
      <form onSubmit={(e) => onSubmit(e)} className="w-11/12 max-w-4xl">
        <div className="py-8 bg-white">
          <div className="flex justify-between w-11/12 m-auto text-4xl">
            <h1>Update Dress</h1>
            <div className="grid p-1 text-white bg-blue-500 rounded-full w-13 aspect-square place-items-center">
              <BiMaleSign />
            </div>
          </div>
          <div className="grid items-start w-11/12 grid-cols-1 gap-6 m-auto my-8 text-left md:grid-cols-2">
            <div className="grid grid-cols-1 gap-6">
              <InputType
                Label={"Product Name"}
                Type={"text"}
                Placeholder={"Janki Manki Shirt"}
                Ref={ProductNameRef}
              />
              <TextArea
                Label={"Description"}
                Placeholder={
                  "Janki Manki shirt is one of our special products, being made of the finnest monkey cotton, painfully extracted from their skins."
                }
                Ref={DescriptionRef}
              />
            </div>
            <div className="grid grid-cols-1 gap-6 mt-6 md:m-0">
              <SelectColor
                Val={ColorGroup}
                setVal={setColorGroup}
                setCurrentColorGroup={setCurrentColorGroup}
                Colors={Colors}
                setColors={setColors}
                Label="Available Colors"
                setShow={setShowColor}
              />
            </div>
          </div>
          <div className="w-10/12 h-1 m-auto bg-neutral-500" />
          <div className="grid items-start w-11/12 grid-cols-1 gap-6 m-auto my-8 text-left md:grid-cols-2">
            <div>
              <legend>Select Current Color Group</legend>
              <div className="relative min-h-[8rem] grid h-full place-items-center">
                {!ColorGroup.length && (
                  <div className="relative w-full mt-2 h-[8rem]">
                    <Cover
                      Message={"Pls Select Some Colors"}
                      Color={"#f2ef91"}
                    />
                  </div>
                )}
                <div className="grid w-full grid-cols-3 gap-1 mt-4 overflow-hidden place-items-center rounded-xl h-fit">
                  {ColorGroup?.map((j, index) => (
                    <div
                      key={`Selected-Colors-${index}`}
                      className="grid w-full grid-flow-col overflow-hidden font-bold text-white rounded-md bg-neutral-600 h-fit place-items-center"
                    >
                      {!!index && (
                        <button
                          onClick={() =>
                            UseStateArrayObjectSwap(index, index - 1)
                          }
                          type="button"
                          className="w-full"
                        >
                          {"<"}
                        </button>
                      )}
                      <button
                        key={`Color-${index}`}
                        type="button"
                        onClick={() =>
                          setCurrentColorGroup((g) => ({
                            Size: 0,
                            Color: index,
                          }))
                        }
                        className={
                          "py-2 w-full " +
                          (index === CurrentColorGroup.Color
                            ? "bg-neutral-400"
                            : "bg-neutral-200")
                        }
                      >
                        <div
                          style={{ backgroundColor: j.Color }}
                          className="w-4 h-4 m-auto my-auto border-2 border-black rounded-full"
                        />
                      </button>
                      {index + 1 !== ColorGroup.length && (
                        <button
                          onClick={() =>
                            UseStateArrayObjectSwap(index, index + 1)
                          }
                          type="button"
                          className="w-full"
                        >
                          {">"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="relative mb-8">
              <legend className="mb-2">Available Sizes</legend>
              {!ColorGroup.length && (
                <Cover Message={"No color Selected"} Color={"#f2ef91"} />
              )}
              <div className="w-full h-full">
                <Select
                  arr={AllSizes}
                  setVal={setColorGroup}
                  Val={ColorGroup}
                  CurrentColorGroup={CurrentColorGroup}
                  setCurrentColorGroup={setCurrentColorGroup}
                />
              </div>
            </div>
          </div>
          <div className="w-10/12 h-1 m-auto bg-neutral-500" />
          <div className="relative w-11/12 m-auto my-8">
            {!ColorGroup.length && <Cover Message={"No Colors Selected yet"} />}
            <div
              onDrop={handleImageChange}
              className="relative grid m-auto text-gray-400 border border-dashed rounded border-gray-950"
            >
              <input
                accept="image/*"
                type="file"
                onChange={handleImageChange}
                onDrop={handleImageChange}
                multiple
                className="absolute w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center py-10 text-center text-black">
                <RiTShirt2Fill />
                <p className="m-0 mt-4">
                  Drag and Drop or click to add Product Images
                </p>
              </div>
            </div>
            <div className="grid py-4 m-auto text-center place-items-center bg-slate-100">
              {!ColorGroup[CurrentColorGroup.Color]?.images.length && (
                <span className="w-full text-neutral-500 py-7">
                  Please add the Product Images
                </span>
              )}
              <div className="grid w-full gap-3 px-3 sm:grid-cols-2">
                {ColorGroup[CurrentColorGroup.Color]?.images.map(
                  (OBJ, index) => (
                    <div
                      key={`${
                        ColorGroup[CurrentColorGroup.Color].Name
                      }-Image-${index}`}
                      className="w-full h-full m-auto overflow-hidden bg-repeat rounded-lg shadow-xl"
                      style={{ backgroundImage: `url(${OBJ.Url})` }}
                    >
                      <div className="relative grid w-full h-full bg-white/20 place-items-center backdrop-filter backdrop-blur-sm">
                        <div className="absolute top-0 left-0 flex justify-between w-full text-white">
                          <div className="overflow-hidden rounded-br-lg">
                            {!!index && (
                              <button
                                type="button"
                                onClick={() =>
                                  UseStateNestedArraySwap(
                                    index,
                                    index - 1,
                                    "images"
                                  )
                                }
                                className="block p-2 bg-gray-700 border-gray-400"
                              >
                                <AiOutlineUp />
                              </button>
                            )}
                            {index + 1 !==
                              ColorGroup[CurrentColorGroup.Color].images
                                .length && (
                              <button
                                type="button"
                                onClick={() =>
                                  UseStateNestedArraySwap(
                                    index,
                                    index + 1,
                                    "images"
                                  )
                                }
                                className="p-2 bg-gray-500"
                              >
                                <AiOutlineDown />
                              </button>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => (
                              deleteByIndexInImgGroup(index),
                              URL.revokeObjectURL(OBJ.Url)
                            )}
                            className="px-3 py-1 font-bold text-white bg-red-600 h-fit rounded-bl-md"
                          >
                            X
                          </button>
                        </div>
                        <img
                          className="object-contain w-full m-auto"
                          src={OBJ.Url}
                          alt={`image-${index}`}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
          <div className="w-10/12 h-1 m-auto bg-neutral-500" />
          <div className="relative grid w-11/12 gap-6 m-auto my-8 text-left md:grid-cols-2">
            {!ColorGroup[CurrentColorGroup.Color]?.Sizes.length && (
              <Cover Message={"No Sizes Selected"} Color={"#f2ef91"} />
            )}
            <div>
              <h3 className="mb-3 h-fit">Select Current Size Group</h3>
              <div className="grid w-full grid-cols-3 gap-1">
                {ColorGroup[CurrentColorGroup.Color]?.Sizes.map((k, index) => (
                  <div
                    key={`Selected-Colors-${index}`}
                    className="grid grid-flow-col overflow-hidden font-bold text-white rounded-md bg-neutral-600 h-fit place-items-center"
                  >
                    {!!index && (
                      <button
                        onClick={() =>
                          UseStateNestedArraySwap(index, index - 1, "Sizes")
                        }
                        type="button"
                        className="w-full"
                      >
                        {"<"}
                      </button>
                    )}
                    <button
                      key={`Size-${index}`}
                      type="button"
                      onClick={() =>
                        setCurrentColorGroup((g) => ({ ...g, Size: index }))
                      }
                      className={
                        "py-2 w-full " +
                        (index === CurrentColorGroup.Size
                          ? "bg-neutral-400"
                          : "bg-neutral-200")
                      }
                    >
                      <span className="px-2 py-1 text-black bg-white border-2 border-black rounded-full">
                        {k.Name}
                      </span>
                    </button>
                    {index + 1 !==
                      ColorGroup[CurrentColorGroup.Color].Sizes.length && (
                      <button
                        onClick={() =>
                          UseStateNestedArraySwap(index, index + 1, "Sizes")
                        }
                        type="button"
                        className="w-full"
                      >
                        {">"}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid w-full gap-6 p-3 m-auto my-2 text-left bg-gray-100">
              <label className="block">
                <span className="text-gray-700">OG Price</span>
                <input
                  type="number"
                  value={
                    ColorGroup[CurrentColorGroup.Color]?.Sizes[
                      CurrentColorGroup.Size
                    ]?.Price.OG ?? 0
                  }
                  onChange={(g) => WritingtoPrice(g.target.value, "OG")}
                  className="block w-full mt-1 form-input"
                  placeholder="1000 dollas"
                />
              </label>
              <label className="block">
                <span className="text-gray-700">OFFer Price</span>
                <input
                  type="number"
                  onChange={(g) => WritingtoPrice(g.target.value, "OFFER")}
                  value={
                    ColorGroup[CurrentColorGroup.Color]?.Sizes[
                      CurrentColorGroup.Size
                    ]?.Price.OFFER ?? 0
                  }
                  className="block w-full mt-1 form-input"
                  placeholder="100 dollas 90% OFF"
                />
              </label>
            </div>
          </div>
          <div className="flex justify-center w-full">
            <button type="submit" className="px-4 py-2 mt-5 bg-slate-300">
              Submit
            </button>
            <button
              id="tstbtn"
              onClick={() => {
                console.log(
                  ProductNameRef.current.value,
                  DescriptionRef.current.value
                );
              }}
              type="button"
              className="px-4 py-2 mt-5 text-white bg-slate-950"
            >
              Tst
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
