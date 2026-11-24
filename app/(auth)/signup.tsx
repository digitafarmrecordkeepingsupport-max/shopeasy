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
import { isValidEmail, isValidPassword } from '../../utils/validation';

export default function SignUpScreen() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = 'Please enter your full name';
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (cleanPhone.length < 10) {
      newErrors.phoneNumber = 'Please enter a valid phone number (min 10 digits)';
    }

    const passwordCheck = isValidPassword(password);
    if (!passwordCheck.isValid) {
      newErrors.password = passwordCheck.message || 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await signUp({
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim(),
        password,
      });

      Alert.alert(
        'Account Created!',
        `Welcome to ShopEasy, ${fullName.trim()}! Start exploring great products.`,
        [
          {
            text: 'Start Shopping',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (e: any) {
      Alert.alert('Sign Up Failed', e.message || 'Unable to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = (provider: string) => {
    Alert.alert(
      `${provider} Sign-In`,
      `${provider} authentication will connect once OAuth client credentials are configured in Supabase. You can also sign up directly with the form above.`
    );
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
          {/* Top Bar with Back Button */}
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
            <Text style={styles.heading}>Create Your Account</Text>
            <Text style={styles.subtitle}>Join us and start shopping today</Text>
          </View>

          {/* Registration Form Fields */}
          <View style={styles.formContainer}>
            <Input
              placeholder="Full Name"
              iconName="person-outline"
              value={fullName}
              onChangeText={setFullName}
              error={errors.fullName}
              autoCapitalize="words"
            />

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
              placeholder="Phone Number"
              iconName="phone-portrait-outline"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              error={errors.phoneNumber}
              keyboardType="phone-pad"
            />

            <Input
              placeholder="Password"
              iconName="lock-closed-outline"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              isPassword
            />

            <Input
              placeholder="Confirm Password"
              iconName="shield-checkmark-outline"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              isPassword
            />

            {/* Sign Up Action Button */}
            <Button
              title="Sign Up"
              onPress={handleSignUp}
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

            {/* Social Auth Buttons matching reference */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialSignIn('Google')}
              >
                <Ionicons name="logo-google" size={20} color={Colors.googleRed} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialSignIn('Apple')}
              >
                <Ionicons name="logo-apple" size={20} color={Colors.appleBlack} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialSignIn('Facebook')}
              >
                <Ionicons name="logo-facebook" size={20} color={Colors.facebookBlue} />
              </TouchableOpacity>
            </View>

            {/* Login Prompt at Bottom */}
            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text style={styles.loginLink}>Login</Text>
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
  submitButton: {
    marginTop: 6,
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
    marginBottom: 24,
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
});
