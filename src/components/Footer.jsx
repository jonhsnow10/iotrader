import React from "react";
import { Link } from "react-router-dom";
import { footerLinks } from "../constants";

const Footer = () => {
  const isInternalLink = (url) => url.startsWith("/");

  return (
    <footer className="bg-[#080808] border-t border-white/5 py-12 px-4 lg:px-6 mt-12 relative z-10">
      <div className="max-w-7xl mx-auto md:flex md:justify-between grid grid-cols-2 gap-x-8 gap-y-12 md:gap-12">
        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">
            Company
          </h4>
          <ul className="space-y-2">
            {footerLinks.company.map((link) => (
              <li key={link.name}>
                {isInternalLink(link.url) ? (
                  <Link
                    to={link.url}
                    className="text-gray-400 hover:text-yellow-500 transition-colors text-xs font-medium"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a
                    href={link.url}
                    className="text-gray-400 hover:text-yellow-500 transition-colors text-xs font-medium"
                  >
                    {link.name}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">
            Trading
          </h4>
          <ul className="space-y-2">
            {footerLinks.trading.map((link) => (
              <li key={link.name}>
                {isInternalLink(link.url) ? (
                  <Link
                    to={link.url}
                    className="text-gray-400 hover:text-yellow-500 transition-colors text-xs font-medium"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a
                    href={link.url}
                    className="text-gray-400 hover:text-yellow-500 transition-colors text-xs font-medium"
                  >
                    {link.name}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">
            Support
          </h4>
          <ul className="space-y-2">
            {footerLinks.support.map((link) => (
              <li key={link.name}>
                {isInternalLink(link.url) ? (
                  <Link
                    to={link.url}
                    className="text-gray-400 hover:text-yellow-500 transition-colors text-xs font-medium"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a
                    href={link.url}
                    target={link.url.startsWith("http") ? "_blank" : undefined}
                    rel={link.url.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-gray-400 hover:text-yellow-500 transition-colors text-xs font-medium"
                  >
                    {link.name}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="md:text-right">
          <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">
            Community
          </h4>
          <ul className="space-y-3">
            {footerLinks.community.map((link) => (
              <li key={link.name} className="md:flex md:justify-end">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-gray-400 hover:text-yellow-500 transition-colors text-xs font-medium group"
                >
                  <span className="bg-white/5 p-1.5 rounded-md mr-2 group-hover:bg-yellow-500/20 group-hover:text-yellow-500 transition-all">
                    {link.icon}
                  </span>
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
        <div className="mb-4 md:mb-0">
          <img
            src="/logo.png"
            alt="IO Trader"
            className="h-6 object-contain"
          />
        </div>
        <p>
          &copy; {new Date().getFullYear()} IO Trader. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
