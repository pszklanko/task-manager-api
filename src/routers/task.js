const express = require('express');
const router = new express.Router();

const auth = require('../middleware/auth');
const Task = require('../models/task');


router.get('/tasks', auth, async (req, res) => {
    try {
        // const tasks = await Task.find({ owner: req.user._id});
        // res.send(tasks);

        const match = {};
        const sort = {};
        const { completed, limit, skip, sortBy } = req.query;

        if (completed) {
            match.completed = completed === 'true';
        }

        if (sortBy) {
            const [field, order] = sortBy.split('_');

            sort[field] = order === 'desc' ? -1 : 1;
        }
        
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(limit),
                skip: parseInt(skip),
                sort
            }
        });
        res.send(req.user.tasks);
    } catch (e) {
        res.status(500).send(e);
        
    }
});

router.post('/tasks', auth, async (req, res) => {
    try {
        const task = new Task({
            ...req.body,
            owner: req.user._id
        });
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);
        
    }
});

router.get('/tasks/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findOne({ _id: id, owner: req.user._id });

        if (task) {
            res.send(task);
        } else {
            res.status(404).send();      
        }
    } catch (e) {
        res.status(500).send(e);
    }
});

router.patch('/tasks/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = Object.keys(req.body);
        const allowedToUpdate = ['descrition', 'completed'];
        const isAllowedToUpdate = updates.every(update => allowedToUpdate.includes(update));

        if (!isAllowedToUpdate) {
            return res.status(400).send({ error: 'Invalid property!' });
        }

        // to trigger pre hooks
        const task = await Task.findOne({ _id: id, owner: req.user._id });

        // const task = await Task.findByIdAndUpdate(id, req.body, {
        //     new: true,
        //     runValidators: true,
        // });
        if (task) {
            updates.forEach(update => {
                task[update] = req.body[update];
            });
    
            await task.save();

            res.send(task);
        } else {
            res.status(404).send();
        }
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const task = await Task.findOneAndDelete({ _id: id, owner: req.user._id });
        if (task) {
            res.send(task);
        } else {
            res.status(404).send();
        }
    } catch (error) {
        res.status(500).send(error);
    }
})

module.exports = router;