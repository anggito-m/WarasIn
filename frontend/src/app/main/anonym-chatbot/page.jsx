"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Send,
  Clock,
  Dumbbell,
  Droplet,
  PocketIcon as Pool,
} from "lucide-react";

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hi, I'm MindCareBot 🌿 Your mental health companion. How are you feeling today?",
      timestamp: new Date(),
      quickReplies: [
        { id: 1, text: "I'm feeling anxious" },
        { id: 2, text: "I'm feeling down" },
        { id: 3, text: "I just need someone to talk to" },
      ],
    },
    {
      id: 2,
      sender: "user",
      text: "I'm feeling anxious",
      timestamp: new Date(),
    },
    {
      id: 3,
      sender: "bot",
      text: "Thank you for sharing that with me. Anxiety can be really tough. Would you like a calming exercise or to talk about what's bothering you?",
      timestamp: new Date(),
      quickReplies: [
        { id: 4, text: "Let's try a calming exercise" },
        { id: 5, text: "I want to talk about it" },
      ],
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  const chatHistory = [
    { id: 1, text: "Lorem ipsum", subtext: "Lorem ipsum" },
    { id: 2, text: "Lorem ipsum", subtext: "Lorem ipsum" },
    { id: 3, text: "Lorem ipsum", subtext: "Lorem ipsum" },
    { id: 4, text: "Lorem ipsum", subtext: "Lorem ipsum" },
    { id: 5, text: "Lorem ipsum", subtext: "Lorem ipsum" },
    { id: 6, text: "Lorem ipsum", subtext: "Lorem ipsum" },
    { id: 7, text: "Lorem ipsum", subtext: "Lorem ipsum" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;

    const newMessage = {
      id: messages.length + 1,
      sender: "user",
      text: inputValue,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputValue("");

    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        sender: "bot",
        text: "Thank you for sharing. Would you like to do a calming activity or talk about your feelings?",
        timestamp: new Date(),
        quickReplies: [
          { id: 1, text: "Do a breathing exercise" },
          { id: 2, text: "I want to talk" },
          { id: 3, text: "Reflect with journaling" },
        ],
      };
      setMessages((prevMessages) => [...prevMessages, botResponse]);
    }, 1000);
  };

  const handleQuickReply = (replyText) => {
    const newMessage = {
      id: messages.length + 1,
      sender: "user",
      text: replyText,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);

    // Simulate bot response after a short delay
    setTimeout(() => {
      let botResponse;

      if (replyText === "Do a breathing exercise") {
        botResponse = {
          id: messages.length + 2,
          sender: "bot",
          text: "Let's take a moment to breathe. Inhale slowly for 4 seconds... Hold for 4... Exhale for 4... Repeat this 3 times. Feeling a bit better?",
          timestamp: new Date(),
          quickReplies: [
            { id: 1, text: "Yes, a little better" },
            { id: 2, text: "Still feel anxious" },
            { id: 3, text: "Can we try something else?" },
          ],
        };
      } else if (replyText === "I want to talk") {
        botResponse = {
          id: messages.length + 2,
          sender: "bot",
          text: "I'm here for you. Would you like to start by telling me how your day has been?",
          timestamp: new Date(),
          quickReplies: [
            { id: 1, text: "It's been a hard day" },
            { id: 2, text: "Not sure how I feel" },
            { id: 3, text: "I felt overwhelmed" },
          ],
        };
      } else if (replyText === "Reflect with journaling") {
        botResponse = {
          id: messages.length + 2,
          sender: "bot",
          text: "That's a great step. Here's a prompt to start: *What is one thing you're grateful for today?* You can type your thoughts whenever you're ready.",
          timestamp: new Date(),
        };
      } else {
        botResponse = {
          id: messages.length + 2,
          sender: "bot",
          text: "I'm here to support you. Would you like help with any of the following?",
          timestamp: new Date(),
          quickReplies: [
            { id: 1, text: "Managing anxiety" },
            { id: 2, text: "Lifting my mood" },
            { id: 3, text: "Mindfulness tips" },
          ],
        };
      }

      setMessages((prevMessages) => [...prevMessages, botResponse]);
    }, 1000);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="flex flex-1">
        <main className="flex-1 flex flex-col">
          <div className="border-b">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold">Anonymous Chatbot</h1>
              <Button
                variant="outline"
                className="rounded-full border-orange-200 px-4"
              >
                <span className="mr-2 text-orange-500">User</span>
                <Avatar className="h-6 w-6 border border-orange-200">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-orange-100 text-orange-500">
                    U
                  </AvatarFallback>
                </Avatar>
              </Button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Chat area */}
            <div className="flex-1 flex flex-col bg-gray-100">
              <div className="flex-1 overflow-y-auto p-4">
                <div className="text-center text-xs text-gray-500 mb-4">
                  Today, {formatTime(new Date())}
                </div>

                {messages.map((message) => (
                  <div key={message.id} className="mb-4">
                    {message.sender === "bot" ? (
                      <div className="flex items-start">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                          <span className="text-lg">💬</span>
                        </div>
                        <div className="ml-2 max-w-[80%]">
                          <div className="rounded-lg rounded-tl-none bg-white p-3 shadow-sm">
                            <p className="whitespace-pre-line">
                              {message.text}
                            </p>
                          </div>

                          {message.facilities && (
                            <div className="mt-2 flex gap-2">
                              {message.facilities.includes("gym") && (
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <span className="rounded-full bg-blue-100 p-1">
                                    <Dumbbell className="h-3 w-3 text-blue-500" />
                                  </span>
                                  <span>Gym</span>
                                </div>
                              )}
                              {message.facilities.includes("spa") && (
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <span className="rounded-full bg-blue-100 p-1">
                                    <Droplet className="h-3 w-3 text-blue-500" />
                                  </span>
                                  <span>SPA</span>
                                </div>
                              )}
                              {message.facilities.includes("pool") && (
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                  <span className="rounded-full bg-blue-100 p-1">
                                    <Pool className="h-3 w-3 text-blue-500" />
                                  </span>
                                  <span>Pool</span>
                                </div>
                              )}
                            </div>
                          )}

                          {message.quickReplies && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {message.quickReplies.map((reply) => (
                                <button
                                  key={reply.id}
                                  className="rounded-full bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600"
                                  onClick={() => handleQuickReply(reply.text)}
                                >
                                  {reply.text}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <div className="max-w-[80%] rounded-lg rounded-tr-none bg-blue-500 p-3 text-white shadow-sm">
                          <p>{message.text}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t bg-white p-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Start Typing..."
                    className="flex-1 rounded-full border-gray-300"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="h-10 w-10 rounded-full bg-blue-500 p-0 hover:bg-blue-600"
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* History sidebar */}
            <div className="hidden w-64 flex-col bg-blue-500 text-white md:flex">
              <div className="border-b border-blue-400 p-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-md bg-white/20 p-1">
                    <Clock className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-medium">History</h2>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  {chatHistory.map((item) => (
                    <div key={item.id} className="flex items-start gap-2">
                      <Checkbox
                        id={`history-${item.id}`}
                        className="mt-1 border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-blue-500"
                      />
                      <div className="space-y-1">
                        <label
                          htmlFor={`history-${item.id}`}
                          className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {item.text}
                        </label>
                        <p className="text-xs text-blue-200">{item.subtext}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
