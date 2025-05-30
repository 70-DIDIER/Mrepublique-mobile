import { AuthContext } from '@/context/AuthContext';
import { login } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { setToken } = useContext(AuthContext);

  const [identifiant, setIdentifiant] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifiant || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      setLoading(true);
      const response = await login(identifiant, password);
      console.log('Login Success:', response);

      // Sauvegarder le token et mettre à jour le contexte d'authentification
      if (response.token) {
        await AsyncStorage.setItem('token', response.token);
        setToken(response.token);
      }

      router.replace('/(tabs)'); // Redirige vers les tabs
    } catch (error) {
      console.error('Erreur lors de la connexion', error);
      const errorMessage = error instanceof Error ? error.message : 'Identifiants incorrects';
      Alert.alert('Échec', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>

      <TextInput
        placeholder="Identifiant"
        style={styles.input}
        value={identifiant}
        onChangeText={setIdentifiant}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Mot de passe"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        title={loading ? 'Connexion...' : 'Se connecter'}
        onPress={handleLogin}
        disabled={loading}
      />

      <TouchableOpacity style={styles.linkContainer} onPress={() => router.replace('../register')}>
        <Text style={styles.linkText}>Vous navez pas de compte ? Inscrivez-vous</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  linkContainer: {
    marginTop: 16,
    alignItems: 'center'
  },
  linkText: {
    color: '#2e78b7',
    textDecorationLine: 'underline'
  }
});
