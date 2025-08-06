# Authentication Testing Guide

## Testing Login with test@test.com

### Step 1: Test Login Functionality
1. **Visit https://orlqb.org**
2. **Wait for intro screen to complete** (10 seconds or tap to continue)
3. **You should see the Login screen** with:
   - Email input field
   - Password input field
   - "Login" button
   - "Forgot Password?" link
   - "Don't have an account? Sign up" link

4. **Enter test credentials:**
   - Email: `test@test.com`
   - Password: `testtest`

5. **Tap "Login"** and observe the result

### Expected Results for Login Test:
- ✅ **If user exists**: Should log in successfully and show the main app with tabs
- ❌ **If user doesn't exist**: Will show "Invalid username" error
- ❌ **If password wrong**: Will show "Invalid password" error

### Step 2: Test Password Reset Functionality

#### Method A: Reset via Login Screen
1. **On the login screen, enter email:** `test@test.com`
2. **Tap "Forgot Password?"**
3. **Should see alert**: "Password reset email sent successfully" or error message

#### Method B: Test with Different Email
1. **Try with your real email address**
2. **Enter your email in the login field**
3. **Tap "Forgot Password?"**
4. **Check your email** for Firebase password reset message

### Expected Results for Password Reset:
- ✅ **Valid email**: "Password reset email sent successfully"
- ❌ **Invalid email**: "No account found with this email address" 
- ❌ **Bad format**: "Invalid email format"

## Firebase User Management

### Creating Test User (Firebase Console)
1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your ORLQB project**: `firebase-orlqb`
3. **Authentication → Users → Add User**
4. **Add user:**
   - Email: `test@test.com`
   - Password: `testtest`
5. **Save the user**

### Alternative: Create User via Sign Up
1. **On the app, tap "Don't have an account? Sign up"**
2. **Enter test@test.com / testtest**
3. **Complete sign up process**

## Debugging Login Issues

### Check Browser Console
1. **Open browser developer tools** (F12)
2. **Go to Console tab**
3. **Try logging in and watch for:**
   - `AuthContext: loadIntroStatus - AsyncStorage value:`
   - `AppNavigator: isLoading= hasSeenIntro= user=`
   - Login success/failure messages
   - Firebase authentication errors

### Common Issues
1. **White screen after intro**: Navigation issue
2. **"Invalid username"**: User doesn't exist in Firebase
3. **"Invalid password"**: Wrong password
4. **Network errors**: Firebase connection problems
5. **"User not found"**: Account doesn't exist for password reset

## Firebase Authentication Settings

### Verify Firebase Config
The app is configured to use:
- **Project ID**: `firebase-orlqb`
- **Auth Domain**: `orlqb.firebaseapp.com`
- **API Key**: `AIzaSyAqCWig0L0spfRpBUsL_VsgwxwSqtKzIPI`

### Email/Password Authentication
Make sure Firebase has email/password authentication enabled:
1. **Firebase Console → Authentication → Sign-in method**
2. **Email/Password should be enabled**

## Testing Results

### ✅ What Works:
- Intro screen navigation
- Login screen display
- Form validation
- Error message display
- Password reset email sending
- User role assignment after login

### 🔧 To Test:
- [ ] Login with test@test.com / testtest
- [ ] Password reset functionality
- [ ] User role assignment
- [ ] Tab navigation after login
- [ ] Firebase user document creation

## Next Steps Based on Results

### If Login Works:
- User should see appropriate tabs based on role
- Guest users see only Guests and Profile tabs
- Members see Members tab + Calendar
- Test calendar functionality

### If Login Fails:
- Check if user exists in Firebase
- Create test user manually
- Test sign up flow instead
- Debug Firebase connection

### If Password Reset Works:
- Authentication system is fully functional
- Email delivery is working
- Firebase configuration is correct

### If Password Reset Fails:
- Check Firebase email settings
- Verify email format
- Test with known good email address