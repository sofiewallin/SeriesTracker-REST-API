const mongoose = require('mongoose');

/**
 * Defines a mongoose schema for a episode. 
 * Defines a mongoose schema for a series. 
 * Creates a mongoose model for a series and exports it.
 * 
 * @author: Sofie Wallin
 */

// Episode schema
const episodeSchema = new mongoose.Schema(
    {
        seasonNumber: {
            type: Number,
            required: [true, 'A season number is required.'],
            min: [1, 'The season number cant be less than 1.']
        },   
        episodeNumber: {
            type: Number,
            required: [true, 'An episode number is required.'],
            min: [1, 'The episode number cant be less than 1.']
        },
        name: {
            type: String,
            required: [true, 'An episode name is required.'],
            maxlength: [250, 'The episode name can be a maximum of 250 characters.']
        },
        originalAirDate: { type: Date }
    },
    { timestamps: true }
);

// Episode model
module.exports = mongoose.model('Episode', episodeSchema);
