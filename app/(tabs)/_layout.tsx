import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { colors } from '@/constants/colors';
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#fff',
        tabBarActiveTintColor: colors.secondary, 
        tabBarInactiveTintColor: '#ffffff',
        tabBarStyle: { backgroundColor: '#72815A' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <Ionicons name="list" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Panier',
          tabBarIcon: ({ color }) => <Ionicons name="cart" size={24} color={color} />,
          tabBarBadge: '3', // Exemple de badge (à dynamiser plus tard)
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}