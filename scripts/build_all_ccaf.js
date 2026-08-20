import { spawnSync } from 'child_process';
import path from 'path';

console.log("Running all Claude CCAF domain generators...");

const scripts = [
  'generate_domain1.js',
  'generate_domain2.js',
  'generate_domain3.js',
  'generate_domain4.js',
  'generate_domain5.js'
];

for (const script of scripts) {
  console.log(`\n--- Running ${script} ---`);
  const result = spawnSync('node', [path.join(process.cwd(), 'scripts', script)], {
    stdio: 'inherit',
    encoding: 'utf8'
  });
  if (result.status !== 0) {
    console.error(`Failed executing ${script}`);
    process.exit(1);
  }
}

console.log("\n✅ All 5 Claude CCAF Domain question banks generated and verified successfully!");
