"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
// import bcrypt from "bcryptjs"; // or 'bcrypt' if using Node.js bcrypt
import users from "@/data/user.json";

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form states
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  // Form validation (unchanged)
  const validateLoginForm = () => {
    /* ... */
  };
  const validateSignupForm = () => {
    /* ... */
  };

  // Handle login with bcrypt verification
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validateLoginForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call - Find user in your JSON data
      const user = users.find((u) => u.email === loginForm.email);

      if (!user) {
        throw new Error("User not found");
      }

      // Verify password with bcrypt
      // const isMatch = await bcrypt.compare(loginForm.password, user.password);
      const isMatch = loginForm.password === user.password; // Simulated for demo purposes

      if (!isMatch) {
        throw new Error("Invalid credentials");
      }

      setSuccess("Login successful! Redirecting...");

      setTimeout(() => {
        router.push("/main");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle signup with password hashing
  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const validationError = validateSignupForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      // Check if user already exists
      const userExists = users.some((u) => u.email === signupForm.email);
      if (userExists) {
        throw new Error("Email already registered");
      }

      // Hash password with bcrypt
      const salt = await bcrypt.genSalt(10);
      // const hashedPassword = await bcrypt.hash(signupForm.password, salt);
      const hashedPassword = signupForm.password; // Simulated for demo purposes
      console.log("New user would be created with:", {
        name: signupForm.name,
        email: signupForm.email,
        password: hashedPassword, // Never store plaintext!
        createdAt: new Date().toISOString(),
      });

      setSuccess("Account created successfully! You can now log in.");

      // Reset form and switch to login tab
      setSignupForm({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeTerms: false,
      });

      setTimeout(() => {
        setActiveTab("login");
        setSuccess(null);
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google login
  const handleGoogleLogin = () => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    // Simulate Google OAuth
    setTimeout(() => {
      setIsLoading(false);
      setSuccess("Google login successful! Redirecting...");

      // Simulate redirect after successful login
      setTimeout(() => {
        router.push("/main");
      }, 1500);
    }, 2000);
  };

  // Handle forgot password
  const handleForgotPassword = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!loginForm.email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccess("Password reset link sent to your email!");
    }, 2000);
  };

  // const router = useRouter();
  // const [activeTab, setActiveTab] = useState("login");
  // const [showPassword, setShowPassword] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState(null);
  // const [success, setSuccess] = useState(null);

  // // Form states
  // const [loginForm, setLoginForm] = useState({
  //   email: "",
  //   password: "",
  //   rememberMe: false,
  // });

  // const [signupForm, setSignupForm] = useState({
  //   name: "",
  //   email: "",
  //   password: "",
  //   confirmPassword: "",
  //   agreeTerms: false,
  // });

  // // Form validation
  // const validateLoginForm = () => {
  //   if (!loginForm.email) return "Email is required";
  //   if (!loginForm.password) return "Password is required";
  //   return null;
  // };

  // const validateSignupForm = () => {
  //   if (!signupForm.name) return "Name is required";
  //   if (!signupForm.email) return "Email is required";
  //   if (!signupForm.password) return "Password is required";
  //   if (signupForm.password.length < 8)
  //     return "Password must be at least 8 characters";
  //   if (signupForm.password !== signupForm.confirmPassword)
  //     return "Passwords do not match";
  //   if (!signupForm.agreeTerms)
  //     return "You must agree to the terms and conditions";
  //   return null;
  // };

  // // Handle login
  // const handleLogin = (e) => {
  //   e.preventDefault();
  //   setError(null);
  //   setSuccess(null);

  //   const validationError = validateLoginForm();
  //   if (validationError) {
  //     setError(validationError);
  //     return;
  //   }

  //   setIsLoading(true);

  //   // Simulate API call
  //   setTimeout(() => {
  //     setIsLoading(false);
  //     setSuccess("Login successful! Redirecting...");

  //     // Simulate redirect after successful login
  //     setTimeout(() => {
  //       router.push("/main");
  //     }, 1500);
  //   }, 2000);
  // };

  // // Handle signup
  // const handleSignup = (e) => {
  //   e.preventDefault();
  //   setError(null);
  //   setSuccess(null);

  //   const validationError = validateSignupForm();
  //   if (validationError) {
  //     setError(validationError);
  //     return;
  //   }

  //   setIsLoading(true);

  //   // Simulate API call
  //   setTimeout(() => {
  //     setIsLoading(false);
  //     setSuccess("Account created successfully! You can now log in.");

  //     // Reset form and switch to login tab
  //     setSignupForm({
  //       name: "",
  //       email: "",
  //       password: "",
  //       confirmPassword: "",
  //       agreeTerms: false,
  //     });

  //     setTimeout(() => {
  //       setActiveTab("login");
  //       setSuccess(null);
  //     }, 2000);
  //   }, 2000);
  // };

  // // Handle Google login
  // const handleGoogleLogin = () => {
  //   setError(null);
  //   setSuccess(null);
  //   setIsLoading(true);

  //   // Simulate Google OAuth
  //   setTimeout(() => {
  //     setIsLoading(false);
  //     setSuccess("Google login successful! Redirecting...");

  //     // Simulate redirect after successful login
  //     setTimeout(() => {
  //       router.push("/main");
  //     }, 1500);
  //   }, 2000);
  // };

  // // Handle forgot password
  // const handleForgotPassword = (e) => {
  //   e.preventDefault();
  //   setError(null);
  //   setSuccess(null);

  //   if (!loginForm.email) {
  //     setError("Please enter your email address");
  //     return;
  //   }

  //   setIsLoading(true);

  //   // Simulate API call
  //   setTimeout(() => {
  //     setIsLoading(false);
  //     setSuccess("Password reset link sent to your email!");
  //   }, 2000);
  // };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <Navigation />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Welcome to Warasin</h1>
            <p className="text-gray-500 mt-2">Your mental health companion</p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login to your account</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="Email address"
                          className="pl-10"
                          value={loginForm.email}
                          onChange={(e) =>
                            setLoginForm({
                              ...loginForm,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          className="pl-10 pr-10"
                          value={loginForm.password}
                          onChange={(e) =>
                            setLoginForm({
                              ...loginForm,
                              password: e.target.value,
                            })
                          }
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember-me"
                          checked={loginForm.rememberMe}
                          onCheckedChange={(checked) =>
                            setLoginForm({
                              ...loginForm,
                              rememberMe: !!checked,
                            })
                          }
                        />
                        <label
                          htmlFor="remember-me"
                          className="text-sm text-gray-500 cursor-pointer"
                        >
                          Remember me
                        </label>
                      </div>
                      <button
                        type="button"
                        className="text-sm text-blue-500 hover:text-blue-700"
                        onClick={handleForgotPassword}
                      >
                        Forgot password?
                      </button>
                    </div>

                    {error && (
                      <Alert
                        variant="destructive"
                        className="bg-red-50 text-red-600 border-red-200"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert className="bg-green-50 text-green-600 border-green-200">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-blue-500 hover:bg-blue-600"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>

                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative bg-white px-4 text-sm text-gray-500">
                        or continue with
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                    >
                      <Image
                        src="/google-logo.svg"
                        alt="Google"
                        width={20}
                        height={20}
                        className="mr-2"
                      />
                      Google
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-gray-500">
                    Don't have an account?{" "}
                    <button
                      type="button"
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => setActiveTab("signup")}
                    >
                      Sign up
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Sign Up Tab */}
            <TabsContent value="signup">
              <Card>
                <CardHeader>
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>
                    Enter your details to create a new account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Full name"
                          className="pl-10"
                          value={signupForm.name}
                          onChange={(e) =>
                            setSignupForm({
                              ...signupForm,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="Email address"
                          className="pl-10"
                          value={signupForm.email}
                          onChange={(e) =>
                            setSignupForm({
                              ...signupForm,
                              email: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          className="pl-10 pr-10"
                          value={signupForm.password}
                          onChange={(e) =>
                            setSignupForm({
                              ...signupForm,
                              password: e.target.value,
                            })
                          }
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">
                        Password must be at least 8 characters long
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Confirm password"
                          className="pl-10"
                          value={signupForm.confirmPassword}
                          onChange={(e) =>
                            setSignupForm({
                              ...signupForm,
                              confirmPassword: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="terms"
                        checked={signupForm.agreeTerms}
                        onCheckedChange={(checked) =>
                          setSignupForm({
                            ...signupForm,
                            agreeTerms: !!checked,
                          })
                        }
                      />
                      <label htmlFor="terms" className="text-sm text-gray-500">
                        I agree to the{" "}
                        <Link
                          href="#"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="#"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Privacy Policy
                        </Link>
                      </label>
                    </div>

                    {error && (
                      <Alert
                        variant="destructive"
                        className="bg-red-50 text-red-600 border-red-200"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert className="bg-green-50 text-green-600 border-green-200">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-blue-500 hover:bg-blue-600"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>

                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative bg-white px-4 text-sm text-gray-500">
                        or continue with
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                    >
                      <Image
                        src="/google-logo.svg"
                        alt="Google"
                        width={20}
                        height={20}
                        className="mr-2"
                      />
                      Google
                    </Button>
                  </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <p className="text-sm text-gray-500">
                    Already have an account?{" "}
                    <button
                      type="button"
                      className="text-blue-500 hover:text-blue-700"
                      onClick={() => setActiveTab("login")}
                    >
                      Login
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
