const mongoose = require('mongoose');
const { isEmail } = require('validator');

mongoose.connect(process.env.MONGODB_URL);

// const me = new User({ name: 'Stefan', email: 'abc@ABC.pl', age: 5, password: 'pas$word' });
// me.save().then(console.log).catch(console.log);

// const task = new Task({ description: '  aaaa' });
// task.save().then(console.log);
