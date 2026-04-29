import React from "react";
import Link from "next/link";
import { Github, Linkedin } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import Container from "./containers";

const Footer = () => {
  const socialLinks = [
    {
      name: "GitHub",
      url: "https://github.com/sehajmakkar",
      icon: Github,
    },
    {
      name: "X",
      url: "https://x.com/sehajmakkarr",
      icon: FaXTwitter,
    },
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/sehajmakkar",
      icon: Linkedin,
    },
  ];

  return (
    <footer className="w-full bg-neutral-50 dark:bg-neutral-950">
      <Container className="flex flex-col items-center justify-center gap-4 border border-neutral-200 py-2 text-center sm:flex-row sm:justify-between sm:text-left dark:border-neutral-800">
        <Link
          href="https://x.com/sehajmakkarr"
          target="_blank"
          rel="noopener noreferrer"
          className="font-custom2 text-sm tracking-normal text-neutral-600 transition-colors duration-300 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          @sehajmakkar
        </Link>
        <div className="flex items-center justify-center gap-4">
          {socialLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <Link
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer text-neutral-700 opacity-70 transition hover:opacity-100 dark:text-neutral-50"
                title={link.name}
              >
                <IconComponent size={15} />
              </Link>
            );
          })}
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
