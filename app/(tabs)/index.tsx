import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MyCarousel from '../../components/carousel';
import Header from '../../components/header-1';
import NouveauxSection from '../../components/nouveauxsection';
import { colors } from '../../constants/colors';
import { getRandomDish } from '../../services/api';

const Index = () => {
  const [popularDish, setPopularDish] = useState<any>(null);
  const [loadingPopular, setLoadingPopular] = useState(true);

  useEffect(() => {
    const fetchPopular = async () => {
      setLoadingPopular(true);
      const dish = await getRandomDish();
      console.log('Plat populaire récupéré :', dish);
      setPopularDish(dish);
      setLoadingPopular(false);
    };
    fetchPopular();
  }, []);

  // Pour l'émulateur Android, corrige l'URL de l'image
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return 'https://via.placeholder.com/100';
    return Platform.OS === 'android' ? imageUrl.replace('127.0.0.1', '10.0.2.2') : imageUrl;
  };

  return (
    <View style={styles.container}>
      <Header />
      {/* pour le carousel */}
      <View style={styles.carousel}>
        <MyCarousel />
      </View>
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Que cherchez vous ?"
          placeholderTextColor="#333"
          style={styles.input}
        />
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={20} color="white" />
        </TouchableOpacity>
      </View>
      {/* Catégories */}
      <View>
        <Text style={styles.title}>Catéogories</Text>
        <View style={styles.categories}>
          {['Peti-Déjeuner', 'Déjeuner', 'Dinner', 'Boisson'].map((item, index) => (
            <TouchableOpacity key={index} style={styles.categoryButton}>
              <Text style={styles.categoryText}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {/* la partie nouveau */}
      <View>
        <NouveauxSection />
      </View>
      {/* la partie des plats populaires */}
      <View style={styles.popularCardContainer}>
        <Text style={styles.title}>Populaire</Text>
        <View style={styles.popularCardContainer}>
          {loadingPopular ? (
            <Text>Chargement...</Text>
          ) : popularDish ? (
            <View style={styles.popularCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.popularTitle}>{popularDish.nom}</Text>
                <Text style={styles.popularDesc} numberOfLines={2}>{popularDish.description}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                  <Text style={styles.popularPrice}>{popularDish.prix} FCFA</Text>
                  <TouchableOpacity style={styles.buyButton}>
                    <Text style={styles.buyButtonText}>Acheter</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Image
                source={{ uri: getImageUrl(popularDish.image_url) }}
                style={styles.popularImage}
                resizeMode="cover"
              />
            </View>
          ) : (
            <Text>Aucun plat populaire trouvé.</Text>
          )}
        </View>
      </View>
    </View>

  )
}

export default Index

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  carousel: {
    marginTop: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#859163',
    borderRadius: 5,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginTop: 230,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    padding: 10,
  },
  searchButton: {
    backgroundColor: '#859163',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    marginBottom: 10,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10, 
  },
  categoryButton: {
    backgroundColor: '#859163',
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
    marginLeft: 10,
    marginBottom: 10,
  },
  categoryText: {
    color: 'white',
    fontWeight: '500',
  },
  popularCardContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
    paddingVertical: 10,
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
  popularPrice: {
    fontWeight: 'bold',
    fontSize: 15,
    color: colors.primary,
    marginRight: 10,
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
    marginLeft: 10,
    backgroundColor: '#eee',
  },
  
})