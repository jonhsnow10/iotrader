import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAccount, useDisconnect } from "wagmi";
import { useCollateral } from "@orderly.network/hooks";
import Icon from "./Icon";
import { useWallet } from "../hooks/useWallet";
import { navItems, moreMenuItems } from "../constants";
import { WalletConnectModal } from "./WalletConnectModal";

const Header = ({ activePage = "" }) => {
  const { isConnected, address } = useWallet();
  const { disconnect } = useDisconnect();
  const { totalValue, freeCollateral, availableBalance } = useCollateral({ dp: 2 });
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const moreMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const walletDropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setIsMoreOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
      if (walletDropdownRef.current && !walletDropdownRef.current.contains(event.target)) {
        setWalletDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsMoreOpen(false);
    setIsMobileMenuOpen(false);
    setWalletDropdownOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav className="bg-[#050505] border-b border-yellow-500/20 px-4 lg:px-6 py-4 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md bg-[#050505]/80">
        <div className="flex items-center gap-4">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="IO Trader"
              className="h-5 md:h-6 object-contain cursor-pointer"
            />
          
          </Link>
          
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-gray-400 hover:text-yellow-400 transition-colors p-2"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <Icon name="X" size={24} />
            ) : (
              <Icon name="Menu" size={24} />
            )}
          </button>
        </div>

      <div className="hidden lg:flex items-center space-x-8 text-sm font-bold text-gray-400">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href === "/" && location.pathname === "/") ||
            (item.href !== "/" && location.pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              to={item.href}
              className={
                isActive
                  ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500"
                  : "hover:text-yellow-400 transition-colors"
              }
            >
              {item.name}
            </Link>
          );
        })}
        <div 
          className="relative" 
          ref={moreMenuRef}
        >
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={`flex items-center cursor-pointer transition-colors ${
              isMoreOpen 
                ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500"
                : "text-gray-400 hover:text-yellow-400"
            }`}
          >
            <span>More</span>
            <Icon
              name="ChevronDown"
              size={14}
              className={`ml-1 transition-transform duration-300 ${
                isMoreOpen ? "rotate-180" : ""
              }`}
            />
          </button>
          
          {isMoreOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-[#0a0a0a] border border-yellow-500/30 rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="py-2">
                {moreMenuItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMoreOpen(false)}
                      className={`block px-4 py-2 text-sm font-bold transition-colors ${
                        isActive
                          ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 bg-yellow-500/10"
                          : "text-gray-400 hover:text-yellow-400 hover:bg-white/5"
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 relative" ref={walletDropdownRef} style={{ zIndex: 1000 }}>
        {!isConnected ? (
          <>
            <button
              type="button"
              onClick={() => setWalletModalOpen(true)}
              className="btn-primary-accent btn-primary-accent--wide px-3 sm:px-6"
              aria-label="Connect Wallet"
            >
              <Icon name="Wallet" size={16} strokeWidth={3} />
              <span className="hidden sm:inline">Connect Wallet</span>
            </button>
            <WalletConnectModal isOpen={walletModalOpen} onClose={() => setWalletModalOpen(false)} />
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
              className="inline-flex items-center justify-center gap-2 h-9 rounded-3xl bg-white px-4 py-2 text-sm font-medium text-[#0A0A0A] border border-[#E5E5E5] shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-[#F5F5F5] transition-colors cursor-pointer"
            >
              <img src="/metamask.svg" alt="Wallet" className="w-4 h-4 rounded-full" onError={(e) => { e.target.style.display = "none"; }} />
              <span className="text-sm font-mono">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connected"}
              </span>
            </button>
            {walletDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setWalletDropdownOpen(false)} aria-hidden="true" />
                <div className="absolute top-full right-0 mt-2 w-72 rounded-[10px] shadow-xl z-50 futures-dropdown-panel">
                  <div className="p-2 space-y-1">
                    <div className="px-0 py-2 border-b border-[#EBB30B]/30">
                      <p className="text-xs text-[#999999] mb-0">Connected Wallet</p>
                    </div>
                    <div className="px-0 py-2 rounded-sm">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-[#FAFAFA] font-medium">EVM Wallet</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-[#999999] font-mono">
                          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ""}
                        </p>
                        <button
                          type="button"
                          onClick={() => { disconnect(); setWalletDropdownOpen(false); }}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                    <div className="px-0 py-2 border-t border-[#EBB30B]/30">
                      <p className="text-xs text-[#999999] mb-2">Account</p>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-[#999999]">Total Value</span>
                          <span className="text-sm text-[#FAFAFA] font-mono">${totalValue ?? "0.00"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-[#999999]">Available</span>
                          <span className="text-sm text-[#EBB30B] font-mono">${availableBalance ?? "0.00"}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-[#999999]">Free Collateral</span>
                          <span className="text-xs text-[#999999] font-mono">${freeCollateral ?? "0.00"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </nav>

      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            ref={mobileMenuRef}
            className="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-[#0a0a0a] border-r border-yellow-500/20 shadow-2xl overflow-y-auto z-50 transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-yellow-500/20">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
                <img
                  src="/logo.png"
                  alt="IO Trader"
                  className="h-8 object-contain"
                />
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-400 hover:text-yellow-400 transition-colors p-2"
                aria-label="Close menu"
              >
                <Icon name="X" size={24} />
              </button>
            </div>

            <div className="py-4">
              <div className="px-4 space-y-1 mb-4">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.href || 
                    (item.href === "/" && location.pathname === "/") ||
                    (item.href !== "/" && location.pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-4 py-3 text-sm font-bold transition-colors rounded-lg ${
                        isActive
                          ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 bg-yellow-500/10"
                          : "text-gray-400 hover:text-yellow-400 hover:bg-white/5"
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              <div className="border-t border-yellow-500/20 my-4"></div>

              <div className="px-4">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4 py-2 mb-2">
                  More
                </div>
                <div className="space-y-1">
                  {moreMenuItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`block px-4 py-3 text-sm font-bold transition-colors rounded-lg ${
                          isActive
                            ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 bg-yellow-500/10"
                            : "text-gray-400 hover:text-yellow-400 hover:bg-white/5"
                        }`}
                      >
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
