// main.js

console.log("🔧 Starting app.js...");
require('./app'); // your Express app

console.log("🛠️  Starting otherScript.js...");
require('./services/unifiedConsumer'); // your custom background logic

console.log("✅ All services started.");
