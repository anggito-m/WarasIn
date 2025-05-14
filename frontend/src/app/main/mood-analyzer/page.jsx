"use client";

import { useState } from "react";
import { format, subDays } from "date-fns";
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
} from "lucide-react";
import { Footer } from "@/components/footer";

export default function MoodAnalyzerPage() {
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timeRange, setTimeRange] = useState("week");

  // Sample journal entries
  const journalEntries = [
    {
      id: 1,
      title: "Morning Reflection",
      content:
        "Today I woke up feeling refreshed after a good night's sleep. I had a nutritious breakfast and spent some time meditating before starting my day. I'm feeling optimistic about the challenges ahead.",
      date: subDays(new Date(), 1),
      analyzed: true,
      moodScore: 85,
      primaryEmotion: "optimistic",
    },
    {
      id: 2,
      title: "Work Stress",
      content:
        "The project deadline is approaching and I'm feeling overwhelmed with the amount of work left to do. I need to remember to take breaks and practice deep breathing when I feel anxious.",
      date: subDays(new Date(), 3),
      analyzed: true,
      moodScore: 42,
      primaryEmotion: "stressed",
    },
    {
      id: 3,
      title: "Evening Walk",
      content:
        "I took a long walk in the park this evening. The fresh air and natural surroundings helped clear my mind. I noticed the beautiful sunset and took a moment to appreciate the present.",
      date: subDays(new Date(), 5),
      analyzed: true,
      moodScore: 78,
      primaryEmotion: "peaceful",
    },
    {
      id: 4,
      title: "Friendship Reflection",
      content:
        "Had a deep conversation with an old friend today. It reminded me of the importance of maintaining meaningful connections. We shared our struggles and victories, and I felt understood.",
      date: subDays(new Date(), 7),
      analyzed: true,
      moodScore: 90,
      primaryEmotion: "grateful",
    },
    {
      id: 5,
      title: "Feeling Down",
      content:
        "Today was difficult. I felt a persistent sadness that I couldn't shake off. I'm trying to remember that emotions are temporary and it's okay to have bad days. Tomorrow is a new opportunity.",
      date: subDays(new Date(), 9),
      analyzed: true,
      moodScore: 30,
      primaryEmotion: "sad",
    },
  ];

  // Sample mood trend data
  const moodTrendData = [
    { date: format(subDays(new Date(), 30), "MMM dd"), score: 65 },
    { date: format(subDays(new Date(), 25), "MMM dd"), score: 72 },
    { date: format(subDays(new Date(), 20), "MMM dd"), score: 58 },
    { date: format(subDays(new Date(), 15), "MMM dd"), score: 45 },
    { date: format(subDays(new Date(), 10), "MMM dd"), score: 30 },
    { date: format(subDays(new Date(), 5), "MMM dd"), score: 78 },
    { date: format(new Date(), "MMM dd"), score: 85 },
  ];

  // Sample emotion distribution data
  const emotionDistributionData = [
    { name: "Happy", value: 35, color: "#4ade80" },
    { name: "Peaceful", value: 25, color: "#60a5fa" },
    { name: "Neutral", value: 15, color: "#94a3b8" },
    { name: "Anxious", value: 15, color: "#fbbf24" },
    { name: "Sad", value: 10, color: "#f87171" },
  ];

  // Sample emotion intensity data
  const emotionIntensityData = [
    { emotion: "Joy", score: 75 },
    { emotion: "Gratitude", score: 85 },
    { emotion: "Serenity", score: 60 },
    { emotion: "Interest", score: 70 },
    { emotion: "Hope", score: 65 },
    { emotion: "Pride", score: 55 },
    { emotion: "Amusement", score: 45 },
    { emotion: "Inspiration", score: 80 },
  ];

  // Sample AI insights
  const aiInsights = [
    {
      title: "Positive Outlook",
      description:
        "Your journal entries show a generally positive outlook on life. You often focus on gratitude and appreciation for small moments.",
      type: "positive",
    },
    {
      title: "Work-Related Stress",
      description:
        "There's a pattern of stress related to work deadlines. Consider implementing more structured breaks and time management techniques.",
      type: "concern",
    },
    {
      title: "Nature Connection",
      description:
        "You consistently mention feeling better after spending time in nature. This appears to be an effective coping mechanism for you.",
      type: "strength",
    },
    {
      title: "Social Connections",
      description:
        "Deep conversations with friends significantly boost your mood. Maintaining these connections should be prioritized for your wellbeing.",
      type: "strength",
    },
  ];

  // Sample common words
  const commonWords = [
    { text: "grateful", value: 25 },
    { text: "peaceful", value: 18 },
    { text: "stressed", value: 15 },
    { text: "happy", value: 12 },
    { text: "anxious", value: 10 },
    { text: "tired", value: 8 },
    { text: "hopeful", value: 7 },
    { text: "frustrated", value: 6 },
  ];

  // Function to handle journal selection
  const handleJournalSelect = (journal) => {
    setSelectedJournal(journal);
  };

  // Function to handle journal text analysis
  const handleAnalyzeText = () => {
    setIsAnalyzing(true);
    // Simulate AI analysis with a timeout
    setTimeout(() => {
      setIsAnalyzing(false);
      // In a real app, this would be where you'd call the AI service
    }, 2000);
  };

  // Helper function to get color based on mood score
  const getMoodColor = (score) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-blue-500";
    if (score >= 40) return "text-yellow-500";
    return "text-red-500";
  };

  // Helper function to get mood icon based on primary emotion
  const getMoodIcon = (emotion) => {
    switch (emotion) {
      case "optimistic":
      case "happy":
      case "grateful":
        return <Smile className="h-5 w-5 text-green-500" />;
      case "peaceful":
        return <Heart className="h-5 w-5 text-blue-500" />;
      case "stressed":
      case "anxious":
        return <Brain className="h-5 w-5 text-yellow-500" />;
      case "sad":
        return <Frown className="h-5 w-5 text-red-500" />;
      default:
        return <Meh className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <main className="flex-1 overflow-auto">
          <div className="border-b">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold">Mood Analyzer</h1>
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

          <div className="container mx-auto px-6 py-8">
            {/* Dashboard Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold">AI Mood Analysis</h2>
                <p className="text-gray-500">
                  Gain insights into your emotional patterns through journal
                  analysis
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Select defaultValue={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh Analysis
                </Button>
              </div>
            </div>

            {/* Mood Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Current Mood
                  </CardTitle>
                  <Smile className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Optimistic</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      15% improvement
                    </span>{" "}
                    from last week
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Mood Score
                  </CardTitle>
                  <Heart className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">85/100</div>
                  <div className="mt-2">
                    <Progress value={85} className="h-2 bg-gray-200" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Dominant Emotions
                  </CardTitle>
                  <Brain className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                      Joy
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      Gratitude
                    </Badge>
                    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                      Hope
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Journal Entries
                  </CardTitle>
                  <FileText className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-blue-500">3 analyzed</span> in the
                    last week
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Journal Selection */}
              <div className="lg:col-span-1 space-y-6">
                {/* Text Analysis Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Analyze New Text</CardTitle>
                    <CardDescription>
                      Enter or paste text to analyze your mood
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Write or paste your journal entry here..."
                      className="min-h-[200px] mb-4"
                    />
                    <Button
                      onClick={handleAnalyzeText}
                      className="w-full bg-blue-500 hover:bg-blue-600"
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Analyze Mood
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Journal Entries Card */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Journal Entries</CardTitle>
                      <CardDescription>
                        Select an entry to view its analysis
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" className="gap-1">
                      <Filter className="h-4 w-4" />
                      <span className="sr-only md:not-sr-only md:inline-block">
                        Filter
                      </span>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search entries..."
                        className="w-full rounded-md border border-gray-200 pl-9 py-2 text-sm"
                      />
                    </div>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {journalEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedJournal?.id === entry.id
                              ? "border-blue-500 bg-blue-50"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => handleJournalSelect(entry)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium">{entry.title}</h3>
                            {entry.analyzed &&
                              getMoodIcon(entry.primaryEmotion)}
                          </div>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                            {entry.content}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{format(entry.date, "MMM d, yyyy")}</span>
                            </div>
                            {entry.analyzed && (
                              <div
                                className={`font-medium ${getMoodColor(
                                  entry.moodScore
                                )}`}
                              >
                                Score: {entry.moodScore}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <Button variant="ghost" size="sm">
                      View All Entries
                    </Button>
                    <Button variant="ghost" size="sm" className="text-blue-500">
                      Import from Journal
                    </Button>
                  </CardFooter>
                </Card>
              </div>

              {/* Right Column - Analysis Results */}
              <div className="lg:col-span-2 space-y-6">
                {selectedJournal ? (
                  <>
                    {/* Selected Journal Analysis */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{selectedJournal.title}</CardTitle>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {format(selectedJournal.date, "MMMM d, yyyy")}
                            </span>
                          </div>
                        </div>
                        <CardDescription>
                          AI-powered mood analysis results
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4">
                          {selectedJournal.content}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Mood Score</h4>
                            <div className="flex items-center">
                              <div
                                className={`text-3xl font-bold mr-2 ${getMoodColor(
                                  selectedJournal.moodScore
                                )}`}
                              >
                                {selectedJournal.moodScore}/100
                              </div>
                              {getMoodIcon(selectedJournal.primaryEmotion)}
                            </div>
                            <Progress
                              value={selectedJournal.moodScore}
                              className="h-2 mt-2"
                            />
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">
                              Primary Emotion
                            </h4>
                            <div className="text-xl font-bold text-purple-600">
                              {selectedJournal.primaryEmotion}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Emotion Intensity Analysis */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Emotion Intensity Analysis</CardTitle>
                        <CardDescription>
                          Detailed view of emotion intensities
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={emotionIntensityData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="emotion" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="score"
                              stroke="#82ca9d"
                              activeDot={{ r: 8 }}
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Common Words */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Common Words</CardTitle>
                        <CardDescription>
                          Frequently used words in your journal entry
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {commonWords.map((word) => (
                            <Badge
                              key={word.text}
                              className="bg-gray-100 text-gray-800 hover:bg-gray-200"
                            >
                              {word.text} ({word.value})
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="py-8">
                      <div className="text-center text-gray-500">
                        <FileText className="h-10 w-10 mx-auto mb-4" />
                        <p>
                          No journal entry selected. Please select an entry to
                          view its analysis.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Mood Trends */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Mood Trends</CardTitle>
                <CardDescription>
                  Your emotional patterns over time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={moodTrendData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#4f46e5"
                      activeDot={{ r: 8 }}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>AI Recommendations</CardTitle>
                <CardDescription>
                  Personalized insights to improve your mood
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {aiInsights.map((insight, index) => (
                    <div key={index} className="p-4 rounded-md border">
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
                        <h4 className="font-medium">{insight.title}</h4>
                      </div>
                      <p className="text-sm text-gray-500">
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
      <Footer></Footer>
    </div>
  );
}
