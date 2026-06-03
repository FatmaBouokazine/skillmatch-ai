const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');

const app = express();

app.use(cors());

app.use(express.json());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

module.exports = app;