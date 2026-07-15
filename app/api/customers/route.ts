import { NextRequest, NextResponse } from 'next/server';
import { Customer } from '@/lib/types';

// Parse CSV data
function parseCSV(csvText: string): Customer[] {
  const lines = csvText.split('\n').slice(1); // Skip header
  const customers: Customer[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    try {
      const values = parseCSVLine(line);
      if (values.length < 59) continue;

      const nama = values[1]?.trim();
      const noHp = values[10]?.trim();
      const vip = values[2]?.trim().toLowerCase() === 'true';
      const highValue = values[3]?.trim().toLowerCase() === 'true';
      const creditScore = parseInt(values[50] || '70', 10);
      const highestLoanStr = values[51] || '0';
      const highestLoan = parseInt(highestLoanStr.replace(/[^0-9]/g, ''), 10) || 0;
      const percentileLoan = values[54]?.trim().toLowerCase().includes('top') ? 'top 10%' : 'bottom 75%';
      const emas = values[55]?.trim().toLowerCase() === 'true';
      const elektronik = values[56]?.trim().toLowerCase() === 'true';
      
      // Determine collateral type: index 57 = Last Gadai Item Type
      const lastGadaiItem = values[57]?.trim().toUpperCase() || '';
      let typeCollateral: 'Elektronik' | 'Emas' | 'BPKB' = 'Elektronik';
      if (lastGadaiItem.includes('BPKB') || lastGadaiItem.includes('KENDARAAN')) {
        typeCollateral = 'BPKB';
      } else if (emas) {
        typeCollateral = 'Emas';
      }

      if (nama && noHp) {
        customers.push({
          nama,
          noHp,
          creditScore: Math.min(100, Math.max(0, creditScore)),
          typeCollateral,
          highestLoan: Math.max(highestLoan, 0),
          percentileLoan,
          highValue,
          vip,
        });
      }
    } catch (error) {
      continue;
    }
  }

  return customers;
}

// Helper function to parse CSV line handling quotes
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

