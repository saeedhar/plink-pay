# Sub-Wallet Selection - Frontend Updates

## ✅ Completed Updates

### 1. **WalletService** (`src/services/walletService.ts`)
All methods now accept optional `subWalletId` parameter:
- ✅ `getBalance(subWalletId?: string)` - Fetches balance for sub-wallet if provided
- ✅ `getStatus(subWalletId?: string)` - Fetches status for sub-wallet if provided
- ✅ `activateWallet(request, subWalletId?: string)` - Activates sub-wallet if provided
- ✅ `deactivateWallet(request, subWalletId?: string)` - Deactivates sub-wallet if provided
- ✅ `getLimits(subWalletId?: string)` - Returns limits (sub-wallets inherit from main wallet)

### 2. **TransactionService** (`src/services/transactionService.ts`)
- ✅ `getTransactionHistory(..., subWalletId?: string)` - Filters transactions by sub-wallet if provided
- ✅ `getWalletBalance(subWalletId?: string)` - Fetches balance for sub-wallet if provided

### 3. **DashboardWidgets** (`src/features/dashboard/components/DashboardWidgets.tsx`)
- ✅ Updated to pass `subWalletId` when fetching wallet balance
- ✅ Already supports sub-wallet data loading

### 4. **TransactionsTable** (`src/features/dashboard/components/TransactionsTable.tsx`)
- ✅ Updated to accept `subWalletId` and `isSubWallet` props
- ✅ Passes `subWalletId` to `getTransactionHistory()` when viewing a sub-wallet

### 5. **Dashboard** (`src/features/dashboard/pages/Dashboard.tsx`)
- ✅ Updated to pass `subWalletId` and `isSubWallet` to `TransactionsTable`

## 📋 Additional Considerations

### Header Component
The `Header` component shows "Total Balance" which currently always shows the main wallet balance. This is likely correct behavior (showing overall balance), but if you want it to reflect the selected sub-wallet, you would need to:
1. Pass `subWalletId` through context or location state
2. Update Header to accept and use `subWalletId`

### Wallet Page
The `Wallet.tsx` page (wallet management) currently loads main wallet data. If you want to support sub-wallet activation/deactivation from that page:
1. Update `loadWalletData()` to accept `subWalletId`
2. Pass `subWalletId` to `getStatus()` and `getBalance()`
3. Pass `subWalletId` to `activateWallet()` and `deactivateWallet()`

### Other Pages That Use Wallet Data
Check these pages if they need sub-wallet support:
- Transactions page (`/app/transactions`)
- OnHoldBalance page
- Any other pages that fetch wallet balance or transactions

## 🧪 Testing Checklist

When testing sub-wallet selection:

1. **Main Wallet View:**
   - ✅ Balance shows main wallet balance
   - ✅ Transactions show main wallet transactions
   - ✅ Activation/deactivation works on main wallet

2. **Sub-Wallet View:**
   - ✅ Balance shows sub-wallet balance (not main wallet)
   - ✅ Transactions show only sub-wallet transactions
   - ✅ Activation/deactivation works on sub-wallet
   - ✅ Limits show main wallet limits (sub-wallets inherit)

3. **Switching Between Wallets:**
   - ✅ Data updates correctly when switching
   - ✅ No stale data from previous wallet

## 📝 API Endpoints Used

All endpoints now support optional `?subWalletId={uuid}` parameter:

- `GET /api/v1/wallet/balance?subWalletId={id}`
- `GET /api/v1/wallet/status?subWalletId={id}`
- `POST /api/v1/wallet/activate?subWalletId={id}`
- `POST /api/v1/wallet/deactivate?subWalletId={id}`
- `GET /api/v1/wallet/limits?subWalletId={id}`
- `GET /api/v1/transactions?subWalletId={id}`
- `GET /api/v1/limits/current?subWalletId={id}`

## 🎯 Usage Example

```typescript
// Get main wallet balance
const balance = await WalletService.getBalance();

// Get sub-wallet balance
const subWalletBalance = await WalletService.getBalance(subWalletId);

// Get sub-wallet transactions
const transactions = await TransactionService.getTransactionHistory(
  0, 20, undefined, undefined, undefined, undefined, subWalletId
);

// Activate sub-wallet
await WalletService.activateWallet({ otp: '123456' }, subWalletId);
```

