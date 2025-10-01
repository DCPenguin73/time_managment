const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/tasks', require('./routes/tasks'));

app.listen(process.env.PORT || 3000, () => console.log('Server running'));
