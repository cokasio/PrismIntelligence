# MVP Implementation Guide: Prism Intelligence

## Overview

This guide provides a step-by-step approach to building the Minimum Viable Product (MVP) for Prism Intelligence. The MVP focuses on demonstrating core value: receiving property management reports via email, processing them with AI to generate insights, and delivering actionable intelligence back to users. By following this guide, you'll have a working system that can process real reports and deliver real value within 30 days.

## MVP Scope Definition

The MVP includes these essential features while deliberately excluding others to maintain focus and rapid delivery:

### What's Included in MVP:
1. Email ingestion system that receives reports as attachments
2. Support for PDF, Excel, and CSV report formats
3. Multi-pass AI analysis using Claude API
4. Basic insight generation and action recommendations
5. Email delivery of formatted analysis reports
6. Simple database storage for processed reports
7. Basic error handling and retry logic

### What's NOT in MVP (Future Phases):
- Web dashboard interface
- User authentication system
- Real-time processing updates
- Advanced analytics features
- API access for external systems
- Billing integration
- Multi-tenant isolation

This focused scope allows us to prove the core value proposition: that AI can transform raw reports into actionable intelligence that managers actually use.

## Phase 1: Infrastructure Setup (Days 1-3)
### Step 1: Set Up Core Services

Start by creating accounts and configuring the essential services that form the backbone of your system. This foundation work might feel administrative, but getting it right from the start saves countless hours later.

**Supabase Setup**: Create your Supabase project, which will serve as both your database and authentication provider. During setup, save your project URL and anon key - you'll need these for API connections. Enable email authentication even though we won't use it in MVP, as it's easier to enable now than retrofit later.

**Claude API Access**: Register for Anthropic's Claude API and obtain your API key. Start with a modest credit allocation ($100) to test the system. Claude's pricing is usage-based, so your costs scale naturally with system use.

**SendGrid Configuration**: Set up SendGrid for both inbound and outbound email processing. The Inbound Parse webhook is crucial - this is how reports enter your system. Configure a subdomain like reports@prism-intelligence.com and point it to your webhook endpoint.

**N8N Installation**: Install N8N either locally for development or on a small VPS for testing. N8N will orchestrate your entire workflow, from receiving emails to triggering AI analysis to sending results.

### Step 2: Database Schema Design

Create a simple but extensible database schema that captures the essential entities while leaving room for growth. Think of this as laying the foundation for a house - you want it solid but not overbuilt.

The core tables you need are minimal but carefully designed:

Reports table stores metadata about each processed report including filename, sender email, property identifier, processing status, and timestamps. This becomes your system's memory of what has been processed.
Insights table captures the AI-generated insights linked to each report. Store the insight text, category (financial, operational, risk, etc.), priority level, and confidence score. This becomes searchable intelligence that grows more valuable over time.

Actions table tracks recommended actions from the AI analysis. Include the action text, due date, assigned party (even if just a role for now), status, and priority. This transforms insights into accountability.

Processing logs table maintains a detailed audit trail of every step in the pipeline. Record processing stages, success/failure states, error messages, and processing times. This becomes invaluable for debugging and optimization.

### Step 3: Environment Configuration

Setting up your development environment correctly from the start prevents countless configuration headaches later. Create a clear separation between development, staging, and production environments, even if production doesn't exist yet. This discipline pays dividends when you're ready to launch.

Create environment variable files that store all your service credentials and configuration values. Never commit these to version control - use .env.example files to document what variables are needed without exposing actual values. Your basic environment needs API keys for Claude, Supabase, and SendGrid, plus database connection strings and application-specific settings like processing timeouts and retry limits.

Set up your local development environment with hot reloading for rapid iteration. Use nodemon or similar tools to automatically restart your services when code changes. Configure your IDE with proper TypeScript support and linting to catch errors early. Install database management tools like pgAdmin or DBeaver to inspect your data during development.
## Phase 2: Core Processing Pipeline (Days 4-10)

Building the core processing pipeline is where your system begins to take shape. This is the heart of Prism Intelligence - the intelligent workflow that transforms raw reports into actionable insights. Think of this phase as creating the engine that powers everything else.

### Step 4: Email Ingestion System

The email ingestion system serves as your system's front door, welcoming reports from any source without requiring integration. This approach brilliantly sidesteps the complexity of connecting to dozens of different property management systems. Users simply forward their reports to your processing address, and the magic begins.

Start by configuring SendGrid's Inbound Parse webhook to receive emails at your designated address. When an email arrives, SendGrid converts it to a POST request containing the email content and attachments. Your webhook endpoint needs to handle these requests reliably, extracting attachments and queuing them for processing. Build robust error handling here - emails can contain unexpected formats, multiple attachments, or forwarding chains that complicate parsing.

Create a simple but effective attachment handler that identifies report files by extension and MIME type. For the MVP, support PDF, Excel (.xlsx and .xls), and CSV formats, as these cover 95% of property management reports. Store the raw files in Supabase Storage with a clear naming convention that includes timestamp and a unique identifier. This becomes your audit trail and allows for reprocessing if needed.

