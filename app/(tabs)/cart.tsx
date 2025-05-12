import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const cartItems = [
  { id: '1', name: 'Ayi Moulou', price: '1000 FCFA', image: 'https://via.placeholder.com/80' },
];

export default function Cart() {
  const total = 1000;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes commandes</Text>
      <View style={styles.cartItem}>
        <Image source={{ uri: cartItems[0].image }} style={styles.cartImage} />
        <View style={styles.cartInfo}>
          <Text style={styles.cartName}>{cartItems[0].name}</Text>
          <Text style={styles.cartPrice}>{cartItems[0].price}</Text>
        </View>
      </View>
      <Text style={styles.total}>TOTAL {total} FCFA</Text>
      <TouchableOpacity style={styles.buyButton}>
        <Text style={styles.buyButtonText}>Acheter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  cartItem: { flexDirection: 'row', padding: 10, backgroundColor: '#f9f9f9', borderRadius: 10 },
  cartImage: { width: 60, height: 60, borderRadius: 10 },
  cartInfo: { marginLeft: 10, flex: 1 },
  cartName: { fontSize: 16 },
  cartPrice: { fontSize: 14, color: 'gray' },
  total: { fontSize: 18, fontWeight: 'bold', textAlign: 'right', marginVertical: 10 },
  buyButton: { backgroundColor: '#28A745', padding: 10, borderRadius: 5, alignItems: 'center' },
  buyButtonText: { color: '#fff', fontSize: 16 },
});