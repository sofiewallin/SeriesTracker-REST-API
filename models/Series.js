const mongoose = require('mongoose');
const Episode = require('./Episode');

/**
 * Defines a mongoose schema for a series. 
 * Creates a mongoose model for a series and exports it.
 * 
 * @author: Sofie Wallin
 */

// Series schema
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

// Series model
module.exports = mongoose.model('Series', seriesSchema);
