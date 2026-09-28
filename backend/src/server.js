require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[Feedants API] Server running on http://localhost:${PORT}`);
    console.log(`[Feedants API] Healthcheck: http://localhost:${PORT}/health`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
