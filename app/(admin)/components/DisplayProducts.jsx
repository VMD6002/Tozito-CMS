"use client";
import { db } from "@/Firebase/firebase";
import deleteFolder from "@/hooks/deleteFolder";
import { deleteDoc, doc } from "firebase/firestore";
import { Carousel } from "flowbite-react";
import { Suspense } from "react";
import { BsArrowLeftCircleFill } from "react-icons/bs";

export default function DisplayProducts({
  Products,
  Gender,
  setProducts,
  Type,
}) {
  return (
    <div className="relative grid w-11/12 max-w-4xl gap-4 pt-10 md:grid-cols-2 place-items-center">
      <Suspense fallback={<h1>Loading ..</h1>}>
        {Products[Gender].map((g, index) => {
          let sizes = [];
          g.AvaColors.map((f) => (sizes = [...sizes, ...f.Sizes]));
          sizes = [...new Set(sizes)];
          return (
            <div
              key={`${g.ProductName}-${index}`}
              className="min-h-[18rem] rounded-lg relative grid w-full overflow-hidden bg-white/5"
            >
              <button
                type="button"
                onClick={() => {
                  // Delete main doc
                  deleteDoc(doc(db, `${Type}${Gender}/${g.id}`));
                  deleteFolder(`${Type}${Gender}/${g.id}`);
                  // Delete all the available color docs
                  g.AvaColors.map((h) =>
                    deleteDoc(
                      doc(
                        db,
                        `${Type}${Gender}/${g.id}/${Gender}${Type}Data/${h.Name}`
                      )
                    )
                  );
                  setProducts((f) => {
                    const mutval = { ...f };
                    mutval[Gender] = mutval[Gender].filter(
                      (_, i) => i !== index
                    );
                    return mutval;
                  });
                }}
                className="absolute z-10 p-2 text-white bg-red-600 bg-opacity-20 rounded-br-lg backdrop-blur-[3px]"
              >
                Delete 🗑️
              </button>
              <div className="w-full h-full min-h-[14rem]">
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
                  {g.images.map((h, i) => (
                    <div
                      key={`${g.ProductName}-${g.Name}-${i}`}
                      className="relative grid w-full border-b-[0.2rem] border-white/10 h-full place-items-center"
                    >
                      <img
                        className="absolute z-10 object-contain h-full w-fit min-w-[50%] bg-white/10"
                        src={h}
                      />
                    </div>
                  ))}
                </Carousel>
              </div>
              <div className="grid text-white place-items-center">
                <div className="flex items-center justify-between w-11/12 p-2 text-3xl font-semibold ">
                  <div>
                    <h1>{g.ProductName}</h1>
                    <span className="mr-3 text-lg">
                      ₹{g.Sizes[0]?.Price.OFFER}
                    </span>
                    <span className="text-lg line-through text-neutral-300">
                      ₹{g.Sizes[0]?.Price.OG}
                    </span>
                  </div>
                  <div
                    style={{ backgroundColor: `${g.Color}` }}
                    className="h-8 rounded-full aspect-square"
                  />
                </div>
                <div className="w-full py-4 break-all">
                  <p className="h-32 px-8 overflow-y-scroll fade">
                    {g.Description}
                  </p>
                </div>
                <div className="grid w-full py-4 place-items-center">
                  <h3 className="w-11/12 px-3 text-2xl font-semibold">
                    Colors
                  </h3>
                  <div className="grid w-11/12 grid-cols-4 gap-1 p-2 place-items-center">
                    {g.AvaColors.map((d) => (
                      <div
                        key={`${g.ProductName}-Color-${d.Name}`}
                        style={{ backgroundColor: `${d.Color}` }}
                        className="w-full h-10 bg-black rounded-lg"
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between w-11/12 py-4">
                  <h3 className="w-full px-3 text-xl font-semibold">
                    All-Sizes
                  </h3>
                  <div className="grid grid-cols-4 p-2 pr-4 text-lg gap-11 w-fit place-items-center">
                    {sizes.map((v) => (
                      <div
                        key={`${g.ProductName}-Size-${v}`}
                        className="grid w-14 bg-white/10 place-items-center aspect-square"
                      >
                        <span>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </Suspense>
    </div>
  );
}
