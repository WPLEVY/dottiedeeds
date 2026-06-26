# Dottie Deeds Architecture

**System architecture for AI-powered California real estate document automation**

Dottie Deeds is designed as a lightweight, secure, AI-assisted document automation platform for legal and real estate workflows.

The architecture is intentionally simple.

The goal is not to build unnecessary complexity. The goal is to create a reliable workflow that can take structured user input, apply legal and business logic, securely call an AI model, and generate attorney-ready documents for review.

---

# Architecture Overview

```text
User
  |
  v
Frontend Interface
  |
  v
Supabase Backend
  |
  v
Cloudflare Worker API Proxy
  |
  v
Anthropic Claude API
  |
  v
Document Generation Logic
  |
  v
DOCX / PDF Output
  |
  v
Attorney Review
```

---

# Core Components

## 1. Frontend Interface

The frontend collects user and transaction information in a structured format.

Primary responsibilities:

* Capture client and property information
* Guide users through deed-specific intake flows
* Reduce incomplete or inconsistent data entry
* Present a simple interface for complex legal workflows
* Prepare structured payloads for backend processing

The frontend is designed to keep the user experience focused and practical rather than expose the complexity of the underlying legal analysis.

---

## 2. Supabase Backend

Supabase provides the backend layer supporting beta user management and product monitoring.

Primary responsibilities:

* User authentication
* Account management
* Usage tracking
* Data persistence
* Beta user monitoring
* Foundation for future analytics

Adding Supabase moved Dottie from a simple prototype toward a real product with users, accounts, and measurable product behavior.

---

## 3. Cloudflare Worker API Proxy

The Cloudflare Worker acts as a secure middleware layer between the frontend/backend and external AI services.

Primary responsibilities:

* Protect Anthropic API credentials
* Avoid exposing AI keys in the frontend
* Route requests securely
* Provide a controlled interface for AI calls
* Support future rate limiting and logging

This layer was added because security matters from the beginning, especially in legal technology.

---

## 4. Anthropic Claude API

Claude provides AI-assisted reasoning and drafting support.

Primary responsibilities:

* Interpret structured transaction information
* Assist with document generation
* Support deed-specific drafting workflows
* Help standardize outputs
* Reduce repetitive manual drafting

Claude is not treated as a substitute for legal judgment.

It is used as a workflow accelerator within a structured system designed for professional review.

---

## 5. Document Generation Logic

Dottie combines AI output with structured legal document generation.

Primary responsibilities:

* Generate deed packages
* Apply document formatting rules
* Support Word document output
* Support PDF output
* Maintain recording-oriented formatting
* Produce documents suitable for attorney review

The system is designed around practical legal workflow requirements rather than generic text generation.

---

## 6. Attorney Review

Attorney review remains a core part of the workflow.

Primary responsibilities:

* Confirm legal strategy
* Review factual inputs
* Verify transfer structure
* Approve final documents
* Ensure compliance with professional obligations

Dottie is designed to augment legal professionals, not replace them.

---

# Design Priorities

## Security

Legal workflows require careful handling of user information and API credentials.

The architecture uses a Cloudflare Worker proxy and backend separation so sensitive API keys are not exposed in the client.

## Simplicity

The system avoids unnecessary complexity.

Each layer has a clear responsibility.

## Explainability

Legal professionals need to understand and review AI-assisted outputs.

The system is designed to preserve human oversight.

## Iteration

Supabase enables beta usage monitoring so product decisions can be based on real user behavior rather than assumptions.

## Professional Workflow Fit

Dottie is built around how legal professionals actually work, including document formats, review processes, and recording requirements.

---

# Current Status

Dottie currently includes:

* Frontend intake experience
* Supabase backend
* User authentication
* Account management
* Usage monitoring
* Cloudflare Worker proxy
* Anthropic API integration
* AI-assisted document generation
* DOCX and PDF output workflows
* Vercel deployment

---

# Future Architecture Goals

Planned improvements include:

* Expanded analytics dashboard
* Additional deed types
* More structured document validation
* Improved prompt orchestration
* Enhanced user roles
* Beta feedback capture
* Firm-level administration
* Multi-document transaction workflows
* Additional jurisdiction support

---

# Product Philosophy

The most important architectural decision in Dottie is not the technology stack.

It is the decision to keep legal judgment in the hands of professionals while automating the repetitive work around that judgment.

AI is most valuable when it is embedded inside real workflows.

Dottie is built around that principle.
