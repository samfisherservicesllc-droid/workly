import { Tabs } from 'expo-router';
import { Home, MessageSquare, User, Plus, Search } from 'lucide-react-native';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/lib/state/auth-store';
import { useMessagesStore } from '@/lib/state/messages-store';
import * as Haptics from 'expo-haptics';

export default function TabLayout() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const conversations = useMessagesStore((s) => s.conversations);

  const unreadCount = user
    ? conversations
        .filter((c) => c.participants.includes(user.id))
        .reduce((acc, c) => acc + c.unreadCount, 0)
    : 0;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6B8AFE',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#252932',
          borderTopColor: '#3A404D',
          height: 85,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#252932',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Feed',
          headerTitle: 'Workly',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
          headerRight: () => (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push('/create-post');
              }}
              className="mr-4 w-10 h-10 bg-workly-accent rounded-full items-center justify-center"
            >
              <Plus color="white" size={22} />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <View>
              <MessageSquare color={color} size={size} />
              {unreadCount > 0 && (
                <View className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
                  <View className="w-2 h-2 bg-white rounded-full" />
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
