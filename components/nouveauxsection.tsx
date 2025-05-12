import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet } from 'react-native';

const NouveauxSection = () => {
  const images = [
    require('../assets/images/nv1.png'),
    require('../assets/images/nv2.png'),
    require('../assets/images/nv3.png'),
    require('../assets/images/nv4.png'),
    require('../assets/images/nv5.png'),
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nouveaux</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {images.map((image, index) => (
          <Image
            key={index}
            source={image}
            style={styles.image}
          />
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
  labelContainer: {
    backgroundColor: '#333',
    paddingVertical: 10,
    paddingHorizontal: 5,
    marginRight: 10,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    transform: [{ rotate: '-90deg' }],
    width: 100,
    textAlign: 'center',
  },
  scrollView: {
    flexDirection: 'row',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
    marginBottom: 10,
  },
});

export default NouveauxSection;