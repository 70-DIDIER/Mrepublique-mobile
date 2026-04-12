import { colors } from '@/constants/Colors';
import { register as registerApi } from '@/services/api';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const RegisterScreen = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !telephone || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    // if (password !== password_confirmation) {
    //   Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
    //   return;
    // }

    try {
      setLoading(true);
      const response = await registerApi(name, telephone, password);
      console.log('Inscription réussie:', response);

      Alert.alert('Succès', 'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.');
      router.replace({ pathname: '../verificationScreen', params: { telephone: telephone } });
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue. Veuillez réessayer.';
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
        <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Veuillez remplir les informations pour vous connecter</Text>
        <TextInput
          style={styles.input}
          placeholder="Nom complet"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="Téléphone ex: 90208099"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
          value={telephone}
          onChangeText={setTelephone}
        />
        <TextInput
          style={styles.input}
          placeholder="Entrez votre Mot de passe"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        
        <TouchableOpacity style={styles.butt} onPress={handleRegister}>
          <Text style={styles.buttonText}>{loading ? "Inscription..." : "S'inscrire"}</Text>
        </TouchableOpacity>
        {/* <Button
          title={loading ? "Inscription..." : "S'inscrire"}
          onPress={handleRegister}
          disabled={loading}
        /> */}
        <TouchableOpacity style={styles.linkContainer} onPress={() => router.replace('../login')}>
          <Text style={styles.linkText}>Vous avez déjà un compte ? Connectez-vous</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: 16,
    color: '#333',
  },
  button: {
    width: '100%',
    height: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  linkContainer: {
    marginTop: 16,
    alignItems: 'center'
  },
  linkText: {
    color: '#2e78b7',
    textDecorationLine: 'underline'
  },
  butt:{
    backgroundColor: colors.primary,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  }
});

export default RegisterScreen;