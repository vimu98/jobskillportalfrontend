import React, { useState, useEffect } from "react";
import axios from "axios";

function DialogflowChatbot({ job }) {
  const [messages, setMessages] = useState([{ text: "Hello! Ask me about this job.", sender: "bot" }]);
  const [input, setInput] = useState("");
  const [sessionId] = useState(`job-${job.id}-${Math.random().toString(36).substr(2, 9)}`);

  // Initialize Dialogflow session
  const detectIntent = async (text) => {
    try {
      const response = await axios.post("http://localhost:8080/api/dialogflow/query", {
        message: text,
        sessionId: sessionId,
        parameters: {
          job_title: job.title,
          company: job.company,
          salary: job.salary,
          location: job.location,
          skills: job.skillsRequired,
        }
      });
  
      return response.data.response;
    } catch (error) {
      console.error("Error with Dialogflow:", error);
      return "Sorry, I'm having trouble understanding. Could you rephrase that?";
    }
  };
  

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Get response from Dialogflow
    const botResponse = await detectIntent(input);
    setMessages((prev) => [...prev, { text: botResponse, sender: "bot" }]);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div style={{ 
      border: "1px solid #ddd", 
      padding: "10px", 
      width: "300px", 
      position: "fixed", 
      bottom: "10px", 
      right: "10px", 
      backgroundColor: "white",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      borderRadius: "8px"
    }}>
      <h4 style={{ marginTop: 0, color: "#4285F4" }}>Job Assistant</h4>
      <div style={{ 
        height: "200px", 
        overflowY: "auto", 
        borderBottom: "1px solid #eee", 
        padding: "5px",
        marginBottom: "10px"
      }}>
        {messages.map((msg, index) => (
          <div 
            key={index} 
            style={{ 
              textAlign: msg.sender === "user" ? "right" : "left",
              margin: "5px 0",
              padding: "8px",
              borderRadius: "8px",
              backgroundColor: msg.sender === "user" ? "#e3f2fd" : "#f5f5f5",
              wordBreak: "break-word"
            }}
          >
            <b style={{ color: msg.sender === "user" ? "#0d47a1" : "#424242" }}>
              {msg.sender === "user" ? "You" : "Assistant"}:
            </b> {msg.text}
          </div>
        ))}
      </div>
      <div style={{ display: "flex" }}>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyPress={handleKeyPress}
          placeholder="Ask about the job..." 
          style={{ 
            flex: 1, 
            padding: "8px", 
            border: "1px solid #ddd",
            borderRadius: "4px 0 0 4px",
            outline: "none"
          }} 
        />
        <button 
          onClick={sendMessage} 
          style={{ 
            padding: "8px 12px", 
            backgroundColor: "#4285F4", 
            color: "white",
            border: "none",
            borderRadius: "0 4px 4px 0",
            cursor: "pointer"
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default DialogflowChatbot;