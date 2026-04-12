// import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { setStatusBarStyle, StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
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

  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return 'https://via.placeholder.com/100';
    return Platform.OS === 'android' ? imageUrl.replace('127.0.0.1', '10.0.2.2') : imageUrl;
  };

  const handleCategoryPress = (category: string) => {
    router.push({
      pathname: '/show',
      params: { category: category.toLowerCase() },
    });
  };

  const handleDishPress = (id: string) => {
    router.push(`/show/${id}`);
  };

  // Fonction pour ajouter au panier et afficher une alerte
  const handleOrder = (dish: any) => {
    addToCart({
      id: dish.id.toString(),
      nom: dish.nom || 'Nom inconnu',
      prix: parseFloat(dish.prix) || 0,
      image_url: dish.image_url || '',
      quantity: 1,
    });
    Alert.alert(
      'Ajouté au panier',
      dish.nom ? `${dish.nom} a bien été ajouté au panier !` : 'Plat ajouté au panier !',
      [
        { text: 'Voir le panier', onPress: () => router.push('/cart') },
        { text: 'Fermer', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar style="light" />
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
                          onPress={() => handleDishPress(item.id)}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
    elevation: 20,
  },
  modalContentFix: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    width: Math.round(Dimensions.get('window').width * 0.9),
    maxWidth: 400,
    alignItems: 'center',
    elevation: 10,
    zIndex: 1001,
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