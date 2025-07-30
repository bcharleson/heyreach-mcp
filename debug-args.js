#!/usr/bin/env node

/**
 * Debug command line arguments to see what's being received
 */

console.log('🔍 Debugging Command Line Arguments\n');

console.log('process.argv:', process.argv);

const args = process.argv.slice(2);
console.log('args:', args);

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  console.log(`arg[${i}]:`, JSON.stringify(arg));
  
  if (arg.startsWith('--api-key=')) {
    const apiKey = arg.split('=')[1];
    console.log(`  Extracted API key:`, JSON.stringify(apiKey));
    console.log(`  API key length:`, apiKey.length);
    console.log(`  API key ends with =:`, apiKey.endsWith('='));
  }
}
