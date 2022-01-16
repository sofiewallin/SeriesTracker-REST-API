/**
 * Routes for users.
 * 
 * 1. Set read routes
 * 2. Set update routes
 * 3. Export router
 * 
 * @author: Sofie Wallin
 */

// Express router
const router = require('express').Router();

// Models
const User = require('../models/User');
const Series = require('../models/Series');

// Middleware
const authorizeUser = require('../middleware/authorizeUser')
const getUser = require('../middleware/getUser');
const getUserSeries = require('../middleware/getUserSeries');
let authorizeAndGetUser = [authorizeUser, getUser];
let authorizeAndGetUserAndSeries = [authorizeUser, getUser, getUserSeries];

/**
 * 1. Set read routes
 */

/* 1.1 Get series list */

router.get('/:id/series', authorizeAndGetUser, async (req, res) => {
        const user = res.user;
        const userSeriesList = user.series;


        // Send all series
        res.json(userSeriesList);

});

/* 1.2 Get one series */

router.get('/:id/series/:series_id', authorizeAndGetUserAndSeries, async (req, res) => {
    const userSeries = res.series;

    // Send series
    res.send(userSeries);
});

/**
 * 2. Set update routes
 */

/* 2.1 Add one series to series list */

router.patch('/:id/add-series', authorizeAndGetUser, async (req, res) => {
    const user = res.user;
    const userSeriesList = user.series;

    // Check if there is a series with the given id
    let series;
    const seriesId = req.body.series_id;

    try {
        // Get series from database by id
        series = await Series.findById(seriesId);

        // Check if there is a match on the id in the database
        if (series == null) return res.status(404).json({ message: `There is no series with id: ${seriesId}.` });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    // Check if user has already added the series
    const matchingSeries = userSeriesList.filter((userSeries) => userSeries.series_id.toString() === seriesId);
    if (matchingSeries.length > 0) { 
        return res.status(400).json({ message: `The series with id ${seriesId} has already been added.` });
    }

    // Set next episode to the first episode if the series has episodes
    let nextEpisode = null;
    
    const episodes = series.episodes;
    if (episodes.length !== 0) {
        nextEpisode = episodes[0];
    }

    // Create a new series for user
    let newUserSeries = {
        series_id: seriesId,
        watchingStatus: req.body.watchingStatus,
        watchedEpisodes: [],
        nextEpisode: nextEpisode
    };

    // Push the series to user
    userSeriesList.push(newUserSeries);

    try {
        // Save updated user
        await user.save();

        // Send updated user series
        res.json(userSeriesList);
    } catch (err) {
        // Send error
        res.status(400).json({ message: err.message });
    }
});

/* 2.2 Remove one series from series list */

router.patch('/:id/remove-series/:series_id', authorizeAndGetUserAndSeries, async (req, res) => {
    const user = res.user;
    const userSeriesList = user.series;
    const userSeries = res.series;

    // Remove series from users series list
    userSeriesList.pull(userSeries);

    try {
        // Save updated user
        await user.save();

        // Send removed series
        res.json(userSeriesList);
    } catch (err) {
        // Send error
        res.status(500).json({ message: err.message });
    }
});

/* 2.3 Add episode to "watched episodes" and set next episode for one series */

router.put('/:id/series/:series_id/watch-episode/:episode_id', authorizeAndGetUserAndSeries, async (req, res) => {
    const userSeries = res.series;

    // Check if there is a series in the database with the given id
    let series;
    const seriesId = userSeries.series_id;

    try {
        // Get series from database by id
        series = await Series.findById(seriesId);

        // Check if there is a match on the id in the database
        if (series == null) return res.status(404).json({ message: `There is no series with id: ${seriesId}.` });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    // Check if there is an episode in the database with the given id
    let episode;
    const episodeId = req.params.episode_id;
    const episodes = series.episodes;

    try {
        // Get episode by id
        episode = await episodes.id(episodeId);

        // Send error if there is no episode matching the id
        if (episode == null) return res.status(404).json({ message: `There is no episode with id: ${episodeId}.` });
    } catch (err) {
        // Send error
        return res.status(500).json({ message: err.message });
    }

    // Check if the episode has already been added to watched episodes
    const watchedEpisodes = userSeries.watchedEpisodes;

    const matchingEpisode = watchedEpisodes.filter((episode) => episode === episodeId);
    if (matchingEpisode.length > 0) { 
        return res.status(400).json({ message: `The episode id ${episodeId} has already been added to watched episodes.` });
    }

    // Add episode to watched episodes
    watchedEpisodes.push(episodeId);

    // Set next episode
    let nextEpisode = null;

    const episodeIdStrings = episodes.map(episode => episode._id.toString());

    const nextEpisodeList = episodeIdStrings.filter(episodeIdString => !watchedEpisodes.includes(episodeIdString));
    if (nextEpisodeList.length > 0) nextEpisode = nextEpisodeList[0];
     
    userSeries.nextEpisode = nextEpisode;

    try {
        // Save updated user
        await userSeries.save();

        // Send added episode id
        res.json(userSeries);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/* 2.4 Remove episode from "watched episodes" and set next episode for one series */

router.put('/:id/series/:series_id/unwatch-episode/:episode_id', authorizeAndGetUserAndSeries, async (req, res) => {
    const userSeries = res.series;

    // Check if there is a series in the database with the given id
    let series;
    const seriesId = userSeries.series_id;

    try {
        // Get series from database by id
        series = await Series.findById(seriesId);

        // Check if there is a match on the id in the database
        if (series == null) return res.status(404).json({ message: `There is no series with id: ${seriesId}.` });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    // Check if there is an episode in the database with the given id
    let episode;
    let episodeId = req.params.episode_id;
    const episodes = series.episodes;

    try {
        // Get episode by id
        episode = await episodes.id(episodeId);

        // Send error if there is no episode matching the id
        if (episode == null) return res.status(404).json({ message: `There is no episode with id: ${episodeId}.` });
    } catch (err) {
        // Send error
        return res.status(500).json({ message: err.message });
    }

    // Check if there is a match for the episode in watched episodes and remove it
    const watchedEpisodes = userSeries.watchedEpisodes;

    const matchingEpisode = watchedEpisodes.filter((episode) => episode === episodeId);
    if (matchingEpisode.length > 0) { 
        watchedEpisodes.pull(episodeId);
    } else {
        return res.status(400).json({ message: `The episode id ${episodeId} doesn't exist in watched episodes.` });
    }

    // Set next episode
    if (watchedEpisodes.length > 0) {
        const episodeIdStrings = episodes.map(episode => episode._id.toString());

        const nextEpisodeList = episodeIdStrings.filter(episodeIdString => !watchedEpisodes.includes(episodeIdString));
        const nextEpisode = nextEpisodeList[0];
        
        userSeries.nextEpisode = nextEpisode;
    } else {
        userSeries.nextEpisode = episodes[0];
    }

    try {
        // Save updated user
        await userSeries.save();

        // Send removed episode id
        res.json(userSeries);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/* 2.5 Clear watch history and set next episode to first episode of one series */
router.patch('/:id/series/:series_id/clear-watch-history', authorizeAndGetUserAndSeries, async (req, res) => {
    const userSeries = res.series;

    // Clear watch history
    userSeries.watchedEpisodes = [];

    // Get series from database
    let series;
    const seriesId = userSeries.series_id;

    try {
        // Get series from database by id
        series = await Series.findById(seriesId);

        // Check if there is a match on the id in the database
        if (series == null) return res.status(404).json({ message: `There is no series with id: ${seriesId}.` });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    // Set next episode
    const episodes = series.episodes;

    let nextEpisode = null;
    if (episodes.length > 0) nextEpisode = episodes[0];
    
    userSeries.nextEpisode = nextEpisode;

    try {
        // Save updated user
        await userSeries.save();

        // Send updated series
        res.json(userSeries);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/* 2.6 Change watching status of one series */

router.patch('/:id/series/:series_id/change-watching-status/:status', authorizeAndGetUserAndSeries, async (req, res) => {
    const userSeries = res.series;

    let watchingStatus = req.params.status;

    // Turn the watching status parameter into a string for update
    switch (watchingStatus) {
        case 'watching-now':
            watchingStatus = "Watching now";
            break;
        case 'watch-next':
            watchingStatus = "Watch next";
            break;
        case 'have-watched':
            watchingStatus = "Have watched";
            break;
        default:
            return res.status(400).json({ message: `${watchingStatus} is not a valid watching status` });
    }

    // Set series watching status to chosen status
    userSeries.watchingStatus = watchingStatus;

    try {
        // Save updated user
        await userSeries.save();

        // Send updated series
        res.json(userSeries);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * 3. Export router
 */

module.exports = router;
