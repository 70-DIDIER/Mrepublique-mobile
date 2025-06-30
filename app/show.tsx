import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Image, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/Colors';
import { useCart } from '../context/CartContext';
import { getDishes, getDishesByCategory } from '../services/api';

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

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Rechercher un plat..."
        placeholderTextColor="#888"
        value={search}
        onChangeText={setSearch}
      />
      <Text style={styles.title}>Liste des Plats de MRepublique</Text>
      {loading ? (
        <Text style={styles.message}>Chargement...</Text>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : filteredDishes.length > 0 ? (
        <FlatList
          data={filteredDishes}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={({ item }) => {
            const imageUrl = getImageUrl(item.image_url);
            return (
              <View style={styles.dishCard}>
                <View style={styles.dishRow}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.dishImage}
                    onError={(e) =>
                      console.log('Erreur chargement image pour', item.nom, ':', e.nativeEvent.error)
                    }
                  />
                  <View style={styles.dishInfo}>
                    <Text style={styles.dishName}>
                      {item.nom || 'Nom inconnu'}{' '}
                    </Text>
                      <Text style={styles.priceText}>{parseInt(item.prix, 10)} FCFA</Text>
                    <Text style={styles.dishDescription}>
                      {item.description || 'Variante non disponible'}
                    </Text>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={16} color="#FFD700" />
                      <Text style={styles.ratingText}>4.5 (125 réactions)</Text>
                      <Ionicons name="heart" size={20} color="red" style={styles.heartIcon} />
                    </View>
                    <TouchableOpacity style={styles.orderButton} onPress={() => handleOrder(item)}>
                      <Text style={styles.orderButtonText}>Commander</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        />
      ) : (
        <Text style={styles.message}>Aucun plat trouvé.</Text>
      )}

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: colors.white, marginTop: 60 },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: colors.text },
  message: { textAlign: 'center', color: colors.secondary, fontSize: 16 },
  error: { textAlign: 'center', color: 'red', fontSize: 16 },
  dishCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  dishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  dishImage: {
    width: 100,
    height: 135,
    borderRadius: 10,
    marginRight: 10,
  },
  dishInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  dishName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  priceText: {
    fontSize: 16,
    color: colors.secondary,
    fontWeight: 'bold',
  },
  dishDescription: {
    fontSize: 14,
    color: colors.secondary,
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 5,
  },
  heartIcon: {
    marginLeft: 10,
  },
  orderButton: {
    backgroundColor: '#859163',
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  searchBar: {
    borderWidth: 1,
    borderColor: '#859163',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    color: colors.text,
    backgroundColor: '#f5f5f5',
  },
  // Styles pour la modale
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    elevation: 5,
  },
  modalIcon: {
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  viewCartButton: {
    backgroundColor: '#72815A',
  },
  closeButton: {
    backgroundColor: '#859163',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});