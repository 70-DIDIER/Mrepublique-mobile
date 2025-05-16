import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MyCarousel from '../../components/carousel';
import Header from '../../components/header-1';
import NouveauxSection from '../../components/nouveauxsection';
import { colors } from '../../constants/colors';
import { getRandomDish } from '../../services/api';

const { height } = Dimensions.get('window');

const Index = () => {
  const [popularDish, setPopularDish] = useState<any>(null);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPopular = async () => {
      setLoadingPopular(true);
      try {
        const dish = await getRandomDish();
        console.log('Plat populaire récupéré :', dish);
        setPopularDish(dish);
      } catch (error) {
        console.error('Erreur lors de la récupération du plat populaire :', error);
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
//  l fonction  qui gère l'ajout au panier
// const handleOrder = (dish: any) => {
//     addToCart({
//       id: dish.id.toString(),
//       nom: dish.nom || 'Nom inconnu',
//       prix: parseFloat(dish.prix) || 0,
//       image_url: dish.image_url || '',
//       quantity: 1,
//     });
//     // Afficher la modale avec le nom du plat
//     setSelectedDish(dish.nom);
//     setModalVisible(true);
//     console.log('Plat ajouté au panier:', dish.nom);
//   };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" translucent={false} backgroundColor="#72815A" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Header />
          <View style={styles.content}>
            {/* Carousel */}
            <View style={styles.carousel}>
              <MyCarousel />
            </View>
            {/* Barre de recherche */}
            <View style={styles.searchContainer}>
              <TextInput
                placeholder="Que cherchez-vous ?"
                placeholderTextColor="#333"
                style={styles.input}
              />
              <TouchableOpacity style={styles.searchButton}>
                <Ionicons name="search" size={20} color="white" />
              </TouchableOpacity>
            </View>
            {/* Catégories */}
            <View style={styles.categoriesContainer}>
              <Text style={styles.title}>Catégories</Text>
              <View style={styles.categories}>
                {['Peti-Déjeuner', 'Déjeuner', 'Dinner', 'Boisson'].map((item, index) => (
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
              ) : popularDish ? (
                <TouchableOpacity
                  style={styles.popularCard}
                  onPress={() => handleDishPress(popularDish.id)}
                >
                  <View style={styles.popularContent}>
                    <Text style={styles.popularTitle}>{popularDish.nom}</Text>
                    <Text style={styles.popularDesc} numberOfLines={2}>{popularDish.description}</Text>
                    <View style={styles.popularFooter}>
                      <Text style={styles.popularPrice}>{popularDish.prix} FCFA</Text>
                      {/* <TouchableOpacity style={styles.buyButton}>
                        <Text style={styles.buyButtonText}>Acheter</Text>
                      </TouchableOpacity> */}
                      <TouchableOpacity style={styles.buyButton} >
                        <Text style={styles.buyButtonText}>Commander</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Image
                    source={{ uri: getImageUrl(popularDish.image_url) }}
                    style={styles.popularImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
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
    paddingHorizontal: 16,
  },
  popularCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 15,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 10,
  },
  popularContent: {
    flex: 1,
    marginRight: 10,
  },
  popularTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: colors.text,
  },
  popularDesc: {
    fontSize: 13,
    color: '#555',
    marginBottom: 8,
  },
  popularFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  popularPrice: {
    fontWeight: 'bold',
    fontSize: 15,
    color: colors.primary,
  },
  buyButton: {
    backgroundColor: colors.primary,
    borderRadius: 5,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  buyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  popularImage: {
    width: 90,
    height: 90,
    borderRadius: 15,
    backgroundColor: '#eee',
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
});