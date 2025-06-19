import axios, { isAxiosError } from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/colors';
import { useCart } from '../context/CartContext';
import { getToken } from '../services/api';

export default function Paiement() {
  const { cart, removeFromCart } = useCart();
  const router = useRouter();
  // Récupération des paramètres passés (commandeId, latitude et longitude du client)
  const { commandeId, latitude, longitude } = useLocalSearchParams();
  const [paymentMethod, setPaymentMethod] = useState('flooz');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  // Coordonnées du restaurant (fixes)
  const lat_restaurant = 6.184575120133669;
  const lon_restaurant = 1.2069011861319983;

  // Conversion des paramètres en Numbers (avec valeurs par défaut si manquants)
  const latCustomer = Number(latitude) || 6.17501;
  const lonCustomer = Number(longitude) || 1.23041;

  // Fonction pour calculer la distance entre deux points (en km) avec la formule de Haversine
  const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // Rayon de la Terre en km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Calcul du frais de livraison (le km vaut 100 F CFA)
  const distanceKm = haversineDistance(lat_restaurant, lon_restaurant, latCustomer, lonCustomer);
  const deliveryFee = Math.ceil(distanceKm * 200);

  // Calcul du total des articles
  const totalArticles = cart.reduce((total, item) => total + (Number(item.prix) * item.quantity), 0);
  // Calcul du total général = total des articles + frais de livraison
  const totalGeneral = totalArticles + deliveryFee;

  const handleConfirmPayment = async () => {
    if (!phoneNumber || phoneNumber.length < 8) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide.');
      return;
    }

    setLoading(true);
    const API_IP = '192.168.21.81';
    const apiUrl =
      Platform.OS === 'android' || Platform.OS === 'ios'
        ? `http://${API_IP}:8000/api/paiements`
        : 'http://127.0.0.1:8000/api/paiements';

    const token = await getToken();
    const paymentData = {
      commande_id: parseInt(commandeId as string),
      methode: paymentMethod,
      telephone: phoneNumber,
    };

    try {
      const response = await axios.post(apiUrl, paymentData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      if (response.status === 200 || response.status === 201) {
        console.log('Paiement démarré avec succès:', response.data);
        Alert.alert('Succès', 'Paiement démarré avec succès !', [
          { text: 'OK', onPress: () => router.push('/(tabs)/cart') },
        ]);
        cart.forEach(item => removeFromCart(item.id));
      } else {
        throw new Error("Réponse inattendue de l'API");
      }
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('Erreur détaillée:', error.response?.data || error.message);
      } else {
        console.error('Erreur détaillée:', (error as Error).message || error);
      }
      Alert.alert('Erreur', 'Une erreur est survenue lors du démarrage du paiement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choisir le mode de paiement</Text>
      <View style={styles.section}>
        <Text style={styles.label}>Mode de paiement</Text>
        <View style={styles.radioContainer}>
          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => setPaymentMethod('flooz')}
          >
            <View style={[styles.radioOuter, paymentMethod === 'flooz' && styles.radioSelected]}>
              {paymentMethod === 'flooz' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>Flooz</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioButton}
            onPress={() => setPaymentMethod('tmoney')}
          >
            <View style={[styles.radioOuter, paymentMethod === 'tmoney' && styles.radioSelected]}>
              {paymentMethod === 'tmoney' && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.radioLabel}>Tmoney</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Numéro de téléphone</Text>
        <TextInput
          style={styles.input}
          placeholder="Entrez votre numéro (ex: 90123456)"
          placeholderTextColor="#888"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
        />
      </View>
      <Text style={styles.title}>Résumé de la commande</Text>
      <View style={styles.section}>
        <View style={styles.orderSummaryContainer}>
          {cart.length > 0 ? (
            <>
              {cart.map((item) => (
                <View key={item.id} style={styles.orderSummaryItem}>
                  <Text style={styles.itemName}>{item.nom}</Text>
                  <Text style={styles.itemDetails}>
                    {item.quantity} x {Number(item.prix).toFixed(2)} FCFA
                  </Text>
                </View>
              ))}
              {/* Frais de livraison */}
              <View style={styles.orderSummaryItem}>
                <Text style={styles.itemName}>Frais de livraison</Text>
                <Text style={styles.itemDetails}>{deliveryFee} FCFA</Text>
              </View>
              {/* Total général */}
              <View style={styles.orderSummaryItem}>
                <Text style={[styles.itemName, { fontWeight: '700' }]}>Total Général</Text>
                <Text style={[styles.itemDetails, { fontWeight: '700' }]}>{totalGeneral.toFixed(2)} FCFA</Text>
              </View>
            </>
          ) : (
            <Text>Votre panier est vide.</Text>
          )}
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmPayment}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'En cours...' : 'Confirmer le paiement'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.push('/commande')}
        >
          <Text style={styles.buttonText}>Annuler</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: colors.white, marginTop: 20 },
  title: { fontSize: 22, fontWeight: '600', textAlign: 'center', marginBottom: 20, color: colors.primary },
  section: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '500', color: colors.text, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: colors.primary, borderRadius: 8, padding: 12, color: colors.text, backgroundColor: '#f5f5f5' },
  orderSummaryContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, backgroundColor: '#fafafa', marginBottom: 20 },
  orderSummaryItem: { borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 8, flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { fontSize: 16, fontWeight: '500', color: colors.text },
  itemDetails: { fontSize: 16, color: colors.text },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  confirmButton: { backgroundColor: '#72815A', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, flex: 1, alignItems: 'center', marginRight: 10 },
  cancelButton: { backgroundColor: '#859163', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, flex: 1, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  radioContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  radioButton: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  radioOuter: { width: 24, height: 24, borderWidth: 2, borderColor: colors.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  radioInner: { width: 12, height: 12, backgroundColor: colors.primary, borderRadius: 6 },
  radioLabel: { marginLeft: 8, fontSize: 16, color: colors.text },
  radioSelected: { borderColor: colors.primary },
});