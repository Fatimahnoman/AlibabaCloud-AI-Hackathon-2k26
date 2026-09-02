#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const isWindows = os.platform() === 'win32';

function log(msg) { console.error(msg); }

function main() {
  log('========================================');
  log('Vercel Production Deployment');
  log('========================================');
  log('');

  const projectPath = process.cwd();
  log(`Project: ${projectPath}`);

  // Check login
  const whoami = spawnSync('vercel', ['whoami'], { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], shell: isWindows });
  const user = (whoami.stdout || '').trim().split('\n')[0];
  log(`Logged in as: ${user}`);
  log('');

  // Deploy
  log('Deploying to production...');
  log('');

  const result = spawnSync('vercel', ['--prod', '--yes'], {
    cwd: projectPath,
    encoding: 'utf8',
    stdio: ['inherit', 'pipe', 'pipe'],
    timeout: 600000,
    shell: isWindows
  });

  const output = (result.stdout || '') + (result.stderr || '');
  log(output);

  if (result.status !== 0) {
    log('Deployment failed!');
    process.exit(1);
  }

  // Extract URL
  const aliasedMatch = output.match(/Aliased:\s*(https:\/\/[a-zA-Z0-9.-]+\.vercel\.app)/i);
  const deploymentMatch = output.match(/Production:\s*(https:\/\/[a-zA-Z0-9.-]+\.vercel\.app)/i);
  const finalUrl = aliasedMatch ? aliasedMatch[1] : (deploymentMatch ? deploymentMatch[1] : null);

  log('');
  log('========================================');
  log('Deployment successful!');
  log('========================================');
  if (finalUrl) {
    log(`URL: ${finalUrl}`);
  }
  console.log(JSON.stringify({ status: 'success', url: finalUrl }));
}

main();
