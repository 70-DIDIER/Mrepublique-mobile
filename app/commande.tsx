import { Ionicons } from '@expo/vector-icons';
import axios, { isAxiosError } from 'axios';
import * as Clipboard from 'expo-clipboard';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '../constants/api';
import { colors } from '../constants/Colors';
import { useCart } from '../context/CartContext';
import { getToken } from '../services/api';

const DEFAULT_COORDS = { latitude: 6.17501, longitude: 1.23041 };

export default function Commande() {
  const { cart } = useCart();
  const router = useRouter();
  const mapRef = useRef<MapView>(null);

  const [location, setLocation] = useState(DEFAULT_COORDS);
  const [selectedLocation, setSelectedLocation] = useState(DEFAULT_COORDS);
  const [adresseLivraison, setAdresseLivraison] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [locationPermission, setLocationPermission] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [mapModalVisible, setMapModalVisible] = useState(false);
  const [tempLocation, setTempLocation] = useState(DEFAULT_COORDS);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationPermission(false);
        setLocationLoading(false);
        return;
      }
      setLocationPermission(true);
      const userLocation = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
      };
      setLocation(coords);
      setSelectedLocation(coords);
      setTempLocation(coords);
      setLocationLoading(false);
    })();
  }, []);

  const total = cart.reduce((sum, item) => sum + item.prix * item.quantity, 0);

  const openMapPicker = () => {
    setTempLocation(selectedLocation);
    setMapModalVisible(true);
  };

  const confirmMapLocation = () => {
    setSelectedLocation(tempLocation);
    setMapModalVisible(false);
    setSearchQuery('');
  };

  // Recherche d'adresse via geocoding
  const searchAddress = async () => {
    if (!searchQuery.trim()) return;
    Keyboard.dismiss();
    setSearchLoading(true);
    try {
      const results = await Location.geocodeAsync(searchQuery.trim());
      if (results.length > 0) {
        const { latitude, longitude } = results[0];
        const coords = { latitude, longitude };
        setTempLocation(coords);
        mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 600);
      } else {
        Alert.alert('Introuvable', 'Aucun résultat pour cette adresse. Essayez d\'être plus précis.');
      }
    } catch {
      Alert.alert('Erreur', 'Impossible de rechercher cette adresse.');
    } finally {
      setSearchLoading(false);
    }
  };

  // Extrait les coordonnées d'une URL Google Maps (URL finale après redirection)
  const extractCoordsFromUrl = (url: string): { lat: number; lng: number } | null => {
    // Format /@lat,lng,zoom ou /@lat,lng,
    const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };

    // Format ?q=lat,lng ou &q=lat,lng
    const qMatch = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };

    // Format ?ll=lat,lng
    const llMatch = url.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (llMatch) return { lat: parseFloat(llMatch[1]), lng: parseFloat(llMatch[2]) };

    // Format /place/.../lat,lng (dans le path)
    const placeMatch = url.match(/\/(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (placeMatch) return { lat: parseFloat(placeMatch[1]), lng: parseFloat(placeMatch[2]) };

    return null;
  };

  // Coller une localisation (coordonnées, lien Google Maps classique ou lien court)
  const pasteLocation = async () => {
    const text = (await Clipboard.getStringAsync()).trim();
    if (!text) {
      Alert.alert('Presse-papiers vide', 'Copiez d\'abord une localisation ou un lien Google Maps.');
      return;
    }

    const applyCoords = (lat: number, lng: number) => {
      if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return false;
      const coords = { latitude: lat, longitude: lng };
      setTempLocation(coords);
      mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 600);
      setSearchQuery('');
      return true;
    };

    // 1. Coordonnées brutes : "6.17501, 1.23041" ou "6.17501,1.23041"
    const coordsMatch = text.match(/^(-?\d+\.\d+)[,\s]+(-?\d+\.\d+)$/);
    if (coordsMatch) {
      applyCoords(parseFloat(coordsMatch[1]), parseFloat(coordsMatch[2]));
      return;
    }

    // 2. Lien Google Maps classique (URL longue)
    if (text.includes('google.com/maps') || text.includes('maps.google')) {
      const result = extractCoordsFromUrl(text);
      if (result && applyCoords(result.lat, result.lng)) return;
    }

    // 3. Lien court : maps.app.goo.gl ou goo.gl/maps — on suit la redirection
    if (text.includes('goo.gl') || text.includes('maps.app')) {
      setSearchLoading(true);
      try {
        const response = await fetch(text, { method: 'GET' });
        const finalUrl = response.url;
        const result = extractCoordsFromUrl(finalUrl);
        if (result && applyCoords(result.lat, result.lng)) return;
        // Si pas de coords dans l'URL finale, essayer le contenu HTML
        const html = await response.text();
        const htmlResult = extractCoordsFromUrl(html);
        if (htmlResult && applyCoords(htmlResult.lat, htmlResult.lng)) return;
        Alert.alert('Introuvable', 'Impossible d\'extraire la position depuis ce lien.');
      } catch {
        Alert.alert('Erreur', 'Impossible de lire ce lien. Vérifiez votre connexion.');
      } finally {
        setSearchLoading(false);
      }
      return;
    }

    Alert.alert(
      'Format non reconnu',
      'Formats acceptés :\n• Coordonnées : 6.17501, 1.23041\n• Lien Google Maps (long ou court)\n• Lien maps.app.goo.gl'
    );
  };

  const handleConfirmCommande = async () => {
    Keyboard.dismiss();
    if (!adresseLivraison.trim()) {
      // Using inline error is handled by the disabled button state
      return;
    }

    setLoading(true);
    const apiUrl = `${API_URL}/commandes`;

    const commandData = {
      articles: cart.map(item => ({
        type: 'plat',
        id: parseInt(item.id),
        quantite: item.quantity,
      })),
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
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
        const commandeId =
          response.data.id ||
          response.data.data?.id ||
          response.data.commande?.id ||
          response.data.commande_id ||
          response.data.data?.commande_id;

        if (!commandeId) throw new Error('Aucun commande_id trouvé dans la réponse.');

        router.push({
          pathname: '/paiement',
          params: {
            commandeId: commandeId.toString(),
            latitude: selectedLocation.latitude.toString(),
            longitude: selectedLocation.longitude.toString(),
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
    } finally {
      setLoading(false);
    }
  };

  const isUsingGPS =
    selectedLocation.latitude === location.latitude &&
    selectedLocation.longitude === location.longitude;

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

          {/* Position de livraison */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="location-outline" size={20} color="#72815A" />
              <Text style={styles.cardTitle}>Position de livraison</Text>
            </View>

            {/* Mini carte aperçu */}
            <View style={styles.mapPreviewWrapper}>
              <MapView
                style={styles.mapPreview}
                region={{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                <Marker coordinate={selectedLocation} pinColor="#72815A" />
              </MapView>
              {/* Overlay tap pour ouvrir le sélecteur */}
              <TouchableOpacity style={styles.mapOverlay} onPress={openMapPicker} activeOpacity={0.85}>
                <View style={styles.mapOverlayBadge}>
                  <Ionicons name="pencil" size={14} color="#fff" />
                  <Text style={styles.mapOverlayText}>Modifier la position</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Infos coordonnées */}
            <View style={styles.coordsRow}>
              <Ionicons
                name={locationLoading ? 'time-outline' : locationPermission ? 'checkmark-circle' : 'alert-circle'}
                size={15}
                color={locationLoading ? '#aaa' : locationPermission ? '#72815A' : '#e05c5c'}
              />
              <Text style={styles.coordsText}>
                {locationLoading
                  ? 'Récupération GPS...'
                  : isUsingGPS
                  ? `Position GPS · ${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`
                  : `Position personnalisée · ${selectedLocation.latitude.toFixed(4)}, ${selectedLocation.longitude.toFixed(4)}`}
              </Text>
              {!isUsingGPS && locationPermission && (
                <TouchableOpacity onPress={() => setSelectedLocation(location)} style={styles.resetGps}>
                  <Text style={styles.resetGpsText}>GPS</Text>
                </TouchableOpacity>
              )}
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
              <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
              <Text style={styles.confirmText}>{loading ? 'En cours...' : 'Confirmer'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Modale sélecteur de carte */}
      <Modal
        visible={mapModalVisible}
        animationType="slide"
        onRequestClose={() => setMapModalVisible(false)}
      >
        <SafeAreaView edges={['top']} style={styles.modalSafe}>
          <StatusBar style="light" />
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setMapModalVisible(false)} style={styles.backButton}>
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Choisir la position</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Barre de recherche */}
          <View style={styles.searchBarWrapper}>
            <View style={styles.searchInputRow}>
              <Ionicons name="search" size={18} color="#999" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher une adresse..."
                placeholderTextColor="#bbb"
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType="search"
                onSubmitEditing={searchAddress}
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color="#ccc" />
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.searchBtn} onPress={searchAddress} disabled={searchLoading}>
                {searchLoading
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Text style={styles.searchBtnText}>OK</Text>
                }
              </TouchableOpacity>
            </View>
            {/* Bouton coller */}
            <TouchableOpacity style={styles.pasteButton} onPress={pasteLocation} activeOpacity={0.8}>
              <Ionicons name="clipboard-outline" size={16} color="#72815A" />
              <Text style={styles.pasteButtonText}>Coller une localisation</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mapHint}>
            <Ionicons name="hand-left-outline" size={16} color="#72815A" />
            <Text style={styles.mapHintText}>Déplacez le marqueur ou appuyez longtemps</Text>
          </View>

          <MapView
            ref={mapRef}
            style={styles.fullMap}
            initialRegion={{
              latitude: tempLocation.latitude,
              longitude: tempLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onLongPress={(e) => setTempLocation(e.nativeEvent.coordinate)}
          >
            <Marker
              coordinate={tempLocation}
              draggable
              onDragEnd={(e) => setTempLocation(e.nativeEvent.coordinate)}
              pinColor="#72815A"
            />
          </MapView>

          {/* Coordonnées en bas */}
          <View style={styles.mapFooter}>
            <View style={styles.mapCoordsBox}>
              <Ionicons name="location" size={16} color="#72815A" />
              <Text style={styles.mapCoordsText}>
                {tempLocation.latitude.toFixed(5)}, {tempLocation.longitude.toFixed(5)}
              </Text>
            </View>
            <TouchableOpacity style={styles.confirmMapButton} onPress={confirmMapLocation} activeOpacity={0.85}>
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={styles.confirmMapText}>Confirmer cette position</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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

  // ── Carte aperçu ─────────────────────────────────────
  mapPreviewWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 10,
    height: 150,
  },
  mapPreview: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  mapOverlayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#72815A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  mapOverlayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  coordsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coordsText: {
    fontSize: 12,
    color: '#888',
    flex: 1,
  },
  resetGps: {
    backgroundColor: '#EEF1E6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  resetGpsText: {
    fontSize: 11,
    color: '#72815A',
    fontWeight: '700',
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

  // ── Modale carte plein écran ──────────────────────────
  modalSafe: {
    flex: 1,
    backgroundColor: '#72815A',
  },
  searchBarWrapper: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
  },
  searchInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F5F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    padding: 0,
  },
  searchBtn: {
    backgroundColor: '#72815A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 8,
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EEF1E6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  pasteButtonText: {
    color: '#72815A',
    fontWeight: '600',
    fontSize: 13,
  },
  mapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  mapHintText: {
    fontSize: 12,
    color: '#aaa',
  },
  fullMap: {
    flex: 1,
  },
  mapFooter: {
    backgroundColor: '#fff',
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  mapCoordsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F4F5F0',
    padding: 10,
    borderRadius: 10,
  },
  mapCoordsText: {
    fontSize: 13,
    color: '#555',
  },
  confirmMapButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#72815A',
    height: 52,
    borderRadius: 14,
  },
  confirmMapText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
