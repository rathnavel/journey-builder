import { Form, FormDAGResponse } from '@/mockData/formData';
import React, { useState, useEffect } from 'react';

interface FormNodeProps {
  nodeId: string;
  name: string;
  isSelected: boolean;
  onClick: () => void;
}

const FormNode: React.FC<FormNodeProps> = ({ name, isSelected, onClick }) => {
  return (
    <div 
      className={`form-node ${isSelected ? 'selected' : ''}`} 
      onClick={onClick}
      style={{
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        backgroundColor: isSelected ? '#e0f7fa' : '#fff',
        cursor: 'pointer',
        margin: '10px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center',
        minWidth: '100px'
      }}
    >
      <h3>{name}</h3>
    </div>
  );
};

interface FormDAGProps {
  data: FormDAGResponse;
  onSelectForm: (form: Form) => void;
}

const FormDAG: React.FC<FormDAGProps> = ({ data, onSelectForm }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [nodeToFormMap, setNodeToFormMap] = useState<Map<string, Form>>(new Map());

  // Build a mapping from node IDs to forms
  useEffect(() => {
    const mapping = new Map<string, Form>();
    
    data?.nodes?.forEach(node => {
      const formId = node?.data?.component_id;
      
      // Find the form that has matching ID with the node's component_id
      const matchingForms = data.forms.filter(f => f.id === formId);
      console.log(`Found ${matchingForms.length} forms matching component_id ${formId} for node ${node.id} (${node.data.name})`);
      
      // Get the form that matches the name from the node data
      const form = matchingForms.find(f => f.name === node.data.name) || matchingForms[0];
      
      if (form) {
        // Make a copy of the form with the nodeId added
        const formWithNodeId = {
          ...form,
          nodeId: node.id // Add nodeId for mapping back to the node
        };
        
        // Store the nodeId -> form mapping
        mapping.set(node.id, formWithNodeId);
        
        console.log(`Mapped node ${node.id} (${node.data.name}) to form ${form.id} (${form.name})`);
      } else {
        console.error(`Could not find form with ID ${formId} and name ${node.data.name} for node ${node.id}`);
      }
    });
    
    setNodeToFormMap(mapping);
  }, [data]);

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
    const form = nodeToFormMap.get(nodeId);
    if (form) {
      onSelectForm(form);
    }
  };

  // Simplified DAG visualization - display forms in a single row in order (A, B, C, D)
  // In a real app, you would use a proper graph visualization library like react-flow
  const renderFormNodes = () => {
    // Sort nodes based on form name alphabetically to display in order (A, B, C, D)
    const sortedNodes = [...(data?.nodes || [])].sort((a, b) => {
      return a.data.name.localeCompare(b.data.name);
    });
    
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        width: '100%'
      }}>
        {sortedNodes.map(node => (
          <FormNode 
            key={node.id} 
            nodeId={node.id}
            name={node.data.name} 
            isSelected={selectedNode === node.id}
            onClick={() => handleNodeClick(node.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="form-dag">
      <h2>Form Workflow</h2>
      {renderFormNodes()}
    </div>
  );
};

export default FormDAG;
