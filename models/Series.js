/**
 * Series model.
 * 
 * 1. Set series schema
 * 2. Set middleware to delete all references to series when deleted
 * 3. Export series model
 * 
 * @author: Sofie Wallin
 */

// Mongoose
const mongoose = require('mongoose');

// Models
const Episode = require('./Episode');
const User = require('./User');

/**
 * 1. Set series schema
 */

const seriesSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A series name is required.'],
            maxlength: [250, 'The series name can have a maximum of 250 characters.'],
        },
        plot: { 
            type: String,
            maxlength: [500, 'The series plot can have a maximum of 500 characters.'],
        },
        airingStatus: {
            type: String,
            required: [true, 'An airing status is required.'],
            enum: {
                values: ['Airing', 'Upcoming', 'Ended'],
                message: 'The airing status can be either: Airing, Upcoming or Ended.'
            }
        },
        episodes: [Episode.schema]
    },
    { timestamps: true }
);

/**
 * 2. Set middleware to delete all references to series when deleted
 */

seriesSchema.pre('remove', async function(next) {
    try {
        // Remove series on all users that has the _id of deleted series as series_id
        await User.updateMany({}, { $pull: { series: { series_id: this._id } } });
        next();
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * 3. Export series model
 */

module.exports = mongoose.model('Series', seriesSchema);
