"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link"; // Jika Anda menggunakannya di Footer atau Navigation
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  Calendar,
  Clock,
  Plus,
  Edit3,
  Trash2,
  Tag,
  Smile,
  Frown,
  Meh,
  Heart,
  Star,
  BookOpen,
  Filter,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
// import { Navigation } from "@/components/navigation"; // Uncomment jika ada
// import { Footer } from "@/components/footer"; // Uncomment jika ada

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function SmartJournalPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
    mood: "neutral",
    tags: [],
  });

  const [journalEntries, setJournalEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageError, setPageError] = useState(null);
  const [pageSuccess, setPageSuccess] = useState(null);

  const messagesEndRef = useRef(null); // Tidak terpakai di kode ini, bisa dihapus jika tidak ada scroll logic lain

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("jwt_token");
    }
    return null;
  };

  const fetchJournalEntries = async () => {
    setIsLoading(true);
    setPageError(null);
    const token = getAuthToken();
    if (!token) {
      router.push("/auth"); // Redirect jika tidak ada token
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/journal?limit=100&offset=0`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 401) {
        localStorage.removeItem("jwt_token");
        router.push("/auth");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch journal entries");
      }

      const data = await response.json();
      const fetchedEntries = (data.entries || []).map((entry) => {
        const contentParts = entry.content.split("\n\n");
        let title = `Entry ${entry.journal_id}`;
        let mainContent = entry.content;
        if (contentParts.length > 1 && contentParts[0].length < 100) {
          title = contentParts[0];
          mainContent = contentParts.slice(1).join("\n\n");
        }
        return {
          id: entry.journal_id,
          title: title,
          content: mainContent,
          date: new Date(entry.created_at),
          mood: "neutral", // Default, karena tidak ada di data journal backend
          tags: [], // Default, karena tidak ada di data journal backend
          isFavorite: false, // Default, karena tidak ada di data journal backend
          user_id: entry.user_id,
          created_at: entry.created_at,
          updated_at: entry.updated_at,
        };
      });
      setJournalEntries(
        fetchedEntries.sort((a, b) => new Date(b.date) - new Date(a.date))
      );
    } catch (err) {
      setPageError(err.message || "Could not load journals.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJournalEntries();
  }, []); // Hanya dijalankan sekali saat komponen mount

  const moodIcons = {
    happy: <Smile className="h-5 w-5 text-green-500" />,
    sad: <Frown className="h-5 w-5 text-blue-500" />,
    stressed: <Frown className="h-5 w-5 text-red-500" />,
    peaceful: <Smile className="h-5 w-5 text-teal-500" />,
    grateful: <Heart className="h-5 w-5 text-pink-500" />,
    neutral: <Meh className="h-5 w-5 text-gray-500" />,
  };

  const moodOptions = [
    { value: "happy", label: "Happy", icon: <Smile className="h-5 w-5" /> },
    { value: "sad", label: "Sad", icon: <Frown className="h-5 w-5" /> },
    {
      value: "stressed",
      label: "Stressed",
      icon: <Frown className="h-5 w-5" />,
    },
    {
      value: "peaceful",
      label: "Peaceful",
      icon: <Smile className="h-5 w-5" />,
    },
    {
      value: "grateful",
      label: "Grateful",
      icon: <Heart className="h-5 w-5" />,
    },
    { value: "neutral", label: "Neutral", icon: <Meh className="h-5 w-5" /> },
  ];

  const filteredEntries = journalEntries
    .filter((entry) => {
      if (activeTab === "all") return true;
      if (activeTab === "favorites") return entry.isFavorite;
      return entry.mood === activeTab;
    })
    .filter((entry) => {
      if (!searchQuery) return true;
      const SQuery = searchQuery.toLowerCase();
      return (
        (entry.title && entry.title.toLowerCase().includes(SQuery)) ||
        (entry.content && entry.content.toLowerCase().includes(SQuery)) ||
        (entry.tags &&
          entry.tags.some((tag) => tag.toLowerCase().includes(SQuery)))
      );
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleCreateNewEntry = () => {
    setSelectedEntry(null);
    setIsEditing(true);
    setNewEntry({ title: "", content: "", mood: "neutral", tags: [] });
    setPageError(null);
    setPageSuccess(null);
  };

  const handleEditEntry = (entry) => {
    setSelectedEntry(entry);
    setIsEditing(true);
    setNewEntry({
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      tags: [...entry.tags],
    });
    setPageError(null);
    setPageSuccess(null);
  };

  const handleSaveEntry = async () => {
    setPageError(null);
    setPageSuccess(null);
    if (!newEntry.title.trim() && !newEntry.content.trim()) {
      setPageError("Title or content cannot be empty.");
      return;
    }
    setIsLoading(true);

    const token = getAuthToken();
    if (!token) {
      setPageError("Authentication required.");
      setIsLoading(false);
      router.push("/auth");
      return;
    }

    const combinedContent = `${newEntry.title}\n\n${newEntry.content}`;
    const apiPayload = { content: combinedContent };

    const method = selectedEntry ? "PATCH" : "POST";
    const endpoint = selectedEntry
      ? `${API_BASE_URL}/journal/${selectedEntry.id}`
      : `${API_BASE_URL}/journal`;

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiPayload),
      });

      if (response.status === 401) {
        localStorage.removeItem("jwt_token");
        router.push("/auth");
        return;
      }

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(
          responseData.message ||
            `Failed to ${selectedEntry ? "update" : "create"} journal`
        );
      }

      setPageSuccess(
        `Journal entry ${selectedEntry ? "updated" : "created"} successfully!`
      );
      setIsEditing(false);
      await fetchJournalEntries(); // Re-fetch untuk data terbaru

      // Update selectedEntry dengan data dari backend jika berhasil
      if (method === "POST" && responseData.journal_id) {
        const newlyCreatedEntry =
          (await fetchJournalEntries(),
          journalEntries.find((je) => je.id === responseData.journal_id) || {
            id: responseData.journal_id,
            title: newEntry.title,
            content: newEntry.content,
            date: new Date(responseData.created_at || Date.now()),
            mood: newEntry.mood,
            tags: newEntry.tags,
            isFavorite: false,
            user_id: responseData.user_id,
            created_at: responseData.created_at,
            updated_at: responseData.updated_at,
          });
        setSelectedEntry(newlyCreatedEntry);
      } else if (
        method === "PATCH" &&
        selectedEntry &&
        responseData.journal_id
      ) {
        const updatedEntryData =
          (await fetchJournalEntries(),
          journalEntries.find((je) => je.id === responseData.journal_id) || {
            ...selectedEntry,
            title: newEntry.title,
            content: newEntry.content,
            mood: newEntry.mood,
            tags: newEntry.tags,
            date: new Date(responseData.updated_at || selectedEntry.date),
            updated_at: responseData.updated_at,
          });
        setSelectedEntry(updatedEntryData);
      }
    } catch (err) {
      setPageError(err.message || "An error occurred while saving.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEntry = async (id) => {
    if (!confirm("Are you sure you want to delete this journal entry?")) return;
    setPageError(null);
    setPageSuccess(null);
    setIsLoading(true);

    const token = getAuthToken();
    if (!token) {
      setPageError("Authentication required.");
      setIsLoading(false);
      router.push("/auth");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/journal/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem("jwt_token");
        router.push("/auth");
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete journal entry");
      }

      setPageSuccess("Journal entry deleted successfully.");
      setJournalEntries((prevEntries) =>
        prevEntries.filter((entry) => entry.id !== id)
      );
      if (selectedEntry && selectedEntry.id === id) {
        setSelectedEntry(null);
        setIsEditing(false);
      }
    } catch (err) {
      setPageError(err.message || "Could not delete entry.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = (id) => {
    setJournalEntries(
      journalEntries.map((entry) =>
        entry.id === id ? { ...entry, isFavorite: !entry.isFavorite } : entry
      )
    );
    if (selectedEntry && selectedEntry.id === id) {
      setSelectedEntry({
        ...selectedEntry,
        isFavorite: !selectedEntry.isFavorite,
      });
    }
    setPageSuccess(`Favorite status updated for entry ${id}. (Frontend only)`);
  };

  const handleAddTag = (e) => {
    const inputElement = e.target;
    if (e.key === "Enter" && inputElement.value.trim()) {
      const newTag = inputElement.value.trim().toLowerCase();
      if (!newEntry.tags.includes(newTag)) {
        setNewEntry({ ...newEntry, tags: [...newEntry.tags, newTag] });
      }
      inputElement.value = "";
      e.preventDefault();
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewEntry({
      ...newEntry,
      tags: newEntry.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {" "}
      {/* Added bg-gray-50 */}
      {/* <Navigation /> */}
      <div className="flex flex-1">
        <main className="flex-1 flex flex-col">
          <div className="border-b bg-white">
            {" "}
            {/* Added bg-white */}
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold">Smart Journal</h1>
              <Button
                variant="outline"
                className="rounded-full border-orange-200 px-4"
              >
                <span className="mr-2 text-orange-500">User</span>
                <Avatar className="h-6 w-6 border border-orange-200">
                  <AvatarImage src="/placeholder.svg" />{" "}
                  {/* Ganti dengan gambar user jika ada */}
                  <AvatarFallback className="bg-orange-100 text-orange-500">
                    U
                  </AvatarFallback>
                </Avatar>
              </Button>
            </div>
          </div>

          <div className="container mx-auto px-6 pt-4">
            {pageError && (
              <Alert
                variant="destructive"
                className="bg-red-50 text-red-700 border-red-200 mb-4"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertDescription>{pageError}</AlertDescription>
              </Alert>
            )}
            {pageSuccess && (
              <Alert className="bg-green-50 text-green-700 border-green-200 mb-4">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                <AlertDescription>{pageSuccess}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex-1 flex overflow-hidden container mx-auto px-6 py-8 gap-6">
            {" "}
            {/* Added gap-6 */}
            <div className="w-80 border-r flex flex-col bg-white p-4 rounded-lg shadow-sm">
              {" "}
              {/* Added bg, p, rounded, shadow */}
              <div className="pb-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search journals..."
                    className="pl-9 pr-4"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="py-4 border-b">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-medium">Filter by</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-gray-600 hover:bg-gray-100"
                    >
                      <Filter className="h-4 w-4 mr-1" />
                      <span className="text-xs">More</span>
                    </Button>
                  </div>
                  <TabsList className="grid grid-cols-3 mb-2 w-full">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="favorites">Favorites</TabsTrigger>
                    <TabsTrigger value="happy">Happy</TabsTrigger>
                  </TabsList>
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="sad">Sad</TabsTrigger>
                    <TabsTrigger value="stressed">Stressed</TabsTrigger>
                    <TabsTrigger value="peaceful">Peaceful</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="flex-1 overflow-y-auto pt-4">
                <div className="pb-4">
                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={handleCreateNewEntry}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Journal Entry
                  </Button>
                </div>

                {isLoading && journalEntries.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Loading entries...
                  </div>
                )}

                <div className="space-y-2">
                  {filteredEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                        selectedEntry && selectedEntry.id === entry.id
                          ? "border-blue-500 bg-blue-50"
                          : "hover:bg-gray-100 border-gray-200" // Slightly improved hover
                      }`}
                      onClick={() => {
                        setSelectedEntry(entry);
                        setIsEditing(false);
                        setPageError(null);
                        setPageSuccess(null);
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center min-w-0">
                          {moodIcons[entry.mood] || moodIcons["neutral"]}
                          <h3 className="font-medium ml-2 truncate text-gray-800">
                            {entry.title}
                          </h3>
                        </div>
                        {entry.isFavorite && (
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {entry.content}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{format(new Date(entry.date), "MMM d, yy")}</span>
                        <Clock className="h-3 w-3 ml-2 mr-1" />
                        <span>{format(new Date(entry.date), "h:mm a")}</span>
                      </div>
                    </div>
                  ))}
                  {filteredEntries.length === 0 && !isLoading && (
                    <p className="text-center text-gray-500 py-4">
                      No journal entries found.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden bg-white p-1 rounded-lg shadow-sm">
              {selectedEntry && !isEditing ? (
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center min-w-0">
                        {moodIcons[selectedEntry.mood] || moodIcons["neutral"]}
                        <h2 className="text-2xl font-bold ml-2 truncate text-gray-800">
                          {selectedEntry.title}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleToggleFavorite(selectedEntry.id)}
                          title={
                            selectedEntry.isFavorite
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                          className={
                            selectedEntry.isFavorite
                              ? "text-yellow-500 border-yellow-400 hover:bg-yellow-50"
                              : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                          }
                        >
                          <Star
                            className={`h-4 w-4 ${
                              selectedEntry.isFavorite ? "fill-yellow-400" : "" // No fill for non-favorite
                            }`}
                          />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          title="Edit entry"
                          onClick={() => handleEditEntry(selectedEntry)}
                          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          title="Delete entry"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-300 hover:border-red-400"
                          onClick={() => handleDeleteEntry(selectedEntry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        {format(new Date(selectedEntry.date), "MMMM d, yyyy")}
                      </span>{" "}
                      {/* Completed here */}
                      <Clock className="h-4 w-4 ml-4 mr-1" />
                      <span>
                        {format(new Date(selectedEntry.date), "h:mm a")}
                      </span>
                    </div>

                    <div className="prose max-w-none mb-6 text-gray-700">
                      <p className="whitespace-pre-line">
                        {selectedEntry.content}
                      </p>
                    </div>

                    {selectedEntry.tags.length > 0 && (
                      <div className="flex items-center flex-wrap gap-2 mb-6">
                        <Tag className="h-4 w-4 text-gray-400 mr-1" />
                        {selectedEntry.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : isEditing ? (
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-800">
                        {selectedEntry
                          ? "Edit Journal Entry"
                          : "New Journal Entry"}
                      </h2>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditing(false);
                            if (!selectedEntry && journalEntries.length > 0) {
                              // setSelectedEntry(journalEntries[0]); // Optionally select first entry or clear
                            }
                          }}
                          disabled={isLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                          onClick={handleSaveEntry}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Save"
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label
                          htmlFor="title"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Title
                        </label>
                        <Input
                          id="title"
                          value={newEntry.title}
                          onChange={(e) =>
                            setNewEntry({ ...newEntry, title: e.target.value })
                          }
                          placeholder="Enter a title for your journal entry"
                          disabled={isLoading}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="content"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Content
                        </label>
                        <Textarea
                          id="content"
                          value={newEntry.content}
                          onChange={(e) =>
                            setNewEntry({
                              ...newEntry,
                              content: e.target.value,
                            })
                          }
                          placeholder="Write your thoughts here..."
                          className="min-h-[300px] border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mood (Optional)
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {moodOptions.map((moodOpt) => (
                            <Button
                              key={moodOpt.value}
                              type="button"
                              variant={
                                newEntry.mood === moodOpt.value
                                  ? "default"
                                  : "outline"
                              }
                              className={`flex items-center gap-1 ${
                                newEntry.mood === moodOpt.value
                                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                                  : "text-gray-700 border-gray-300 hover:bg-gray-50"
                              }`}
                              onClick={() =>
                                setNewEntry({
                                  ...newEntry,
                                  mood: moodOpt.value,
                                })
                              }
                              disabled={isLoading}
                            >
                              {moodOpt.icon}
                              <span>{moodOpt.label}</span>
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="tags"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Tags (Optional, press Enter to add)
                        </label>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {newEntry.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="flex items-center gap-1 bg-gray-200 text-gray-700"
                            >
                              #{tag}
                              <button
                                type="button"
                                className="ml-1 text-gray-500 hover:text-gray-700"
                                onClick={() => handleRemoveTag(tag)}
                                disabled={isLoading}
                              >
                                &times;
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <Input
                          id="tags"
                          placeholder="Add tags..."
                          onKeyDown={handleAddTag}
                          disabled={isLoading}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-6 bg-gray-100 rounded-md">
                  {" "}
                  {/* Slightly different bg */}
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                      <BookOpen className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-medium mb-2 text-gray-700">
                      Select or Create a Journal Entry
                    </h3>
                    <p className="text-gray-500 mb-4 max-w-md">
                      Select an existing entry from the list on the left, or
                      create a new one to get started.
                    </p>
                    <Button
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                      onClick={handleCreateNewEntry}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      New Journal Entry
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-5">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo.svg"
                  alt="Warasin Logo"
                  width={40}
                  height={40}
                  className="h-10 w-10"
                />
                <span className="text-blue-500 font-bold text-xl">Warasin</span>
                <div className="relative">
                  <div className="absolute -top-1 -right-4 h-3 w-3 rounded-full bg-blue-500"></div>
                </div>
              </div>
              <p className="text-gray-500 mb-4">
                Warasin is a mental health platform dedicated to providing
                accessible tools and resources for self-reflection, emotional
                well-being, and personal growth. Our mission is to empower
                individuals to better understand their thoughts and feelings,
                fostering a supportive environment for mental wellness.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Facebook</span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Twitter</span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">Instagram</span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">LinkedIn</span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-gray-500">
                  <span className="sr-only">YouTube</span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-blue-500 mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Case studies
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Reviews
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Updates
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-blue-500 mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Contact us
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Culture
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium text-blue-500 mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Getting started
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Help center
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Server status
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Report a bug
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Chat support
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">Copyright © 2025</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link
                href="#"
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Terms and Conditions
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="#"
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
