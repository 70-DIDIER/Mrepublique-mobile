import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function Profile() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: 'https://via.placeholder.com/50' }} style={styles.profileImage} />
        <View>
          <Text style={styles.name}>Angelo</Text>
          <Text style={styles.email}>angelo@gmail.com</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.option} onPress={() => router.push('/login')}>
        <Text style={styles.optionText}>Déconnexion</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option}>
        <Text style={styles.optionText}>Service client</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option}>
        <Text style={styles.optionText}>Adresses</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option}>
        <Text style={styles.optionText}>Commandes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option}>
        <Text style={styles.optionText}>Notifications</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option}>
        <Text style={styles.optionText}>Bonus Fidélité</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.option}>
        <Text style={styles.optionText}>Réglages</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  profileImage: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  name: { fontSize: 18, fontWeight: 'bold' },
  email: { fontSize: 14, color: 'gray' },
  option: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  optionText: { fontSize: 16 },
});