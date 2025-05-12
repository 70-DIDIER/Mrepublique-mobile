declare module 'react-native-snap-carousel' {
  import { Component } from 'react';

  export interface CarouselProperties {
    data: any[];
    renderItem: (item: { item: any; index: number }) => React.ReactNode;
    sliderWidth: number;
    itemWidth: number;
    loop?: boolean;
    autoplay?: boolean;
    autoplayInterval?: number;
  }

  export default class Carousel extends Component<CarouselProperties> {}
} 