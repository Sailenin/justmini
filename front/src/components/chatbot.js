import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faTimes, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import Fuse from 'fuse.js'; 
import '../styles/chatbot.css';

const predefinedResponses = {
  "hello": "Hello! How can I help you with blood or organ donation today?",
  "hi": "Hi there! What would you like to know about donation?",
  "eligibility": "To donate blood, you must be at least 17 years old, weigh at least 110 pounds, and be in good health. For organ donation, requirements vary by organ.",
  "process": "The blood donation process takes about 10 minutes. You'll complete a health history, have a mini-physical, donate, and then enjoy refreshments.",
  "benefits": "Blood donation helps save lives and may provide health benefits like reduced risk of heart disease. Organ donation gives recipients a second chance at life.",
  "thank you": "You're welcome! Is there anything else you'd like to know?",
  "default": "I'm sorry, I can only answer questions about blood and organ donation. Try asking about eligibility, the donation process, or benefits.",
  "health tips": "Maintaining a healthy lifestyle includes a balanced diet, regular exercise, staying hydrated, and getting enough sleep. Would you like advice on a specific area?",
  "fitness tips": "To stay fit, try combining cardio exercises like running or cycling with strength training. Consistency and variety in your workout are key to long-term fitness.",
  "hydration": "Drinking enough water is essential for your health. Aim for about 8 cups (64 ounces) a day, but this can vary depending on your activity level and climate.",
  "how much water should i drink": "It's recommended to drink about 8 cups or 64 ounces of water daily. However, the exact amount depends on factors like your activity level, age, and environment.",
  "how much water do i need": "It's recommended to drink about 8 cups or 64 ounces of water daily. However, the exact amount depends on factors like your activity level, age, and environment.",
  "exercise routine": "A well-rounded exercise routine should include cardio, strength training, and flexibility exercises. Start slow and gradually increase intensity to avoid injury.",
  "how to stay fit": "Stay fit by incorporating regular physical activity, balanced nutrition, and staying hydrated. Strength training and cardio are essential for overall fitness.",
  "weight loss": "For weight loss, creating a calorie deficit by eating less and moving more is essential. Regular exercise and healthy eating habits go hand in hand. Would you like more tips on losing weight?",
  "mental health": "Taking care of your mental health is as important as physical health. Activities like mindfulness, meditation, regular social interactions, and adequate sleep can help maintain good mental health.",
  "how to relieve stress": "To relieve stress, try deep breathing exercises, yoga, or even taking short breaks to relax. Regular physical activity also helps reduce stress over time.",
  "sleep hygiene": "Good sleep hygiene includes having a consistent bedtime, creating a calm sleep environment, limiting screen time before bed, and avoiding caffeine late in the day.",
  "chronic conditions": "Chronic conditions such as diabetes, hypertension, and asthma require regular medical check-ups and lifestyle adjustments. Would you like advice on managing a specific condition?",
  "heart health": "For heart health, focus on a heart-healthy diet (low in sodium, high in fiber), regular exercise, and managing stress. Regular check-ups with your healthcare provider are also important.",
  "preventive care": "Preventive care includes regular screenings, vaccinations, and health check-ups. Early detection of potential health issues often leads to better outcomes.",
  "weight gain": "Healthy weight gain focuses on increasing muscle mass with strength training and consuming more nutrient-dense foods. Focus on eating high-protein meals with healthy fats and carbohydrates.",
  "immune system": "Boosting your immune system includes eating a balanced diet, exercising regularly, managing stress, and getting enough sleep. Would you like advice on strengthening your immunity?",
  "healthy habits": "Healthy habits like regular physical activity, balanced nutrition, staying hydrated, and getting enough rest are essential for overall well-being.",
  "exercise for beginners": "For beginners, start with light cardio (like walking or cycling) and basic bodyweight exercises (like squats, push-ups, and lunges). Gradually build up intensity over time.",
  "vitamins": "Vitamins play a crucial role in your health. Ensure you're getting a variety of vitamins through a balanced diet or supplements. Do you have questions about a specific vitamin or nutrient?",
  "weight management": "Effective weight management involves a combination of healthy eating, regular exercise, and maintaining a consistent lifestyle. Let me know if you need tips on managing your weight.",
  "meditation": "Meditation can help reduce stress, improve focus, and enhance your mental well-being. Try mindfulness or guided meditation as a simple starting point. Would you like some meditation techniques?",
  "cooking tips": "Healthy cooking includes using fresh ingredients, minimizing processed foods, and cooking with healthy oils. If you need recipe ideas or tips, let me know!",
  "motivation": "Staying motivated is key to any fitness or health goal. Try setting small, achievable targets, tracking progress, and rewarding yourself for milestones.",
  "nutrition advice": "For balanced nutrition, make sure you're eating a variety of foods across all food groups. Do you have specific questions about meal planning or nutritional needs?",
  "exercise at home": "If you prefer working out at home, bodyweight exercises like squats, push-ups, planks, and lunges can be effective. You can also try online fitness videos to guide you.",
  "how much sleep do i need": "The average adult needs around 7-9 hours of sleep each night. However, this can vary based on individual needs, age, and lifestyle.",
  "what is a balanced diet": "A balanced diet includes a mix of protein, healthy fats, carbohydrates, vitamins, and minerals. Eating a variety of foods from all food groups will ensure you get the nutrients you need.",
  "how can i improve my flexibility": "Stretching regularly, doing yoga, and engaging in flexibility-focused workouts can help improve your flexibility. Start slowly and gently increase the intensity to avoid injury.",
  "how to stay motivated": "Set realistic goals, track your progress, and celebrate small wins. Surround yourself with support and make the process enjoyable. It’s about consistency, not perfection.",
  "should i take supplements": "Supplements can be helpful if you're lacking specific nutrients in your diet, but they shouldn't replace a healthy diet. It’s always a good idea to consult with a healthcare professional before starting any supplements.",
  "how to reduce belly fat": "To reduce belly fat, focus on a combination of healthy eating, cardiovascular exercise, and strength training. It’s important to create a calorie deficit and stay consistent with your efforts.",
  "is it okay to eat snacks": "Yes! Healthy snacks like fruits, nuts, or yogurt can be part of a balanced diet. Just be mindful of portion sizes and try to avoid highly processed or sugary snacks.",
  "how to boost metabolism": "To boost your metabolism, include strength training exercises in your routine, eat enough protein, and stay active throughout the day. Drinking water can also temporarily increase metabolic rate.",
  "how to increase muscle mass": "To increase muscle mass, focus on strength training exercises like weightlifting, eating a protein-rich diet, and getting plenty of rest to allow muscles to recover.",
  "what is a good workout for beginners": "A good beginner workout includes light cardio (like walking or cycling), bodyweight exercises (like squats, push-ups, and lunges), and flexibility exercises like yoga or stretching.",
  "can i donate blood if i'm sick": "It’s best to wait until you’re feeling completely better before donating blood. If you have a fever, cough, or active infection, it's recommended to wait until you're fully recovered."
};

