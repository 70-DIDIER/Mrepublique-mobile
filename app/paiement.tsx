// app/paiement.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors } from '../constants/colors';
import { useCart } from '../context/CartContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios, { isAxiosError } from 'axios';

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
    const apiUrl = Platform.OS === 'android' ? 'http://10.0.201.76:8000/api/paiements' : 'http://127.0.0.1:8000/api/paiements';

    const paymentData = {
      commande_id: parseInt(commandeId as string),
      methode: paymentMethod,
      telephone: phoneNumber,
    };

    try {
      const response = await axios.post(apiUrl, paymentData, {
        headers: {
          Authorization: 'Bearer 22|MJgfDYeYXdyt24LxF4QAq7LhcAWBfH0MNrp5ss2t800cbbcf',
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
        throw new Error('Réponse inattendue de l\'API');
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
        <Picker
          selectedValue={paymentMethod}
          onValueChange={(itemValue: string, itemIndex: number) => setPaymentMethod(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Flooz" value="flooz" />
          <Picker.Item label="Tmoney" value="tmoney" />
        </Picker>
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
  picker: { height: 50, borderWidth: 1, borderColor: '#859163', borderRadius: 5 },
  input: { borderWidth: 1, borderColor: '#859163', borderRadius: 5, padding: 10, color: colors.text, backgroundColor: '#f5f5f5' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  confirmButton: { backgroundColor: '#72815A', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, flex: 1, alignItems: 'center', marginRight: 10 },
  cancelButton: { backgroundColor: '#859163', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, flex: 1, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
});