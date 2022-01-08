/**
 * User model.
 * 
 * 1. Set user series schema
 * 2. Set user schema
 * 3. Export user model
 * 
 * @author: Sofie Wallin
 */

// Mongoose
const mongoose = require('mongoose');

// Models
const Series = require('./Series');
const Episode = require('./Episode');

/**
 * 1. Set user series schema
 */

const userSeriesSchema = new mongoose.Schema(
    {
        series_id: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: Series,
            required: [true, 'A series id is required.'],
        },
        watchingStatus: {
            type: String,
            required: [true, 'A watching status is required.'],
            enum: {
                values: ['Watching now', 'Watch next', 'Have watched'],
                message: 'The watching status can be either: Watching now, Watch next or Have watched.'
            }
        },
        watchedEpisodes: [{ type: String }],
        nextEpisode: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: Episode
        }
    },
    { timestamps: { createdAt: 'addedAt' } }
);

/**
 * 2. Set user schema
 */

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'A username is required.'],
            minlength: [6, 'The username must have at least 6 characters.'],
            maxlength: [250, 'The username can have a maximum of 250 characters.']
        },
        password: {
            type: String,
            required: [true, 'A password is required.'],
            minlength: [8, 'The password must have at least 8 characters.'],
            maxlength: [1024, 'The password can have a maximum of 1024 characters.']
        },
        series: [userSeriesSchema]
    },
    { timestamps: true }
);

/**
 * 3. Export user model
 */

module.exports = mongoose.model('User', userSchema);
