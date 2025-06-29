# Prism Intelligence Workflow Diagrams

## System Overview

This document provides visual representations of how Prism Intelligence processes property management reports from ingestion through delivery. These diagrams help stakeholders understand the system flow and technical teams implement the architecture correctly.

## Main Processing Workflow

```mermaid
graph TB
    A[Email with Report Attachment] --> B[SendGrid Inbound Parse]
    B --> C[N8N Webhook Receiver]
    C --> D{File Type?}
    
    D -->|PDF| E[PDF Parser]
    D -->|Excel| F[Excel Parser]
    D -->|CSV| G[CSV Parser]
    
    E --> H[Structured Data]
    F --> H
    G --> H
    
    H --> I[Queue for Processing]
    I --> J[Claude AI - Pass 1: Data Extraction]
    J --> K[Claude AI - Pass 2: Verification]
    K --> L[Claude AI - Pass 3: Insights]
    L --> M[Claude AI - Pass 4: Actions]
    
    M --> N[Store in PostgreSQL]
    M --> O[Store in Vector DB]
    
    N --> P[Report Generator]
    O --> P
    
    P --> Q[Email Delivery]
    Q --> R[Property Manager Inbox]
    
    style J fill:#e91e63
    style K fill:#e91e63
    style L fill:#e91e63
    style M fill:#e91e63
```
## Multi-Pass AI Analysis Detail

Understanding how the four-pass AI analysis works is crucial to appreciating why Prism Intelligence delivers such superior results compared to traditional reporting tools. Each pass builds upon the previous one, creating layers of understanding that mirror how a skilled analyst would approach a complex report.

```mermaid
graph LR
    A[Raw Report Data] --> B[Pass 1: Data Extraction]
    B --> C{Extracted Metrics}
    C --> D[Pass 2: Verification]
    D --> E{Verified Data}
    E --> F[Pass 3: Insight Generation]
    F --> G{Strategic Insights}
    G --> H[Pass 4: Action Creation]
    H --> I[Actionable Recommendations]
    
    J[Prompt Library] --> B
    J --> D
    J --> F
    J --> H
    
    K[Historical Context] --> F
    L[Business Rules] --> H
    
    style B fill:#e1f5fe
    style D fill:#fff3e0
    style F fill:#f3e5f5
    style H fill:#e8f5e9
```

## Data Flow Architecture

The system architecture separates concerns elegantly, ensuring each component has a single responsibility while maintaining seamless communication between services. This design enables horizontal scaling and easy maintenance as the system grows.
```mermaid
graph TB
    subgraph "Ingestion Layer"
        A1[Email Service]
        A2[File Storage]
        A3[Queue System]
    end
    
    subgraph "Processing Layer"
        B1[Document Parsers]
        B2[AI Analysis Engine]
        B3[Data Validation]
    end
    
    subgraph "Storage Layer"
        C1[PostgreSQL]
        C2[Vector Database]
        C3[File Archive]
    end
    
    subgraph "Delivery Layer"
        D1[Report Generator]
        D2[Email Service]
        D3[API Gateway]
    end
    
    A1 --> A2
    A2 --> A3
    A3 --> B1
    B1 --> B2
    B2 --> B3
    B3 --> C1
    B3 --> C2
    A2 --> C3
    C1 --> D1
    C2 --> D1
    D1 --> D2
    D1 --> D3
```

## Error Handling and Recovery Flow

Robust error handling ensures the system gracefully manages failures without losing data or leaving users in the dark. Every potential failure point has a recovery strategy, maintaining system reliability even under adverse conditions.
```mermaid
graph TD
    A[Processing Error Occurs] --> B{Error Type?}
    
    B -->|File Parse Error| C[Log Error Details]
    B -->|AI API Error| D[Check Rate Limits]
    B -->|Database Error| E[Retry Connection]
    B -->|Email Error| F[Queue for Retry]
    
    C --> G[Notify User]
    C --> H[Manual Review Queue]
    
    D --> I{Retry Available?}
    I -->|Yes| J[Exponential Backoff]
    I -->|No| K[Queue for Later]
    
    E --> L{Connection OK?}
    L -->|Yes| M[Resume Processing]
    L -->|No| N[Alert Operations]
    
    F --> O[Alternative Delivery]
    
    G --> P[Provide Solution]
    K --> Q[Process When Available]
    
    style A fill:#ffcdd2
    style G fill:#fff9c4
    style P fill:#c8e6c9
```

## User Journey Flow

Understanding the user's journey through the system helps ensure we're building something that truly serves their needs. From the moment they forward a report to receiving actionable insights, every step should feel natural and valuable.
```mermaid
journey
    title Property Manager's Journey with Prism Intelligence
    section Discovery
      Learn about Prism: 5: Manager
      Compare to current process: 3: Manager
      Request demo: 5: Manager
    section Onboarding
      Receive welcome email: 5: Manager
      Read simple instructions: 4: Manager
      Forward first report: 5: Manager
    section First Use
      Receive confirmation: 5: Manager
      Wait for processing: 4: Manager
      Receive insights email: 5: Manager
      Read actionable insights: 5: Manager
      Implement recommendations: 5: Manager
    section Regular Use
      Forward monthly reports: 5: Manager
      Review insights quickly: 5: Manager
      Track improvements: 5: Manager
      Share with team: 5: Manager
    section Expansion
      Add more properties: 5: Manager
      Invite team members: 5: Manager
      Request new features: 4: Manager
      Become power user: 5: Manager
```

## Technical Component Integration

The beauty of Prism Intelligence lies not just in its individual components, but in how elegantly they work together. Each service communicates through well-defined interfaces, creating a symphony of data processing that appears effortless to the end user.
```mermaid
graph TB
    subgraph "External Services"
        E1[SendGrid API]
        E2[Claude API]
        E3[Supabase]
        E4[Vector DB]
    end
    
    subgraph "Core Application"
        A1[API Gateway]
        A2[Processing Engine]
        A3[Queue Manager]
        A4[Report Builder]
    end
    
    subgraph "Supporting Services"
        S1[Monitoring]
        S2[Logging]
        S3[Analytics]
        S4[Backup]
    end
    
    E1 <--> A1
    E2 <--> A2
    E3 <--> A2
    E4 <--> A2
    
    A1 --> A3
    A3 --> A2
    A2 --> A4
    
    A1 --> S2
    A2 --> S1
    A2 --> S2
    A2 --> S3
    E3 --> S4
    
    style A2 fill:#4caf50
    style E2 fill:#e91e63
```

## Summary

These workflow diagrams provide a visual understanding of how Prism Intelligence transforms property management reports into actionable insights. From the moment an email arrives to the delivery of strategic recommendations, every step is designed for reliability, scalability, and value creation. Use these diagrams as reference guides during implementation and as communication tools when explaining the system to stakeholders.