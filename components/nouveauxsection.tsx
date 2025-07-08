import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const nouveaux = [
  { image: require('../assets/images/nv1.png'), category: 'Entrées' },
  { image: require('../assets/images/nv2.png'), category: 'Résistance' },
  { image: require('../assets/images/nv3.png'), category: 'Déssert' },
  { image: require('../assets/images/nv4.png'), category: 'Rafraîchissement' },
  { image: require('../assets/images/nv5.png'), category: 'Spécial' },
];

const NouveauxSection = () => {
  const router = useRouter();

  const handleCategoryPress = (category: string) => {
    router.push({
      pathname: '/show',
      params: { category: category.toLowerCase() },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nouveaux</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {nouveaux.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleCategoryPress(item.category)}
            style={{ alignItems: 'center', marginHorizontal: 5 }}
          >
            <Image
              source={item.image}
              style={styles.image}
            />
            <Text style={styles.catLabel}>{item.category}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    paddingVertical: 10,
  },
  scrollView: {
    flexDirection: 'row',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    marginBottom: 10,
  },
  catLabel: {
    marginTop: 6,
    fontSize: 13,
    color: '#72815A',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default NouveauxSection;