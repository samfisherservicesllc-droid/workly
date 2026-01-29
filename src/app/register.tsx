import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  MapPin,
  Briefcase,
  UserCircle,
  Home,
} from 'lucide-react-native';
import { useAuthStore } from '@/lib/state/auth-store';
import { UserRole } from '@/lib/types';
import * as Haptics from 'expo-haptics';

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [step, setStep] = useState<'role' | 'details'>('role');
  const [role, setRole] = useState<UserRole | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [city, setCity] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = (selectedRole: UserRole) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRole(selectedRole);
    setStep('details');
  };

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !city) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!role) {
      setError('Please select a role');
      return;
    }

    setError('');
    const success = await register(email, password, name, role, city, neighborhood);

    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (role === 'professional') {
        router.replace('/complete-profile');
      } else {
        router.replace('/(tabs)');
      }
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError('Email already in use');
    }
  };

  if (step === 'role') {
    return (
      <View className="flex-1">
        <LinearGradient
          colors={['#0A1A1F', '#122A30', '#1A3A42']}
          style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
        />
        <SafeAreaView className="flex-1">
          <View className="flex-1 justify-center px-6">
            <View className="items-center mb-12">
              <Text className="text-white text-3xl font-bold">Join Workly</Text>
              <Text className="text-slate-400 text-base mt-2 text-center">
                Are you looking for services or offering them?
              </Text>
            </View>

            <View className="space-y-4">
              <Pressable
                onPress={() => handleRoleSelect('client')}
                className="bg-workly-bg-input/50 rounded-2xl p-6 border border-workly-border active:scale-[0.98]"
              >
                <View className="flex-row items-center">
                  <View className="w-14 h-14 bg-blue-500/20 rounded-xl items-center justify-center">
                    <UserCircle color="#3B82F6" size={32} />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-white text-xl font-semibold">
                      I'm a Client
                    </Text>
                    <Text className="text-slate-400 mt-1">
                      Looking for service professionals
                    </Text>
                  </View>
                </View>
              </Pressable>

              <Pressable
                onPress={() => handleRoleSelect('professional')}
                className="bg-workly-bg-input/50 rounded-2xl p-6 border border-workly-border active:scale-[0.98] mt-4"
              >
                <View className="flex-row items-center">
                  <View className="w-14 h-14 bg-workly-teal/20 rounded-xl items-center justify-center">
                    <Briefcase color="#4A9BAD" size={32} />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-white text-xl font-semibold">
                      I'm a Professional
                    </Text>
                    <Text className="text-slate-400 mt-1">
                      Offering my services to clients
                    </Text>
                  </View>
                </View>
              </Pressable>
            </View>

            <View className="flex-row justify-center mt-8">
              <Text className="text-slate-400">Already have an account? </Text>
              <Pressable onPress={() => router.push('/login')}>
                <Text className="text-workly-teal font-semibold">Sign In</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#0A1A1F', '#122A30', '#1A3A42']}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 justify-center px-6">
              {/* Header */}
              <View className="items-center mb-8">
                <View
                  className={`w-16 h-16 rounded-2xl items-center justify-center mb-4 ${
                    role === 'professional' ? 'bg-workly-teal' : 'bg-blue-500'
                  }`}
                >
                  {role === 'professional' ? (
                    <Briefcase color="white" size={32} />
                  ) : (
                    <UserCircle color="white" size={32} />
                  )}
                </View>
                <Text className="text-white text-2xl font-bold">
                  Create {role === 'professional' ? 'Professional' : 'Client'} Account
                </Text>
              </View>

              {/* Form */}
              <View className="space-y-4">
                <View className="flex-row items-center bg-workly-bg-input/50 rounded-xl px-4 py-3 border border-workly-border">
                  <User color="#5A7A82" size={20} />
                  <TextInput
                    className="flex-1 ml-3 text-white text-base"
                    placeholder="Full name"
                    placeholderTextColor="#5A7A82"
                    value={name}
                    onChangeText={setName}
                    autoComplete="name"
                  />
                </View>

                <View className="flex-row items-center bg-workly-bg-input/50 rounded-xl px-4 py-3 border border-workly-border mt-4">
                  <Mail color="#5A7A82" size={20} />
                  <TextInput
                    className="flex-1 ml-3 text-white text-base"
                    placeholder="Email address"
                    placeholderTextColor="#5A7A82"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                  />
                </View>

                <View className="flex-row items-center bg-workly-bg-input/50 rounded-xl px-4 py-3 border border-workly-border mt-4">
                  <MapPin color="#5A7A82" size={20} />
                  <TextInput
                    className="flex-1 ml-3 text-white text-base"
                    placeholder="City"
                    placeholderTextColor="#5A7A82"
                    value={city}
                    onChangeText={setCity}
                  />
                </View>

                {role === 'client' && (
                  <View className="flex-row items-center bg-workly-bg-input/50 rounded-xl px-4 py-3 border border-workly-border mt-4">
                    <Home color="#5A7A82" size={20} />
                    <TextInput
                      className="flex-1 ml-3 text-white text-base"
                      placeholder="Neighborhood (optional)"
                      placeholderTextColor="#5A7A82"
                      value={neighborhood}
                      onChangeText={setNeighborhood}
                    />
                  </View>
                )}

                <View className="flex-row items-center bg-workly-bg-input/50 rounded-xl px-4 py-3 border border-workly-border mt-4">
                  <Lock color="#5A7A82" size={20} />
                  <TextInput
                    className="flex-1 ml-3 text-white text-base"
                    placeholder="Password"
                    placeholderTextColor="#5A7A82"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password-new"
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeOff color="#5A7A82" size={20} />
                    ) : (
                      <Eye color="#5A7A82" size={20} />
                    )}
                  </Pressable>
                </View>

                <View className="flex-row items-center bg-workly-bg-input/50 rounded-xl px-4 py-3 border border-workly-border mt-4">
                  <Lock color="#5A7A82" size={20} />
                  <TextInput
                    className="flex-1 ml-3 text-white text-base"
                    placeholder="Confirm password"
                    placeholderTextColor="#5A7A82"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                  />
                </View>

                {error ? (
                  <Text className="text-red-400 text-center mt-2">{error}</Text>
                ) : null}

                <Pressable onPress={handleRegister} disabled={isLoading} className="mt-6">
                  <LinearGradient
                    colors={role === 'professional' ? ['#4A9BAD', '#3A7A8A'] : ['#3B82F6', '#2563EB']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ borderRadius: 12, paddingVertical: 16 }}
                  >
                    <Text className="text-white text-center font-semibold text-lg">
                      {isLoading ? 'Creating account...' : 'Create Account'}
                    </Text>
                  </LinearGradient>
                </Pressable>

                <Pressable onPress={() => setStep('role')} className="mt-4">
                  <Text className="text-slate-400 text-center">
                    ← Back to role selection
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
