// app/commande.tsx
import axios, { isAxiosError } from 'axios';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/colors';
import { useCart } from '../context/CartContext';

export default function Commande() {
  const { cart } = useCart();
  const router = useRouter();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [adresseLivraison, setAdresseLivraison] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [locationPermission, setLocationPermission] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erreur', 'Permission de localisation refusée.');
        setLocationPermission(false);
        return;
      }
      setLocationPermission(true);
      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      });
    })();
  }, []);

  const handleConfirmCommande = async () => {
    if (!adresseLivraison) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse de livraison.');
      return;
    }

    setLoading(true);
    const apiUrl = Platform.OS === 'android' ? 'http://10.0.201.76:8000/api/commandes' : 'http://127.0.0.1:8000/api/commandes';

    const commandData = {
      articles: cart.map(item => ({
        type: 'plat',
        id: parseInt(item.id),
        quantite: item.quantity,
      })),
      latitude: location?.latitude || 6.17501,
      longitude: location?.longitude || 1.23041,
      adresse_livraison: adresseLivraison,
      commentaire: commentaire,
    };

    try {
      const response = await axios.post(apiUrl, commandData, {
        headers: {
          Authorization: 'Bearer 22|MJgfDYeYXdyt24LxF4QAq7LhcAWBfH0MNrp5ss2t800cbbcf', // Remplace <token> par ton vrai token
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });
      console.log('Réponse complète:', response.data); // Pour débogage
      if (response.status === 201 || response.status === 200) {
        let commandeId;
        // Vérifie plusieurs structures possibles
        if (response.data.id) {
          commandeId = response.data.id;
        } else if (response.data.data?.id) {
          commandeId = response.data.data.id;
        } else if (response.data.commande?.id) {
          commandeId = response.data.commande.id;
        } else if (response.data.commande_id) {
          commandeId = response.data.commande_id;
        } else if (response.data.data?.commande_id) {
          commandeId = response.data.data.commande_id;
        } else {
          throw new Error('Aucun commande_id trouvé dans la réponse. Vérifie la structure de la réponse API.');
        }
        console.log('Commande ID récupéré:', commandeId);
        router.push({
          pathname: '/paiement',
          params: {
            commandeId: commandeId.toString(),
            latitude: location?.latitude?.toString() || '6.17501',
            longitude: location?.longitude?.toString() || '1.23041',
            adresseLivraison,
            commentaire,
          },
        });
      } else {
        throw new Error('Réponse inattendue de l\'API');
      }
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('Erreur détaillée:', error.response?.data || error.message);
      } else {
        console.error('Erreur détaillée:', (error as Error).message);
      }
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création de la commande.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Finaliser votre commande</Text>
      <View style={styles.section}>
        <Text style={styles.label}>Localisation</Text>
        {locationPermission ? (
          location ? (
            <Text style={styles.infoText}>
              Latitude: {location.latitude.toFixed(5)}, Longitude: {location.longitude.toFixed(5)}
            </Text>
          ) : (
            <Text style={styles.infoText}>Récupération de la localisation...</Text>
          )
        ) : (
          <Text style={styles.errorText}>Localisation non autorisée</Text>
        )}
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Adresse de livraison</Text>
        <TextInput
          style={styles.input}
          placeholder="Entrez votre adresse de livraison"
          placeholderTextColor="#888"
          value={adresseLivraison}
          onChangeText={setAdresseLivraison}
        />
      </View>
      <View style={styles.section}>
        <Text style={styles.label}>Commentaire ou personnalisation</Text>
        <TextInput
          style={[styles.input, styles.commentInput]}
          placeholder="Ex: Moins de sel, plus de piment..."
          placeholderTextColor="#888"
          value={commentaire}
          onChangeText={setCommentaire}
          multiline
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirmCommande}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'En cours...' : 'Confirmer la commande'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.push('/(tabs)/cart')}
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
  commentInput: { height: 80, textAlignVertical: 'top' },
  infoText: { fontSize: 14, color: colors.secondary },
  errorText: { fontSize: 14, color: 'red' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  confirmButton: { backgroundColor: '#72815A', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, flex: 1, alignItems: 'center', marginRight: 10 },
  cancelButton: { backgroundColor: '#859163', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, flex: 1, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '500' },
});