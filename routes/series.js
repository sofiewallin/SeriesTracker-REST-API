/**
 * Routes for series.
 * 
 * 1. Set routes
 * 2. Export router
 * 
 * @author: Sofie Wallin
 */

// Express router
const router = require('express').Router();

// Models
const Series = require('../models/Series');

// Middleware
const getSeries = require('../middleware/getSeries');
const getEpisode = require('../middleware/getEpisode');
let getSeriesAndEpisode = [getSeries, getEpisode];

/* 1. Set routes */

// Get all series
router.get('/', async (req, res) => {
    try {
        // Find all series
        const series = await Series.find();

        // Send all series
        res.json(series);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Search all series
router.get('/search/:query', async (req, res) => {
    try {
        // Find series that has the query string (not case sensitive) somwhere in the name
        const series = await Series.find({ name: new RegExp(req.params.query, 'i') });

        // Send series
        res.json(series);
    } catch (err) {
        // Send error
        res.status(500).json({ message: err.message });
    }
});

// Get one series
router.get('/:id', getSeries, (req, res) => {

    // Send series
    res.json(res.series);
});

// Create one series
router.post('/', async (req, res) => {
    // Create new series
    const series = new Series({
        name: req.body.name,
        plot: req.body.plot,
        airingStatus: req.body.airingStatus,
        episodes: req.body.episodes 
    });

    try {
        // Save new series
        const newSeries = await series.save();

        // Send new series
        res.status(201).json(newSeries);
    } catch (err) {
        // Send error
        res.status(400).json({ message: err.message });
    }
});

// Update one series
router.put('/:id', getSeries, async (req, res) => {
    // Update series
    res.series.name = req.body.name;
    res.series.plot = req.body.plot;
    res.series.airingStatus = req.body.airingStatus;
    res.series.episodes = req.body.episodes;

    try {
        // Save updated series
        const updatedSeries = await res.series.save();

        // Send updated series
        res.json(updatedSeries);
    } catch (err) {
        // Send error
        res.status(400).json({ message: err.message });
    }
});

// Update one episode
router.put('/:id/:episode_id', getSeriesAndEpisode, async (req, res) => {
    // Update episode
    res.episode.seasonNumber = req.body.seasonNumber;
    res.episode.episodeNumber = req.body.episodeNumber;
    res.episode.name = req.body.name;
    res.episode.originalAirDate = req.body.originalAirDate;

    try {
        // Save updated series
        const updatedSeries = await res.series.save();

        // Send updated series
        res.json(updatedSeries);
    } catch (err) {
        // Send error
        res.status(400).json({ message: err.message });
    }
});

// Delete one series
router.delete('/:id', getSeries, async (req, res) => {
    try {
        // Remove series
        const deletedSeries = await res.series.remove();

        // Send removed series
        res.json(deletedSeries);
    } catch (err) {
        // Send error
        res.status(500).json({ message: err.message });
    }
});

// Delete one episode
router.delete('/:id/:episode_id', getSeriesAndEpisode, async (req, res) => {
    // Remove episode from episodes array in series
    res.series.episodes.pull(res.episode);

    try {
        // Save updated series
        const updatedSeries = await res.series.save();

        // Send updated series
        res.json(updatedSeries);
    } catch (err) {
        // Send error
        res.status(500).json({ message: err.message });
    }
});

/* 2. Export router */

module.exports = router;
