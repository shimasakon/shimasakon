import Footer from "./Footer.tsx";
import { Menu } from "./Menu.tsx";
import { SEO } from "./SEO.tsx";

export const About = () => (
  <div className="w-full px-4 sm:px-8">
    <SEO
      title="tlsbollei - Cybersecurity Researcher & CTF Player"
      description="Cybersecurity research, CTF writeups, reverse engineering, and binary exploitation insights. Follow my journey through the world of information security."
      url="/about"
      type="website"
    />
    <div className="max-w-none window min-w-0 w-full">
      <div className="title-bar">
        <div className="title-bar-text">Exploring - (/about)</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button aria-label="Maximize"></button>
          <button aria-label="Close"></button>
        </div>
      </div>
      <Menu selected="about" />
      <div className="window" role="tabpanel">
        <div className="window-body main p-4">
          <hr />
          <div className="prose max-w-none col-span-12 md:col-span-10 overflow-hidden min-w-0">
            { /* TVOJ HTML CONTENT, Môžeš si to prepísať ako sa ti zachce. */}
            { /* Veľkosť písma je automaticky generovaná kvôli "prose" classe tohto divka, ale môžeš
                si to customizovať cez Tailwind CSS triedy ako "text-lg", "text-base" napr.
                <h1 className="text-2xl font-bold">About Me</h1>
            */}
            <h2 className="mt-0 mb-0">What I do</h2>
            <ul className="break-words">
              <li>
                <b>Reverse Engineering</b>: I enjoy dissecting software and
                understanding how things work under the hood
              </li>
              <li>
                <b>Capture The Flag (CTF)</b>: Regular participant in
                cybersecurity competitions, solving challenges in cryptography,
                binary exploitation, and more
              </li>
              <li>
                <b>Security Research</b>: Always learning about new
                vulnerabilities and exploitation techniques
              </li>
            </ul>
            <h2 className="mt-0 mb-0">Interests</h2>
            <p>
              When I'm not deep in assembly code or hunting for flags, I enjoy
              exploring the intersection of technology and creativity. I believe
              in building an inclusive tech community where everyone can express
              themselves authentically.
            </p>
            <p>
              Feel free to reach out if you want to collaborate on security
              research or discuss the latest CTF challenges!
            </p>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  </div>
);
