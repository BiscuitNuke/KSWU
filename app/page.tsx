import Link from "next/link";
import React from "react";
import Particles from "./components/particles";

const navigation = [
  { name: "Projects", href: "/projects" },
  { name: "Contact", href: "/contact" },
];

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen overflow-hidden bg-gradient-to-tl from-black via-zinc-400/20 to-black">
      <nav className="my-16 animate-fade-in">
        <ul className="flex items-center justify-center gap-4">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-l font-naut duration-500 text-zinc-200 hover:text-zinc-500"
            >
              {item.name}
            </Link>
          ))}
        </ul>
      </nav>
      <div className="hidden w-screen font-naut h-px animate-glow md:block animate-fade-left bg-gradient-to-r from-amber-300/0 via-amber-300/50 to-zinc-300/0" />
      <Particles
        className="absolute inset-0 -z-10 animate-fade-in"
        quantity={100}
      />
      <h1 className="z-10 text-6xl text-transparent duration-500 bg-amber-600 cursor-default text-edge-outline  animate-title font-display sm:text-8xl md:text-9xl whitespace-nowrap bg-clip-text ">
       KSW.dev 

      </h1>

      <div className="hidden w-screen h-px animate-glow md:block animate-fade-right bg-gradient-to-r from-amber-300/0 via-amber-300/50 to-amber-300/0" />
      <div className="my-16 text-center animate-fade-in">
        <h2 className=" font-naut text-md text-slate-50 ">
          My  name is Kieran Wittstruck, and I'm a {" "}
          <Link
            target="_blank"
            href="https://www.kswphotos.com"
            className="underline duration-500 hover:text-zinc-300"
          >
            Photographer
          </Link>, Developer, and too many other things to count. 
        </h2>
      </div>
    </div>
  );

}
