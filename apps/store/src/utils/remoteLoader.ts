import type { RemoteManifest } from '@mgs/types';

/** Cache loaded scripts to avoid duplicate <script> tags */
const scriptCache = new Map<string, Promise<void>>();

/** Track containers that have already been initialized */
const initializedContainers = new Set<string>();

/** Load a remote entry script into the page */
function loadScript(url: string): Promise<void> {
  if (scriptCache.has(url)) return scriptCache.get(url)!;

  const promise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${url}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = url;
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptCache.delete(url);
      reject(new Error(`Failed to load remote entry: ${url}`));
    };
    document.head.appendChild(script);
  });

  scriptCache.set(url, promise);
  return promise;
}

// Declarations for webpack runtime globals injected by Module Federation
declare const __webpack_init_sharing__: (scope: string) => Promise<void>;
declare const __webpack_share_scopes__: Record<string, Record<string, any>>;

/**
 * Dynamically load a module from a remote container at runtime.
 * This avoids hardcoding remote URLs in the Rspack config.
 */
export async function loadRemoteModule(
  remoteUrl: string,
  scope: string,
  module: string,
): Promise<{ default: React.ComponentType<any>; [key: string]: any }> {
  // 1. Load the remoteEntry.js script
  await loadScript(remoteUrl);

  // 2. Initialize the host's share scopes (makes react, react-dom available)
  await __webpack_init_sharing__('default');

  // 3. Get the container from window
  const container = (window as any)[scope];
  if (!container) {
    throw new Error(`Remote container "${scope}" not found on window after loading ${remoteUrl}`);
  }

  // 4. Initialize the container with shared scopes (only once per container)
  if (!initializedContainers.has(scope)) {
    await container.init(__webpack_share_scopes__.default);
    initializedContainers.add(scope);
  }

  // 5. Get the module factory
  const factory = await container.get(module);
  if (!factory) {
    throw new Error(`Module "${module}" not found in remote "${scope}"`);
  }

  return factory();
}

/** Manifest cache */
let manifestCache: RemoteManifest | null = null;
let versionOverrides: Record<string, string> = {};

/** Load the remote manifest from the host */
export async function loadManifest(): Promise<RemoteManifest> {
  if (manifestCache) return manifestCache;

  const res = await fetch('/remotes-manifest.json');
  if (!res.ok) throw new Error('Failed to load remotes-manifest.json');
  manifestCache = await res.json();
  return manifestCache!;
}

/** Override the active version for a remote (versioning simulation) */
export function setVersionOverride(remoteName: string, version: string): void {
  versionOverrides[remoteName] = version;
  // Clear caches to force reload
  manifestCache = null;
  initializedContainers.delete(remoteName);
  scriptCache.clear();
}

/** Get all version overrides */
export function getVersionOverrides(): Record<string, string> {
  return { ...versionOverrides };
}

/**
 * Load a specific component from a remote, respecting version overrides.
 */
export async function loadRemoteComponent(
  remoteName: string,
  componentName: string,
): Promise<{ default: React.ComponentType<any> }> {
  const manifest = await loadManifest();
  const remote = manifest[remoteName];
  if (!remote) throw new Error(`Remote "${remoteName}" not found in manifest`);

  const version = versionOverrides[remoteName] || remote.activeVersion;
  const versionEntry = remote.versions[version];
  if (!versionEntry) throw new Error(`Version "${version}" not found for remote "${remoteName}"`);

  const entry = versionEntry[componentName];
  if (!entry) throw new Error(`Component "${componentName}" not found in ${remoteName}@${version}`);

  return loadRemoteModule(entry.url, entry.scope, entry.module);
}

/** Prefetch a remote entry script (on idle) */
export function prefetchRemote(url: string): void {
  if (typeof document === 'undefined') return;
  if (document.querySelector(`link[href="${url}"]`)) return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'script';
  link.href = url;
  document.head.appendChild(link);
}
