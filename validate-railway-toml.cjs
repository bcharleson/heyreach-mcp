#!/usr/bin/env node

// Simple TOML validation script for railway.toml
const fs = require('fs');
const path = require('path');

function validateRailwayToml() {
  const tomlPath = path.join(__dirname, 'railway.toml');
  
  if (!fs.existsSync(tomlPath)) {
    console.error('❌ railway.toml file not found');
    process.exit(1);
  }
  
  const content = fs.readFileSync(tomlPath, 'utf8');
  const lines = content.split('\n');
  
  console.log('🔍 Validating railway.toml structure...\n');
  
  // Check for duplicate sections
  const sections = {};
  const duplicates = [];
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    
    // Check for section headers
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      const section = trimmed;
      const lineNumber = index + 1;
      
      if (sections[section]) {
        duplicates.push({
          section,
          firstLine: sections[section],
          duplicateLine: lineNumber
        });
      } else {
        sections[section] = lineNumber;
      }
    }
  });
  
  // Report findings
  console.log('📋 Found sections:');
  Object.entries(sections).forEach(([section, line]) => {
    console.log(`  ${section} (line ${line})`);
  });
  
  if (duplicates.length > 0) {
    console.log('\n❌ Duplicate sections found:');
    duplicates.forEach(({ section, firstLine, duplicateLine }) => {
      console.log(`  ${section}: first at line ${firstLine}, duplicate at line ${duplicateLine}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ No duplicate sections found');
  }
  
  // Check for required sections
  const requiredSections = ['[build]', '[deploy]'];
  const missingSections = requiredSections.filter(section => !sections[section]);
  
  if (missingSections.length > 0) {
    console.log('\n⚠️ Missing required sections:');
    missingSections.forEach(section => {
      console.log(`  ${section}`);
    });
  } else {
    console.log('✅ All required sections present');
  }
  
  console.log('\n🎉 railway.toml validation complete!');
}

validateRailwayToml();
