/**
 * Build script for versioned remote deployments.
 *
 * Builds each remote MF at multiple versions and updates the
 * remotes-manifest.json in the host's public directory.
 *
 * Usage: node scripts/build-version.js
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'apps/store/public/remotes-manifest.json');

const remotes = [
  {
    name: 'cart',
    dir: path.join(ROOT, 'apps/cart'),
    port: 3001,
    versions: ['1.0.0', '2.0.0'],
    exposes: {
      CartWidget: './CartWidget',
      CartPage: './CartPage',
    },
  },
  {
    name: 'reviews',
    dir: path.join(ROOT, 'apps/reviews'),
    port: 3002,
    versions: ['1.0.0', '2.0.0'],
    exposes: {
      ReviewList: './ReviewList',
      ReviewForm: './ReviewForm',
      ReviewSummary: './ReviewSummary',
    },
  },
];

function buildRemote(remote, version) {
  console.log(`\n🔨 Building ${remote.name}@${version}...`);
  execSync(`VERSION=${version} pnpm --filter @mgs/${remote.name} build`, {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env, VERSION: version },
  });
  console.log(`✅ ${remote.name}@${version} built → dist/v${version}/`);
}

function generateManifest() {
  const manifest = {};

  for (const remote of remotes) {
    manifest[remote.name] = {
      activeVersion: remote.versions[remote.versions.length - 1], // Latest is active
      versions: {},
    };

    for (const version of remote.versions) {
      manifest[remote.name].versions[version] = {};
      for (const [componentName, modulePath] of Object.entries(remote.exposes)) {
        manifest[remote.name].versions[version][componentName] = {
          url: `http://localhost:${remote.port}/v${version}/remoteEntry.js`,
          scope: remote.name,
          module: modulePath,
          version,
        };
      }
    }
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\n📋 Manifest written to ${MANIFEST_PATH}`);
}

// ---- Main ----
console.log('🚀 Building versioned remotes...\n');

for (const remote of remotes) {
  for (const version of remote.versions) {
    buildRemote(remote, version);
  }
}

generateManifest();

console.log('\n✨ All versioned builds complete!');
console.log('   Serve each remote\'s dist/ directory to enable version switching.');
