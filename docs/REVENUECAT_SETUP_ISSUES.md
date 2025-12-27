# RevenueCat Setup Issues & Fixes

## 🔴 Critical Issues Found

### 1. RevenueCat NOT Initialized
**Status:** ❌ **MISSING**

**Problem:**
- RevenueCat service is created but never initialized
- No initialization in `App.tsx` or any provider
- According to architecture: RevenueCat should initialize on first launch with anonymous Firebase UID

**Required Fix:**
- Initialize RevenueCat in `App.tsx` or `SubscriptionContext`
- Use anonymous Firebase UID from `AuthContext`
- Initialize before app renders

### 2. AuthContext Uses Purchases Directly
**Status:** ⚠️ **INCORRECT**

**Problem:**
- `AuthContext.tsx` calls `Purchases.logIn()` directly
- Should use `revenueCatService.logIn()` instead
- Not using the centralized service

**Required Fix:**
- Import `revenueCatService` in `AuthContext`
- Replace `Purchases.logIn()` with `revenueCatService.logIn()`
- Replace `Purchases.logOut()` with `revenueCatService.logOut()`

### 3. SubscriptionContext Doesn't Use RevenueCat
**Status:** ❌ **MISSING**

**Problem:**
- `SubscriptionContext.tsx` uses mock/local storage
- Doesn't check RevenueCat for subscription status
- Purchase/restore methods are mock implementations

**Required Fix:**
- Integrate `revenueCatService` into `SubscriptionContext`
- Check RevenueCat for subscription status
- Use RevenueCat for purchases and restores
- Fallback to local storage for offline

### 4. Missing Configuration
**Status:** ⚠️ **INCOMPLETE**

**Problem:**
- No RevenueCat API keys configured
- No product IDs configured
- No entitlement ID configured

**Required Fix:**
- Add configuration (environment variables or config file)
- Configure API keys for iOS and Android
- Configure product IDs
- Configure entitlement ID

---

## ✅ Required Fixes

### Fix 1: Initialize RevenueCat in App

**Location:** `App.tsx` or create `RevenueCatProvider`

**Flow:**
1. Wait for Firebase Auth to create anonymous user
2. Get anonymous Firebase UID
3. Initialize RevenueCat with that UID
4. Check subscription status
5. Update SubscriptionContext

### Fix 2: Update AuthContext

**Location:** `contexts/AuthContext.tsx`

**Changes:**
- Import `revenueCatService`
- Replace `Purchases.logIn()` → `revenueCatService.logIn()`
- Replace `Purchases.logOut()` → `revenueCatService.logOut()`

### Fix 3: Integrate RevenueCat into SubscriptionContext

**Location:** `contexts/SubscriptionContext.tsx`

**Changes:**
- Import `revenueCatService`
- Check RevenueCat subscription status on mount
- Use RevenueCat for purchases
- Use RevenueCat for restore
- Sync with local storage for offline support

### Fix 4: Add Configuration

**Location:** Create `src/config/revenuecat.ts` or use environment variables

**Required:**
- iOS API key
- Android API key
- Entitlement ID
- Product IDs (monthly, yearly)

---

## 📋 Implementation Checklist

- [ ] Create RevenueCat configuration file
- [ ] Initialize RevenueCat in App.tsx with anonymous Firebase UID
- [ ] Update AuthContext to use revenueCatService
- [ ] Integrate RevenueCat into SubscriptionContext
- [ ] Test subscription purchase flow
- [ ] Test subscription restore flow
- [ ] Test identity linking on login
- [ ] Test offline subscription status

---

## 🎯 Correct Flow (Per Architecture)

### First Launch
```
App Opens
  ↓
AuthProvider creates anonymous Firebase UID
  ↓
RevenueCat initializes with anonymous UID
  ↓
RevenueCat checks subscription status
  ↓
SubscriptionContext updates from RevenueCat
  ↓
App ready
```

### Subscription Purchase
```
User taps "Upgrade to Pro"
  ↓
SubscriptionContext calls revenueCatService.purchasePackage()
  ↓
RevenueCat handles purchase
  ↓
SubscriptionContext updates from RevenueCat response
  ↓
Pro features unlocked instantly
```

### Login (Identity Linking)
```
User signs in
  ↓
Firebase links anonymous → authenticated
  ↓
AuthContext calls revenueCatService.logIn(firebaseUid)
  ↓
RevenueCat transfers subscription to authenticated user
  ↓
SubscriptionContext refreshes from RevenueCat
```

---

## ⚠️ Current State vs Required State

### Current (Wrong)
- ❌ RevenueCat not initialized
- ❌ AuthContext uses Purchases directly
- ❌ SubscriptionContext uses mocks
- ❌ No configuration

### Required (Correct)
- ✅ RevenueCat initialized on app launch
- ✅ AuthContext uses revenueCatService
- ✅ SubscriptionContext uses RevenueCat
- ✅ Configuration in place

