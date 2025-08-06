/**
 * LoginScreen - User Authentication
 * 
 * This replaces your Ionic login.page.html and login.page.ts with a single
 * React Native component. Much simpler than Angular's separation of concerns.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const LoginScreen = ({ navigation }) => {
  // State management using React hooks (replaces Angular's form controls)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Get auth functions from context (replaces Angular service injection)
  const { signIn, resetPassword } = useAuth();

  /**
   * Handle login form submission
   * This replaces your Angular form submission logic
   */
  const handleLogin = async () => {
    // Clear previous error message
    setErrorMessage('');
    
    // Basic validation
    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn(email, password);
      
      if (result.success) {
        // Navigation happens automatically via AppNavigator when user state changes
        console.log('Login successful!');
        setErrorMessage(''); // Clear any error messages
      } else {
        console.log('Login failed:', result.error);
        setErrorMessage(result.error);
        Alert.alert('Login Failed', result.error);
      }
    } catch (error) {
      console.log('Login exception:', error);
      setErrorMessage('An unexpected error occurred');
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Navigate to Sign Up screen
   */
  const handleSignUpPress = () => {
    navigation.navigate('SignUp');
  };

  /**
   * Handle forgot password
   */
  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address first');
      return;
    }

    try {
      const result = await resetPassword(email);
      if (result.success) {
        Alert.alert('Success', result.message);
      } else {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send password reset email');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Header - replaces ion-header */}
        <View style={styles.header}>
          <Text style={styles.title}>ORLQB Login</Text>
          <Text style={styles.subtitle}>Welcome back to ORLQB</Text>
        </View>

        {/* Error Message Display */}
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Login Form - replaces ion-content with ion-inputs */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
          />

          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={styles.loginButtonText}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signUpButton}
            onPress={handleSignUpPress}
          >
            <Text style={styles.signUpButtonText}>
              Don't have an account? Sign up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#3880ff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#f44336',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loginButton: {
    backgroundColor: '#3880ff',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPasswordButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  forgotPasswordText: {
    color: '#3880ff',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  signUpButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  signUpButtonText: {
    color: '#3880ff',
    fontSize: 14,
  },
});

export default LoginScreen;

/**
 * LEARNING NOTES:
 * 
 * 1. State Management:
 *    - Angular: FormControl with reactive forms
 *    - React: useState hooks (much simpler!)
 * 
 * 2. Form Handling:
 *    - Angular: FormGroup validation with complex setup
 *    - React: Direct state updates with onChangeText
 * 
 * 3. Navigation:
 *    - Angular: Router.navigate() with dependency injection
 *    - React: navigation prop passed automatically by React Navigation
 * 
 * 4. Styling:
 *    - Ionic: CSS classes and CSS variables
 *    - React Native: StyleSheet objects with Flexbox
 * 
 * 5. User Feedback:
 *    - Ionic: Toast notifications
 *    - React Native: Alert API (native alerts)
 * 
 * 6. Keyboard Handling:
 *    - KeyboardAvoidingView prevents keyboard from covering inputs
 *    - Much better than CSS viewport handling in web
 * 
 * 7. Component Structure:
 *    - Single file contains both logic and styling
 *    - No separate .html, .ts, .scss files needed
 * 
 * This approach is much more straightforward than Angular's component architecture!
 */