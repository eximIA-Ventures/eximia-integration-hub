// ─── eximIA Integration Contract v1 — Spec Definition ──────────────────────────
// This is the single source of truth served at GET /api/spec
// Agents consume this JSON to auto-generate route handlers in target apps.

export const CONTRACT_VERSION = "eximia-integration/v1";

export const CONTRACT_SPEC = {
  name: "eximIA Integration Contract",
  version: "1.0.0",
  contract_id: CONTRACT_VERSION,
  description:
    "Universal contract for inter-app integration in the eximIA ecosystem. Any app implementing these endpoints becomes automatically connectable to any other — present or future — with zero hardcoding, no intermediary, and no package dependency.",
  base_path: "/api/v1/integration",

  authentication: {
    type: "api_key",
    header: "x-eximia-api-key",
    format: "eximia_<app>_<random32>",
    hash_algorithm: "SHA-256",
    scopes: [
      { name: "read", description: "List and fetch entities (GET)" },
      { name: "write", description: "Create and update records (POST, PUT)" },
      { name: "admin", description: "Full access + webhooks + configuration" },
    ],
    key_storage: "SHA-256 hash in database — never store raw key",
    implementation_note:
      "Each app manages its own API keys. The Hub does NOT centralize key management.",
  },

  endpoints: [
    {
      path: "/catalog",
      method: "GET",
      description:
        "Returns app metadata, exposed entities with their schemas, supported operations, and available webhook events. This is the discovery mechanism.",
      auth_required: true,
      scope: "read",
      response_schema: {
        app: { type: "string", description: "App identifier (slug)" },
        version: { type: "string", description: "App implementation version" },
        contract: {
          type: "string",
          description: 'Must be "eximia-integration/v1"',
          value: CONTRACT_VERSION,
        },
        entities: {
          type: "Record<string, EntityDefinition>",
          description: "Map of exposed entities",
        },
        webhooks: {
          type: "{ available_events: string[] }",
          description: "Optional webhook events this app can emit",
          optional: true,
        },
      },
    },
    {
      path: "/:entity",
      method: "GET",
      description: "Lists paginated data of an entity",
      auth_required: true,
      scope: "read",
      query_params: {
        page: { type: "number", default: 1, description: "Page number (1-indexed)" },
        limit: {
          type: "number",
          default: 20,
          max: 100,
          description: "Items per page",
        },
      },
      response_schema: "PaginatedResponse<Entity>",
    },
    {
      path: "/:entity",
      method: "POST",
      description: "Creates a record in an entity",
      auth_required: true,
      scope: "write",
      body: "Entity fields (per entity schema, excluding readonly fields)",
      response_schema: "{ data: Entity }",
    },
    {
      path: "/:entity/:id",
      method: "GET",
      description: "Fetches an individual record by ID",
      auth_required: true,
      scope: "read",
      response_schema: "{ data: Entity }",
    },
    {
      path: "/:entity/:id",
      method: "PUT",
      description: "Updates an individual record",
      auth_required: true,
      scope: "write",
      body: "Partial entity fields (excluding readonly fields)",
      response_schema: "{ data: Entity }",
    },
  ],

  entity_definition: {
    description:
      "Each entity in the catalog must follow this structure",
    schema: {
      operations: {
        type: "string[]",
        values: ["list", "get", "create", "update"],
        description: "Which operations this entity supports",
      },
      schema: {
        type: "Record<string, FieldDefinition>",
        description: "Field definitions for this entity",
      },
      description: {
        type: "string",
        optional: true,
        description: "Human-readable description of the entity",
      },
    },
    field_types: ["string", "number", "boolean", "object", "array", "datetime"],
    field_options: {
      readonly: "Field cannot be set on create/update (e.g., id, created_at)",
      required: "Field must be present on create",
      description: "Human-readable field description",
    },
  },

  pagination: {
    description: "All list endpoints return paginated responses",
    response_format: {
      data: "T[] — array of records",
      meta: {
        total: "number — total records matching query",
        page: "number — current page (1-indexed)",
        limit: "number — items per page (max 100)",
        pages: "number — total pages",
      },
    },
  },

  errors: {
    description: "Standard error response format",
    response_format: {
      error: "string — human-readable error message",
      code: "string — machine-readable error code",
      details: "object — optional additional context",
    },
    codes: [
      { code: "UNAUTHORIZED", status: 401, description: "Missing or invalid API key" },
      { code: "FORBIDDEN", status: 403, description: "Key lacks required scope" },
      { code: "ENTITY_NOT_FOUND", status: 404, description: "Entity type not exposed by this app" },
      { code: "RECORD_NOT_FOUND", status: 404, description: "Record with given ID not found" },
      { code: "VALIDATION_ERROR", status: 422, description: "Request body failed validation" },
      { code: "RATE_LIMITED", status: 429, description: "Too many requests" },
      { code: "INTERNAL_ERROR", status: 500, description: "Unexpected server error" },
    ],
  },

  webhooks: {
    description:
      "Apps can emit events and notify connected apps via webhooks. Each app manages its own webhook registrations.",
    registration_endpoint: "POST /api/v1/integration/webhooks",
    signature_header: "x-eximia-signature",
    signature_algorithm: "HMAC-SHA256",
    retry_policy: {
      max_attempts: 3,
      backoff: "exponential",
      delays: ["1s", "5s", "30s"],
      on_failure: "Disable webhook after 3 consecutive failures",
    },
    payload_format: {
      event: "string — event name (e.g., submission.created)",
      app: "string — source app identifier",
      entity: "string — entity that triggered the event",
      record_id: "string — ID of the affected record",
      data: "object — full record data",
      timestamp: "string — ISO 8601 timestamp",
    },
  },

  versioning: {
    header: "x-eximia-contract-version",
    current: "v1",
    policy:
      "Backward-compatible additions only. Breaking changes require a new contract version.",
  },

  admin_panel: {
    description:
      "Every app implementing the contract MUST have an admin page at /settings/integrations to manage API keys, outbound connections, and monitor logs. The panel covers BOTH sides: inbound (other apps calling you) and outbound (you calling other apps).",
    route: "/settings/integrations",
    architecture: {
      inbound: {
        description:
          "Other apps call YOUR endpoints. You manage the API keys you give them and monitor received calls.",
        managed_via: "API Keys — each active key represents an app that has access to your endpoints",
      },
      outbound: {
        description:
          "YOU call other apps' endpoints. You store the API keys they gave you and monitor your outgoing calls.",
        managed_via: "Outbound connections — each connection stores remote URL + encrypted key + selected entities",
        discovery_flow: [
          "Admin enters remote app URL + API key",
          "App calls GET <url>/api/v1/integration/catalog",
          "Validates contract === 'eximia-integration/v1'",
          "Displays discovered entities with operations",
          "Admin selects which entities to consume",
          "Saves connection with key and selected entities",
        ],
      },
    },
    sections: [
      {
        name: "API Keys (Inbound)",
        description: "Create, list, and revoke API keys for other apps to call your endpoints",
        features: [
          "Create key: app_name, scopes (read/write/admin), optional expiration",
          "Key format: eximia_<app>_<random32>",
          "Display key ONCE on creation with copy button (never shown again)",
          "Store SHA-256 hash in database (never raw key)",
          "List keys: prefix, app, scopes, last_used, status",
          "Revoke key: soft delete (status = 'revoked')",
        ],
      },
      {
        name: "Connections (Outbound)",
        description: "Manage apps you call — discovery, entity selection, testing",
        features: [
          "Discovery flow: URL + key → /catalog → validate → select entities → save",
          "Per-connection detail panel showing discovered entities with checkboxes",
          "Test connection: calls remote /catalog to verify it's alive",
          "Re-discover: refresh catalog to pick up new entities",
          "Remove connection with confirmation",
        ],
      },
      {
        name: "Connections (Inbound - automatic)",
        description: "View apps that call you — derived from active API keys + logs",
        features: [
          "Auto-populated from active API keys (each key = one caller app)",
          "Shows: app_name, scopes, last_used, calls in last 24h",
          "Per-key detail panel with entity-level permission toggles",
          "Revoke key to block an app",
        ],
      },
      {
        name: "Logs",
        description: "All integration calls — both inbound and outbound",
        features: [
          "Direction indicator: ↓ inbound (received), ↑ outbound (sent)",
          "Columns: direction, method, endpoint, status_code, duration_ms, remote_app, timestamp",
          "Filter by direction (All / Inbound / Outbound)",
          "Color coding: 2xx green, 4xx yellow, 5xx red",
          "Last 100 entries with scroll",
        ],
      },
    ],
    database_schemas: {
      integration_keys: {
        description: "API keys you give to OTHER apps (inbound auth)",
        columns: {
          id: "uuid primary key default gen_random_uuid()",
          app_name: "text not null — who will use this key",
          key_prefix: "text not null — first 16 chars for display",
          key_hash: "text not null unique — SHA-256 hash",
          scopes: "text[] not null default '{read}'",
          status: "text default 'active' check (status in ('active', 'revoked'))",
          last_used: "timestamptz",
          expires_at: "timestamptz",
          created_at: "timestamptz default now()",
        },
      },
      integration_outbound: {
        description: "Apps YOU call (outbound connections)",
        columns: {
          id: "uuid primary key default gen_random_uuid()",
          remote_app: "text not null — remote app identifier",
          remote_url: "text not null — base URL of remote app",
          api_key_encrypted: "text not null — key the remote app gave you",
          status: "text default 'active' check (status in ('active', 'error', 'pending', 'disabled'))",
          entities: "text[] not null default '{}' — selected entities to consume",
          catalog_cache: "jsonb — last /catalog response",
          last_sync: "timestamptz",
          last_error: "text",
          created_at: "timestamptz default now()",
        },
      },
      integration_logs: {
        description: "All integration calls — inbound AND outbound",
        columns: {
          id: "uuid primary key default gen_random_uuid()",
          direction: "text not null — 'inbound' or 'outbound'",
          method: "text not null — GET, POST, PUT",
          endpoint: "text not null — /api/v1/integration/...",
          entity: "text — entity name if applicable",
          status_code: "int not null",
          duration_ms: "int not null",
          remote_app: "text — caller (inbound) or callee (outbound)",
          created_at: "timestamptz default now()",
        },
      },
    },
    file_structure: {
      description: "Required file structure in each app implementing the contract",
      files: {
        "app/settings/integrations/page.tsx":
          "Admin panel page (client component with 3 tabs: Keys, Connections, Logs)",
        "app/api/v1/integration/[...path]/route.ts":
          "Catch-all route handler for the contract endpoints (inbound)",
        "app/api/integrations/keys/route.ts":
          "CRUD for API keys (POST create, GET list)",
        "app/api/integrations/keys/[id]/route.ts":
          "DELETE to revoke a key",
        "app/api/integrations/connections/route.ts":
          "GET list outbound connections, POST create new",
        "app/api/integrations/connections/[id]/route.ts":
          "DELETE remove, POST test connection",
        "app/api/integrations/discover/route.ts":
          "POST discovery — calls remote /catalog and validates contract",
        "lib/integration/auth.ts":
          "Middleware to validate x-eximia-api-key header + log inbound calls",
        "lib/integration/catalog.ts":
          "This app's catalog definition (entities, schemas, operations)",
        "lib/integration/helpers.ts":
          "hashKey(), generateKey(), decrypt() utilities",
        "lib/integration/fetch.ts":
          "integrationFetch() — outbound fetch wrapper with auto-logging",
      },
    },
    visual_spec: {
      theme: "Follow eximIA dark theme — bg #0A0A0A, surface #111111, text cream #E8E0D5",
      status_indicators: {
        active: "● green dot + 'Conectado'",
        pending: "● yellow dot + 'Pendente'",
        error: "○ red dot + error message",
        disabled: "○ gray dot + 'Desabilitado'",
      },
      method_badges: {
        GET: "sage/green background",
        POST: "accent/brown background",
        PUT: "warning/yellow background",
        DELETE: "danger/red background",
      },
      log_direction: {
        inbound: "↓ blue arrow — other app called YOU",
        outbound: "↑ gold arrow — YOU called other app",
      },
      fonts: {
        ui: "Inter",
        code: "JetBrains Mono (keys, endpoints, logs)",
        headings: "Playfair Display (section titles)",
      },
      key_display: "Show only prefix (first 16 chars) + '...' — never show full key after creation",
      borders: "rgba(232,224,213,0.04) for cards, 0.06 for dividers — never pure white",
      expandable_rows:
        "Each key/connection row is expandable. Collapsed: summary line. Expanded: detail panel with entity toggles (inbound) or entity checkboxes (outbound), actions, metadata.",
    },
  },

  examples: {
    catalog_response: {
      app: "eximia-forms",
      version: "1.0.0",
      contract: CONTRACT_VERSION,
      entities: {
        forms: {
          operations: ["list", "get"],
          schema: {
            id: { type: "string", readonly: true },
            title: { type: "string", required: true },
            status: { type: "string" },
            created_at: { type: "datetime", readonly: true },
          },
          description: "Form definitions",
        },
        submissions: {
          operations: ["list", "get", "create"],
          schema: {
            id: { type: "string", readonly: true },
            form_id: { type: "string", required: true },
            data: { type: "object", required: true },
            created_at: { type: "datetime", readonly: true },
          },
          description: "Form submission responses",
        },
      },
      webhooks: {
        available_events: ["submission.created", "submission.updated"],
      },
    },
    paginated_response: {
      data: [
        { id: "uuid-1", form_id: "form-1", data: {}, created_at: "2026-03-15T12:00:00Z" },
      ],
      meta: { total: 42, page: 1, limit: 20, pages: 3 },
    },
    error_response: {
      error: "Entity 'users' is not exposed by this app",
      code: "ENTITY_NOT_FOUND",
      details: { available_entities: ["forms", "submissions"] },
    },
  },
};
