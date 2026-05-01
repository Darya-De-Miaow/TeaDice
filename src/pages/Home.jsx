import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaGithub } from "react-icons/fa";

const Home = () => {
  return (
    // This is the main landing page of the DApp - it uses framer-motion for smooth page transitions.
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* I changed the heading size and added a purple glow to make it stand out more */}
      <h1 className="text-7xl mb-4" style={{ color: "#a855f7", textShadow: "0 0 30px rgba(168, 85, 247, 0.5)" }}>
        WELCOME TO TeaDice
      </h1>
      <p className="text-xl mb-8 text-center">
        ROLL THE DICE, EARN POINTS, CLIMB THE TIERS, AND MINT EXCLUSIVE NFTS!
      </p>
      <Link to="/play-dice">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          // I changed the button colour to purple to match the new theme
          className="px-6 py-3 rounded uppercase text-xl text-white"
          style={{ background: "#a855f7" }}
        >
          PLAY NOW
        </motion.button>
      </Link>
      {/* I added a second button to take users straight to the leaderboard */}
      <Link to="/leaderboard">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="mt-4 px-6 py-3 rounded uppercase text-xl text-white border border-[#a855f7]"
        >
          LEADERBOARD
        </motion.button>
      </Link>
      <div className="mt-12 p-4 border border-[#a855f7] rounded" style={{ background: "rgba(168, 85, 247, 0.05)" }}>
        <h2 className="text-3xl mb-4">HOW TO PLAY</h2>
        <motion.ul
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <li className="mb-2">CONNECT YOUR WALLET</li>
          <li className="mb-2">ROLL THE DICE TO EARN POINTS</li>
          <li className="mb-2">REACH MILESTONES TO MINT NFTS</li>
          <li className="mb-2">CHECK THE LEADERBOARD FOR YOUR RANK</li>
        </motion.ul>
      </div>
    </motion.div>
  );
};

export default Home;