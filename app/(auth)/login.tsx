import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import Logo from '../../components/common/Logo';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { isValidEmail } from '../../utils/validation';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs: { [key: string]: string } = {};

    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!isValidEmail(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async (customEmail?: string) => {
    const targetEmail = customEmail || email;
    if (!customEmail && !validate()) return;

    setIsLoading(true);
    try {
      const profile = await login(targetEmail, password || 'password123');

      if (profile.role === 'admin') {
        router.replace('/admin');
      } else {
        router.replace('/(tabs)');
      }
    } catch (e: any) {
      Alert.alert('Login Error', e.message || 'Unable to log in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoCustomer = () => {
    setEmail('jane.doe@gmail.com');
    setPassword('demo1234');
    handleLogin('jane.doe@gmail.com');
  };

  const handleDemoAdmin = () => {
    setEmail('admin@shopeasy.com');
    setPassword('admin1234');
    handleLogin('admin@shopeasy.com');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Decorative Blob in top right matching reference */}
      <View style={styles.topBlob} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Centered Brand Logo matching reference */}
          <View style={styles.logoWrapper}>
            <Logo variant="dark" size="medium" />
          </View>

          {/* Heading & Subtitle */}
          <View style={styles.headerTextContainer}>
            <Text style={styles.heading}>Welcome Back!</Text>
            <Text style={styles.subtitle}>Login to continue shopping</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <Input
              placeholder="Email Address"
              iconName="mail-outline"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              placeholder="Password"
              iconName="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              isPassword
            />

            {/* Forgot Password Link matching reference */}
            <TouchableOpacity
              onPress={() => router.push('/(auth)/forgot-password')}
              style={styles.forgotPasswordContainer}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Primary Login Button */}
            <Button
              title="Login"
              onPress={() => handleLogin()}
              variant="primary"
              isLoading={isLoading}
              style={styles.submitButton}
            />

            {/* Social Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social Login Buttons matching reference */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() =>
                  Alert.alert('Google Sign-In', 'Google authentication is available when OAuth is configured in Supabase.')
                }
              >
                <Ionicons name="logo-google" size={20} color={Colors.googleRed} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() =>
                  Alert.alert('Apple Sign-In', 'Apple authentication is available when OAuth is configured in Supabase.')
                }
              >
                <Ionicons name="logo-apple" size={20} color={Colors.appleBlack} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() =>
                  Alert.alert('Facebook Sign-In', 'Facebook authentication is available when OAuth is configured in Supabase.')
                }
              >
                <Ionicons name="logo-facebook" size={20} color={Colors.facebookBlue} />
              </TouchableOpacity>
            </View>

            {/* Quick Demo Access Pills */}
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>QUICK DEMO ACCESS</Text>
              <View style={styles.demoButtonsRow}>
                <TouchableOpacity
                  style={styles.demoPillCustomer}
                  onPress={handleDemoCustomer}
                >
                  <Ionicons name="person-circle-outline" size={16} color={Colors.primary} />
                  <Text style={styles.demoPillTextCustomer}>Customer (Jane)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.demoPillAdmin}
                  onPress={handleDemoAdmin}
                >
                  <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
                  <Text style={styles.demoPillTextAdmin}>Store Owner</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bottom Sign-Up Link */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
                <Text style={styles.signUpLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  topBlob: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#F3E8FF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  topBar: {
    paddingTop: 8,
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTextContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  formContainer: {
    width: '100%',
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    marginTop: -4,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  submitButton: {
    marginBottom: 20,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    paddingHorizontal: 12,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  socialButton: {
    width: 54,
    height: 54,
    borderRadius: 16,
    borderWidth: 1.2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  demoSection: {
    backgroundColor: '#FAF8FD',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#ECE6F6',
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  demoButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  demoPillCustomer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  demoPillTextCustomer: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  demoPillAdmin: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  demoPillTextAdmin: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
});
