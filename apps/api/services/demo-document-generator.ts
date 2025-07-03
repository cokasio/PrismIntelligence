/**
 * Demo Document Generator
 * Creates realistic property management documents for testing
 */

import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import fs from 'fs/promises';
import path from 'path';
import { parse as json2csv } from 'json2csv';

export class DemoDocumentGenerator {
  private outputDir: string;
  
  constructor(outputDir: string = './demo-documents') {
    this.outputDir = outputDir;
  }

  /**
   * Initialize output directory
   */
  async init() {
    await fs.mkdir(this.outputDir, { recursive: true });
    await fs.mkdir(path.join(this.outputDir, 'financial'), { recursive: true });
    await fs.mkdir(path.join(this.outputDir, 'leases'), { recursive: true });
    await fs.mkdir(path.join(this.outputDir, 'maintenance'), { recursive: true });
  }

  /**
   * Generate all demo documents
   */
  async generateAllDocuments() {
    console.log('🏗️ Generating demo documents...');
    
    await this.init();
    
    // Financial documents
    await this.generateGeneralLedger();
    await this.generateRentRoll();
    await this.generatePnLStatement();
    await this.generateBudgetVarianceReport();
    
    // Lease documents
    await this.generateLeaseAgreement();
    await this.generateLeaseAbstract();
    
    // Maintenance documents
    await this.generateMaintenanceReport();
    await this.generateWorkOrderSummary();
    
    console.log('✅ All demo documents generated!');
  }

