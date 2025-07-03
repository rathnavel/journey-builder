export interface FormField {
  id: string;
  name: string;
  type: string;
  label: string;
  required?: boolean;
}

export interface Form {
  id: string;
  name: string;
  description?: string;
  fields: FormField[];
  nodeId?: string; // Add nodeId for mapping back to the node
}

export interface Edge {
  source: string;
  target: string;
}

export interface Node {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: {
    id: string;
    component_key: string;
    component_type: string;
    component_id: string;
    name: string;
    prerequisites: string[];
    [key: string]: any;
  };
}

export interface FormDAGResponse {
  id: string;
  name: string;
  description: string;
  nodes: Node[];
  edges: Edge[];
  forms: any[];
}

// Mock response for the API
export const mockFormDAGResponse: FormDAGResponse = {
  id: "bp_01jk766tckfwx84xjcxazggzyc",
  name: "Onboard Customer 0",
  description: "Automated test action",
  nodes: [
    {
      id: "form-0f58384c-4966-4ce6-9ec2-40b96d61f745",
      type: "form",
      position: {
        x: 1093.4015147514929,
        y: 155.2205909169969
      },
      data: {
        id: "bp_c_01jka1e3jzewhb9eqfq08rk90b",
        component_key: "form-0f58384c-4966-4ce6-9ec2-40b96d61f745",
        component_type: "form",
        component_id: "f_01jk7ap2r3ewf9gx6a9r09gzjv",
        name: "Form D",
        prerequisites: [
          "form-a4750667-d774-40fb-9b0a-44f8539ff6c4"
        ]
      }
    },
    {
      id: "form-47c61d17-62b0-4c42-8ca2-0eff641c9d88",
      type: "form",
      position: {
        x: 494,
        y: 269
      },
      data: {
        id: "bp_c_01jka1e3k0ewha8jbgeayz4cwp",
        component_key: "form-47c61d17-62b0-4c42-8ca2-0eff641c9d88",
        component_type: "form",
        component_id: "f_01jk7ap2r3ewf9gx6a9r09gzja", // Changed to make it unique
        name: "Form A",
        prerequisites: []
      }
    },
    {
      id: "form-7c26f280-7bff-40e3-b9a5-0533136f52c3",
      type: "form",
      position: {
        x: 779.0096360025458,
        y: 362.36545334182
      },
      data: {
        id: "bp_c_01jka1e3k1ewhbfr03fcxg8qze",
        component_key: "form-7c26f280-7bff-40e3-b9a5-0533136f52c3",
        component_type: "form",
        component_id: "f_01jk7aygnqewh8gt8549beb1yc",
        name: "Form C",
        prerequisites: [
          "form-47c61d17-62b0-4c42-8ca2-0eff641c9d88"
        ]
      }
    },
    {
      id: "form-a4750667-d774-40fb-9b0a-44f8539ff6c4",
      type: "form",
      position: {
        x: 780.692362673456,
        y: 154.98072799490808
      },
      data: {
        id: "bp_c_01jka1e3k2ewha2z3p674dbyrx",
        component_key: "form-a4750667-d774-40fb-9b0a-44f8539ff6c4",
        component_type: "form",
        component_id: "f_01jk7awbhqewgbkbgk8rjm7bv7",
        name: "Form B",
        prerequisites: [
          "form-47c61d17-62b0-4c42-8ca2-0eff641c9d88"
        ]
      }
    }
  ],
  edges: [
    { source: "form-a4750667-d774-40fb-9b0a-44f8539ff6c4", target: "form-0f58384c-4966-4ce6-9ec2-40b96d61f745" },
    { source: "form-47c61d17-62b0-4c42-8ca2-0eff641c9d88", target: "form-7c26f280-7bff-40e3-b9a5-0533136f52c3" },
    { source: "form-47c61d17-62b0-4c42-8ca2-0eff641c9d88", target: "form-a4750667-d774-40fb-9b0a-44f8539ff6c4" }
  ],
  forms: [
    {
      id: "f_01jk7ap2r3ewf9gx6a9r09gzjv",
      name: "Form D",
      description: "test",
      fields: [
        { id: "dynamic_checkbox_group", name: "dynamic_checkbox_group", type: "checkbox-group", label: "Dynamic Checkbox Group" },
        { id: "dynamic_object", name: "dynamic_object", type: "object-enum", label: "Dynamic Object" },
        { id: "id", name: "id", type: "short-text", label: "ID", required: true },
        { id: "name", name: "name", type: "short-text", label: "Name", required: true },
        { id: "email", name: "email", type: "short-text", label: "Email", required: true },
        { id: "notes", name: "notes", type: "multi-line-text", label: "Notes" },
        { id: "multi_select", name: "multi_select", type: "multi-select", label: "Multi Select" }
      ]
    },
    {
      id: "f_01jk7awbhqewgbkbgk8rjm7bv7",
      name: "Form B",
      description: "test",
      fields: [
        { id: "multi_select", name: "multi_select", type: "multi-select", label: "Multi Select" },
        { id: "dynamic_checkbox_group", name: "dynamic_checkbox_group", type: "checkbox-group", label: "Dynamic Checkbox Group" },
        { id: "dynamic_object", name: "dynamic_object", type: "object-enum", label: "Dynamic Object" },
        { id: "id", name: "id", type: "short-text", label: "ID", required: true },
        { id: "name", name: "name", type: "short-text", label: "Name", required: true },
        { id: "email", name: "email", type: "short-text", label: "Email", required: true },
        { id: "notes", name: "notes", type: "multi-line-text", label: "Notes" }
      ]
    },
    {
      id: "f_01jk7aygnqewh8gt8549beb1yc",
      name: "Form C",
      description: "test",
      fields: [
        { id: "dynamic_object", name: "dynamic_object", type: "object-enum", label: "Dynamic Object" },
        { id: "id", name: "id", type: "short-text", label: "ID", required: true },
        { id: "name", name: "name", type: "short-text", label: "Name", required: true },
        { id: "email", name: "email", type: "short-text", label: "Email", required: true },
        { id: "notes", name: "notes", type: "multi-line-text", label: "Notes" },
        { id: "multi_select", name: "multi_select", type: "multi-select", label: "Multi Select" },
        { id: "dynamic_checkbox_group", name: "dynamic_checkbox_group", type: "checkbox-group", label: "Dynamic Checkbox Group" }
      ]
    },
    {
      id: "f_01jk7ap2r3ewf9gx6a9r09gzja", // Changed to match the new component_id in the node
      name: "Form A",
      description: "test",
      fields: [
        { id: "id", name: "id", type: "short-text", label: "ID", required: true },
        { id: "name", name: "name", type: "short-text", label: "Name", required: true },
        { id: "email", name: "email", type: "short-text", label: "Email", required: true },
        { id: "notes", name: "notes", type: "multi-line-text", label: "Notes" },
        { id: "multi_select", name: "multi_select", type: "multi-select", label: "Multi Select" },
        { id: "dynamic_checkbox_group", name: "dynamic_checkbox_group", type: "checkbox-group", label: "Dynamic Checkbox Group" },
        { id: "dynamic_object", name: "dynamic_object", type: "object-enum", label: "Dynamic Object" }
      ]
    }
  ]
};

// Global data for prefill
export const globalData = {
  'Client Organization Properties': {
    orgName: "Acme Inc",
    orgId: "acme-123",
    address: "123 Main St",
    city: "San Francisco",
    email: "info@acme.com"
  },
  'Action Properties': {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "active"
  }
};

// Prefill configuration interface
export interface PrefillConfig {
  sourceFormId: string | null;
  sourceFieldId: string | null;
  globalDataPath: string | null;
}

export interface FormPrefillMappings {
  [formId: string]: {
    [fieldId: string]: PrefillConfig;
  };
}

// Example prefill configuration - using node IDs, not form IDs
export const initialPrefillConfig: FormPrefillMappings = {
  // Form D's node ID
  "form-0f58384c-4966-4ce6-9ec2-40b96d61f745": {
    "email": {
      // Form A's node ID
      sourceFormId: "form-47c61d17-62b0-4c42-8ca2-0eff641c9d88",
      sourceFieldId: "email",
      globalDataPath: null
    }
  }
};
