# Store Setup Guide - App Store Connect & Google Play Console

## Overview

This guide walks you through setting up subscription products in:

- **App Store Connect** (iOS)
- **Google Play Console** (Android)
- **RevenueCat Dashboard** (linking)

---

## 📱 iOS - App Store Connect Setup

### Step 1: Create Subscription Group

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Select your app
3. Navigate to **Features** → **In-App Purchases**
4. Click **+** to create a subscription group
5. Name it: **"Hydroly Pro"**
6. Click **Create**

### Step 2: Create Subscription Products

#### Monthly Subscription

1. In your subscription group, click **+** to add subscription
2. **Product ID**: `com.hydroly.app.pro.monthly`
3. **Reference Name**: "Hydroly Pro Monthly"
4. **Subscription Duration**: 1 Month
5. **Price**: Set your price (e.g., $2.99)
6. **Localizations**: Add description and display name
7. Click **Create**

#### Yearly Subscription

1. Click **+** to add another subscription
2. **Product ID**: `com.hydroly.app.pro.yearly`
3. **Reference Name**: "Hydroly Pro Yearly"
4. **Subscription Duration**: 1 Year
5. **Price**: Set your price (e.g., $19.99)
6. **Localizations**: Add description and display name
7. Click **Create**

### Step 3: Configure Subscription Details

For each subscription:

1. **Subscription Information**:
   - Add description
   - Add promotional image (optional)
   - Set subscription duration

2. **Pricing and Availability**:
   - Set base price
   - Configure regional pricing (optional)
   - Set availability dates

3. **Review Information**:
   - Add review notes (for App Review)
   - Add screenshots (optional)

### Step 4: Submit for Review

1. Complete all required fields
2. Submit subscription group for review
3. Wait for approval (typically 24-48 hours)

---

## 🤖 Android - Google Play Console Setup

### Step 1: Create Base Plan

1. Go to [Google Play Console](https://play.google.com/console/)
2. Select your app
3. Navigate to **Monetize** → **Subscriptions**
4. Click **Create subscription**

### Step 2: Create Subscription Products

#### Monthly Subscription

1. **Product ID**: `com.hydroly.app.pro.monthly`
2. **Name**: "Hydroly Pro Monthly"
3. **Description**: Add subscription description
4. **Billing period**: 1 month
5. **Price**: Set your price (e.g., $2.99)
6. **Free trial**: Optional (e.g., 7 days)
7. Click **Save**

#### Yearly Subscription

1. **Product ID**: `com.hydroly.app.pro.yearly`
2. **Name**: "Hydroly Pro Yearly"
3. **Description**: Add subscription description
4. **Billing period**: 1 year
5. **Price**: Set your price (e.g., $19.99)
6. **Free trial**: Optional (e.g., 7 days)
7. Click **Save**

### Step 3: Activate Subscriptions

1. For each subscription, click **Activate**
2. Subscriptions must be active before they can be purchased
3. Note: Once activated, product ID cannot be changed

---

## 🔗 RevenueCat Dashboard Setup

### Step 1: Create Products

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com/)
2. Select your project
3. Navigate to **Products**
4. Click **+ New Product**

#### iOS Product

1. **Store**: App Store
2. **Product ID**: `com.hydroly.app.pro.monthly` (must match App Store Connect)
3. **Type**: Subscription
4. Click **Create**

Repeat for:

- `com.hydroly.app.pro.yearly` (iOS)

#### Android Product

1. **Store**: Google Play
2. **Product ID**: `com.hydroly.app.pro.monthly` (must match Google Play Console)
3. **Type**: Subscription
4. Click **Create**

Repeat for:

- `com.hydroly.app.pro.yearly` (Android)

### Step 2: Create Entitlement

1. Navigate to **Entitlements**
2. Click **+ New Entitlement**
3. **Identifier**: `pro`
4. **Display Name**: "Hydroly Pro"
5. Click **Create**

### Step 3: Link Products to Entitlement

1. Click on your entitlement (`pro`)
2. Under **Products**, click **+ Attach Product**
3. Select all your subscription products:
   - `com.hydroly.app.pro.monthly` (iOS)
   - `com.hydroly.app.pro.yearly` (iOS)
   - `com.hydroly.app.pro.monthly` (Android)
   - `com.hydroly.app.pro.yearly` (Android)
4. Click **Attach**

### Step 4: Create Offering (Optional but Recommended)

1. Navigate to **Offerings**
2. Click **+ New Offering**
3. **Identifier**: `default`
4. **Display Name**: "Hydroly Pro"
5. Under **Packages**, add:
   - Monthly package
   - Yearly package
6. Set one as **Default Package**
7. Click **Save**

---

## ✅ Verification Checklist

### App Store Connect

- [ ] Subscription group created
- [ ] Monthly subscription created with correct Product ID
- [ ] Yearly subscription created with correct Product ID
- [ ] All required fields completed
- [ ] Submitted for review
- [ ] Approved by Apple

### Google Play Console

- [ ] Monthly subscription created with correct Product ID
- [ ] Yearly subscription created with correct Product ID
- [ ] Subscriptions activated
- [ ] All required fields completed

### RevenueCat Dashboard

- [ ] All products created (iOS and Android)
- [ ] Entitlement created (`pro`)
- [ ] Products linked to entitlement
- [ ] Offering created (optional)
- [ ] API keys copied to `.env` file

### App Configuration

- [ ] Environment variables added to `.env` files
- [ ] Product IDs match store configurations
- [ ] Entitlement ID matches RevenueCat
- [ ] API keys configured

---

## 🧪 Testing

### Sandbox Testing (iOS)

1. Create sandbox test account in App Store Connect
2. Sign out of App Store on test device
3. Run app and attempt purchase
4. Sign in with sandbox account when prompted

### Test Accounts (Android)

1. Add test accounts in Google Play Console
2. Test purchases will use test accounts automatically
3. No need to sign out of Google account

### RevenueCat Test Mode

1. RevenueCat automatically uses sandbox/test purchases
2. Check RevenueCat Dashboard → **Customers** for test purchases
3. Verify entitlements are granted correctly

---

## 📝 Important Notes

1. **Product IDs are permanent** - Cannot be changed after creation
2. **Test before production** - Always test in sandbox/test mode first
3. **Approval time** - iOS subscriptions need App Review approval
4. **Matching IDs** - Product IDs must match exactly across:
   - App Store Connect / Google Play Console
   - RevenueCat Dashboard
   - Your `.env` file
   - Your app code

---

## 🔗 Resources

- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [RevenueCat Documentation](https://docs.revenuecat.com/)
- [RevenueCat iOS Setup](https://docs.revenuecat.com/docs/ios)
- [RevenueCat Android Setup](https://docs.revenuecat.com/docs/android)
