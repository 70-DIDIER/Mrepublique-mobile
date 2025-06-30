import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/Colors';

type Plat = {
  nom: string;
  description: string;
  image_url: string;
};

type PlatCardProps = {
  plat: Plat; // Assurez-vous que cet objet possède bien les propriétés nom, description et image_url
  isFavorite: boolean;
  onOrder: () => void;
  onToggleFavorite: () => void;
};

export default function PlatCard({ plat, isFavorite, onOrder, onToggleFavorite }: PlatCardProps) {
  // Si plat est undefined, on ne rend rien pour éviter l'erreur.
  if (!plat) {
    console.warn('PlatCard: plat is undefined');
    return null;
  }

  return (
    <View style={styles.card}>
      <Image source={{ uri: plat.image_url }} style={styles.image} />
      <View style={styles.info}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={styles.title}>{plat.nom}</Text>
          <TouchableOpacity onPress={onToggleFavorite}>
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={22} color="red" />
          </TouchableOpacity>
        </View>
        <Text style={styles.desc}>{plat.description}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={16} color="#E74C3C" />
          <Text style={styles.rating}>4.5</Text>
          <Text style={styles.reactions}>(125 réactions)</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.orderBtn} onPress={onOrder}>
        <Text style={styles.orderText}>Commander</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 12,
    marginVertical: 7,
    marginHorizontal: 5,
    alignItems: 'center',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 65,
    height: 65,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: '#eee',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 15,
    color: colors.text,
    marginBottom: 2,
  },
  desc: {
    fontSize: 12,
    color: '#444',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: '#E74C3C',
    fontWeight: 'bold',
    marginLeft: 3,
    marginRight: 3,
    fontSize: 13,
  },
  reactions: {
    color: '#888',
    fontSize: 12,
  },
  orderBtn: {
    backgroundColor: colors.primary,
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginLeft: 8,
  },
  orderText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 13,
  },
});