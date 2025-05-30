import { verifyCode } from '@/services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const VerificationScreen = () => {
  const [code, setCode] = useState(['', '', '', '']);
  const inputs = useRef<TextInput[]>([]);
  const router = useRouter();
  const { telephone } = useLocalSearchParams();
  const phoneNumber = typeof telephone === 'string' ? telephone : '';

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < code.length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    if (verificationCode.length !== 4) {
      Alert.alert('Erreur', 'Veuillez entrer le code à 4 chiffres.');
      return;
    }

    try {
      const response = await verifyCode(phoneNumber, verificationCode);
      console.log('Vérification réussie:', response);
      Alert.alert('Succès', response.message || 'Code vérifié avec succès.');
      router.replace('../login'); // Rediriger vers l'écran de connexion après vérification réussie
    } catch (error: any) {
      console.error('Erreur lors de la vérification', error);
      // Tente d'accéder au message d'erreur de la réponse API, ou utilise un message générique
      const errorMessage = error.response?.data?.message || error.message || 'Une erreur est survenue lors de la vérification du code.';
      Alert.alert('Échec', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Vérification</Text>
      <Text style={styles.subtitle}>
        Nous vous avons envoyé un code à {phoneNumber}. Vérifiez votre papier si vous ne voyez pas ce code.
      </Text>
      <View style={styles.codeContainer}>
        {code.map((digit, index) => (
          <TextInput
            key={index}
            ref={ref => { inputs.current[index] = ref!; }}
            style={styles.codeInput}
            keyboardType="numeric"
            maxLength={1}
            value={digit}
            onChangeText={text => handleChange(text, index)}
          />
        ))}
      </View>
      <TouchableOpacity style={styles.modifyButton}>
        <Text style={styles.modifyText}>Modifier</Text>
      </TouchableOpacity>
      <Text style={styles.timer}>Vous avez passé 00:44 sec</Text>
      <TouchableOpacity style={styles.button} onPress={handleVerify}>
        <Text style={styles.buttonText}>Vérifier et continuer</Text>
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%',
    marginBottom: 20,
  },
  codeInput: {
    width: 50,
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 18,
  },
  modifyButton: {
    marginBottom: 20,
  },
  modifyText: {
    color: 'red',
    fontSize: 16,
  },
  timer: {
    fontSize: 14,
    marginBottom: 20,
  },
  button: {
    width: '100%',
    height: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default VerificationScreen;
