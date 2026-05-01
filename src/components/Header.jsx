import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Home as HomeIcon,
  Dice5,
  Trophy,
  ShoppingCart,
  User,
  Menu,
  X,
} from "lucide-react";
import { ethers } from "ethers";

const Header = ({ account, connectWallet, disconnectWallet }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [balance, setBalance] = useState(null);

  // Fetch wallet balance whenever account changes.
  useEffect(() => {
    const fetchBalance = async () => {
      if (account && window.ethereum) {
        try {
          // This uses ethers.js BrowserProvider to connect to the Tea Sepolia blockchain and fetch the live wallet balance.
          const provider = new ethers.BrowserProvider(window.ethereum);
          const balanceBigNumber = await provider.getBalance(account);
          const formattedBalance = ethers.formatEther(balanceBigNumber);
          setBalance(formattedBalance);
        } catch (error) {
          console.error("ERROR FETCHING BALANCE", error);
        }
      }
    };
    fetchBalance();
    // Optionally poll balance every 10 seconds.
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [account]);

  return (
    // I changed the header background from the original green SVG to a dark purple gradient to match the new theme.
    <header
      className="py-4 tracking-wide"
      style={{
        background: "linear-gradient(135deg, #0d0515 0%, #1a0a2e 50%, #2d1b4e 100%)",
        borderBottom: "1px solid rgba(139, 92, 246, 0.3)",
        // backgroundPosition: "center",
      }}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        {/* Mobile Header: Logo, Wallet Info, and Toggle */}
        <div className="w-full flex items-center justify-between md:hidden">
          {/* I changed the logo colour to purple to match the new theme. */}
          <Link
            to={"/"}
            className="text-3xl font-bold uppercase tracking-widest"
            style={{ color: "#a855f7" }}
          >
            TeaDice
          </Link>
          <div className="flex items-center gap-2">
            {account ? (
              // I updated the wallet button colours to purple to stay consistent with the new theme.
              <button
                onClick={disconnectWallet}
                className="border border-[#a855f7] px-3 py-2 rounded uppercase flex items-center gap-2"
                style={{ background: "rgba(168, 85, 247, 0.1)" }}
                title="Click to disconnect wallet"
              >
                <span className="text-[#a855f7] text-lg">
                  {balance ? `${Number(balance).toFixed(2)} TEA` : "0.00 TEA"}
                </span>
                <span className="text-white font-semibold tracking-wide text-lg">
                  {account.slice(0, 3)}...{account.slice(-3)}
                </span>
              </button>
            ) : (
              <button
                onClick={connectWallet}
                className="px-3 py-2 rounded uppercase text-lg text-white"
                style={{ background: "#a855f7" }}
              >
                CONNECT
              </button>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className="ml-2 text-white">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Desktop Header: Logo, Nav Links, Wallet Info */}
        <div className="hidden md:flex w-full items-center justify-between">
          {/* I changed the logo colour to purple to match the new theme. */}
          <Link
            to={"/"}
            className="text-3xl font-bold uppercase tracking-widest"
            style={{ color: "#a855f7" }}
          >
            TeaDice
          </Link>
          <nav className="flex space-x-6">
            {/* I changed the hover colour from pink to purple across all nav links to match the new theme. */}
            <Link
              to="/"
              className="flex items-center gap-1 hover:text-[#a855f7] uppercase text-lg text-white"
            >
              <HomeIcon size={20} /> HOME
            </Link>
            <Link
              to="/play-dice"
              className="flex items-center gap-1 hover:text-[#a855f7] uppercase text-lg text-white"
            >
              <Dice5 size={20} /> PLAY DICE
            </Link>
            <Link
              to="/leaderboard"
              className="flex items-center gap-1 hover:text-[#a855f7] uppercase text-lg text-white"
            >
              <Trophy size={20} /> LEADERBOARD
            </Link>
            <Link
              to="/nft-marketplace"
              className="flex items-center gap-1 hover:text-[#a855f7] uppercase text-lg text-white"
            >
              <ShoppingCart size={20} /> BUY NFTs
            </Link>
            <Link
              to="/user-profile"
              className="flex items-center gap-1 hover:text-[#a855f7] uppercase text-lg text-white"
            >
              <User size={20} /> PROFILE
            </Link>
          </nav>
          <div className="flex items-center">
            {account ? (
              // This shows the live wallet balance read from the blockchain and the shortened wallet address.
              // Clicking it disconnects the wallet from the DApp.
              <button
                onClick={disconnectWallet}
                className="border border-[#a855f7] px-4 py-2 rounded uppercase flex items-center gap-2"
                style={{ background: "rgba(168, 85, 247, 0.1)" }}
                title="Click to disconnect wallet"
              >
                <span className="text-[#a855f7] text-lg">
                  {balance ? `${Number(balance).toFixed(2)} TEA` : "0.00 TEA"}
                </span>
                <span className="text-white font-semibold tracking-wide text-lg">
                  {account.slice(0, 4)}...{account.slice(-4)}
                </span>
              </button>
            ) : (
              <button
                onClick={connectWallet}
                className="px-4 py-2 rounded uppercase text-lg text-white"
                style={{ background: "#a855f7" }}
              >
                CONNECT WALLET
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        // I changed the mobile menu background to match the dark purple theme.
        <nav className="md:hidden mt-2" style={{ background: "#0d0515" }}>
          <ul className="flex flex-col space-y-2 px-4 py-2">
            <li>
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-1 hover:text-[#a855f7] uppercase text-lg text-white"
              >
                <HomeIcon size={20} /> HOME
              </Link>
            </li>
            <li>
              <Link
                to="/play-dice"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-1 hover:text-[#a855f7] uppercase text-lg text-white"
              >
                <Dice5 size={20} /> PLAY DICE
              </Link>
            </li>
            <li>
              <Link
                to="/leaderboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-1 hover:text-[#a855f7] uppercase text-lg text-white"
              >
                <Trophy size={20} /> LEADERBOARD
              </Link>
            </li>
            <li>
              <Link
                to="/nft-marketplace"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-1 hover:text-[#a855f7] uppercase text-lg text-white"
              >
                <ShoppingCart size={20} /> BUY NFTs
              </Link>
            </li>
            <li>
              <Link
                to="/user-profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-1 hover:text-[#a855f7] uppercase text-lg text-white"
              >
                <User size={20} /> PROFILE
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
};

export default Header;