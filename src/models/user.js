const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Task = require('./task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate: (value) => {
            if (!isEmail(value)) {
                throw new Error('Email is invalid');
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive value');
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 7,
        validate: (value) => {
            if(value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"');
            }
        }
    },
    avatar: {
        type: Buffer
    },
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
}, {
    timestamps: true
});

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (user) {
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            return user;
        } else {
            throw Error('Unable to login');
        }
    } else {
        throw new Error('Unable to login');
    }
}

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
    user.tokens = [ ...user.tokens, { token } ];
    await user.save();

    return token;
}

// userSchema.methods.getPublicProfile = function () {
//     const user = this;

//     return {
//         email: user.email,
//         name: user.name,
//         age: user.age,
//         token: user.token
//     }
// }

userSchema.methods.toJSON = function () {
    const { email, name, age, createdAt, updatedAt } = this;

    return {
        email,
        name,
        age,
        createdAt,
        updatedAt
    }
}

userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
});

userSchema.pre('remove', async function (next) {
    const user = this;

    await Task.deleteMany({ owner: user._id });

    next();
})

// userSchema.pre('findOneAndUpdate', async function(next) {
//     const user = await this.model.findOne(this.getQuery());
//     console.log('find and save');
//     try {
//         if (user.isModified('password')) {
//             user.password = await bcrypt.hash(user.password, 8);
//         } 
//     } catch (error) {
//         console.log(error);
//     }
    
//     next();
// })

const User = mongoose.model('User', userSchema);

module.exports = User;