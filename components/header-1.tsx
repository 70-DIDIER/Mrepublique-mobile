import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors'; // Assurez-vous que le chemin est correct

const Header = () => {
  return (
    <View style={styles.headerContainer}>
      <Image
        // Vérifie que le chemin est correct (par ex. si tes assets se trouvent dans un dossier 'assets' à la racine du projet, adapte le chemin)
        source={require('../assets/images/logo.png')}
        style={styles.logo}
      />
      <Text style={styles.title}>MRepublique</Text>
      <Image
        // Vérifie que le chemin est correct
        source={require('../assets/images/profile.png')}
        style={styles.profilePic}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: colors.primary, // Couleur de fond (vert kaki ou olive selon ton design)
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40, // Padding pour iOS (status bar)
    paddingBottom: 10,
    // borderTopLeftRadius: 20,
    // borderTopRightRadius: 20,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    borderRadius: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default Header;
