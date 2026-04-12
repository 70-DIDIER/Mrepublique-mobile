import { AuthContext } from '@/context/AuthContext';
import { login, verifyCode } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TIMER_DURATION = 60;
const CODE_LENGTH = 4;

const VerificationScreen = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(TIMER_DURATION);
  const hiddenInputRef = useRef<TextInput>(null);
  const router = useRouter();
  const { setToken } = useContext(AuthContext);
  const { telephone, password } = useLocalSearchParams();
  const phoneNumber = typeof telephone === 'string' ? telephone : '';
  const passwordParam = typeof password === 'string' ? password : '';

  useFocusEffect(
    useCallback(() => {
      StatusBar.setHidden?.(false);
    }, [])
  );

  // Timer countdown
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Auto-focus à l'ouverture
  useEffect(() => {
    const timeout = setTimeout(() => {
      hiddenInputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  const handleChange = (text: string) => {
    // Ne garder que les chiffres, max CODE_LENGTH
    const digits = text.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(digits);

    // Auto-submit si code complet
    if (digits.length === CODE_LENGTH) {
      hiddenInputRef.current?.blur();
    }
  };

  const handleVerify = async () => {
    if (code.length !== CODE_LENGTH) {
      Alert.alert('Erreur', `Veuillez entrer le code à ${CODE_LENGTH} chiffres.`);
      return;
    }
    try {
      setLoading(true);

      const response = await verifyCode(phoneNumber, code);

      // Cas 1 : l'API verify retourne directement un token
      if (response?.token) {
        await AsyncStorage.setItem('token', response.token);
        setToken(response.token);
        router.replace('/(tabs)');
        return;
      }

      // Cas 2 : pas de token dans verify → auto-login avec les credentials
      if (passwordParam) {
        const loginResponse = await login(phoneNumber, passwordParam);
        if (loginResponse?.token) {
          await AsyncStorage.setItem('token', loginResponse.token);
          setToken(loginResponse.token);
          router.replace('/(tabs)');
          return;
        }
      }

      // Cas 3 : fallback — rediriger vers login manuellement
      Alert.alert(
        'Compte vérifié',
        'Votre compte est activé. Connectez-vous pour continuer.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        'Une erreur est survenue.';
      Alert.alert('Échec', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setCode('');
    setTimer(TIMER_DURATION);
    hiddenInputRef.current?.focus();
    Alert.alert('Info', 'Un nouveau code a été envoyé.');
  };

  const timerLabel = `${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
          />

          <Text style={styles.title}>Vérification</Text>
          <Text style={styles.subtitle}>
            Un code a été envoyé au{'\n'}
            <Text style={styles.phone}>{phoneNumber}</Text>
          </Text>

          {/* Zone OTP — tap pour ouvrir le clavier */}
          <TouchableOpacity
            style={styles.codeContainer}
            onPress={() => hiddenInputRef.current?.focus()}
            activeOpacity={1}
          >
            {Array.from({ length: CODE_LENGTH }).map((_, i) => {
              const isFocused = code.length === i;
              const isFilled = i < code.length;
              return (
                <View
                  key={i}
                  style={[
                    styles.codeBox,
                    isFilled && styles.codeBoxFilled,
                    isFocused && styles.codeBoxActive,
                  ]}
                >
                  <Text style={styles.codeDigit}>{code[i] ?? ''}</Text>
                  {isFocused && <View style={styles.cursor} />}
                </View>
              );
            })}

            {/* Input caché — capture frappe + coller + auto-fill SMS */}
            <TextInput
              ref={hiddenInputRef}
              value={code}
              onChangeText={handleChange}
              maxLength={CODE_LENGTH}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
              style={styles.hiddenInput}
              caretHidden
            />
          </TouchableOpacity>

          {/* Timer */}
          {timer > 0 ? (
            <Text style={styles.timer}>
              Code expire dans{' '}
              <Text style={styles.timerBold}>{timerLabel}</Text>
            </Text>
          ) : (
            <Text style={styles.timerExpired}>Code expiré</Text>
          )}

          {/* Bouton vérifier */}
          <TouchableOpacity
            style={[
              styles.button,
              (code.length !== CODE_LENGTH || loading || timer === 0) &&
                styles.buttonDisabled,
            ]}
            onPress={handleVerify}
            disabled={code.length !== CODE_LENGTH || loading || timer === 0}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Vérification...' : 'Vérifier et continuer'}
            </Text>
          </TouchableOpacity>

          {/* Renvoyer */}
          {timer === 0 && (
            <TouchableOpacity style={styles.resendButton} onPress={handleResend}>
              <Text style={styles.resendText}>Renvoyer le code</Text>
            </TouchableOpacity>
          )}

          {/* Modifier le numéro */}
          <TouchableOpacity
            style={styles.modifyButton}
            onPress={() => router.back()}
          >
            <Text style={styles.modifyText}>← Modifier le numéro</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 24,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2d2d2d',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
  },
  phone: {
    fontWeight: '700',
    color: '#72815A',
  },

  // ── Boîtes OTP ──────────────────────────────────────
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 28,
  },
  codeBox: {
    width: 58,
    height: 66,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeBoxFilled: {
    borderColor: '#72815A',
    backgroundColor: '#F0F3EA',
  },
  codeBoxActive: {
    borderColor: '#72815A',
    borderWidth: 2,
    backgroundColor: '#fff',
  },
  codeDigit: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d2d2d',
  },
  cursor: {
    position: 'absolute',
    bottom: 14,
    width: 2,
    height: 22,
    backgroundColor: '#72815A',
    borderRadius: 1,
  },
  // Input invisible qui reçoit le focus et les frappes
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    pointerEvents: 'none',
  },

  // ── Timer ────────────────────────────────────────────
  timer: {
    fontSize: 13,
    color: '#999',
    marginBottom: 28,
  },
  timerBold: {
    fontWeight: '700',
    color: '#72815A',
  },
  timerExpired: {
    fontSize: 13,
    color: '#e05c5c',
    marginBottom: 28,
  },

  // ── Boutons ──────────────────────────────────────────
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#72815A',
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
  resendButton: {
    marginBottom: 16,
    paddingVertical: 8,
  },
  resendText: {
    color: '#72815A',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  modifyButton: {
    paddingVertical: 8,
  },
  modifyText: {
    color: '#aaa',
    fontSize: 13,
  },
});

export default VerificationScreen;