The ingestion system should send a confirmation email back to the sender, acknowledging receipt and providing an estimated processing time. This simple feedback loop builds trust and reduces support inquiries about whether reports were received. Include a simple tracking number that users can reference if they need to follow up.
### Step 5: Document Parsing Layer

Once reports are safely stored, the next challenge is extracting their data in a format that AI can analyze. This parsing layer acts as a translator, converting various file formats into structured data that Claude can understand and process. The quality of your parsing directly impacts the quality of insights generated, so invest time in getting this right.

For PDF files, implement a multi-strategy approach. Start with standard text extraction for digitally created PDFs, which represents most modern reports. For scanned or image-based PDFs, integrate OCR capabilities as a fallback. The key insight here is that property management reports often follow consistent layouts, so you can build template recognition over time to improve extraction accuracy.

Excel file parsing requires careful handling of multiple worksheets, merged cells, and various formatting styles that accountants love to use. Focus on identifying the primary data tables while preserving context from headers and notes. Many property reports include summary sheets with detailed breakdowns in subsequent tabs - your parser needs to maintain these relationships for proper analysis.

CSV files might seem simple, but they often come with quirks like custom delimiters, header rows that span multiple lines, or encoding issues. Build your CSV parser to be forgiving and intelligent, automatically detecting delimiters and handling common formatting variations. Remember that many legacy systems export to CSV, so supporting this format well opens doors to older property management systems.

### Step 6: Multi-Pass AI Analysis

This is where Prism Intelligence truly shines - the sophisticated AI analysis that transforms raw data into strategic insights. The multi-pass approach ensures accuracy while building comprehensive understanding. Each pass has a specific purpose, building upon the previous one to create a complete picture.
The first pass focuses on data extraction and structuring. Here, Claude reads the parsed report and identifies all relevant financial metrics, dates, property identifiers, and operational data. Think of this as Claude taking careful notes while reading, capturing every number and fact that might be important. The prompt for this pass should be specific about what to extract, including revenue figures, expense categories, occupancy rates, and any property-specific metrics. This pass creates the factual foundation that subsequent analysis builds upon.

The second pass performs financial verification and consistency checking. Claude reviews the extracted data for mathematical accuracy, checking that subtotals add up correctly and that percentages align with their underlying numbers. This pass also identifies any unusual variations or potential errors in the data. Property management reports often contain complex calculations around CAM charges, percentage rents, and expense allocations - this verification pass ensures these calculations are correct before drawing conclusions from them.

The third pass generates strategic insights by analyzing trends, comparing current performance to historical patterns, and identifying significant changes. This is where Claude's reasoning capabilities shine, connecting dots that might not be obvious to human analysts. The AI can spot subtle patterns like seasonal variations being stronger than usual, or expense categories growing faster than revenue in ways that suggest operational issues. These insights should always include the "why" behind the numbers, not just the "what."

The fourth and final pass creates specific, actionable recommendations based on the insights discovered. Each action item should be concrete and implementable, with clear ownership and timing. Instead of vague suggestions like "reduce expenses," Claude generates specific recommendations like "Review maintenance contract for Building A, where costs have increased 30% despite 10% fewer service calls - potential opportunity to renegotiate or change vendors by month end."
## Phase 3: Output and Delivery (Days 11-15)

Creating beautiful, actionable output is just as important as the analysis itself. Property managers are busy people who need information presented clearly and concisely. Your delivery system must create reports that are immediately useful, not academic exercises that require interpretation.

### Step 7: Report Generation

The report generation system transforms Claude's analysis into professionally formatted documents that managers actually want to read. Think of this as the difference between raw data and a well-written executive brief - both contain the same information, but only one drives action.

Start with a clean, professional email template that follows a consistent structure. The report should open with an executive summary that captures the three to five most important findings in plain language. Property managers should understand the key issues within 30 seconds of opening your email. Follow this with sections for detailed insights, supporting data, and recommended actions, allowing readers to dive deeper if they choose.

Use visual hierarchy to guide the reader's eye to what matters most. Important metrics should stand out through careful use of formatting, not garish colors or excessive bold text. Include simple tables for financial summaries, but avoid complex charts that require interpretation. Remember, your audience might be reading this on their phone between property visits, so mobile-friendly formatting is essential.

The tone of your reports should be professional but conversational, like a trusted advisor providing counsel. Avoid jargon and explain technical terms when necessary. Each insight should tell a story - what happened, why it matters, and what to do about it. This narrative approach transforms data into decisions.
### Step 8: Automated Delivery and Follow-up

The delivery system completes the cycle, ensuring insights reach the right people at the right time. But delivery isn't just about sending emails - it's about creating a reliable, trustworthy communication channel that users come to depend on.

Configure your email delivery to send from a consistent address with a recognizable sender name. Property managers receive dozens of emails daily, so your reports need to stand out as valuable, not blend into the noise. Use subject lines that convey immediate value, such as "March Financial Analysis for Riverside Properties: 3 Actions Needed" rather than generic titles.

