#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testMCPServer() {
  console.log('🧪 Testing EdnSy MCP Server...\n');

  // Test 1: List tools
  console.log('1️⃣ Testing tools/list...');
  const listRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list'
  };

  try {
    const result = await sendMCPRequest(listRequest);
    console.log('✅ Tools list successful');
    console.log(`   Found ${result.result.tools.length} tools\n`);
  } catch (error) {
    console.log('❌ Tools list failed:', error.message);
  }

  // Test 2: Test tool call (simulated)
  console.log('2️⃣ Testing tool call (simulated)...');
  const callRequest = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/call',
    params: {
      name: 'retrieve_database',
      arguments: {
        databaseId: 'test-database-id',
        apiKey: 'test-api-key'
      }
    }
  };

  try {
    const result = await sendMCPRequest(callRequest);
    console.log('✅ Tool call test completed');
    console.log('   Note: This is a simulation - no actual API calls made\n');
  } catch (error) {
    console.log('❌ Tool call test failed:', error.message);
  }

  console.log('🎉 MCP Server testing completed!');
}

async function sendMCPRequest(request) {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['mcpServer.js'], {
      cwd: __dirname,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}: ${errorOutput}`));
        return;
      }

      try {
        // Filter out log messages and find JSON-RPC response
        const lines = output.split('\n');
        let jsonResponse = null;
        
        for (const line of lines) {
          if (line.trim().startsWith('{') && line.trim().endsWith('}')) {
            try {
              jsonResponse = JSON.parse(line.trim());
              break;
            } catch (e) {
              // Continue to next line
            }
          }
        }

        if (jsonResponse) {
          resolve(jsonResponse);
        } else {
          reject(new Error('No valid JSON-RPC response found'));
        }
      } catch (error) {
        reject(new Error(`Failed to parse response: ${error.message}`));
      }
    });

    child.stdin.write(JSON.stringify(request) + '\n');
    child.stdin.end();
  });
}

// Run tests
testMCPServer().catch(console.error);

