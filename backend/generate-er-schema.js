// generate-er-schema.js

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Path to your Mongoose models directory
const modelsDir = path.join(__dirname, 'models');

// Output file for dbdiagram.io
const outputFile = path.join(__dirname, 'er-diagram.dbml');

const toDbmlType = (type) => {
  if (!type) return 'string';
  const t = type.toString().toLowerCase();
  if (t.includes('string')) return 'string';
  if (t.includes('number')) return 'int';
  if (t.includes('date')) return 'datetime';
  if (t.includes('boolean')) return 'boolean';
  if (t.includes('objectid')) return 'ObjectId';
  return 'string';
};

let dbmlOutput = '';

fs.readdirSync(modelsDir).forEach((file) => {
  const modelPath = path.join(modelsDir, file);
  const model = require(modelPath);
  const schema = model.schema;
  const modelName = model.modelName.toLowerCase();

  dbmlOutput += `Table ${modelName} {\n`;
  dbmlOutput += `  _id ObjectId [pk]\n`;

  for (const [field, config] of Object.entries(schema.obj)) {
    if (field === '_id') continue;

    let type = '';
    let ref = '';
    if (typeof config === 'object' && config !== null && config.type) {
      type = toDbmlType(config.type.name || config.type.toString());
      if (config.ref) {
        ref = config.ref.toLowerCase();
      }
    } else {
      type = toDbmlType(config.name || config.toString());
    }

    dbmlOutput += `  ${field} ${type}${ref ? ` [ref: > ${ref}._id]` : ''}\n`;
  }

  dbmlOutput += '}\n\n';
});

fs.writeFileSync(outputFile, dbmlOutput);
console.log('ER diagram code written to er-diagram.dbml');
