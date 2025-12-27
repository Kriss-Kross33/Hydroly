# Storage Strategy: Realm vs AsyncStorage

## Clear Boundaries

### ✅ Realm (Domain Data)

**Purpose**: All user-generated domain data that needs querying, relationships, and complex operations.

**What Goes Here:**

- ✅ Hydration entries (`WaterIntake`)
- ✅ Daily records (`DayRecord`)
- ✅ Goals (`DailyGoal`, `HydrationGoal`)
- ✅ User profile (`UserProfile`)
- ✅ App settings (`AppSettings`)
- ✅ Achievements/Badges (`Badge`)
- ✅ Streak state (`Streak`)
- ✅ Friends/Leaderboard data
- ✅ Monthly/Yearly reports (cached)

**Why Realm:**

- Complex queries (e.g., "all entries in last 7 days")
- Relationships (e.g., entries → daily records)
- Performance for large datasets
- Offline-first architecture
- Future sync capabilities

---

### ✅ AsyncStorage (Flags & Bootstrap Only)

**Purpose**: App state flags, migration tracking, and temporary bootstrap data.

**What Stays Here:**

- ✅ `onboardingCompleted` - One-time flag
- ✅ `lastMigrationVersion` - Migration tracking
- ✅ `lastSubscriptionCheck` - Cache timestamp
- ✅ `featureFlags` - Remote config overrides
- ✅ `appVersion` - Version tracking
- ✅ `hasSeenTutorial` - UI state flags

**Why AsyncStorage:**

- Simple key-value storage
- Fast reads for flags
- No querying needed
- Temporary/transient data

---

## Migration Path

### Current State

- Most data in AsyncStorage (temporary)
- Realm schemas defined but not fully utilized

### Target State

- All domain data in Realm
- AsyncStorage only for flags

### Migration Steps

1. Create Realm repositories for each domain
2. Migrate data from AsyncStorage → Realm on first launch
3. Update hooks to use Realm repositories
4. Remove AsyncStorage usage for domain data

---

## Data Flow

```
User Action
    ↓
Hook (Business Logic)
    ↓
Repository (Data Access Layer)
    ├── RealmRepository → Realm DB
    └── AsyncStorage → Flags only
    ↓
Storage Layer
```

---

## Implementation Notes

### Hooks Should NOT Directly Persist

- Hooks calculate and validate
- Repositories handle persistence
- Clear separation of concerns

### Example Pattern:

```typescript
// ❌ BAD: Hook doing persistence
const useWater = () => {
  const save = async (data) => {
    await AsyncStorage.setItem('key', JSON.stringify(data));
  };
};

// ✅ GOOD: Repository handles persistence
const waterRepository = new RealmRepository(...);
const useWater = () => {
  const save = (data) => waterRepository.create(data);
};
```

---

## Future Considerations

### Sync Strategy

- Realm Sync for cloud backup (premium feature)
- Conflict resolution for multi-device
- Offline-first, sync when online

### Performance

- Realm indexes for common queries
- Cached aggregations (daily totals, streaks)
- Lazy loading for history