// Set up fuzzy search options
const fuse = new Fuse(Object.keys(predefinedResponses), { includeScore: true });

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I can answer questions about blood and organ donation. How can I help?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Normalize input for case-insensitivity, spelling mistakes, and word interchange
  const getBotResponse = (message) => {
    const normalizedMessage = message.toLowerCase().trim();

    // Search for the closest match using fuzzy search (Fuse.js)
    const results = fuse.search(normalizedMessage);

    // If there's a close match, return the corresponding response
    if (results.length > 0 && results[0].score < 0.5) {
      const closestMatch = results[0].item;
      return predefinedResponses[closestMatch];
    }

    // If no match, return default response
    return predefinedResponses["default"];
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = { sender: 'user', text: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    setTimeout(() => {
      const botResponse = { sender: 'bot', text: getBotResponse(inputMessage) };
      setMessages(prev => [...prev, botResponse]);
      scrollToBottom(); // Scroll down after new response
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    scrollToBottom(); // Scroll to bottom when component mounts or messages change
  }, [messages]);

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
      {isOpen ? (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h3>Donation Assistant</h3>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`message ${msg.sender}`}
              >
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-input">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your question..."
            />
            <button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
            >
              <FontAwesomeIcon icon={faPaperPlane} />
            </button>
          </div>
        </div>
      ) : (
        <button 
          className="chatbot-toggle"
          onClick={() => setIsOpen(true)}
        >
          <FontAwesomeIcon icon={faComment} />
        </button>
      )}
    </div>
  );
};

export default Chatbot;
