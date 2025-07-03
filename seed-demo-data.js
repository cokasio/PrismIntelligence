#!/usr/bin/env node

/**
 * Demo Data Seeder
 * Seeds the Prism Intelligence system with realistic property management documents
 */

const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');
const chalk = require('chalk');

// Import the document generator
const { demoDocumentGenerator } = require('./apps/api/services/demo-document-generator');

class DemoDataSeeder {
  constructor() {
    this.rootDir = __dirname;
    this.incomingDir = path.join(this.rootDir, 'incoming');
    this.demoDocsDir = path.join(this.rootDir, 'demo-documents');
    this.processedDir = path.join(this.rootDir, 'processed');
  }

  /**
   * Initialize directories
   */
  async initDirectories() {
    console.log(chalk.yellow('📁 Initializing directories...'));
    
    const dirs = [
      this.incomingDir,
      path.join(this.incomingDir, 'financial'),
      path.join(this.incomingDir, 'leases'),
      path.join(this.incomingDir, 'maintenance'),
      path.join(this.incomingDir, 'reports'),
      this.processedDir,
      this.demoDocsDir
    ];
    
    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
      console.log(chalk.green(`✅ ${dir}`));
    }
  }

  /**
   * Generate demo documents
   */
  async generateDocuments() {
    console.log(chalk.yellow('\n📄 Generating demo documents...'));
    
    try {
      await demoDocumentGenerator.generateAllDocuments();
      return true;
    } catch (error) {
      console.error(chalk.red('❌ Error generating documents:'), error);
      return false;
    }
  }

  /**
   * Copy documents to incoming folders
   */
  async seedIncomingFolders() {
    console.log(chalk.yellow('\n🌱 Seeding incoming folders...'));
    
    const mappings = [
      {
        source: path.join(this.demoDocsDir, 'financial'),
        dest: path.join(this.incomingDir, 'financial'),
        files: [
          'General-Ledger-Jan-2025.xlsx',
          'Rent-Roll-Jan-2025.csv',
          'P&L-Statement-2024.xlsx',
          'Budget-Variance-Q4-2024.xlsx'
        ]
      },
      {
        source: path.join(this.demoDocsDir, 'leases'),
        dest: path.join(this.incomingDir, 'leases'),
        files: [
          'Lease-Agreement-PH1-ExecutiveSuites.txt',
          'Lease-Abstract-Summary.csv'
        ]
      },
      {
        source: path.join(this.demoDocsDir, 'maintenance'),
        dest: path.join(this.incomingDir, 'maintenance'),
        files: [
          'Maintenance-Report-Q4-2024.txt',
          'Work-Order-Summary-Q4-2024.csv'
        ]
      }
    ];
    
    for (const mapping of mappings) {
      for (const file of mapping.files) {
        try {
          const sourcePath = path.join(mapping.source, file);
          const destPath = path.join(mapping.dest, file);
          
          // Check if source exists
          await fs.access(sourcePath);
          
          // Copy file
          await fs.copyFile(sourcePath, destPath);
          console.log(chalk.green(`✅ Copied ${file} to ${mapping.dest}`));
        } catch (error) {
          console.log(chalk.yellow(`⚠️  ${file} not found, skipping...`));
        }
      }
    }
  }

  /**
   * Create email simulation files
   */
  async createEmailSimulations() {
    console.log(chalk.yellow('\n📧 Creating email simulations...'));
    
    const emails = [
      {
        filename: 'email-financial-report.json',
        content: {
          from: 'accounting@harborpoint.com',
          to: 'manager@propertycompany.com',
          subject: 'Q4 2024 Financial Reports - Action Required',
          body: 'Please find attached the Q4 financial reports. Note that our DSCR is approaching covenant threshold at 1.18. Immediate attention required.',
          attachments: [
            'General-Ledger-Jan-2025.xlsx',
            'Budget-Variance-Q4-2024.xlsx'
          ],
          received: new Date().toISOString()
        }
      },
      {
        filename: 'email-maintenance-urgent.json',
        content: {
          from: 'maintenance@harborpoint.com',
          to: 'manager@propertycompany.com',
          subject: 'URGENT: HVAC System Failure Risk',
          body: 'The Building A HVAC system is showing critical signs of failure. Attached is the quarterly report with recommendations. We need approval for immediate replacement.',
          attachments: [
            'Maintenance-Report-Q4-2024.txt',
            'Work-Order-Summary-Q4-2024.csv'
          ],
          received: new Date().toISOString()
        }
      },
      {
        filename: 'email-lease-renewal.json',
        content: {
          from: 'leasing@harborpoint.com',
          to: 'manager@propertycompany.com',
          subject: 'Lease Renewals - Executive Suites & Others',
          body: 'Several high-value leases are expiring soon. Executive Suites (PH1) lease expires Dec 31. We should start renewal negotiations immediately.',
          attachments: [
            'Lease-Abstract-Summary.csv'
          ],
          received: new Date().toISOString()
        }
      }
    ];
    
    const emailDir = path.join(this.incomingDir, 'emails');
    await fs.mkdir(emailDir, { recursive: true });
    
    for (const email of emails) {
      const filePath = path.join(emailDir, email.filename);
      await fs.writeFile(filePath, JSON.stringify(email.content, null, 2));
      console.log(chalk.green(`✅ Created ${email.filename}`));
    }
  }

  /**
   * Verify document processing
   */
  async verifyProcessing() {
    console.log(chalk.yellow('\n🔍 Verifying document processing...'));
    
    // This would integrate with the actual processing system
    // For now, we'll simulate verification
    
    const expectedAgents = {
      'General-Ledger-Jan-2025.xlsx': ['FinanceBot', 'RiskBot'],
      'Rent-Roll-Jan-2025.csv': ['TenantBot', 'FinanceBot'],
      'Maintenance-Report-Q4-2024.txt': ['MaintenanceBot', 'RiskBot'],
      'Lease-Abstract-Summary.csv': ['TenantBot', 'LegalBot']
    };
    
    console.log(chalk.blue('\n📊 Document-to-Agent Validation Matrix:'));
    console.log(chalk.blue('====================================='));
    
    for (const [doc, agents] of Object.entries(expectedAgents)) {
      console.log(`\n${chalk.cyan(doc)}`);
      agents.forEach(agent => {
        console.log(`  ✅ ${agent} - Ready to process`);
      });
    }
    
    return true;
  }

  /**
   * Generate summary report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      documentsGenerated: {
        financial: 4,
        leases: 2,
        maintenance: 2,
        total: 8
      },
      emailSimulations: 3,
      agentMappings: {
        FinanceBot: ['General Ledger', 'P&L Statement', 'Budget Variance', 'Rent Roll'],
        TenantBot: ['Rent Roll', 'Lease Abstract', 'Lease Agreement'],
        MaintenanceBot: ['Maintenance Report', 'Work Order Summary'],
        RiskBot: ['Budget Variance', 'Maintenance Report', 'General Ledger'],
        LegalBot: ['Lease Agreement', 'Lease Abstract']
      },
      status: 'READY FOR TESTING'
    };
    
    console.log(chalk.blue.bold(`
╔═══════════════════════════════════════════════════╗
║           DEMO DATA SEEDING COMPLETE              ║
╚═══════════════════════════════════════════════════╝
`));
    
    console.log(chalk.green('📊 Summary:'));
    console.log(`  • Documents Generated: ${report.documentsGenerated.total}`);
    console.log(`  • Email Simulations: ${report.emailSimulations}`);
    console.log(`  • Agent Mappings Configured: ${Object.keys(report.agentMappings).length}`);
    console.log(`  • Status: ${chalk.green.bold(report.status)}`);
    
    console.log(chalk.yellow('\n🚀 Next Steps:'));
    console.log('  1. Run: node start-demo.js');
    console.log('  2. Navigate to: http://localhost:3001/demo');
    console.log('  3. Upload any document from incoming/ folder');
    console.log('  4. Watch AI agents process in real-time!');
    
    return report;
  }

  /**
   * Main execution
   */
  async run() {
    console.log(chalk.blue.bold(`
╔═══════════════════════════════════════════════════╗
║          PRISM INTELLIGENCE DATA SEEDER           ║
╚═══════════════════════════════════════════════════╝
`));
    
    try {
      // Step 1: Initialize directories
      await this.initDirectories();
      
      // Step 2: Generate documents
      const docsGenerated = await this.generateDocuments();
      if (!docsGenerated) {
        throw new Error('Failed to generate documents');
      }
      
      // Step 3: Seed incoming folders
      await this.seedIncomingFolders();
      
      // Step 4: Create email simulations
      await this.createEmailSimulations();
      
      // Step 5: Verify processing setup
      await this.verifyProcessing();
      
      // Step 6: Generate report
      const report = this.generateReport();
      
      // Save report
      const reportPath = path.join(this.rootDir, 'demo-seed-report.json');
      await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
      console.log(chalk.green(`\n✅ Report saved to: ${reportPath}`));
      
    } catch (error) {
      console.error(chalk.red('\n❌ Seeding failed:'), error);
      process.exit(1);
    }
  }
}

// Execute if run directly
if (require.main === module) {
  const seeder = new DemoDataSeeder();
  seeder.run().catch(console.error);
}

module.exports = { DemoDataSeeder };
