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
