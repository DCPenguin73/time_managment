const express = require('express');
const router = express.Router();
const db = require('../firebase');

// GET all tasks
router.get('/', async (req, res) => {
  const snapshot = await db.collection('tasks').get();
  const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(tasks);
});

// POST new task
router.post('/', async (req, res) => {
  const { title, color } = req.body;
  const docRef = await db.collection('tasks').add({ title, color, completed: false });
  res.json({ id: docRef.id });
});

module.exports = router;
