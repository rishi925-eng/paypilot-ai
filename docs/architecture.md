# PayPilot AI — Architectural Specification

## 1. System Philosophy
PayPilot AI couples flexible open-source AI orchestration with resilient payment engineering. All user-facing AI recommendations are validated against authoritative database state, ensuring that LLMs can never unilaterally alter monetary prices, deplete inventory without reservation, or mark an uncaptured payment as successful.

---

## 2. Layer Topology

```mermaid
flowchart TD
    User["👤 Customer / Merchant"] --> NextWeb["Next.js 14 Frontend\n(Tailwind + Lucide + Recharts)"]
    NextWeb --> ExpressAPI["Node.js / Express API Server\n(Zod validation + Pino Logger)"]
    
    subgraph AI Engine ["AI Orchestration (LangGraph.js Design)"]
        Agent["Shopping Assistant StateGraph"]
        SearchTool["search_products"]
        CompareTool["compare_products"]
        BudgetTool["check_budget"]
        QuoteTool["prepare_order (Quote Only)"]
    end
    
    subgraph Data Layer ["Persistence & Transactions"]
        PrismaClient["Prisma ORM"]
        Database[("PostgreSQL / SQLite Database")]
    end
    
    subgraph External ["Payment Gateway"]
        PayPalAPI["PayPal Sandbox Orders REST API"]
    end
    
    ExpressAPI --> AIEngine
    ExpressAPI --> PrismaClient
    PrismaClient --> Database
    ExpressAPI --> PayPalAPI
```

---

## 3. Financial Integrity & Zero-Trust State Machine
- Prices are retrieved directly from the `Product` table during checkout calculations.
- Direct price overrides in API payloads or AI prompt contexts are rejected by Zod schema validation.
- Inventory is decremented automatically upon verified payment capture via database transaction.
