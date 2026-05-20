require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

connectDB().then(() => {
  const seedData = require('./config/seeder');
  seedData();
});

const app = express();
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', process.env.FRONTEND_URL];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) callback(null, true);
    else callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.get('/', (req, res) => res.send('StudyNook API is running...'));

app.use('/api/auth', require('./routes/auth'));

app.use((req, res) => res.status(404).json({ message: 'API Route Not Found' }));
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));