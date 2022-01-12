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

/* 1.1 Get all added series to a user */

router.get('/:id/series', authorizeAndGetUser, async (req, res) => {
        const user = res.user;

        // Send all series
        res.json(user.series);

});

/* 1.2 Get added series to a user based on watching status */

router.get('/:id/series/watching-status/:status', authorizeAndGetUser, async (req, res) => {
    const user = res.user;

    let seriesBasedOnWatchingStatus = [];
    let watchingStatus = req.params.status;

    // Turn the watching status parameter into a string to check against
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

    // Push all the series with matching watching status into array
    const userSeries = user.series;

    for (let i = 0; i < userSeries.length; i++) {
        const series = userSeries[i];
        if (series.watchingStatus === watchingStatus) {
            seriesBasedOnWatchingStatus.push(series);
        }
    }

    // Send series
    res.json(seriesBasedOnWatchingStatus);
});

/* 1.3 Get one series added to a user */

router.get('/:id/series/:series_id', authorizeAndGetUserAndSeries, async (req, res) => {
    const series = res.series;

    // Send series
    res.send(series);
});

/* 1.4 Get all next episodes for a user */

router.get('/:id/next-episode-list', authorizeAndGetUser, async (req, res) => {
    const user = res.user;
    const userSeries = user.series;

    let nextEpisodeList = [];

    // Get next episode from all series added to user
    if (userSeries.length !== 0) {
        for (let i = 0; i < userSeries.length; i++) {
            if (userSeries[i].watchingStatus === 'Watching now') {
                const nextEpisode = { 
                    series: userSeries[i].series_id,
                    nextEpisode: userSeries[i].nextEpisode 
                };
    
                // Add next episode to next episode list
                nextEpisodeList.push(nextEpisode);
            }
        }
    }

    // Send next episode list
    res.json(nextEpisodeList);
 
});

/**
 * 2. Set update routes
 */

/* 2.1 Add series to a user */

router.put('/:id/add-series', authorizeAndGetUser, async (req, res) => {
    const user = res.user;
    const userSeries = user.series;

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
    if (userSeries.length !== 0) {
        for (let i = 0; i < userSeries.length; i++) {
            const exisitingSeriesId = userSeries[i].series_id.toString();
            if (seriesId === exisitingSeriesId) {
                return res.status(400).json({ message: `The series with id ${seriesId} has already been added.` });
            }
        }
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
    userSeries.push(newUserSeries);

    try {
        // Save updated user
        await user.save();

        // Get added series
        const newUserSeriesIndex = userSeries.length - 1;
        newUserSeries = userSeries[newUserSeriesIndex];

        // Send updated user series
        res.json(newUserSeries);
    } catch (err) {
        // Send error
        res.status(400).json({ message: err.message });
    }
});

/* 2.2 Remove series from a user */

router.put('/:id/remove-series/:series_id', authorizeAndGetUserAndSeries, async (req, res) => {
    const user = res.user;
    const series = res.series;

    // Remove series from users series list
    user.series.pull(series);

    try {
        // Save updated user
        await user.save();

        // Send removed series
        res.json(series);
    } catch (err) {
        // Send error
        res.status(500).json({ message: err.message });
    }
});

/* 2.3 Add episode to "watched episodes" and set next episode for one series added to a user */

router.put('/:id/series/:series_id/watch-episode/:episode_id', authorizeAndGetUserAndSeries, async (req, res) => {
    const user = res.user;
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
    
    if ( watchedEpisodes.length !== 0) {
        for (let i = 0; i < watchedEpisodes.length; i++) {
            const existingEpisodeId = watchedEpisodes[i];

            if (episodeId === existingEpisodeId) {
                return res.status(400).json({ message: `The episode id ${episodeId} has already been added to watched episodes.` });
            }
        }
    }

    // Add episode to watched episodes
    watchedEpisodes.push(episodeId);

    // Set next episode
    let nextEpisode = null;
    let episodeIdStrings = [];

    for (let i = 0; i < episodes.length; i++) {
        const episodeIdString = episodes[i]._id.toString();
        episodeIdStrings.push(episodeIdString);
    }

    const nextEpisodeList = episodeIdStrings.filter(episodeIdString => !watchedEpisodes.includes(episodeIdString));
    if (nextEpisodeList.length !== 0) nextEpisode = nextEpisodeList[0];
     
    userSeries.nextEpisode = nextEpisode;

    try {
        // Save updated user
        await user.save();

        // Send added episode id
        res.json({ episodeId: episodeId });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/* 2.4 Remove episode from "watched episodes" and set next episode for one series added to a user */

router.put('/:id/series/:series_id/unwatch-episode/:episode_id', authorizeAndGetUserAndSeries, async (req, res) => {
    const user = res.user;
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

    let episodeMatch = false;
    for (let i = 0; i < watchedEpisodes.length; i++) {
        const existingEpisodeId = watchedEpisodes[i];

        if (episodeId === existingEpisodeId) {
            episodeMatch = true;
            episodeId = existingEpisodeId;
        }
    }

    if (episodeMatch) {
        watchedEpisodes.pull(episodeId);
    } else {
        return res.status(400).json({ message: `The episode id ${episodeId} doesn't exist in watched episodes.` });
    }

    // Set next episode
    if (watchedEpisodes.length !== 0) {
        let episodeIdStrings = [];

        for (let i = 0; i < episodes.length; i++) {
            const episodeIdString = episodes[i]._id.toString();
            episodeIdStrings.push(episodeIdString);
        }

        const nextEpisodeList = episodeIdStrings.filter(episodeIdString => !watchedEpisodes.includes(episodeIdString));
        const nextEpisode = nextEpisodeList[0];
        userSeries.nextEpisode = nextEpisode;
    } else {
        userSeries.nextEpisode = episodes[0];
    }

    try {
        // Save updated user
        await user.save();

        // Send removed episode id
        res.json({ episodeId: episodeId });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/* 2.5 Clear watch history of one series added to a user */
router.put('/:id/series/:series_id/clear-watch-history', authorizeAndGetUserAndSeries, async (req, res) => {
    const user = res.user;
    const series = res.series;

    series.watchedEpisodes = [];

    try {
        // Save updated user
        await user.save();

        // Send updated series
        res.json(series);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/* 2.6 Change watching status of one series added to a user */

router.put('/:id/series/:series_id/change-watching-status/:status', authorizeAndGetUserAndSeries, async (req, res) => {
    const user = res.user;
    const series = res.series;

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
    series.watchingStatus = watchingStatus;

    try {
        // Save updated user
        await user.save();

        // Send updated series
        res.json(series);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * 3. Export router
 */

module.exports = router;
