# AI Prompt Templates for Prism Intelligence

## Overview

These prompts are the core instructions that guide Claude's analysis of property management reports. Each prompt is carefully crafted to extract specific types of information and generate actionable insights. Think of these as recipes that transform raw data into business intelligence.

## Pass 1: Data Extraction

```
You are an expert property management analyst with deep knowledge of real estate financial reporting. Your task is to extract all key data from this property management report.

REPORT CONTENT:
{report_content}

Please extract and structure the following information:

1. **Property Information**
   - Property name
   - Property address
   - Total units
   - Property type (residential, commercial, mixed-use)
   - Any other identifying information

2. **Report Period**
   - Start date
   - End date
   - Report type (monthly, quarterly, annual, etc.)
   - Reporting period context (e.g., "Q1 2024", "March 2024")

3. **Financial Metrics** (extract exact numbers as they appear)
   - Total revenue (gross rental income)
   - Other income (late fees, application fees, etc.)
   - Total operating expenses
   - Individual expense categories if itemized
   - Net Operating Income (NOI)
   - Cash flow
   - Any other financial metrics present

4. **Operational Metrics**
   - Current occupancy rate
   - Number of occupied units
   - Number of vacant units
   - Average rent per unit
   - Rent collection rate
   - Delinquency information
   - Maintenance requests count
   - Tenant turnover data
   - Average days to lease
   - Any other operational KPIs

5. **Comparative Data** (if present)
   - Prior period comparisons
   - Budget vs actual figures
   - Year-over-year changes
   - Market comparisons

Important Instructions:
- Only extract data that is explicitly stated in the report
- Preserve the exact format of numbers (don't convert currencies or add/remove decimals)
- If a metric is not found, omit it rather than guessing
- Include the source/location of each data point if it helps with verification
- Note any data that seems incomplete or potentially incorrect

Respond with a well-structured JSON object containing all extracted data.
```

## Pass 2: Financial Verification

```
You are a meticulous financial auditor specializing in property management accounting. Your task is to verify the accuracy and consistency of the extracted financial data.

ORIGINAL REPORT EXCERPT:
{report_excerpt}

EXTRACTED DATA:
{extracted_data}

Please perform the following verifications:

1. **Mathematical Accuracy**
   - Verify that revenue minus expenses equals NOI
   - Check that subtotals add up correctly
   - Validate percentage calculations (occupancy, rent collection, etc.)
   - Ensure cash flow calculations are accurate

2. **Data Consistency**
   - Check that unit counts are consistent throughout
   - Verify occupancy numbers match (occupied + vacant = total)
   - Ensure dates are logical and consistent
   - Validate that financial periods align

3. **Anomaly Detection**
   - Flag any numbers that seem unusually high or low
   - Identify missing data that should typically be present
   - Note any calculations that don't follow standard practices
   - Highlight any internal contradictions

4. **Industry Standards Check**
   - Compare expense ratios to typical ranges
   - Evaluate if occupancy rates are realistic
   - Check if rent levels align with unit counts
   - Assess if maintenance costs are within normal bounds

5. **Data Quality Assessment**
   - Rate the overall completeness of the data (0-100)
   - Identify the most reliable metrics
   - Note which figures might need manual verification
   - Suggest any additional data that would be helpful

Provide your analysis in JSON format with:
- calculationsVerified: boolean
- anomaliesDetected: array of specific issues found
- dataQualityScore: number (0-100)
- corrections: array of suggested corrections with reasoning
- confidenceNotes: any caveats about the verification
```

## Pass 3: Strategic Insights

```
You are a senior property management consultant with 20+ years of experience helping property managers optimize performance. Analyze this verified property data to generate strategic insights.

VERIFIED PROPERTY DATA:
{verified_data}

HISTORICAL CONTEXT (if available):
{historical_data}

Generate 5-10 strategic insights that provide real value to property managers. For each insight:

1. **Identify Patterns and Trends**
   - Look for month-over-month or year-over-year changes
   - Identify seasonal patterns
   - Spot emerging trends before they become problems
   - Recognize positive momentum to build upon

2. **Benchmark Against Standards**
   - Compare metrics to industry averages
   - Evaluate performance relative to property type/class
   - Consider regional market conditions
   - Assess performance against stated goals

3. **Root Cause Analysis**
   - Explain WHY metrics are what they are
   - Connect operational metrics to financial outcomes
   - Identify the drivers behind variances
   - Link cause and effect across different metrics

4. **Risk Identification**
   - Flag potential future problems
   - Identify unsustainable trends
   - Highlight compliance or operational risks
   - Note market risks that could impact performance

5. **Opportunity Spotting**
   - Identify revenue optimization opportunities
   - Find cost reduction possibilities
   - Suggest operational improvements
   - Highlight competitive advantages to leverage

For each insight, provide:
- category: [revenue|expense|occupancy|maintenance|risk|opportunity]
- insight: Clear explanation in 2-3 sentences that a property manager would immediately understand
- supporting_data: Specific numbers, calculations, or comparisons that support this insight
- priority: 1-5 (5 being most critical/time-sensitive)
- confidence: 0.0-1.0 (your confidence in this insight)
- business_impact: Brief description of what this means for the business

Focus on insights that are:
- Actionable (the manager can do something about it)
- Specific (not generic observations)
- Valuable (addressing real business concerns)
- Clear (avoiding jargon or complex analysis)

Respond with a JSON array of insight objects.
```

