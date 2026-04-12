import { AuthContext } from '@/context/AuthContext';
import { login } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useContext, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/Colors';

export default function LoginScreen() {
  const router = useRouter();
  const { setToken } = useContext(AuthContext);

  const [identifiant, setIdentifiant] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!identifiant || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      setLoading(true);
      const response = await login(identifiant, password);
      console.log('Login Success:', response);

      if (response.token) {
        await AsyncStorage.setItem('token', response.token);
        setToken(response.token);
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion', error);
      const errorMessage = error instanceof Error ? error.message : 'Identifiants incorrects';
      Alert.alert('Échec', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.container}>
        <Text style={styles.title}>Connexion</Text>
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
        <Text style={styles.subtitle}>Veuillez entrer votre numéro  pour vous connecter</Text>
        <TextInput
          placeholder="Téléphone"
          placeholderTextColor="#999"
          style={styles.input}
          value={identifiant}
          onChangeText={setIdentifiant}
          autoCapitalize="none"
          keyboardType="phone-pad"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Mot de passe"
            placeholderTextColor="#999"
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Text>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.forgotPassword}>Mot de passe oublié ?</Text>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>{loading ? 'Connexion...' : 'Connexion'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonOutline}
          onPress={() => router.replace('../register')}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonOutlineText}>Créer un compte</Text>
        </TouchableOpacity>
        <Text style={styles.welcomeText}>Bienvenu à la maison de la république{'\n'}votre restaurant idéal</Text>
      </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 24,
    paddingBottom: 48,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    marginBottom: 16,
    fontWeight: 'bold',
    color: '#4a704a',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    borderRadius: 8,
    width: '100%',
    minHeight: 48,
    fontSize: 16,
    color: '#333',
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 14 : 12,
    borderRadius: 8,
    minHeight: 48,
    fontSize: 16,
    color: '#333',
    paddingRight: 44,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  forgotPassword: {
    color: colors.primary,
    marginBottom: 16,
    alignSelf: 'flex-end',
    fontSize: 13,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: '#b5c0a4',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonOutline: {
    width: '100%',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginBottom: 12,
  },
  buttonOutlineText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  welcomeText: {
    fontSize: 13,
    textAlign: 'center',
    color: '#aaa',
    marginTop: 16,
    lineHeight: 20,
  },
});