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
          <div className="prose max-w-none col-span-12 md:col-span-10 overflow-hidden min-w-0">
            { /* TVOJ HTML CONTENT, Môžeš si to prepísať ako sa ti zachce. */}
            { /* Veľkosť písma je automaticky generovaná kvôli "prose" classe tohto divka, ale môžeš
                si to customizovať cez Tailwind CSS triedy ako "text-lg", "text-base" napr.
                <h1 className="text-2xl font-bold">About Me</h1>
            */}
            <h2 className="mt-0 mb-0">Who am I?</h2>
            <p>
              I'm currently a 16 year old student from Slovakia studying Cybersecurity and Information Security, both of which I have been actively studying since the age of 11. I specialize in Security Research as well as Vulnerability Research and I'm interested in reverse engineering, cryptography as well as CyberOps!
              I play CTFs with Team Slovakia/Slovak Cyber Team, rakuz4n and 0xNOOB, where I specialize in reverse engineering and a little cryptography, due to my recent uprise in mathematical passion :D
            </p>
            <p>
            Fun things I've done over the years:
            </p>
            <ul>
                <li>Independent Malware Researcher and Analyst, capturing malware strains on a <a href="https://github.com/telekom-security/tpotce" target="_blank">T-POT</a>, with pre-configured Kippo, Dionaea, Cowrie.</li>
                <li>Elected as a member of Team Slovakia 🇸🇰 , primarily solving reverse engineering tasks with a secondary focus on crypto/forensics.</li> 
                <li>Founded and captained <a href="https://ctftime.org/team/383658" target="_blank">rakuz4n</a>, a CTF team consisting of players from teams from all across the world, with the intent on creating a friendly enviroment for collective learning and individual growth.</li>
                <li>Closely worked with private security researchers and veteran red teamers on the topics of penetration testing and malware development, where we specifically worked on innovative methods to extract SSNs without relying on incrementation and parsing the NTDLL.dll along with anti-sandbox techniques. One of our biggest researches was the attempted identification and termination of all <a href="https://en.wikipedia.org/wiki/Kernel_Patch_Protection" target="_blank">PatchGuard (KPP)</a> threads, in order to allow tampering with critical kernel structures, which as a result would drastically simplify the process of developing bootkits/rootkits.</li>
                <li>Led offensive team operations in custom labs against secured networks, where I focused on Active Directory, deploying a wide variety of sophisticated targeted attacks against Windows enviroments.</li>
                <li>Participated in cybersecurity competitions hosted by <a href="https://www.binaryconfidence.com/" target="_blank">Binary Confidence</a> - where I was elected the MVP of my team due to leadership skills, team contribution and coordination. Learned valuable and hands on skills from the areas of digital forensics, proactive and reactive incident response along with threat hunting.</li>
                <li>Placed in the top 10 of <a href="https://cybergame.sk/sk" target="_blank">CyberGame</a> 2025 - the national qualifier for Team Slovakia.</li> 
            </ul>
          </div>
        </div>
        <Footer />
      </div>
    </div>
  </div>
);
