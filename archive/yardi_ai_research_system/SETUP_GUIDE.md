# Multi-AI Lead Research System - Setup & Usage Guide

## Overview

This system uses multiple AI models (OpenAI, Claude, Gemini, DeepSeek) to automatically research contact information for your Yardi consulting leads. It builds consensus from multiple AI responses to provide more accurate and reliable results.

## Features

- **Multi-AI Consensus**: Uses 4 different AI models and builds consensus for higher accuracy
- **Modular Design**: Easy to add new AI models or disable existing ones
- **Configurable Weights**: Assign different importance weights to each AI model
- **Task Specialization**: Configure which models handle which types of research
- **Database Integration**: Stores all results in SQLite database with proper relationships
- **Rate Limiting**: Respects API rate limits and prevents overuse
- **Batch Processing**: Process large CSV files efficiently
- **Email Verification**: Multi-model email address validation
- **Company Analysis**: Comprehensive business intelligence gathering

## Installation

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Set Up Configuration
```bash
python main_research.py
```
This will create `ai_config.json` with placeholder API keys.

### 3. Add Your API Keys
Edit `ai_config.json` and add your actual API keys:

```json
{
  "models": {
    "openai": {
      "enabled": true,
      "api_key": "sk-your-actual-openai-key",
      "model_name": "gpt-4",
      "weight": 0.3,
      "tasks": ["contact_research", "email_verification", "company_analysis"]
    },
    "claude": {
      "enabled": true,
      "api_key": "sk-ant-your-actual-claude-key",
      "model_name": "claude-3-sonnet-20240229",
      "weight": 0.3,
      "tasks": ["contact_research", "email_verification", "company_analysis"]
    },
    "gemini": {
      "enabled": true,
      "api_key": "your-actual-gemini-key",
      "model_name": "gemini-pro",
      "weight": 0.2,
      "tasks": ["contact_research", "company_analysis"]
    },
    "deepseek": {
      "enabled": true,
      "api_key": "your-actual-deepseek-key",
      "model_name": "deepseek-chat",
      "weight": 0.2,
      "tasks": ["contact_research", "email_verification"]
    }
  }
}
```

## Getting API Keys

### OpenAI (GPT-4)
1. Go to https://platform.openai.com/api-keys
2. Create new API key
3. Copy the key (starts with `sk-`)

### Claude (Anthropic)
1. Go to https://console.anthropic.com/
2. Create API key in settings
3. Copy the key (starts with `sk-ant-`)

### Gemini (Google)
1. Go to https://makersuite.google.com/app/apikey
2. Create new API key
3. Copy the key

### DeepSeek
1. Go to https://platform.deepseek.com/api_keys
2. Create new API key
3. Copy the key

## Usage Examples

### 1. Research Single Contact
```python
import asyncio
from main_research import YardiLeadResearcher

async def research_contact():
    researcher = YardiLeadResearcher()
    result = await researcher.research_single_contact(
        "Robert", "Goldman", "Z Modular"
    )
    return result

# Run it
asyncio.run(research_contact())
```

### 2. Research Priority Targets
```python
async def research_priorities():
    researcher = YardiLeadResearcher()
    results = await researcher.research_priority_targets()
    return results

asyncio.run(research_priorities())
```

### 3. Batch Process CSV File
```python
async def batch_process():
    researcher = YardiLeadResearcher()
    await researcher.batch_process_csv("your_contacts.csv", max_contacts=50)

asyncio.run(batch_process())
```

### 4. Configure Model Selection
```python
researcher = YardiLeadResearcher()

# Use OpenAI for contact research, Claude for email verification
researcher.configure_model_selection({
    "openai": ["contact_research", "company_analysis"],
    "claude": ["email_verification"],
    "gemini": ["company_analysis"],
    "deepseek": ["contact_research"]
})
```

### 5. Add Custom AI Model
```python
# Example: Add a custom model
class CustomAIModel(AIModel):
    async def research_contact(self, contact_info):
        # Your custom implementation
        return {"job_title": "Custom Result"}

researcher.add_custom_model(
    "custom_model",
    CustomAIModel,
    "your-api-key",
    {
        "model_name": "custom-model-v1",
        "weight": 0.1,
        "tasks": ["contact_research"]
    }
)
```

## Configuration Options

### Model Weights
Control how much each model influences the final consensus:
```json
"weight": 0.3  // 30% influence on final result
```

