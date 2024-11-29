// cache.js
class Cache {
  constructor(ttlSeconds = 300) { // Default TTL of 5 minutes
    this.cache = new Map();
    this.ttl = ttlSeconds * 1000; // Convert to milliseconds
  }

  // Set cache for a specific key
  set(key, value) {
    const expiry = Date.now() + this.ttl;
    this.cache.set(key, { value, expiry });
    console.log(`[CACHE] Key "${key}" set with TTL ${this.ttl / 1000}s`);
  }

  // Get cache for a specific key
  get(key) {
    const cached = this.cache.get(key);
    if (!cached) {
      console.log(`[CACHE] Key "${key}" not found in cache`);
      return null;
    }

    // Check if the cache is still valid
    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      console.log(`[CACHE] Key "${key}" expired and removed`);
      return null;
    }

    console.log(`[CACHE] Key "${key}" served from cache`);
    return cached.value;
  }

  // Invalidate a specific key
  invalidate(key) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      console.log(`[CACHE] Key "${key}" invalidated`);
    }
  }

  // Clear all cache
  clear() {
    this.cache.clear();
    console.log("[CACHE] All cache cleared");
  }
}

module.exports = new Cache(); // Singleton instance
