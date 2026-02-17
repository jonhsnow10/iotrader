import React from "react";
import TickerBar from "./TickerBar";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children, activePage = "" }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-yellow-500/30 relative overflow-hidden">
      {/* STYLES FOR MARQUEE ANIMATION & INPUT SPINNER REMOVAL */}
      <style>{`
        /* Optimized Ticker Scroll */
        @keyframes scroll {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); } 
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
          will-change: transform;
          backface-visibility: hidden;
          perspective: 1000px;
        }

        /* Optimized Background Movement */
        @keyframes move-around {
          0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.15; }
          33% { transform: translate3d(30vw, -10vh, 0) scale(1.1); opacity: 0.25; }
          66% { transform: translate3d(-20vw, 20vh, 0) scale(0.9); opacity: 0.2; }
          100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.15; }
        }
        
        .animate-move-around {
          animation: move-around 20s infinite ease-in-out;
          will-change: transform, opacity;
          position: absolute; 
        }

        /* Reduced motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .animate-scroll, .animate-move-around, .animate-fade-in-up, .animate-scale-in, .animate-pulse {
            animation: none !important;
            transform: none !important;
            transition: none !important;
            opacity: 1 !important;
          }
        }

        /* Mobile Optimizations for Background */
        @media (max-width: 768px) {
          .animate-move-around {
            animation-duration: 30s; /* Slower on mobile */
            filter: blur(60px); /* Reduce blur radius for performance */
          }
        }

        /* Entrance Animations */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translate3d(0, 20px, 0); }
          to { opacity: 1; transform: translate3d(0, 0, 0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: opacity, transform;
        }
        
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translate3d(0, -5px, 0); }
          to { opacity: 1; transform: scale(1) translate3d(0, 0, 0); }
        }
        .animate-scale-in {
          animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          will-change: opacity, transform;
        }

        /* Utility Helpers */
        .no-spinner::-webkit-inner-spin-button, 
        .no-spinner::-webkit-outer-spin-button { 
          -webkit-appearance: none; 
          margin: 0; 
        }
        .no-spinner { -moz-appearance: textfield; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* BACKGROUND MOVING GRADIENT */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute w-[600px] h-[600px] bg-yellow-500/20 rounded-full blur-[120px] animate-move-around mix-blend-screen"></div>
      </div>

      {/* TICKER BAR */}
      <TickerBar />

      {/* HEADER */}
      <Header activePage={activePage} />

      {/* MAIN CONTENT */}
      <div className="relative z-10">
        {children}
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
};

export default Layout;
