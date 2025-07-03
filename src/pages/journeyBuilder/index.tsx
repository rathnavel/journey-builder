import React, { useState, useEffect } from 'react';
import FormDAG from './FormDAG';
import PrefillConfiguration from './PrefillConfiguration';
import { 
  mockFormDAGResponse, 
  Form, 
  PrefillConfig, 
  FormPrefillMappings, 
  initialPrefillConfig
} from '@/mockData/formData';
// import './JourneyBuilder.css';

const JourneyBuilder: React.FC = () => {
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [prefillConfigs, setPrefillConfigs] = useState<FormPrefillMappings>(initialPrefillConfig);
  const [processedData, setProcessedData] = useState(mockFormDAGResponse);

  // Process and augment the data for display
  useEffect(() => {
    // Make a deep copy
    const processedData = JSON.parse(JSON.stringify(mockFormDAGResponse));
    
    // Add nodeIds to forms based on the nodes they correspond to
    const formIdToNodeId = new Map<string, string>();
    processedData.nodes.forEach((node: any) => {
      const formId = node.data.component_id;
      formIdToNodeId.set(formId, node.id);
    });
    
    // Ensure each form has a unique ID and correct structure
    processedData.forms = processedData.forms.map((form: any) => {
      // Add nodeId to form if we have it
      const nodeId = formIdToNodeId.get(form.id);
      if (nodeId) {
        form.nodeId = nodeId;
        console.log(`Added nodeId ${nodeId} to form ${form.id} (${form.name})`);
      }
      
      // Extract fields from field_schema if necessary
      if (!form.fields && form.field_schema) {
        const fields = Object.entries(form.field_schema.properties || {}).map(([name, schema]: [string, any]) => ({
          id: name,
          name,
          type: schema.avantos_type || schema.type,
          label: schema.title || name,
          required: form.field_schema.required?.includes(name) || false
        }));
        
        return { ...form, fields };
      }
      
      return form;
    });
    
    // Create an updated prefill config that uses nodeIds
    const updatedPrefillConfig: FormPrefillMappings = {};
    
    // Map any form IDs to node IDs for prefill configurations
    Object.entries(initialPrefillConfig).forEach(([formId, fieldConfigs]) => {
      // Find the node ID for this form
      const node = processedData?.nodes?.find((n: any) => n.id === formId);
      if (node) {
        updatedPrefillConfig[formId] = fieldConfigs;
        console.log(`Added prefill config for node ${formId}`);
      } else {
        // This might be a form ID, not a node ID
        const matchingNode = processedData.nodes.find((n: any) => n.data.component_id === formId);
        if (matchingNode) {
          updatedPrefillConfig[matchingNode.id] = fieldConfigs;
          console.log(`Mapped prefill config from form ${formId} to node ${matchingNode.id}`);
        } else {
          console.error(`Could not find node for form ID ${formId} in prefill config`);
        }
      }
    });
    
    setProcessedData(processedData);
    setPrefillConfigs(updatedPrefillConfig);
    console.log("Processed data:", processedData);
    console.log("Updated prefill config:", updatedPrefillConfig);
  }, []);

  const handleSelectForm = (form: Form) => {
    console.log(`Selected form: ${form.id} (${form.name})`, form);
    setSelectedForm(form);
  };

  const handleUpdatePrefillConfig = (formId: string, fieldId: string, config: PrefillConfig | null) => {
    setPrefillConfigs(prevConfigs => {
      const newConfigs = { ...prevConfigs };
      
      // Initialize form config if it doesn't exist
      if (!newConfigs[formId]) {
        newConfigs[formId] = {};
      }
      
      if (config === null) {
        // Remove the mapping
        if (newConfigs[formId][fieldId]) {
          const { [fieldId]: _, ...rest } = newConfigs[formId];
          console.log('_-->', _);
          newConfigs[formId] = rest;
        }
      } else {
        // Set or update the mapping
        newConfigs[formId][fieldId] = config;
      }
      
      return newConfigs;
    });
  };

  return (
    <div className="journey-builder" style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center' }}>Journey Builder Challenge Program</h1>
      
      <div className="journey-builder-content" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <div className="dag-container" style={{ 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '20px',
          backgroundColor: '#abc8bf'
        }}>
          <FormDAG data={processedData} onSelectForm={handleSelectForm} />
        </div>
        
        <div className="prefill-container" style={{ 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '20px',
          backgroundColor: '#fff'
        }}>
          <PrefillConfiguration 
            selectedForm={selectedForm}
            formDAG={processedData}
            prefillConfigs={prefillConfigs}
            onUpdatePrefillConfig={handleUpdatePrefillConfig}
          />
        </div>
      </div>
    </div>
  );
};

export default JourneyBuilder;
