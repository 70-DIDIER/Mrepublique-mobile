import { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Platform } from 'react-native';
import { colors } from '../../constants/colors';
import { API_URL } from '../../constants/api';
import { getDishes } from '../../services/api';

export default function TestAPI() {
  const [dishes, setDishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setLoading(true);
        console.log('Tentative de connexion à:', `${API_URL}/plats`);
        const response = await getDishes();
        console.log('Réponse brute de l\'API:', response);

        const data = response.data || response;
        console.log('Données traitées:', data);
        setDishes(Array.isArray(data) ? data : data.data || []);
        setError(null);
      } catch (err) {
        const axiosError = err as any;
        console.error('Erreur détaillée:', {
          message: axiosError.message,
          code: axiosError.code,
          response: axiosError.response?.data,
          status: axiosError.response?.status,
        });
        setError('Impossible de récupérer les plats. Vérifiez l\'URL ou le serveur.');
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, []);

  // Ajuster l'URL de l'image pour l'émulateur
  const getImageUrl = (imageUrl: string) => {
    if (!imageUrl) return 'https://via.placeholder.com/80';
    // Remplace 127.0.0.1 par 10.0.2.2 pour l'émulateur Android
    return Platform.OS === 'android' ? imageUrl.replace('127.0.0.1', '10.0.2.2') : imageUrl;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test API - Liste des Plats</Text>
      {loading ? (
        <Text style={styles.message}>Chargement...</Text>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : dishes.length > 0 ? (
        <FlatList
          data={dishes}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={({ item }) => {
            const imageUrl = getImageUrl(item.image_url); // Utilise image_url au lieu de image
            console.log('Image URL pour', item.nom, ':', imageUrl);
            return (
              <View style={styles.dishItem}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.dishImage}
                  onError={(e) => console.log('Erreur chargement image pour', item.nom, ':', e.nativeEvent.error)}
                />
                <View style={styles.dishInfo}>
                  <Text style={styles.dishName}>{item.nom || 'Nom inconnu'}</Text>
                  <Text style={styles.dishPrice}>{item.prix || 'Prix inconnu'}</Text>
                  <Text style={styles.dishCategory}>{item.categorie || 'Catégorie inconnue'}</Text>
                </View>
              </View>
            );
          }}
        />
      ) : (
        <Text style={styles.message}>Aucun plat trouvé.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: colors.white },
  title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10, color: colors.text },
  message: { textAlign: 'center', color: colors.secondary, fontSize: 16 },
  error: { textAlign: 'center', color: 'red', fontSize: 16 },
  dishItem: { flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  dishImage: { width: 80, height: 80, borderRadius: 10 },
  dishInfo: { marginLeft: 10, justifyContent: 'center' },
  dishName: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  dishPrice: { fontSize: 14, color: colors.text },
  dishCategory: { fontSize: 14, color: colors.secondary },
});