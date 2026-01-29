import { useState } from 'react';
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Briefcase, Mail, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useAuthStore } from '@/lib/state/auth-store';
import * as Haptics from 'expo-haptics';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setError('');
    const success = await login(email, password);

    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError('Invalid email or password. Need an account?');
    }
  };

  return (
    <View className="flex-1 bg-workly-bg-dark">
      <ImageBackground
        source={require('../../public/Background-WGUU.png')}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <SafeAreaView className="flex-1">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
          >
            <ScrollView
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardShouldPersistTaps="handled"
            >
              <View className="flex-1 justify-center px-6">
                {/* Logo Area */}
                <View className="items-center mb-12">
                  <View className="w-20 h-20 bg-workly-accent rounded-2xl items-center justify-center mb-4">
                    <Briefcase color="white" size={40} />
                  </View>
                  <Text className="text-white text-3xl font-bold">Workly</Text>
                  <Text className="text-slate-400 text-base mt-2">
                    Find local service professionals
                  </Text>
                </View>

                {/* Form */}
                <View className="space-y-4">
                  <View>
                    <View className="flex-row items-center bg-workly-bg-input/70 rounded-xl px-4 py-3 border border-workly-border">
                      <Mail color="#6B7280" size={20} />
                      <TextInput
                        className="flex-1 ml-3 text-white text-base"
                        placeholder="Email address"
                        placeholderTextColor="#6B7280"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                      />
                    </View>
                  </View>

                  <View className="mt-4">
                    <View className="flex-row items-center bg-workly-bg-input/70 rounded-xl px-4 py-3 border border-workly-border">
                      <Lock color="#6B7280" size={20} />
                      <TextInput
                        className="flex-1 ml-3 text-white text-base"
                        placeholder="Password"
                        placeholderTextColor="#6B7280"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        autoComplete="password"
                      />
                      <Pressable onPress={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                          <EyeOff color="#6B7280" size={20} />
                        ) : (
                          <Eye color="#6B7280" size={20} />
                        )}
                      </Pressable>
                    </View>
                  </View>

                  {error ? (
                    <Text className="text-red-400 text-center mt-2">{error}</Text>
                  ) : null}

                  <Pressable
                    onPress={handleLogin}
                    disabled={isLoading}
                    className="mt-6"
                  >
                    <LinearGradient
                      colors={['#6B8AFE', '#4A6BE0']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ borderRadius: 12, paddingVertical: 16 }}
                    >
                      <Text className="text-white text-center font-semibold text-lg">
                        {isLoading ? 'Signing in...' : 'Sign In'}
                      </Text>
                    </LinearGradient>
                  </Pressable>
                </View>

                {/* Register Link */}
                <View className="flex-row justify-center mt-8">
                  <Text className="text-slate-400">Don't have an account? </Text>
                  <Pressable onPress={() => router.push('/register')}>
                    <Text className="text-workly-accent font-semibold">Sign Up</Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