  /**
   * 1. General Ledger (Excel)
   */
  async generateGeneralLedger() {
    const data = [
      ['General Ledger - Harbor Point Properties', '', '', '', ''],
      ['Period: January 2025', '', '', '', ''],
      ['', '', '', '', ''],
      ['GL Code', 'Account Name', 'Debit', 'Credit', 'Balance'],
      ['1000', 'Cash - Operating', '487,500', '', '487,500'],
      ['1100', 'Cash - Reserve', '125,000', '', '125,000'],
      ['1200', 'Accounts Receivable', '23,450', '', '23,450'],
      ['2000', 'Accounts Payable', '', '45,200', '-45,200'],
      ['2100', 'Security Deposits', '', '142,500', '-142,500'],
      ['3000', 'Mortgage Payable', '', '2,450,000', '-2,450,000'],
      ['4000', 'Rental Income', '', '487,500', '-487,500'],
      ['4100', 'Laundry Income', '', '3,200', '-3,200'],
      ['4200', 'Parking Income', '', '8,500', '-8,500'],
      ['5000', 'Maintenance Expense', '42,300', '', '42,300'],
      ['5100', 'Utilities Expense', '38,900', '', '38,900'],
      ['5200', 'Management Fees', '24,375', '', '24,375'],
      ['5300', 'Insurance Expense', '18,500', '', '18,500'],
      ['5400', 'Property Tax', '41,200', '', '41,200'],
      ['5500', 'Repairs & Maintenance', '15,600', '', '15,600'],
      ['6000', 'Mortgage Interest', '147,450', '', '147,450'],
      ['', '', '', '', ''],
      ['', 'TOTALS', '1,016,275', '3,316,100', '-2,299,825'],
      ['', '', '', '', ''],
      ['Key Metrics:', '', '', '', ''],
      ['Net Operating Income:', '$171,025', '', '', ''],
      ['Debt Service:', '$147,450', '', '', ''],
      ['DSCR:', '1.16', '⚠️ Below 1.2 covenant', '', '']
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Add some formatting hints
    ws['!cols'] = [
      { wch: 10 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 }
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'General Ledger');
    
    const filePath = path.join(this.outputDir, 'financial', 'General-Ledger-Jan-2025.xlsx');
    XLSX.writeFile(wb, filePath);
    
    console.log(`📊 Generated: ${filePath}`);
  }

  /**
   * 2. Rent Roll (CSV)
   */
  async generateRentRoll() {
    const rentRollData = [
      { Unit: '101', Tenant: 'Johnson LLC', Rent: 2850, LeaseStart: '2024-03-01', LeaseEnd: '2025-02-28', Status: 'Current', DaysLate: 0 },
      { Unit: '102', Tenant: 'Smith & Associates', Rent: 2650, LeaseStart: '2023-06-15', LeaseEnd: '2025-06-14', Status: 'Current', DaysLate: 0 },
      { Unit: '103', Tenant: 'Williams Corp', Rent: 2750, LeaseStart: '2024-01-01', LeaseEnd: '2024-12-31', Status: 'Expiring', DaysLate: 0 },
      { Unit: '201', Tenant: 'Brown Industries', Rent: 3200, LeaseStart: '2023-09-01', LeaseEnd: '2025-08-31', Status: 'Current', DaysLate: 5 },
      { Unit: '202', Tenant: 'Davis Enterprises', Rent: 3100, LeaseStart: '2024-07-01', LeaseEnd: '2026-06-30', Status: 'Current', DaysLate: 0 },
      { Unit: '203', Tenant: 'Miller & Co', Rent: 3150, LeaseStart: '2023-11-15', LeaseEnd: '2025-11-14', Status: 'Late', DaysLate: 18 },
      { Unit: '301', Tenant: 'Wilson Group', Rent: 3800, LeaseStart: '2024-04-01', LeaseEnd: '2026-03-31', Status: 'Current', DaysLate: 0 },
      { Unit: '302', Tenant: 'Taylor Holdings', Rent: 3750, LeaseStart: '2023-08-01', LeaseEnd: '2025-07-31', Status: 'Late', DaysLate: 12 },
      { Unit: '303', Tenant: 'Anderson LLC', Rent: 3900, LeaseStart: '2024-02-15', LeaseEnd: '2026-02-14', Status: 'Current', DaysLate: 0 },
      { Unit: 'PH1', Tenant: 'Executive Suites Inc', Rent: 5500, LeaseStart: '2022-01-01', LeaseEnd: '2024-12-31', Status: 'Expiring', DaysLate: 0 },
      { Unit: 'PH2', Tenant: 'Prestige Partners', Rent: 5800, LeaseStart: '2023-05-01', LeaseEnd: '2025-04-30', Status: 'Current', DaysLate: 0 }
    ];

    const csv = json2csv(rentRollData);
    const filePath = path.join(this.outputDir, 'financial', 'Rent-Roll-Jan-2025.csv');
    await fs.writeFile(filePath, csv);
    
    console.log(`📋 Generated: ${filePath}`);
  }

  /**
   * 3. P&L Statement (Excel)
   */
  async generatePnLStatement() {
    const data = [
      ['Harbor Point Properties - Income Statement', '', '', ''],
      ['For the Year Ended December 31, 2024', '', '', ''],
      ['', '', '', ''],
      ['', 'Actual', 'Budget', 'Variance'],
      ['REVENUE', '', '', ''],
      ['Rental Income', '5,850,000', '5,700,000', '150,000'],
      ['Laundry Income', '38,400', '36,000', '2,400'],
      ['Parking Income', '102,000', '96,000', '6,000'],
      ['Other Income', '24,600', '20,000', '4,600'],
      ['Total Revenue', '6,015,000', '5,852,000', '163,000'],
      ['', '', '', ''],
      ['OPERATING EXPENSES', '', '', ''],
      ['Payroll', '720,000', '700,000', '-20,000'],
      ['Utilities', '466,800', '420,000', '-46,800'],
      ['Repairs & Maintenance', '312,000', '280,000', '-32,000'],
      ['Insurance', '222,000', '200,000', '-22,000'],
      ['Property Tax', '494,400', '480,000', '-14,400'],
      ['Management Fees', '292,500', '285,000', '-7,500'],
      ['Professional Fees', '48,000', '45,000', '-3,000'],
      ['Marketing', '36,000', '40,000', '4,000'],
      ['Other Operating', '84,000', '80,000', '-4,000'],
      ['Total Operating Expenses', '2,675,700', '2,530,000', '-145,700'],
      ['', '', '', ''],
      ['NET OPERATING INCOME', '3,339,300', '3,322,000', '17,300'],
      ['', '', '', ''],
      ['DEBT SERVICE', '', '', ''],
      ['Mortgage Principal', '580,000', '580,000', '0'],
      ['Mortgage Interest', '1,769,400', '1,769,400', '0'],
      ['Total Debt Service', '2,349,400', '2,349,400', '0'],
      ['', '', '', ''],
      ['NET INCOME', '989,900', '972,600', '17,300'],
      ['', '', '', ''],
      ['KEY METRICS', '', '', ''],
      ['Operating Margin', '55.5%', '56.8%', '-1.3%'],
      ['DSCR', '1.42', '1.41', '0.01'],
      ['Occupancy Rate', '94.2%', '92.0%', '2.2%']
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    ws['!cols'] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 }
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'P&L Statement');
    
    const filePath = path.join(this.outputDir, 'financial', 'P&L-Statement-2024.xlsx');
    XLSX.writeFile(wb, filePath);
    
    console.log(`💰 Generated: ${filePath}`);
  }