// Mock CSV data for now (will be replaced with actual API or file upload)
const MOCK_CSV_DATA = `Branch,Nama Lengkap,VIP,High Value,Blacklist Status,nik,CIF,Gender,Tanggal Lahir,Age,No. HP,Referrer Code,Referral Code,Reference,Pintarnya User,Pandai Gadai User,PG App Verification Date,Alamat Domisili,Location,Occupation,Other Occupation,Asal Barang Jaminan,Instrumen Pembayaran,Tujuan Transaksi,Blacklist Kategori,Blacklist Note,Created By,Created At,Updated By,Updated At,# Referral,# Trx Count,# Gadai Baru,# Cicil,# Top Up,# Perpanjang,# Tebus,# PG App Transaction,# Default,Email,% Default,$ Total Loan,# Active Loan,$ Active Loan,$ Default Loan,Avg Tenor,Partial Loan,Early Perpanjang,Last Trx Date,Days Since Last Trx,Credit Score,Highest Loan,Recency,Segment,Loan Value Percentile,Emas,Elektronik,Last Gadai Item Type,Last Gadai Item Sub Type,Last Gadai Item Description
Pedongkelan,DONA FEBRIYANA MUSPITASARI,false,false,false,3172015202980003,133260129915,FEMALE,"Feb 12, 1998",28,+6285894996933,DO6933,,BROSUR_ATAU_FLYER,false,true,12 Mar 2026,KAPUK KEBON JAHE RT/RW 005/003 KAPUK CENGKARENG JAKARTA BARAT,,MENGURUS_RUMAH_TANGGA,,HASIL_INVESTASI,,BAYAR_HUTANG,,,marwiyah.rismawati,"Feb 18, 2026, 12:51 pm",marwiyah.rismawati,"Feb 18, 2026, 12:51 pm",0,6,1,0,0,5,0,3,0,,0,4242000,1,707000,0,1,,,"Jul 13, 2026, 6:10 pm",0,70,707000,L1M,ACTIVE REGULER,bottom 75%,false,true,ELEKTRONIK,ELEKTRONIK_HP,SAMSUNG GALAXY A23
Duri Raya,FAJAR PRABOWO,true,true,false,6471051410960004,433260143027,MALE,"Oct 14, 1996",30,+6281346864745,FA47451,,LANGSUNG_DARI_CABANG,false,false,,"JL SEPINGGANG BARU 1 GG PERKUTAT NO 12 023/000 ",,KARYAWAN_KANTORAN,,HIBAH,,BANTU_TEMAN_ATAU_KELUARGA,,,losi.sandra.norisa,"Apr 04, 2026, 7:46 am",losi.sandra.norisa,"Apr 04, 2026, 7:46 am",0,6,2,0,0,4,0,0,0,,0,29904000,2,9968000,0,22,,,"Jul 13, 2026, 5:16 pm",0,70,7200000,L1M,ACTIVE HIGH VALUE,top 10%,false,true,ELEKTRONIK,ELEKTRONIK_LAPTOP,APPLE MACBOOK AIR
Nusantara Raya,IDA FARIDA,false,false,false,3175055511720010,789260170877,FEMALE,"Nov 15, 1972",54,+6289513529985,ID9985,,TEMAN_ATAU_KELUARGA,false,true,4 Jun 2026,"KP. PANCORAN MAS RT 003 RW017, KEL. PANCORAN MAS, KEC. PANCORAN MAS, KOTA DEPOK",,MENGURUS_RUMAH_TANGGA,,HIBAH,,KEBUTUHAN_MEDIS,,,ariyantih,"Jun 04, 2026, 9:54 am",ariyantih,"Jun 04, 2026, 9:54 am",0,4,3,6,0,1,1,2,0,,0,3748000,2,1173000,0,13.33,,,"Jul 13, 2026, 5:09 pm",0,72,1023000,L1M,ACTIVE REGULER,bottom 75%,false,true,ELEKTRONIK,ELEKTRONIK_HP,INFINIX SMART 8
Lubang Buaya,MUSTIKA YUNIARTI,false,false,false,3175044906930002,977240023426,FEMALE,"Jun 9, 1993",33,+6289625507684,MU7684,,LANGSUNG_DARI_CABANG,false,true,21 May 2026,JL. H. JIMIN KEL.LUBANG BUAYA KEC. CIPAYUNG JAKARTA TIMUR,Kota Adm. Jakarta Timur - Cipayung - Lubang Buaya,KARYAWAN_KANTORAN,,HASIL_USAHA,TUNAI,BIAYA_PENDIDIKAN,,,tubagus.putrayanu,"Dec 18, 2024, 11:54 am",tubagus.putrayanu,"Dec 18, 2024, 11:54 am",0,6,2,0,0,4,0,2,1,,50,6240000,1,760000,1600000,23,,,"Jul 13, 2026, 7:02 pm",0,70,1600000,L1M,ACTIVE REGULER,bottom 75%,false,true,ELEKTRONIK,ELEKTRONIK_HP,OPPO A18
Pisangan Lama,RISMA KHOIRUNISA,false,false,false,3172026401950001,613260175922,FEMALE,"Jan 24, 1995",31,+6285111317813,RI78134,,LANGSUNG_DARI_CABANG,false,true,22 Jun 2026,"JL. CIPINANG KEBEMBEM NO.36 RT.004/RW.013, KEL. CIPINANG, KEC. PULOGADUNG",,KARYAWAN_KANTORAN,,HASIL_USAHA,,BAYAR_HUTANG,,,nurdiana,"Jun 14, 2026, 12:59 pm",nurdiana,"Jun 14, 2026, 12:59 pm",0,2,1,0,0,1,0,1,0,,0,1040000,1,520000,0,1,,,"Jul 13, 2026, 4:49 pm",0,70,520000,L1M,ACTIVE REGULER,bottom 75%,false,true,ELEKTRONIK,ELEKTRONIK_HP,VIVO Y30
Otista,AJENG TRI UTAMI,true,true,false,3175084405960008,379250030938,FEMALE,"May 4, 1996",30,+6287779401968,AJ1968,DI1436,TEMAN_ATAU_KELUARGA,false,true,10 Nov 2025,JL. CPINANG ASEM GG MAWAR NO 2 RT 015 RW 009 KEL KEBON PALA KEC MAKASAR,Kota Adm. Jakarta Timur - Jatinegara - Bidara Cina,KARYAWAN_KANTORAN,,HASIL_USAHA,TUNAI,USAHA_ATAU_MODAL_KERJA,,,daud.oneal,"Feb 01, 2025, 3:37 am",daud.oneal,"Feb 01, 2025, 3:49 am",0,21,4,1,0,17,1,11,0,,0,75090000,2,6895000,0,21.5,,,"Jul 13, 2026, 4:03 pm",0,70,4212000,L1M,ACTIVE HIGH VALUE,top 10%,false,true,ELEKTRONIK,ELEKTRONIK_LAPTOP,AXIOO MYBOOK PRO`;

export async function GET(request: NextRequest) {
  try {
    const customers = parseCSV(MOCK_CSV_DATA);
    return NextResponse.json({ data: customers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to parse customer data' }, { status: 500 });
  }
}
