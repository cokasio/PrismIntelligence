#!/usr/bin/env python3
"""
Multi-AI Lead Research System for Yardi Consulting
Uses OpenAI, Claude, Gemini, and DeepSeek to research contact information
"""

import asyncio
import json
import csv
import sqlite3
import requests
import time
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from abc import ABC, abstractmethod
import logging
import os
from concurrent.futures import ThreadPoolExecutor
import pandas as pd

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@dataclass
class ContactInfo:
    """Data structure for contact information"""
    first_name: str
    last_name: str
    company_name: str
    job_title: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    department: Optional[str] = None
    seniority_level: Optional[str] = None
    decision_maker_level: Optional[str] = None
    confidence_score: float = 0.0
    sources: List[str] = None

    def __post_init__(self):
        if self.sources is None:
            self.sources = []

class AIModel(ABC):
    """Abstract base class for AI models"""
    
    def __init__(self, api_key: str, model_name: str):
        self.api_key = api_key
        self.model_name = model_name
        self.rate_limit_delay = 1.0  # seconds between requests
        
    @abstractmethod
    async def research_contact(self, contact_info: ContactInfo) -> Dict[str, Any]:
        """Research contact information using this AI model"""
        pass
    
    @abstractmethod
    async def verify_email(self, email: str, name: str, company: str) -> Dict[str, Any]:
        """Verify email address using this AI model"""
        pass
    
    @abstractmethod
    async def analyze_company(self, company_name: str) -> Dict[str, Any]:
        """Analyze company information using this AI model"""
        pass

