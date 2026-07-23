import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { setStatusBarStyle, StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { SafeAreaView } from 'react-native-safe-area-context';
import MyCarousel from '../../components/carousel';
import Header from '../../components/header-1';
import NouveauxSection from '../../components/nouveauxsection';
import { resolveImageUrl } from '../../constants/api';
import { colors } from '../../constants/Colors';
import { useCart } from '../../context/CartContext';
import { getPopularDishes } from '../../services/api';

const { width, height } = Dimensions.get('window');

const POPULAR_CARD_WIDTH = width - 40;
const POPULAR_GAP = 16;
const POPULAR_STEP = POPULAR_CARD_WIDTH + POPULAR_GAP;
const POPULAR_OFFSET = (width - POPULAR_STEP) / 2;
const POPULAR_CARD_HEIGHT = 145;

const Index = () => {
  const [popularDishes, setPopularDishes] = useState<any[]>([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDish, setSelectedDish] = useState<string | null>(null);
  const router = useRouter();
  const { addToCart } = useCart();

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
    }, [])
  );

  useEffect(() => {
    const fetchPopular = async () => {
      setLoadingPopular(true);
      try {
        const dishes = await getPopularDishes(6);
        setPopularDishes(dishes);
      } catch (error) {
        console.error('Erreur lors de la récupération des plats populaires :', error);
      } finally {
        setLoadingPopular(false);
      }
    };
    fetchPopular();
  }, []);

  const getImageUrl = (imageUrl: string) =>
    resolveImageUrl(imageUrl, 'https://via.placeholder.com/100');

  const handleCategoryPress = (category: string) => {
    router.push({
      pathname: '/show',
      params: { category: category.toLowerCase() },
    });
  };

  const handleDishPress = (item: any) => {
    if (item.categorie) {
      router.push({ pathname: '/show', params: { category: item.categorie.toLowerCase() } });
    } else {
      router.push('/show');
    }
  };

  const handleOrder = (dish: any) => {
    addToCart({
      id: dish.id.toString(),
      nom: dish.nom || 'Nom inconnu',
      prix: parseFloat(dish.prix) || 0,
      image_url: dish.image_url || '',
      quantity: 1,
    });
    setSelectedDish(dish.nom || null);
    setModalVisible(true);
  };

  const goToCart = () => {
    setModalVisible(false);
    router.push('/(tabs)/cart');
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar style="light" />

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle" size={48} color="#72815A" style={styles.modalIcon} />
            <Text style={styles.modalTitle}>Ajouté au panier !</Text>
            <Text style={styles.modalMessage}>
              {selectedDish ? `${selectedDish} a bien été ajouté au panier.` : 'Plat ajouté au panier.'}
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={[styles.modalButton, styles.viewCartButton]} onPress={goToCart}>
                <Text style={styles.modalButtonText}>Voir le panier</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.closeButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalButtonText}>Fermer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Header />
          <View style={styles.content}>
            {/* Carousel */}
            <View style={styles.carousel}>
              <MyCarousel />
            </View>
            {/* Catégories */}
            <View style={styles.categoriesContainer}>
              <Text style={styles.title}>Catégories</Text>
              <View style={styles.categories}>
                {['Entrées', 'Résistance', 'Déssert', 'Rafraîchissement'].map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.categoryButton}
                    onPress={() => handleCategoryPress(item)}
                  >
                    <Text style={styles.categoryText}>{item}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {/* Section Nouveaux */}
            <View style={styles.section}>
              <NouveauxSection />
            </View>
            {/* Section Populaire */}
            <View style={styles.popularCardContainer}>
              <Text style={styles.title}>Populaire</Text>
              {loadingPopular ? (
                <Text style={styles.loadingText}>Chargement...</Text>
              ) : popularDishes.length > 0 ? (
                <View style={{ overflow: 'hidden' }}>
                  <Carousel
                    width={POPULAR_STEP}
                    height={POPULAR_CARD_HEIGHT}
                    style={{ width, marginLeft: POPULAR_OFFSET }}
                    data={popularDishes}
                    scrollAnimationDuration={700}
                    autoPlay={true}
                    autoPlayInterval={3500}
                    loop
                    renderItem={({ item }) => (
                      <View style={{ paddingHorizontal: POPULAR_GAP / 2 }}>
                        <TouchableOpacity
                          style={styles.popularCard}
                          activeOpacity={0.92}
                          onPress={() => handleDishPress(item)}
                        >
                          <Image
                            source={{ uri: getImageUrl(item.image_url) }}
                            style={styles.popularImage}
                            resizeMode="cover"
                          />
                          <View style={styles.popularContent}>
                            <Text style={styles.popularTitle} numberOfLines={1}>{item.nom}</Text>
                            <Text style={styles.popularDesc} numberOfLines={2}>{item.description}</Text>
                            <View style={styles.popularFooter}>
                              <Text style={styles.popularPrice}>{parseInt(item.prix, 10)} FCFA</Text>
                              <TouchableOpacity
                                style={styles.buyButton}
                                onPress={() => handleOrder(item)}
                              >
                                <Text style={styles.buyButtonText}>Commander</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        </TouchableOpacity>
                      </View>
                    )}
                  />
                </View>
              ) : (
                <Text style={styles.errorText}>Aucun plat populaire trouvé.</Text>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Index;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#72815A',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#72815A',
    width: '100%',
  },
  content: {
    flex: 1,
  },
  carousel: {
    marginTop: 10,
    height: height * 0.25,
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#859163',
    borderRadius: 5,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginVertical: 15,
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: colors.text,
  },
  searchButton: {
    backgroundColor: '#859163',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  categoriesContainer: {
    marginHorizontal: 16,
    marginTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 5,
    marginBottom: 10,
    color: colors.text,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 5,
  },
  categoryButton: {
    backgroundColor: '#859163',
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    width: '48%',
    alignItems: 'center',
  },
  categoryText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    marginVertical: 10,
  },
  popularCardContainer: {
    marginVertical: 10,
    marginBottom: 24,
  },
  popularCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    height: POPULAR_CARD_HEIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  popularImage: {
    width: 120,
    height: POPULAR_CARD_HEIGHT,
    backgroundColor: '#eee',
  },
  popularContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  popularTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: colors.text,
  },
  popularDesc: {
    fontSize: 12,
    color: '#777',
    lineHeight: 17,
    flex: 1,
    marginVertical: 4,
  },
  popularFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  popularPrice: {
    fontWeight: 'bold',
    fontSize: 14,
    color: colors.primary,
  },
  buyButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  buyButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  loadingText: {
    textAlign: 'center',
    color: '#555',
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    fontSize: 16,
  },
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
  modalIcon: {
    marginBottom: 12,
  },
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
  viewCartButton: {
    backgroundColor: '#72815A',
  },
  closeButton: {
    backgroundColor: '#859163',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});