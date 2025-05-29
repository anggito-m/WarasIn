"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Send,
  Clock,
  Loader2,
  MessageCircle,
  Plus,
  MoreVertical,
} from "lucide-react";

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
  const [selectedSessions, setSelectedSessions] = useState(new Set());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check authentication and load chat sessions
  useEffect(() => {
    const initializeChat = async () => {
      console.log("Initializing chat component...");
      await checkAuthAndLoadData();
    };

    initializeChat();
  }, []);

  const checkAuthAndLoadData = async () => {
    console.log("Checking authentication...");
    const token = getAuthToken();
    console.log("Token found:", !!token);

    if (!token) {
      console.log("No token found, redirecting to auth");
      // Redirect to login if no token
      router.push("/auth");
      return;
    }

    console.log("Token found, loading chat sessions...");
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
      if (!token) {
        console.log("No token found for loading sessions");
        return;
      }

      console.log(
        "Loading chat sessions from:",
        `${API_BASE_URL}/chat/sessions`
      );
      console.log("Using token:", token.substring(0, 20) + "...");

      const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Chat sessions response status:", response.status);

      if (response.status === 401) {
        console.log("Unauthorized - clearing tokens");
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("auth_token");
        router.push("/auth");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log("Chat sessions data:", data);

        const sessions = data.sessions || [];
        console.log("Found sessions:", sessions.length);

        if (sessions.length === 0) {
          console.log("No sessions found for user");
          setChatHistory([]);
          return;
        }

        // Add preview untuk setiap session
        const sessionsWithPreview = await Promise.all(
          sessions.map(async (session) => {
            const preview = await getSessionPreview(session.session_id);
            console.log(`Preview for session ${session.session_id}:`, preview);
            return {
              ...session,
              preview: preview || "Click to view conversation...",
            };
          })
        );

        console.log("Sessions with preview:", sessionsWithPreview);
        setChatHistory(sessionsWithPreview);
      } else {
        const errorText = await response.text();
        console.error(
          "Failed to load chat sessions:",
          response.statusText,
          errorText
        );
        setError(`Failed to load chat history: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Failed to load chat sessions:", error);
      setError("Failed to load chat history");
    }
  };

  // Get preview dari first message di session
  const getSessionPreview = async (sessionId) => {
    try {
      const token = getAuthToken();
      if (!token) return null;

      const response = await fetch(
        `${API_BASE_URL}/chat/sessions/${sessionId}/messages?limit=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          const firstMessage = data.messages[0];
          // Return first user message as preview
          if (firstMessage.sender_type === "user") {
            return firstMessage.message_content.length > 50
              ? firstMessage.message_content.substring(0, 50) + "..."
              : firstMessage.message_content;
          }
        }
      }
      return null;
    } catch (error) {
      console.error("Failed to get session preview:", error);
      return null;
    }
  };

  // Load chat session messages
  const loadChatSession = async (sessionId) => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.push("/auth");
        return;
      }

      setCurrentSessionId(sessionId);

      const response = await fetch(
        `${API_BASE_URL}/chat/sessions/${sessionId}/messages?limit=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("auth_token");
        router.push("/auth");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        const formattedMessages = (data.messages || [])
          .reverse()
          .map((msg) => ({
            id: msg.message_id,
            sender: msg.sender_type === "user" ? "user" : "bot",
            text: msg.message_content,
            timestamp: new Date(msg.sent_at),
            quickReplies:
              msg.sender_type === "bot"
                ? generateQuickReplies(msg.message_content)
                : undefined,
          }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Failed to load chat session:", error);
      setError("Failed to load chat history");
    }
  };

  // Start new chat session
  const startNewChat = async () => {
    try {
      const session = await startChatSession();
      if (session) {
        setCurrentSessionId(session.session_id);
        setMessages([
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

        // Refresh chat history
        await loadChatSessions();
      }
    } catch (error) {
      console.error("Failed to start new chat:", error);
      setError("Failed to start new chat session");
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

      console.log("Starting new chat session");

      const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Start session response status:", response.status);

      if (response.status === 401) {
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("auth_token");
        router.push("/auth");
        return null;
      }

      if (response.ok) {
        const session = await response.json();
        console.log("New session created:", session);
        return session;
      } else {
        const errorData = await response.json();
        console.error("Failed to start session:", errorData);
        throw new Error(errorData.message || "Failed to start session");
      }
    } catch (error) {
      console.error("Failed to start session:", error);
      setError("Failed to start chat session");
      return null;
    }
  };

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

      console.log(
        `Sending ${senderType} message to session ${sessionId}:`,
        messageContent
      );

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

      console.log(`Send message response status:`, response.status);

      if (response.status === 401) {
        localStorage.removeItem("jwt_token");
        localStorage.removeItem("auth_token");
        router.push("/auth");
        throw new Error("Authentication required");
      }

      if (response.ok) {
        const result = await response.json();
        console.log("Message sent successfully:", result);
        return result;
      } else {
        const errorData = await response.json();
        console.error("Failed to send message:", errorData);
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
        const session = await startChatSession();
        if (!session) {
          throw new Error("Failed to create session");
        }
        sessionId = session.session_id;
        setCurrentSessionId(sessionId);
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

      // Refresh chat history if this is a new session
      if (!currentSessionId) {
        await loadChatSessions();
      }
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
        const session = await startChatSession();
        if (!session) {
          throw new Error("Failed to create session");
        }
        sessionId = session.session_id;
        setCurrentSessionId(sessionId);
      }

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

  const formatSessionDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return date.toLocaleDateString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const toggleSessionSelection = (sessionId) => {
    const newSelected = new Set(selectedSessions);
    if (newSelected.has(sessionId)) {
      newSelected.delete(sessionId);
    } else {
      newSelected.add(sessionId);
    }
    setSelectedSessions(newSelected);
  };

  const deleteSelectedSessions = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      // Delete sessions from backend
      const deletePromises = Array.from(selectedSessions).map(
        async (sessionId) => {
          console.log(`Deleting session ${sessionId}`);
          try {
            const response = await fetch(
              `${API_BASE_URL}/chat/sessions/${sessionId}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (!response.ok) {
              const errorData = await response.json();
              console.error(
                `Failed to delete session ${sessionId}:`,
                errorData
              );
              throw new Error(`Failed to delete session ${sessionId}`);
            }

            console.log(`Successfully deleted session ${sessionId}`);
          } catch (error) {
            console.error(`Error deleting session ${sessionId}:`, error);
            throw error;
          }
        }
      );

      // Wait for all deletions to complete
      await Promise.all(deletePromises);

      // Update local state
      const updatedHistory = chatHistory.filter(
        (session) => !selectedSessions.has(session.session_id)
      );
      setChatHistory(updatedHistory);
      setSelectedSessions(new Set());

      // Clear current session if it was deleted
      if (selectedSessions.has(currentSessionId)) {
        setCurrentSessionId(null);
        setMessages([
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
      }
    } catch (error) {
      console.error("Failed to delete sessions:", error);
      setError("Failed to delete selected sessions");
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-gray-50">
      {/* Fixed Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">MindCare Chatbot</h1>
          <Button
            variant="outline"
            className="rounded-full border-orange-200 px-4 hover:bg-orange-50"
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
        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Fixed Chat Header */}
          <div className="border-b bg-gray-50 px-4 py-3">
            <div className="text-center text-sm text-gray-500">
              Today, {formatTime(new Date())}
            </div>
            {error && (
              <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Scrollable Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="mb-4">
                {message.sender === "bot" ? (
                  <div className="flex items-start">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-500 flex-shrink-0">
                      <MessageCircle className="h-4 w-4" />
                    </div>
                    <div className="ml-3 max-w-[80%]">
                      <div className="rounded-lg rounded-tl-none bg-gray-100 p-3 shadow-sm">
                        <p className="whitespace-pre-line text-gray-800">
                          {message.text}
                        </p>
                      </div>

                      {message.quickReplies && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {message.quickReplies.map((reply) => (
                            <button
                              key={reply.id}
                              className="rounded-full bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
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

          {/* Fixed Input Area */}
          <div className="border-t bg-white p-4">
            <div className="flex items-center gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                className="h-10 w-10 rounded-full bg-blue-500 p-0 hover:bg-blue-600 transition-colors"
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

        {/* Fixed History Sidebar */}
        <div className="hidden w-80 flex-col bg-blue-500 text-white md:flex">
          {/* Fixed Sidebar Header */}
          <div className="border-b border-blue-400 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-md bg-white/20 p-1">
                  <Clock className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-medium">Chat History</h2>
              </div>
              <Button
                onClick={startNewChat}
                size="sm"
                variant="outline"
                className="border-white/30 text-blue-400 hover:bg-white/10 h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {selectedSessions.size > 0 && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-blue-200">
                  {selectedSessions.size} selected
                </span>
                <Button
                  onClick={deleteSelectedSessions}
                  size="xl"
                  variant="outline"
                  className="border-red-300 text-red-200 hover:bg-red-500/20 h-7 px-2 text-xs"
                >
                  Delete
                </Button>
              </div>
            )}
          </div>

          {/* Scrollable History List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {chatHistory.map((session) => (
                <div
                  key={session.session_id}
                  className={`group relative rounded-lg p-3 transition-all hover:bg-white/10 cursor-pointer ${
                    currentSessionId === session.session_id ? "bg-white/20" : ""
                  }`}
                  onClick={() => loadChatSession(session.session_id)}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={selectedSessions.has(session.session_id)}
                      onChange={() =>
                        toggleSessionSelection(session.session_id)
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="mt-1 border-white/50 data-[state=checked]:bg-white data-[state=checked]:text-blue-500"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">
                          Session {session.session_id}
                        </h3>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-white/70 hover:text-white hover:bg-white/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle individual session options
                          }}
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-blue-200 truncate">
                        {session.preview}
                      </p>
                      <p className="text-xs text-blue-300">
                        {formatSessionDate(session.start_time)}
                      </p>
                      {session.end_time && (
                        <div className="text-xs text-blue-300 flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-green-400"></div>
                          Completed
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {chatHistory.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-blue-200 text-sm">
                    No chat history yet
                  </div>
                  <div className="text-blue-300 text-xs mt-1">
                    Start a conversation to see your history here
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
