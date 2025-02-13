import React, { useState, useEffect } from "react";
import { FaMicrophoneAlt, FaStop } from "react-icons/fa";
import axios from 'axios';
import "./ChittiAssistant.css";

const ChittiAssistant = () => {
  const [content, setContent] = useState("Click here to speak");
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      setContent("Speech recognition not supported in this browser.");
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.lang = 'en-US';
    recognitionInstance.interimResults = false;

    recognitionInstance.onstart = () => {
      setContent("Listening...");
    };

    recognitionInstance.onend = () => {
      setContent("Click here to speak");
    };

    recognitionInstance.onerror = (event) => {
      console.error("Speech recognition error detected:", event.error);
      setContent("Error occurred: " + event.error);
    };

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setContent(transcript);
      handleAnswer(transcript.toLowerCase());
    };

    setRecognition(recognitionInstance);
  }, []);

  const handleAnswer = (message) => {
    if (message.includes("hey") || message.includes("hello")) {
      speak("Hello Sir, How May I Help You?");
    } else if (message.includes("open google")) {
      window.open("https://google.com", "_blank");
      speak("Opening Google...");
    } else if (message.includes("open youtube")) {
      window.open("https://youtube.com", "_blank");
      speak("Opening Youtube...");
    } else if (message.includes("open facebook")) {
      window.open("https://facebook.com", "_blank");
      speak("Opening Facebook...");
    } else if (message.startsWith("say ")) {
      const textToRepeat = message.replace("say ", "");
      speak(textToRepeat);
      setContent(textToRepeat);
    } else if (message.includes("what is") || message.includes("who is") || message.includes("what are") || message.includes("how to")) {
      window.open(`https://www.google.com/search?q=${message.replace(" ", "+")}`, "_blank");
      speak("This is what I found on the internet regarding " + message);
    } else if (message.includes("wikipedia")) {
      window.open(`https://en.wikipedia.org/wiki/${message.replace("wikipedia", "").trim()}`, "_blank");
      speak("This is what I found on Wikipedia regarding " + message);
    } else if (message.includes("time")) {
      const time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" });
      speak("The current time is " + time);
    } else if (message.includes("date")) {
      const date = new Date().toLocaleString(undefined, { month: "short", day: "numeric" });
      speak("Today's date is " + date);
    } else if (message.includes("calculator")) {
      window.open("Calculator:///");
      speak("Opening Calculator");
    } else if (message.includes("play song")) {
      const songName = message.replace("play song", "").trim();
      if (songName) {
        searchAndPlaySong(songName);
      } else {
        speak("Please specify the name of the song.");
      }
    } else {
      handleNonRelatedQuestions(message);
    }
  };

  const speak = (text) => {
    const text_speak = new SpeechSynthesisUtterance(text);
    text_speak.rate = 1;
    text_speak.volume = 1;
    text_speak.pitch = 1;
    window.speechSynthesis.speak(text_speak);
  };

  const handleNonRelatedQuestions = async (message) => {
    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response.');
      }

      const data = await response.json();
      const chatResponse = data.choices[0].text.trim();
      speak(chatResponse);
      setContent(chatResponse);
    } catch (error) {
      console.error('Error fetching response:', error);
      speak("Sorry, I couldn't fetch a response right now.");
    }
  };

  const searchAndPlaySong = async (songName) => {
    const apiKey = 'AIzaSyA5ZjA3MJCUuk-y-GCY7klOh3HoZQ0sW2o'; // Replace with your actual YouTube API key
    const searchQuery = encodeURIComponent(songName);
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&key=${apiKey}&type=video`;

    try {
      const response = await axios.get(apiUrl);
      const videoId = response.data.items[0].id.videoId;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      window.open(videoUrl, "_blank");
      speak(`Playing ${songName} on YouTube.`);
    } catch (error) {
      console.error('Error searching for video:', error);
      speak("Sorry, I couldn't find a song with that name.");
    }
  };

  const startRecognition = () => {
    if (recognition) {
      recognition.start();
    }
  };

  const stopRecognition = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  return (
    <section className="main">
      <div className="image-container">
        <div className="image">
          <img src="https://media1.giphy.com/media/1pqlCWXnNzgdXS9qon/source.gif" alt="image" />
        </div>
        <h1>C H I T T I</h1>
        <p>I’m a Virtual Assistant CHITTI, How may I help you?</p>
      </div>
      <div className="input">
        <button className="talk" onClick={startRecognition}>
          <FaMicrophoneAlt />
        </button>
        <button className="stop" onClick={stopRecognition}>
          <FaStop />
        </button>
        <h1 className="content">{content}</h1>
      </div>
    </section>
  );
};

export default ChittiAssistant;
