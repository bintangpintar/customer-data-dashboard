# Supabase Database Setup

To use this application with Supabase, you need to create the following tables in your Supabase project.

## Step 1: Create Tables via Supabase Dashboard

Go to your Supabase project dashboard and run the following SQL queries in the SQL Editor:

### Create customers table

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255),
  credit_score INTEGER DEFAULT 70,
  collateral_type VARCHAR(50) DEFAULT 'Elektronik',
  highest_loan BIGINT DEFAULT 0,
  percentile_loan VARCHAR(50) DEFAULT 'bottom 75%',
  high_value BOOLEAN DEFAULT false,
  vip BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on phone for faster lookups
CREATE INDEX idx_customers_phone ON customers(phone);
```

### Create leads table

```sql
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id VARCHAR(20) NOT NULL,
  status VARCHAR(50) DEFAULT 'contacted',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on customer_id for faster lookups
CREATE INDEX idx_leads_customer_id ON leads(customer_id);
```

## Step 2: Environment Variables

Make sure you have added these environment variables to your project:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

## Features

### Data Import with Deduplication
- When importing CSV files, the system checks for duplicate phone numbers
- Only unique customers are stored in the database
- Duplicates are reported in the UI but not stored

### Combined "Hubungi Pelanggan" Feature
- Click the "Hubungi Pelanggan" button to trigger a confirmation dialog
- On confirmation, the system:
  1. Exports filtered customer phone numbers as CSV
  2. Auto-tags all customers to the leads tracker
  3. Shows success message: "Berhasil diekspor"

### Persistent Data
- All customer data is stored in Supabase
- Access and filter data anytime
- Leads are tracked in the leads table with status and notes
