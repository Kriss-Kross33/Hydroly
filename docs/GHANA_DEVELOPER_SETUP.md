# Ghana Developer Setup Guide

## Quick Start for Ghanaian Developers

This guide is specifically tailored for developers from Ghana setting up merchant accounts for subscriptions.

---

## 🇬🇭 Ghana-Specific Requirements

### What You Need

- ✅ **Ghana TIN** (Tax Identification Number)
  - Get from [Ghana Revenue Authority (GRA)](https://www.gra.gov.gh/tin-registration/)
  - Free to obtain
  - Required for receiving international payments
  
- ✅ **Personal Ghanaian Bank Account**
  - Must support international SWIFT transfers
  - SWIFT/BIC code required
  
- ✅ **Government-Issued ID**
  - Ghana National ID Card OR
  - Ghana Passport
  
- ✅ **Proof of Address**
  - Utility bill, bank statement, or official document
  - Must show your Ghana address

---

## 🤖 Android - Google Play Console (Ghana)

### Step 1: Get Your Ghana TIN (If You Don't Have One)

1. Visit [GRA TIN Registration](https://www.gra.gov.gh/tin-registration/)
2. Complete online registration
3. Submit required documents:
   - National ID or Passport
   - Proof of address
4. Receive your TIN (usually within a few days)

### Step 2: Set Up Payments Profile

1. Go to [Google Play Console](https://play.google.com/console/)
2. Select your app: **Hydroly**
3. Navigate to **Monetize** → **Subscriptions**
4. Click **"Set up payments profile"**

### Step 3: Provide Information

**Personal Information**:
- **Name**: Your legal name (as on ID)
- **Address**: Your Ghana address
- **Country**: Ghana
- **Phone**: +233 [your number]
- **Email**: Your email

**Tax Information**:
- **Country**: Ghana
- **Tax ID**: Your Ghana TIN
- Complete Ghana tax forms provided by Google

**Bank Account**:
- **Bank Name**: Your bank (e.g., GCB Bank, Ecobank, etc.)
- **Account Number**: Your account number
- **SWIFT/BIC Code**: Your bank's SWIFT code (see list below)
- **Account Holder Name**: Your name (must match above)
- **Currency**: GHS or USD (if you have USD account)

### Step 4: Common Ghanaian Bank SWIFT Codes

| Bank | SWIFT Code |
|------|------------|
| GCB Bank | GCBGGHAC |
| Ecobank | ECOCGHAC |
| Standard Chartered | SCBLGHAC |
| Absa Bank | BARCGHAC |
| Fidelity Bank | FBLIGHAC |
| Stanbic Bank | SBICGHAC |
| CalBank | CALBGHAC |
| Zenith Bank | ZEBLGHAC |
| UBA Ghana | UNAFGHAC |
| Access Bank | ABNGGHAC |

**Note**: If your bank is not listed, contact your bank directly for the SWIFT code.

### Step 5: Submit and Wait

- Review all information carefully
- Submit for approval
- **Timeline**: 1-3 business days typically
- Google may request additional documents

---

## 📱 iOS - App Store Connect (Ghana)

### Step 1: Get Your Ghana TIN (If You Don't Have One)

Same as Android - get your TIN from [GRA](https://www.gra.gov.gh/tin-registration/)

### Step 2: Set Up Merchant Account

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click your name → **Agreements, Tax, and Banking**
3. Click **Request Agreement** for Paid Applications

### Step 3: Accept Agreement

- Read Paid Applications Agreement
- Accept on behalf of yourself (as an individual)
- Click **Submit**

### Step 4: Complete Banking Information

1. Click **Add Bank Account**
2. Provide:
   - **Bank Name**: Your Ghanaian bank
   - **Account Number**: Your account number
   - **SWIFT/BIC Code**: Your bank's SWIFT code
   - **Account Holder Name**: Your name
   - **Currency**: GHS or USD
3. Apple will make small test deposits
4. Verify amounts when they appear (may take 1-2 days)

### Step 5: Complete Tax Information

1. Select **Ghana** as your country
2. Complete tax forms:
   - **Name**: Your legal name
   - **Ghana TIN**: Your Tax Identification Number
   - **Address**: Your Ghana address
   - **Tax Classification**: Individual
3. Submit tax form

### Step 6: Complete Business Information

1. Navigate to **Business Information**
2. Select **"Individual"** (not "Business")
3. Provide:
   - **Legal Name**: Your full name
   - **Address**: Your Ghana address
   - **Phone**: +233 [your number]
   - **Email**: Your email
   - **Country**: Ghana
4. **NO D-U-N-S Number needed!** ✅
5. Save information

### Step 7: Wait for Approval

- **Timeline**: 1-3 business days
- Check status regularly
- You'll receive email updates

---

## 💰 Currency & Payment Considerations

### Payment Currency

- **Apple/Google pay in USD** (US Dollars)
- Your bank will convert to GHS (Ghana Cedis) if you have a GHS account
- If you have a USD account, you can receive payments in USD

### Bank Conversion

- **Exchange Rate**: Your bank will use their exchange rate
- **Fees**: Check your bank's fees for:
  - International wire transfers
  - Currency conversion (if applicable)
  - Account maintenance fees

### Minimum Payouts

- **Google Play**: $1 USD minimum
- **Apple App Store**: $10 USD minimum
- Payouts happen monthly (around 15th of each month)

### Tax Withholding

- Apple/Google may withhold taxes depending on:
  - Tax treaties between Ghana and US
  - Your tax status
  - Amount earned
- Consult GRA or tax professional for details

---

## 📋 Checklist for Ghanaian Developers

### Before You Start

- [ ] Get Ghana TIN from GRA (if you don't have one)
- [ ] Verify your bank supports SWIFT transfers
- [ ] Get your bank's SWIFT code
- [ ] Have government-issued ID ready
- [ ] Have proof of address ready

### Google Play Console

- [ ] Payments profile created
- [ ] Personal information provided (Ghana address)
- [ ] Ghana TIN provided
- [ ] Ghanaian bank account added with SWIFT code
- [ ] Tax forms completed for Ghana
- [ ] Merchant account status: **Active**

### App Store Connect

- [ ] Paid Applications Agreement accepted
- [ ] Ghanaian bank account added with SWIFT code
- [ ] Test deposits verified
- [ ] Tax forms completed (Ghana TIN)
- [ ] Business Information set to **"Individual"**
- [ ] Ghana address provided
- [ ] All sections show **Complete**

---

## 🚨 Common Issues & Solutions

### Issue: "Don't have a TIN"

**Solution**:
1. Visit [GRA TIN Registration](https://www.gra.gov.gh/tin-registration/)
2. Complete online registration
3. Submit required documents
4. Wait for TIN (usually 2-5 business days)
5. Use TIN when setting up merchant accounts

### Issue: "Bank doesn't support SWIFT transfers"

**Solution**:
1. Contact your bank to verify SWIFT support
2. If not supported, consider opening account with bank that does:
   - GCB Bank
   - Ecobank
   - Standard Chartered
   - Other major banks
3. Some banks may require additional documentation for international transfers

### Issue: "Don't know my bank's SWIFT code"

**Solution**:
1. Check the list above for common banks
2. Contact your bank directly
3. Check your bank's website
4. Look on your bank statements (sometimes printed)

### Issue: "Test deposits not appearing"

**Solution**:
1. Wait 1-2 business days (international transfers take time)
2. Check with your bank if deposits are pending
3. Verify account number and SWIFT code are correct
4. Contact Apple/Google support if still not appearing after 3 days

### Issue: "Currency conversion concerns"

**Solution**:
1. Consider opening a USD account if you expect significant income
2. Compare exchange rates between banks
3. Check bank fees for currency conversion
4. Some banks offer better rates for larger amounts

---

## 💡 Pro Tips for Ghanaian Developers

1. **Get TIN First**:
   - Don't wait - get your TIN before starting setup
   - It's free and required for international payments

2. **Choose the Right Bank**:
   - Use a bank with good SWIFT support
   - Consider USD account if you expect significant income
   - Compare fees between banks

3. **Keep Records**:
   - Track all income (in USD and GHS equivalent)
   - Save bank statements
   - Keep receipts for business expenses

4. **Tax Planning**:
   - Consult GRA or tax professional
   - Understand your tax obligations
   - Set aside funds for taxes

5. **Bank Communication**:
   - Inform your bank about expected international transfers
   - Some banks may flag large transfers initially
   - Keep bank contact information handy

---

## 📞 Support Resources

### Ghana Revenue Authority (GRA)

- **Website**: [www.gra.gov.gh](https://www.gra.gov.gh/)
- **TIN Registration**: [GRA TIN Registration](https://www.gra.gov.gh/tin-registration/)
- **Contact**: Check GRA website for regional offices

### Google Play Console

- [Payment Profile Help](https://support.google.com/googleplay/android-developer/answer/6112435)
- [Contact Support](https://support.google.com/googleplay/android-developer/contact/payments)

### App Store Connect

- [Agreements, Tax, and Banking Help](https://help.apple.com/app-store-connect/#/devb57be10e7)
- [Contact Apple Developer Support](https://developer.apple.com/contact/)

---

## ✅ Summary

**As a Ghanaian individual developer, you need:**

1. ✅ **Ghana TIN** - Get from GRA (free, required)
2. ✅ **Ghanaian bank account** with SWIFT code
3. ✅ **Government-issued ID** (National ID or Passport)
4. ✅ **Proof of address** in Ghana

**You can:**
- ✅ Use your personal name (no business needed)
- ✅ Use your personal bank account
- ✅ Skip D-U-N-S number (individual developers)
- ✅ Set up in 1-3 days (after getting TIN)

**Timeline:**
- **Get TIN**: 2-5 business days (if you don't have one)
- **Set up merchant accounts**: 1-3 business days each
- **Total**: 3-8 business days (depending on TIN timing)

**You're ready to start!** 🚀

---

## 🎯 Next Steps

1. ✅ Get your Ghana TIN (if you don't have one)
2. ✅ Verify your bank's SWIFT code
3. ✅ Set up Google Play Console merchant account
4. ✅ Set up App Store Connect merchant account
5. ✅ Create subscription products (see `STORE_SETUP_GUIDE.md`)
6. ✅ Configure RevenueCat (see `STORE_SETUP_GUIDE.md`)
7. ✅ Test subscriptions
8. ✅ Launch your app!