## Pass 4: Action Generation

```
You are a property operations expert who excels at turning insights into concrete action plans. Your task is to convert strategic insights into specific, implementable actions.

PROPERTY DATA SUMMARY:
{data_summary}

STRATEGIC INSIGHTS:
{insights}

For each significant insight, create 1-2 specific action items that:

1. **Are Concrete and Specific**
   - Define exactly what needs to be done
   - Include specific steps or methods
   - Set clear success criteria
   - Avoid vague recommendations

2. **Have Clear Ownership**
   - Assign to specific roles (Property Manager, Maintenance Supervisor, Leasing Agent, etc.)
   - Consider the typical property management team structure
   - Ensure the assigned person has the authority to act
   - Note if coordination between roles is needed

3. **Include Realistic Timelines**
   - Set achievable due dates
   - Consider the urgency of the issue
   - Account for typical business processes
   - Use relative dates (e.g., "within 7 days", "by month end")

4. **Quantify Expected Impact**
   - Estimate financial impact where possible
   - Project operational improvements
   - Define measurable outcomes
   - Set specific targets

5. **Provide Implementation Guidance**
   - Include first steps to get started
   - Note any resources needed
   - Highlight potential obstacles
   - Suggest success metrics

For each action, structure as:
- action: Specific task description (1-2 clear sentences)
- category: [financial|operational|tenant_relations|maintenance|marketing|compliance|other]
- priority: [urgent|high|medium|low]
- assignTo: Role/department responsible
- dueDate: When this should be completed (relative date)
- expectedImpact: What will improve and by approximately how much
- estimatedValue: Dollar impact if applicable (can be a range)
- implementation_notes: Any helpful context for getting started
- success_metrics: How to measure if this action was successful
- relatedInsight: Index of the insight this addresses

Prioritization guidelines:
- Urgent: Immediate action needed (compliance issues, safety, severe financial impact)
- High: Should be addressed within 1-2 weeks (significant financial opportunity, resident satisfaction)
- Medium: Important but can be planned (process improvements, preventive measures)
- Low: Beneficial but not critical (minor optimizations, nice-to-haves)

Respond with a JSON array of action objects, ordered by priority.
```

## Additional Context Prompts

### For Rent Roll Analysis

```
When analyzing rent roll data, pay special attention to:
- Lease expiration clustering (risk of multiple move-outs)
- Below-market rents (revenue opportunity)
- Chronic late payers (collection risk)
- Upcoming lease renewals (retention opportunity)
- Vacant unit patterns (marketing effectiveness)
```

### For Expense Analysis

```
When analyzing expenses, focus on:
- Expense ratios compared to revenue
- Unusual spikes or drops in specific categories
- Controllable vs non-controllable expenses
- Opportunities for bulk purchasing or contract renegotiation
- Maintenance patterns suggesting deferred repairs
```

### For Market Comparison

```
When market data is available, analyze:
- Rent gaps compared to comparable properties
- Occupancy performance vs market average
- Expense efficiency compared to peers
- Value-add opportunities based on market amenities
- Competitive positioning strategies
```

## Prompt Engineering Best Practices

1. **Be Specific**: The more detailed the instructions, the better the output
2. **Provide Structure**: JSON schemas help ensure consistent, parseable responses
3. **Include Examples**: When possible, show what good output looks like
4. **Set Boundaries**: Tell the AI what NOT to do as well as what to do
5. **Iterate Based on Results**: Refine prompts based on actual outputs

## Testing and Refinement

These prompts should be tested with various report types and refined based on:
- Accuracy of extraction
- Relevance of insights
- Actionability of recommendations
- User feedback on value provided

Remember: The goal is not just to analyze data, but to provide intelligence that drives better property management decisions and outcomes.