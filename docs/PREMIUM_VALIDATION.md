# Premium Validation Strategy

## Current State (v1)

- ✅ Premium flags are local (acceptable for MVP)
- ✅ Basic subscription status in `SubscriptionContext`
- ⚠️ No server validation yet

## Future Requirements (Before Pro Launch)

### Critical: Server-Side Validation Required

**Why:**

- Client-only flags can be bypassed
- RevenueCat must be source of truth
- Prevents subscription fraud
- Required for App Store/Play Store compliance

---

## Implementation Plan

### Phase 1: RevenueCat Integration

#### 1.1 SDK Setup

- [ ] Install RevenueCat SDK
- [ ] Configure API keys
- [ ] Set up product identifiers
- [ ] Configure entitlements

#### 1.2 Basic Integration

- [ ] Initialize RevenueCat on app launch
- [ ] Fetch customer info
- [ ] Check subscription status
- [ ] Handle subscription changes

#### 1.3 Local Caching

- [ ] Cache subscription status locally
- [ ] Set expiration time (e.g., 1 hour)
- [ ] Refresh on app launch
- [ ] Refresh before premium feature access

### Phase 2: Server Validation

#### 2.1 Validation Endpoint

- [ ] Create server endpoint for validation
- [ ] Validate RevenueCat receipt
- [ ] Return subscription status
- [ ] Add rate limiting

#### 2.2 Client Implementation

- [ ] Call validation endpoint on launch
- [ ] Validate before premium features
- [ ] Handle validation failures
- [ ] Implement retry logic

#### 2.3 Security

- [ ] Never trust client-only flags
- [ ] Always validate server-side for critical features
- [ ] Implement token-based validation
- [ ] Log all premium feature access

### Phase 3: Edge Cases

#### 3.1 Offline Handling

- [ ] Grace period for offline access (e.g., 24 hours)
- [ ] Cache last validation timestamp
- [ ] Show offline indicator
- [ ] Re-validate when online

#### 3.2 Subscription Changes

- [ ] Handle subscription cancellation
- [ ] Handle subscription renewal
- [ ] Handle subscription upgrade/downgrade
- [ ] Handle refunds

#### 3.3 Error Handling

- [ ] Network errors
- [ ] Invalid receipts
- [ ] Expired subscriptions
- [ ] Server errors

---

## Code Structure

### Subscription Service

```typescript
// src/services/subscriptionService.ts

interface SubscriptionStatus {
  isActive: boolean;
  tier: "free" | "pro" | "pro_plus";
  expiresAt: number;
  lastValidated: number;
  source: "local" | "revenuecat" | "server";
}

class SubscriptionService {
  // Validate with RevenueCat
  async validateWithRevenueCat(): Promise<SubscriptionStatus>;

  // Validate with server
  async validateWithServer(): Promise<SubscriptionStatus>;

  // Get cached status (with expiration check)
  getCachedStatus(): SubscriptionStatus | null;

  // Check if premium feature is accessible
  canAccessPremiumFeature(feature: string): boolean;
}
```

### Validation Flow

```
App Launch
    ↓
Check Cache (valid & not expired?)
    ↓ Yes → Use cached
    ↓ No
Validate with RevenueCat
    ↓
Update Cache
    ↓
Validate with Server (optional, for critical features)
    ↓
Update Cache
```

### Premium Feature Access

```typescript
// Before accessing premium feature:
const subscription = await subscriptionService.validateWithRevenueCat();
if (!subscription.isActive || subscription.tier === "free") {
  // Show paywall
  return;
}

// Access feature
```

---

## Security Checklist

- [ ] RevenueCat API keys stored securely (not in code)
- [ ] Server validation endpoint requires authentication
- [ ] Rate limiting on validation endpoint
- [ ] Logging for all premium feature access
- [ ] No client-side premium bypass possible
- [ ] Subscription status encrypted in storage
- [ ] Receipt validation on server
- [ ] Handle subscription fraud attempts

---

## Testing Requirements

### Unit Tests

- [ ] Subscription status caching
- [ ] Expiration logic
- [ ] Validation retry logic
- [ ] Offline grace period

### Integration Tests

- [ ] RevenueCat SDK integration
- [ ] Server validation endpoint
- [ ] Subscription lifecycle (purchase, cancel, renew)
- [ ] Edge cases (network errors, invalid receipts)

### Manual Tests

- [ ] Purchase subscription
- [ ] Cancel subscription
- [ ] Renew subscription
- [ ] Offline access
- [ ] Expired subscription
- [ ] Invalid receipt handling

---

## Timeline

### v1 (Current)

- ✅ Local premium flags (acceptable)
- ⚠️ No server validation

### v1.1 (Before Pro Launch)

- [ ] RevenueCat integration
- [ ] Basic server validation
- [ ] Offline grace period

### v1.2 (Post-Launch)

- [ ] Enhanced security
- [ ] Advanced fraud detection
- [ ] Analytics integration

---

## Notes

- **Never trust client-only flags** for revenue-critical features
- **Always validate server-side** before granting premium access
- **Implement grace period** for offline scenarios
- **Log everything** for debugging and fraud detection
- **Test thoroughly** before Pro launch

---

## Resources

- [RevenueCat Documentation](https://docs.revenuecat.com/)
- [App Store Subscription Guidelines](https://developer.apple.com/app-store/review/guidelines/#subscriptions)
- [Play Store Subscription Guidelines](https://developer.android.com/google/play/billing/subscriptions)
