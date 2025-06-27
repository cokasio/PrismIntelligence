#!/usr/bin/env python3
"""
Multi-AI Research Orchestrator - Part 2
Main orchestrator class and database management
"""

import asyncio
import json
import csv
import sqlite3
import time
from datetime import datetime
from typing import Dict, List, Optional, Any
import logging
import pandas as pd
from ai_research_system import AIModel, OpenAIModel, ClaudeModel, GeminiModel, DeepSeekModel, ContactInfo

logger = logging.getLogger(__name__)

class MultiAIResearchOrchestrator:
    """Orchestrates multiple AI models for lead research"""
    
    def __init__(self, config_file: str = "ai_config.json"):
        self.models: Dict[str, AIModel] = {}
        self.db_path = "/home/ubuntu/yardi_leads.db"
        self.config = self.load_config(config_file)
        self.setup_models()
        self.setup_database()
        
    def load_config(self, config_file: str) -> Dict:
        """Load configuration from JSON file"""
        try:
            with open(config_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            # Create default config if not exists
            default_config = {
                "models": {
                    "openai": {
                        "enabled": True,
                        "api_key": "your-openai-api-key",
                        "model_name": "gpt-4",
                        "weight": 0.3,
                        "tasks": ["contact_research", "email_verification", "company_analysis"]
                    },
                    "claude": {
                        "enabled": True,
                        "api_key": "your-claude-api-key",
                        "model_name": "claude-3-sonnet-20240229",
                        "weight": 0.3,
                        "tasks": ["contact_research", "email_verification", "company_analysis"]
                    },
                    "gemini": {
                        "enabled": True,
                        "api_key": "your-gemini-api-key",
                        "model_name": "gemini-pro",
                        "weight": 0.2,
                        "tasks": ["contact_research", "company_analysis"]
                    },
                    "deepseek": {
                        "enabled": True,
                        "api_key": "your-deepseek-api-key",
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
            
            with open(config_file, 'w') as f:
                json.dump(default_config, f, indent=2)
            
            logger.info(f"Created default config file: {config_file}")
            logger.info("Please update the API keys in the config file before running.")
            return default_config
    
    def setup_models(self):
        """Initialize AI models based on configuration"""
        for model_name, config in self.config["models"].items():
            if not config["enabled"]:
                continue
                
            api_key = config["api_key"]
            if api_key == f"your-{model_name}-api-key":
                logger.warning(f"Please set API key for {model_name} in config file")
                continue
            
            try:
                if model_name == "openai":
                    self.models[model_name] = OpenAIModel(api_key, config["model_name"])
                elif model_name == "claude":
                    self.models[model_name] = ClaudeModel(api_key, config["model_name"])
                elif model_name == "gemini":
                    self.models[model_name] = GeminiModel(api_key, config["model_name"])
                elif model_name == "deepseek":
                    self.models[model_name] = DeepSeekModel(api_key, config["model_name"])
                
                logger.info(f"Initialized {model_name} model")
            except Exception as e:
                logger.error(f"Failed to initialize {model_name}: {e}")
    
    def setup_database(self):
        """Setup SQLite database with schema"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Companies table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS companies (
            company_id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_name TEXT NOT NULL UNIQUE,
            industry_type TEXT DEFAULT 'Other',
            company_size TEXT DEFAULT 'Unknown',
            headquarters_city TEXT,
            headquarters_state TEXT,
            website_url TEXT,
            linkedin_company_url TEXT,
            employee_count INTEGER,
            yardi_client_status TEXT DEFAULT 'Unknown',
            business_description TEXT,
            pain_points TEXT,
            budget_range TEXT DEFAULT 'Unknown',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            research_status TEXT DEFAULT 'Not Started',
            research_notes TEXT
        )
        ''')
        
        # Contacts table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS contacts (
            contact_id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_id INTEGER NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            job_title TEXT,
            department TEXT,
            seniority_level TEXT DEFAULT 'Other',
            decision_maker_level TEXT DEFAULT 'Unknown',
            email_address TEXT,
            email_verified BOOLEAN DEFAULT FALSE,
            phone_number TEXT,
            phone_verified BOOLEAN DEFAULT FALSE,
            linkedin_profile_url TEXT,
            office_location TEXT,
            years_at_company INTEGER,
            yardi_experience_level TEXT DEFAULT 'Unknown',
            consulting_budget_authority BOOLEAN DEFAULT FALSE,
            preferred_contact_method TEXT DEFAULT 'Email',
            contact_status TEXT DEFAULT 'Active',
            priority_score INTEGER DEFAULT 5,
            confidence_score REAL DEFAULT 0.0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(company_id)
        )
        ''')
        
        # Research activities table
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS research_activities (
            activity_id INTEGER PRIMARY KEY AUTOINCREMENT,
            company_id INTEGER,
            contact_id INTEGER,
            activity_type TEXT NOT NULL,
            activity_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            researcher_name TEXT,
            data_source TEXT,
            findings TEXT,
            confidence_level TEXT DEFAULT 'Medium',
            verification_status TEXT DEFAULT 'Unverified',
            follow_up_needed BOOLEAN DEFAULT FALSE,
            ai_model_used TEXT,
            raw_response TEXT,
            FOREIGN KEY (company_id) REFERENCES companies(company_id),
            FOREIGN KEY (contact_id) REFERENCES contacts(contact_id)
        )
        ''')
        
        # AI consensus table for tracking multiple model responses
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS ai_consensus (
            consensus_id INTEGER PRIMARY KEY AUTOINCREMENT,
            contact_id INTEGER,
            company_id INTEGER,
            research_type TEXT NOT NULL,
            model_responses TEXT,
            consensus_result TEXT,
            confidence_score REAL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (contact_id) REFERENCES contacts(contact_id),
            FOREIGN KEY (company_id) REFERENCES companies(company_id)
        )
        ''')
        
        conn.commit()
        conn.close()
        logger.info("Database setup completed")
    
    async def research_contact_consensus(self, contact_info: ContactInfo) -> Dict[str, Any]:
        """Research contact using multiple AI models and build consensus"""
        tasks = []
        enabled_models = []
        
        # Get models enabled for contact research
        for model_name, model in self.models.items():
            if "contact_research" in self.config["models"][model_name]["tasks"]:
                tasks.append(model.research_contact(contact_info))
                enabled_models.append(model_name)
        
        if not tasks:
            return {"error": "No models enabled for contact research"}
        
        logger.info(f"Researching {contact_info.first_name} {contact_info.last_name} using {len(tasks)} models")
        
        # Execute all model requests concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results and build consensus
        valid_results = []
        model_responses = {}
        
        for i, result in enumerate(results):
            model_name = enabled_models[i]
            if isinstance(result, Exception):
                logger.error(f"Error from {model_name}: {result}")
                model_responses[model_name] = {"error": str(result)}
            elif "error" in result:
                logger.error(f"API error from {model_name}: {result['error']}")
                model_responses[model_name] = result
            else:
                valid_results.append((model_name, result))
                model_responses[model_name] = result
        
        if not valid_results:
            return {"error": "No valid responses from any model", "model_responses": model_responses}
        
        # Build consensus from valid results
        consensus = self.build_contact_consensus(valid_results)
        consensus["model_responses"] = model_responses
        consensus["models_used"] = [name for name, _ in valid_results]
        
        # Store in database
        await self.store_research_results(contact_info, consensus, "contact_research")
        
        return consensus
    
    def build_contact_consensus(self, results: List[tuple]) -> Dict[str, Any]:
        """Build consensus from multiple model results"""
        consensus = {
            "job_title": None,
            "department": None,
            "email": None,
            "linkedin": None,
            "phone": None,
            "seniority_level": None,
            "decision_maker_level": None,
            "confidence_score": 0.0,
            "consensus_strength": 0.0
        }
        
        # Collect all responses for each field
        field_responses = {field: [] for field in consensus.keys() if field not in ["confidence_score", "consensus_strength"]}
        confidence_scores = []
        
        for model_name, result in results:
            weight = self.config["models"][model_name]["weight"]
            
            # Map different field names from different models
            field_mapping = {
                "job_title": ["job_title", "probable_title", "title"],
                "department": ["department"],
                "email": ["email", "email_estimate", "email_address"],
                "linkedin": ["linkedin", "linkedin_url", "linkedin_profile_url"],
                "phone": ["phone", "phone_number"],
                "seniority_level": ["seniority_level", "seniority"],
                "decision_maker_level": ["decision_maker_level", "decision_authority"]
            }
            
            for field, possible_keys in field_mapping.items():
                for key in possible_keys:
                    if key in result and result[key]:
                        field_responses[field].append((result[key], weight))
                        break
            
            # Collect confidence scores
            conf_score = result.get("confidence_score", result.get("confidence", result.get("confidence_level", 50)))
            if isinstance(conf_score, (int, float)):
                confidence_scores.append(conf_score * weight)
        
        # Build consensus for each field
        for field, responses in field_responses.items():
            if responses:
                # For now, use weighted majority or highest confidence response
                # You can implement more sophisticated consensus algorithms here
                consensus[field] = max(responses, key=lambda x: x[1])[0]
        
        # Calculate overall confidence
        if confidence_scores:
            consensus["confidence_score"] = sum(confidence_scores) / sum(self.config["models"][name]["weight"] for name, _ in results)
        
        # Calculate consensus strength (how much models agree)
        consensus["consensus_strength"] = len(results) / len(self.models)
        
        return consensus
    
    async def verify_email_consensus(self, email: str, name: str, company: str) -> Dict[str, Any]:
        """Verify email using multiple AI models"""
        tasks = []
        enabled_models = []
        
        for model_name, model in self.models.items():
            if "email_verification" in self.config["models"][model_name]["tasks"]:
                tasks.append(model.verify_email(email, name, company))
                enabled_models.append(model_name)
        
        if not tasks:
            return {"error": "No models enabled for email verification"}
        
        logger.info(f"Verifying email {email} using {len(tasks)} models")
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        valid_results = []
        model_responses = {}
        
        for i, result in enumerate(results):
            model_name = enabled_models[i]
            if isinstance(result, Exception):
                model_responses[model_name] = {"error": str(result)}
            elif "error" in result:
                model_responses[model_name] = result
            else:
                valid_results.append((model_name, result))
                model_responses[model_name] = result
        
        if not valid_results:
            return {"error": "No valid responses", "model_responses": model_responses}
        
        # Build email verification consensus
        consensus = self.build_email_consensus(valid_results)
        consensus["model_responses"] = model_responses
        
        return consensus
    
    def build_email_consensus(self, results: List[tuple]) -> Dict[str, Any]:
        """Build consensus for email verification"""
        valid_votes = 0
        total_weight = 0
        business_likelihood_scores = []
        alternative_emails = set()
        
        for model_name, result in results:
            weight = self.config["models"][model_name]["weight"]
            total_weight += weight
            
            # Check format validity
            is_valid = result.get("is_valid_format", result.get("valid_format", result.get("format_valid", False)))
            if is_valid:
                valid_votes += weight
            
            # Collect business likelihood scores
            likelihood = result.get("business_likelihood", result.get("business_probability", 50))
            if isinstance(likelihood, (int, float)):
                business_likelihood_scores.append(likelihood * weight)
            
            # Collect alternative email suggestions
            alternatives = result.get("alternative_patterns", result.get("alternative_formats", result.get("alternative_emails", [])))
            if alternatives:
                alternative_emails.update(alternatives)
        
        consensus = {
            "is_valid_format": (valid_votes / total_weight) > 0.5 if total_weight > 0 else False,
            "business_likelihood": sum(business_likelihood_scores) / total_weight if total_weight > 0 else 0,
            "alternative_emails": list(alternative_emails),
            "consensus_confidence": total_weight / sum(self.config["models"][name]["weight"] for name, _ in results)
        }
        
        return consensus
    
    async def analyze_company_consensus(self, company_name: str) -> Dict[str, Any]:
        """Analyze company using multiple AI models"""
        tasks = []
        enabled_models = []
        
        for model_name, model in self.models.items():
            if "company_analysis" in self.config["models"][model_name]["tasks"]:
                tasks.append(model.analyze_company(company_name))
                enabled_models.append(model_name)
        
        if not tasks:
            return {"error": "No models enabled for company analysis"}
        
        logger.info(f"Analyzing company {company_name} using {len(tasks)} models")
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        valid_results = []
        model_responses = {}
        
        for i, result in enumerate(results):
            model_name = enabled_models[i]
            if isinstance(result, Exception):
                model_responses[model_name] = {"error": str(result)}
            elif "error" in result:
                model_responses[model_name] = result
            else:
                valid_results.append((model_name, result))
                model_responses[model_name] = result
        
        if not valid_results:
            return {"error": "No valid responses", "model_responses": model_responses}
        
        consensus = self.build_company_consensus(valid_results)
        consensus["model_responses"] = model_responses
        
        # Store in database
        await self.store_company_analysis(company_name, consensus)
        
        return consensus
    
    def build_company_consensus(self, results: List[tuple]) -> Dict[str, Any]:
        """Build consensus for company analysis"""
        industry_votes = {}
        size_votes = {}
        pain_points = set()
        opportunities = set()
        decision_makers = set()
        websites = []
        linkedin_pages = []
        confidence_scores = []
        
        for model_name, result in results:
            weight = self.config["models"][model_name]["weight"]
            
            # Industry classification
            industry = result.get("industry_type", result.get("industry", result.get("industry_classification")))
            if industry:
                industry_votes[industry] = industry_votes.get(industry, 0) + weight
            
            # Company size
            size = result.get("company_size", result.get("size_estimate"))
            if size:
                size_votes[size] = size_votes.get(size, 0) + weight
            
            # Collect pain points
            points = result.get("pain_points", result.get("business_challenges", result.get("key_challenges", [])))
            if points:
                pain_points.update(points)
            
            # Collect opportunities
            opps = result.get("yardi_opportunities", result.get("consulting_opportunities", []))
            if opps:
                opportunities.update(opps)
            
            # Collect decision maker titles
            titles = result.get("target_titles", result.get("target_decision_makers", result.get("decision_maker_roles", result.get("key_decision_makers", []))))
            if titles:
                decision_makers.update(titles)
            
            # Collect websites and LinkedIn pages
            website = result.get("website_url", result.get("website", result.get("website_estimate")))
            if website:
                websites.append(website)
            
            linkedin = result.get("linkedin_company_url", result.get("linkedin_company", result.get("linkedin_page")))
            if linkedin:
                linkedin_pages.append(linkedin)
            
            # Confidence scores
            conf = result.get("confidence_score", result.get("confidence", 50))
            if isinstance(conf, (int, float)):
                confidence_scores.append(conf * weight)
        
        # Build consensus
        consensus = {
            "industry_type": max(industry_votes.items(), key=lambda x: x[1])[0] if industry_votes else "Other",
            "company_size": max(size_votes.items(), key=lambda x: x[1])[0] if size_votes else "Unknown",
            "pain_points": list(pain_points)[:5],  # Top 5 pain points
            "yardi_opportunities": list(opportunities)[:3],  # Top 3 opportunities
            "target_decision_makers": list(decision_makers)[:5],  # Top 5 titles
            "website_url": websites[0] if websites else None,
            "linkedin_company_url": linkedin_pages[0] if linkedin_pages else None,
            "confidence_score": sum(confidence_scores) / len(results) if confidence_scores else 0
        }
        
        return consensus
    
    async def store_research_results(self, contact_info: ContactInfo, consensus: Dict, research_type: str):
        """Store research results in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Store in ai_consensus table
            cursor.execute('''
            INSERT INTO ai_consensus 
            (contact_id, research_type, model_responses, consensus_result, confidence_score)
            VALUES (?, ?, ?, ?, ?)
            ''', (
                None,  # contact_id will be set when contact is created
                research_type,
                json.dumps(consensus.get("model_responses", {})),
                json.dumps(consensus),
                consensus.get("confidence_score", 0)
            ))
            
            conn.commit()
        except Exception as e:
            logger.error(f"Error storing research results: {e}")
        finally:
            conn.close()
    
    async def store_company_analysis(self, company_name: str, analysis: Dict):
        """Store company analysis in database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # Update or insert company
            cursor.execute('''
            INSERT OR REPLACE INTO companies 
            (company_name, industry_type, company_size, website_url, linkedin_company_url, 
             pain_points, research_status, research_notes, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                company_name,
                analysis.get("industry_type", "Other"),
                analysis.get("company_size", "Unknown"),
                analysis.get("website_url"),
                analysis.get("linkedin_company_url"),
                "; ".join(analysis.get("pain_points", [])),
                "AI Analyzed",
                json.dumps(analysis),
                datetime.now().isoformat()
            ))
            
            conn.commit()
        except Exception as e:
            logger.error(f"Error storing company analysis: {e}")
        finally:
            conn.close()
    
    async def process_csv_contacts(self, csv_file: str, max_contacts: int = 10):
        """Process contacts from CSV file"""
        df = pd.read_csv(csv_file)
        
        processed = 0
        for _, row in df.iterrows():
            if processed >= max_contacts:
                break
            
            contact_info = ContactInfo(
                first_name=row.get("first_name", ""),
                last_name=row.get("last_name", ""),
                company_name=row.get("company_name", "")
            )
            
            logger.info(f"Processing {contact_info.first_name} {contact_info.last_name} at {contact_info.company_name}")
            
            # Research contact
            contact_result = await self.research_contact_consensus(contact_info)
            
            # Analyze company if not already done
            company_result = await self.analyze_company_consensus(contact_info.company_name)
            
            # Verify email if found
            if contact_result.get("email"):
                email_result = await self.verify_email_consensus(
                    contact_result["email"],
                    f"{contact_info.first_name} {contact_info.last_name}",
                    contact_info.company_name
                )
                contact_result["email_verification"] = email_result
            
            # Rate limiting
            await asyncio.sleep(self.config["research_settings"]["rate_limit_delay"])
            
            processed += 1
        
        logger.info(f"Processed {processed} contacts")
    
    def export_results_to_csv(self, output_file: str = "ai_research_results.csv"):
        """Export research results to CSV"""
        conn = sqlite3.connect(self.db_path)
        
        query = '''
        SELECT 
            c.first_name,
            c.last_name,
            c.job_title,
            c.email_address,
            c.phone_number,
            c.linkedin_profile_url,
            c.seniority_level,
            c.decision_maker_level,
            c.confidence_score,
            comp.company_name,
            comp.industry_type,
            comp.company_size,
            comp.website_url,
            comp.pain_points
        FROM contacts c
        JOIN companies comp ON c.company_id = comp.company_id
        WHERE c.confidence_score > ?
        ORDER BY c.confidence_score DESC
        '''
        
        df = pd.read_sql_query(query, conn, params=[self.config["research_settings"]["min_confidence_score"]])
        df.to_csv(output_file, index=False)
        
        conn.close()
        logger.info(f"Exported {len(df)} contacts to {output_file}")

# Continue with usage example and configuration in next file...

