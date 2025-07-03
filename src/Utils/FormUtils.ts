import { FormDAGResponse, Form, PrefillConfig } from '@/mockData/formData';

/**
 * Gets all upstream forms for a given form in the DAG
 * @param formId The ID of the form to find dependencies for
 * @param formDAG The form DAG data
 * @param directOnly If true, only returns direct dependencies
 * @returns Array of upstream form objects
 */
export const getUpstreamForms = (formId: string, formDAG: FormDAGResponse, directOnly: boolean = false): Form[] => {
  const directDependencies = formDAG.edges
    .filter(edge => edge.target === formId)
    .map(edge => edge.source);
  
  const directForms = directDependencies
    .map(depId => formDAG.forms.find(f => f.id === depId))
    .filter((form): form is Form => form !== undefined);
  
  if (directOnly) {
    return directForms;
  }
  
  // Recursively find transitive dependencies
  const transitiveForms = directDependencies.flatMap(depId => 
    getUpstreamForms(depId, formDAG, false)
  );
  
  // Deduplicate forms
  const allForms = [...directForms, ...transitiveForms];
  const uniqueForms = allForms.filter((form, index, self) =>
    index === self.findIndex(f => f.id === form.id)
  );
  
  return uniqueForms;
};

/**
 * Gets all downstream forms for a given form in the DAG
 * @param formId The ID of the form to find dependents for
 * @param formDAG The form DAG data
 * @param directOnly If true, only returns direct dependents
 * @returns Array of downstream form objects
 */
export const getDownstreamForms = (formId: string, formDAG: FormDAGResponse, directOnly: boolean = false): Form[] => {
  const directDependents = formDAG.edges
    .filter(edge => edge.source === formId)
    .map(edge => edge.target);
  
  const directForms = directDependents
    .map(depId => formDAG.forms.find(f => f.id === depId))
    .filter((form): form is Form => form !== undefined);
  
  if (directOnly) {
    return directForms;
  }
  
  // Recursively find transitive dependents
  const transitiveForms = directDependents.flatMap(depId => 
    getDownstreamForms(depId, formDAG, false)
  );
  
  // Deduplicate forms
  const allForms = [...directForms, ...transitiveForms];
  const uniqueForms = allForms.filter((form, index, self) =>
    index === self.findIndex(f => f.id === form.id)
  );
  
  return uniqueForms;
};

/**
 * Resolves the value from a prefill configuration
 * @param prefillConfig The prefill configuration
 * @param formData Map of form IDs to their submitted data
 * @param globalData The global data object
 * @returns The resolved value or null if not found
 */
export const resolvePrefillValue = (
  prefillConfig: PrefillConfig,
  formData: Record<string, Record<string, any>>,
  globalData: Record<string, any>
): any => {
  if (prefillConfig.sourceFormId && prefillConfig.sourceFieldId) {
    const sourceForm = formData[prefillConfig.sourceFormId];
    if (!sourceForm) return null;
    
    // Find the field in the source form
    const sourceField = prefillConfig.sourceFieldId.split('-').pop() || '';
    return sourceForm[sourceField] || null;
  } 
  else if (prefillConfig.globalDataPath) {
    // Resolve path in global data
    return resolvePathInObject(globalData, prefillConfig.globalDataPath);
  }
  
  return null;
};

/**
 * Resolves a dot-notation path in an object
 * @param obj The object to resolve the path in
 * @param path The path in dot notation (e.g., "client.name")
 * @returns The value at the path or null if not found
 */
export const resolvePathInObject = (obj: Record<string, any>, path: string): any => {
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return null;
    }
    
    current = current[part];
  }
  
  return current;
};

/**
 * Validates if a form has all required prefill mappings
 * @param formId The ID of the form to validate
 * @param requiredFields Array of field IDs that require prefill
 * @param prefillConfigs The current prefill configurations
 * @returns True if all required fields have prefill mappings
 */
export const validateFormPrefill = (
  formId: string,
  requiredFields: string[],
  prefillConfigs: Record<string, Record<string, PrefillConfig>>
): boolean => {
  if (!prefillConfigs[formId]) {
    return requiredFields.length === 0;
  }
  
  for (const fieldId of requiredFields) {
    if (!prefillConfigs[formId][fieldId]) {
      return false;
    }
  }
  
  return true;
};
