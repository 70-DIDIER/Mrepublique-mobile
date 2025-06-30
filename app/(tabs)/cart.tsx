// (tabs)/cart.tsx
import { colors } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCart } from '../../context/CartContext';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const router = useRouter();

  // Calculer le total
  const total = cart.reduce((sum, item) => sum + (parseFloat(String(item.prix)) || 0) * item.quantity, 0);

  // Ajuster l'URL de l'image pour l'émulateur
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return 'https://via.placeholder.com/80';
    return Platform.OS === 'android' ? imageUrl.replace('127.0.0.1', '10.0.201.76') : imageUrl;
  };

  // Rediriger vers l'écran de commande
  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Erreur', 'Votre panier est vide.');
      return;
    }
    router.push('/commande');
  };

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Mes commandes</Text> */}
      {cart.length > 0 ? (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const imageUrl = getImageUrl(item.image_url);
              return (
                <View style={styles.cartItem}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.cartImage}
                    onError={(e) =>
                      console.log('Erreur chargement image pour', item.nom, ':', e.nativeEvent.error)
                    }
                  />
                  <View style={styles.cartInfo}>
                    <Text style={styles.cartName}>{item.nom}</Text>
                    <Text style={styles.cartDescription}>
                      {'description' in item ? (item as any).description || 'Variante non disponible' : 'Variante non disponible'}
                    </Text>
                    <Text style={styles.cartPrice}>
                      {parseInt(String(item.prix), 10)} FCFA
                    </Text>
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        onPress={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.id, item.quantity - 1);
                          }
                        }}
                        style={styles.quantityButton}
                      >
                        <Text style={styles.quantityText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantity}>{item.quantity}</Text>
                      <TouchableOpacity
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                        style={styles.quantityButton}
                      >
                        <Text style={styles.quantityText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => removeFromCart(item.id)} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              );
            }}
          />
          <View style={styles.footer}>
            <Text style={styles.totalText}>TOTAL: {parseInt(total.toString(), 10)} F CFA</Text>
            <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
              <Text style={styles.checkoutButtonText}>Acheter</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text style={styles.emptyMessage}>Votre panier est vide.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: colors.white },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: colors.text },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6E8D5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cartImage: { width: 80, height: 80, borderRadius: 10, marginRight: 10 },
  cartInfo: { flex: 1 },
  cartName: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 5 },
  cartDescription: { fontSize: 14, color: colors.secondary, marginBottom: 5 },
  cartPrice: { fontSize: 14, color: colors.secondary, marginBottom: 5 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  quantityButton: {
    backgroundColor: '#859163',
    borderRadius: 5,
    padding: 5,
    marginHorizontal: 5,
  },
  quantityText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  quantity: { fontSize: 16, color: colors.text, marginHorizontal: 10 },
  deleteButton: { padding: 5 },
  footer: { padding: 10, borderTopWidth: 1, borderTopColor: colors.border, marginTop: 10 },
  totalText: { fontSize: 18, fontWeight: 'bold', color: colors.text, textAlign: 'center', marginBottom: 10 },
  checkoutButton: {
    backgroundColor: '#72815A',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  checkoutButtonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  emptyMessage: { textAlign: 'center', color: colors.secondary, fontSize: 16, marginTop: 20 },
});