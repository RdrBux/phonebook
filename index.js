const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

let data = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
];

const app = express();
app.use(cors());
app.use(express.json());
// Logger
morgan.token('data', (req) => JSON.stringify(req.body));
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :data')
);

// Rouyes
app.get('/persons', (req, res) => {
  res.json(data);
});

app.get('/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const personData = data.find((person) => person.id === id);

  if (!personData) {
    res.status(404).send('Sorry, person not found.');
  }
  res.json(personData);
});

app.delete('/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  data = data.filter((person) => person.id !== id);
  res.status(204).end();
});

app.post('/persons', (req, res) => {
  const person = req.body;

  if (!person.name || !person.number) {
    return res.status(400).send('Content missing');
  }

  if (data.some((pers) => pers.name === person.name)) {
    return res.status(400).send('A person already exists with that name');
  }

  const id = Math.ceil(Math.random() * 1000000);
  person.id = id;
  data.push(person);

  res.json(person);
});

app.get('/info', (req, res) => {
  res.send(
    `<p>Phonebook has info for ${data.length} people</p><p>${new Date()}</p>`
  );
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
