# Merchant Account Setup Guide

## Overview

Before you can create subscription products, you need to set up merchant accounts in both:
- **Google Play Console** (for Android subscriptions)
- **App Store Connect** (for iOS subscriptions)

This guide walks you through the merchant account setup process for both platforms.

---

## 🤖 Android - Google Play Console Merchant Account

### What You Need

- **Google Play Developer Account** (one-time $25 fee)
- **Business Information** (or Personal Information for individuals):
  - **Business**: Business name and address
  - **Individual**: Your legal name and address
  - Tax information (EIN for business, SSN for individuals in US)
  - Bank account details for payouts (can be personal account)
  - Contact information

### Step 1: Set Up Payments Profile

1. Go to [Google Play Console](https://play.google.com/console/)
2. Select your app: **Hydroly**
3. Navigate to **Monetize** → **Subscriptions**
4. You'll see a prompt: **"Set up payments profile"**
5. Click **Get Started** or **Set Up Payments Profile**

### Step 2: Provide Business/Personal Information

1. **Business/Personal Details**:
   - **For Business**: Business name and address
   - **For Individual**: Your legal name and personal address
   - Phone number
   - Website (optional)

2. **Tax Information**:
   - **US Individual Developers**: Provide SSN (Social Security Number)
   - **US Business**: Provide EIN (Employer Identification Number)
   - **International**: Provide tax ID for your country
   - Google will provide tax forms if needed

3. **Bank Account**:
   - **Can use personal bank account** (even for business)
   - Bank name
   - Account number
   - Routing number (US) or SWIFT code (international)
   - Account holder name (must match the name you provided above)

### Step 3: Complete Tax Forms

1. Google will provide tax forms based on your location:
   - **US**: W-9 form (for US tax residents)
   - **International**: May need to complete tax forms for your country

2. Fill out forms accurately:
   - Incorrect information can delay approval
   - Tax information is required for payouts

### Step 4: Verification Process

1. **Review Period**: 1-3 business days typically
2. Google may request additional documentation:
   - Business license
   - Bank statements
   - Tax documents
   - Proof of address

3. **Status Updates**:
   - Check **Monetize** → **Subscriptions** for status
   - You'll receive email notifications

### Step 5: Activate Merchant Account

1. Once approved, you'll see **"Merchant account active"**
2. You can now create subscription products
3. Proceed to create subscriptions (see `STORE_SETUP_GUIDE.md`)

### Important Notes for Android

- **One-time Setup**: Merchant account is per Google Play Developer account
- **Payout Schedule**: Monthly (around 15th of each month)
- **Minimum Payout**: $1 USD (or equivalent)
- **Fees**: Google takes 15-30% commission (15% for first $1M/year)

---

## 📱 iOS - App Store Connect Merchant Account

### What You Need

- **Apple Developer Account** ($99/year)
- **Business/Personal Information**:
  - **For Business**: Legal entity name + D-U-N-S Number
  - **For Individual**: Your legal name (NO D-U-N-S needed!)
  - Tax information (SSN for individuals, EIN for businesses in US)
  - Bank account details (can be personal account)
  - Contact information

### ✅ Individual Developer Advantage

**Good news**: As an individual developer, you **DO NOT need a D-U-N-S number**! This saves you 1-2 weeks of waiting time.

### Step 1: Access Agreements, Tax, and Banking

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click your name in the top right → **Agreements, Tax, and Banking**
3. You'll see **"Agreements"** section

### Step 2: Accept Paid Applications Agreement

1. Under **Agreements**, find **"Paid Applications Agreement"**
2. Click **Request Agreement** (if not already requested)
3. Read and accept the agreement:
   - Review terms and conditions
   - Accept on behalf of your organization
   - Click **Submit**

### Step 3: Complete Banking Information

1. Navigate to **Banking** section
2. Click **Add Bank Account** or **Edit**
3. Provide:
   - **Bank Name**
   - **Account Number**
   - **Routing Number** (US) or **SWIFT Code** (international)
   - **Account Holder Name** (must match legal entity)
   - **Account Type** (Checking/Savings)

4. **Verification**:
   - Apple may make small test deposits
   - Verify amounts in your bank account
   - Enter verification amounts in App Store Connect

### Step 4: Complete Tax Information

1. Navigate to **Tax** section
2. Select your **Country/Region**
3. **US Developers**:
   - Complete **W-9 form** (for US tax residents)
   - Provide EIN or SSN
   - Confirm tax classification

4. **International Developers**:
   - Complete tax forms for your country
   - May need to provide tax ID
   - Apple will guide you through country-specific requirements

### Step 5: Provide Business/Personal Information

1. Navigate to **Business Information** section
2. **For Businesses**:
   - Legal entity name
   - **D-U-N-S Number** (required for businesses)
     - Get free D-U-N-S number: [D&B D-U-N-S](https://www.dnb.com/duns-number.html)
     - Takes 1-2 weeks to process
   - Business address
   - Contact information

2. **For Individuals** (Recommended if you don't have a business):
   - Full legal name (your name)
   - **NO D-U-N-S Number needed!** ✅
   - SSN (for US individuals) or tax ID
   - Personal address
   - Contact information
   - **This is faster** - no waiting for D-U-N-S approval!

### Step 6: Verification Process

1. **Review Period**: 1-5 business days typically
2. Apple may request additional documentation:
   - Business registration documents
   - Bank statements
   - Tax documents
   - Proof of identity

3. **Status Updates**:
   - Check **Agreements, Tax, and Banking** for status
   - You'll receive email notifications

### Step 7: Activate Merchant Account

1. Once all sections show **"Complete"**:
   - Agreements: ✅ Active
   - Banking: ✅ Complete
   - Tax: ✅ Complete
   - Business Information: ✅ Complete

2. You can now create subscription products
3. Proceed to create subscriptions (see `STORE_SETUP_GUIDE.md`)

### Important Notes for iOS

- **D-U-N-S Number**: 
  - ✅ **NOT required for individuals** - You can proceed immediately!
  - ⚠️ Required only for businesses
  - Free to obtain from D&B (if needed)
  - Takes 1-2 weeks to process (if needed)
- **Individual vs Business**:
  - **Individual**: Use your name, SSN, personal bank account - Faster setup!
  - **Business**: Need D-U-N-S, EIN, business bank account - Slower setup
- **Payout Schedule**: Monthly (around 15th of each month)
- **Minimum Payout**: $10 USD (or equivalent)
- **Fees**: Apple takes 15-30% commission (15% for first $1M/year)

---

## ⏱️ Timeline Expectations

### Google Play Console
- **Setup Time**: 1-3 business days
- **Verification**: Usually automatic
- **Additional Docs**: May add 1-2 days if requested
- **Individual vs Business**: Same timeline for both

### App Store Connect
- **Individual Developer**: 1-3 business days ✅ (No D-U-N-S needed!)
- **Business Developer**: 1-5 business days + 1-2 weeks for D-U-N-S
- **Verification**: May require manual review
- **Additional Docs**: May add 2-3 days if requested

### Total Timeline
- **Individual Developer (Best Case)**: 1-3 days (both platforms) ✅
- **Individual Developer (Typical)**: 3-5 days
- **Business Developer**: 1-2 weeks (due to D-U-N-S requirement)
- **Worst Case**: 2-3 weeks (if additional documentation required)

---

## ✅ Checklist

### Google Play Console
- [ ] Payments profile created
- [ ] Business information provided
- [ ] Tax information completed
- [ ] Bank account added and verified
- [ ] Merchant account status: **Active**
- [ ] Can access **Monetize** → **Subscriptions**

### App Store Connect
- [ ] Paid Applications Agreement accepted
- [ ] Banking information added and verified
- [ ] Tax information completed (W-9 for US individuals/businesses)
- [ ] Business/Personal information provided
  - [ ] **Individual**: Legal name + SSN (NO D-U-N-S needed!)
  - [ ] **Business**: Business name + D-U-N-S number
- [ ] All sections show **Complete**
- [ ] Can access **Features** → **In-App Purchases**

---

## 🚨 Common Issues & Solutions

### Google Play Console

**Issue**: "Merchant account setup incomplete"
- **Solution**: Check all required fields are filled
- **Solution**: Verify bank account details are correct
- **Solution**: Complete tax forms if prompted

**Issue**: "Bank account verification failed"
- **Solution**: Double-check account number and routing number
- **Solution**: Ensure account holder name matches business name
- **Solution**: Contact bank to verify account is active

### App Store Connect

**Issue**: "D-U-N-S Number not found"
- **Solution**: **If you're an individual developer, you don't need D-U-N-S!**
- **Solution**: Use your personal name instead of business name
- **Solution**: For businesses: Wait 1-2 weeks after requesting D-U-N-S number
- **Solution**: Verify D-U-N-S number matches your business name exactly
- **Solution**: Contact D&B support if issues persist

**Issue**: "Bank account verification pending"
- **Solution**: Check bank account for test deposits
- **Solution**: Enter verification amounts in App Store Connect
- **Solution**: Contact bank if deposits don't appear

**Issue**: "Tax form rejected"
- **Solution**: Double-check all tax information
- **Solution**: Ensure EIN/SSN matches IRS records
- **Solution**: Contact Apple Developer Support if needed

---

## 📞 Support Resources

### Google Play Console
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Payment Profile Help](https://support.google.com/googleplay/android-developer/answer/6112435)
- Contact: [Google Play Console Support](https://support.google.com/googleplay/android-developer/contact/payments)

### App Store Connect
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Agreements, Tax, and Banking Help](https://help.apple.com/app-store-connect/#/devb57be10e7)
- Contact: [Apple Developer Support](https://developer.apple.com/contact/)

### RevenueCat
- [RevenueCat Documentation](https://docs.revenuecat.com/)
- [RevenueCat Support](https://community.revenuecat.com/)

---

## 🎯 Next Steps

Once your merchant accounts are active:

1. ✅ **Create Subscription Products** (see `STORE_SETUP_GUIDE.md`)
   - Create products in Google Play Console
   - Create products in App Store Connect

2. ✅ **Configure RevenueCat** (see `STORE_SETUP_GUIDE.md`)
   - Add products to RevenueCat Dashboard
   - Link products to entitlements

3. ✅ **Test Subscriptions**
   - Test in sandbox/test mode
   - Verify purchases work correctly

4. ✅ **Launch**
   - Submit app for review (iOS)
   - Publish app (Android)
   - Monitor subscription metrics

---

## 💡 Pro Tips

1. **Individual Developers Have an Advantage**:
   - ✅ **No D-U-N-S number needed** (saves 1-2 weeks!)
   - ✅ Can use personal bank account
   - ✅ Can use personal name
   - ✅ Faster approval process

2. **Start Early**: Set up merchant accounts as soon as possible
   - Don't wait until you're ready to launch
   - Approval can take time (but faster for individuals)

3. **Keep Documents Ready**:
   - **Individual**: SSN, bank statement, proof of address
   - **Business**: Business registration, EIN, bank statements, D-U-N-S
   - Tax ID numbers
   - Proof of address

4. **Double-Check Information**:
   - Incorrect information delays approval
   - Name must match across all documents (business name OR your name)
   - Bank account holder name must match the name you provided

4. **Monitor Status**:
   - Check email regularly for updates
   - Log into consoles daily during setup
   - Respond promptly to requests for additional information

5. **Test Before Launch**:
   - Always test subscriptions in sandbox/test mode
   - Verify RevenueCat integration works
   - Test subscription restoration

---

## 📝 Notes

- **Merchant accounts are permanent** - Once set up, they're tied to your developer account
- **One account per platform** - You don't need separate accounts for each app
- **Fees apply** - Both platforms take 15-30% commission (15% for first $1M/year)
- **Payouts are monthly** - You'll receive payments around the 15th of each month
- **Tax reporting** - Both platforms provide tax forms at year-end
