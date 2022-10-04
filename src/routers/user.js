const express = require('express');
const multer = require('multer');
const sharp = require('sharp');

const User = require('../models/user');
const auth = require('../middleware/auth');

const router = new express.Router();

const upload = multer({
    // dest: 'avatars',
    limits: {
        fileSize: 1000000,  
    },
    fileFilter(req, { originalname }, cb) {
        if (originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(undefined, true);
        } else {
            cb(new Error('File must be a .JPG, .JPEG or .PNG'));
        }
    }
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if(user?.avatar) {
            res.set('Content-Type', 'image/png');
            res.send(user.avatar);
        } else {
            throw new Error();
        }
    } catch (error) {
        res.status(404).send();
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize(250, 250).png().toBuffer()

    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
});

router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined;
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send(error);
    }
    
});

router.get('/users/me', auth, async (req, res) => {
    try {
        res.send(req.user);
    } catch (e) {
        res.status(500).send(e);
        
    }
});

router.post('/users', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        const token = await user.generateAuthToken();

        res.status(201).send({ user, token });
    } catch (e) {
        res.status(400).send(e);
        
    }
});

router.post('/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByCredentials(email, password); 
        const token = await user.generateAuthToken();
        
        // res.send({ user: user.getPublicProfile(), token });
        res.send({ user, token });
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        
        res.send();
    } catch (error) {
        res.status(500).send(error);
    }
});

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(({ token }) => token !== req.token);
        await req.user.save();
        
        res.send();
    } catch (error) {
        res.status(500).send(error);
    }
});

router.patch('/users/me', auth, async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedToUpdate = ['name', 'email', 'password', 'age'];
        const isAllowedToUpdate = updates.every(update => allowedToUpdate.includes(update));

        if (!isAllowedToUpdate) {
            return res.status(400).send({ error: 'Invalid property!' });
        }
        // to trigger pre hooks
        // const user = await User.findById(id);

        updates.forEach(update => {
            req.user[update] = req.body[update];
        });

        await req.user.save();
        // const user = await User.findByIdAndUpdate(id, req.body, {
        //     new: true,
        //     runValidators: true,
        // });
        // if (user) {
        res.send(req.user);
        // } else {
            // res.status(404).send();
        // }
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        const { _id } = req.user;

        await req.user.remove();

        res.send(req.user);
        // const user = await User.findByIdAndRemove(_id);
        // if (user) {
        //     res.send(user);
        // } else {
        //     res.status(404).send();
        // }
    } catch (error) {
        res.status(500).send(error);
    }
})

module.exports = router;