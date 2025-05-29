"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Send, Clock, Loader2, MessageCircle } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ChatbotPage() {
  const router = useRouter();
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
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Chat history dari backend
  const [chatHistory, setChatHistory] = useState([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check authentication and load chat sessions
  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    const token = getAuthToken();
    if (!token) {
      // Redirect to login if no token
      router.push("/auth");
      return;
    }

    // Load chat sessions
    await loadChatSessions();
  };

  // Helper function to get auth token with consistent key
  const getAuthToken = () => {
    // Try both possible keys for backward compatibility
    return (
      localStorage.getItem("jwt_token") || localStorage.getItem("auth_token")
    );
  };

  const loadChatSessions = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        // Token is invalid, redirect to login
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("auth_token");
        router.push("/auth");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setChatHistory(data.sessions || []);
      } else {
        console.error("Failed to load chat sessions:", response.statusText);
      }
    } catch (error) {
      console.error("Failed to load chat sessions:", error);
    }
  };

  // Start new chat session
  const startChatSession = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.push("/auth");
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("auth_token");
        router.push("/auth");
        return null;
      }

      if (response.ok) {
        const session = await response.json();
        setCurrentSessionId(session.session_id);
        return session.session_id;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to start session");
      }
    } catch (error) {
      console.error("Failed to start session:", error);
      setError("Failed to start chat session");
      return null;
    }
  };

  // Send message ke backend
  const sendMessageToBackend = async (
    sessionId,
    messageContent,
    senderType
  ) => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.push("/auth");
        throw new Error("No authentication token");
      }

      const response = await fetch(
        `${API_BASE_URL}/chat/sessions/${sessionId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message_content: messageContent,
            sender_type: senderType,
          }),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("auth_token");
        router.push("/auth");
        throw new Error("Authentication required");
      }

      if (response.ok) {
        return await response.json();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  };

  const handleSendMessage = async () => {
    if (inputValue.trim() === "" || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // Start session jika belum ada
      let sessionId = currentSessionId;
      if (!sessionId) {
        sessionId = await startChatSession();
        if (!sessionId) {
          throw new Error("Failed to create session");
        }
      }

      // Add user message to UI
      const userMessage = {
        id: Date.now(),
        sender: "user",
        text: inputValue,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      const currentInput = inputValue;
      setInputValue("");

      // Send user message to backend first
      await sendMessageToBackend(sessionId, currentInput, "user");

      // Get AI response using Gemini endpoint
      const token = getAuthToken();
      const aiResponse = await fetch(`${API_BASE_URL}/chat/gemini`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_id: sessionId,
          message: currentInput,
        }),
      });

      if (aiResponse.status === 401) {
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("auth_token");
        router.push("/auth");
        return;
      }

      if (!aiResponse.ok) {
        const errorData = await aiResponse.json();
        throw new Error(errorData.message || "Failed to get AI response");
      }

      const aiData = await aiResponse.json();

      // Add bot response to UI
      const botMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: aiData.response,
        timestamp: new Date(),
        quickReplies: generateQuickReplies(aiData.response),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      setError("Sorry, I encountered an error. Please try again.");

      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        sender: "bot",
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = async (replyText) => {
    if (isLoading) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: replyText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      let sessionId = currentSessionId;
      if (!sessionId) {
        sessionId = await startChatSession();
      }

      if (sessionId) {
        // Send to backend
        await sendMessageToBackend(sessionId, replyText, "user");

        // Get AI response dari Gemini
        const token = getAuthToken();
        const aiResponse = await fetch(`${API_BASE_URL}/chat/gemini`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: sessionId,
            message: replyText,
          }),
        });

        if (aiResponse.status === 401) {
          localStorage.removeItem("jwt_token");
          localStorage.removeItem("auth_token");
          router.push("/auth");
          return;
        }

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();

          const botMessage = {
            id: Date.now() + 1,
            sender: "bot",
            text: aiData.response,
            timestamp: new Date(),
            quickReplies: generateQuickReplies(aiData.response),
          };

          setMessages((prev) => [...prev, botMessage]);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Sorry, I encountered an error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate quick replies berdasarkan context
  const generateQuickReplies = (botResponse) => {
    const response = botResponse.toLowerCase();

    if (response.includes("anxious") || response.includes("anxiety")) {
      return [
        { id: 1, text: "Try breathing exercise" },
        { id: 2, text: "Tell me more" },
        { id: 3, text: "What helps with this?" },
      ];
    } else if (
      response.includes("sad") ||
      response.includes("down") ||
      response.includes("depressed")
    ) {
      return [
        { id: 1, text: "I want to talk about it" },
        { id: 2, text: "Suggest activities" },
        { id: 3, text: "Help me feel better" },
      ];
    } else if (
      response.includes("breathing") ||
      response.includes("exercise")
    ) {
      return [
        { id: 1, text: "Yes, let's try it" },
        { id: 2, text: "Something else please" },
        { id: 3, text: "How does this help?" },
      ];
    }

    return [
      { id: 1, text: "Tell me more" },
      { id: 2, text: "That's helpful" },
      { id: 3, text: "What else can help?" },
    ];
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
              <h1 className="text-2xl font-bold">MindCare Chatbot</h1>
              <Button
                variant="outline"
                className="rounded-full border-orange-200 px-4"
              >
                <span className="mr-2 text-orange-500">User</span>
                <Avatar className="h-6 w-6 border border-orange-200">
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

                {error && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {messages.map((message) => (
                  <div key={message.id} className="mb-4">
                    {message.sender === "bot" ? (
                      <div className="flex items-start">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                          <MessageCircle className="h-4 w-4" />
                        </div>
                        <div className="ml-2 max-w-[80%]">
                          <div className="rounded-lg rounded-tl-none bg-white p-3 shadow-sm">
                            <p className="whitespace-pre-line">
                              {message.text}
                            </p>
                          </div>

                          {message.quickReplies && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {message.quickReplies.map((reply) => (
                                <button
                                  key={reply.id}
                                  className="rounded-full bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
                                  onClick={() => handleQuickReply(reply.text)}
                                  disabled={isLoading}
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

                {isLoading && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                    <span className="ml-2 text-sm text-gray-500">
                      AI is thinking...
                    </span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="border-t bg-white p-4">
                <div className="flex items-center gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 rounded-full border-gray-300"
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="h-10 w-10 rounded-full bg-blue-500 p-0 hover:bg-blue-600"
                    disabled={isLoading || !inputValue.trim()}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
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
                  <h2 className="text-lg font-medium">Chat History</h2>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-3">
                  {chatHistory.map((session) => (
                    <div
                      key={session.session_id}
                      className="flex items-start gap-2"
                    >
                      <Checkbox
                        id={`history-${session.session_id}`}
                        className="mt-1 border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-blue-500"
                      />
                      <div className="space-y-1">
                        <label
                          htmlFor={`history-${session.session_id}`}
                          className="block text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          Session {session.session_id}
                        </label>
                        <p className="text-xs text-blue-200">
                          {new Date(session.start_time).toLocaleDateString()}
                        </p>
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
