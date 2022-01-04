// Express
const express = require('express');
const router = express.Router();

// Models
const Series = require('../models/Series');

// Middleware
const getSeries = require('../middleware/getSeries');
const getEpisode = require('../middleware/getEpisode');
let getSeriesAndEpisode = [getSeries, getEpisode];

const authenticate = require('../middleware/authenticate');

/**
 * Sets API routes.
 * 
 * @author: Sofie Wallin
 */

// Get all series
router.get('/', async (req, res) => {
    try {
        const series = await Series.find();
        res.json(series);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Search all series by name
router.get('/search/:query', async (req, res) => {
    const escapedQuery = req.params.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&' );
    try {
        const series = await Series.find({ name: new RegExp(escapedQuery, 'i') });
        res.json(series);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get one series
router.get('/:id', getSeries, (req, res) => {
    res.json(res.series);
});

// Create one series
router.post('/', authenticate, async (req, res) => {
    const series = new Series({
        name: req.body.name,
        plot: req.body.plot,
        airingStatus: req.body.airingStatus,
        episodes: req.body.episodes 
    });

    try {
        const newSeries = await series.save();
        res.status(201).json(newSeries);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update one series
router.put('/:id', getSeries, async (req, res) => {
    res.series.name = req.body.name;
    res.series.plot = req.body.plot;
    res.series.airingStatus = req.body.airingStatus;
    res.series.episodes = req.body.episodes;

    try {
        const updatedSeries = await res.series.save();
        res.json(updatedSeries);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update one episode
router.put('/:id/:episode_id', getSeriesAndEpisode, async (req, res) => {
    res.episode.seasonNumber = req.body.seasonNumber;
    res.episode.episodeNumber = req.body.episodeNumber;
    res.episode.name = req.body.name;
    res.episode.originalAirDate = req.body.originalAirDate;

    try {
        const updatedSeries = await res.series.save();
        res.json(updatedSeries);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete one series
router.delete('/:id', getSeries, async (req, res) => {
    try {
        const deletedSeries = await res.series.remove();
        res.json(deletedSeries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete one episode
router.delete('/:id/:episode_id', getSeriesAndEpisode, async (req, res) => {
    res.series.episodes.pull(res.episode);

    try {
        const updatedSeries = await res.series.save();
        res.json(updatedSeries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* Exports router */

module.exports = router;
