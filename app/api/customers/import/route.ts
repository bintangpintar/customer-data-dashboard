import { NextRequest, NextResponse } from 'next/server';
import { Customer } from '@/lib/types';
import { addCustomers, getExistingPhones } from '@/lib/supabase';

function mapCustomerToSupabase(customer: Customer) {
  return {
    name: customer.nama,
    phone: customer.noHp,
    email: customer.email || null,
    credit_score: customer.creditScore,
    collateral_type: customer.typeCollateral,
    highest_loan: customer.highestLoan,
    percentile_loan: customer.percentileLoan,
    high_value: customer.highValue,
    vip: customer.vip,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customers } = body;

    if (!Array.isArray(customers) || customers.length === 0) {
      return NextResponse.json(
        { error: 'Invalid customers data', message: 'Customers array is required' },
        { status: 400 }
      );
    }

    // OPTIMIZATION: Fetch all existing phone numbers in single query instead of per-customer
    const existingCustomers = await getExistingPhones();
    const existingPhones = new Set(existingCustomers.map((c: any) => c.phone));

    const importedCustomers: Customer[] = [];
    let duplicateCount = 0;

    // Filter duplicates in-memory (no database queries needed)
    for (const customer of customers) {
      if (existingPhones.has(customer.noHp)) {
        duplicateCount++;
        continue;
      }
      importedCustomers.push(customer);
    }

    // Batch insert all unique customers to Supabase (single query)
    if (importedCustomers.length > 0) {
      try {
        const supabaseData = importedCustomers.map(mapCustomerToSupabase);
        const result = await addCustomers(supabaseData);

        if (!result || result.length === 0) {
          console.error('[v0] Supabase insert returned no results');
          return NextResponse.json(
            {
              error: 'Failed to insert customers',
              message: 'Could not save customers to database',
              importedCustomers: [],
              duplicateCount,
            },
            { status: 500 }
          );
        }
      } catch (insertError) {
        console.error('[v0] Error during batch insert:', insertError);
        return NextResponse.json(
          {
            error: 'Failed to insert customers',
            message: String(insertError),
            importedCustomers: [],
            duplicateCount,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `${importedCustomers.length} pelanggan diimpor${duplicateCount > 0 ? `, ${duplicateCount} duplikat diabaikan` : ''}`,
      importedCustomers,
      duplicateCount,
      totalProcessed: customers.length,
    });
  } catch (error) {
    console.error('[v0] Error in import endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to process import', message: String(error) },
      { status: 500 }
    );
  }
}
