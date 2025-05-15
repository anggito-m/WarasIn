"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Camera,
  Upload,
  RefreshCw,
  Smile,
  Frown,
  Meh,
  AlertTriangle,
  Info,
  X,
  Check,
  ChevronRight,
  Lightbulb,
  ImageIcon,
} from "lucide-react";

export default function FacialRecognitionPage() {
  const [activeTab, setActiveTab] = useState("camera");
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [stream, setStream] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  //   const DynamicVideo = dynamic(() => import("./VideoComponent"), {
  //     ssr: false,
  //     loading: () => <p>Loading camera...</p>,
  //   });
  // Sample emotion data for the mock analysis
  const emotionData = [
    { emotion: "Happy", color: "#4ade80", icon: <Smile className="h-5 w-5" /> },
    { emotion: "Sad", color: "#f87171", icon: <Frown className="h-5 w-5" /> },
    {
      emotion: "Angry",
      color: "#ef4444",
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    {
      emotion: "Surprised",
      color: "#facc15",
      icon: <Info className="h-5 w-5" />,
    },
    { emotion: "Neutral", color: "#94a3b8", icon: <Meh className="h-5 w-5" /> },
  ];

  // Sample recommendations based on detected emotion
  const recommendations = {
    Happy: [
      "Continue engaging in activities that bring you joy",
      "Share your positive energy with others",
      "Journal about what made you feel happy today",
    ],
    Sad: [
      "Practice self-compassion and be gentle with yourself",
      "Reach out to a friend or loved one for support",
      "Try a mood-boosting activity like a walk in nature",
    ],
    Angry: [
      "Take deep breaths and practice mindfulness",
      "Step away from triggering situations if possible",
      "Try physical activity to release tension",
    ],
    Surprised: [
      "Take a moment to process your emotions",
      "Reflect on what surprised you and why",
      "Consider how to adapt to unexpected situations",
    ],
    Neutral: [
      "Check in with yourself about how you're really feeling",
      "Try activities that typically boost your mood",
      "Practice mindfulness to increase emotional awareness",
    ],
  };

  // Initialize camera when tab changes to camera
  useEffect(() => {
    if (activeTab === "camera") {
      if (isCapturing && !stream) {
        startCamera();
      }
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [activeTab, isCapturing]);

  // Start camera function
  const startCamera = async () => {
    try {
      if (typeof window !== "undefined" && navigator.mediaDevices) {
        setCameraError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current
            .play()
            .catch((err) => console.error("Video play error:", err));
        }
        setIsCapturing(true);
      } else {
        throw new Error("Camera API not available");
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setCameraError(
        "Unable to access camera. Please check permissions and try again."
      );
      setIsCapturing(false);
    }

    // try {
    //   setCameraError(null);
    //   const mediaStream = await navigator.mediaDevices.getUserMedia({
    //     video: { facingMode: "user" },
    //     audio: false,
    //   });
    //   setStream(mediaStream);
    //   if (videoRef.current) {
    //     videoRef.current.srcObject = mediaStream;
    //   }
    //   setIsCapturing(true);
    // } catch (err) {
    //   console.error("Error accessing camera:", err);
    //   setCameraError(
    //     "Unable to access camera. Please check permissions and try again."
    //   );
    //   setIsCapturing(false);
    // }
  };

  // Stop camera function
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
      setStream(null);
    }
    setIsCapturing(false);
    // if (stream) {
    //   stream.getTracks().forEach((track) => track.stop());
    //   setStream(null);
    // }
    // setIsCapturing(false);
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          const imageUrl = URL.createObjectURL(blob);
          setCapturedImage(imageUrl);
          stopCamera();
        },
        "image/jpeg",
        0.95
      );
    }
    // if (videoRef.current && canvasRef.current) {
    //   const video = videoRef.current;
    //   const canvas = canvasRef.current;
    //   const context = canvas.getContext("2d");

    //   // Set canvas dimensions to match video
    //   canvas.width = video.videoWidth;
    //   canvas.height = video.videoHeight;

    //   // Draw the current video frame on the canvas
    //   context.drawImage(video, 0, 0, canvas.width, canvas.height);

    //   // Convert canvas to data URL
    //   const imageDataUrl = canvas.toDataURL("image/png");
    //   setCapturedImage(imageDataUrl);
    //   stopCamera();
    // }
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle drag and drop
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Reset captured/uploaded image
  const resetImage = () => {
    setCapturedImage(null);
    setUploadedImage(null);
    setAnalysisResults(null);
  };

  // Analyze facial expression
  const analyzeExpression = () => {
    setIsAnalyzing(true);

    // Simulate AI analysis with a timeout
    setTimeout(() => {
      // Generate mock analysis results
      const mockResults = {
        primaryEmotion:
          emotionData[Math.floor(Math.random() * emotionData.length)].emotion,
        confidence: Math.floor(Math.random() * 30) + 70, // Random confidence between 70-99%
        emotionScores: emotionData.map((emotion) => ({
          emotion: emotion.emotion,
          score: Math.floor(Math.random() * 100),
          color: emotion.color,
          icon: emotion.icon,
        })),
      };

      // Sort emotion scores in descending order
      mockResults.emotionScores.sort((a, b) => b.score - a.score);

      setAnalysisResults(mockResults);
      setIsAnalyzing(false);
    }, 2000);
  };

  // Get the current image source (either captured or uploaded)
  const getCurrentImage = () => {
    return capturedImage || uploadedImage;
  };

  const CameraView = () => (
    <div className="relative w-full max-w-lg mx-auto">
      {!isCapturing ? (
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Camera className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">Camera is off</p>
          <Button onClick={startCamera}>
            <Camera className="mr-2 h-4 w-4" /> Start Camera
          </Button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-lg border"
          />
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            <Button
              onClick={capturePhoto}
              className="rounded-full w-16 h-16 bg-red-500 hover:bg-red-600"
            >
              <Camera className="h-6 w-6" />
            </Button>
            <Button
              variant="outline"
              onClick={stopCamera}
              className="rounded-full"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </>
      )}
      {cameraError && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          <AlertTriangle className="inline mr-2" />
          {cameraError}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <main className="flex-1 overflow-auto">
          <div className="border-b">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold">
                Facial Expression Recognition
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
            {/* Page Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold">
                Analyze Your Facial Expressions
              </h2>
              <p className="text-gray-500">
                Capture or upload a photo to analyze your facial expressions and
                understand your emotions
              </p>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Image Capture/Upload */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Capture or Upload Your Photo</CardTitle>
                    <CardDescription>
                      Take a photo with your camera or upload an existing image
                      for analysis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs
                      value={activeTab}
                      onValueChange={setActiveTab}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger
                          value="camera"
                          disabled={!!getCurrentImage()}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Camera
                        </TabsTrigger>
                        <TabsTrigger
                          value="upload"
                          disabled={!!getCurrentImage()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="camera" className="mt-0">
                        <CameraView />
                        {capturedImage && (
                          <div className="mt-6">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="font-medium">Captured Image</h3>
                              <Button variant="ghost" onClick={resetImage}>
                                <RefreshCw className="mr-2 h-4 w-4" /> Retake
                              </Button>
                            </div>
                            <img
                              src={capturedImage}
                              alt="Captured"
                              className="rounded-lg border max-h-80 object-contain mx-auto"
                            />
                            <Button
                              className="mt-4 w-full"
                              onClick={analyzeExpression}
                              disabled={isAnalyzing}
                            >
                              {isAnalyzing ? (
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Lightbulb className="mr-2 h-4 w-4" />
                              )}
                              Analyze Expression
                            </Button>
                          </div>
                        )}
                        {/* {!capturedImage ? (
                          <div className="flex flex-col items-center">
                            {cameraError ? (
                              <div className="text-center p-6 bg-red-50 rounded-lg border border-red-100 mb-4">
                                <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-2" />
                                <p className="text-red-600">{cameraError}</p>
                                <Button
                                  variant="outline"
                                  className="mt-4"
                                  onClick={() => {
                                    setCameraError(null);
                                    startCamera();
                                  }}
                                >
                                  Try Again
                                </Button>
                              </div>
                            ) : isCapturing ? (
                              <div className="relative w-full max-w-md mx-auto">
                                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                  <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="mt-4 flex justify-center">
                                  <Button
                                    onClick={capturePhoto}
                                    className="bg-blue-500 hover:bg-blue-600"
                                  >
                                    <Camera className="h-4 w-4 mr-2" />
                                    Capture Photo
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-center p-10">
                                <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium mb-2">
                                  Camera Access Required
                                </h3>
                                <p className="text-gray-500 mb-4">
                                  Please allow access to your camera to capture
                                  a photo for analysis
                                </p>
                                <Button
                                  onClick={startCamera}
                                  className="bg-blue-500 hover:bg-blue-600"
                                >
                                  Start Camera
                                </Button>
                              </div>
                            )}
                            <canvas ref={canvasRef} className="hidden" />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className="relative w-full max-w-md mx-auto">
                              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                <img
                                  src={capturedImage || "/placeholder.svg"}
                                  alt="Captured"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          </div>
                        )} */}
                      </TabsContent>

                      <TabsContent value="upload" className="mt-0">
                        {!uploadedImage ? (
                          <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={triggerFileInput}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                          >
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileUpload}
                              accept="image/*"
                              className="hidden"
                            />
                            <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">
                              Upload an Image
                            </h3>
                            <p className="text-gray-500 mb-4">
                              Drag and drop an image here, or click to select a
                              file
                            </p>
                            <Button variant="outline">Select Image</Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className="relative w-full max-w-md mx-auto">
                              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                                <img
                                  src={uploadedImage || "/placeholder.svg"}
                                  alt="Uploaded"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>

                    {getCurrentImage() && (
                      <div className="mt-6 flex justify-center gap-4">
                        <Button variant="outline" onClick={resetImage}>
                          <X className="h-4 w-4 mr-2" />
                          Reset
                        </Button>
                        <Button
                          onClick={analyzeExpression}
                          className="bg-blue-500 hover:bg-blue-600"
                          disabled={isAnalyzing}
                        >
                          {isAnalyzing ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4 mr-2" />
                              Analyze Expression
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Analysis Results */}
                {analysisResults && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Analysis Results</CardTitle>
                      <CardDescription>
                        AI-powered facial expression analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-medium mb-4">
                            Primary Emotion
                          </h3>
                          <div className="flex items-center gap-3 mb-4">
                            <div
                              className="p-4 rounded-full"
                              style={{
                                backgroundColor:
                                  emotionData.find(
                                    (e) =>
                                      e.emotion ===
                                      analysisResults.primaryEmotion
                                  )?.color + "33",
                              }}
                            >
                              {
                                emotionData.find(
                                  (e) =>
                                    e.emotion === analysisResults.primaryEmotion
                                )?.icon
                              }
                            </div>
                            <div>
                              <div className="text-2xl font-bold">
                                {analysisResults.primaryEmotion}
                              </div>
                              <div className="text-sm text-gray-500">
                                {analysisResults.confidence}% confidence
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4 mt-6">
                            <h3 className="text-lg font-medium">
                              Recommendations
                            </h3>
                            <ul className="space-y-2">
                              {recommendations[
                                analysisResults.primaryEmotion
                              ]?.map((rec, index) => (
                                <li
                                  key={index}
                                  className="flex items-start gap-2"
                                >
                                  <div className="mt-1 rounded-full bg-blue-100 p-1">
                                    <Check className="h-3 w-3 text-blue-600" />
                                  </div>
                                  <span className="text-sm">{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-4">
                            Emotion Distribution
                          </h3>
                          <div className="space-y-4">
                            {analysisResults.emotionScores.map((emotion) => (
                              <div key={emotion.emotion}>
                                <div className="flex justify-between items-center mb-1">
                                  <div className="flex items-center gap-2">
                                    {emotion.icon}
                                    <span>{emotion.emotion}</span>
                                  </div>
                                  <span className="text-sm font-medium">
                                    {emotion.score}%
                                  </span>
                                </div>
                                {/* <Progress
                                  value={emotion.score}
                                  className="h-2"
                                  indicatorClassName={`bg-[${emotion.color}]`}
                                  style={{
                                    "--progress-background":
                                      "hsl(var(--muted))",
                                  }}
                                /> */}
                                <Progress
                                  value={emotion.score}
                                  className="h-2 bg-gray-200" // Base styles
                                  style={{
                                    // Use the emotion color directly in style
                                    backgroundColor: emotion.color,
                                    // Or if you need the CSS variable approach:
                                    "--progress-indicator": emotion.color,
                                    "--progress-background":
                                      "hsl(var(--muted))",
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right Column - Information */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>How It Works</CardTitle>
                    <CardDescription>
                      Understanding facial expression recognition
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-blue-100 p-2 mt-1">
                          <Camera className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Capture or Upload</h4>
                          <p className="text-sm text-gray-500">
                            Take a photo with your device's camera or upload an
                            existing image
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-blue-100 p-2 mt-1">
                          <RefreshCw className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">AI Analysis</h4>
                          <p className="text-sm text-gray-500">
                            Our AI model analyzes facial features to detect
                            emotions
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-blue-100 p-2 mt-1">
                          <Smile className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Emotion Recognition</h4>
                          <p className="text-sm text-gray-500">
                            The system identifies emotions like happiness,
                            sadness, anger, and more
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-blue-100 p-2 mt-1">
                          <Lightbulb className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">Personalized Insights</h4>
                          <p className="text-sm text-gray-500">
                            Receive recommendations based on your emotional
                            state
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Privacy Information</CardTitle>
                    <CardDescription>How we handle your data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 text-sm text-gray-500">
                      <p>
                        Your privacy is important to us. All facial analysis is
                        performed securely on our servers.
                      </p>
                      <p>
                        Images are not permanently stored and are deleted after
                        analysis is complete. Analysis results are stored in
                        your account for your reference.
                      </p>
                      <p>
                        You can delete your data at any time from your account
                        settings.
                      </p>
                      <Link
                        href="#"
                        className="text-blue-500 hover:text-blue-700 inline-flex items-center mt-2"
                      >
                        Learn more about our privacy policy
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Emotion Badges</CardTitle>
                    <CardDescription>
                      Understanding emotion indicators
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {emotionData.map((emotion) => (
                        <div
                          key={emotion.emotion}
                          className="flex items-center gap-2"
                        >
                          <Badge
                            className="flex items-center gap-1"
                            style={{
                              backgroundColor: emotion.color + "33",
                              color: emotion.color,
                              borderColor: emotion.color + "66",
                            }}
                          >
                            {emotion.icon}
                            <span>{emotion.emotion}</span>
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {emotion.emotion === "Happy"
                              ? "Indicates joy and positive feelings"
                              : emotion.emotion === "Sad"
                              ? "Indicates sadness or disappointment"
                              : emotion.emotion === "Angry"
                              ? "Indicates frustration or anger"
                              : emotion.emotion === "Surprised"
                              ? "Indicates astonishment or shock"
                              : "Indicates a balanced emotional state"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
    </div>
  );
}
