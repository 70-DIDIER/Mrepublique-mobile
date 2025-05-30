import { register as registerApi } from '@/services/api';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const RegisterScreen = () => {

  const router = useRouter();
  const [name, setName] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [password_confirmation, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !telephone || !password || !password_confirmation) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    if (password !== password_confirmation) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      setLoading(true);
      const response = await registerApi(name, telephone, password);
      console.log('Inscription réussie:', response);

      Alert.alert('Succès', 'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.');
      router.replace({ pathname: '../verificationScreen', params: { telephone: telephone } }); // Redirige vers l'écran de vérification en passant le numéro de téléphone
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue. Veuillez réessayer.';
      Alert.alert('Échec', errorMessage);
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Veuillez remplir les informations pour vous connecter</Text>
      <TextInput 
      style={styles.input} 
      placeholder="Nom complet"
      value={name}
      onChangeText={setName}
      
      />
      <TextInput 
      style={styles.input} 
      placeholder="Téléphone ex: +228 90000BS" 
      keyboardType="phone-pad" 
      value={telephone}
      onChangeText={setTelephone}
      />
      <TextInput 
      style={styles.input} 
      placeholder="Entrez votre Mot de passe" 
      secureTextEntry 
      value={password}
      onChangeText={setPassword}
      />
      <TextInput 
      style={styles.input} 
      placeholder="Confirmez votre Mot de passe" 
      secureTextEntry 
      value={password_confirmation}
      onChangeText={setConfirmPassword}
      />
      <Button
        title={loading ? "Inscription..." : "S'inscrire"}
        onPress={handleRegister}
        disabled={loading}
      />
      <TouchableOpacity style={styles.linkContainer} onPress={() => router.replace('../login')}>
        <Text style={styles.linkText}>Vous avez déjà un compte ? Connectez-vous</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
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
  }
});

export default RegisterScreen;