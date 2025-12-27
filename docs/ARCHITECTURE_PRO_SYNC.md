# Pro User Sync Architecture

## 🎯 Mental Model

**Realm owns the data. Firebase owns identity. FastAPI owns value-added services.**

---

## 1️⃣ Firebase Responsibilities

### ✅ What Firebase Does

Firebase = Authentication + Identity Layer

**Firebase stores:**
- Firebase UID (user identity)
- Auth provider (Email, Apple, Google)
- Anonymous → registered mapping (account upgrade)
- Last login timestamp (security)
- Email verification status (compliance)
- Custom claims (optional feature flags)

### ❌ What Firebase Does NOT Do

Firebase does **NOT** store:
- Hydration entries
- Goals
- Streaks
- Achievements
- Daily logs
- Stats

**Why?**
- Firebase Auth is not designed for this
- Hard to migrate later
- Expensive at scale
- Weak querying for analytics

**Firebase = who the user is, not what they do.**

---

## 2️⃣ FastAPI Responsibilities

FastAPI = Premium Backend + Intelligence Layer

### What FastAPI Stores (Pro Users Only)

#### 1. User Account Record
```json
{
  "firebaseUid": "abc123",
  "tier": "pro",
  "createdAt": "...",
  "lastActiveAt": "..."
}
```

#### 2. Cloud Backup (Encrypted)
- Hydration entries (batched)
- Daily summaries
- Goals
- Profile
- Settings

**Purpose:**
- Device loss recovery
- Cross-device restore

**Format:**
- Versioned payload
- Encrypted on client before upload (optional but recommended)

#### 3. Aggregated Analytics (Derived Data)
- Weekly summaries
- Monthly summaries
- Yearly summaries
- Longest streak
- Confidence trends

**Why server-side?**
- Faster reports
- Reduced device computation
- AI-ready

#### 4. AI Coach Context (Future)
- Last advice given
- Trends detected
- Behavioral clusters
- Recovery mode history

### ❌ What FastAPI Should NOT Store
- Per-sip real-time data
- Notification schedules
- UI flags
- Feature experiment states

---

## 3️⃣ What NEVER Leaves the Device

### 🔒 Device-only Data
- Real-time hydration entries
- In-progress day calculations
- Reminder schedules
- Notification permissions
- Local streak counters (derived)
- Temporary recovery adjustments

**Why?**
- Offline-first
- Battery efficiency
- Privacy
- Reduced backend cost

---

## 4️⃣ Free vs Pro Sync Behavior

### 🆓 FREE USERS
- Realm only
- Firebase Auth (optional / anonymous)
- No cloud sync
- No FastAPI usage

**Their data lives and dies on the device.**

### 💎 PRO USERS
- Realm is still source of truth
- Periodic background sync to FastAPI
- Restore on new device
- Server-generated analytics available

**Sync is:**
- Batched
- Opportunistic
- Non-blocking

---

## 5️⃣ Login Strategy (CRITICAL)

### ❌ Login Should NEVER Be Required For:
- Using the app
- Subscribing to Pro
- Accessing Pro features after purchase

### ✅ Login Should Be Optional & Value-Driven

**Correct triggers for login:**

1. **Cloud Sync / Backup**
   - "Protect your data across devices"
   - Settings → "Sign in to back up your data"

2. **Device Change / Reinstall**
   - If Realm is empty but subscription exists
   - "Restore your Pro data by signing in"

3. **Friends / Social Features**
   - Achievements tab → "Friends" button
   - "Create an account to compare streaks"

4. **Explicit User Action**
   - Settings → "Sign in / Create account"

### Login Flow

```
Install App
   ↓
Anonymous User (Firebase creates anonymous UID)
   ↓
Uses App (Realm stores data)
   ↓
Subscribes (RevenueCat handles purchase)
   ↓
Pro Features Unlocked (instantly, no login)
   ↓
(Optional) Login Prompt (value-driven)
   ↓
Cloud Sync Enabled
```

### On Login Success

**Link identities, don't create new ones:**

```typescript
// RevenueCat: Transfer subscription to authenticated user
import { revenueCatService } from "@hydroly/revenuecat-service";
await revenueCatService.logIn(firebaseUid);
```

**FastAPI:**
- Verify Firebase ID token
- Create user record
- Mark tier = pro / free
- Enable sync endpoints

---

## 6️⃣ Exact Data Flow

### 📱 First Launch
1. User opens app
2. Realm initialized
3. Anonymous Firebase UID created
4. RevenueCat creates anonymous App User ID
5. No backend calls

### 💧 Logging Water (Offline)
1. User logs 500ml
2. Saved to Realm
3. Daily summary updated
4. UI updates instantly
5. **No network involved**

### 🔄 Pro User Background Sync

**Triggered when:**
- App goes to background
- Wi-Fi available
- X entries accumulated
- Manual sync

**Flow:**
1. Realm → prepare batch
2. Client encrypts payload
3. Send to FastAPI
4. Server validates token
5. Server stores snapshot
6. Server updates aggregates
7. Client marks entries as synced

### 📲 New Device Restore (Pro)
1. User logs in
2. App detects empty Realm
3. Fetch latest snapshot from FastAPI
4. Decrypt & hydrate Realm
5. Recalculate streaks locally

---

## 7️⃣ Conflict Resolution

**Keep it simple:**

- **Last write wins**
- Server timestamp used only for ordering
- Client is authoritative per day

**Why this works:**
- Hydration is additive
- Rare simultaneous edits
- Simple mental model

**No CRDTs or complex merging needed.**

---

## 8️⃣ Why This Split Is Optimal

### Firebase
- ✅ Best auth UX
- ✅ Handles Apple/Google sign-in
- ✅ Scales infinitely
- ✅ Zero password handling

### FastAPI
- ✅ Your business logic lives here
- ✅ AI-ready
- ✅ Cheap compared to Firebase DB
- ✅ Full control

### Realm
- ✅ Fast
- ✅ Offline-first
- ✅ Relational
- ✅ Future sync support

---

## 9️⃣ Common Mistakes Avoided

- ❌ Using Firebase Firestore for hydration logs
- ❌ Real-time sync for every sip
- ❌ Backend-dependent UI
- ❌ Locking free users out of offline use
- ❌ Overengineering conflict resolution

---

## 🔚 Summary

**Realm owns truth**  
**Firebase owns identity**  
**FastAPI owns intelligence & value**

This architecture:
- ✅ Works offline
- ✅ Scales cleanly
- ✅ Monetizes fairly
- ✅ Is policy-safe
- ✅ Is solo-dev friendly

