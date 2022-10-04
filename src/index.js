const express = require('express');

require('./db/mongoose');

const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT;

app.use(express.json());

app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});

// const Task = require('./models/task');
// const User = require('./models/user');

// const main = async () => {
//     // const task = await Task.findById('6339b24e4f0b240bddb5c71e');
//     // await task.populate('owner');
//     // console.log(task.owner);

//     const user = await User.findById('6339b2434f0b240bddb5c712');
//     await user.populate('tasks');
//     console.log(user.tasks);
// }

// main();
