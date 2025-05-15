// utils/auth.js
import bcrypt from "bcryptjs";
import users from "@/data/users.json";

// Simulate API delay
const simulateAPI = () => new Promise((resolve) => setTimeout(resolve, 1000));

export const authService = {
  async login(email, password) {
    await simulateAPI();

    const user = users.find((u) => u.email === email);
    if (!user) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    // Return user data without password
    const { password: _, ...userData } = user;
    return userData;
  },

  async signup(userData) {
    await simulateAPI();

    const exists = users.some((u) => u.email === userData.email);
    if (exists) throw new Error("Email already registered");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // In real app, this would POST to your backend
    const newUser = {
      id: `user_${Math.random().toString(36).slice(2)}`,
      ...userData,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      role: "user",
    };

    return newUser;
  },

  async googleAuth(token) {
    await simulateAPI();
    // Simulate Google auth - in real app, verify token with Google API
    return {
      id: "google_user_123",
      email: "user@gmail.com",
      name: "Google User",
      avatar: "/avatars/google.jpg",
      role: "user",
    };
  },

  async forgotPassword(email) {
    await simulateAPI();
    if (!users.some((u) => u.email === email)) {
      throw new Error("Email not found");
    }
    return { success: true };
  },
};
