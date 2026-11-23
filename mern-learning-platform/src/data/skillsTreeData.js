export const SKILLS_TREE_DATA = [
  {
    category: 'Frontend Engineering',
    color: '#06b6d4',
    skills: [
      { id: 'sk_html_js', name: 'JavaScript ES6+', icon: '📜', level: 1, desc: 'Arrow functions, destructuring, promises, async/await', world: 1 },
      { id: 'sk_react_basics', name: 'React 18 & JSX', icon: '⚛️', level: 2, desc: 'Declarative UI, Virtual DOM diffing, component hierarchy', world: 2, dependsOn: ['sk_html_js'] },
      { id: 'sk_hooks', name: 'Modern React Hooks', icon: '🪝', level: 3, desc: 'useState, useEffect, useRef, custom hooks', world: 2, dependsOn: ['sk_react_basics'] },
      { id: 'sk_context', name: 'Context API & State', icon: '🌐', level: 4, desc: 'Global auth state without prop drilling', world: 2, dependsOn: ['sk_hooks'] },
      { id: 'sk_axios', name: 'Axios & Interceptors', icon: '📡', level: 5, desc: 'HTTP calls, baseURL, automatic Bearer headers', world: 3, dependsOn: ['sk_context'] }
    ]
  },
  {
    category: 'Backend Architecture',
    color: '#10b981',
    skills: [
      { id: 'sk_node_runtime', name: 'Node.js Event Loop', icon: '🟢', level: 2, desc: 'Non-blocking I/O, single-threaded concurrency', world: 4 },
      { id: 'sk_express_boot', name: 'Express Server & Ports', icon: '🚀', level: 3, desc: 'app.listen, JSON body parsers, CORS handling', world: 4, dependsOn: ['sk_node_runtime'] },
      { id: 'sk_middleware', name: 'Middleware Pipeline', icon: '🛡️', level: 4, desc: 'req, res, next() chain, input validation', world: 4, dependsOn: ['sk_express_boot'] },
      { id: 'sk_controllers', name: 'Modular Routing & Controllers', icon: '🎛️', level: 5, desc: 'Separation of HTTP routes from business logic', world: 4, dependsOn: ['sk_middleware'] }
    ]
  },
  {
    category: 'Database & Data Integrity',
    color: '#059669',
    skills: [
      { id: 'sk_mongo_bson', name: 'MongoDB & BSON Documents', icon: '🍃', level: 3, desc: 'NoSQL collections, ObjectIds, dynamic schemas', world: 5 },
      { id: 'sk_mongoose', name: 'Mongoose ODM Models', icon: '📐', level: 4, desc: 'Schema validation, pre-save hooks, timestamps', world: 5, dependsOn: ['sk_mongo_bson'] },
      { id: 'sk_financial_paise', name: 'Integer-Paise Precision', icon: '🪙', level: 5, desc: 'Zero floating point error financial modeling', world: 5, dependsOn: ['sk_mongoose'] },
      { id: 'sk_indexes', name: 'Compound Indexes', icon: '⚡', level: 6, desc: 'Sub-millisecond query optimization and uniqueness', world: 5, dependsOn: ['sk_financial_paise'] }
    ]
  },
  {
    category: 'Security & Cryptography',
    color: '#f59e0b',
    skills: [
      { id: 'sk_bcrypt', name: 'Salted Bcrypt Hashing', icon: '🧂', level: 4, desc: 'One-way cryptographic hash with cost factor', world: 6 },
      { id: 'sk_jwt', name: 'JSON Web Tokens (JWT)', icon: '🔑', level: 5, desc: 'Header, Payload, Signature, HMAC-SHA256', world: 6, dependsOn: ['sk_bcrypt'] },
      { id: 'sk_rbac', name: 'Role-Based Access Control', icon: '👮', level: 6, desc: 'requireAuth and requireAdmin route guards', world: 6, dependsOn: ['sk_jwt'] }
    ]
  },
  {
    category: 'DevOps & Distributed Systems',
    color: '#8b5cf6',
    skills: [
      { id: 'sk_env_config', name: 'Environment Variables (.env)', icon: '🔒', level: 5, desc: 'Separation of secrets from code repositories', world: 8 },
      { id: 'sk_distributed_lock', name: 'Distributed Mutex Locking', icon: '🔒', level: 7, desc: 'Race-condition prevention via MongoDB leases', world: 9, dependsOn: ['sk_mongoose'] },
      { id: 'sk_cron_automation', name: 'GitHub Actions Cron Automation', icon: '⏱️', level: 8, desc: '0 */4 * * * automated webhook price monitoring', world: 9, dependsOn: ['sk_distributed_lock'] }
    ]
  }
];
