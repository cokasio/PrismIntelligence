# Demo Data Seeder - User Guide

## 🚀 Quick Start

```bash
# 1. Generate and seed all demo data
npm run seed

# 2. Start the demo system
npm run demo

# 3. Documents are ready in:
#    - incoming/financial/
#    - incoming/leases/
#    - incoming/maintenance/
```

## 📄 Available Demo Documents

### Financial Documents (Excel/CSV)
1. **General-Ledger-Jan-2025.xlsx**
   - Complete GL with all accounts
   - Shows DSCR below covenant (1.16 < 1.20)
   - Triggers FinanceBot + RiskBot alerts

2. **Rent-Roll-Jan-2025.csv**
   - 11 units with various statuses
   - Shows late payments and expiring leases
   - Triggers TenantBot analysis

3. **P&L-Statement-2024.xlsx**
   - Full year income statement
   - Budget vs actual comparison
   - Operating margin analysis

4. **Budget-Variance-Q4-2024.xlsx**
   - Detailed variance analysis
   - Maintenance over budget by 19.3%
   - Multiple alerts included

### Lease Documents
5. **Lease-Agreement-PH1-ExecutiveSuites.txt**
   - Complete commercial lease
   - Expiring high-value tenant
   - Renewal decision needed

6. **Lease-Abstract-Summary.csv**
   - Summary of key lease terms
   - Multiple renewal opportunities
   - Varying escalation clauses

### Maintenance Documents
7. **Maintenance-Report-Q4-2024.txt**
   - Comprehensive quarterly report
   - Critical HVAC failure risk
   - Budget overage analysis

8. **Work-Order-Summary-Q4-2024.csv**
   - 10 recent work orders
   - Mix of priorities and statuses
   - Cost analysis included

## 📧 Email Simulations

The seeder creates 3 email simulation files:

1. **email-financial-report.json**
   - Subject: "Q4 2024 Financial Reports - Action Required"
   - Attachments: GL + Budget Variance
   - Triggers covenant breach analysis

2. **email-maintenance-urgent.json**
   - Subject: "URGENT: HVAC System Failure Risk"
   - Attachments: Maintenance Report + Work Orders
   - Triggers emergency maintenance debate

3. **email-lease-renewal.json**
   - Subject: "Lease Renewals - Executive Suites & Others"
   - Attachments: Lease Abstract
   - Triggers renewal strategy discussion

## 🤖 Agent Activation Matrix

| Document | Primary Agents | Expected Insights |
|----------|---------------|-------------------|
| General Ledger | FinanceBot, RiskBot | Covenant breach, DSCR alert |
| Rent Roll | TenantBot, FinanceBot | Late payment patterns, revenue risk |
| P&L Statement | FinanceBot, ComplianceBot | Margin analysis, performance trends |
| Budget Variance | FinanceBot, RiskBot | Expense overruns, corrective actions |
| Lease Agreement | TenantBot, LegalBot | Renewal strategy, terms analysis |
| Lease Abstract | TenantBot, FinanceBot | Portfolio optimization |
| Maintenance Report | MaintenanceBot, RiskBot | Critical repairs, budget impact |
| Work Orders | MaintenanceBot, FinanceBot | Response time, cost trends |

## 🧪 Testing Workflows

### Test 1: Financial Crisis Detection
1. Upload `Budget-Variance-Q4-2024.xlsx`
2. Watch agents detect:
   - DSCR covenant breach risk
   - Maintenance budget overage
   - Cash flow concerns
3. Click "Why?" to see mathematical proof

### Test 2: Tenant Risk Assessment
1. Upload `Rent-Roll-Jan-2025.csv`
2. Observe:
   - Late payment pattern detection
   - At-risk tenant identification
   - Revenue impact calculation
3. See agents debate retention strategies

### Test 3: Maintenance Priority
1. Upload `Maintenance-Report-Q4-2024.txt`
2. Watch debate about:
   - HVAC replacement urgency
   - Budget constraints
   - Risk mitigation
3. Get prioritized action plan

### Test 4: Multi-Document Analysis
1. Upload multiple files simultaneously:
   - General Ledger
   - Rent Roll
   - Maintenance Report
2. See cross-functional insights:
   - Financial impact of maintenance
   - Tenant risk affecting cash flow
   - Holistic property health score

## 📊 Validation Checklist

After seeding, verify:

- [ ] All 8 documents generated in `demo-documents/`
- [ ] Files copied to appropriate `incoming/` folders
- [ ] Email simulations created in `incoming/emails/`
- [ ] Agent mappings correctly configured
- [ ] Processing pipeline triggers on upload
- [ ] Insights appear in UI within 10-30 seconds
- [ ] "Why?" button shows agent reasoning
- [ ] Feedback buttons record preferences

## 🔧 Customization

### Add New Documents
Edit `demo-document-generator.ts`:
```typescript
async generateCustomDocument() {
  // Add your document generation logic
}
```

### Modify Document Content
Update the data arrays in each generator method to include your specific scenarios.

### Change Agent Mappings
Edit expected agents in `seed-demo-data.js`:
```javascript
const expectedAgents = {
  'Your-Document.xlsx': ['AgentName1', 'AgentName2']
};
```

## 🚨 Troubleshooting

### "Cannot find module 'xlsx'"
```bash
cd apps/api
npm install xlsx json2csv
```

### Documents not appearing
- Check `demo-documents/` folder exists
- Verify file permissions
- Ensure Node.js has write access

### Agents not processing
- Confirm API server is running
- Check WebSocket connection
- Verify mock AI service is enabled

## 💡 Pro Tips

1. **Realistic Data**: All numbers in demo documents are mathematically consistent
2. **Trigger Points**: DSCR at 1.16 specifically chosen to trigger covenant alerts
3. **Agent Debates**: Maintenance costs designed to create budget conflicts
4. **Learning Opportunities**: Multiple feedback points for RL demonstration

---

**Ready to see Prism Intelligence in action? Run `npm run seed` then `npm run demo`!** 🚀
