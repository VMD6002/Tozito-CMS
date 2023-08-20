"use client";
import { Navbar, Dropdown, Avatar } from "flowbite-react";
import Link from "next/link";
import { auth } from "@/Firebase/firebase";

const NavRoutes = [
  { Name: "Dash", Route: "/" },
  { Name: "Dress", Route: "/Product?type=Dress" },
  { Name: "Shoe", Route: "/Product?type=Shoe" },
  { Name: "Accessories", Route: "/Accessories" },
  { Name: "Custom_Dress", Route: "/CustomDress", dis: true },
  { Name: "Custom_Shoes", Route: "/CustomShoes", dis: true },
];

const Nav = () => {
  const user = auth.currentUser;
  return (
    <Navbar fluid={true}>
      <Navbar.Brand href="https://flowbite.com/">
        <img src="/OZITO.png" className="h-6 mr-3 sm:h-9" alt="Flowbite Logo" />
        <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
          Tozito CMS
        </span>
      </Navbar.Brand>
      <div className="flex md:order-2">
        <Dropdown arrowIcon={false} inline={true}>
          <Dropdown.Header>
            <span className="block text-sm">Tozito Admin</span>
            <span className="block text-sm font-medium truncate">
              tozito@app.com
            </span>
          </Dropdown.Header>
          <Dropdown.Item>
            <Link href={"/"}>Dashboard</Link>
          </Dropdown.Item>
          <Dropdown.Item>
            <Link href={"/Dress"}>Dress</Link>
          </Dropdown.Item>
          {/* <Dropdown.Item>Earnings</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item>Sign out</Dropdown.Item> */}
        </Dropdown>
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <div className="grid md:flex md:space-x-7 md:pt-2">
          {NavRoutes.map((e, i) => {
            if (e.dis) {
              return (
                <div
                  className="w-11/12 m-auto mb-3 border-b-2 text-white/40 border-white/40 md:border-0"
                  key={i}
                  href={e.Route}
                >
                  <span className="w-[96%] flex m-auto">{e.Name}</span>
                </div>
              );
            }
            return (
              <Link
                className="w-11/12 m-auto mb-3 text-white border-b-2 md:border-0"
                key={i}
                href={e.Route}
              >
                <span className="w-[96%] flex m-auto">{e.Name}</span>
              </Link>
            );
          })}
        </div>
      </Navbar.Collapse>
    </Navbar>
  );
};
export default Nav;
