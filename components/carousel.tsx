import React from 'react';
import { Dimensions, Image, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

import img1 from '../assets/images/img1.png';
import img2 from '../assets/images/img2.png';
import img3 from '../assets/images/img3.png';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 50; // Largeur de l'écran moins les marges (20px de chaque côté)
const CARD_HEIGHT = 200; // Réduction de la hauteur fixe
const images = [img1, img2, img3];

const MyCarousel = () => {
  return (
    <View style={{ flex: 1, paddingHorizontal: 20 }}>
      <Carousel
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        data={images}
        scrollAnimationDuration={1000}
        autoPlay={true}
        renderItem={({ item }) => (
          <Image
            source={item}
            style={{ width: '100%', height: 200, borderRadius: 25 }}
            resizeMode="cover"
          />
        )}
      />
    </View>
  );
};

export default MyCarousel;
