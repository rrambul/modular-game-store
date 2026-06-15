// Stand-in for a federated remote whose entry fails to load (e.g. MF server offline).
// Evaluating the module throws, so the dynamic import() rejects — exercising
// RemoteComponent's error path.
export default (() => {
  throw new Error('remote unavailable (test stub)');
})();
