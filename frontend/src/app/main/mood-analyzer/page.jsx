"use client";

import { useState, useEffect, useMemo } from "react"; // Ditambahkan useMemo
import { useRouter } from "next/navigation";
import {
  format,
  subDays,
  subMonths,
  subYears,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns"; // Ditambahkan fungsi date-fns
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  FileText,
  Smile,
  Frown,
  Meh,
  Heart,
  Brain,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Lightbulb,
  Loader2,
} from "lucide-react";
import { Footer } from "@/components/footer";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MoodAnalyzerPage() {
  const router = useRouter();
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [timeRange, setTimeRange] = useState("week"); // Default ke 'week'
  const [textToAnalyze, setTextToAnalyze] = useState("");
  const [analysisMessage, setAnalysisMessage] = useState(null);
  const [analysisStatus, setAnalysisStatus] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const [journalEntries, setJournalEntries] = useState([]);

  // State untuk data kartu overview dinamis
  const [currentMoodDisplay, setCurrentMoodDisplay] = useState("N/A");
  const [avgMoodScoreDisplay, setAvgMoodScoreDisplay] = useState({
    score: 0,
    count: 0,
  });
  const [dominantEmotionsDisplay, setDominantEmotionsDisplay] = useState([]);
  const [moodTrendDataOverview, setMoodTrendDataOverview] = useState([]);

  // Sample data untuk grafik (akan diganti sebagian oleh data dinamis)
  // const moodTrendData = [ /* Dihapus, akan digenerate */ ];
  const emotionIntensityData = [{ emotion: "Joy", score: 75 }]; // Ini masih sampel
  const aiInsights = [
    { title: "Positive Outlook", description: "...", type: "positive" },
  ]; // Ini masih sampel
  const commonWords = [{ text: "grateful", value: 25 }]; // Ini masih sampel

  const getAuthToken = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("jwt_token");
    }
    return null;
  };

  const fetchJournalEntries = async () => {
    setIsLoadingEntries(true);
    setFetchError(null);
    const token = getAuthToken();
    if (!token) {
      setIsLoadingEntries(false);
      setFetchError("Please log in to see your journal entries.");
      // router.push("/auth"); // Pertimbangkan apakah mau redirect atau hanya tampilkan pesan
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/journal?limit=200&offset=0`,
        {
          // Ambil lebih banyak data untuk overview
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
          analyzed: false,
          moodScore: 0,
          primaryEmotion: "unknown",
        };
      });
      // TODO: Idealnya, backend mengirimkan data mood jika ada.
      // Untuk sekarang, kita akan mengandalkan entri yang dianalisis di sesi ini.
      setJournalEntries(
        fetchedEntries.sort((a, b) => new Date(b.date) - new Date(a.date))
      );
    } catch (err) {
      console.error("Fetch journal entries error:", err);
      setFetchError(err.message || "Could not load your journals.");
    } finally {
      setIsLoadingEntries(false);
    }
  };

  useEffect(() => {
    fetchJournalEntries();
  }, []);

  // Fungsi helper untuk memfilter entri berdasarkan rentang waktu
  const getEntriesInTimeRange = (entries, range) => {
    const now = new Date();
    let filterStartDate;

    switch (range) {
      case "day":
        filterStartDate = startOfDay(now);
        break;
      case "week":
        filterStartDate = startOfWeek(now, { weekStartsOn: 1 }); // Minggu dimulai hari Senin
        break;
      case "month":
        filterStartDate = startOfMonth(now);
        break;
      case "year":
        filterStartDate = startOfYear(now);
        break;
      default: // Jika tidak ada range spesifik atau 'all time'
        return entries;
    }
    // Filter entri yang tanggalnya lebih besar atau sama dengan filterStartDate dan kurang dari atau sama dengan sekarang
    return entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= filterStartDate && entryDate <= endOfDay(now); // pastikan membandingkan hingga akhir hari ini
    });
  };

  // useEffect untuk menghitung data kartu overview
  useEffect(() => {
    const analyzedEntriesGlobal = journalEntries.filter((e) => e.analyzed); // Semua entri yang sudah dianalisis
    const entriesInSelectedRange = getEntriesInTimeRange(
      analyzedEntriesGlobal,
      timeRange
    );

    // 1. Current Mood (dari entri terbaru yang dianalisis dalam rentang waktu)
    if (entriesInSelectedRange.length > 0) {
      // Sudah diurutkan descending by date saat fetch/add
      setCurrentMoodDisplay(entriesInSelectedRange[0].primaryEmotion || "N/A");
    } else if (analyzedEntriesGlobal.length > 0) {
      // Jika tidak ada di rentang waktu, ambil dari yang paling baru secara global
      setCurrentMoodDisplay(analyzedEntriesGlobal[0].primaryEmotion || "N/A");
    } else {
      setCurrentMoodDisplay("N/A");
    }

    // 2. Average Mood Score (dari entri dalam rentang waktu)
    if (entriesInSelectedRange.length > 0) {
      const totalScore = entriesInSelectedRange.reduce(
        (sum, entry) => sum + entry.moodScore,
        0
      );
      const avgScore = Math.round(totalScore / entriesInSelectedRange.length);
      setAvgMoodScoreDisplay({
        score: avgScore,
        count: entriesInSelectedRange.length,
      });
    } else {
      setAvgMoodScoreDisplay({ score: 0, count: 0 });
    }

    // 3. Dominant Emotions (dari entri dalam rentang waktu)
    if (entriesInSelectedRange.length > 0) {
      const emotionCounts = entriesInSelectedRange.reduce((acc, entry) => {
        if (
          entry.primaryEmotion &&
          entry.primaryEmotion !== "unknown" &&
          entry.primaryEmotion !== "N/A"
        ) {
          acc[entry.primaryEmotion] = (acc[entry.primaryEmotion] || 0) + 1;
        }
        return acc;
      }, {});
      const sortedEmotions = Object.entries(emotionCounts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 3) // Ambil top 3
        .map(([emotion]) => ({ name: emotion, count: emotionCounts[emotion] })); // Simpan juga count jika perlu
      setDominantEmotionsDisplay(sortedEmotions);
    } else {
      setDominantEmotionsDisplay([]);
    }

    // 4. Mood Trend Data Overview (untuk LineChart utama)
    // Gunakan semua entri yang dianalisis, diurutkan berdasarkan tanggal untuk grafik tren
    const trendData = analyzedEntriesGlobal
      .sort((a, b) => new Date(a.date) - new Date(b.date)) // Pastikan urut chronological
      .map((entry) => ({
        date: format(new Date(entry.date), "MMM dd"),
        score: entry.moodScore,
      }));
    // Untuk menyederhanakan, kita bisa batasi jumlah poin data, misal 30 terakhir
    setMoodTrendDataOverview(trendData.slice(-30));
  }, [journalEntries, timeRange]);

  const handleJournalSelect = (journal) => {
    setSelectedJournal(journal);
  };

  const handleAnalyzeText = async () => {
    // ... (fungsi handleAnalyzeText tetap sama seperti sebelumnya)
    if (!textToAnalyze.trim()) {
      setAnalysisMessage("Please enter some text to analyze.");
      setAnalysisStatus("error");
      return;
    }
    setIsAnalyzing(true);
    setAnalysisMessage(null);
    setAnalysisStatus(null);

    const token = getAuthToken();
    if (!token) {
      setAnalysisMessage("Authentication required. Please log in.");
      setAnalysisStatus("error");
      setIsAnalyzing(false);
      setTimeout(() => router.push("/auth"), 1500);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/journal/analyze-and-save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: textToAnalyze }),
      });

      const data = await response.json();

      if (response.status === 401) {
        localStorage.removeItem("jwt_token");
        setAnalysisMessage("Session expired. Please log in again.");
        setAnalysisStatus("error");
        setIsAnalyzing(false);
        setTimeout(() => router.push("/auth"), 1500);
        return;
      }

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to analyze text."
        );
      }

      setAnalysisMessage(data.message || "Analysis successful!");
      setAnalysisStatus("success");
      setTextToAnalyze("");

      const newAnalyzedEntry = {
        id: data.journal.journal_id,
        title: `Analyzed: ${data.journal.content.substring(0, 30)}...`,
        content: data.journal.content,
        date: new Date(data.journal.created_at),
        analyzed: true,
        moodScore: data.mood_entry.intensity_level * 100,
        primaryEmotion: data.mood_entry.primary_emotion,
      };
      setJournalEntries((prevEntries) =>
        [newAnalyzedEntry, ...prevEntries].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        )
      );
      setSelectedJournal(newAnalyzedEntry);
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalysisMessage(error.message || "An error occurred during analysis.");
      setAnalysisStatus("error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMoodColor = (score) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  const getMoodIcon = (emotion) => {
    // ... (fungsi getMoodIcon tetap sama)
    if (!emotion) return <Meh className="h-5 w-5 text-gray-500" />;
    switch (emotion.toLowerCase()) {
      case "optimistic":
      case "happy":
      case "grateful":
      case "joy":
      case "love":
        return <Smile className="h-5 w-5 text-green-500" />;
      case "peaceful":
      case "surprise":
        return <Heart className="h-5 w-5 text-blue-500" />;
      case "stressed":
      case "anxious":
      case "fear":
      case "anger":
        return <Brain className="h-5 w-5 text-yellow-500" />;
      case "sad":
      case "sadness":
        return <Frown className="h-5 w-5 text-red-500" />;
      default:
        return <Meh className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex flex-1">
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <div className="border-b bg-white">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-800">
                {" "}
                Mood Analyzer{" "}
              </h1>
              <Button
                variant="outline"
                className="rounded-full border-orange-200 px-4 text-orange-500 hover:bg-orange-50"
              >
                <span className="mr-2">User</span>
                <Avatar className="h-6 w-6 border border-orange-200">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-orange-100 text-orange-500">
                    {" "}
                    U{" "}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </div>
          </div>

          <div className="container mx-auto px-6 py-8">
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  {" "}
                  AI Mood Analysis{" "}
                </h2>
                <p className="text-gray-600">
                  {" "}
                  Gain insights into your emotional patterns through journal
                  analysis.{" "}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Select defaultValue={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[180px] bg-white">
                    {" "}
                    <SelectValue placeholder="Select time range" />{" "}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  className="gap-2 bg-white"
                  onClick={fetchJournalEntries}
                  disabled={isLoadingEntries}
                >
                  {isLoadingEntries ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Refresh Data
                </Button>
              </div>
            </div>

            {/* Mood Overview Cards - Sekarang Dinamis */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    {" "}
                    Current Mood{" "}
                  </CardTitle>
                  {getMoodIcon(currentMoodDisplay)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 capitalize">
                    {" "}
                    {currentMoodDisplay}{" "}
                  </div>
                  <p className="text-xs text-gray-500">
                    {" "}
                    Based on latest analyzed entry in range{" "}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    {" "}
                    Average Mood Score{" "}
                  </CardTitle>
                  <Heart className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {avgMoodScoreDisplay.count > 0
                      ? `${avgMoodScoreDisplay.score}/100`
                      : "N/A"}
                  </div>
                  {avgMoodScoreDisplay.count > 0 ? (
                    <div className="mt-2">
                      {" "}
                      <Progress
                        value={avgMoodScoreDisplay.score}
                        className="h-2 [&>div]:bg-blue-500"
                      />{" "}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      No analyzed entries in range.
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    {" "}
                    Dominant Emotions{" "}
                  </CardTitle>
                  <Brain className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  {dominantEmotionsDisplay.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {dominantEmotionsDisplay.map((emo, index) => (
                        <Badge
                          key={index}
                          className="bg-purple-100 text-purple-800 hover:bg-purple-200 capitalize"
                        >
                          {emo.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500">
                      No dominant emotions in range.
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    {" "}
                    Journal Entries{" "}
                  </CardTitle>
                  <FileText className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {journalEntries.length}
                  </div>
                  <p className="text-xs text-gray-500">
                    <span className="text-blue-600">
                      {journalEntries.filter((e) => e.analyzed).length} analyzed
                    </span>{" "}
                    total
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Sisa JSX (Text Analysis Card, Journal Entries Card, Right Column, etc.) */}
            {/* ... (Konten utama Anda di sini, tidak berubah signifikan dari versi sebelumnya) ... */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-1 space-y-6">
                {/* Text Analysis Card */}
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle className="text-gray-800">
                      {" "}
                      Analyze New Text{" "}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {" "}
                      Enter text to analyze your mood and save as a journal
                      entry.{" "}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Write or paste your journal entry here..."
                      className="min-h-[200px] mb-4 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      value={textToAnalyze}
                      onChange={(e) => setTextToAnalyze(e.target.value)}
                      disabled={isAnalyzing}
                    />
                    <Button
                      onClick={handleAnalyzeText}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                      disabled={isAnalyzing || !textToAnalyze.trim()}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Analyze Mood & Save
                        </>
                      )}
                    </Button>
                    {analysisMessage && (
                      <p
                        className={`mt-3 text-sm ${
                          analysisStatus === "success"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {analysisStatus === "success" ? (
                          <CheckCircle2 className="inline h-4 w-4 mr-1" />
                        ) : (
                          <AlertCircle className="inline h-4 w-4 mr-1" />
                        )}
                        {analysisMessage}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Journal Entries Card */}
                <Card className="bg-white">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      {" "}
                      <CardTitle className="text-gray-800">
                        Journal Entries
                      </CardTitle>{" "}
                      <CardDescription className="text-gray-600">
                        Select an entry to view its analysis.
                      </CardDescription>{" "}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-gray-600 hover:bg-gray-100"
                    >
                      {" "}
                      <Filter className="h-4 w-4" />{" "}
                      <span className="sr-only md:not-sr-only md:inline-block">
                        Filter
                      </span>{" "}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search entries..."
                        className="w-full rounded-md border border-gray-300 pl-9 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    {fetchError && (
                      <p className="text-sm text-red-500 mb-2">{fetchError}</p>
                    )}
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {isLoadingEntries && journalEntries.length === 0 && (
                        <div className="text-center py-4 text-gray-500">
                          {" "}
                          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />{" "}
                          Loading entries...{" "}
                        </div>
                      )}
                      {!isLoadingEntries &&
                        journalEntries.length === 0 &&
                        !fetchError && (
                          <p className="text-center text-gray-500 py-4">
                            No journal entries yet. Start by analyzing some
                            text!
                          </p>
                        )}
                      {journalEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedJournal?.id === entry.id
                              ? "border-blue-500 bg-blue-50"
                              : "hover:bg-gray-100 border-gray-200"
                          }`}
                          onClick={() => handleJournalSelect(entry)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium truncate max-w-[calc(100%-2.5rem)] text-gray-800">
                              {entry.title}
                            </h3>
                            {entry.analyzed &&
                              getMoodIcon(entry.primaryEmotion)}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {entry.content}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center">
                              {" "}
                              <Calendar className="h-3 w-3 mr-1" />{" "}
                              <span>
                                {format(new Date(entry.date), "MMM d, yyyy")}
                              </span>{" "}
                            </div>
                            {entry.analyzed &&
                              typeof entry.moodScore === "number" && (
                                <div
                                  className={`font-medium ${getMoodColor(
                                    entry.moodScore
                                  )}`}
                                >
                                  {" "}
                                  Score: {entry.moodScore}{" "}
                                </div>
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    {" "}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-600 hover:bg-gray-100"
                    >
                      View All Entries
                    </Button>{" "}
                  </CardFooter>
                </Card>
              </div>

              {/* Right Column - Analysis Results */}
              <div className="lg:col-span-2 space-y-6">
                {selectedJournal ? (
                  <>
                    <Card className="bg-white">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          {" "}
                          <CardTitle className="text-gray-800">
                            {selectedJournal.title}
                          </CardTitle>{" "}
                          <div className="flex items-center">
                            {" "}
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />{" "}
                            <span className="text-sm text-gray-500">
                              {" "}
                              {format(
                                new Date(selectedJournal.date),
                                "MMMM d, yyyy"
                              )}{" "}
                            </span>{" "}
                          </div>{" "}
                        </div>
                        <CardDescription className="text-gray-600">
                          {" "}
                          {selectedJournal.analyzed
                            ? "AI-powered mood analysis results."
                            : "Journal entry details."}{" "}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4 whitespace-pre-line">
                          {selectedJournal.content}
                        </p>
                        {selectedJournal.analyzed && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                            <div>
                              {" "}
                              <h4 className="font-semibold mb-2 text-gray-700">
                                Mood Score
                              </h4>{" "}
                              <div className="flex items-center">
                                {" "}
                                <div
                                  className={`text-3xl font-bold mr-2 ${getMoodColor(
                                    selectedJournal.moodScore
                                  )}`}
                                >
                                  {" "}
                                  {selectedJournal.moodScore}/100{" "}
                                </div>{" "}
                                {getMoodIcon(selectedJournal.primaryEmotion)}{" "}
                              </div>{" "}
                              <Progress
                                value={selectedJournal.moodScore}
                                className="h-2 mt-2"
                              />{" "}
                            </div>
                            <div>
                              {" "}
                              <h4 className="font-semibold mb-2 text-gray-700">
                                Primary Emotion
                              </h4>{" "}
                              <div className="text-xl font-bold text-purple-600 capitalize">
                                {" "}
                                {selectedJournal.primaryEmotion ||
                                  "Not specified"}{" "}
                              </div>{" "}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    {selectedJournal.analyzed && (
                      <>
                        <Card className="bg-white">
                          {" "}
                          <CardHeader>
                            {" "}
                            <CardTitle className="text-gray-800">
                              Emotion Intensity Analysis
                            </CardTitle>{" "}
                            <CardDescription className="text-gray-600">
                              Detailed view of emotion intensities (sample
                              data).
                            </CardDescription>{" "}
                          </CardHeader>{" "}
                          <CardContent className="h-80">
                            {" "}
                            <ResponsiveContainer width="100%" height="100%">
                              {" "}
                              <LineChart
                                data={emotionIntensityData}
                                margin={{
                                  top: 5,
                                  right: 30,
                                  left: 20,
                                  bottom: 5,
                                }}
                              >
                                {" "}
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="#e0e0e0"
                                />{" "}
                                <XAxis
                                  dataKey="emotion"
                                  tick={{ fill: "#4a5568" }}
                                />{" "}
                                <YAxis
                                  domain={[0, 100]}
                                  tick={{ fill: "#4a5568" }}
                                />{" "}
                                <Tooltip /> <Legend />{" "}
                                <Line
                                  type="monotone"
                                  dataKey="score"
                                  stroke="#43A047"
                                  activeDot={{ r: 8 }}
                                  strokeWidth={2}
                                />{" "}
                              </LineChart>{" "}
                            </ResponsiveContainer>{" "}
                          </CardContent>{" "}
                        </Card>
                        <Card className="bg-white">
                          {" "}
                          <CardHeader>
                            {" "}
                            <CardTitle className="text-gray-800">
                              Common Words in this Entry
                            </CardTitle>{" "}
                            <CardDescription className="text-gray-600">
                              Frequently used words (sample data).
                            </CardDescription>{" "}
                          </CardHeader>{" "}
                          <CardContent>
                            {" "}
                            <div className="flex flex-wrap gap-2">
                              {" "}
                              {commonWords.map((word) => (
                                <Badge
                                  key={word.text}
                                  className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                                >
                                  {" "}
                                  {word.text} ({word.value}){" "}
                                </Badge>
                              ))}{" "}
                            </div>{" "}
                          </CardContent>{" "}
                        </Card>
                      </>
                    )}
                  </>
                ) : (
                  <Card className="bg-white">
                    {" "}
                    <CardContent className="py-8 min-h-[300px] flex items-center justify-center">
                      {" "}
                      <div className="text-center text-gray-500">
                        {" "}
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />{" "}
                        <p className="text-lg font-medium text-gray-700">
                          No Journal Selected
                        </p>{" "}
                        <p className="mt-1">
                          Select an entry or analyze new text to view its
                          details here.
                        </p>{" "}
                      </div>{" "}
                    </CardContent>{" "}
                  </Card>
                )}
              </div>
            </div>

            {/* Mood Trends - sekarang menggunakan moodTrendDataOverview */}
            <Card className="mt-8 bg-white">
              <CardHeader>
                <CardTitle className="text-gray-800">
                  Overall Mood Trends
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Your emotional patterns over time.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {moodTrendDataOverview.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={moodTrendDataOverview}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="date" tick={{ fill: "#4a5568" }} />
                      <YAxis domain={[0, 100]} tick={{ fill: "#4a5568" }} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#3B82F6"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 py-10">
                    No mood trend data available. Analyze some entries to see
                    your trend.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="mt-8 bg-white">
              <CardHeader>
                {" "}
                <CardTitle className="text-gray-800">
                  AI Recommendations
                </CardTitle>{" "}
                <CardDescription className="text-gray-600">
                  Personalized insights to improve your mood (sample data).
                </CardDescription>{" "}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiInsights.map((insight, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-md border border-gray-200"
                    >
                      <div className="flex items-center mb-2">
                        {insight.type === "positive" && (
                          <CheckCircle2 className="h-5 w-5 mr-2 text-green-500" />
                        )}
                        {insight.type === "concern" && (
                          <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
                        )}
                        {insight.type === "strength" && (
                          <Lightbulb className="h-5 w-5 mr-2 text-blue-500" />
                        )}
                        <h4 className="font-medium text-gray-800">
                          {insight.title}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600">
                        {insight.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