### Task Assignment
Control which models handle which research tasks:
```json
"tasks": [
    "contact_research",     // Research individual contacts
    "email_verification",   // Verify email addresses
    "company_analysis"      // Analyze companies
]
```

### Research Settings
```json
"research_settings": {
    "consensus_threshold": 0.7,      // Minimum agreement for consensus
    "min_confidence_score": 60,      // Minimum confidence to include results
    "max_concurrent_requests": 5,    // Parallel API requests
    "rate_limit_delay": 2.0         // Seconds between requests
}
```

## Output Formats

### Contact Research Results
```json
{
    "job_title": "Director Asset Management",
    "department": "Real Estate",
    "email": "robert.goldman@z-modular.com",
    "linkedin": "https://linkedin.com/in/robertmgoldman",
    "phone": "925-788-XXXX",
    "seniority_level": "Director",
    "decision_maker_level": "Secondary",
    "confidence_score": 85.5,
    "models_used": ["openai", "claude", "deepseek"]
}
```

### Company Analysis Results
```json
{
    "industry_type": "Real Estate Development",
    "company_size": "Medium (51-200)",
    "pain_points": [
        "Development-to-operations transition",
        "Asset performance tracking",
        "Scaling operations"
    ],
    "yardi_opportunities": [
        "Enterprise asset management",
        "Development modules",
        "Portfolio optimization"
    ],
    "target_decision_makers": ["CEO", "COO", "Director of Operations"],
    "website_url": "https://z-modular.com",
    "confidence_score": 78.2
}
```

### Email Verification Results
```json
{
    "is_valid_format": true,
    "business_likelihood": 85,
    "alternative_emails": [
        "r.goldman@z-modular.com",
        "rgoldman@z-modular.com"
    ],
    "consensus_confidence": 0.8
}
```

## Database Schema

The system creates SQLite database with these tables:

- **companies**: Company information and analysis
- **contacts**: Individual contact details
- **research_activities**: Research findings and sources
- **ai_consensus**: Multi-model consensus results

## Cost Management

### Estimated API Costs (per contact):
- **OpenAI GPT-4**: ~$0.03-0.06 per contact
- **Claude**: ~$0.02-0.04 per contact
- **Gemini**: ~$0.01-0.02 per contact
- **DeepSeek**: ~$0.005-0.01 per contact

**Total per contact**: ~$0.065-0.13

### Cost Optimization:
1. **Disable expensive models** for large batches
2. **Use task specialization** (different models for different tasks)
3. **Adjust rate limiting** to stay within free tiers
4. **Set confidence thresholds** to avoid re-processing

## Troubleshooting

### Common Issues:

1. **API Key Errors**
   - Verify keys are correct and have sufficient credits
   - Check API key permissions and rate limits

2. **Rate Limiting**
   - Increase `rate_limit_delay` in config
   - Reduce `max_concurrent_requests`

3. **Low Confidence Scores**
   - Check if contact names/companies are spelled correctly
   - Verify companies actually exist
   - Lower `min_confidence_score` threshold

4. **Database Errors**
   - Ensure write permissions in directory
   - Check SQLite installation

### Debug Mode:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Advanced Features

### 1. Custom Consensus Algorithms
Modify `build_contact_consensus()` in `ai_orchestrator.py` to implement custom consensus logic.

### 2. Web Scraping Integration
Add web scraping to supplement AI research:
```python
# Add to custom model
async def scrape_linkedin(self, name, company):
    # Your scraping implementation
    pass
```

### 3. Email Verification Services
Integrate with Hunter.io, Apollo, etc.:
```python
# Add to email verification
async def verify_with_hunter(self, email):
    # Hunter.io API integration
    pass
```

### 4. CRM Integration
Export directly to Salesforce, HubSpot, etc.:
```python
def export_to_crm(self, results):
    # CRM API integration
    pass
```

## Best Practices

1. **Start Small**: Test with 5-10 contacts first
2. **Monitor Costs**: Track API usage and costs
3. **Verify Results**: Always verify critical contact information
4. **Respect Rate Limits**: Don't overwhelm APIs
5. **Keep Backups**: Regular database backups
6. **Update Regularly**: Keep API keys and models current

## Support

For issues or questions:
1. Check the logs in `ai_research.log`
2. Review API documentation for each service
3. Test individual models to isolate problems
4. Verify database integrity with SQLite browser

This system transforms your lead research from manual hours to automated minutes while providing higher accuracy through AI consensus.