Build in delivery confirmation and tracking to ensure reports reach their destination. While you don't need sophisticated analytics in the MVP, basic open and click tracking helps you understand engagement. If reports consistently go unopened, you might need to adjust timing, formatting, or subject lines.

Create a simple follow-up system that checks whether users have questions or need clarification. This could be as simple as including a footer that invites replies or questions. In the early days, this direct feedback channel is invaluable for improving your system. Users will tell you exactly what additional insights they need or how the format could be improved.

## Phase 4: Testing and Refinement (Days 16-25)

No system is perfect on first build, and Prism Intelligence is no exception. This phase focuses on rigorous testing with real data and iterative improvements based on what you learn. Think of this as tuning a musical instrument - small adjustments that make everything harmonize perfectly.
### Step 9: Real Data Testing

Testing with actual property management reports reveals issues that sample data never will. Real reports come with all the messiness of the business world - inconsistent formatting, missing data, unusual line items, and creative accounting practices. Embracing this complexity during testing makes your system robust for production use.

Start by collecting a diverse set of real reports from different property management systems. Aim for variety in property types, report formats, and accounting methods. Run each report through your system and carefully review the outputs. Look for patterns in what works well and what struggles. Often, you'll discover that certain ERP systems have quirks that need special handling, or that specific property types use terminology that confuses the AI.

Pay special attention to edge cases and error handling. What happens when a report is missing expected sections? How does the system handle corrupted files or password-protected PDFs? These scenarios will absolutely occur in production, so building graceful handling now saves emergency fixes later. Each error should result in a helpful message to users explaining what went wrong and how to fix it.

### Step 10: AI Prompt Refinement

The quality of your AI analysis depends heavily on prompt engineering. This step involves iteratively refining your prompts based on real-world results. Think of this as teaching Claude to be an expert property analyst - you need to provide the right context, ask the right questions, and guide the analysis toward actionable insights.

Review the outputs from your test reports and identify patterns in what's working and what isn't. Perhaps Claude is too verbose in financial summaries or missing important operational metrics. Maybe the action items are too generic or the insights don't connect clearly to the data. Each of these issues can be addressed through prompt refinement.
Develop a systematic approach to prompt improvement. Create variations of each prompt and test them against the same reports to see which produces better results. Document what works and why. For example, you might find that explicitly instructing Claude to "explain changes in plain language a property owner would understand" produces much clearer insights than asking for "financial analysis."

Build a prompt library that handles different report types and scenarios. A balance sheet analysis requires different prompting than an operational report or rent roll. Create specialized prompts for common report types while maintaining a consistent voice and quality standard across all outputs. This library becomes a valuable asset that improves over time.

## Phase 5: Launch Preparation (Days 26-30)

The final phase transforms your working prototype into a system ready for real users. This isn't about perfection - it's about being good enough to deliver value while maintaining reliability and professionalism.

### Step 11: Documentation and Training Materials

Even the best system needs clear documentation to succeed. Create simple, visual guides that show users exactly how to submit reports and what to expect in return. Remember, your early users might not be technically sophisticated, so avoid jargon and focus on benefits rather than features.

Develop a one-page quick start guide that can be emailed to new users. Include screenshots of a sample report submission and the resulting analysis. Show real examples of insights and actions generated by the system. This tangible proof of value overcomes skepticism better than any feature list.

Create internal documentation for system operation and troubleshooting. Document your prompt templates, common errors and their solutions, and the reasoning behind key technical decisions. Your future self will thank you when debugging issues at 2 AM or onboarding new team members.
### Step 12: Initial User Acquisition

Your MVP is only valuable if people use it. Develop a strategy for acquiring your first 10-20 users who will provide crucial feedback and validation. These early adopters shape your product's future, so choose them thoughtfully.

Target property management companies that feel the pain of manual report analysis most acutely. Small to mid-size firms with 10-50 properties often have enough complexity to need help but lack resources for expensive BI tools. They're also more willing to try new solutions and provide direct feedback.

Craft your outreach to focus on specific pain points rather than technology. Lead with "Get actionable insights from your property reports in minutes" rather than "AI-powered analysis platform." Offer a simple trial - analyze their last three monthly reports for free and show them the value directly. This proof of concept approach converts skeptics into believers.

## Conclusion: From MVP to Market Leader

This MVP implementation guide provides the foundation for building Prism Intelligence. By following these steps, you'll create a system that delivers real value to property managers while establishing the technical and operational foundation for future growth.

Remember that the MVP is just the beginning. Every report processed makes the system smarter. Every user interaction teaches you more about market needs. Every feature added expands your moat. The key is starting with something that works and improving continuously based on real-world usage.

The property management industry is ready for this transformation. By building Prism Intelligence, you're not just creating software - you're pioneering a new way of understanding and optimizing property performance. The journey from MVP to market leader starts with these first 30 days of focused execution.

Good luck, and remember: the best time to plant a tree was 20 years ago. The second best time is now. Start building.