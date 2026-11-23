# scripts/generate_guide/part15_mongo_qa.py

def get_part15_html():
    return """
<div class="chapter-container page-break" id="part-15">
    <h1>Part 15: MongoDB & Mongoose Interview Preparation (30 Topics)</h1>
    <p>
        These 30 database topics explain the data modeling, query optimization, indexing, and atomicity guarantees powering PriceRadar.
    </p>

    <h3>1. SQL (Relational) vs. NoSQL (Document)</h3>
    <ul>
        <li><strong>SQL:</strong> Rigid tables, pre-defined schemas, normalized relationships with foreign keys and ACID joins. Difficult to scale horizontally.</li>
        <li><strong>NoSQL (MongoDB):</strong> Flexible JSON-like documents, dynamic fields, horizontal scaling via sharding, optimized for fast hierarchical reads.</li>
    </ul>

    <h3>2. What is MongoDB?</h3>
    <ul>
        <li><strong>Explanation:</strong> A leading open-source NoSQL document database that stores structured and semi-structured data in Binary JSON (BSON) format.</li>
    </ul>

    <h3>3. What is BSON?</h3>
    <ul>
        <li><strong>Explanation:</strong> Binary JSON—a binary serialization format that extends JSON to support additional data types like <code>ObjectId</code>, <code>Date</code>, and binary data.</li>
    </ul>

    <h3>4. What is a Collection?</h3>
    <ul>
        <li><strong>Explanation:</strong> A group of related MongoDB documents (analogous to a SQL table). In PriceRadar: <code>users</code>, <code>products</code>, <code>offers</code>, <code>alerts</code>.</li>
    </ul>

    <h3>5. What is an ObjectId?</h3>
    <ul>
        <li><strong>Explanation:</strong> A 12-byte unique primary key generated automatically by MongoDB: 4 bytes of Unix timestamp, 5 bytes of random machine/process value, and 3 bytes of incrementing counter.</li>
    </ul>

    <h3>6. What is a Mongoose Schema?</h3>
    <ul>
        <li><strong>Explanation:</strong> A document configuration defining allowed field names, data types, validation rules, default values, and virtual properties.</li>
    </ul>

    <h3>7. What is a Mongoose Model?</h3>
    <ul>
        <li><strong>Explanation:</strong> A compiled constructor wrapper around a schema that provides high-level query methods (e.g. <code>User.findOne()</code>, <code>Alert.create()</code>).</li>
    </ul>

    <h3>8. Mongoose ODM vs. Native MongoDB Driver</h3>
    <ul>
        <li><strong>Explanation:</strong> The native driver provides low-level raw access to MongoDB. Mongoose is an Object Data Modeling (ODM) layer providing schema validation, type casting, lifecycle hooks, and relationship population.</li>
    </ul>

    <h3>9. CRUD Operations Summary</h3>
    <ul>
        <li><strong>Create:</strong> <code>Model.create(doc)</code> or <code>new Model(doc).save()</code>.</li>
        <li><strong>Read:</strong> <code>Model.find(query)</code>, <code>Model.findOne(query)</code>, <code>Model.findById(id)</code>.</li>
        <li><strong>Update:</strong> <code>Model.updateOne(query, update)</code>, <code>Model.findByIdAndUpdate(id, update)</code>.</li>
        <li><strong>Delete:</strong> <code>Model.deleteOne(query)</code>, <code>Model.findByIdAndDelete(id)</code>.</li>
    </ul>

    <h3>10. <code>find()</code> vs. <code>findOne()</code> vs. <code>findById()</code></h3>
    <ul>
        <li><code>find()</code>: Returns an array of all matching documents (or empty array).</li>
        <li><code>findOne()</code>: Returns the first matching document (or <code>null</code>).</li>
        <li><code>findById()</code>: Convenience method searching by <code>_id: id</code> (or <code>null</code>).</li>
    </ul>

    <h3>11. <code>create()</code> vs. <code>save()</code></h3>
    <ul>
        <li><code>create()</code>: Static model method that creates and persists one or more documents in a single call.</li>
        <li><code>save()</code>: Instance method called on a new or existing document instance, triggering Mongoose validation and saving changes.</li>
    </ul>

    <h3>12. <code>updateOne()</code> vs. <code>findByIdAndUpdate()</code></h3>
    <ul>
        <li><code>updateOne()</code>: Updates a document matching a filter and returns an acknowledgment object (<code>{ modifiedCount: 1 }</code>).</li>
        <li><code>findByIdAndUpdate()</code>: Updates a document by ID and returns the document itself (when <code>{ new: true }</code> is passed).</li>
    </ul>

    <h3>13. <code>populate()</code> (Simulating SQL Joins)</h3>
    <ul>
        <li><strong>Explanation:</strong> Replaces an ObjectId reference with the actual populated document from another collection:
            <pre><code>// Replaces offerId with the complete Offer document
const watchlist = await WatchlistItem.find({ userId }).populate('offerId');</code></pre>
        </li>
    </ul>

    <h3>14. Normalization vs. Denormalization in PriceRadar</h3>
    <ul>
        <li><strong>Normalized:</strong> Canonical products and retailer offers are separated (one Product has multiple Offers) to avoid storing redundant product descriptions across Amazon, Flipkart, and eBay.</li>
        <li><strong>Denormalized:</strong> An offer document stores <code>lastFetchedAt</code> and <code>lastStatus</code> directly to allow fast dashboard rendering without joining <code>PriceObservation</code> records.</li>
    </ul>

    <h3>15. Database Indexes (Single Field & Compound)</h3>
    <ul>
        <li><strong>Explanation:</strong> Special data structures (B-trees) that store a small portion of the collection's data in an easy-to-traverse form. Without indexes, MongoDB must perform a collection scan (checking every document).</li>
    </ul>

    <h3>16. Compound Unique Indexes (Preventing Duplicates)</h3>
    <ul>
        <li><strong>Explanation:</strong> An index spanning multiple fields enforcing distinct combinations:
            <pre><code>// Prevents duplicate watch items for the same user and offer
watchlistItemSchema.index({ userId: 1, offerId: 1 }, { unique: true });</code></pre>
            If violated, MongoDB throws Error code <code>11000</code>.
        </li>
    </ul>

    <h3>17. TTL (Time To Live) Indexes in PriceRadar</h3>
    <ul>
        <li><strong>Explanation:</strong> In <code>models/OtpChallenge.js</code>, <code>expiresAt</code> has a TTL index:
            <pre><code>expiresAt: { type: Date, required: true, index: { expires: 0 } }</code></pre>
            MongoDB's background thread automatically removes documents once the current clock time passes <code>expiresAt</code>.
        </li>
    </ul>

    <h3>18. Schema Validation & <code>Number.isInteger</code> Policy</h3>
    <ul>
        <li><strong>PriceRadar Example:</strong> Custom validator in <code>Offer.js</code>:
            <pre><code>priceInPaise: {
  type: Number,
  required: true,
  validate: { validator: Number.isInteger, message: 'Must be integer paise' }
}</code></pre>
        </li>
    </ul>

    <h3>19. Schema Timestamps (<code>{ timestamps: true }</code>)</h3>
    <ul>
        <li><strong>Explanation:</strong> Instructs Mongoose to automatically create and manage <code>createdAt</code> and <code>updatedAt</code> Date fields on every save.</li>
    </ul>

    <h3>20. Sorting Query Results</h3>
    <ul>
        <li><strong>Explanation:</strong> Sorting by date ascending (<code>1</code>) or descending (<code>-1</code>):
            <pre><code>PriceObservation.find({ offerId }).sort({ fetchedAt: -1 }).limit(30);</code></pre>
        </li>
    </ul>

    <h3>21. Comparison Query Operators</h3>
    <ul>
        <li><code>$gt</code> (greater than), <code>$gte</code> (greater than or equal), <code>$lt</code> (less than), <code>$lte</code> (less than or equal), <code>$ne</code> (not equal), <code>$in</code> (in array).</li>
    </ul>

    <h3>22. Logical Query Operators (<code>$or</code>, <code>$and</code>)</h3>
    <ul>
        <li><strong>PriceRadar Example (Distributed Lock Acquisition):</strong>
            <pre><code>MonitorLock.findOneAndUpdate({
  _id: 'monitoring_cycle_lock',
  $or: [{ isLocked: false }, { heartbeatAt: { $lt: staleCutoff } }]
}, ...);</code></pre>
        </li>
    </ul>

    <h3>23. Field Projection & <code>select: false</code></h3>
    <ul>
        <li><strong>Explanation:</strong> In <code>User.js</code>, <code>passwordHash: { type: String, select: false }</code> strips password hashes from standard queries, protecting credentials from accidental leakage.</li>
    </ul>

    <h3>24. Atomic Operations with <code>findOneAndUpdate()</code></h3>
    <ul>
        <li><strong>Explanation:</strong> Executes find, modify, and write as an atomic, indivisible operation at the database level. Prevents race conditions where two threads read the same state simultaneously.</li>
    </ul>

    <h3>25. Upsert Operations (<code>{ upsert: true }</code>)</h3>
    <ul>
        <li><strong>Explanation:</strong> Instructs MongoDB to update the document if it exists, or insert a new document if no match is found.</li>
    </ul>

    <h3>26. Connection Pooling & <code>readyState</code></h3>
    <ul>
        <li><strong>Explanation:</strong> Mongoose maintains an internal pool of reusable database connections. <code>mongoose.connection.readyState</code> reflects status: <code>0 = disconnected</code>, <code>1 = connected</code>, <code>2 = connecting</code>, <code>3 = disconnecting</code>.</li>
    </ul>

    <h3>27. MongoDB Atlas Network Security</h3>
    <ul>
        <li><strong>Explanation:</strong> Atlas enforces an IP Access List (firewall). Production hosting environments (Render) require outbound IP ranges or <code>0.0.0.0/0</code> with strong authentication to access the database.</li>
    </ul>

    <h3>28. Regular Expression Searches</h3>
    <ul>
        <li><strong>Explanation:</strong> Case-insensitive title searching: <code>Product.find({ title: { $regex: q, $options: 'i' } })</code>.</li>
    </ul>

    <h3>29. Aggregation Pipelines</h3>
    <ul>
        <li><strong>Explanation:</strong> Multi-stage data processing pipeline (<code>$match</code>, <code>$group</code>, <code>$project</code>, <code>$sort</code>). Used in PriceRadar's diagnostic utilities to compute cycle statistics.</li>
    </ul>

    <h3>30. Mongoose Schema Middleware (Hooks)</h3>
    <ul>
        <li><strong>Explanation:</strong> Functions executed automatically before or after schema operations (e.g. <code>pre('save')</code>, <code>post('remove')</code>) used for automated validation or cascade deletions.</li>
    </ul>
</div>
"""
