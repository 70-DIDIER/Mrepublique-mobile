import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { setStatusBarStyle, StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/Colors';
import { useCart } from '../context/CartContext';
import { getDishes, getDishesByCategory } from '../services/api';

const { width } = Dimensions.get('window');

export default function Show() {
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDish, setSelectedDish] = useState<string | null>(null);
  const { addToCart } = useCart();
  const router = useRouter();
  const { category } = useLocalSearchParams();

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
    }, [])
  );

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setLoading(true);
        let response;
        
        if (category) {
          console.log('Récupération des plats pour la catégorie:', category);
          response = await getDishesByCategory(category as string);
        } else {
          console.log('Récupération de tous les plats');
          response = await getDishes();
        }

        console.log('Réponse brute de l\'API:', response);
        const data = response.data || response;
        console.log('Données traitées:', data);
        setDishes(Array.isArray(data) ? data : data.data || []);
        setError(null);
      } catch (err) {
        const axiosError = err as any;
        console.error('Erreur détaillée:', {
          message: axiosError.message,
          code: axiosError.code,
          response: axiosError.response?.data,
          status: axiosError.response?.status,
        });
        setError('Impossible de récupérer les plats. Vérifiez l\'URL ou le serveur.');
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, [category]);

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return 'https://via.placeholder.com/200';
    return Platform.OS === 'android' ? imageUrl.replace('127.0.0.1', '10.0.2.2') : imageUrl;
  };

  const handleOrder = (dish: any) => {
    addToCart({
      id: dish.id.toString(),
      nom: dish.nom || 'Nom inconnu',
      prix: parseFloat(dish.prix) || 0,
      image_url: dish.image_url || '',
      quantity: 1,
    });
    // Afficher la modale avec le nom du plat
    setSelectedDish(dish.nom);
    setModalVisible(true);
    console.log('Plat ajouté au panier:', dish.nom);
  };

  const goToCart = () => {
    setModalVisible(false);
    router.push('/(tabs)/cart'); 
  };

  const filteredDishes = dishes.filter(
    (dish) =>
      dish.nom?.toLowerCase().includes(search.toLowerCase()) ||
      dish.description?.toLowerCase().includes(search.toLowerCase())
  );

  const headerTitle = category
    ? `${String(category).charAt(0).toUpperCase()}${String(category).slice(1)}`
    : 'Nos Plats';

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{headerTitle}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.container}>
        {loading ? (
          <View style={styles.centered}>
            <Text style={styles.message}>Chargement...</Text>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Ionicons name="alert-circle-outline" size={48} color="#ccc" />
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : (
          <FlatList
            data={filteredDishes}
            keyExtractor={(item) => item.id?.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.searchWrapper}>
                <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchBar}
                  placeholder="Rechercher un plat..."
                  placeholderTextColor="#999"
                  value={search}
                  onChangeText={setSearch}
                />
                {search.length > 0 && (
                  <TouchableOpacity onPress={() => setSearch('')}>
                    <Ionicons name="close-circle" size={18} color="#aaa" />
                  </TouchableOpacity>
                )}
              </View>
            }
            ListEmptyComponent={
              <View style={styles.centered}>
                <Ionicons name="restaurant-outline" size={52} color="#ccc" />
                <Text style={styles.message}>Aucun plat trouvé.</Text>
              </View>
            }
            renderItem={({ item }) => {
              const imageUrl = getImageUrl(item.image_url);
              return (
                <View style={styles.dishCard}>
                  {/* Image pleine largeur */}
                  <View style={styles.imageWrapper}>
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.dishImage}
                      resizeMode="cover"
                    />
                    {/* Badge catégorie */}
                    {item.categorie && (
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>
                          {item.categorie}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Contenu */}
                  <View style={styles.dishInfo}>
                    {/* Ligne nom + prix */}
                    <View style={styles.nameRow}>
                      <Text style={styles.dishName} numberOfLines={1}>
                        {item.nom || 'Nom inconnu'}
                      </Text>
                      <View style={styles.priceBadge}>
                        <Text style={styles.priceText}>
                          {parseInt(item.prix, 10)} F
                        </Text>
                      </View>
                    </View>

                    {/* Description */}
                    <Text style={styles.dishDescription} numberOfLines={2}>
                      {item.description || 'Aucune description disponible'}
                    </Text>

                    {/* Ligne rating + bouton */}
                    <View style={styles.bottomRow}>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color="#F4A623" />
                        <Text style={styles.ratingText}>4.5</Text>
                        <Text style={styles.ratingCount}>(125)</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.orderButton}
                        onPress={() => handleOrder(item)}
                        activeOpacity={0.85}
                      >
                        <Ionicons name="cart-outline" size={15} color="#fff" />
                        <Text style={styles.orderButtonText}>Commander</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>

      {/* Modale pour l'alerte */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle" size={40} color="#859163" style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Succès</Text>
            <Text style={styles.modalMessage}>
              {selectedDish ? `${selectedDish} ajouté au panier !` : 'Plat ajouté au panier !'}
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.viewCartButton]}
                onPress={goToCart}
              >
                <Text style={styles.modalButtonText}>Voir le panier</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.closeButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#72815A',
  },

  // ── Header ──────────────────────────────────────────
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

  // ── Container ────────────────────────────────────────
  container: {
    flex: 1,
    backgroundColor: '#F4F5F0',
  },
  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 24,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 10,
  },
  message: {
    textAlign: 'center',
    color: '#aaa',
    fontSize: 15,
    marginTop: 8,
  },
  error: {
    textAlign: 'center',
    color: '#e05c5c',
    fontSize: 14,
    marginTop: 8,
    paddingHorizontal: 20,
  },

  // ── Barre de recherche ───────────────────────────────
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: { marginRight: 8 },
  searchBar: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    padding: 0,
  },

  // ── Carte plat ───────────────────────────────────────
  dishCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 4,
  },
  imageWrapper: {
    position: 'relative',
  },
  dishImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#e8e8e8',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(114,129,90,0.88)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dishInfo: {
    padding: 14,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dishName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 10,
  },
  priceBadge: {
    backgroundColor: '#EEF1E6',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#72815A',
  },
  dishDescription: {
    fontSize: 13,
    color: '#888',
    lineHeight: 19,
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 3,
  },
  ratingCount: {
    fontSize: 12,
    color: '#aaa',
  },
  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#72815A',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 24,
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Modale ───────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    width: width * 0.85,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalIcon: { marginBottom: 12 },
  modalTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  viewCartButton: { backgroundColor: '#72815A' },
  closeButton: { backgroundColor: '#859163' },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});