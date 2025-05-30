import React from 'react';
import '../styles/about.css';

const AboutUs = () => {
  return (
    <div className="about-us">
      <div className="about-header">
        <h1>About Us</h1>
        <p>Connecting Life-Saving Donors with Those in Need</p>
      </div>

      <div className="about-content">
        <p>
          Welcome to <strong>Healing Hearts💕</strong>, a platform dedicated to facilitating life-saving blood and organ donations. Our mission is to create a bridge between donors and recipients through a secure and compassionate network.
        </p>

        <h2>What We Do</h2>
        <ul>
          <li>Provide a simple and secure registration process for both donors and recipients.</li>
          <li>Maintain a verified database to match organ and blood donors with patients in need.</li>
          <li>Ensure confidentiality and compliance with medical guidelines and legal standards.</li>
        </ul>

        <h2>How It Works</h2>
        <p>
          If you're a <strong>donor</strong>, you can register with your medical information and availability.
          If you're a <strong>recipient</strong>, you can sign up and specify the type of donation needed.
          Our system helps find a compatible match and facilitates the communication and process.
        </p>

        <h2>Join Us</h2>
        <p>
          Every donor can be a hero. Whether you’re donating blood or an organ, your contribution can save lives. 
          Register today and become part of a life-saving community.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;
