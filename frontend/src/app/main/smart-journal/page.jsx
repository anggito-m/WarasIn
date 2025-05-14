"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

export default function SmartJournalPage() {
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

  // Sample journal entries
  const [journalEntries, setJournalEntries] = useState([
    {
      id: 1,
      title: "Morning Reflection",
      content:
        "Today I woke up feeling refreshed after a good night's sleep. I had a nutritious breakfast and spent some time meditating before starting my day. I'm feeling optimistic about the challenges ahead.",
      date: new Date(2023, 4, 15),
      mood: "happy",
      tags: ["morning", "meditation", "wellness"],
      isFavorite: true,
    },
    {
      id: 2,
      title: "Work Stress",
      content:
        "The project deadline is approaching and I'm feeling overwhelmed with the amount of work left to do. I need to remember to take breaks and practice deep breathing when I feel anxious.",
      date: new Date(2023, 4, 14),
      mood: "stressed",
      tags: ["work", "stress", "self-care"],
      isFavorite: false,
    },
    {
      id: 3,
      title: "Evening Walk",
      content:
        "I took a long walk in the park this evening. The fresh air and natural surroundings helped clear my mind. I noticed the beautiful sunset and took a moment to appreciate the present.",
      date: new Date(2023, 4, 13),
      mood: "peaceful",
      tags: ["nature", "mindfulness", "exercise"],
      isFavorite: true,
    },
    {
      id: 4,
      title: "Friendship Reflection",
      content:
        "Had a deep conversation with an old friend today. It reminded me of the importance of maintaining meaningful connections. We shared our struggles and victories, and I felt understood.",
      date: new Date(2023, 4, 12),
      mood: "grateful",
      tags: ["friendship", "connection", "gratitude"],
      isFavorite: false,
    },
    {
      id: 5,
      title: "Feeling Down",
      content:
        "Today was difficult. I felt a persistent sadness that I couldn't shake off. I'm trying to remember that emotions are temporary and it's okay to have bad days. Tomorrow is a new opportunity.",
      date: new Date(2023, 4, 11),
      mood: "sad",
      tags: ["emotions", "self-compassion", "healing"],
      isFavorite: false,
    },
  ]);

  const moodIcons = {
    happy: <Smile className="h-5 w-5 text-green-500" />,
    sad: <Frown className="h-5 w-5 text-blue-500" />,
    stressed: <Frown className="h-5 w-5 text-red-500" />,
    peaceful: <Smile className="h-5 w-5 text-blue-300" />,
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
      return (
        entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    })
    .sort((a, b) => b.date - a.date);

  const handleCreateNewEntry = () => {
    setSelectedEntry(null);
    setIsEditing(true);
    setNewEntry({
      title: "",
      content: "",
      mood: "neutral",
      tags: [],
    });
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
  };

  const handleSaveEntry = () => {
    if (selectedEntry) {
      // Edit existing entry
      setJournalEntries(
        journalEntries.map((entry) =>
          entry.id === selectedEntry.id
            ? {
                ...entry,
                title: newEntry.title,
                content: newEntry.content,
                mood: newEntry.mood,
                tags: newEntry.tags,
              }
            : entry
        )
      );
    } else {
      // Create new entry
      const newId = Math.max(0, ...journalEntries.map((entry) => entry.id)) + 1;
      setJournalEntries([
        {
          id: newId,
          title: newEntry.title,
          content: newEntry.content,
          date: new Date(),
          mood: newEntry.mood,
          tags: newEntry.tags,
          isFavorite: false,
        },
        ...journalEntries,
      ]);
    }
    setIsEditing(false);
  };

  const handleDeleteEntry = (id) => {
    setJournalEntries(journalEntries.filter((entry) => entry.id !== id));
    if (selectedEntry && selectedEntry.id === id) {
      setSelectedEntry(null);
      setIsEditing(false);
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
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      const newTag = e.target.value.trim().toLowerCase();
      if (!newEntry.tags.includes(newTag)) {
        setNewEntry({ ...newEntry, tags: [...newEntry.tags, newTag] });
      }
      e.target.value = "";
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewEntry({
      ...newEntry,
      tags: newEntry.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <main className="flex-1 flex flex-col">
          <div className="border-b">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold">Smart Journal</h1>
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

          <div className="flex-1 flex overflow-hidden">
            {/* Journal entries list */}
            <div className="w-80 border-r flex flex-col">
              <div className="p-4 border-b">
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

              <div className="p-4 border-b">
                <Tabs
                  defaultValue="all"
                  value={activeTab}
                  onValueChange={setActiveTab}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-medium">Filter by</h2>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <Filter className="h-4 w-4 mr-1" />
                      <span className="text-xs">More filters</span>
                    </Button>
                  </div>
                  <TabsList className="grid grid-cols-3 mb-2">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="favorites">Favorites</TabsTrigger>
                    <TabsTrigger value="happy">Happy</TabsTrigger>
                  </TabsList>
                  <TabsList className="grid grid-cols-3">
                    <TabsTrigger value="sad">Sad</TabsTrigger>
                    <TabsTrigger value="stressed">Stressed</TabsTrigger>
                    <TabsTrigger value="peaceful">Peaceful</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  <Button
                    className="w-full bg-blue-500 hover:bg-blue-600"
                    onClick={handleCreateNewEntry}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Journal Entry
                  </Button>
                </div>

                <div className="space-y-2 p-4">
                  {filteredEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className={`rounded-lg border p-3 cursor-pointer transition-colors ${
                        selectedEntry && selectedEntry.id === entry.id
                          ? "border-blue-500 bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setSelectedEntry(entry);
                        setIsEditing(false);
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center">
                          {moodIcons[entry.mood]}
                          <h3 className="font-medium ml-2 truncate">
                            {entry.title}
                          </h3>
                        </div>
                        {entry.isFavorite && (
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                        {entry.content}
                      </p>
                      <div className="flex items-center text-xs text-gray-400">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{format(entry.date, "MMM d, yyyy")}</span>
                        <Clock className="h-3 w-3 ml-2 mr-1" />
                        <span>{format(entry.date, "h:mm a")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Journal entry detail/editor */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {selectedEntry && !isEditing ? (
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-3xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center">
                        {moodIcons[selectedEntry.mood]}
                        <h2 className="text-2xl font-bold ml-2">
                          {selectedEntry.title}
                        </h2>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleToggleFavorite(selectedEntry.id)}
                          className={
                            selectedEntry.isFavorite
                              ? "text-yellow-400"
                              : "text-gray-400"
                          }
                        >
                          <Star
                            className={`h-4 w-4 ${
                              selectedEntry.isFavorite
                                ? "fill-yellow-400"
                                : "fill-none"
                            }`}
                          />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEditEntry(selectedEntry)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500"
                          onClick={() => handleDeleteEntry(selectedEntry.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{format(selectedEntry.date, "MMMM d, yyyy")}</span>
                      <Clock className="h-4 w-4 ml-4 mr-1" />
                      <span>{format(selectedEntry.date, "h:mm a")}</span>
                    </div>

                    <div className="prose max-w-none mb-6">
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
                      <h2 className="text-2xl font-bold">
                        {selectedEntry
                          ? "Edit Journal Entry"
                          : "New Journal Entry"}
                      </h2>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          className="bg-blue-500 hover:bg-blue-600"
                          onClick={handleSaveEntry}
                        >
                          Save
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
                          className="min-h-[300px]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mood
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {moodOptions.map((mood) => (
                            <Button
                              key={mood.value}
                              type="button"
                              variant={
                                newEntry.mood === mood.value
                                  ? "default"
                                  : "outline"
                              }
                              className={`flex items-center gap-1 ${
                                newEntry.mood === mood.value
                                  ? "bg-blue-500 hover:bg-blue-600"
                                  : ""
                              }`}
                              onClick={() =>
                                setNewEntry({ ...newEntry, mood: mood.value })
                              }
                            >
                              {mood.icon}
                              <span>{mood.label}</span>
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="tags"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Tags
                        </label>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {newEntry.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              #{tag}
                              <button
                                type="button"
                                className="ml-1 text-gray-400 hover:text-gray-600"
                                onClick={() => handleRemoveTag(tag)}
                              >
                                &times;
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <Input
                          id="tags"
                          placeholder="Add tags (press Enter after each tag)"
                          onKeyDown={handleAddTag}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                      <BookOpen className="h-8 w-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      Select or Create a Journal Entry
                    </h3>
                    <p className="text-gray-500 mb-4 max-w-md">
                      Select an existing entry from the list or create a new one
                      to start journaling your thoughts and feelings.
                    </p>
                    <Button
                      className="bg-blue-500 hover:bg-blue-600"
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
                Lorem ipsum dolor sit amet consectetur adipiscing elit aliquam
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
