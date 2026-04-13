import { Ionicons } from '@expo/vector-icons';
import axios, { isAxiosError } from 'axios';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
  Image,
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

const PAYMENT_METHODS = [
  {
    id: 'flooz',
    label: 'Flooz',
    subtitle: 'Moov Africa',
    logo: require('../assets/images/moov_africa.png'),
    color: '#0067B1',
  },
  {
    id: 'tmoney',
    label: 'Mixx by Yas',
    subtitle: 'Togocom',
    logo: require('../assets/images/mixx_by_yas.png'),
    color: '#E2001A',
  },
];

const LAT_RESTAURANT = 6.184575120133669;
const LON_RESTAURANT = 1.2069011861319983;

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Paiement() {
  const { cart, removeFromCart } = useCart();
  const router = useRouter();
  const { commandeId, latitude, longitude } = useLocalSearchParams();

  const [paymentMethod, setPaymentMethod] = useState('flooz');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const latCustomer = Number(latitude) || 6.17501;
  const lonCustomer = Number(longitude) || 1.23041;
  const distanceKm = haversine(LAT_RESTAURANT, LON_RESTAURANT, latCustomer, lonCustomer);
  const deliveryFee = Math.ceil(distanceKm * 200);
  const totalArticles = cart.reduce((sum, item) => sum + Number(item.prix) * item.quantity, 0);
  const totalGeneral = totalArticles + deliveryFee;

  const handleConfirmPayment = async () => {
    Keyboard.dismiss();
    if (!phoneNumber || phoneNumber.length < 8) return;

    setLoading(true);
    const token = await getToken();
    try {
      const response = await axios.post(
        'https://apirestaurant.mrepublique.com/api/paiements',
        {
          commande_id: parseInt(commandeId as string),
          methode: paymentMethod,
          telephone: phoneNumber,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        cart.forEach(item => removeFromCart(item.id));
        Alert.alert(
          'Paiement initié',
          'Votre demande de paiement a été envoyée. Veuillez confirmer sur votre téléphone.',
          [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
        );
      } else {
        throw new Error("Réponse inattendue de l'API");
      }
    } catch (error) {
      if (isAxiosError(error)) {
        console.error('Erreur paiement:', error.response?.data || error.message);
        const msg = error.response?.data?.message || 'Une erreur est survenue lors du paiement.';
        Alert.alert('Échec du paiement', msg);
      } else {
        Alert.alert('Erreur', (error as Error).message || 'Une erreur est survenue.');
      }
    } finally {
      setLoading(false);
    }
  };

  const canConfirm = phoneNumber.length >= 8 && !loading;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paiement</Text>
        <View style={styles.headerSpacer} />
      </View>

      <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: '#F4F5F0' }}>
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

            {/* Récapitulatif montant */}
            <View style={styles.amountCard}>
              <Text style={styles.amountLabel}>Montant total</Text>
              <Text style={styles.amountValue}>{totalGeneral.toLocaleString()} <Text style={styles.amountCurrency}>FCFA</Text></Text>
              <View style={styles.amountRow}>
                <View style={styles.amountPill}>
                  <Ionicons name="bag-outline" size={13} color="#72815A" />
                  <Text style={styles.amountPillText}>Articles · {totalArticles.toLocaleString()} F</Text>
                </View>
                <View style={styles.amountPill}>
                  <Ionicons name="bicycle-outline" size={13} color="#72815A" />
                  <Text style={styles.amountPillText}>Livraison · {deliveryFee.toLocaleString()} F</Text>
                </View>
              </View>
            </View>

            {/* Méthode de paiement */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="card-outline" size={20} color="#72815A" />
                <Text style={styles.cardTitle}>Mode de paiement</Text>
              </View>
              <View style={styles.methodsRow}>
                {PAYMENT_METHODS.map((method) => {
                  const selected = paymentMethod === method.id;
                  return (
                    <TouchableOpacity
                      key={method.id}
                      style={[styles.methodCard, selected && styles.methodCardSelected]}
                      onPress={() => setPaymentMethod(method.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.methodIconWrap}>
                        <Image source={method.logo} style={styles.methodLogo} resizeMode="contain" />
                      </View>
                      <Text style={[styles.methodLabel, selected && styles.methodLabelSelected]}>
                        {method.label}
                      </Text>
                      <Text style={styles.methodSub}>{method.subtitle}</Text>
                      {selected && (
                        <View style={styles.methodCheck}>
                          <Ionicons name="checkmark-circle" size={18} color="#72815A" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Numéro de téléphone */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="call-outline" size={20} color="#72815A" />
                <Text style={styles.cardTitle}>Numéro à débiter</Text>
              </View>
              <View style={styles.phoneInputWrapper}>
                <View style={styles.phonePrefix}>
                  <Text style={styles.phonePrefixText}>+228</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="90 12 34 56"
                  placeholderTextColor="#ccc"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  maxLength={10}
                  returnKeyType="done"
                />
              </View>
              <Text style={styles.phoneHint}>
                Numéro {paymentMethod === 'flooz' ? 'Moov Africa (Flooz)' : 'Togocom (Mixx by Yas)'} à débiter
              </Text>
            </View>

            {/* Détail commande */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="receipt-outline" size={20} color="#72815A" />
                <Text style={styles.cardTitle}>Détail de la commande</Text>
              </View>
              {cart.map((item) => (
                <View key={item.id} style={styles.lineRow}>
                  <View style={styles.lineLeft}>
                    <View style={styles.qtyBadge}>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                    </View>
                    <Text style={styles.lineName} numberOfLines={1}>{item.nom}</Text>
                  </View>
                  <Text style={styles.lineAmount}>{(Number(item.prix) * item.quantity).toLocaleString()} F</Text>
                </View>
              ))}
              <View style={styles.divider} />
              <View style={styles.lineRow}>
                <View style={styles.lineLeft}>
                  <Ionicons name="bicycle-outline" size={16} color="#aaa" />
                  <Text style={[styles.lineName, { color: '#999' }]}>Frais de livraison</Text>
                </View>
                <Text style={[styles.lineAmount, { color: '#aaa' }]}>{deliveryFee.toLocaleString()} F</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.lineRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{totalGeneral.toLocaleString()} FCFA</Text>
              </View>
            </View>

            {/* Bouton confirmer */}
            <TouchableOpacity
              style={[styles.confirmButton, !canConfirm && styles.confirmDisabled]}
              onPress={handleConfirmPayment}
              disabled={!canConfirm}
              activeOpacity={0.85}
            >
              {loading ? (
                <Text style={styles.confirmText}>Traitement en cours...</Text>
              ) : (
                <>
                  <Ionicons name="lock-closed-outline" size={17} color="#fff" />
                  <Text style={styles.confirmText}>Payer {totalGeneral.toLocaleString()} FCFA</Text>
                </>
              )}
            </TouchableOpacity>

            <Text style={styles.secureNote}>
              <Ionicons name="shield-checkmark-outline" size={12} color="#aaa" /> Paiement sécurisé
            </Text>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#72815A',
  },

  // ── Header ────────────────────────────────────────────
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

  // ── Scroll ────────────────────────────────────────────
  scrollContent: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 32,
  },

  // ── Montant hero ──────────────────────────────────────
  amountCard: {
    backgroundColor: '#72815A',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 14,
  },
  amountLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amountValue: {
    color: '#fff',
    fontSize: 38,
    fontWeight: '800',
    marginBottom: 14,
  },
  amountCurrency: {
    fontSize: 20,
    fontWeight: '500',
  },
  amountRow: {
    flexDirection: 'row',
    gap: 10,
  },
  amountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  amountPillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },

  // ── Card ──────────────────────────────────────────────
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },

  // ── Méthodes de paiement ──────────────────────────────
  methodsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  methodCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#eee',
    padding: 14,
    alignItems: 'center',
    gap: 6,
    position: 'relative',
    backgroundColor: '#fafafa',
  },
  methodCardSelected: {
    borderColor: '#72815A',
    backgroundColor: '#F4F7EE',
  },
  methodIconWrap: {
    width: 72,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  methodLogo: {
    width: 72,
    height: 40,
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555',
  },
  methodLabelSelected: {
    color: '#72815A',
  },
  methodSub: {
    fontSize: 11,
    color: '#bbb',
  },
  methodCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
  },

  // ── Téléphone ──────────────────────────────────────────
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FAFAFA',
  },
  phonePrefix: {
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    borderRightWidth: 1.5,
    borderRightColor: '#e8e8e8',
    backgroundColor: '#F4F5F0',
  },
  phonePrefixText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    fontSize: 16,
    color: colors.text,
    letterSpacing: 1,
  },
  phoneHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#bbb',
  },

  // ── Détail lignes ──────────────────────────────────────
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  lineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  qtyBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EEF1E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#72815A',
  },
  lineName: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  lineAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#72815A',
  },
  divider: {
    height: 1,
    backgroundColor: '#f2f2f2',
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#72815A',
  },

  // ── Bouton confirmer ──────────────────────────────────
  confirmButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#72815A',
    height: 56,
    borderRadius: 16,
    marginBottom: 12,
  },
  confirmDisabled: {
    backgroundColor: '#b5c0a4',
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secureNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#bbb',
  },
});
