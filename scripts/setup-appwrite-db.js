/**
 * CivicFix — Appwrite Database & Collection Auto-Provisioning Script
 * 
 * Usage:
 *   node scripts/setup-appwrite-db.js
 * 
 * Requirements:
 *   APPWRITE_API_KEY in .env.local with scopes:
 *   - collections.read, collections.write
 *   - attributes.read, attributes.write
 *   - documents.read, documents.write
 *   - indexes.read, indexes.write
 *   - buckets.read, buckets.write
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables without exposing secrets
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || process.env.VITE_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || process.env.VITE_APPWRITE_PROJECT_ID || '6aa3a24400158be49594';
const databaseId = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID || process.env.VITE_APPWRITE_DATABASE_ID || '6aa3cd67003815f6851f';
const collectionId = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ISSUES_ID || process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID || 'issues';
const bucketId = process.env.EXPO_PUBLIC_APPWRITE_STORAGE_BUCKET_ID || process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID || '6aa4d5e200333b50dcc3';
const apiKey = process.env.APPWRITE_API_KEY;

if (!apiKey) {
  console.error('❌ Error: APPWRITE_API_KEY not found in .env.local.');
  process.exit(1);
}

function apiRequest(method, apiPath, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint + apiPath);
    const req = https.request({
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'X-Appwrite-Project': projectId,
        'X-Appwrite-Key': apiKey,
        'Content-Type': 'application/json',
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function main() {
  console.log('====================================================');
  console.log('CivicFix — Appwrite Database Provisioning');
  console.log('Endpoint:', endpoint);
  console.log('Project ID:', projectId);
  console.log('Target Database ID:', databaseId);
  console.log('Target Collection ID:', collectionId);
  console.log('Target Bucket ID:', bucketId);
  console.log('====================================================\n');

  // 1. Verify / Create Database
  console.log('Step 1: Checking Database...');
  const dbCheck = await apiRequest('GET', `/databases/${databaseId}`);
  if (dbCheck.status === 404) {
    console.log(`Database '${databaseId}' not found. Creating database...`);
    const createDb = await apiRequest('POST', '/databases', {
      databaseId,
      name: 'CivicFix Database',
      enabled: true,
    });
    if (createDb.status >= 200 && createDb.status < 300) {
      console.log('✓ Database created successfully!');
    } else {
      console.error('Failed to create database:', createDb.data?.message || createDb.data);
    }
  } else if (dbCheck.status === 200) {
    console.log(`✓ Database '${databaseId}' is verified and active.`);
  } else {
    console.log(`Note on Database check: HTTP ${dbCheck.status}`);
  }

  // 2. Check / Create Collection
  console.log('\nStep 2: Checking Collection...');
  const colCheck = await apiRequest('GET', `/databases/${databaseId}/collections/${collectionId}`);
  if (colCheck.status === 404) {
    console.log(`Collection '${collectionId}' does not exist. Creating...`);
    const createCol = await apiRequest('POST', `/databases/${databaseId}/collections`, {
      collectionId,
      name: 'Civic Issues',
      permissions: ['read("any")', 'create("users")', 'update("users")'],
      documentSecurity: false,
      enabled: true,
    });

    if (createCol.status >= 200 && createCol.status < 300) {
      console.log('✓ Collection created successfully!');
    } else {
      console.error('Failed to create collection:', createCol.data?.message || createCol.data);
      return;
    }

    // Wait 1 second for Appwrite internal sync
    await delay(1000);

    // 3. Create Attributes
    console.log('\nStep 3: Creating Schema Attributes...');
    const attributes = [
      { type: 'string', key: 'title', size: 255, required: true },
      { type: 'string', key: 'description', size: 2000, required: false, default: '' },
      { type: 'string', key: 'category', size: 50, required: true },
      { type: 'string', key: 'status', size: 50, required: false, default: 'Reported' },
      { type: 'float', key: 'latitude', required: true },
      { type: 'float', key: 'longitude', required: true },
      { type: 'string', key: 'locationName', size: 255, required: false, default: '' },
      { type: 'string', key: 'ward', size: 100, required: false, default: '' },
      { type: 'string', key: 'photoUrl', size: 1000, required: false, default: '' },
      { type: 'string', key: 'photoFileId', size: 100, required: false, default: '' },
      { type: 'string', key: 'reportedBy', size: 100, required: false, default: '' },
      { type: 'string', key: 'citizenName', size: 150, required: false, default: '' },
      { type: 'string', key: 'citizenPhone', size: 30, required: false, default: '' },
      { type: 'integer', key: 'votes', required: false, default: 0, min: 0 },
      { type: 'string', key: 'department', size: 100, required: false, default: '' },
      { type: 'string', key: 'createdAt', size: 50, required: false, default: '' },
      { type: 'string', key: 'updatedAt', size: 50, required: false, default: '' },
    ];

    for (const attr of attributes) {
      process.stdout.write(` - Adding attribute '${attr.key}' (${attr.type})... `);
      let payload = { key: attr.key, required: attr.required };
      if (attr.type === 'string') {
        payload.size = attr.size;
        if (!attr.required && attr.default !== undefined) payload.default = attr.default;
      } else if (attr.type === 'integer') {
        if (!attr.required && attr.default !== undefined) payload.default = attr.default;
        if (attr.min !== undefined) payload.min = attr.min;
      }

      const res = await apiRequest('POST', `/databases/${databaseId}/collections/${collectionId}/attributes/${attr.type}`, payload);
      if (res.status >= 200 && res.status < 300) {
        console.log('✓');
      } else {
        console.log('Note: ' + (res.data?.message || res.status));
      }
      await delay(300);
    }
  } else if (colCheck.status === 200) {
    console.log(`✓ Collection '${collectionId}' already exists.`);
  } else {
    console.log('Note on Collection check:', colCheck.data?.message || colCheck.status);
  }

  // 4. Update Bucket Permissions
  console.log('\nStep 4: Checking Storage Bucket Permissions...');
  const bucketCheck = await apiRequest('GET', `/storage/buckets/${bucketId}`);
  if (bucketCheck.status === 200) {
    console.log(`✓ Bucket '${bucketId}' found. Ensuring public read permissions...`);
    await apiRequest('PUT', `/storage/buckets/${bucketId}`, {
      name: bucketCheck.data.name || 'issue-photos',
      permissions: ['read("any")', 'create("users")', 'create("any")'],
      fileSecurity: false,
      enabled: true,
    });
    console.log('✓ Bucket permissions updated.');
  }

  console.log('\n====================================================');
  console.log('Provisioning check complete.');
  console.log('====================================================');
}

main().catch(err => {
  console.error('Fatal error in provisioning script:', err.message);
});
