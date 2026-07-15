# Quick Start Guide

## What's New

### 1. Merged "Hubungi Pelanggan" Button ✅
- **Location**: Main Pelanggan page (replaces separate Export + Add to Leads buttons)
- **Action**: Click → Confirmation dialog → Confirmation → Auto-export CSV + tag to leads
- **Result**: "Berhasil diekspor. X pelanggan ditambahkan ke leads tracker"

### 2. Persistent Data Storage ✅
- All customer data stored in Supabase
- All leads tracked in Supabase  
- Data survives page refresh
- Accessible anytime

### 3. Smart Deduplication ✅
- On import, checks for duplicate phone numbers
- Duplicates ignored, new customers added
- User sees summary: "X imported, Y duplicates ignored"

---

## Setup Required

### Step 1: Create Supabase Tables
Go to your Supabase project SQL Editor and copy-paste the SQL from `SUPABASE_SETUP.md` → Run all queries

### Step 2: Verify Environment Variables
Check `.env.development.local` has:
```
NEXT_PUBLIC_SUPABASE_URL=https://ruydsyznbrqtqvcwznbw.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_USJIxCJIxQB7l4qTdM3CiQ_ou_iA76P
```

### Step 3: Test
1. Restart dev server (`pnpm dev`)
2. Go to Pelanggan page
3. Click "Hubungi Pelanggan (0)" button (should be disabled/no customers yet)
4. Import CSV file
5. Click "Hubungi Pelanggan" → confirm → check CSV downloaded + success message

---

## Files Changed

### New Files
- `components/HubungiPelangganButton.tsx` - Merged button component
- `lib/supabase.ts` - Supabase client and utilities
- `app/api/customers/import/route.ts` - Import with dedup API
- `SUPABASE_SETUP.md` - Database setup instructions
- `IMPLEMENTATION_SUMMARY.md` - Detailed technical docs

### Updated Files
- `app/page.tsx` - Uses new HubungiPelangganButton
- `app/api/customers/route.ts` - Fetches from Supabase
- `app/api/leads/route.ts` - Uses Supabase
- `components/ImportButton.tsx` - Calls import API for dedup
- `.env.development.local` - Added Supabase credentials

---

## How It Works

### Importing Data
```
User uploads CSV
  ↓
System parses CSV
  ↓
Checks each phone number against Supabase
  ↓
Duplicates? Skip
New? Add to Supabase
  ↓
Show result: "X imported (Y duplicates)"
```

### Hubungi Pelanggan Flow
```
User filters customer list
  ↓
Clicks "Hubungi Pelanggan (N)"
  ↓
Modal: "Lanjutkan hubungi via broadcast?"
  ↓
User clicks "Ya"
  ↓
System:
  - Downloads: customer_phones_broadcast_[time].csv
  - Tags: All N customers to leads with status "contacted"
  ↓
Show: "Berhasil diekspor. N pelanggan ditambahkan ke leads tracker"
```

---

## Key Features

✅ **One-Click Broadcast**: Combine export + lead tagging  
✅ **Confirmation Dialog**: Clear what will happen  
✅ **No Duplicates**: Phone number-based deduplication  
✅ **Persistent Data**: Everything saved to Supabase  
✅ **Success Messages**: User knows what happened  
✅ **Auto-Leads**: Contacted customers auto-tagged  

---

## Troubleshooting

### Button is disabled
- Check that customers exist in filtered list
- Import some test data first

### Import says "No API response"
- Ensure Supabase environment variables are set
- Check `/api/customers/import` endpoint is accessible

### No data showing after import
- Verify Supabase tables were created
- Check Supabase credentials are correct
- See `SUPABASE_SETUP.md` for table creation SQL

### Confirmation modal not showing
- Clear browser cache
- Restart dev server
- Check component is imported in app/page.tsx

---

## Database Schema

### customers table
- **id** (UUID) - Unique identifier
- **name** - Customer name
- **phone** (UNIQUE) - Phone number (deduplication key)
- **credit_score** - 0-100
- **collateral_type** - Elektronik/Emas/BPKB
- **highest_loan** - Loan amount
- **percentile_loan** - top 10% or bottom 75%
- **high_value** - Boolean
- **vip** - Boolean
- **created_at** - Timestamp
- **updated_at** - Timestamp

### leads table
- **id** (UUID) - Unique identifier
- **customer_id** - Phone number reference
- **status** - "contacted", "interested", etc.
- **notes** - Additional info
- **created_at** - Timestamp
- **updated_at** - Timestamp

---

## Next Steps

1. ✅ Set up Supabase tables (see SUPABASE_SETUP.md)
2. ✅ Verify environment variables
3. ✅ Test import with sample CSV
4. ✅ Test Hubungi Pelanggan flow
5. ✅ Verify data persists in Supabase
6. 🚀 Deploy to production!

---

## Support

- Check `IMPLEMENTATION_SUMMARY.md` for detailed technical info
- Check `SUPABASE_SETUP.md` for database setup
- See component code in `components/HubungiPelangganButton.tsx`
- See API code in `app/api/customers/import/route.ts`
