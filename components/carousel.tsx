import React from 'react';
import { Dimensions, Image, View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';

import img1 from '../assets/images/img1.png';
import img2 from '../assets/images/img2.png';
import img3 from '../assets/images/img3.png';

const { width } = Dimensions.get('window');
const CARD_HEIGHT = 200;
const CARD_WIDTH = width - 40;  // largeur visible de chaque slide
const GAP = 16;                  // espace entre deux slides
const CARD_STEP = CARD_WIDTH + GAP; // distance parcourue par swipe
const SIDE_OFFSET = (width - CARD_STEP) / 2; // décalage pour centrer la slide courante
const images = [img1, img2, img3];

const MyCarousel = () => {
  return (
    <View style={{ flex: 1, overflow: 'hidden' }}>
      <Carousel
        width={CARD_STEP}
        height={CARD_HEIGHT}
        style={{ width, marginLeft: SIDE_OFFSET }}
        data={images}
        scrollAnimationDuration={900}
        autoPlay={true}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: GAP / 2 }}>
            <Image
              source={item}
              style={{ width: CARD_WIDTH, height: CARD_HEIGHT, borderRadius: 20 }}
              resizeMode="cover"
            />
          </View>
        )}
      />
    </View>
  );
};

export default MyCarousel;
