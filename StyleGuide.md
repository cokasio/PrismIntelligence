{
  "style_guide_metadata": {
    "title": "Prism Intelligence - Manus-Inspired Design System",
    "version": "1.0",
    "philosophy": "Sophisticated AI intelligence delivered through radical simplicity",
    "inspiration": "Manus.im conversational interface design",
    "target_experience": "Professional property management intelligence that feels as simple as having a conversation",
    "date_created": "2025-06-30"
  },
  "design_philosophy": {
    "core_principles": {
      "radical_simplicity": {
        "description": "One intelligent interface that adapts to every user without complexity",
        "implementation": "Single input field handles all interactions - upload files, ask questions, describe challenges",
        "user_benefit": "Zero learning curve for property managers, CFOs, or consultants"
      },
      "conversational_intelligence": {
        "description": "Personal, conversational tone that makes AI feel approachable",
        "implementation": "Hello [Name], What property challenge can I solve for you?",
        "user_benefit": "Reduces AI intimidation, increases engagement and trust"
      },
      "hidden_sophistication": {
        "description": "Enterprise-grade AI capabilities hidden behind effortless interface",
        "implementation": "Complex persona detection, pricing adaptation, content personalization happen invisibly",
        "user_benefit": "Professional results without professional complexity"
      },
      "visual_storytelling": {
        "description": "Use case cards that show possibilities instead of explaining features",
        "implementation": "Find Hidden Revenue ($40K in 3 mins), Predict HVAC Failure (6 weeks early)",
        "user_benefit": "Immediate understanding of value and outcomes"
      },
      "contextual_adaptation": {
        "description": "Interface elements reorder and personalize based on detected user type",
        "implementation": "Property manager sees maintenance cards first, CFO sees financial analysis",
        "user_benefit": "Relevant experience without manual configuration"
      }
    }
  },
  "visual_design_system": {
    "color_palette": {
      "primary_dark": {
        "background_primary": "#0D1117",
        "background_secondary": "#161B22", 
        "background_elevated": "#21262D",
        "description": "Manus-inspired dark theme that reduces eye strain and feels modern"
      },
      "property_intelligence_accents": {
        "success_green": "#2EA043",
        "warning_amber": "#FB8500", 
        "revenue_blue": "#0969DA",
        "maintenance_orange": "#D73A4A",
        "description": "Property-specific color coding for different insight types"
      },
      "text_hierarchy": {
        "text_primary": "#F0F6FC",
        "text_secondary": "#8B949E",
        "text_muted": "#656D76",
        "text_accent": "#58A6FF",
        "description": "Clear contrast ratios for accessibility while maintaining dark aesthetic"
      },
      "interactive_elements": {
        "button_primary": "#238636",
        "button_secondary": "#21262D",
        "button_hover": "#2EA043",
        "border_subtle": "#30363D",
        "border_emphasis": "#8B949E"
      }
    },
    "typography_system": {
      "conversational_hierarchy": {
        "greeting_text": {
          "font_family": "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
          "font_size": "32px",
          "font_weight": "400",
          "line_height": "1.3",
          "color": "text_primary",
          "usage": "Hello [Name] personalized greeting"
        },
        "question_prompt": {
          "font_family": "Inter, -apple-system, BlinkMacSystemFont, sans-serif", 
          "font_size": "24px",
          "font_weight": "300",
          "line_height": "1.4",
          "color": "text_secondary",
          "usage": "What property challenge can I solve for you?"
        },
        "input_text": {
          "font_family": "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
          "font_size": "16px",
          "font_weight": "400",
          "line_height": "1.5",
          "color": "text_primary",
          "usage": "User input field text"
        },
        "card_title": {
          "font_family": "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
          "font_size": "18px", 
          "font_weight": "500",
          "line_height": "1.4",
          "color": "text_primary",
          "usage": "Use case card titles"
        },
        "card_description": {
          "font_family": "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
          "font_size": "14px",
          "font_weight": "400", 
          "line_height": "1.5",
          "color": "text_secondary",
          "usage": "Use case card descriptions and metadata"
        },
        "micro_copy": {
          "font_family": "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
          "font_size": "12px",
          "font_weight": "400",
          "line_height": "1.4", 
          "color": "text_muted",
          "usage": "Timestamps, file types, small labels"
        }
      }
    },
    "spacing_system": {
      "conversational_layout": {
        "greeting_margin": "40px 0 16px 0",
        "question_margin": "0 0 32px 0", 
        "input_padding": "16px 20px",
        "card_grid_gap": "16px",
        "card_padding": "20px",
        "sidebar_padding": "20px",
        "container_max_width": "1200px",
        "content_padding": "40px 24px"
      }
    },
    "component_styling": {
      "input_field": {
        "background": "background_elevated",
        "border": "1px solid border_subtle",
        "border_radius": "12px",
        "padding": "16px 20px",
        "font_size": "16px",
        "transition": "all 0.2s ease",
        "focus_state": {
          "border_color": "text_accent",
          "box_shadow": "0 0 0 2px rgba(88, 166, 255, 0.1)"
        },
        "placeholder_style": {
          "color": "text_muted",
          "content": "Describe your property challenge or upload a report..."
        }
      },
      "use_case_cards": {
        "background": "background_elevated",
        "border": "1px solid border_subtle", 
        "border_radius": "12px",
        "padding": "20px",
        "transition": "all 0.2s ease",
        "hover_state": {
          "border_color": "border_emphasis",
          "transform": "translateY(-2px)",
          "box_shadow": "0 8px 24px rgba(0, 0, 0, 0.2)"
        },
        "cursor": "pointer"
      },
      "category_filters": {
        "background": "transparent",
        "border": "1px solid border_subtle",
        "border_radius": "20px",
        "padding": "8px 16px",
        "font_size": "14px",
        "color": "text_secondary",
        "active_state": {
          "background": "button_primary",
          "color": "text_primary",
          "border_color": "button_primary"
        }
      }
    }
  },
  "property_intelligence_components": {
    "personalized_greeting": {
      "structure": "Hello [Detected Name/Company], What can I analyze for you?",
      "ai_detection": "Automatically detect visitor type and personalize greeting",
      "examples": {
        "property_manager": "Hello Sarah, What property insights can I provide?",
        "cfo": "Hello David, What financial analysis do you need?", 
        "asset_manager": "Hello Jennifer, What portfolio intelligence can I deliver?"
      }
    },
    "intelligent_input_field": {
      "placeholder_adaptation": {
        "property_manager": "Upload rent roll, describe maintenance issue, or ask about operations...",
        "cfo": "Upload P&L, ask about variances, or request financial analysis...",
        "asset_manager": "Upload portfolio data, ask about performance, or request investor summary..."
      },
      "auto_suggestions": [
        "Find hidden revenue opportunities in my reports",
        "Explain why NOI dropped 5% this quarter", 
        "Predict which units need maintenance",
        "Create investor-ready performance summary",
        "Analyze lease renewal risks"
      ]
    },
    "dynamic_use_case_grid": {
      "property_manager_priority": [
        {
          "title": "Find Hidden Revenue",
          "description": "$40K found in 3 minutes",
          "icon": "💰",
          "category": "Financial",
          "example_outcome": "Identified miscategorized expenses reducing NOI"
        },
        {
          "title": "Predict Maintenance Issues", 
          "description": "HVAC failure in 6 weeks",
          "icon": "🔧",
          "category": "Operations",
          "example_outcome": "Prevented $15K emergency repair"
        },
        {
          "title": "Optimize Rent Pricing",
          "description": "3 units underpriced by $200/mo",
          "icon": "📈", 
          "category": "Revenue",
          "example_outcome": "Additional $7,200 annual revenue"
        }
      ],
      "cfo_priority": [
        {
          "title": "Explain Variance",
          "description": "NOI down 5% - here's why",
          "icon": "📊",
          "category": "Analysis", 
          "example_outcome": "Clear variance explanation for board"
        },
        {
          "title": "Replace BI Stack",
          "description": "Save $50K/year on analytics",
          "icon": "💾",
          "category": "Technology",
          "example_outcome": "Eliminated 3 BI tools, same insights"
        },
        {
          "title": "Risk Assessment",
          "description": "Flag high-risk properties",
          "icon": "⚠️",
          "category": "Risk",
          "example_outcome": "Early identification of problem assets"
        }
      ],
      "asset_manager_priority": [
        {
          "title": "Portfolio Intelligence",
          "description": "Cross-property insights",
          "icon": "🏢",
          "category": "Portfolio",
          "example_outcome": "Identified best-performing strategies"
        },
        {
          "title": "Investor Reports",
          "description": "Auto-generated summaries", 
          "icon": "📋",
          "category": "Reporting",
          "example_outcome": "5-hour report process to 15 minutes"
        },
        {
          "title": "Acquisition Analysis",
          "description": "Due diligence in minutes",
          "icon": "🎯",
          "category": "Investment",
          "example_outcome": "Faster deal evaluation and decision"
        }
      ]
    },
    "contextual_categories": {
      "adaptive_filters": [
        "💰 Revenue Optimization",
        "🔧 Operations & Maintenance", 
        "📊 Financial Analysis",
        "📈 Performance Tracking",
        "⚠️ Risk Management",
        "🏢 Portfolio Intelligence",
        "📋 Investor Relations",
        "🎯 Strategic Planning"
      ],
      "filter_behavior": "Categories reorder based on detected user type and interaction history"
    }
  },
  "interaction_patterns": {
    "zero_friction_engagement": {
      "no_signup_required": "Users can immediately start analyzing without registration",
      "email_capture_timing": "Only after user sees value from first analysis",
      "progressive_disclosure": "Start simple, reveal complexity only when needed"
    },
    "intelligent_responses": {
      "upload_detection": "Automatically determine file type and optimal analysis approach",
      "context_retention": "Remember user preferences and analysis history within session",
      "smart_suggestions": "Propose relevant follow-up analyses based on current results"
    },
    "conversion_optimization": {
      "value_demonstration": "Show actual insights before asking for payment",
      "social_proof": "Display relevant success stories for detected user type",
      "clear_upgrade_path": "Seamless transition from free analysis to paid subscription"
    }
  },
  "responsive_design_strategy": {
    "mobile_first_approach": {
      "core_experience": "Full functionality on mobile devices",
      "simplified_navigation": "Collapsible sidebar, gesture-friendly interactions",
      "touch_optimized": "Larger touch targets, swipe gestures for cards"
    },
    "desktop_enhancements": {
      "expanded_grid": "More use case cards visible simultaneously",
      "sidebar_always_visible": "Persistent navigation and recent analyses",
      "keyboard_shortcuts": "Power user productivity features"
    },
    "breakpoint_strategy": {
      "mobile": "320px - 768px: Single column, simplified interface",
      "tablet": "768px - 1024px: Two-column grid, expanded categories",
      "desktop": "1024px+: Full three-column grid, all features visible"
    }
  },
  "performance_optimization": {
    "loading_strategies": {
      "critical_css": "Inline styles for above-the-fold content",
      "lazy_loading": "Progressive loading of use case cards",
      "font_optimization": "Preload critical font weights and styles"
    },
    "ai_integration": {
      "response_caching": "Cache common analysis patterns",
      "streaming_responses": "Progressive display of AI insights",
      "fallback_handling": "Graceful degradation during AI service issues"
    }
  },
  "accessibility_standards": {
    "wcag_compliance": {
      "contrast_ratios": "Minimum 4.5:1 for all text elements",
      "keyboard_navigation": "Full functionality without mouse",
      "screen_reader_support": "Semantic HTML and ARIA labels"
    },
    "inclusive_design": {
      "language_clarity": "Plain English, no technical jargon",
      "error_prevention": "Clear validation and helpful error messages",
      "cognitive_accessibility": "Consistent patterns and predictable interactions"
    }
  },
  "technical_implementation": {
    "css_architecture": {
      "methodology": "CSS-in-JS with styled-components for dynamic theming",
      "design_tokens": "Centralized color, spacing, and typography tokens",
      "component_library": "Reusable components for consistent experience"
    },
    "ai_personalization": {
      "detection_logic": "Visitor behavior analysis for persona identification",
      "content_adaptation": "Dynamic component reordering and messaging",
      "ab_testing": "Continuous optimization of conversion elements"
    }
  },
  "success_metrics": {
    "user_experience": {
      "time_to_value": "Under 15 seconds from landing to insights",
      "completion_rate": "80%+ of visitors engage with use case cards",
      "session_duration": "Average 3+ minutes exploring capabilities"
    },
    "conversion_optimization": {
      "trial_signup_rate": "15%+ conversion from visitor to trial",
      "upgrade_conversion": "25%+ from trial to paid subscription",
      "user_satisfaction": "4.5+ star rating on ease of use"
    }
  },
  "implementation_roadmap": {
    "phase_1_foundation": {
      "timeline": "Week 1-2",
      "deliverables": [
        "Core visual design system implementation",
        "Responsive layout with Manus-inspired styling", 
        "Basic AI persona detection",
        "Use case card grid with hover interactions"
      ]
    },
    "phase_2_intelligence": {
      "timeline": "Week 3-4", 
      "deliverables": [
        "Dynamic content personalization",
        "Intelligent input field with context adaptation",
        "Advanced use case prioritization",
        "Seamless file upload and processing flow"
      ]
    },
    "phase_3_optimization": {
      "timeline": "Week 5-6",
      "deliverables": [
        "Performance optimization and loading improvements",
        "Advanced analytics and conversion tracking",
        "A/B testing framework for continuous optimization",
        "Full accessibility audit and improvements"
      ]
    }
  }
}