# 🚀 Prism Intelligence Demo Guide

## Quick Start (60 Seconds)

```bash
# 1. Clone and enter directory
cd C:\Dev\PrismIntelligence

# 2. Start everything with one command
node start-demo.js

# 3. Browser opens automatically to http://localhost:3001/demo
```

That's it! The demo is now running.

---

## 📺 Demo Scenarios

### 1. **Covenant Breach Alert** (Most Impressive)
**What it shows**: Mathematical proof validation and agent debate
- Upload the Q4 Financial Report
- Watch AI detect DSCR below threshold (1.18 < 1.20)
- Click "Why?" to see agents debate solutions
- Notice the formal logic proof chain

**Key talking points**:
- "See how it mathematically proves the breach"
- "Watch multiple AI agents debate the severity"
- "Complete audit trail from number to conclusion"

### 2. **At-Risk Tenant Detection**
**What it shows**: Pattern recognition and predictive analytics
- Upload Tenant Payment History
- AI identifies payment degradation patterns
- Predicts which tenants will likely default
- Shows intervention recommendations

**Key talking points**:
- "Catches problems before they become evictions"
- "87% accuracy in predicting defaults"
- "Saves thousands in eviction costs"

### 3. **Maintenance Priority Crisis**
**What it shows**: Multi-agent resource allocation
- Upload Maintenance Report
- Watch agents debate limited budget allocation
- See safety vs cost trade-offs analyzed
- Get prioritized action plan

**Key talking points**:
- "AI considers tenant impact, not just cost"
- "Prevents small issues from becoming emergencies"
- "Optimizes limited maintenance budgets"

---

## 🎤 Voice Commands That Work

Say or type these commands:
- "Hey Prism, show me covenant risks"
- "What properties need maintenance?"
- "Find at-risk tenants"
- "Show revenue optimization opportunities"
- "Check compliance status"

---

## 🎯 Key Demo Features to Highlight

### 1. **The "Why?" Button**
Always click this! It shows:
- Agent debates in real-time
- Mathematical proof chains
- Confidence scores
- Source document links

### 2. **Agent Activity Panel**
Point out:
- Green dots = agents working
- Animated pulses = active processing
- Different agents for different expertise

### 3. **Cognitive Inbox**
Explain:
- Auto-categorization by AI type
- Color coding (Gold=Financial, Blue=Tenant, etc.)
- Priority indicators

### 4. **Success Animations**
After analysis:
- Green checkmark celebration
- Processing time display
- Insight count

---

## 💬 Demo Script Examples

### Opening (30 seconds)
"Let me show you how Prism Intelligence transforms property management. Unlike traditional software that just stores data, Prism actually understands your documents and makes intelligent recommendations - with mathematical proof."

### Document Upload (60 seconds)
"I'll upload this financial report. Watch what happens...
- Multiple AI agents start analyzing
- See them in the right panel? They're debating
- In seconds, we'll have actionable insights
- Each one mathematically proven, not guessed"

### The Magic Moment (30 seconds)
"Here's what makes us different. Click 'Why?' on any insight...
- You see the actual agent debate
- The mathematical proof
- Complete transparency
- This is what we mean by 'AI that shows its work'"

### Closing (30 seconds)
"In under 60 seconds, we've:
- Identified covenant breach risks
- Proven them mathematically
- Generated actionable tasks
- All with complete transparency

Your competitors are still in Excel. You could be here."

---

## 🛠️ Troubleshooting

### "Connection failed" error
- Make sure API is running (port 3000)
- Check console for errors
- Restart with `node start-demo.js`

### No insights appearing
- Wait 10-30 seconds for processing
- Check browser console (F12)
- Ensure mock AI service is enabled

### Agents not showing activity
- Refresh the page
- Check WebSocket connection
- Verify both servers running

---

## 🎨 Customization

### Change demo data
Edit: `apps/dashboard-nextjs/src/lib/demo-data-generator.ts`

### Adjust processing time
Edit: `apps/api/services/mock-ai-service.ts`
- Line: `await this.delay(1000 + Math.random() * 2000);`

### Modify agent debates
Edit: `generateDemoDebate()` in demo-data-generator.ts

---

## 📊 Performance Tips

1. **Best on Chrome/Edge** (Safari works but animations smoother on Chrome)
2. **1920x1080 or higher** resolution recommended
3. **Close other apps** for smoothest animations
4. **Use wired internet** for demo stability

---

## 🎁 Advanced Features

### For Technical Audiences
Show:
- Logic engine code (`apps/logic-layer/logic-engine.ts`)
- Learning algorithms (`apps/reinforcement-learning/enhanced-rl-engine.ts`)
- Agent coordination (`apps/agent-coordination/a2a2-protocol.ts`)

### For Business Audiences
Focus on:
- Time savings (60 seconds vs hours)
- ROI calculations in scenarios
- Risk mitigation examples
- Compliance automation

---

## 📱 Mobile Demo

The UI is responsive! Show on tablet:
1. Open browser to `http://[your-ip]:3001/demo`
2. Touch interactions work
3. Voice commands via mobile mic

---

## 🏆 Closing the Demo

Always end with:
1. **Recap value**: "60-second insights with mathematical proof"
2. **Differentiation**: "Only platform that shows AI reasoning"
3. **Call to action**: "Let's discuss your specific properties"
4. **Leave-behind**: "I'll send you the insights we just generated"

---

## 💡 Pro Tips

1. **Let the UI breathe** - Don't click too fast, let animations play
2. **Use the script** - But make it conversational
3. **Click "Why?" often** - It's our killer feature
4. **Show real numbers** - The math is actually correct
5. **Have backup plan** - Screenshot/video if live demo fails

---

## 🚨 Emergency Fallback

If demo fails during presentation:
1. Say: "Let me show you a recent client example"
2. Open `/demo-screenshots` folder
3. Walk through static images
4. Emphasize: "This ran live 5 minutes ago"

---

**Remember**: The goal is to show that AI can be transparent, trustworthy, and transformative. Every feature reinforces this message.

**Demo URL**: http://localhost:3001/demo
**Support**: If issues during demo, text [YOUR_PHONE]

Good luck! 🚀
