/**
 * Routes for series.
 * 
 * 1. Set create routes
 * 2. Set read routes
 * 3. Set update routes
 * 4. Set delete routes
 * 5. Export router
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

/* 1. Set create routes */

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
        res.status(400).json({ message: err.message });
    }
});

// Create one episode
router.post('/:id', getSeries, async (req, res) => {
    const seasonNumber = req.body.seasonNumber;
    const episodeNumber = req.body.episodeNumber;

    const episodes = res.series.episodes;

    // Check if episode already exists
    if (episodes.length !== 0) {
        for (let i = 0; i < episodes.length; i++) {
            const episode = episodes[i];
            if (seasonNumber === episode.seasonNumber && episodeNumber === episode.episodeNumber) {
                return res.status(400).json({ message: `The episode s${seasonNumber}e${episodeNumber} already exists.` });
            }
        }
    }

    // Create new episode
    let newEpisode = {
        seasonNumber: seasonNumber,
        episodeNumber: episodeNumber,
        name: req.body.name,
        originalAirDate: req.body.originalAirDate
    }

    // Push new episode to series
    episodes.push(newEpisode);

    // Sort episodes ascending
    episodes.sort((a, b) => {
        if (a.seasonNumber === b.seasonNumber){
          return a.episodeNumber < b.episodeNumber ? -1 : 1
        } else {
          return a.seasonNumber < b.seasonNumber ? -1 : 1
        }
    });

    try {
        // Save updated series
        await res.series.save();

        for (let i = 0; i < episodes.length; i++) {
            if (episodes[i].seasonNumber === seasonNumber && episodes[i].episodeNumber === episodeNumber) {
                newEpisode = episodes[i];
            }
        }

        // Send new episode
        res.json(newEpisode);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/* 2. Set read routes */

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

// Search all series by name
router.get('/search/:query', async (req, res) => {
    try {
        // Find series that has the query string somewhere in the name
        const series = await Series.find({ name: new RegExp(req.params.query, 'i') });

        // Send found series
        res.json(series);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get one series with episodes divided by seasons
router.get('/:id', getSeries, async (req, res) => {
    const series = res.series;

    const name = series.name;
    let plot = '';
    if (series.plot !== null) plot = series.plot;
    const airingStatus = series.airingStatus;

    // Create a season array from the episodes
    let seasons = [];
    let episodes = series.episodes;

    if (episodes.length !== 0) {
        for (let i = 0; i < episodes.length; i++) {
            // Get episode season number
            const episode = episodes[i];
            const seasonNumber = episode.seasonNumber;
            
            // Push a new season object into seasons array
            seasons.push({ 
                number: seasonNumber,
                episodes: [episode] 
            });
        }
    }

    // Merge seasons with the same season number
    let mergedSeasons = [];

    seasons.forEach(season => {
        let existing = mergedSeasons.filter(v => {
            return v.number == season.number;
        });

        if (existing.length) {
            let existingIndex = mergedSeasons.indexOf(existing[0]);
            mergedSeasons[existingIndex].episodes = mergedSeasons[existingIndex].episodes.concat(season.episodes);
        } else {
            // Push season into the merged seasons array
            mergedSeasons.push(season);
        }
    });

    seasons = mergedSeasons;

    // Construct a new series object with seasons
    const newSeriesObj = {
        name: name,
        plot: plot,
        airingStatus: airingStatus,
        seasons: seasons
    };

    // Send series
    res.json(newSeriesObj);
});

/* 3. Set update routes */

// Update one series
router.put('/:id', getSeries, async (req, res) => {
    const series = res.series;

    // Update series
    series.name = req.body.name;
    series.plot = req.body.plot;
    series.airingStatus = req.body.airingStatus;
    series.episodes = req.body.episodes;

    try {
        // Save updated series
        const updatedSeries = await series.save();

        // Send updated series
        res.json(updatedSeries);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update one episode
router.put('/:id/episode/:episode_id', getSeriesAndEpisode, async (req, res) => {
    const episode = res.episode;

    // Update episode
    episode.seasonNumber = req.body.seasonNumber;
    episode.episodeNumber = req.body.episodeNumber;
    episode.name = req.body.name;
    episode.originalAirDate = req.body.originalAirDate;

    try {
        // Save updated series
        await res.series.save();

        // Send updated series
        res.json(episode);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/* 4. Set delete routes */

// Delete one series
router.delete('/:id', getSeries, async (req, res) => {
    try {
        // Remove series
        const deletedSeries = await res.series.remove();

        // Send removed series
        res.json(deletedSeries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete one episode
router.delete('/:id/episode/:episode_id', getSeriesAndEpisode, async (req, res) => {
    const episode = res.episode;

    // Remove episode from episodes array in series
    res.series.episodes.pull(episode);

    try {
        // Save updated series
        await res.series.save();

        // Send updated series
        res.json(episode);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* 5. Export router */

module.exports = router;
