import React, { useState, useEffect } from 'react';
import { Form, FormField, FormDAGResponse, PrefillConfig, FormPrefillMappings, globalData } from '@/mockData/formData';

interface PrefillConfigurationProps {
  selectedForm: Form | null;
  formDAG: FormDAGResponse;
  prefillConfigs: FormPrefillMappings;
  onUpdatePrefillConfig: (formId: string, fieldId: string, config: PrefillConfig | null) => void;
}

interface SourceFormFields {
  form: Form;
  fields: FormField[];
  isDirectDependency: boolean;
}

const PrefillConfiguration: React.FC<PrefillConfigurationProps> = ({ 
  selectedForm, 
  formDAG, 
  prefillConfigs, 
  onUpdatePrefillConfig 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [availableSourceForms, setAvailableSourceForms] = useState<SourceFormFields[]>([]);

  // Find all upstream forms for the selected form
  useEffect(() => {
    if (!selectedForm) return;

    // Find the node ID corresponding to the selected form using the nodeId we stored
    const nodeId = selectedForm.nodeId;
    
    // If we don't have a nodeId, try to find it
    const nodeForSelectedForm = nodeId 
      ? formDAG.nodes.find((n: any) => n.id === nodeId)
      : formDAG.nodes.find((node: any) => node.data.component_id === selectedForm.id);

    if (!nodeForSelectedForm) {
      console.error(`Could not find node for form ${selectedForm.id} (${selectedForm.name})`);
      return;
    }

    console.log(`Found node ${nodeForSelectedForm.id} for form ${selectedForm.id} (${selectedForm.name})`);

    // Helper function to find all upstream forms (direct and transitive dependencies)
    const findUpstreamForms = (nodeId: string, isDirectDependency: boolean = true): SourceFormFields[] => {
      // Find prerequisites from node data
      const node = formDAG.nodes.find((n: any) => n.id === nodeId);
      if (!node) {
        console.error(`Could not find node with ID ${nodeId}`);
        return [];
      }
      
      const directDependencies = node.data.prerequisites || [];
      
      const directForms = directDependencies.map((depId: any) => {
        const depNode = formDAG.nodes.find((n: any) => n.id === depId);
        if (!depNode) return null;
        
        const form = formDAG.forms.find((f: any) => f.id === depNode.data.component_id);
        return form ? { 
          form, 
          fields: form.fields, 
          isDirectDependency 
        } : null;
      }).filter(Boolean) as SourceFormFields[];
      
      // Recursively find transitive dependencies
      const transitiveForms = directDependencies.flatMap((depId: any) => 
        findUpstreamForms(depId, false)
      );
      
      return [...directForms, ...transitiveForms];
    };
    
    setAvailableSourceForms(findUpstreamForms(nodeForSelectedForm.id));
    console.log(`Finding upstream forms for node ${nodeForSelectedForm.id} (${nodeForSelectedForm.data.name})`);
  }, [selectedForm, formDAG]);

  const handleFieldClick = (fieldId: string) => {
    setSelectedFieldId(fieldId);
    setShowModal(true);
  };

  const handleRemoveMapping = (fieldId: string) => {
    if (!selectedForm) return;
    // Use nodeId if available, otherwise fall back to id
    const formId = selectedForm.nodeId || selectedForm.id;
    onUpdatePrefillConfig(formId, fieldId, null);
  };

  const handleSelectSource = (sourceFormId: string, sourceFieldId: string) => {
    if (!selectedForm || !selectedFieldId) return;
    
    // Use nodeId if available, otherwise fall back to id
    const formId = selectedForm.nodeId || selectedForm.id;
    
    onUpdatePrefillConfig(formId, selectedFieldId, {
      sourceFormId,
      sourceFieldId,
      globalDataPath: null
    });
    
    setShowModal(false);
  };

  const handleSelectGlobalSource = (path: string) => {
    if (!selectedForm || !selectedFieldId) return;
    
    // Use nodeId if available, otherwise fall back to id
    const formId = selectedForm.nodeId || selectedForm.id;
    
    onUpdatePrefillConfig(formId, selectedFieldId, {
      sourceFormId: null,
      sourceFieldId: null,
      globalDataPath: path
    });
    
    setShowModal(false);
  };

  const renderSourceFormSection = (sourceForm: SourceFormFields) => {
    return (
      <div key={sourceForm.form.id} className="source-form-section" style={{ marginBottom: '20px' }}>
        <h4>{sourceForm.form.name} {sourceForm.isDirectDependency ? '(Direct Dependency)' : '(Transitive Dependency)'}</h4>
        <div className="form-fields">
          {sourceForm.fields.map(field => (
            <div 
              key={field.id} 
              className="source-field"
              onClick={() => handleSelectSource(sourceForm.form.id, field.id)}
              style={{ 
                padding: '8px', 
                border: '1px solid #ddd',
                borderRadius: '4px',
                margin: '4px 0',
                cursor: 'pointer'
              }}
            >
              <div>{field.label}</div>
              <div><small>{field.type}</small></div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderGlobalDataSection = () => {
    const renderGlobalDataOptions = (obj: any, path: string = '') => {
      return Object.entries(obj).map(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;
        
        if (typeof value === 'object' && value !== null && !(value instanceof Date)) {
          return (
            <div key={currentPath}>
              <h4>{key}</h4>
              {renderGlobalDataOptions(value, currentPath)}
            </div>
          );
        }
        
        return (
          <div 
            key={currentPath}
            className="global-data-option"
            onClick={() => handleSelectGlobalSource(currentPath)}
            style={{ 
              padding: '8px', 
              border: '1px solid #ddd',
              borderRadius: '4px',
              margin: '4px 0',
              cursor: 'pointer'
            }}
          >
            <div>{key}</div>
            <div><small>{String(value)}</small></div>
          </div>
        );
      });
    };

    return (
      <div className="global-data-section" style={{ marginBottom: '20px' }}>
        <h4>Global Data</h4>
        <div className="global-data-container">
          {renderGlobalDataOptions(globalData)}
        </div>
      </div>
    );
  };

  const renderPrefillMappingValue = (fieldId: string) => {
    if (!selectedForm) return null;
    
    // If we're using the node ID for prefill configs, we need to use it
    const formPrefillId = selectedForm.nodeId || selectedForm.id;
    console.log(`Looking up prefill config for form ID: ${formPrefillId}, field ID: ${fieldId}`);
    
    const config = prefillConfigs[formPrefillId]?.[fieldId];
    if (!config) {
      console.log(`No prefill config found for ${formPrefillId}.${fieldId}`);
      return null; // Return null instead of "No mapping" text
    }
    
    console.log(`Found prefill config:`, config);
    
    if (config.sourceFormId && config.sourceFieldId) {
      // First try to find the source form by nodeId (in case sourceFormId is a node ID)
      const sourceNode = formDAG.nodes.find((n: any) => n.id === config.sourceFormId);
      let sourceForm;
      let sourceName = "";
      
      if (sourceNode) {
        // If we found a node, find the form with the matching component_id
        sourceForm = formDAG.forms.find((f: any) => f.id === sourceNode.data.component_id);
        if (sourceForm) {
          sourceName = sourceNode.data.name; // Use node.data.name which is more reliable
          console.log(`Found source form by node ID: ${sourceName}`);
        }
      } else {
        // If we didn't find a node, try to find the form directly
        sourceForm = formDAG.forms.find((f: any) => f.id === config.sourceFormId);
        if (sourceForm) {
          sourceName = sourceForm.name;
          console.log(`Found source form directly: ${sourceName}`);
        }
      }
      
      const sourceField = sourceForm?.fields.find((f: FormField) => f.id === config.sourceFieldId);
      
      if (sourceForm && sourceField) {
        return <span>{sourceName}.{sourceField.name}</span>;
      } else {
        console.error(`Could not find source form ${config.sourceFormId} or field ${config.sourceFieldId}`);
      }
    } else if (config.globalDataPath) {
      return <span>Global: {config.globalDataPath}</span>;
    }
    
    return <span>Invalid mapping</span>;
  };

  const renderSourceSelectionModal = () => {
    if (!showModal || !selectedForm || !selectedFieldId) return null;
    
    return (
      <div className="modal-overlay" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div className="modal-content" style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          maxWidth: '600px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #abc8bf' }}>
            <h3>Select Source for Prefill</h3>
            <button onClick={() => setShowModal(false)}>Close</button>
          </div>
          
          <div className="modal-body">
            <h4>Source Forms</h4>
            {availableSourceForms.length === 0 ? (
              <p>No upstream forms available</p>
            ) : (
              availableSourceForms.map(sourceForm => renderSourceFormSection(sourceForm))
            )}
            
            {renderGlobalDataSection()}
          </div>
        </div>
      </div>
    );
  };

  if (!selectedForm) {
    return <div>Please select a form to configure prefill mappings</div>;
  }

  return (
    <div className="prefill-configuration">
      <h2>Prefill Configuration for {selectedForm.name}</h2>
      {/* <p>Form ID: {selectedForm.id}</p> */}
      
      <div className="field-mappings" style={{ marginTop: '20px' }}>
        {selectedForm.fields.map(field => {
          // If we're using the node ID for prefill configs, we need to use it
          const formPrefillId = selectedForm.nodeId || selectedForm.id;
          const hasMapping = !!prefillConfigs[formPrefillId]?.[field.id];
          
          return (
            <div 
              key={field.id} 
              className="field-mapping-row"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                backgroundColor: field.id === selectedFieldId ? '#f0f9ff' : 'transparent',
                borderRadius: '4px'
              }}
              onClick={() => handleFieldClick(field.id)}
            >
              <div className="field-info" style={{ 
                display: 'flex', 
                alignItems: 'center', 
                width: '100%',
                fontSize: '15px'
              }}>
                <span style={{ fontWeight: 'bold', marginRight: '5px', minWidth: '150px', textAlign: 'left' }}>{field.label}:</span>
                <span>{renderPrefillMappingValue(field.id)}</span>
              </div>
              
              {hasMapping && (
                <div className="actions">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent opening the modal
                      handleRemoveMapping(field.id);
                    }}
                    style={{ 
                      marginLeft: '8px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '16px',
                      color: '#ff4d4f'
                    }}
                  >
                    (x)
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {renderSourceSelectionModal()}
    </div>
  );
};

export default PrefillConfiguration;
