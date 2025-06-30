# 🤝 Claude + Gemini CLI: Working Together

## How It Works

You tell me what you want in plain English, and I'll:
1. **Understand** your intent
2. **Create** the right Gemini CLI commands
3. **Execute** them (or show you how)
4. **Interpret** the results

---

## 📚 Real Examples: Just Tell Me What You Want!

### Example 1: Financial Analysis
**You say:** "Analyze January's financial report and tell me if we're doing better than last year"

**I create and execute:**
```bash
gemini analyze \
  --file="reports/january-2024-financial.csv" \
  --prompt="Compare this month's performance to January 2023. Focus on: revenue growth, expense changes, NOI improvement. Highlight concerns and opportunities." \
  --format=json \
  --model=gemini-1.5-pro
```

### Example 2: Document Organization  
**You say:** "I have a folder full of property documents. Can you sort them by type?"

**I create and execute:**
```bash
# First, I'll classify each document
gemini batch \
  --input-dir="./documents/unsorted/" \
  --operation="classify" \
  --categories="lease,financial,maintenance,legal,operational" \
  --output="classification-results.json"

# Then organize them into folders
gemini organize \
  --classification="classification-results.json" \
  --source-dir="./documents/unsorted/" \
  --target-dir="./documents/organized/"
```

### Example 3: Lease Information Extraction
**You say:** "Extract all the important dates and money amounts from these lease agreements"

**I create and execute:**
```bash
gemini extract \
  --input-pattern="leases/*.pdf" \
  --extract='{"dates": ["lease_start", "lease_end", "renewal_deadline"], "amounts": ["monthly_rent", "security_deposit", "late_fee"], "tenant": ["name", "contact"]}' \
  --output="lease-summary.xlsx"
```

### Example 4: Property Comparison
**You say:** "Compare Sunset Plaza with Downtown Towers and tell me which is performing better"

**I create and execute:**
```bash
gemini compare \
  --properties='[{"name": "Sunset Plaza", "file": "sunset-metrics.json"}, {"name": "Downtown Towers", "file": "downtown-metrics.json"}]' \
  --metrics="noi,occupancy,maintenance_cost,tenant_satisfaction" \
  --analysis="comprehensive" \
  --recommendations=true
```

### Example 5: Maintenance Priority
**You say:** "Look at all maintenance requests and tell me what needs immediate attention"

**I create and execute:**
```bash
gemini analyze \
  --input-dir="maintenance-requests/" \
  --prompt="Categorize by urgency (emergency/high/medium/low). For emergency items, estimate cost and time. Suggest preventive measures." \
  --output-format="priority-matrix"
```

---

## 🎮 Interactive Commands You Can Give Me

### Financial Intelligence
- "What's our best performing property this quarter?"
- "Find all expenses over $10,000 and explain them"
- "Compare this month's revenue to our forecast"
- "Which properties are underperforming and why?"

### Operational Insights
- "Summarize all tenant complaints from last month"
- "What maintenance issues keep recurring?"
- "Find patterns in our vacancy rates"
- "Which amenities do tenants mention most?"

### Document Processing
- "Extract all lease renewal dates for next quarter"
- "Find all insurance policies expiring soon"
- "Summarize key terms from our vendor contracts"
- "Check if any leases have unusual clauses"

### Market Analysis
- "How do our rents compare to the neighborhood?"
- "What's the optimal rent for a 2-bedroom unit?"
- "Should we invest in property upgrades?"
- "What are our competitors doing differently?"

---

## 🛠️ Advanced Orchestration

### Multi-Step Analysis
**You say:** "Do a complete monthly analysis for all properties"

**I orchestrate:**
```python
# Step 1: Gather all data
gemini collect --sources="financial,operational,maintenance" --period="2024-01"

# Step 2: Analyze each property
for property in properties:
    gemini analyze --property={property} --comprehensive=true

# Step 3: Compare and rank
gemini compare --all-properties --generate-rankings

# Step 4: Create executive summary
gemini summarize --input="all-analyses/" --executive-brief --action-items
```

### Automated Workflows
**You say:** "Set up daily monitoring for critical issues"

**I create:**
```yaml
# daily-monitoring.yaml
name: Critical Issue Monitor
schedule: "0 9 * * *"  # 9 AM daily
steps:
  - name: Check Maintenance
    command: gemini monitor --type=maintenance --severity=emergency
    
  - name: Financial Alerts
    command: gemini analyze --metrics="daily_revenue,occupancy" --alert-thresholds
    
  - name: Tenant Issues
    command: gemini scan --complaints --sentiment=negative --priority=high
    
  - name: Send Summary
    command: gemini report --combine-results --send-email=team@prismai.com
```

---

## 💡 How to Use This Integration

### Option 1: Direct Commands
Just tell me what you want, and I'll give you the exact Gemini CLI command to run:

```
You: "Check if any properties have maintenance costs over budget"
Me: Run this: gemini analyze --file="maintenance-budgets.csv" --alert="overbudget" --threshold=10%
```

### Option 2: Code Integration
I'll create code that integrates Gemini CLI into your application:

```typescript
You: "Add Gemini analysis to our daily reports"
Me: *creates complete integration code with error handling*
```

### Option 3: Automated Scripts
I'll build complete automation scripts:

```
You: "Automate our monthly property analysis"
Me: *creates full automation script with Gemini CLI calls*
```

---

## 🚀 Quick Start Examples

### "Analyze this financial report"
```bash
# I'll create:
gemini analyze --file="your-report.csv" \
  --insights="revenue_trends,expense_analysis,noi_calculation" \
  --format=detailed
```

### "Find problems in our properties"
```bash
# I'll create:
gemini scan --all-properties \
  --detect="maintenance_issues,tenant_complaints,financial_anomalies" \
  --severity=high
```

### "Predict next month's performance"
```bash
# I'll create:
gemini predict --historical="6months" \
  --metrics="occupancy,revenue,expenses" \
  --confidence-intervals=true
```

---

## 🎯 Just Tell Me What You Need!

No need to learn Gemini CLI syntax. Just describe what you want to accomplish, and I'll:

1. **Translate** your request into the right Gemini commands
2. **Optimize** the parameters for best results
3. **Handle** any errors or issues
4. **Explain** the results in plain English

**Try it now! Tell me what property intelligence task you want to accomplish.**