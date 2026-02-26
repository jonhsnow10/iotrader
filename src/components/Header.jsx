import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
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
  const navRef = useRef(null);
  const [menuTopPx, setMenuTopPx] = useState(56); // fallback 56px
  const location = useLocation();

  const updateMenuTop = () => {
    if (navRef.current) {
      const bottom = navRef.current.getBoundingClientRect().bottom;
      setMenuTopPx(bottom);
    }
  };

  useLayoutEffect(() => {
    if (isMobileMenuOpen) updateMenuTop();
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onResize = () => updateMenuTop();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [isMobileMenuOpen]);

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
      <nav ref={navRef} className="min-h-14 bg-[#050505] border-b border-white/20 px-4 lg:px-6 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md bg-[#050505]/80 shrink-0" style={{ fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif" }}>
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
            className="lg:hidden text-white/70 hover:text-[var(--color-accent-primary)] transition-colors p-2"
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
                  ? "text-[var(--color-accent-primary)]"
                  : "text-white/70 hover:text-[var(--color-accent-primary)] transition-colors"
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
                ? "text-[var(--color-accent-primary)]"
                : "text-white/70 hover:text-[var(--color-accent-primary)]"
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
            <div className="absolute top-full right-0 mt-2 w-56 bg-[var(--color-background)] border border-white/20 rounded-lg shadow-xl z-50 overflow-hidden">
              <div className="py-2">
                {moreMenuItems.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMoreOpen(false)}
                      className={`block px-4 py-2 text-sm font-semibold transition-colors ${
                        isActive
                          ? "text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10"
                          : "text-white/70 hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-background-hover)]"
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
        <>
          {/* Overlay: always below navbar (measured so it works with ticker/other top content) */}
          <div
            className="fixed inset-x-0 bottom-0 z-40 lg:hidden transition-opacity duration-300 bg-black/80 backdrop-blur-sm"
            style={{ top: `${menuTopPx}px` }}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={mobileMenuRef}
            className="fixed left-0 bottom-0 w-80 max-w-[85vw] bg-[var(--color-background)] border-r border-white/20 shadow-2xl overflow-y-auto z-50 transform transition-transform duration-300 ease-in-out lg:hidden"
            style={{ top: `${menuTopPx}px`, fontFamily: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif" }}
            onClick={(e) => e.stopPropagation()}
          >
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
                      className={`block px-4 py-3 text-sm font-semibold transition-colors rounded-lg ${
                        isActive
                          ? "text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10"
                          : "text-white/70 hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-background-hover)]"
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              <div className="border-t border-white/20 my-4" />

              <div className="px-4">
                <div className="text-xs font-semibold text-white/50 uppercase tracking-wider px-4 py-2 mb-2">
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
                        className={`block px-4 py-3 text-sm font-semibold transition-colors rounded-lg ${
                          isActive
                            ? "text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10"
                            : "text-white/70 hover:text-[var(--color-accent-primary)] hover:bg-[var(--color-background-hover)]"
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
        </>
      )}
    </>
  );
};

export default Header;
