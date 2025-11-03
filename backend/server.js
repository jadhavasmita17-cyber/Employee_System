const express = require('express');
const fs = require('fs').promises;
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const DATA_FILE = './employees.json';

app.use(cors());
app.use(bodyParser.json());

// Utility function to read/write file
async function readData() {
  const data = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(data || '[]');
}

async function writeData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

// Get all employees
app.get('/employees', async (req, res) => {
  const data = await readData();
  res.json(data);
});

// Add employee
app.post('/employees', async (req, res) => {
  const { id, name, dept, email, salary } = req.body;
  if (!id || !name || !dept || !email || !salary)
    return res.status(400).json({ message: 'All fields required!' });

  const data = await readData();
  if (data.find(e => e.id == id))
    return res.status(400).json({ message: 'Duplicate ID!' });

  data.push({ id, name, dept, email, salary });
  await writeData(data);
  res.json({ message: 'Employee added!' });
});

// Update employee
app.put('/employees/:id', async (req, res) => {
  const id = req.params.id;
  const data = await readData();
  const index = data.findIndex(e => e.id == id);
  if (index === -1)
    return res.status(404).json({ message: 'Not found!' });

  data[index] = { ...data[index], ...req.body };
  await writeData(data);
  res.json({ message: 'Employee updated!' });
});

// Delete employee
app.delete('/employees/:id', async (req, res) => {
  const id = req.params.id;
  const data = await readData();
  const newData = data.filter(e => e.id != id);
  await writeData(newData);
  res.json({ message: 'Employee deleted!' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
