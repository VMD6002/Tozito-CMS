"use client";
import { useCallback, useEffect, useRef, useState } from "react";
// Icons
import { RiTShirt2Fill } from "react-icons/ri";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai";
import { BiMaleSign, BiFemaleSign } from "react-icons/bi";
// Tailwind Flowbite (Used for Modal in this site)
import { Modal, Carousel } from "flowbite-react";
import imageCompression from "browser-image-compression";
// Custom Components
import Spnr from "../components/Spnr";
import { InputType, TextArea } from "../components/Inputs";
// Firebase
import { db, storage, timestamp } from "@/Firebase/firebase";
import {
  setDoc,
  doc,
  collection,
  getDocs,
  query,
  limit,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid"; // For genrating product Document ids
import deleteFolder from "@/hooks/deleteFolder";
import { BsArrowLeftCircleFill } from "react-icons/bs";

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

export default function Accessories() {
  // Sets the Current Products Gender (used to determin were to write to and fetch data while scrolling)
  const [Gender, setGender] = useState("Men");
  // Stores the products fetched
  const [Products, setProducts] = useState({ Men: [], Women: [] });
  // Stores all the data of the product that is going to be Published
  const [Images, setImages] = useState([]);
  // Stores the progress data to present to the ui
  const [Uploading, setUploading] = useState({ State: 3, Progress: [] });
  const [end, setEnd] = useState(false);
  // Constant Collection Refs used to fetch data
  const MAccCollectionRef = collection(db, `AccessoriesMen`);
  const WAccCollectionRef = collection(db, `AccessoriesWomen`);
  const Mq = query(MAccCollectionRef, limit(3), orderBy("createdAt", "desc"));
  const Wq = query(WAccCollectionRef, limit(3), orderBy("createdAt", "desc"));
  // Refs Used to
  const ProductNameRef = useRef();
  const DescriptionRef = useRef();
  const OgPriceRef = useRef();
  const OfferPriceRef = useRef();

  const handleImageChange = useCallback(
    (e) => {
      for (let i = 0; i < e.target.files.length; i++)
        ProccessImage(e.target.files[i]).then((v) => {
          setImages((j) => [...j, v]);
        });
    },
    [setImages]
  );

  useEffect(() => {
    (async () => {
      await getDocs(Mq).then((data) => {
        let temp = data.docs.map((g) => ({ ...g.data(), id: g.id }));
        setProducts((f) => ({ ...f, Men: temp }));
      });
      await getDocs(Wq).then((data) => {
        let temp = data.docs.map((g) => ({ ...g.data(), id: g.id }));
        setProducts((f) => ({ ...f, Women: temp }));
      });
    })();
  }, []);

  const loadMore = async (val) => {
    const last = Products[Products.length - 1];
    const q = query(
      collection(db, "News"),
      orderBy("createdAt", "desc"),
      startAfter(new Date(last.createdAt)),
      limit(val)
    );
    const res = await getDocs(q);
    const newProducts = res.docs.map((docSnap) => {
      return {
        ...docSnap,
        id: docSnap.id,
      };
    });
    setProducts([...Products, ...newProducts]);
    if (newProducts.length < val) {
      setEnd(true);
    }
  };

  const onSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const min = Math.floor(Math.random() * (3 + 1)) + 0;
      const DocID = uuidv4().slice(min, min + 5);
      const DocRef = doc(db, `Accessories${Gender}/${DocID}`);
      let tempImages = Images.map((k) => k.file);
      let blobUrls = Images.map((k) => k.Url);
      setUploading({ State: 0 });
      let newProduct = {
        ProductName: ProductNameRef.current.value,
        Description: DescriptionRef.current.value,
        OgPrice: OgPriceRef.current.value,
        OfferPrice: OfferPriceRef.current.value,
        createdAt: timestamp(),
        Images: [],
        id: DocID,
      };
      uploadFiles(tempImages, `Accessories${Gender}/${DocID}`).then((e) => {
        newProduct.Images = e;
        console.log(e);
        console.log(`Creating ${ProductNameRef.current.value}'s Document`);
        setDoc(DocRef, newProduct);
        setProducts((g) => {
          let MutVal = { ...g };
          MutVal[Gender] = [newProduct, ...MutVal[Gender]];
          return MutVal;
        });
        setUploading({ State: 1 });
        console.log(
          `Finished uploading ${ProductNameRef.current.value}'s document`
        );
      });
      ProductNameRef.current.value = " ";
      DescriptionRef.current.value = " ";
      OgPriceRef.current.value = " ";
      OfferPriceRef.current.value = " ";
      blobUrls.map((f) => URL.revokeObjectURL(f));
      setImages([]);
      console.log("Whaat");
    },
    [setImages, setUploading, setProducts, Gender, Images]
  );

  const UseStateArraySwap = useCallback(
    (index1, index2) => {
      let x = [...Images];
      let temp = x[index1];
      x[index1] = x[index2];
      x[index2] = temp;
      setImages(x);
    },
    [Images, setImages]
  );

  const deleteByIndexInImgGroup = useCallback(
    (index) => setImages((g) => g.filter((_, i) => i !== index)),
    [setImages]
  );

  return (
    <div className="grid place-items-center">
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
        </Modal.Body>
      </Modal>
      <form
        onSubmit={(e) => onSubmit(e)}
        className="w-11/12 max-w-4xl text-white"
      >
        <div
          className={
            "py-8 " +
            (Gender === "Men"
              ? "bg-gradient-radial from-blue-950 to-gray-700 text-white"
              : "bg-gradient-radial from-pink-950 to-gray-700 text-white")
          }
        >
          <div className="flex justify-between w-11/12 m-auto text-4xl">
            <h1>Deploy Accessories</h1>
            <button
              onClick={() =>
                Gender === "Men" ? setGender("Women") : setGender("Men")
              }
              type="button"
              className={
                "grid p-1 text-white rounded-full w-13 aspect-square place-items-center " +
                (Gender === "Men" ? "bg-blue-500" : "bg-pink-400")
              }
            >
              {Gender === "Men" ? <BiMaleSign /> : <BiFemaleSign />}
            </button>
          </div>
          <div className="grid items-start w-11/12 grid-cols-1 gap-6 m-auto my-8 text-left md:grid-cols-2">
            <div className="grid grid-cols-1 gap-6 mb-8">
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
            <div className="grid grid-cols-1 gap-6">
              <InputType
                Label={"Product Name"}
                Type={"number"}
                Placeholder={"1000"}
                Ref={OgPriceRef}
              />
              <InputType
                Label={"Product Name"}
                Type={"number"}
                Placeholder={"100"}
                Ref={OfferPriceRef}
              />
            </div>
          </div>
          <div className="relative w-11/12 m-auto my-8">
            <div
              onDrop={handleImageChange}
              className="relative grid m-auto text-gray-400 border border-dashed rounded bg-white/60 backdrop-blur-sm"
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
            <div className="grid py-4 m-auto text-center place-items-center">
              {!Images.length && (
                <span className="w-full py-7">
                  Please add the Product Images
                </span>
              )}
              <div className="grid w-full gap-3 px-3 sm:grid-cols-2">
                {Images.map((OBJ, index) => (
                  <div
                    key={`Image-${index}`}
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
                                UseStateArraySwap(index, index - 1)
                              }
                              className="block p-2 bg-gray-700 border-gray-400"
                            >
                              <AiOutlineUp />
                            </button>
                          )}
                          {index + 1 !== Images.length && (
                            <button
                              type="button"
                              onClick={() =>
                                UseStateArraySwap(index, index + 1)
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
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-center w-full">
            <button type="submit" className="px-4 py-2 mt-5 bg-white/30">
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
      <div className="relative grid w-11/12 max-w-4xl gap-4 pt-10 md:grid-cols-2 place-items-center">
        {Products[Gender].map((g, index) => (
          <div
            key={`${g.ProductName}-${index}`}
            className="min-h-[18rem] relative grid w-full overflow-hidden bg-slate-600"
          >
            <button
              type="button"
              onClick={() => {
                // Delete main doc
                deleteDoc(doc(db, `Accessories${Gender}/${g.id}`));
                deleteFolder(`Accessories${Gender}/${g.id}`);
                // Delete all the available color docs
                setProducts((f) => {
                  const mutval = { ...f };
                  mutval[Gender] = mutval[Gender].filter((_, i) => i !== index);
                  return mutval;
                });
              }}
              className="absolute z-10 p-2 text-white bg-red-500 rounded-br-lg backdrop-blur-[3px] bg-opacity-80"
            >
              Delete 🗑️
            </button>
            <div className="w-full h-full border-slate-700  border-4 min-h-[14rem]">
              <Carousel
                slide={false}
                leftControl={
                  <div className="text-3xl text-white bg-black border-2 rounded-full">
                    <BsArrowLeftCircleFill />
                  </div>
                }
                rightControl={
                  <div className="text-3xl text-white bg-black border-2 rounded-full -scale-x-100">
                    <BsArrowLeftCircleFill />
                  </div>
                }
              >
                {g.Images.map((h, i) => (
                  <div
                    key={`${g.ProductName}-${g.Name}-${i}`}
                    className="relative grid w-full h-full place-items-center"
                    style={{
                      backgroundImage: `url(${h})`,
                    }}
                  >
                    <img
                      src={h}
                      className="absolute z-10 object-contain h-full border-x-4 w-fit"
                    />
                    <div className="absolute w-full h-full bg-white/10 backdrop-blur-sm" />
                  </div>
                ))}
              </Carousel>
            </div>
            <div className="grid text-white place-items-center bg-slate-700">
              <div className="flex items-center justify-between w-11/12 p-2 text-3xl font-semibold ">
                <div>
                  <h1>{g.ProductName}</h1>
                  <span className="mr-3 text-lg">₹{g.OgPrice}</span>
                  <span className="text-lg line-through text-neutral-300">
                    ₹{g.OfferPrice}
                  </span>
                </div>
              </div>
              <div className="w-full py-4 break-all">
                <p className="h-32 px-8 overflow-y-scroll fade">
                  {g.Description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
// ProductName: ProductNameRef.current.value,
// Description: DescriptionRef.current.value,
// OgPrice: OgPriceRef.current.value,
// OfferPrice: OfferPriceRef.current.value,
// createdAt: timestamp(),
// Images: [],
