### Folder Structure Schematic

```text
packages/agentic-graph/
    ├── index.ts                # Main export for Resolvers to consume
    ├── state/
    │   └── graphState.ts       # Strictly typed LangGraph Annotation/State definitions
    ├── nodes/
    │   ├── retrieveNode.ts     # Fetches Mongoose data (Vector/Graph lookup)
    │   ├── analyzeNode.ts      # LLM evaluates 'userNuance' & proposes connections
    │   └── synthesizeNode.ts   # Generates the final 'aiSynthesis' for queries
    ├── edges/
    │   └── routingEdges.ts     # Conditional logic (e.g., route to Human Validation vs. Auto-Brain)
    ├── tools/
    │   ├── atlasVectorTool.ts  # LangChain tool wrapping Mongoose Vector Search
    │   └── graphLookupTool.ts  # LangChain tool wrapping Mongoose $graphLookup
    ├── prompts/
    │   └── systemPrompts.ts    # Centralized LLM instructions (e.g., strict JSON formatting)
    └── graphs/
        ├── refineryGraph.ts    # The pipeline: GARBAGE -> RESONATING
        └── retrievalGraph.ts   # The pipeline: User Query -> GraphRAG -> Synthesis
```

