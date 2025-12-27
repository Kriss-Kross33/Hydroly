# RevenueCat Setup Verification

Based on [RevenueCat React Native Installation Guide](https://www.revenuecat.com/docs/getting-started/installation/reactnative)

## ✅ Completed

### 1. Package Installation
- ✅ `react-native-purchases` installed: `^8.12.0` (in `package.json`)
- ✅ Package is properly imported in `packages/revenuecat-service/src/revenueCatService.ts`

### 2. Initialization
- ✅ RevenueCat initialized in `contexts/RevenueCatProvider.tsx`
- ✅ Uses Firebase UID as App User ID
- ✅ Platform-specific API keys configured
- ✅ Debug mode enabled in development

### 3. Integration
- ✅ Integrated with `SubscriptionContext`
- ✅ Purchase flow implemented
- ✅ Restore flow implemented
- ✅ Identity linking with Firebase Auth

## ❌ Issues Found

### 1. Android: Missing BILLING Permission
**Status**: ❌ **MISSING**

**Required**: Add BILLING permission to `AndroidManifest.xml`

**Fix**: Add this line to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="com.android.vending.BILLING" />
```

### 2. Android: Incorrect launchMode
**Status**: ❌ **INCORRECT**

**Current**: `android:launchMode="singleTask"` (line 26 in AndroidManifest.xml)

**Required**: Should be `"standard"` or `"singleTop"` according to RevenueCat docs

**Why**: Google Play may ask users to verify purchases in banking apps. If launchMode is not `standard` or `singleTop`, backgrounding the app can cancel purchases.

**Fix**: Change `launchMode` to `"standard"` or `"singleTop"`

### 3. iOS: In-App Purchase Capability
**Status**: ⚠️ **NEEDS MANUAL VERIFICATION**

**Required**: Enable In-App Purchase capability in Xcode

**Steps**:
1. Open project in Xcode
2. Select project target
3. Go to "Signing & Capabilities"
4. Click "+ Capability"
5. Add "In-App Purchase"

**Note**: This must be done in Xcode, cannot be verified from code files.

## 📋 Verification Checklist

- [x] Install `react-native-purchases` package
- [x] Import Purchases correctly
- [x] Initialize Purchases with API keys
- [ ] Add BILLING permission (Android)
- [ ] Fix launchMode to `standard` or `singleTop` (Android)
- [ ] Enable In-App Purchase capability (iOS - manual check needed)
- [x] Configure platform-specific API keys
- [x] Set up identity linking
- [x] Implement purchase flow
- [x] Implement restore flow

## 🔧 Required Fixes

See fixes below for Android issues.

