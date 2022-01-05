/**
 * Episode model.
 * 
 * 1. Set episode schema
 * 2. Export episode model
 * 
 * @author: Sofie Wallin
 */

// Mongoose
const mongoose = require('mongoose');

/* 1. Set episode schema */

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

/* 2. Export episode model */

module.exports = mongoose.model('Episode', episodeSchema);
