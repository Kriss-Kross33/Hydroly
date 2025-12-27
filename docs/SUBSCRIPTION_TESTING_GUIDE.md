# Subscription Testing Guide

## Overview

This guide covers testing the end-to-end subscription flow for Hydroly, including:

- RevenueCat integration
- Purchase flow
- Restore flow
- Identity linking
- Offline behavior

---

## 🧪 Test Scenarios

### 1. First Launch (Anonymous User)

**Expected Flow:**

```
App Opens
  ↓
Firebase creates anonymous UID
  ↓
RevenueCat initializes with anonymous UID
  ↓
Subscription status: Free
  ↓
App ready to use
```

**Test Steps:**

1. Fresh install app
2. Check console logs for:
   - `[AuthContext] Anonymous user created`
   - `[RevenueCatProvider] RevenueCat initialized`
   - `[SubscriptionContext] Subscription status: free`

**Verification:**

- ✅ No login screen appears
- ✅ App is usable immediately
- ✅ Subscription status is "free"
- ✅ Free features work

---

### 2. Subscription Purchase (No Login)

**Expected Flow:**

```
User taps "Upgrade to Pro"
  ↓
RevenueCat offerings fetched
  ↓
User selects package
  ↓
Store purchase flow
  ↓
Purchase successful
  ↓
Pro features unlocked instantly
  ↓
No login required
```

**Test Steps:**

1. Open app (anonymous user)
2. Navigate to paywall/settings
3. Tap "Upgrade to Pro"
4. Select monthly or yearly
5. Complete purchase in sandbox/test mode
6. Verify pro features unlock

**Verification:**

- ✅ Purchase completes without login
- ✅ Pro features unlock immediately
- ✅ Subscription status updates to "pro"
- ✅ Features accessible

**Test Accounts:**

- **iOS**: Use sandbox test account
- **Android**: Use test account from Play Console

---

### 3. Restore Purchases

**Expected Flow:**

```
User taps "Restore Purchases"
  ↓
RevenueCat.restorePurchases() called
  ↓
RevenueCat checks store for purchases
  ↓
Subscription restored if found
  ↓
Pro features unlocked
```

**Test Steps:**

1. Purchase subscription on Device A
2. Install app on Device B (or reinstall)
3. Tap "Restore Purchases"
4. Sign in with same test account
5. Verify subscription restores

**Verification:**

- ✅ Subscription restores correctly
- ✅ Pro features unlock
- ✅ Subscription status updates

---

### 4. Login After Purchase (Identity Linking)

**Expected Flow:**

```
User has active subscription (anonymous)
  ↓
User signs in
  ↓
Firebase links anonymous → authenticated
  ↓
RevenueCat.logIn(firebaseUid) called
  ↓
Subscription transfers to authenticated user
  ↓
Subscription preserved
```

**Test Steps:**

1. Purchase subscription as anonymous user
2. Verify pro features work
3. Sign in with email/Google/Apple
4. Verify subscription still active
5. Check RevenueCat Dashboard for user

**Verification:**

- ✅ Subscription preserved after login
- ✅ Pro features still work
- ✅ RevenueCat user ID updated
- ✅ No duplicate charges

---

### 5. Purchase After Login

**Expected Flow:**

```
User is logged in
  ↓
User purchases subscription
  ↓
Purchase linked to authenticated user
  ↓
Pro features unlocked
```

**Test Steps:**

1. Sign in to app
2. Navigate to paywall
3. Purchase subscription
4. Verify purchase linked to account

**Verification:**

- ✅ Purchase linked to Firebase UID
- ✅ Subscription visible in RevenueCat Dashboard
- ✅ Pro features unlock

---

### 6. Subscription Status Check

**Expected Flow:**

```
App loads
  ↓
SubscriptionContext checks RevenueCat
  ↓
Status updated from RevenueCat
  ↓
Local storage synced
```

**Test Steps:**

1. Have active subscription
2. Close and reopen app
3. Check subscription status
4. Verify status matches RevenueCat

**Verification:**

- ✅ Status checked from RevenueCat
- ✅ Local storage synced
- ✅ UI reflects correct status

---

### 7. Offline Behavior

