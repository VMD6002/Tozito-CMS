"use client";
import { Navbar } from "flowbite-react";

const VisitNav = () => {
  return (
    <Navbar fluid={true}>
      <div className={"flex m-auto"}>
        <Navbar.Brand href="/">
          <img
            src="/OZITO.png"
            className="h-6 mr-3 rounded-full sm:h-9"
            alt="Flowbite Logo"
          />
          <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
            Tozito CMS
          </span>
        </Navbar.Brand>
      </div>
    </Navbar>
  );
};
export default VisitNav;
