// app/paiement.tsx
import axios, { isAxiosError } from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/colors';
import { useCart } from '../context/CartContext';

export default function Paiement() {
  const { cart, removeFromCart } = useCart();
  const router = useRouter();
  const { commandeId } = useLocalSearchParams();
  const [paymentMethod, setPaymentMethod] = useState('flooz');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirmPayment = async () => {
    if (!phoneNumber || phoneNumber.length < 8) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide.');
      return;
    }

    setLoading(true);
    const API_IP = '192.168.99.178';
    const apiUrl =
      Platform.OS === 'android' || Platform.OS === 'ios'
        ? `http://${API_IP}:8000/api/paiements`
        : 'http://127.0.0.1:8000/api/paiements';

    const paymentData = {
      commande_id: parseInt(commandeId as string),
      methode: paymentMethod,
      telephone: phoneNumber,
    };

    try {
      const response = await axios.post(apiUrl, paymentData, {
        headers: {
          Authorization:
            'Bearer 22|MJgfDYeYXdyt24LxF4QAq7LhcAWBfH0MNrp5ss2t800cbbcf',
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
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: colors.text },
  section: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: 'bold', color: colors.text, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#859163', borderRadius: 5, padding: 10, color: colors.text, backgroundColor: '#f5f5f5' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  confirmButton: { backgroundColor: '#72815A', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, flex: 1, alignItems: 'center', marginRight: 10 },
  cancelButton: { backgroundColor: '#859163', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, flex: 1, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
  radioContainer: { flexDirection: 'row', alignItems: 'center' },
  radioButton: { flexDirection: 'row', alignItems: 'center', marginRight: 20 },
  radioOuter: { width: 24, height: 24, borderWidth: 2, borderColor: colors.primary, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  radioInner: { width: 12, height: 12, backgroundColor: colors.primary, borderRadius: 6 },
  radioLabel: { marginLeft: 8, fontSize: 16, color: colors.text },
  radioSelected: { borderColor: colors.primary },
});