import { NextRequest, NextResponse } from 'next/server';
import { Customer } from '@/lib/types';
import { addCustomers, getCustomerByPhone } from '@/lib/supabase';

function mapCustomerToSupabase(customer: Customer) {
  return {
    name: customer.nama,
    phone: customer.noHp,
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

    const importedCustomers: Customer[] = [];
    let duplicateCount = 0;

    // Check each customer for duplicates by phone number
    for (const customer of customers) {
      try {
        const existingCustomer = await getCustomerByPhone(customer.noHp);

        if (existingCustomer) {
          // Customer already exists - skip and count as duplicate
          duplicateCount++;
          console.log(`[v0] Duplicate customer skipped: ${customer.noHp}`);
          continue;
        }

        // Customer is new - prepare for import
        const supabaseData = mapCustomerToSupabase(customer);
        importedCustomers.push(customer);

        console.log(`[v0] New customer prepared for import: ${customer.noHp}`);
      } catch (error) {
        console.error(`[v0] Error checking customer ${customer.noHp}:`, error);
        // Continue with next customer on error
        continue;
      }
    }

    // Batch insert all unique customers to Supabase
    if (importedCustomers.length > 0) {
      const supabaseData = importedCustomers.map(mapCustomerToSupabase);
      const result = await addCustomers(supabaseData);

      if (!result || result.length === 0) {
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

      console.log(`[v0] Successfully imported ${result.length} customers to Supabase`);
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
