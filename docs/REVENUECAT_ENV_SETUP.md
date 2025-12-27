# RevenueCat Environment Variables Setup

## Required Environment Variables

Add these to your `.env` files (`.env.development`, `.env.staging`, `.env.production`):

```bash
# RevenueCat API Keys
# Get these from RevenueCat Dashboard → Project Settings → API Keys
REVENUECAT_IOS_API_KEY=your_ios_api_key_here
REVENUECAT_ANDROID_API_KEY=your_android_api_key_here

# RevenueCat Entitlement ID
# Get this from RevenueCat Dashboard → Entitlements
REVENUECAT_ENTITLEMENT_ID=pro

# Product IDs (iOS)
# These must match your products in App Store Connect
IOS_PRODUCT_MONTHLY_ID=com.hydroly.app.pro.monthly
IOS_PRODUCT_YEARLY_ID=com.hydroly.app.pro.yearly

# Product IDs (Android)
# These must match your products in Google Play Console
ANDROID_PRODUCT_MONTHLY_ID=com.hydroly.app.pro.monthly
ANDROID_PRODUCT_YEARLY_ID=com.hydroly.app.pro.yearly
```

## How to Get RevenueCat API Keys

1. Go to [RevenueCat Dashboard](https://app.revenuecat.com/)
2. Select your project (or create one)
3. Navigate to **Project Settings** → **API Keys**
4. Copy the **Public API Key** for iOS and Android
5. Paste into your `.env` file

## How to Get Entitlement ID

1. Go to RevenueCat Dashboard
2. Navigate to **Entitlements**
3. Create or select your entitlement (e.g., "pro")
4. Copy the entitlement identifier
5. Paste into `REVENUECAT_ENTITLEMENT_ID`

## Product ID Format

Product IDs must follow this format:

- **iOS**: `com.hydroly.app.pro.monthly` (matches App Store Connect)
- **Android**: `com.hydroly.app.pro.monthly` (matches Google Play Console)

**Important:**

- Product IDs are case-sensitive
- Must match exactly what's in App Store Connect / Google Play Console
- Must match what's configured in RevenueCat Dashboard

## Environment-Specific Configuration

### Development

```bash
# .env.development
REVENUECAT_IOS_API_KEY=ios_dev_key
REVENUECAT_ANDROID_API_KEY=android_dev_key
REVENUECAT_ENTITLEMENT_ID=pro
```

### Staging

```bash
# .env.staging
REVENUECAT_IOS_API_KEY=ios_staging_key
REVENUECAT_ANDROID_API_KEY=android_staging_key
REVENUECAT_ENTITLEMENT_ID=pro
```

### Production

```bash
# .env.production
REVENUECAT_IOS_API_KEY=ios_prod_key
REVENUECAT_ANDROID_API_KEY=android_prod_key
REVENUECAT_ENTITLEMENT_ID=pro
```

## Verification

After adding environment variables:

1. Restart your development server
2. Check console logs for RevenueCat initialization
3. Verify API keys are loaded (check `src/config/revenuecat.ts`)

## Troubleshooting

### "No RevenueCat API key found"

- Check that `.env` file exists in project root
- Verify variable names match exactly (case-sensitive)
- Restart Metro bundler after adding variables

### "Products not found"

- Verify product IDs match App Store Connect / Google Play Console
- Check that products are configured in RevenueCat Dashboard
- Ensure products are linked to the entitlement

### "Entitlement not found"

- Verify entitlement ID matches RevenueCat Dashboard
- Check that entitlement is linked to products
- Ensure entitlement is active
