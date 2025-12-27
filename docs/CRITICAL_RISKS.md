# Critical Risks & Mitigation Plan

## 🔴 RISK #1: Day Boundary Must Be Wired EVERYWHERE

### Status: ⚠️ **INCOMPLETE** - Multiple violations found

### Audit Results

**Files Requiring Updates:**

1. ✅ `src/utils/dayBoundary.ts` - **CORRECT** (reference implementation)
2. ❌ `contexts/WaterContext.tsx` - Has TODO, still using manual logic
3. ❌ `src/hooks/useStreak.ts` - Multiple manual date calculations
4. ❌ `contexts/AchievementsContext.tsx` - Manual date logic
5. ❌ `src/features/history/HistoryScreen.tsx` - Manual date comparison

### Required Changes

#### 1. `contexts/WaterContext.tsx`

```typescript
// CURRENT (WRONG):
function getDateKey(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

// REQUIRED:
import {
  getCurrentHydrationDateKey,
  getHydrationDateKeyFromDate,
} from "@/src/utils/dayBoundary";
import { useSettings } from "./SettingsContext"; // Get startOfDayTime

function getDateKey(
  date: Date = new Date(),
  startOfDayTime: string = "06:00"
): string {
  return getHydrationDateKeyFromDate(date, startOfDayTime);
}
```

#### 2. `src/hooks/useStreak.ts`

- Replace all `setHours(0, 0, 0, 0)` with day boundary calls
- Replace all `toISOString().split("T")[0]` with day boundary calls
- Accept `startOfDayTime` parameter

#### 3. `contexts/AchievementsContext.tsx`

- Replace `new Date().toISOString().split('T')[0]` with `getCurrentHydrationDateKey()`

#### 4. `src/features/history/HistoryScreen.tsx`

- Replace `new Date().toISOString().split("T")[0]` with `getCurrentHydrationDateKey()`

### Checklist

- [ ] Update `WaterContext.getDateKey()` to use day boundary
- [ ] Update `useStreak` to accept and use `startOfDayTime`
- [ ] Update all `useStreak` call sites to pass `startOfDayTime` from settings
- [ ] Update `AchievementsContext` date logic
- [ ] Update `HistoryScreen` date comparisons
- [ ] Search codebase for any remaining manual date logic
- [ ] Test with different `startOfDayTime` values (5am, 6am, 9am)
- [ ] Verify streaks work correctly across day boundaries

### Impact if Not Fixed

- ❌ Double streaks on day boundary
- ❌ Missed days in calculations
- ❌ Timezone bugs
- ❌ Inconsistent data across screens

---

## 🔴 RISK #2: Realm Migration Needs One Dry Run

### Status: ⚠️ **NOT TESTED** - Migration script needed

### Required Actions

1. **Create Migration Test Script**
   - Simulate existing AsyncStorage data
   - Run migration once
   - Verify data integrity

2. **Test Checklist**
   - [ ] All hydration entries migrated
   - [ ] Daily records preserved
   - [ ] Goals intact
   - [ ] Streaks preserved
   - [ ] Profile data migrated
   - [ ] Settings migrated
   - [ ] Achievements migrated
   - [ ] No data loss
   - [ ] No duplicate entries

3. **Documentation Required**
   - Migration script location
   - Test results
   - Rollback procedure
   - Known issues

### Migration Test Script Location

**TODO:** Create `scripts/test-migration.ts`

```typescript
// Pseudo-code structure:
async function testMigration() {
  // 1. Create mock AsyncStorage data
  // 2. Run migration
  // 3. Verify all data in Realm
  // 4. Compare counts
  // 5. Verify relationships
  // 6. Report results
}
```

---

## 🔴 RISK #3: Premium Logic Must Be Server-Validated (Later)

### Status: ⚠️ **LOCAL ONLY** - Server validation needed for production

### Current State

- ✅ Premium flags are local (fine for v1)
- ✅ Basic subscription status in `SubscriptionContext`
- ⚠️ No server validation yet

### Future Requirements (Before Pro Launch)

1. **RevenueCat Integration**
   - RevenueCat must be source of truth
   - Local flags should expire/refresh
   - Validate on app launch
   - Validate before premium features

2. **Implementation Checklist**
   - [ ] Integrate RevenueCat SDK
   - [ ] Add server-side validation endpoint
   - [ ] Implement token refresh mechanism
   - [ ] Add expiration handling
   - [ ] Add offline grace period
   - [ ] Add validation logging
   - [ ] Test subscription edge cases

3. **Security Considerations**
   - Never trust client-only premium flags
   - Always validate server-side for critical features
   - Implement rate limiting
   - Log all premium feature access

### Documentation Location

**TODO:** Create `docs/PREMIUM_VALIDATION.md`

---

## 🔴 RISK #4: Friends / Leaderboard Should Stay Disabled

### Status: ⚠️ **PARTIALLY ENABLED** - Needs verification

### Current State

- ✅ `FriendsContext` exists (code present)
- ✅ `LeaderboardEntry` types defined
- ⚠️ Friends screen may be accessible via navigation
- ⚠️ Achievement screen has friends navigation

### Required Actions

1. **Verify Navigation**
   - [ ] Check if Friends tab is in `BottomTabNavigation`
   - [ ] Remove Friends tab if present
   - [ ] Disable friends navigation from Achievement screen
   - [ ] Add feature flag to disable friends features

2. **Code Cleanup (Optional)**
   - Keep `FriendsContext` code (for future use)
   - Add `FEATURE_FLAGS.FRIENDS_ENABLED = false`
   - Guard all friends features with flag
   - Document why it's disabled

3. **Future Considerations**
   - Social features require moderation
   - Require abuse handling
   - Trigger policy scrutiny (App Store/Play Store)
   - Ship without it, add later if traction justifies

### Verification Checklist

- [ ] Friends tab NOT in bottom navigation
- [ ] Friends screen NOT accessible via deep links
- [ ] Friends features guarded by feature flag
- [ ] No friends-related UI visible to users
- [ ] Friends code preserved but disabled

---

## 📋 Action Items Summary

### Immediate (Before Next Release)

1. **Day Boundary Wiring** (Critical)
   - [ ] Fix all date logic violations
   - [ ] Test thoroughly
   - [ ] Document changes

2. **Friends Feature Disable** (Critical)
   - [ ] Verify navigation
   - [ ] Add feature flags
   - [ ] Test user cannot access

### Before Public Launch

3. **Realm Migration Test** (High Priority)
   - [ ] Create test script
   - [ ] Run dry run
   - [ ] Document results

4. **Premium Validation** (High Priority)
   - [ ] Integrate RevenueCat
   - [ ] Add server validation
   - [ ] Test edge cases

---

## 🎯 Risk Priority

1. **🔴 CRITICAL**: Day Boundary Wiring (affects core functionality)
2. **🔴 CRITICAL**: Friends Feature Disable (policy risk)
3. **🟡 HIGH**: Realm Migration Test (data integrity)
4. **🟡 HIGH**: Premium Validation (revenue security)

---

## 📝 Notes

- Day boundary violations are the highest risk - fix immediately
- Friends feature should be completely disabled in navigation
- Migration test can be done in parallel with other work
- Premium validation is required before Pro launch, not v1
