const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
  },
  number: {
    type: String,
    required: true,
    validate: {
      validator: (s) => /\d{2,3}-\d{5,}$/.test(s),
      message: (props) => `${props.value} is not a valid phone number`,
    },
  },
});

module.exports = mongoose.model('Person', personSchema);