**Expected Flow:**

```
App offline
  ↓
RevenueCat check fails
  ↓
Fallback to local storage
  ↓
Features work based on cached status
```

**Test Steps:**

1. Have active subscription
2. Enable airplane mode
3. Close and reopen app
4. Verify pro features still work
5. Re-enable network
6. Verify sync happens

**Verification:**

- ✅ App works offline
- ✅ Cached subscription status used
- ✅ Syncs when online

---

### 8. Subscription Expiration

**Expected Flow:**

```
Subscription expires
  ↓
RevenueCat status check returns expired
  ↓
Subscription status updated to free
  ↓
Pro features locked
```

**Test Steps:**

1. Have active subscription
2. Wait for expiration (or use test account)
3. Check subscription status
4. Verify pro features locked

**Verification:**

- ✅ Status updates to "free"
- ✅ Pro features locked
- ✅ User can repurchase

---

## 🔍 Debugging Checklist

### Check RevenueCat Initialization

```typescript
// Should see in console:
[RevenueCatProvider] RevenueCat initialized with UID: <firebase_uid>
```

### Check Subscription Status

```typescript
// In SubscriptionContext, check:
const status = await revenueCatService.checkSubscriptionStatus();
console.log("Status:", status);
```

### Check Offerings

```typescript
// Should return offerings with packages:
const offering = await revenueCatService.getOfferings();
console.log("Packages:", offering?.availablePackages);
```

### Check Customer Info

```typescript
// Should show active entitlements:
const customerInfo = await revenueCatService.getCustomerInfo();
console.log("Entitlements:", customerInfo.entitlements.active);
```

---

## 🐛 Common Issues & Solutions

### Issue: "No offerings available"

**Solution:**

- Check products are created in RevenueCat Dashboard
- Verify products are linked to entitlement
- Check offering is created and set as current

### Issue: "Purchase fails silently"

**Solution:**

- Check sandbox/test account is signed in
- Verify products are approved (iOS) or activated (Android)
- Check RevenueCat Dashboard for errors

### Issue: "Subscription not restoring"

**Solution:**

- Verify same test account is used
- Check RevenueCat Dashboard for customer
- Ensure restore is called correctly

### Issue: "Identity not linking"

**Solution:**

- Check Firebase Auth is working
- Verify `revenueCatService.logIn()` is called
- Check RevenueCat Dashboard for user merge

---

## 📊 Test Matrix

| Scenario             | iOS Sandbox | Android Test | Expected Result           |
| -------------------- | ----------- | ------------ | ------------------------- |
| First launch         | ✅          | ✅           | Anonymous user, free tier |
| Purchase monthly     | ✅          | ✅           | Pro features unlock       |
| Purchase yearly      | ✅          | ✅           | Pro features unlock       |
| Restore purchases    | ✅          | ✅           | Subscription restores     |
| Login after purchase | ✅          | ✅           | Subscription preserved    |
| Purchase after login | ✅          | ✅           | Subscription linked       |
| Offline access       | ✅          | ✅           | Cached status works       |
| Expiration           | ✅          | ✅           | Status updates to free    |

---

## ✅ Pre-Production Checklist

- [ ] All test scenarios pass
- [ ] Sandbox purchases work (iOS)
- [ ] Test purchases work (Android)
- [ ] Restore works on both platforms
- [ ] Identity linking works
- [ ] Offline behavior works
- [ ] Error handling works
- [ ] UI updates correctly
- [ ] RevenueCat Dashboard shows correct data
- [ ] No console errors

---

## 🚀 Production Readiness

Before launching:

1. ✅ All products approved/activated
2. ✅ RevenueCat configured correctly
3. ✅ Environment variables set
4. ✅ All test scenarios pass
5. ✅ Error handling tested
6. ✅ Offline behavior verified
7. ✅ Identity linking tested
8. ✅ Restore flow tested

---

## 📝 Test Log Template

```
Test Date: ___________
Tester: ___________
Platform: iOS / Android
Build: ___________

Test Scenario: ___________
Steps Taken: ___________
Expected Result: ___________
Actual Result: ___________
Status: Pass / Fail
Notes: ___________
```
