import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { router } from 'expo-router';
import MyCarousel from '../../components/carousel';
import Header from '../../components/header-1';

export default function menu() {
  const menuItems = [
    { id: '1', title: 'Petit déjeuner', image: require('../../assets/images/petiti_dejener.png') },
    { id: '2', title: 'cocktail', image: require('../../assets/images/cocktail.png') },
    { id: '3', title: 'Déjeuner', image: require('../../assets/images/dejener.png') },
    { id: '4', title: 'Soda', image: require('../../assets/images/soda.png') },
    { id: '5', title: 'Dinner', image: require('../../assets/images/dinner.png') },
    { id: '6', title: 'Bière', image: require('../../assets/images/biere.png') },
    { id: '7', title: 'Entrer', image: require('../../assets/images/entrer.png') },
    { id: '8', title: 'Vains', image: require('../../assets/images/vains.png') },
    { id: '9', title: 'Deser', image: require('../../assets/images/deser.png') },
    { id: '10', title: 'Apéritif', image: require('../../assets/images/apperitif.png') },
  ];
  return (
    <View style={styles.container}>
      <Header  />
     {/* pour le carousel */}
      <View style={styles.carousel}>
        <MyCarousel />
      </View>
      <View style={{ marginTop: 200 }}>
       <ScrollView contentContainerStyle={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.button} onPress={() => router.push('/show')} >
            <Image source={item.image} style={styles.image} />
            <Text style={styles.buttonText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
   flex: 1,
    backgroundColor: '#f9f9f9',
  },
  carousel: {
    marginTop: 20,
  },
  menuContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 10,
  },
  button: {
    width: '45%',
    backgroundColor: '#8A9A5B',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 5,
  },
})