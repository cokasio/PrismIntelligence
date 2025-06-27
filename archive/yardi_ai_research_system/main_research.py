#!/usr/bin/env python3
"""
Main execution script for Multi-AI Lead Research System
Usage example and configuration management
"""

import asyncio
import json
import logging
from ai_orchestrator import MultiAIResearchOrchestrator, ContactInfo

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('ai_research.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class YardiLeadResearcher:
    """Main class for Yardi consulting lead research"""
    
    def __init__(self, config_file: str = "ai_config.json"):
        self.orchestrator = MultiAIResearchOrchestrator(config_file)
        
    async def research_single_contact(self, first_name: str, last_name: str, company: str):
        """Research a single contact"""
        contact_info = ContactInfo(
            first_name=first_name,
            last_name=last_name,
            company_name=company
        )
        
        logger.info(f"Starting research for {first_name} {last_name} at {company}")
        
        # Research contact
        contact_result = await self.orchestrator.research_contact_consensus(contact_info)
        
        # Analyze company
        company_result = await self.orchestrator.analyze_company_consensus(company)
        
        # Verify email if found
        email_verification = None
        if contact_result.get("email"):
            email_verification = await self.orchestrator.verify_email_consensus(
                contact_result["email"],
                f"{first_name} {last_name}",
                company
            )
        
        # Compile results
        results = {
            "contact": contact_result,
            "company": company_result,
            "email_verification": email_verification
        }
        
        # Print summary
        self.print_research_summary(first_name, last_name, company, results)
        
        return results
    
    def print_research_summary(self, first_name: str, last_name: str, company: str, results: dict):
        """Print formatted research summary"""
        print(f"\n{'='*60}")
        print(f"RESEARCH SUMMARY: {first_name} {last_name} at {company}")
        print(f"{'='*60}")
        
        # Contact information
        contact = results.get("contact", {})
        if "error" not in contact:
            print(f"\n📧 CONTACT INFORMATION:")
            print(f"   Job Title: {contact.get('job_title', 'Unknown')}")
            print(f"   Department: {contact.get('department', 'Unknown')}")
            print(f"   Email: {contact.get('email', 'Not found')}")
            print(f"   LinkedIn: {contact.get('linkedin', 'Not found')}")
            print(f"   Phone: {contact.get('phone', 'Not found')}")
            print(f"   Seniority: {contact.get('seniority_level', 'Unknown')}")
            print(f"   Decision Authority: {contact.get('decision_maker_level', 'Unknown')}")
            print(f"   Confidence Score: {contact.get('confidence_score', 0):.1f}%")
            print(f"   Models Used: {', '.join(contact.get('models_used', []))}")
        else:
            print(f"\n❌ CONTACT RESEARCH ERROR: {contact['error']}")
        
        # Company information
        company_info = results.get("company", {})
        if "error" not in company_info:
            print(f"\n🏢 COMPANY ANALYSIS:")
            print(f"   Industry: {company_info.get('industry_type', 'Unknown')}")
            print(f"   Size: {company_info.get('company_size', 'Unknown')}")
            print(f"   Website: {company_info.get('website_url', 'Not found')}")
            print(f"   LinkedIn: {company_info.get('linkedin_company_url', 'Not found')}")
            print(f"   Pain Points: {', '.join(company_info.get('pain_points', [])[:3])}")
            print(f"   Yardi Opportunities: {', '.join(company_info.get('yardi_opportunities', [])[:2])}")
            print(f"   Target Decision Makers: {', '.join(company_info.get('target_decision_makers', [])[:3])}")
        else:
            print(f"\n❌ COMPANY ANALYSIS ERROR: {company_info['error']}")
        
        # Email verification
        email_ver = results.get("email_verification")
        if email_ver and "error" not in email_ver:
            print(f"\n✉️ EMAIL VERIFICATION:")
            print(f"   Valid Format: {'✅' if email_ver.get('is_valid_format') else '❌'}")
            print(f"   Business Likelihood: {email_ver.get('business_likelihood', 0):.1f}%")
            print(f"   Alternative Emails: {', '.join(email_ver.get('alternative_emails', [])[:3])}")
        elif email_ver and "error" in email_ver:
            print(f"\n❌ EMAIL VERIFICATION ERROR: {email_ver['error']}")
        
        print(f"\n{'='*60}\n")
    
    async def research_priority_targets(self):
        """Research the high-priority targets from your database"""
        priority_targets = [
            ("Robert", "Goldman", "Z Modular"),
            ("Erica", "Gunnison", "Zekelman Industries"),
            ("Manoah", "Williams", "Z Modular"),
            ("Dan", "Woodhead", "Yardi Systems Inc"),
            ("Gabriela", "Arceo", "Tawani Enterprises Inc"),
            ("Jason", "Whitehead", "Phenix City Housing Authority"),
            ("Angela", "Birckhead", "Commonwealth Senior Living LLC")
        ]
        
        results = []
        for first_name, last_name, company in priority_targets:
            try:
                result = await self.research_single_contact(first_name, last_name, company)
                results.append({
                    "name": f"{first_name} {last_name}",
                    "company": company,
                    "result": result
                })
                
                # Rate limiting between requests
                await asyncio.sleep(2)
                
            except Exception as e:
                logger.error(f"Error researching {first_name} {last_name}: {e}")
        
        return results
    
    async def batch_process_csv(self, csv_file: str, max_contacts: int = 20):
        """Process contacts from CSV file in batches"""
        logger.info(f"Starting batch processing of {csv_file}")
        await self.orchestrator.process_csv_contacts(csv_file, max_contacts)
        
        # Export results
        self.orchestrator.export_results_to_csv("ai_research_results.csv")
        logger.info("Batch processing completed")
    
    def add_custom_model(self, model_name: str, model_class, api_key: str, model_config: dict):
        """Add a custom AI model to the orchestrator"""
        try:
            # Initialize the custom model
            custom_model = model_class(api_key, model_config.get("model_name", "default"))
            
            # Add to orchestrator
            self.orchestrator.models[model_name] = custom_model
            
            # Update config
            self.orchestrator.config["models"][model_name] = {
                "enabled": True,
                "api_key": api_key,
                "weight": model_config.get("weight", 0.1),
                "tasks": model_config.get("tasks", ["contact_research"])
            }
            
            logger.info(f"Added custom model: {model_name}")
            
        except Exception as e:
            logger.error(f"Error adding custom model {model_name}: {e}")
    
    def configure_model_selection(self, model_tasks: dict):
        """Configure which models to use for which tasks"""
        for model_name, tasks in model_tasks.items():
            if model_name in self.orchestrator.config["models"]:
                self.orchestrator.config["models"][model_name]["tasks"] = tasks
                logger.info(f"Updated tasks for {model_name}: {tasks}")

def create_sample_config():
    """Create a sample configuration file with API key placeholders"""
    config = {
        "models": {
            "openai": {
                "enabled": True,
                "api_key": "sk-your-openai-api-key-here",
                "model_name": "gpt-4",
                "weight": 0.3,
                "tasks": ["contact_research", "email_verification", "company_analysis"]
            },
            "claude": {
                "enabled": True,
                "api_key": "sk-ant-your-claude-api-key-here",
                "model_name": "claude-3-sonnet-20240229",
                "weight": 0.3,
                "tasks": ["contact_research", "email_verification", "company_analysis"]
            },
            "gemini": {
                "enabled": True,
                "api_key": "your-gemini-api-key-here",
                "model_name": "gemini-pro",
                "weight": 0.2,
                "tasks": ["contact_research", "company_analysis"]
            },
            "deepseek": {
                "enabled": True,
                "api_key": "your-deepseek-api-key-here",
                "model_name": "deepseek-chat",
                "weight": 0.2,
                "tasks": ["contact_research", "email_verification"]
            }
        },
        "research_settings": {
            "consensus_threshold": 0.7,
            "min_confidence_score": 60,
            "max_concurrent_requests": 5,
            "rate_limit_delay": 2.0
        }
    }
    
    with open("ai_config.json", "w") as f:
        json.dump(config, f, indent=2)
    
    print("Created ai_config.json - Please update with your actual API keys")

async def main():
    """Main execution function with examples"""
    
    # Create sample config if it doesn't exist
    try:
        with open("ai_config.json", "r") as f:
            config = json.load(f)
    except FileNotFoundError:
        create_sample_config()
        print("Please update ai_config.json with your API keys and run again")
        return
    
    # Initialize researcher
    researcher = YardiLeadResearcher()
    
    # Example 1: Research a single contact
    print("Example 1: Single Contact Research")
    await researcher.research_single_contact("Robert", "Goldman", "Z Modular")
    
    # Example 2: Research priority targets
    print("\nExample 2: Priority Targets Research")
    # Uncomment to run all priority targets
    # await researcher.research_priority_targets()
    
    # Example 3: Batch process CSV
    print("\nExample 3: Batch Processing")
    # Uncomment to process your CSV file
    # await researcher.batch_process_csv("extracted_companies.csv", max_contacts=10)
    
    # Example 4: Configure model selection
    print("\nExample 4: Model Configuration")
    researcher.configure_model_selection({
        "openai": ["contact_research", "company_analysis"],
        "claude": ["email_verification"],
        "gemini": ["company_analysis"],
        "deepseek": ["contact_research"]
    })

if __name__ == "__main__":
    # Run the main function
    asyncio.run(main())

