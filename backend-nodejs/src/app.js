const express = require('express');
const cors = require('cors');
const analysisRouter = require('./routes/analysis');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/voice', require('./routes/voice'));
app.use('/api/analysis', require('./routes/analysis'));
app.use('/api/saveToEhr', require('./routes/saveToEhr'));


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 