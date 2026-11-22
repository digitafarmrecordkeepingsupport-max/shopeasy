import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Logo from '../../components/common/Logo';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { isValidEmail } from '../../utils/validation';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.logoWrapper}>
          <Logo variant="dark" size="medium" />
        </View>

        <Text style={styles.heading}>Reset Password</Text>
        <Text style={styles.subtitle}>
          Enter your registered email address and we'll send you instructions to reset your password.
        </Text>

        {isSent ? (
          <View style={styles.successBox}>
            <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
            <Text style={styles.successTitle}>Instructions Sent!</Text>
            <Text style={styles.successMessage}>
              We have sent password recovery instructions to {email}.
            </Text>
            <Button
              title="Return to Login"
              onPress={() => router.replace('/(auth)/login')}
              variant="primary"
              style={{ marginTop: 20, width: '100%' }}
            />
          </View>
        ) : (
          <View style={styles.form}>
            <Input
              placeholder="Email Address"
              iconName="mail-outline"
              value={email}
              onChangeText={setEmail}
              error={error}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Button
              title="Send Reset Instructions"
              onPress={handleReset}
              variant="primary"
              isLoading={isLoading}
              style={{ marginTop: 8 }}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  logoWrapper: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  form: {
    width: '100%',
  },
  successBox: {
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    width: '100%',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.success,
    marginTop: 12,
    marginBottom: 6,
  },
  successMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
