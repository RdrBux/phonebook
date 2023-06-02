require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');

const Person = require('./models/person');

mongoose.set('strictQuery', false);
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
  });

const app = express();
app.use(cors());
app.use(express.static('build'));
app.use(express.json());
// Logger
morgan.token('data', (req) => JSON.stringify(req.body));
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :data')
);

// Routes
app.get('/persons', async (req, res) => {
  const people = await Person.find().exec();

  res.json(people);
});

app.get('/persons/:id', async (req, res, next) => {
  try {
    const personData = await Person.findById(req.params.id).exec();

    if (!personData) {
      res.status(404).send('Sorry, person not found.');
    }
    res.json(personData);
  } catch (err) {
    next(err);
  }
});

app.delete('/persons/:id', async (req, res, next) => {
  try {
    await Person.findByIdAndRemove(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

app.post('/persons', async (req, res, next) => {
  try {
    const person = req.body;

    if (!person.name || !person.number) {
      return res.status(400).send('Content missing');
    }

    const people = await Person.find().exec();

    if (people.some((pers) => pers.name === person.name)) {
      return res.status(400).send('A person already exists with that name');
    }

    const newPerson = new Person(person);
    await newPerson.save();

    res.json(newPerson);
  } catch (err) {
    next(err);
  }
});

app.put('/persons/:id', async (req, res, next) => {
  try {
    const person = req.body;
    const updateNote = await Person.findByIdAndUpdate(req.params.id, person, {
      new: true,
      runValidators: true,
      context: 'query',
    });
    res.json(updateNote);
  } catch (err) {
    next(err);
  }
});

app.get('/info', async (req, res, next) => {
  try {
    const people = await Person.find().exec();
    res.send(
      `<p>Phonebook has info for ${
        people.length
      } people</p><p>${new Date()}</p>`
    );
  } catch (err) {
    next(err);
  }
});

const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  }
  if (error.name === 'ValidationError') {
    return res.status(400).send({ error: error.message });
  }

  res.status(404).send('unknown error');
  next(error);
};

// this has to be the last loaded middleware.
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
