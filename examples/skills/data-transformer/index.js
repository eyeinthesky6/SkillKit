/**
 * Data Transformer Skill
 * Transforms JSON data through filtering, mapping, and aggregation
 */

module.exports = async function(input, sandbox, context) {
  const { data, operations = {} } = input;
  const { dryRun } = context;

  const originalCount = data.length;
  const operationsApplied = [];
  let transformedData = [...data];

  if (dryRun) {
    console.log(`[DRY RUN] Would transform ${data.length} records`);
    console.log(`[DRY RUN] Operations:`, Object.keys(operations));
  }

  // Apply filter
  if (operations.filter) {
    const filterKeys = Object.keys(operations.filter);
    if (filterKeys.length > 0) {
      transformedData = transformedData.filter(item => {
        return filterKeys.every(key => {
          return item[key] === operations.filter[key];
        });
      });
      operationsApplied.push('filter');
      
      if (!dryRun) {
        console.log(`Filtered: ${data.length} → ${transformedData.length} records`);
      }
    }
  }

  // Apply field mapping
  if (operations.map) {
    transformedData = transformedData.map(item => {
      const mapped = { ...item };
      Object.entries(operations.map).forEach(([oldKey, newKey]) => {
        if (oldKey in mapped) {
          mapped[newKey] = mapped[oldKey];
          if (oldKey !== newKey) {
            delete mapped[oldKey];
          }
        }
      });
      return mapped;
    });
    operationsApplied.push('map');
    
    if (!dryRun) {
      console.log(`Mapped fields:`, Object.keys(operations.map).length);
    }
  }

  // Apply field selection
  if (operations.select && operations.select.length > 0) {
    transformedData = transformedData.map(item => {
      const selected = {};
      operations.select.forEach(field => {
        if (field in item) {
          selected[field] = item[field];
        }
      });
      return selected;
    });
    operationsApplied.push('select');
    
    if (!dryRun) {
      console.log(`Selected fields:`, operations.select);
    }
  }

  // Apply sorting
  if (operations.sort && operations.sort.field) {
    const { field, order = 'asc' } = operations.sort;
    transformedData.sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];
      
      if (aVal === bVal) return 0;
      
      const comparison = aVal < bVal ? -1 : 1;
      return order === 'asc' ? comparison : -comparison;
    });
    operationsApplied.push('sort');
    
    if (!dryRun) {
      console.log(`Sorted by: ${field} (${order})`);
    }
  }

  if (dryRun) {
    console.log(`[DRY RUN] Result: ${transformedData.length} records`);
  } else {
    console.log(`Transformation complete: ${originalCount} → ${transformedData.length} records`);
  }

  return {
    data: transformedData,
    originalCount,
    transformedCount: transformedData.length,
    operationsApplied
  };
};

