/**
 * Login Section Component
 *
 * Optional login UI for Settings screen
 * - Shows login prompt for anonymous Pro users only (cloud backup is Pro feature)
 * - Shows account info for authenticated users
 * - Hidden for anonymous free users
 * - Value-driven: emphasizes cloud backup benefit
 */

import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { User, LogIn, LogOut, Cloud, Mail, Lock } from "lucide-react-native";

export function LoginSection() {
  const { user, isAnonymous, signIn, signUp, signOut } = useAuth();
  const { isPremium } = useSubscription();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginPress = () => {
    setShowLoginModal(true);
    setIsSignUp(false);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSignUpPress = () => {
    setShowLoginModal(true);
    setIsSignUp(true);
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (isSignUp && password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      setIsSubmitting(true);
      if (isSignUp) {
        await signUp(email, password);
        Alert.alert("Success", "Account created successfully!");
      } else {
        await signIn(email, password);
        Alert.alert("Success", "Signed in successfully!");
      }
      setShowLoginModal(false);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to authenticate");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out? Your data will remain on this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut();
              Alert.alert("Success", "Signed out successfully");
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to sign out");
            }
          },
        },
      ]
    );
  };

  // Show login prompt only for anonymous Pro users (cloud backup is a Pro feature)
  if (isAnonymous && isPremium) {
    return (
      <View className="mb-6">
        <View className="bg-white rounded-2xl p-4 shadow-sm">
          <View className="flex-row items-center mb-3">
            <Cloud size={24} color="#3B82F6" />
            <Text className="text-lg font-semibold text-gray-900 ml-2">
              Backup Your Data
            </Text>
          </View>
          <Text className="text-sm text-gray-600 mb-4">
            Sign in to enable cloud backup and restore your data on any device.
          </Text>
          <Pressable
            onPress={handleLoginPress}
            className="bg-blue-500 rounded-xl py-3 px-4 flex-row items-center justify-center"
          >
            <LogIn size={20} color="#FFFFFF" />
            <Text className="text-white font-semibold ml-2">Sign In</Text>
          </Pressable>
          <Pressable
            onPress={handleSignUpPress}
            className="mt-2 bg-gray-100 rounded-xl py-3 px-4 flex-row items-center justify-center"
          >
            <Text className="text-gray-700 font-semibold">Create Account</Text>
          </Pressable>
        </View>

        <LoginModal
          visible={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          isSignUp={isSignUp}
          email={email}
          password={password}
          confirmPassword={confirmPassword}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onToggleMode={() => setIsSignUp(!isSignUp)}
        />
      </View>
    );
  }

  // Don't show anything for anonymous free users (cloud backup is Pro-only)
  if (isAnonymous && !isPremium) {
    return null;
  }

  // Show account info for authenticated users
  return (
    <View className="mb-6">
      <View className="bg-white rounded-2xl p-4 shadow-sm">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <User size={24} color="#10B981" />
            <View className="ml-2">
              <Text className="text-lg font-semibold text-gray-900">
                Account
              </Text>
              <Text className="text-sm text-gray-600">
                {user?.email || "Signed in"}
              </Text>
            </View>
          </View>
          <Pressable
            onPress={handleSignOut}
            className="bg-red-50 rounded-lg py-2 px-3 flex-row items-center"
          >
            <LogOut size={16} color="#EF4444" />
            <Text className="text-red-600 font-semibold ml-1">Sign Out</Text>
          </Pressable>
        </View>
        {isPremium && (
          <View className="mt-3 pt-3 border-t border-gray-200">
            <View className="flex-row items-center">
              <Cloud size={16} color="#10B981" />
              <Text className="text-sm text-gray-600 ml-2">
                Cloud backup enabled
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
  isSignUp: boolean;
  email: string;
  password: string;
  confirmPassword: string;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onConfirmPasswordChange: (password: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  onToggleMode: () => void;
}

function LoginModal({
  visible,
  onClose,
  isSignUp,
  email,
  password,
  confirmPassword,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  isSubmitting,
  onToggleMode,
}: LoginModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6">
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-bold text-gray-900">
              {isSignUp ? "Create Account" : "Sign In"}
            </Text>
            <Pressable onPress={onClose}>
              <Text className="text-gray-500 text-lg">✕</Text>
            </Pressable>
          </View>

          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <Mail size={20} color="#6B7280" />
              <Text className="text-sm font-semibold text-gray-700 ml-2">
                Email
              </Text>
            </View>
            <TextInput
              value={email}
              onChangeText={onEmailChange}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900"
            />
          </View>

          <View className="mb-4">
            <View className="flex-row items-center mb-2">
              <Lock size={20} color="#6B7280" />
              <Text className="text-sm font-semibold text-gray-700 ml-2">
                Password
              </Text>
            </View>
            <TextInput
              value={password}
              onChangeText={onPasswordChange}
              placeholder="Enter your password"
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900"
            />
          </View>

          {isSignUp && (
            <View className="mb-4">
              <View className="flex-row items-center mb-2">
                <Lock size={20} color="#6B7280" />
                <Text className="text-sm font-semibold text-gray-700 ml-2">
                  Confirm Password
                </Text>
              </View>
              <TextInput
                value={confirmPassword}
                onChangeText={onConfirmPasswordChange}
                placeholder="Confirm your password"
                secureTextEntry
                autoCapitalize="none"
                className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900"
              />
            </View>
          )}

          <Pressable
            onPress={onSubmit}
            disabled={isSubmitting}
            className="bg-blue-500 rounded-xl py-4 flex-row items-center justify-center mb-3"
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <LogIn size={20} color="#FFFFFF" />
                <Text className="text-white font-semibold ml-2">
                  {isSignUp ? "Create Account" : "Sign In"}
                </Text>
              </>
            )}
          </Pressable>

          <Pressable onPress={onToggleMode} className="py-2">
            <Text className="text-center text-gray-600">
              {isSignUp
                ? "Already have an account? "
                : "Don't have an account? "}
              <Text className="text-blue-500 font-semibold">
                {isSignUp ? "Sign In" : "Sign Up"}
              </Text>
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
