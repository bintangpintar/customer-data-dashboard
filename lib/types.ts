export interface Customer {
  nama: string;
  noHp: string;
  email?: string;
  creditScore: number;
  typeCollateral: 'Elektronik' | 'Emas' | 'BPKB';
  highestLoan: number;
  percentileLoan: 'top 10%' | 'bottom 75%';
  highValue: boolean;
  vip: boolean;
}
