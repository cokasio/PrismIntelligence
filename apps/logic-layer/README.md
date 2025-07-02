# Critical Thinking Logic Layer - Prism Intelligence

## 🧠 Overview

The Critical Thinking Logic Layer adds philosophical rigor to Prism Intelligence by implementing **propositional calculus** and **formal logic validation** for all AI agent outputs. This ensures that every insight, recommendation, and action is:

- **Logically Sound** - Based on valid deductive reasoning
- **Contradiction-Free** - Cross-validated across multiple agents
- **Transparent** - With step-by-step proof chains
- **Trustworthy** - Backed by formal logic principles

## 🎯 Key Features

### 1. **Propositional Calculus Engine**
- Implements formal logic rules (If A ∧ B → C)
- Validates conclusions against evidence
- Generates step-by-step proof chains
- Calculates confidence scores

### 2. **Multi-Agent Cross-Validation**
- Detects contradictions between agents
- Ensures consistency across the system
- Flags conflicts by severity (low/medium/high/critical)
- Maintains system-wide coherence

### 3. **Domain-Specific Logic Rules**
Built-in rules for property management:
- **L001**: Margin erosion detection (expenses ↑ + revenue flat = risk)
- **L002**: Debt covenant breach (low DSCR + low liquidity = breach)
- **L003**: Maintenance prioritization (safety + high cost = immediate)
- **L004**: Tenant risk assessment (late payments + complaints = high risk)

### 4. **Visual Proof Badges**
- ✅ Green badge = Logically proven
- ⚠️ Yellow badge = Cannot prove
- ❌ Red badge = Contradictions detected
- Hover for detailed validation info

## 📁 File Structure

```
apps/
├── logic-layer/
│   ├── logic-engine.ts          # Core propositional calculus engine
│   └── agent-wrapper.ts         # Agent validation wrappers
└── dashboard-nextjs/
    └── src/components/logic-layer/
        ├── LogicComponents.tsx   # UI components (badges, panels)
        └── LogicIntegration.tsx  # Integration examples
```

## 🚀 How to Use

### 1. **Wrap Your Agents**

```typescript
import { LogicalAgentFactory } from './logic-layer/agent-wrapper';

// Create a logically-validated agent
const agent = LogicalAgentFactory.createAgent('ComplianceAgent');

// Generate validated insights
const insight = await agent.checkCompliance({
  dscr: 1.1,
  liquidityDays: 45
});

// Check validation
if (insight.validation.valid) {
  console.log('Insight is logically proven!');
  console.log('Proof:', insight.logicalProof);
}
```

### 2. **Display Proof Badges**

```tsx
import { ProofBadge } from './components/logic-layer/LogicComponents';

<ProofBadge validation={insight.validation} size="sm" />
```

### 3. **Show Logic Panel**

```tsx
import { LogicPanel } from './components/logic-layer/LogicComponents';

<LogicPanel insights={validatedInsights} />
```

### 4. **Handle Contradictions**

```tsx
import { ContradictionAlert } from './components/logic-layer/LogicComponents';

{insight.contradictions && (
  <ContradictionAlert contradictions={insight.contradictions} />
)}
```

## 🔧 Adding Custom Logic Rules

```typescript
logicEngine.addRule({
  id: 'L005',
  description: 'Your custom rule description',
  form: 'If A ∧ B → C',
  premises: [
    { id: 'A', statement: 'Condition 1', value: false },
    { id: 'B', statement: 'Condition 2', value: false }
  ],
  conclusion: { id: 'C', statement: 'Result', value: false },
  weight: 0.9
});
```

## 🎨 UI Integration Points

### 1. **Cognitive Inbox**
- Each item shows proof badge
- Contradictions highlighted in red
- Click to see full proof chain

### 2. **Agent Activity Panel**
- Real-time validation status
- Cross-agent contradiction alerts
- Proof chain viewer

### 3. **Task Generation**
- Only proven insights create tasks
- Tasks include logical justification
- Priority based on confidence score

### 4. **ROI Dashboard**
- Validated metrics only
- Proof badges on KPI cards
- Contradiction warnings

## 📊 Example Output

```json
{
  "agentName": "ComplianceAgent",
  "conclusion": "Property at risk of debt covenant breach",
  "validation": {
    "valid": true,
    "confidence": 0.92,
    "explanation": "Logical proof: DSCR < 1.2 → LiquidityCoverage < 60 → DebtCovenantBreach = True",
    "proofChain": {
      "rule": "L002",
      "steps": [
        {
          "step": 1,
          "operation": "PREMISE",
          "justification": "Given: DSCR < 1.2 = true"
        },
        {
          "step": 2,
          "operation": "PREMISE",
          "justification": "Given: LiquidityCoverage < 60 = true"
        },
        {
          "step": 3,
          "operation": "CONJUNCTION",
          "justification": "All premises are true"
        },
        {
          "step": 4,
          "operation": "MODUS_PONENS",
          "justification": "If premises are true, then DebtCovenantBreach = True"
        }
      ]
    }
  }
}
```

## 🚨 Contradiction Example

When agents disagree:
```
⚠️ Logical Contradiction Detected
ComplianceAgent vs RiskFlaggerAgent
Severity: HIGH

Details: "Property is low risk" conflicts with "Property at risk of covenant breach"
```

## 🔍 Benefits

1. **Trust & Transparency** - Users see exactly why AI made decisions
2. **Error Prevention** - Catches logical inconsistencies before they become problems
3. **Compliance Ready** - Full audit trail of reasoning
4. **Better Decisions** - Only act on logically sound insights

## 🎯 Next Steps

1. **Test the Logic Engine** - Run validation on your existing agents
2. **Add Domain Rules** - Create rules specific to your property types
3. **Monitor Contradictions** - Review cross-agent conflicts
4. **Refine Confidence** - Adjust weights based on real-world outcomes

---

**"From Insights to Intelligence. From Intelligence to Wisdom."**

The Critical Thinking Logic Layer ensures that Prism Intelligence doesn't just process data—it reasons about it with philosophical rigor. 🚀
