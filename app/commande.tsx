import { Ionicons } from '@expo/vector-icons';
import axios, { isAxiosError } from 'axios';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/Colors';
import { useCart } from '../context/CartContext';
import { getToken } from '../services/api';

export default function Commande() {
  const { cart } = useCart();
  const router = useRouter();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [adresseLivraison, setAdresseLivraison] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [locationPermission, setLocationPermission] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLocationLoading(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erreur', 'Permission de localisation refusée.');
        setLocationPermission(false);
        setLocationLoading(false);
        return;
      }
      setLocationPermission(true);
      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      });
      setLocationLoading(false);
    })();
  }, []);

  const total = cart.reduce((sum, item) => sum + item.prix * item.quantity, 0);

  const handleConfirmCommande = async () => {
    Keyboard.dismiss();
    if (!adresseLivraison.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse de livraison.');
      return;
    }

    setLoading(true);
    const apiUrl = `https://apirestaurant.mrepublique.com/api/commandes`;

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

    const token = await getToken();
    try {
      const response = await axios.post(apiUrl, commandData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (response.status === 201 || response.status === 200) {
        let commandeId =
          response.data.id ||
          response.data.data?.id ||
          response.data.commande?.id ||
          response.data.commande_id ||
          response.data.data?.commande_id;

        if (!commandeId) {
          throw new Error('Aucun commande_id trouvé dans la réponse.');
        }

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
        throw new Error("Réponse inattendue de l'API");
      }
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('Erreur:', error.response?.data || error.message);
      } else {
        console.error('Erreur:', (error as Error).message);
      }
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création de la commande.');
    } finally {
      setLoading(false);
    }
  };

  const locationStatus = () => {
    if (!locationPermission) return { icon: 'close-circle', color: '#e05c5c', text: 'Localisation non autorisée' };
    if (locationLoading) return { icon: 'time-outline', color: '#aaa', text: 'Récupération en cours...' };
    if (location) return {
      icon: 'checkmark-circle',
      color: '#72815A',
      text: `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`,
    };
    return { icon: 'alert-circle', color: '#e05c5c', text: 'Impossible de récupérer la position' };
  };

  const status = locationStatus();

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Finaliser la commande</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Résumé commande */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="receipt-outline" size={20} color="#72815A" />
              <Text style={styles.cardTitle}>Résumé de la commande</Text>
            </View>
            {cart.map((item) => (
              <View key={item.id} style={styles.orderRow}>
                <View style={styles.orderLeft}>
                  <View style={styles.qtyBadge}>
                    <Text style={styles.qtyText}>{item.quantity}</Text>
                  </View>
                  <Text style={styles.orderName} numberOfLines={1}>{item.nom}</Text>
                </View>
                <Text style={styles.orderPrice}>{(item.prix * item.quantity).toLocaleString()} F</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>{total.toLocaleString()} FCFA</Text>
            </View>
          </View>

          {/* Localisation */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="location-outline" size={20} color="#72815A" />
              <Text style={styles.cardTitle}>Votre position</Text>
            </View>
            <View style={styles.locationRow}>
              <Ionicons name={status.icon as any} size={18} color={status.color} />
              <Text style={[styles.locationText, { color: status.color }]}>{status.text}</Text>
            </View>
          </View>

          {/* Adresse */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="home-outline" size={20} color="#72815A" />
              <Text style={styles.cardTitle}>Adresse de livraison</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ex: Quartier Agbalepedogan, rue 12..."
              placeholderTextColor="#bbb"
              value={adresseLivraison}
              onChangeText={setAdresseLivraison}
              returnKeyType="next"
            />
          </View>

          {/* Commentaire */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="chatbubble-outline" size={20} color="#72815A" />
              <Text style={styles.cardTitle}>Instructions spéciales</Text>
              <Text style={styles.optionalTag}>Optionnel</Text>
            </View>
            <TextInput
              style={[styles.input, styles.commentInput]}
              placeholder="Ex: Moins de sel, sans oignon, sonner à l'arrivée..."
              placeholderTextColor="#bbb"
              value={commentaire}
              onChangeText={setCommentaire}
              multiline
              textAlignVertical="top"
              returnKeyType="done"
              blurOnSubmit
            />
          </View>

          {/* Boutons */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmButton, (!adresseLivraison.trim() || loading) && styles.confirmDisabled]}
              onPress={handleConfirmCommande}
              disabled={!adresseLivraison.trim() || loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <Text style={styles.confirmText}>En cours...</Text>
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                  <Text style={styles.confirmText}>Confirmer</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#72815A',
  },

  // ── Header ───────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#72815A',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginHorizontal: 8,
  },
  headerSpacer: { width: 38 },

  // ── Scroll ───────────────────────────────────────────
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#F4F5F0',
    padding: 16,
    paddingBottom: 32,
  },

  // ── Card ─────────────────────────────────────────────
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  optionalTag: {
    fontSize: 11,
    color: '#aaa',
    fontStyle: 'italic',
  },

  // ── Résumé ───────────────────────────────────────────
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  qtyBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EEF1E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#72815A',
  },
  orderName: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  orderPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#72815A',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  totalAmount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#72815A',
  },

  // ── Localisation ─────────────────────────────────────
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAF6',
    padding: 12,
    borderRadius: 10,
  },
  locationText: {
    fontSize: 13,
    flex: 1,
  },

  // ── Inputs ───────────────────────────────────────────
  input: {
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    color: colors.text,
    backgroundColor: '#FAFAFA',
    fontSize: 15,
    minHeight: 50,
  },
  commentInput: {
    minHeight: 90,
    paddingTop: 12,
  },

  // ── Boutons ──────────────────────────────────────────
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  cancelText: {
    color: '#888',
    fontSize: 15,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 2,
    height: 52,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    backgroundColor: '#72815A',
  },
  confirmDisabled: {
    backgroundColor: '#b5c0a4',
  },
  confirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
