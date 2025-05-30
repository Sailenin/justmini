import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Chatbot from "../components/chatbot"; // Import the Chatbot component
import "../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate("/register");
  };

  return (
    <motion.div
      className="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className="overlay"></div>

      <div className="home-content">
        <motion.h1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Donate Life. Save Lives.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Join our community of blood and organ donors and help change lives.
        </motion.p>

        <motion.button
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="donate-btn"
          onClick={handleRegisterClick}
        >
          Register Now
        </motion.button>
      </div>

      <motion.div
        className="stats-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
      >
        <div className="stat-box">
          <h2>10,000+</h2>
          <p>Lives Saved</p>
        </div>
        <div className="stat-box">
          <h2>5,000+</h2>
          <p>Active Donors</p>
        </div>
        <div className="stat-box">
          <h2>1 Mission</h2>
          <p>Saving Lives</p>
        </div>
      </motion.div>

      {/* Adding the Chatbot component here */}
      <Chatbot />
    </motion.div>
  );
}
