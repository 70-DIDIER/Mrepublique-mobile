// import { Stack } from 'expo-router';
// import { CartProvider } from '../context/CartContext';
// export default function RootLayout() {
//   return (
//     <CartProvider>
//       <Stack screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//         <Stack.Screen name="show" options={{ headerShown: false }} />
//         <Stack.Screen name="commande" options={{ headerShown: false }} />
//         <Stack.Screen name="paiement" options={{ headerShown: false }} />
//         <Stack.Screen name="+not-found" />
//       </Stack>
//     </CartProvider>
//   );
// }



import { AuthContext, AuthProvider } from "@/context/AuthContext";
import { Stack } from "expo-router";
import React, { useContext } from "react";
import { CartProvider } from '../context/CartContext';
function AuthenticatedStack() {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    // Vous pouvez renvoyer ici un écran de chargement
    return null;
  }

  return (
    <CartProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {token ? (
          <>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="show" options={{ headerShown: false }} />
            <Stack.Screen name="commande" options={{ headerShown: false }} />
            <Stack.Screen name="paiement" options={{ headerShown: false }} />
          </>
        ) : (
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
    </CartProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthenticatedStack />
    </AuthProvider>
  );
}
