"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Calendar,
  Download,
  FileText,
  BarChart2,
  PieChartIcon,
  TrendingUp,
  Activity,
  Heart,
  Brain,
  Coffee,
  Moon,
  Smile,
  Frown,
  Meh,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Filter,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Footer } from "@/components/footer";

export default function MonitoringPage() {
  const [timeRange, setTimeRange] = useState("week");

  // Track which form is currently open
  const [activeForm, setActiveForm] = useState(null);

  // Form schemas
  const moodFormSchema = z.object({
    mood: z.enum([
      "happy",
      "neutral",
      "sad",
      "stressed",
      "peaceful",
      "grateful",
    ]),
    intensity: z.number().min(1).max(10),
    notes: z.string().optional(),
  });

  const sleepFormSchema = z.object({
    hours: z.number().min(0).max(24),
    quality: z.enum(["poor", "fair", "good", "excellent"]),
    bedtime: z.string(),
    wakeTime: z.string(),
    notes: z.string().optional(),
  });

  const activityFormSchema = z.object({
    type: z.enum([
      "walking",
      "running",
      "cycling",
      "swimming",
      "yoga",
      "gym",
      "other",
    ]),
    duration: z.number().min(1),
    intensity: z.enum(["low", "moderate", "high"]),
    notes: z.string().optional(),
  });

  const stressFormSchema = z.object({
    level: z.number().min(1).max(10),
    sources: z.array(z.string()),
    copingMechanisms: z.array(z.string()).optional(),
    notes: z.string().optional(),
  });

  // Form hooks
  const moodForm = useForm({
    resolver: zodResolver(moodFormSchema),
    defaultValues: {
      mood: "neutral",
      intensity: 5,
      notes: "",
    },
  });

  const sleepForm = useForm({
    resolver: zodResolver(sleepFormSchema),
    defaultValues: {
      hours: 7,
      quality: "good",
      bedtime: "22:00",
      wakeTime: "07:00",
      notes: "",
    },
  });

  const activityForm = useForm({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      type: "walking",
      duration: 30,
      intensity: "moderate",
      notes: "",
    },
  });

  const stressForm = useForm({
    resolver: zodResolver(stressFormSchema),
    defaultValues: {
      level: 5,
      sources: ["work"],
      copingMechanisms: [],
      notes: "",
    },
  });

  // Form submission handlers
  const onMoodSubmit = (data) => {
    console.log("Mood data:", data);
    toast({
      title: "Mood tracked successfully",
      description: `You recorded feeling ${data.mood} with intensity ${data.intensity}/10`,
    });
    setActiveForm(null);
  };

  const onSleepSubmit = (data) => {
    console.log("Sleep data:", data);
    toast({
      title: "Sleep tracked successfully",
      description: `You recorded ${data.hours} hours of ${data.quality} quality sleep`,
    });
    setActiveForm(null);
  };

  const onActivitySubmit = (data) => {
    console.log("Activity data:", data);
    toast({
      title: "Activity tracked successfully",
      description: `You recorded ${data.duration} minutes of ${data.intensity} intensity ${data.type}`,
    });
    setActiveForm(null);
  };

  const onStressSubmit = (data) => {
    console.log("Stress data:", data);
    toast({
      title: "Stress tracked successfully",
      description: `You recorded a stress level of ${data.level}/10`,
    });
    setActiveForm(null);
  };

  // Helper function to handle form opening
  const openForm = (formType) => {
    setActiveForm(formType);
  };

  // Generate dates for the past week
  const today = new Date();
  const pastWeek = Array.from({ length: 7 }, (_, i) =>
    subDays(today, i)
  ).reverse();
  const pastWeekFormatted = pastWeek.map((date) => format(date, "MMM dd"));

  // Sample data for charts
  const moodData = [
    { name: pastWeekFormatted[0], happy: 2, neutral: 3, sad: 1 },
    { name: pastWeekFormatted[1], happy: 4, neutral: 2, sad: 0 },
    { name: pastWeekFormatted[2], happy: 3, neutral: 3, sad: 2 },
    { name: pastWeekFormatted[3], happy: 1, neutral: 4, sad: 3 },
    { name: pastWeekFormatted[4], happy: 5, neutral: 1, sad: 0 },
    { name: pastWeekFormatted[5], happy: 4, neutral: 2, sad: 1 },
    { name: pastWeekFormatted[6], happy: 3, neutral: 3, sad: 0 },
  ];

  const sleepData = [
    { name: pastWeekFormatted[0], hours: 7.5 },
    { name: pastWeekFormatted[1], hours: 6.2 },
    { name: pastWeekFormatted[2], hours: 8.0 },
    { name: pastWeekFormatted[3], hours: 7.0 },
    { name: pastWeekFormatted[4], hours: 6.5 },
    { name: pastWeekFormatted[5], hours: 7.8 },
    { name: pastWeekFormatted[6], hours: 8.2 },
  ];

  const activityData = [
    { name: pastWeekFormatted[0], minutes: 45 },
    { name: pastWeekFormatted[1], minutes: 30 },
    { name: pastWeekFormatted[2], minutes: 60 },
    { name: pastWeekFormatted[3], minutes: 20 },
    { name: pastWeekFormatted[4], minutes: 50 },
    { name: pastWeekFormatted[5], minutes: 40 },
    { name: pastWeekFormatted[6], minutes: 55 },
  ];

  const stressFactorsData = [
    { name: "Work", value: 35 },
    { name: "Relationships", value: 20 },
    { name: "Health", value: 15 },
    { name: "Finances", value: 25 },
    { name: "Other", value: 5 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  const moodDistribution = [
    { name: "Happy", value: 42, color: "#4ade80" },
    { name: "Neutral", value: 35, color: "#60a5fa" },
    { name: "Sad", value: 23, color: "#f87171" },
  ];

  const journalEntries = [
    {
      id: 1,
      title: "Morning Reflection",
      date: subDays(today, 1),
      mood: "happy",
      excerpt:
        "Today I woke up feeling refreshed after a good night's sleep...",
    },
    {
      id: 2,
      title: "Work Stress",
      date: subDays(today, 3),
      mood: "stressed",
      excerpt:
        "The project deadline is approaching and I'm feeling overwhelmed...",
    },
    {
      id: 3,
      title: "Evening Walk",
      date: subDays(today, 5),
      mood: "peaceful",
      excerpt: "I took a long walk in the park this evening. The fresh air...",
    },
  ];

  const moodIcons = {
    happy: <Smile className="h-5 w-5 text-green-500" />,
    sad: <Frown className="h-5 w-5 text-red-500" />,
    stressed: <Frown className="h-5 w-5 text-orange-500" />,
    peaceful: <Smile className="h-5 w-5 text-blue-300" />,
    neutral: <Meh className="h-5 w-5 text-gray-500" />,
  };

  const weekRange = `${format(startOfWeek(today), "MMM d")} - ${format(
    endOfWeek(today),
    "MMM d, yyyy"
  )}`;

  const insights = [
    {
      title: "Mood Trend",
      description: "Your mood has been improving over the past week.",
      icon: <TrendingUp className="h-5 w-5 text-green-500" />,
      change: "positive",
    },
    {
      title: "Sleep Quality",
      description:
        "Your average sleep duration is 7.3 hours, which is within the recommended range.",
      icon: <Moon className="h-5 w-5 text-blue-500" />,
      change: "neutral",
    },
    {
      title: "Physical Activity",
      description: "You've been less active compared to your previous week.",
      icon: <Activity className="h-5 w-5 text-orange-500" />,
      change: "negative",
    },
    {
      title: "Stress Levels",
      description: "Work continues to be your primary source of stress.",
      icon: <Brain className="h-5 w-5 text-purple-500" />,
      change: "neutral",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <main className="flex-1 overflow-auto">
          <div className="border-b">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold">
                Monitoring, Reports, & Visualization
              </h1>
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
                <h2 className="text-3xl font-bold">Mental Health Dashboard</h2>
                <p className="text-gray-500">
                  Track and visualize your mental wellbeing over time
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
                  <Download className="h-4 w-4" />
                  Export Report
                </Button>
              </div>
            </div>

            {/* Tracking Input Cards */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Track Your Wellbeing
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Mood Tracking Card */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Smile className="h-5 w-5 text-green-500 mr-2" />
                      Mood Tracking
                    </CardTitle>
                    <CardDescription>
                      Record how you're feeling right now
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-4">
                      Tracking your mood helps identify patterns and triggers
                      that affect your emotional wellbeing.
                    </p>
                    <Dialog
                      open={activeForm === "mood"}
                      onOpenChange={(open) =>
                        open ? openForm("mood") : setActiveForm(null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button className="w-full bg-green-500 hover:bg-green-600">
                          Track Mood
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Track Your Mood</DialogTitle>
                          <DialogDescription>
                            How are you feeling right now? Record your current
                            emotional state.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...moodForm}>
                          <form
                            onSubmit={moodForm.handleSubmit(onMoodSubmit)}
                            className="space-y-6"
                          >
                            <FormField
                              control={moodForm.control}
                              name="mood"
                              render={({ field }) => (
                                <FormItem className="space-y-3">
                                  <FormLabel>Current Mood</FormLabel>
                                  <FormControl>
                                    <RadioGroup
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                      className="grid grid-cols-3 gap-4"
                                    >
                                      <FormItem className="flex flex-col items-center space-y-1">
                                        <FormControl>
                                          <RadioGroupItem
                                            value="happy"
                                            className="sr-only"
                                          />
                                        </FormControl>
                                        <div
                                          className={`p-2 rounded-full ${
                                            field.value === "happy"
                                              ? "bg-green-100"
                                              : "bg-gray-100"
                                          }`}
                                        >
                                          <Smile
                                            className={`h-8 w-8 ${
                                              field.value === "happy"
                                                ? "text-green-500"
                                                : "text-gray-400"
                                            }`}
                                          />
                                        </div>
                                        <FormLabel className="text-xs font-normal">
                                          Happy
                                        </FormLabel>
                                      </FormItem>
                                      <FormItem className="flex flex-col items-center space-y-1">
                                        <FormControl>
                                          <RadioGroupItem
                                            value="neutral"
                                            className="sr-only"
                                          />
                                        </FormControl>
                                        <div
                                          className={`p-2 rounded-full ${
                                            field.value === "neutral"
                                              ? "bg-blue-100"
                                              : "bg-gray-100"
                                          }`}
                                        >
                                          <Meh
                                            className={`h-8 w-8 ${
                                              field.value === "neutral"
                                                ? "text-blue-500"
                                                : "text-gray-400"
                                            }`}
                                          />
                                        </div>
                                        <FormLabel className="text-xs font-normal">
                                          Neutral
                                        </FormLabel>
                                      </FormItem>
                                      <FormItem className="flex flex-col items-center space-y-1">
                                        <FormControl>
                                          <RadioGroupItem
                                            value="sad"
                                            className="sr-only"
                                          />
                                        </FormControl>
                                        <div
                                          className={`p-2 rounded-full ${
                                            field.value === "sad"
                                              ? "bg-red-100"
                                              : "bg-gray-100"
                                          }`}
                                        >
                                          <Frown
                                            className={`h-8 w-8 ${
                                              field.value === "sad"
                                                ? "text-red-500"
                                                : "text-gray-400"
                                            }`}
                                          />
                                        </div>
                                        <FormLabel className="text-xs font-normal">
                                          Sad
                                        </FormLabel>
                                      </FormItem>
                                      <FormItem className="flex flex-col items-center space-y-1">
                                        <FormControl>
                                          <RadioGroupItem
                                            value="stressed"
                                            className="sr-only"
                                          />
                                        </FormControl>
                                        <div
                                          className={`p-2 rounded-full ${
                                            field.value === "stressed"
                                              ? "bg-orange-100"
                                              : "bg-gray-100"
                                          }`}
                                        >
                                          <Brain
                                            className={`h-8 w-8 ${
                                              field.value === "stressed"
                                                ? "text-orange-500"
                                                : "text-gray-400"
                                            }`}
                                          />
                                        </div>
                                        <FormLabel className="text-xs font-normal">
                                          Stressed
                                        </FormLabel>
                                      </FormItem>
                                      <FormItem className="flex flex-col items-center space-y-1">
                                        <FormControl>
                                          <RadioGroupItem
                                            value="peaceful"
                                            className="sr-only"
                                          />
                                        </FormControl>
                                        <div
                                          className={`p-2 rounded-full ${
                                            field.value === "peaceful"
                                              ? "bg-blue-100"
                                              : "bg-gray-100"
                                          }`}
                                        >
                                          <Heart
                                            className={`h-8 w-8 ${
                                              field.value === "peaceful"
                                                ? "text-blue-500"
                                                : "text-gray-400"
                                            }`}
                                          />
                                        </div>
                                        <FormLabel className="text-xs font-normal">
                                          Peaceful
                                        </FormLabel>
                                      </FormItem>
                                      <FormItem className="flex flex-col items-center space-y-1">
                                        <FormControl>
                                          <RadioGroupItem
                                            value="grateful"
                                            className="sr-only"
                                          />
                                        </FormControl>
                                        <div
                                          className={`p-2 rounded-full ${
                                            field.value === "grateful"
                                              ? "bg-pink-100"
                                              : "bg-gray-100"
                                          }`}
                                        >
                                          <Heart
                                            className={`h-8 w-8 ${
                                              field.value === "grateful"
                                                ? "text-pink-500"
                                                : "text-gray-400"
                                            }`}
                                          />
                                        </div>
                                        <FormLabel className="text-xs font-normal">
                                          Grateful
                                        </FormLabel>
                                      </FormItem>
                                    </RadioGroup>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={moodForm.control}
                              name="intensity"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Intensity (1-10)</FormLabel>
                                  <div className="flex items-center gap-4">
                                    <FormControl>
                                      <Slider
                                        min={1}
                                        max={10}
                                        step={1}
                                        defaultValue={[field.value]}
                                        onValueChange={(value) =>
                                          field.onChange(value[0])
                                        }
                                        className="flex-1"
                                      />
                                    </FormControl>
                                    <span className="w-8 text-center">
                                      {field.value}
                                    </span>
                                  </div>
                                  <FormDescription>
                                    How strongly are you feeling this emotion?
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={moodForm.control}
                              name="notes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Notes (Optional)</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="What might be contributing to your mood?"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button type="submit">Save</Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>

                {/* Sleep Tracking Card */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Moon className="h-5 w-5 text-blue-500 mr-2" />
                      Sleep Tracking
                    </CardTitle>
                    <CardDescription>
                      Record your sleep duration and quality
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-4">
                      Tracking your sleep helps identify patterns that affect
                      your rest and recovery.
                    </p>
                    <Dialog
                      open={activeForm === "sleep"}
                      onOpenChange={(open) =>
                        open ? openForm("sleep") : setActiveForm(null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button className="w-full bg-blue-500 hover:bg-blue-600">
                          Track Sleep
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Track Your Sleep</DialogTitle>
                          <DialogDescription>
                            Record details about your last sleep session.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...sleepForm}>
                          <form
                            onSubmit={sleepForm.handleSubmit(onSleepSubmit)}
                            className="space-y-6"
                          >
                            <FormField
                              control={sleepForm.control}
                              name="hours"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Hours Slept</FormLabel>
                                  <div className="flex items-center gap-4">
                                    <FormControl>
                                      <Slider
                                        min={0}
                                        max={12}
                                        step={0.5}
                                        defaultValue={[field.value]}
                                        onValueChange={(value) =>
                                          field.onChange(value[0])
                                        }
                                        className="flex-1"
                                      />
                                    </FormControl>
                                    <span className="w-12 text-center">
                                      {field.value} hrs
                                    </span>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={sleepForm.control}
                              name="quality"
                              render={({ field }) => (
                                <FormItem className="space-y-3">
                                  <FormLabel>Sleep Quality</FormLabel>
                                  <FormControl>
                                    <RadioGroup
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                      className="flex space-x-2"
                                    >
                                      <FormItem className="flex items-center space-x-1">
                                        <FormControl>
                                          <RadioGroupItem value="poor" />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal">
                                          Poor
                                        </FormLabel>
                                      </FormItem>
                                      <FormItem className="flex items-center space-x-1">
                                        <FormControl>
                                          <RadioGroupItem value="fair" />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal">
                                          Fair
                                        </FormLabel>
                                      </FormItem>
                                      <FormItem className="flex items-center space-x-1">
                                        <FormControl>
                                          <RadioGroupItem value="good" />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal">
                                          Good
                                        </FormLabel>
                                      </FormItem>
                                      <FormItem className="flex items-center space-x-1">
                                        <FormControl>
                                          <RadioGroupItem value="excellent" />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal">
                                          Excellent
                                        </FormLabel>
                                      </FormItem>
                                    </RadioGroup>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={sleepForm.control}
                                name="bedtime"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Bedtime</FormLabel>
                                    <FormControl>
                                      <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={sleepForm.control}
                                name="wakeTime"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Wake Time</FormLabel>
                                    <FormControl>
                                      <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            <FormField
                              control={sleepForm.control}
                              name="notes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Notes (Optional)</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Any factors that affected your sleep?"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button type="submit">Save</Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>

                {/* Activity Tracking Card */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Activity className="h-5 w-5 text-orange-500 mr-2" />
                      Activity Tracking
                    </CardTitle>
                    <CardDescription>
                      Record your physical activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-4">
                      Regular physical activity is essential for both physical
                      and mental wellbeing.
                    </p>
                    <Dialog
                      open={activeForm === "activity"}
                      onOpenChange={(open) =>
                        open ? openForm("activity") : setActiveForm(null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button className="w-full bg-orange-500 hover:bg-orange-600">
                          Track Activity
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Track Your Activity</DialogTitle>
                          <DialogDescription>
                            Record details about your physical activity.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...activityForm}>
                          <form
                            onSubmit={activityForm.handleSubmit(
                              onActivitySubmit
                            )}
                            className="space-y-6"
                          >
                            <FormField
                              control={activityForm.control}
                              name="type"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Activity Type</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select activity type" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="walking">
                                        Walking
                                      </SelectItem>
                                      <SelectItem value="running">
                                        Running
                                      </SelectItem>
                                      <SelectItem value="cycling">
                                        Cycling
                                      </SelectItem>
                                      <SelectItem value="swimming">
                                        Swimming
                                      </SelectItem>
                                      <SelectItem value="yoga">Yoga</SelectItem>
                                      <SelectItem value="gym">
                                        Gym/Weights
                                      </SelectItem>
                                      <SelectItem value="other">
                                        Other
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={activityForm.control}
                              name="duration"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Duration (minutes)</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min={1}
                                      {...field}
                                      onChange={(e) =>
                                        field.onChange(
                                          Number.parseInt(e.target.value)
                                        )
                                      }
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={activityForm.control}
                              name="intensity"
                              render={({ field }) => (
                                <FormItem className="space-y-3">
                                  <FormLabel>Intensity</FormLabel>
                                  <FormControl>
                                    <RadioGroup
                                      onValueChange={field.onChange}
                                      defaultValue={field.value}
                                      className="flex space-x-4"
                                    >
                                      <FormItem className="flex items-center space-x-1">
                                        <FormControl>
                                          <RadioGroupItem value="low" />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal">
                                          Low
                                        </FormLabel>
                                      </FormItem>
                                      <FormItem className="flex items-center space-x-1">
                                        <FormControl>
                                          <RadioGroupItem value="moderate" />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal">
                                          Moderate
                                        </FormLabel>
                                      </FormItem>
                                      <FormItem className="flex items-center space-x-1">
                                        <FormControl>
                                          <RadioGroupItem value="high" />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal">
                                          High
                                        </FormLabel>
                                      </FormItem>
                                    </RadioGroup>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={activityForm.control}
                              name="notes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Notes (Optional)</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="How did you feel during and after the activity?"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button type="submit">Save</Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>

                {/* Stress Tracking Card */}
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <Brain className="h-5 w-5 text-purple-500 mr-2" />
                      Stress Tracking
                    </CardTitle>
                    <CardDescription>
                      Record your stress levels and sources
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 mb-4">
                      Identifying stress triggers helps develop effective coping
                      strategies.
                    </p>
                    <Dialog
                      open={activeForm === "stress"}
                      onOpenChange={(open) =>
                        open ? openForm("stress") : setActiveForm(null)
                      }
                    >
                      <DialogTrigger asChild>
                        <Button className="w-full bg-purple-500 hover:bg-purple-600">
                          Track Stress
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Track Your Stress</DialogTitle>
                          <DialogDescription>
                            Record your current stress level and potential
                            sources.
                          </DialogDescription>
                        </DialogHeader>
                        <Form {...stressForm}>
                          <form
                            onSubmit={stressForm.handleSubmit(onStressSubmit)}
                            className="space-y-6"
                          >
                            <FormField
                              control={stressForm.control}
                              name="level"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Stress Level (1-10)</FormLabel>
                                  <div className="flex items-center gap-4">
                                    <FormControl>
                                      <Slider
                                        min={1}
                                        max={10}
                                        step={1}
                                        defaultValue={[field.value]}
                                        onValueChange={(value) =>
                                          field.onChange(value[0])
                                        }
                                        className="flex-1"
                                      />
                                    </FormControl>
                                    <span className="w-8 text-center">
                                      {field.value}
                                    </span>
                                  </div>
                                  <FormDescription>
                                    1 = Very low stress, 10 = Extreme stress
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={stressForm.control}
                              name="sources"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Sources of Stress</FormLabel>
                                  <div className="grid grid-cols-2 gap-2">
                                    {[
                                      "work",
                                      "relationships",
                                      "health",
                                      "finances",
                                      "family",
                                      "future",
                                      "social",
                                      "other",
                                    ].map((source) => (
                                      <div
                                        key={source}
                                        className="flex items-center space-x-2"
                                      >
                                        <Checkbox
                                          id={`stress-source-${source}`}
                                          checked={field.value.includes(source)}
                                          onCheckedChange={(checked) => {
                                            const updatedSources = checked
                                              ? [...field.value, source]
                                              : field.value.filter(
                                                  (s) => s !== source
                                                );
                                            field.onChange(updatedSources);
                                          }}
                                        />
                                        <label
                                          htmlFor={`stress-source-${source}`}
                                          className="text-sm font-normal capitalize"
                                        >
                                          {source}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={stressForm.control}
                              name="notes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Notes (Optional)</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Any specific triggers or coping strategies used?"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter>
                              <Button type="submit">Save</Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Mood
                  </CardTitle>
                  <Smile className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Positive</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500 flex items-center">
                      <ArrowUp className="h-3 w-3 mr-1" />
                      12% improvement
                    </span>{" "}
                    from last week
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Sleep Quality
                  </CardTitle>
                  <Moon className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7.3 hrs</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-blue-500 flex items-center">
                      <ArrowRight className="h-3 w-3 mr-1" />
                      Similar to last week
                    </span>
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Physical Activity
                  </CardTitle>
                  <Activity className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">42.8 min/day</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-red-500 flex items-center">
                      <ArrowDown className="h-3 w-3 mr-1" />
                      8% decrease
                    </span>{" "}
                    from last week
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Stress Level
                  </CardTitle>
                  <Brain className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Moderate</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-orange-500 flex items-center">
                      <ArrowRight className="h-3 w-3 mr-1" />
                      No significant change
                    </span>
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Content */}
            <Tabs defaultValue="overview" className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="mood">Mood</TabsTrigger>
                  <TabsTrigger value="sleep">Sleep</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="reports">Reports</TabsTrigger>
                </TabsList>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>

              <TabsContent value="overview" className="space-y-6">
                {/* Mood Trends Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Mood Trends</CardTitle>
                    <CardDescription>
                      Your emotional state over the past week
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={moodData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="happy"
                          stroke="#4ade80"
                          activeDot={{ r: 8 }}
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="neutral"
                          stroke="#60a5fa"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="sad"
                          stroke="#f87171"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sleep Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Sleep Duration</CardTitle>
                      <CardDescription>
                        Hours of sleep per night
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sleepData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis domain={[0, 10]} />
                          <Tooltip />
                          <Bar dataKey="hours" fill="#60a5fa" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Activity Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Physical Activity</CardTitle>
                      <CardDescription>
                        Minutes of exercise per day
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={activityData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="minutes" fill="#f59e0b" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Stress Factors */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Stress Factors</CardTitle>
                      <CardDescription>
                        Sources of stress in your life
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stressFactorsData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {stressFactorsData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Insights */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Weekly Insights</CardTitle>
                      <CardDescription>
                        Analysis for {weekRange}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {insights.map((insight, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div
                              className={`rounded-full p-2 ${
                                insight.change === "positive"
                                  ? "bg-green-100"
                                  : insight.change === "negative"
                                  ? "bg-red-100"
                                  : "bg-blue-100"
                              }`}
                            >
                              {insight.icon}
                            </div>
                            <div>
                              <h4 className="font-medium">{insight.title}</h4>
                              <p className="text-sm text-gray-500">
                                {insight.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="mood">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Detailed Mood Analysis</CardTitle>
                      <CardDescription>
                        Breakdown of your emotional states
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={moodData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="happy"
                            stroke="#4ade80"
                            activeDot={{ r: 8 }}
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="neutral"
                            stroke="#60a5fa"
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="sad"
                            stroke="#f87171"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Mood Distribution</CardTitle>
                      <CardDescription>Overall mood breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="h-96">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={moodDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {moodDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="sleep">
                <Card>
                  <CardHeader>
                    <CardTitle>Sleep Patterns</CardTitle>
                    <CardDescription>
                      Detailed analysis of your sleep quality and duration
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={sleepData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 10]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="hours" fill="#60a5fa" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity">
                <Card>
                  <CardHeader>
                    <CardTitle>Physical Activity Tracking</CardTitle>
                    <CardDescription>
                      Monitor your exercise and movement patterns
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={activityData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="minutes" fill="#f59e0b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Journal Entries</CardTitle>
                        <CardDescription>
                          Your latest reflections and thoughts
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {journalEntries.map((entry) => (
                            <div
                              key={entry.id}
                              className="rounded-lg border p-4"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  {moodIcons[entry.mood]}
                                  <h3 className="font-medium ml-2">
                                    {entry.title}
                                  </h3>
                                </div>
                                <div className="flex items-center text-xs text-gray-400">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  <span>
                                    {format(entry.date, "MMM d, yyyy")}
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-500">
                                {entry.excerpt}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle>Available Reports</CardTitle>
                        <CardDescription>
                          Download detailed analysis
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="rounded-full bg-blue-100 p-2 mr-3">
                                <FileText className="h-4 w-4 text-blue-500" />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">
                                  Weekly Summary
                                </h4>
                                <p className="text-xs text-gray-500">
                                  Last 7 days analysis
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="rounded-full bg-green-100 p-2 mr-3">
                                <BarChart2 className="h-4 w-4 text-green-500" />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">
                                  Mood Patterns
                                </h4>
                                <p className="text-xs text-gray-500">
                                  Monthly trend analysis
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="rounded-full bg-purple-100 p-2 mr-3">
                                <PieChartIcon className="h-4 w-4 text-purple-500" />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">
                                  Sleep Quality
                                </h4>
                                <p className="text-xs text-gray-500">
                                  Detailed sleep metrics
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="rounded-full bg-orange-100 p-2 mr-3">
                                <Activity className="h-4 w-4 text-orange-500" />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium">
                                  Activity Report
                                </h4>
                                <p className="text-xs text-gray-500">
                                  Exercise and movement data
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>Personalized Recommendations</CardTitle>
                <CardDescription>
                  Based on your recent data and patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-lg border p-4 bg-blue-50 border-blue-100">
                    <div className="flex items-center mb-3">
                      <div className="rounded-full bg-blue-100 p-2 mr-3">
                        <Moon className="h-5 w-5 text-blue-500" />
                      </div>
                      <h3 className="font-medium">Improve Sleep Quality</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Try to maintain a consistent sleep schedule. Aim for 7-8
                      hours of sleep each night and avoid screens before
                      bedtime.
                    </p>
                  </div>

                  <div className="rounded-lg border p-4 bg-green-50 border-green-100">
                    <div className="flex items-center mb-3">
                      <div className="rounded-full bg-green-100 p-2 mr-3">
                        <Heart className="h-5 w-5 text-green-500" />
                      </div>
                      <h3 className="font-medium">
                        Increase Physical Activity
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Your activity levels have decreased. Try to incorporate at
                      least 30 minutes of moderate exercise daily.
                    </p>
                  </div>

                  <div className="rounded-lg border p-4 bg-purple-50 border-purple-100">
                    <div className="flex items-center mb-3">
                      <div className="rounded-full bg-purple-100 p-2 mr-3">
                        <Coffee className="h-5 w-5 text-purple-500" />
                      </div>
                      <h3 className="font-medium">Manage Work Stress</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      Work appears to be your main stressor. Consider taking
                      short breaks during the day and practicing mindfulness
                      techniques.
                    </p>
                  </div>
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