  /**
   * 4. Budget Variance Report (Excel)
   */
  async generateBudgetVarianceReport() {
    const data = [
      ['Budget Variance Report - Q4 2024', '', '', '', ''],
      ['Harbor Point Properties', '', '', '', ''],
      ['', '', '', '', ''],
      ['Account', 'Actual', 'Budget', 'Variance $', 'Variance %'],
      ['REVENUE', '', '', '', ''],
      ['Rental Income', '487,500', '475,000', '12,500', '2.6%'],
      ['Other Income', '12,300', '10,000', '2,300', '23.0%'],
      ['Total Revenue', '499,800', '485,000', '14,800', '3.1%'],
      ['', '', '', '', ''],
      ['EXPENSES', '', '', '', ''],
      ['Maintenance', '89,450', '75,000', '-14,450', '-19.3%'],
      ['Utilities', '67,200', '60,000', '-7,200', '-12.0%'],
      ['Management', '49,980', '48,500', '-1,480', '-3.1%'],
      ['Insurance', '41,200', '40,000', '-1,200', '-3.0%'],
      ['Property Tax', '78,500', '78,500', '0', '0.0%'],
      ['Total OpEx', '326,330', '302,000', '-24,330', '-8.1%'],
      ['', '', '', '', ''],
      ['NOI', '173,470', '183,000', '-9,530', '-5.2%'],
      ['', '', '', '', ''],
      ['Debt Service', '147,450', '147,450', '0', '0.0%'],
      ['', '', '', '', ''],
      ['Cash Flow', '26,020', '35,550', '-9,530', '-26.8%'],
      ['', '', '', '', ''],
      ['ALERTS', '', '', '', ''],
      ['⚠️ Maintenance over budget by 19.3%', '', '', '', ''],
      ['⚠️ DSCR at 1.18 - below 1.20 covenant', '', '', '', ''],
      ['✓ Occupancy at 94% - above target', '', '', '', '']
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    ws['!cols'] = [
      { wch: 20 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 }
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Variance Report');
    
    const filePath = path.join(this.outputDir, 'financial', 'Budget-Variance-Q4-2024.xlsx');
    XLSX.writeFile(wb, filePath);
    
    console.log(`📊 Generated: ${filePath}`);
  }

  /**
   * 5. Lease Agreement (PDF Mock)
   */
  async generateLeaseAgreement() {
    // Since we can't easily generate PDFs without additional dependencies,
    // we'll create a text file that simulates a lease
    const leaseContent = `
COMMERCIAL LEASE AGREEMENT

This Lease Agreement ("Agreement") is entered into as of January 1, 2025

LANDLORD: Harbor Point Properties LLC
TENANT: Executive Suites Inc.

PREMISES: Unit PH1, Harbor Point Building
          123 Harbor Boulevard, Suite PH1
          Harbor City, State 12345

LEASE TERM: 24 months
START DATE: January 1, 2025
END DATE: December 31, 2026

MONTHLY RENT: $5,800.00
SECURITY DEPOSIT: $11,600.00 (2 months)
LATE FEE: $290.00 (5% of monthly rent) after 5-day grace period

RENT ESCALATION: 3% annual increase

PERMITTED USE: General office and business purposes

UTILITIES: Tenant responsible for electricity, internet, phone
          Landlord provides water, sewer, trash, common area maintenance

MAINTENANCE: Landlord maintains HVAC, plumbing, structural
            Tenant maintains interior, fixtures, equipment

INSURANCE: Tenant must maintain $1,000,000 general liability
          Landlord maintains property insurance

NOTICES: All notices to be delivered to addresses above

SPECIAL PROVISIONS:
- Parking: 4 reserved spaces included
- Access: 24/7 building access with security card
- Subletting: Allowed with landlord approval
- Renewal Option: One 2-year renewal at market rate

SIGNATURES:
Landlord: _____________________  Date: ___________
Tenant: _______________________  Date: ___________
    `;
    
    const filePath = path.join(this.outputDir, 'leases', 'Lease-Agreement-PH1-ExecutiveSuites.txt');
    await fs.writeFile(filePath, leaseContent);
    
    console.log(`📄 Generated: ${filePath}`);
  }

  /**
   * 6. Lease Abstract (CSV)
   */
  async generateLeaseAbstract() {
    const leaseData = [
      {
        Unit: 'PH1',
        Tenant: 'Executive Suites Inc',
        LeaseStart: '2025-01-01',
        LeaseEnd: '2026-12-31',
        MonthlyRent: 5800,
        SecurityDeposit: 11600,
        RentEscalation: '3% annual',
        RenewalOption: 'One 2-year at market',
        Parking: '4 spaces',
        LateFee: '5% after 5 days',
        Contact: 'John Smith (555) 123-4567'
      },
      {
        Unit: '301',
        Tenant: 'Wilson Group',
        LeaseStart: '2024-04-01',
        LeaseEnd: '2026-03-31',
        MonthlyRent: 3800,
        SecurityDeposit: 7600,
        RentEscalation: '2.5% annual',
        RenewalOption: 'Two 1-year at CPI+1%',
        Parking: '2 spaces',
        LateFee: '5% after 3 days',
        Contact: 'Sarah Wilson (555) 234-5678'
      },
      {
        Unit: '203',
        Tenant: 'Miller & Co',
        LeaseStart: '2023-11-15',
        LeaseEnd: '2025-11-14',
        MonthlyRent: 3150,
        SecurityDeposit: 6300,
        RentEscalation: 'Fixed',
        RenewalOption: 'Month-to-month after',
        Parking: '2 spaces',
        LateFee: '$150 flat',
        Contact: 'Bob Miller (555) 345-6789'
      }
    ];

    const csv = json2csv(leaseData);
    const filePath = path.join(this.outputDir, 'leases', 'Lease-Abstract-Summary.csv');
    await fs.writeFile(filePath, csv);
    
    console.log(`📋 Generated: ${filePath}`);
  }

  /**
   * 7. Maintenance Report (Text/PDF Mock)
   */
  async generateMaintenanceReport() {
    const reportContent = `
QUARTERLY MAINTENANCE REPORT
Harbor Point Properties
Q4 2024

EXECUTIVE SUMMARY
Total Work Orders: 47
Completed: 42 (89.4%)
Pending: 5
Emergency Repairs: 3
Average Response Time: 4.2 hours

CRITICAL ISSUES

1. HVAC SYSTEM - BUILDING A
   - Unit: Rooftop Unit #1
   - Age: 18 years (3 years past expected life)
   - Issues: Frequent compressor failures, refrigerant leaks
   - Repair Cost YTD: $8,450
   - Replacement Quote: $32,000
   - Recommendation: REPLACE IMMEDIATELY
   - Risk: Winter heating failure imminent

2. ROOF LEAK - BUILDING B
   - Location: Above units 301-303
   - Severity: Active water intrusion
   - Temporary Fix: Tarped
   - Permanent Repair Quote: $4,800
   - Insurance Claim: Pending
   - Recommendation: REPAIR WITHIN 30 DAYS

3. ELEVATOR MODERNIZATION
   - Building: C
   - Current Status: Operational but code non-compliant
   - Compliance Deadline: March 31, 2025
   - Modernization Quote: $65,000
   - Alternative: $120,000 full replacement
   - Recommendation: MODERNIZE TO MEET CODE

COMPLETED MAINTENANCE

- Parking lot resealing: COMPLETED Oct 2024 ($12,000)
- Annual fire system inspection: PASSED Nov 2024
- Pool equipment service: COMPLETED Sept 2024
- Landscaping fall cleanup: COMPLETED Nov 2024

PREVENTIVE MAINTENANCE SCHEDULE

January 2025:
- HVAC filter changes (all units)
- Fire extinguisher inspections
- Garage door maintenance

February 2025:
- Plumbing fixture inspections
- Window washing (common areas)
- Pest control quarterly service

BUDGET ANALYSIS

Q4 Maintenance Budget: $75,000
Q4 Actual Spend: $89,450
Variance: -$14,450 (-19.3%)

Primary Overages:
- Emergency HVAC repairs: $8,450
- Plumbing emergencies: $3,200
- Electrical repairs: $2,800

VENDOR PERFORMANCE

Excellent:
- ABC HVAC Services (despite equipment age)
- QuickFix Plumbing

Satisfactory:
- GreenThumb Landscaping
- SecureEntry Systems

Needs Improvement:
- Budget Electrical (slow response)

RECOMMENDATIONS

1. IMMEDIATE: Approve HVAC replacement for Building A
2. HIGH: Complete roof repair before winter storms
3. MEDIUM: Begin elevator modernization process
4. PLANNING: Create 2025 capital improvement budget

Prepared by: Mike Thompson, Maintenance Supervisor
Date: January 2, 2025
    `;
    
    const filePath = path.join(this.outputDir, 'maintenance', 'Maintenance-Report-Q4-2024.txt');
    await fs.writeFile(filePath, reportContent);
    
    console.log(`🔧 Generated: ${filePath}`);
  }

  /**
   * 8. Work Order Summary (CSV)
   */
  async generateWorkOrderSummary() {
    const workOrders = [
      { WO: '2401', Unit: '203', Issue: 'Toilet running', Priority: 'Normal', Status: 'Completed', Cost: 125, Days: 1 },
      { WO: '2402', Unit: '102', Issue: 'AC not cooling', Priority: 'High', Status: 'Completed', Cost: 350, Days: 0.5 },
      { WO: '2403', Unit: 'Common', Issue: 'Parking lot light out', Priority: 'Normal', Status: 'Completed', Cost: 200, Days: 2 },
      { WO: '2404', Unit: '301', Issue: 'Roof leak', Priority: 'Emergency', Status: 'In Progress', Cost: 4800, Days: 5 },
      { WO: '2405', Unit: 'PH1', Issue: 'Dishwasher repair', Priority: 'Normal', Status: 'Completed', Cost: 275, Days: 1 },
      { WO: '2406', Unit: '201', Issue: 'Window seal broken', Priority: 'Low', Status: 'Pending', Cost: 500, Days: 0 },
      { WO: '2407', Unit: 'Building A', Issue: 'HVAC compressor failure', Priority: 'Emergency', Status: 'Completed', Cost: 2850, Days: 0.25 },
      { WO: '2408', Unit: '302', Issue: 'Garbage disposal jammed', Priority: 'Normal', Status: 'Completed', Cost: 150, Days: 1 },
      { WO: '2409', Unit: 'Common', Issue: 'Elevator inspection', Priority: 'High', Status: 'Scheduled', Cost: 800, Days: 0 },
      { WO: '2410', Unit: '103', Issue: 'Door lock malfunction', Priority: 'High', Status: 'Completed', Cost: 225, Days: 0.5 }
    ];

    const csv = json2csv(workOrders);
    const filePath = path.join(this.outputDir, 'maintenance', 'Work-Order-Summary-Q4-2024.csv');
    await fs.writeFile(filePath, csv);
    
    console.log(`📋 Generated: ${filePath}`);
  }
}

// Export for use
export const demoDocumentGenerator = new DemoDocumentGenerator();

// Allow direct execution
if (require.main === module) {
  demoDocumentGenerator.generateAllDocuments()
    .then(() => console.log('✅ Demo document generation complete!'))
    .catch(console.error);
}
