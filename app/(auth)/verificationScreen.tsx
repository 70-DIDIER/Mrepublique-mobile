import { verifyCode } from '@/services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const TIMER_DURATION = 60; // durée en secondes

const VerificationScreen = () => {
  const [code, setCode] = useState(['', '', '', '']);
  const inputs = useRef<TextInput[]>([]);
  const router = useRouter();
  const { telephone } = useLocalSearchParams();
  const phoneNumber = typeof telephone === 'string' ? telephone : '';
  const [timer, setTimer] = useState(TIMER_DURATION);

  // Gestion du timer
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

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
      router.replace('../login');
    } catch (error: any) {
      console.error('Erreur lors de la vérification', error);
      const errorMessage = error.response?.data?.message || error.message || 'Une erreur est survenue lors de la vérification du code.';
      Alert.alert('Échec', errorMessage);
    }
  };

  const handleResend = () => {
    setTimer(TIMER_DURATION);
    // Ici tu peux appeler l'API pour renvoyer le code si besoin
    Alert.alert('Info', 'Un nouveau code a été envoyé.');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
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
        <Text style={styles.timer}>
          {timer > 0
            ? `Vous avez ${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')} sec`
            : "Code expiré"}
        </Text>
        <TouchableOpacity
          style={[styles.button, timer === 0 && { backgroundColor: '#859163' }]}
          onPress={handleVerify}
          disabled={timer === 0}
        >
          <Text style={styles.buttonText}>Vérifier et continuer</Text>
        </TouchableOpacity>
        {timer === 0 && (
          <TouchableOpacity style={styles.resendButton} onPress={handleResend}>
            <Text style={styles.resendText}>Renvoyer le code</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingVertical: 24,
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
    marginHorizontal: 3,
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
    backgroundColor: '#72815A',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  resendButton: {
    marginTop: 10,
  },
  resendText: {
    color: '#2e78b7',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});

export default VerificationScreen;
