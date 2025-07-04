import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useCart } from '../../context/CartContext';
// import { Keyboard, } from 'react-native';
// import { useEffect, useState } from 'react';
export default function TabLayout() {
  const { cart } = useCart();

  // Calculer le nombre total d'articles dans le panier
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
//  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // useEffect(() => {
  //   const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
  //     setKeyboardVisible(true);
  //   });
  //   const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
  //     setKeyboardVisible(false);
  //   });

  //   return () => {
  //     keyboardDidShowListener.remove();
  //     keyboardDidHideListener.remove();
  //   };
  // }, []);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: '#fff',
        tabBarActiveTintColor: colors.secondary,
        tabBarInactiveTintColor: '#72815A',
        tabBarStyle: { backgroundColor: '#ffffff',
          // display: keyboardVisible ? 'none' : 'flex',
          borderTopWidth: 0,            
          elevation: 0,                 
          shadowOpacity: 0, 
        },
        
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
          title: 'Les Plats',
          tabBarIcon: ({ color }) => <Ionicons name="list" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Panier',
          tabBarIcon: ({ color }) => <Ionicons name="cart" size={24} color={color} />,
          tabBarBadge: cartItemCount > 0 ? cartItemCount : undefined, // Badge dynamique
          tabBarBadgeStyle: { backgroundColor: colors.secondary, color: '#fff' },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
          // tabBarBadge: 2,
        }}
      />
    </Tabs>
  );
}