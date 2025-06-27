# Python Modules Guide for Yardi AI Research System

This guide provides a detailed explanation of each Python file in the project, including their purpose, main classes/functions, and how to use or extend them. It is intended for users and developers who want to understand the codebase or build upon it.

---

## 1. `ai_research_system.py`

### **Purpose:**
Implements the core AI model interfaces and logic for integrating with multiple AI providers (OpenAI, Claude, Gemini, DeepSeek). Each model can perform contact research, email verification, and company analysis.

### **Main Classes & Functions:**
- **`ContactInfo` (dataclass):**
  - Structure for holding contact details (name, company, job title, email, etc.).
- **`AIModel` (abstract base class):**
  - Defines the interface for all AI models (methods: `research_contact`, `verify_email`, `analyze_company`).
- **`OpenAIModel`, `ClaudeModel`, `GeminiModel`, `DeepSeekModel`:**
  - Implement the `AIModel` interface for each provider, handling API requests and response parsing.

### **How to Use:**
- These classes are not run directly, but are instantiated and managed by the orchestrator (`ai_orchestrator.py`).
- To add a new AI provider, subclass `AIModel` and implement the required methods.

---

## 2. `ai_orchestrator.py`

### **Purpose:**
Acts as the central orchestrator, managing multiple AI models, building consensus from their outputs, and handling all database operations (SQLite). Also manages batch processing and exporting results.

### **Main Classes & Functions:**
- **`MultiAIResearchOrchestrator`:**
  - Loads configuration and API keys.
  - Initializes and manages all enabled AI models.
  - Sets up and manages the SQLite database (companies, contacts, research activities, consensus results, etc.).
  - **Key Methods:**
    - `research_contact_consensus(contact_info)`: Runs all enabled models for a contact and builds a consensus.
    - `verify_email_consensus(email, name, company)`: Multi-model email verification.
    - `analyze_company_consensus(company_name)`: Multi-model company analysis.
    - `process_csv_contacts(csv_file, max_contacts)`: Batch processes contacts from a CSV file.
    - `export_results_to_csv(output_file)`: Exports high-confidence results to CSV.

### **How to Use:**
- Used internally by `main_research.py` and the `YardiLeadResearcher` class.
- Can be extended to add new consensus logic, database tables, or export formats.

---

## 3. `main_research.py`

### **Purpose:**
Main entry point for running research tasks. Provides the `YardiLeadResearcher` class, which wraps the orchestrator and exposes user-friendly methods for single/batch research, configuration, and output.

### **Main Classes & Functions:**
- **`YardiLeadResearcher`:**
  - `research_single_contact(first_name, last_name, company)`: Researches a single contact and prints a summary.
  - `research_priority_targets()`: Runs research on a predefined list of high-priority targets.
  - `batch_process_csv(csv_file, max_contacts)`: Batch processes contacts from a CSV file.
  - `add_custom_model(model_name, model_class, api_key, model_config)`: Add a new AI model at runtime.
  - `configure_model_selection(model_tasks)`: Assigns tasks to specific models.
- **`main()` function:**
  - Example usage for single contact, batch, and priority research.

### **How to Use:**
- Run this file directly to start the system:
  ```bash
  python main_research.py
  ```
- Import `YardiLeadResearcher` in your own scripts for custom workflows.

---

## 4. Example Usage Scenarios

### **Single Contact Research (Python):**
```python
from main_research import YardiLeadResearcher
import asyncio
researcher = YardiLeadResearcher()
asyncio.run(researcher.research_single_contact('Robert', 'Goldman', 'Z Modular'))
```

### **Batch Processing (Python):**
```python
asyncio.run(researcher.batch_process_csv('contacts.csv', max_contacts=20))
```

### **Priority Targets (Python):**
```python
asyncio.run(researcher.research_priority_targets())
```

---

## 5. Extending the System

- **Add a New AI Model:**
  - Subclass `AIModel` in `ai_research_system.py` and implement the required methods.
  - Register the new model in the config and/or via `add_custom_model`.
- **Custom Consensus Logic:**
  - Modify or extend consensus methods in `ai_orchestrator.py`.
- **Database/Export Enhancements:**
  - Add new tables or export formats in the orchestrator.

---

## 6. Logging & Debugging

- All major actions and errors are logged to `ai_research.log`.
- Use logging output to troubleshoot API, database, or consensus issues.

---

## 7. Summary Table

| File                  | Purpose                                      | Main Classes/Functions                | How to Use/Extend                |
|-----------------------|----------------------------------------------|---------------------------------------|----------------------------------|
| ai_research_system.py | AI model interfaces and logic                | ContactInfo, AIModel, Model classes   | Subclass AIModel for new models  |
| ai_orchestrator.py    | Orchestrator, consensus, database management | MultiAIResearchOrchestrator           | Extend consensus, DB, export     |
| main_research.py      | Main entry, user API, CLI                    | YardiLeadResearcher, main()           | Run directly or import class     |

---

For more details on data files and schema, see `USER_GUIDE.md` and `database_schema.md`. 