class OpenAIModel(AIModel):
    """OpenAI GPT model implementation"""
    
    def __init__(self, api_key: str, model_name: str = "gpt-4"):
        super().__init__(api_key, model_name)
        self.base_url = "https://api.openai.com/v1/chat/completions"
        
    async def _make_request(self, messages: List[Dict], temperature: float = 0.3) -> Dict:
        """Make request to OpenAI API"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model_name,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": 1000
        }
        
        try:
            response = requests.post(self.base_url, headers=headers, json=payload)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return {"error": str(e)}
    
    async def research_contact(self, contact_info: ContactInfo) -> Dict[str, Any]:
        """Research contact using OpenAI"""
        prompt = f"""
        Research the following person for Yardi consulting lead qualification:
        
        Name: {contact_info.first_name} {contact_info.last_name}
        Company: {contact_info.company_name}
        
        Please provide:
        1. Most likely job title and department
        2. Estimated email address (common business patterns)
        3. LinkedIn profile URL (standard format)
        4. Seniority level (C-Level, VP/SVP, Director, Manager, Analyst, Other)
        5. Decision-making authority for software consulting (Primary, Secondary, Influencer, Unknown)
        6. Phone number if publicly available
        7. Confidence score (0-100) for the information
        
        Focus on property management, real estate, housing authority, or senior living roles.
        
        Return as JSON format:
        {{
            "job_title": "...",
            "department": "...",
            "email": "...",
            "linkedin": "...",
            "phone": "...",
            "seniority_level": "...",
            "decision_maker_level": "...",
            "confidence_score": 85,
            "reasoning": "...",
            "sources_suggested": ["LinkedIn", "Company website", "Professional directories"]
        }}
        """
        
        messages = [
            {"role": "system", "content": "You are an expert B2B lead researcher specializing in property management and real estate industry contacts."},
            {"role": "user", "content": prompt}
        ]
        
        response = await self._make_request(messages)
        
        if "error" in response:
            return response
            
        try:
            content = response["choices"][0]["message"]["content"]
            # Extract JSON from response
            start = content.find("{")
            end = content.rfind("}") + 1
            json_str = content[start:end]
            result = json.loads(json_str)
            result["model"] = "OpenAI " + self.model_name
            return result
        except Exception as e:
            logger.error(f"Error parsing OpenAI response: {e}")
            return {"error": f"Parse error: {e}"}
    
    async def verify_email(self, email: str, name: str, company: str) -> Dict[str, Any]:
        """Verify email address using OpenAI"""
        prompt = f"""
        Analyze this email address for validity and business appropriateness:
        
        Email: {email}
        Name: {name}
        Company: {company}
        
        Evaluate:
        1. Email format validity
        2. Domain appropriateness for the company
        3. Likelihood this is a real business email
        4. Alternative email patterns to try
        5. Confidence score (0-100)
        
        Return as JSON:
        {{
            "is_valid_format": true/false,
            "domain_match": true/false,
            "business_likelihood": 85,
            "alternative_patterns": ["alt1@domain.com", "alt2@domain.com"],
            "confidence_score": 75,
            "reasoning": "..."
        }}
        """
        
        messages = [
            {"role": "system", "content": "You are an expert email verification analyst."},
            {"role": "user", "content": prompt}
        ]
        
        response = await self._make_request(messages)
        
        if "error" in response:
            return response
            
        try:
            content = response["choices"][0]["message"]["content"]
            start = content.find("{")
            end = content.rfind("}") + 1
            json_str = content[start:end]
            result = json.loads(json_str)
            result["model"] = "OpenAI " + self.model_name
            return result
        except Exception as e:
            return {"error": f"Parse error: {e}"}
    
    async def analyze_company(self, company_name: str) -> Dict[str, Any]:
        """Analyze company using OpenAI"""
        prompt = f"""
        Analyze this company for Yardi consulting opportunities:
        
        Company: {company_name}
        
        Provide:
        1. Industry classification (Property Management, Housing Authority, REIT, Senior Living, etc.)
        2. Estimated company size (Small 1-50, Medium 51-200, Large 201-1000, Enterprise 1000+)
        3. Likely pain points related to property management
        4. Yardi consulting opportunities
        5. Decision-maker titles to target
        6. Budget range estimate for consulting services
        7. Website URL if known
        8. LinkedIn company page URL
        
        Return as JSON:
        {{
            "industry_type": "...",
            "company_size": "...",
            "pain_points": ["...", "...", "..."],
            "yardi_opportunities": ["...", "...", "..."],
            "target_titles": ["...", "...", "..."],
            "budget_range": "...",
            "website_url": "...",
            "linkedin_company_url": "...",
            "confidence_score": 85
        }}
        """
        
        messages = [
            {"role": "system", "content": "You are an expert business analyst specializing in property management and real estate companies."},
            {"role": "user", "content": prompt}
        ]
        
        response = await self._make_request(messages)
        
        if "error" in response:
            return response
            
        try:
            content = response["choices"][0]["message"]["content"]
            start = content.find("{")
            end = content.rfind("}") + 1
            json_str = content[start:end]
            result = json.loads(json_str)
            result["model"] = "OpenAI " + self.model_name
            return result
        except Exception as e:
            return {"error": f"Parse error: {e}"}

class ClaudeModel(AIModel):
    """Anthropic Claude model implementation"""
    
    def __init__(self, api_key: str, model_name: str = "claude-3-sonnet-20240229"):
        super().__init__(api_key, model_name)
        self.base_url = "https://api.anthropic.com/v1/messages"
        
    async def _make_request(self, prompt: str, temperature: float = 0.3) -> Dict:
        """Make request to Claude API"""
        headers = {
            "x-api-key": self.api_key,
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01"
        }
        
        payload = {
            "model": self.model_name,
            "max_tokens": 1000,
            "temperature": temperature,
            "messages": [
                {"role": "user", "content": prompt}
            ]
        }
        
        try:
            response = requests.post(self.base_url, headers=headers, json=payload)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Claude API error: {e}")
            return {"error": str(e)}
    
    async def research_contact(self, contact_info: ContactInfo) -> Dict[str, Any]:
        """Research contact using Claude"""
        prompt = f"""
        As an expert B2B researcher, analyze this contact for Yardi consulting lead qualification:
        
        Name: {contact_info.first_name} {contact_info.last_name}
        Company: {contact_info.company_name}
        
        Research and provide:
        1. Most probable job title and department
        2. Professional email address (use common business patterns)
        3. LinkedIn profile URL (standard linkedin.com/in/firstname-lastname format)
        4. Seniority classification: C-Level, VP/SVP, Director, Manager, Analyst, Other
        5. Decision-making authority: Primary, Secondary, Influencer, Unknown
        6. Phone number if publicly available
        7. Confidence score (0-100)
        
        Focus on roles relevant to property management software decisions.
        
        Respond in JSON format only:
        {{
            "job_title": "estimated title",
            "department": "department name",
            "email": "firstname.lastname@company.com",
            "linkedin": "https://linkedin.com/in/firstname-lastname",
            "phone": "phone if available",
            "seniority_level": "classification",
            "decision_maker_level": "authority level",
            "confidence_score": 85,
            "reasoning": "explanation of estimates"
        }}
        """
        
        response = await self._make_request(prompt)
        
        if "error" in response:
            return response
            
        try:
            content = response["content"][0]["text"]
            start = content.find("{")
            end = content.rfind("}") + 1
            json_str = content[start:end]
            result = json.loads(json_str)
            result["model"] = "Claude " + self.model_name
            return result
        except Exception as e:
            logger.error(f"Error parsing Claude response: {e}")
            return {"error": f"Parse error: {e}"}
    
    async def verify_email(self, email: str, name: str, company: str) -> Dict[str, Any]:
        """Verify email using Claude"""
        prompt = f"""
        Analyze this email address for business validity:
        
        Email: {email}
        Person: {name}
        Company: {company}
        
        Evaluate and return JSON only:
        {{
            "is_valid_format": true/false,
            "domain_appropriate": true/false,
            "business_likelihood": 0-100,
            "alternative_formats": ["alt1@domain.com", "alt2@domain.com"],
            "confidence_score": 0-100,
            "reasoning": "analysis explanation"
        }}
        """
        
        response = await self._make_request(prompt)
        
        if "error" in response:
            return response
            
        try:
            content = response["content"][0]["text"]
            start = content.find("{")
            end = content.rfind("}") + 1
            json_str = content[start:end]
            result = json.loads(json_str)
            result["model"] = "Claude " + self.model_name
            return result
        except Exception as e:
            return {"error": f"Parse error: {e}"}
    
    async def analyze_company(self, company_name: str) -> Dict[str, Any]:
        """Analyze company using Claude"""
        prompt = f"""
        Analyze this company for Yardi property management consulting opportunities:
        
        Company: {company_name}
        
        Provide analysis in JSON format only:
        {{
            "industry_type": "Property Management/Housing Authority/REIT/Senior Living/Other",
            "company_size": "Small (1-50)/Medium (51-200)/Large (201-1000)/Enterprise (1000+)",
            "pain_points": ["pain point 1", "pain point 2", "pain point 3"],
            "yardi_opportunities": ["opportunity 1", "opportunity 2"],
            "target_decision_makers": ["CEO", "COO", "Director of Operations"],
            "estimated_budget": "$50K-$100K/$100K-$250K/$250K-$500K/$500K+",
            "website_url": "estimated website",
            "linkedin_company_url": "estimated LinkedIn page",
            "confidence_score": 0-100
        }}
        """
        
        response = await self._make_request(prompt)
        
        if "error" in response:
            return response
            
        try:
            content = response["content"][0]["text"]
            start = content.find("{")
            end = content.rfind("}") + 1
            json_str = content[start:end]
            result = json.loads(json_str)
            result["model"] = "Claude " + self.model_name
            return result
        except Exception as e:
            return {"error": f"Parse error: {e}"}

class GeminiModel(AIModel):
    """Google Gemini model implementation"""
    
    def __init__(self, api_key: str, model_name: str = "gemini-pro"):
        super().__init__(api_key, model_name)
        self.base_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent"
        
    async def _make_request(self, prompt: str, temperature: float = 0.3) -> Dict:
        """Make request to Gemini API"""
        headers = {
            "Content-Type": "application/json"
        }
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": 1000
            }
        }
        
        try:
            response = requests.post(f"{self.base_url}?key={self.api_key}", headers=headers, json=payload)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return {"error": str(e)}
    
    async def research_contact(self, contact_info: ContactInfo) -> Dict[str, Any]:
        """Research contact using Gemini"""
        prompt = f"""
        Research this business contact for property management software consulting:
        
        Name: {contact_info.first_name} {contact_info.last_name}
        Company: {contact_info.company_name}
        
        Provide professional analysis in JSON format:
        {{
            "job_title": "estimated professional title",
            "department": "likely department",
            "email": "professional email estimate",
            "linkedin": "LinkedIn profile URL",
            "phone": "phone if available",
            "seniority_level": "C-Level/VP/SVP/Director/Manager/Analyst/Other",
            "decision_maker_level": "Primary/Secondary/Influencer/Unknown",
            "confidence_score": 85,
            "analysis": "reasoning for estimates"
        }}
        
        Focus on property management, real estate, and housing industry roles.
        """
        
        response = await self._make_request(prompt)
        
        if "error" in response:
            return response
            
        try:
            content = response["candidates"][0]["content"]["parts"][0]["text"]
            start = content.find("{")
            end = content.rfind("}") + 1
            json_str = content[start:end]
            result = json.loads(json_str)
            result["model"] = "Gemini " + self.model_name
            return result
        except Exception as e:
            logger.error(f"Error parsing Gemini response: {e}")
            return {"error": f"Parse error: {e}"}
    
    async def verify_email(self, email: str, name: str, company: str) -> Dict[str, Any]:
        """Verify email using Gemini"""
        prompt = f"""
        Verify this business email address:
        
        Email: {email}
        Name: {name}
        Company: {company}
        
        Return JSON analysis:
        {{
            "format_valid": true/false,
            "domain_match": true/false,
            "business_probability": 0-100,
            "alternative_emails": ["option1@domain.com", "option2@domain.com"],
            "confidence_score": 0-100,
            "analysis": "detailed reasoning"
        }}
        """
        
        response = await self._make_request(prompt)
        
        if "error" in response:
            return response
            
        try:
            content = response["candidates"][0]["content"]["parts"][0]["text"]
            start = content.find("{")
            end = content.rfind("}") + 1
            json_str = content[start:end]
            result = json.loads(json_str)
            result["model"] = "Gemini " + self.model_name
            return result
        except Exception as e:
            return {"error": f"Parse error: {e}"}
    
    async def analyze_company(self, company_name: str) -> Dict[str, Any]:
        """Analyze company using Gemini"""
        prompt = f"""
        Analyze this company for property management consulting opportunities:
        
        Company: {company_name}
        
        Return JSON analysis:
        {{
            "industry": "industry classification",
            "size_estimate": "company size category",
            "business_challenges": ["challenge 1", "challenge 2", "challenge 3"],
            "consulting_opportunities": ["opportunity 1", "opportunity 2"],
            "key_decision_makers": ["title 1", "title 2", "title 3"],
            "budget_estimate": "budget range",
            "website": "estimated website URL",
            "linkedin_company": "LinkedIn company page",
            "confidence": 0-100
        }}
        """
        
        response = await self._make_request(prompt)
        
        if "error" in response:
            return response
            
        try:
            content = response["candidates"][0]["content"]["parts"][0]["text"]
            start = content.find("{")
            end = content.rfind("}") + 1
            json_str = content[start:end]
            result = json.loads(json_str)
            result["model"] = "Gemini " + self.model_name
            return result
        except Exception as e:
            return {"error": f"Parse error: {e}"}

class DeepSeekModel(AIModel):
    """DeepSeek model implementation"""
    
    def __init__(self, api_key: str, model_name: str = "deepseek-chat"):
        super().__init__(api_key, model_name)
        self.base_url = "https://api.deepseek.com/v1/chat/completions"
        
    async def _make_request(self, messages: List[Dict], temperature: float = 0.3) -> Dict:
        """Make request to DeepSeek API"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model_name,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": 1000
        }
        
        try:
            response = requests.post(self.base_url, headers=headers, json=payload)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            logger.error(f"DeepSeek API error: {e}")
            return {"error": str(e)}
    
    async def research_contact(self, contact_info: ContactInfo) -> Dict[str, Any]:
        """Research contact using DeepSeek"""
        prompt = f"""
        Analyze this business contact for B2B lead qualification:
        
        Person: {contact_info.first_name} {contact_info.last_name}
        Company: {contact_info.company_name}
        
        Provide professional assessment in JSON:
        {{
            "probable_title": "job title estimate",
            "department": "department/division",
            "email_estimate": "business email pattern",
            "linkedin_url": "LinkedIn profile estimate",
            "phone_number": "if publicly available",
            "seniority": "C-Level/VP/SVP/Director/Manager/Analyst/Other",
            "decision_authority": "Primary/Secondary/Influencer/Unknown",
            "confidence": 0-100,
            "rationale": "reasoning for assessment"
        }}
        
        Focus on property management and real estate industry context.
        """
        
        messages = [
            {"role": "system", "content": "You are a professional B2B lead researcher with expertise in property management and real estate industries."},
            {"role": "user", "content": prompt}
        ]
        
        response = await self._make_request(messages)
        
        if "error" in response:
            return response
            
        try:
            content = response["choices"][0]["message"]["content"]
            start = content.find("{")
            end = content.rfind("}") + 1
            json_str = content[start:end]
            result = json.loads(json_str)
            result["model"] = "DeepSeek " + self.model_name
            return result
        except Exception as e:
            logger.error(f"Error parsing DeepSeek response: {e}")
            return {"error": f"Parse error: {e}"}
    
    async def verify_email(self, email: str, name: str, company: str) -> Dict[str, Any]:
        """Verify email using DeepSeek"""
        prompt = f"""
        Evaluate this business email address:
        
        Email: {email}
        Person: {name}
        Company: {company}
        
        Provide JSON assessment:
        {{
            "valid_format": true/false,
            "domain_appropriate": true/false,
            "business_likelihood": 0-100,
            "alternative_patterns": ["alt1@domain.com", "alt2@domain.com"],
            "confidence_level": 0-100,
            "assessment": "detailed analysis"
        }}
        """
        
        messages = [
            {"role": "system", "content": "You are an email verification specialist."},
            {"role": "user", "content": prompt}
        ]
        
        response = await self._make_request(messages)
        
        if "error" in response:
            return response
            
        try:
            content = response["choices"][0]["message"]["content"]
            start = content.find("{")
            end = content.rfind("}") + 1
            json_str = content[start:end]
            result = json.loads(json_str)
            result["model"] = "DeepSeek " + self.model_name
            return result
        except Exception as e:
            return {"error": f"Parse error: {e}"}
    
    async def analyze_company(self, company_name: str) -> Dict[str, Any]:
        """Analyze company using DeepSeek"""
        prompt = f"""
        Analyze this company for business consulting opportunities:
        
        Company: {company_name}
        
        Provide JSON analysis:
        {{
            "industry_classification": "industry type",
            "company_size": "size estimate",
            "key_challenges": ["challenge 1", "challenge 2", "challenge 3"],
            "consulting_opportunities": ["opportunity 1", "opportunity 2"],
            "decision_maker_roles": ["role 1", "role 2", "role 3"],
            "budget_range": "estimated budget",
            "website_estimate": "website URL",
            "linkedin_page": "company LinkedIn",
            "confidence_score": 0-100
        }}
        """
        
        messages = [
            {"role": "system", "content": "You are a business analyst specializing in company research and consulting opportunities."},
            {"role": "user", "content": prompt}
        ]
        
        response = await self._make_request(messages)
        
        if "error" in response:
            return response
            
        try:
            content = response["choices"][0]["message"]["content"]
            start = content.find("{")
            end = content.rfind("}") + 1
            json_str = content[start:end]
            result = json.loads(json_str)
            result["model"] = "DeepSeek " + self.model_name
            return result
        except Exception as e:
            return {"error": f"Parse error: {e}"}

# Continue with the main orchestrator class in the next file...

