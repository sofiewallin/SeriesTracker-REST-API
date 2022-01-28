/**
 * Routes for series.
 * 
 * 1. Set create routes
 * 2. Set read routes
 * 3. Set update routes
 * 4. Set delete routes
 * 5. Export router
 * 
 * Helper functions
 * 
 * @author: Sofie Wallin
 */

// Express router
const router = require('express').Router();

// Models
const Series = require('../models/Series');
const User = require('../models/User');

// Middleware
const getSeries = require('../middleware/getSeries');
const getEpisode = require('../middleware/getEpisode');
let getSeriesAndEpisode = [getSeries, getEpisode];

/**
 * 1. Set create routes
 */

/* 1.1 Create one series */

router.post('/', async (req, res) => {
    let episodes = req.body.episodes;

    if (episodes !== undefined) {
        sortEpisodes(episodes);
    }

    // Create new series
    const series = new Series({
        name: req.body.name,
        plot: req.body.plot,
        airingStatus: req.body.airingStatus,
        episodes: episodes 
    });

    try {
        // Save new series to database
        const newSeries = await series.save();

        // Send new series
        res.status(201).json(newSeries);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/**
 * 2. Set read routes
 */

/* 2.1 Get all series */

router.get('/', async (req, res) => {
    try {
        // Find all series in database
        const series = await Series.find();

        // Send all series
        res.json(series);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* 2.2 Search all series by name */

router.get('/search/:query', async (req, res) => {
    try {
        // Find series in database, that has the query string somewhere in the name
        const series = await Series.find({ name: new RegExp(req.params.query, 'i') });

        // Send found series
        res.json(series);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* 2.3 Get one series (with episodes divided by seasons) */

router.get('/:id', getSeries, async (req, res) => {
    let series = res.series;

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
            let episode = episodes[i];
            const seasonNumber = episode.seasonNumber;
            const episodeNumber = episode.episodeNumber;

            let originalAirDate = episode.originalAirDate;
            if (originalAirDate) originalAirDate = originalAirDate.toISOString().substring(0,10);

            let seasonNumberString;
            if (seasonNumber < 10) seasonNumberString = seasonNumber.toString().padStart(2, '0');
            let episodeNumberString = episode.episodeNumber;
            if (episodeNumber < 10) episodeNumberString = episodeNumber.toString().padStart(2, '0');

            const episodeNumbers = `S${seasonNumberString}E${episodeNumberString}`;

            const newEpisodeObj = {
                episodeId: episode._id.toString(),
                seasonNumber: seasonNumber,
                episodeNumber: episodeNumber,
                episodeNumbers: episodeNumbers,
                name: episode.name,
                originalAirDate: originalAirDate
            }
            
            // Push a new season object into seasons array
            seasons.push({ 
                number: seasonNumber,
                episodes: [newEpisodeObj] 
            });
        }
    }

    // Merge seasons with the same season number 
    if (seasons.length !== 0) {
        let mergedSeasons = [];

        for (let i = 0; i < seasons.length; i++) {
            let season = seasons[i];

            // Get array of existing seasons
            let existingSeasons = mergedSeasons.filter(element => {
                return element.number === season.number;
            });

            // Add episode to season that exist or add a new season if season doesn't exist
            if (existingSeasons.length) {
                let existingSeasonIndex = mergedSeasons.indexOf(existingSeasons[0]);
                mergedSeasons[existingSeasonIndex].episodes = mergedSeasons[existingSeasonIndex].episodes.concat(season.episodes);
            } else {
                mergedSeasons.push(season);
            }

        }
    
        seasons = mergedSeasons;
    }

    // Construct a new series object with seasons
    series = {
        _id: series._id,
        name: name,
        plot: plot,
        airingStatus: airingStatus,
        seasons: seasons,
        createdAt: series.createdAt,
        updatedAt: series.updatedAt,
        __v: series.__v
    };

    // Send series
    res.json(series);
});

/* 2.4 Get one episode */

router.get('/:id/get-episode/:episode_id', getSeriesAndEpisode, async (req, res) => {
    const series = res.series;
    let episode = res.episode;

    let originalAirDate = episode.originalAirDate;
    if (originalAirDate) originalAirDate = originalAirDate.toISOString().substring(0,10);

    let seasonNumber = episode.seasonNumber;
    if (seasonNumber < 10) seasonNumber = seasonNumber.toString().padStart(2, '0');
    let episodeNumber = episode.episodeNumber;
    if (episodeNumber < 10) episodeNumber = episodeNumber.toString().padStart(2, '0');

    const episodeNumbers = `S${seasonNumber}E${episodeNumber}`;

    episode = {
        episodeId: episode._id,
        seasonNumber: seasonNumber,
        episodeNumber: episodeNumber,
        episodeNumbers: episodeNumbers,
        name: episode.name,
        originalAirDate: originalAirDate,
        series: series.name
    }
    
    res.json(episode);
});

/**
 * 3. Set update routes
 */

/* 3.1 Update one series */

router.patch('/:id', getSeries, async (req, res) => {
    const series = res.series;
    const newEpisodes = req.body.episodes;

    // Update series
    series.name = req.body.name;
    series.plot = req.body.plot;
    series.airingStatus = req.body.airingStatus;

    // Add new episodes if they exist
    if (newEpisodes !== undefined) {
        for (let i = 0; i < newEpisodes.length; i++) {
            const newEpisode = newEpisodes[i];

            series.episodes.push(newEpisode);
        }

        sortEpisodes(series.episodes);
    }

    try {
        // Save updated series
        const updatedSeries = await series.save();

        // Send updated series
        res.json(updatedSeries);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/* 3.2 Add one episode */

router.patch('/:id/add-episode', getSeries, async (req, res) => {
    const series = res.series;
    const episodes = series.episodes;

    const seasonNumber = req.body.seasonNumber;
    const episodeNumber = req.body.episodeNumber;

    // Check if episode already exists
    if (episodes.length !== 0) {
        for (let i = 0; i < episodes.length; i++) {
            const episode = episodes[i];
            if (seasonNumber === episode.seasonNumber && 
                episodeNumber === episode.episodeNumber) {
                return res.status(400).json(
                    { message: `The episode s${seasonNumber}e${episodeNumber} already exists.` }
                );
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
    sortEpisodes(episodes);

    try {
        // Save updated series
        await res.series.save();

        // Get the added episode from series
        for (let i = 0; i < episodes.length; i++) {
            const episode = episodes[i];
            if (seasonNumber === episode.seasonNumber && 
                episodeNumber === episode.episodeNumber) {
                newEpisode = episode;
            }
        }

        // Send new episode
        res.json(newEpisode);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/* 3.3 Update one episode */

router.patch('/:id/update-episode/:episode_id', getSeriesAndEpisode, async (req, res) => {
    const series = res.series;
    const episodes = series.episodes;
    const episode = res.episode;

    const seasonNumber = req.body.seasonNumber;
    const episodeNumber = req.body.episodeNumber;

    // Check if episode already exists
    for (let i = 0; i < episodes.length; i++) {
        if (episodes[i]._id !== episode._id && 
            episodes[i].seasonNumber === seasonNumber && 
            episodes[i].episodeNumber === episodeNumber) {
            return res.status(400).json(
                { message: `The episode s${seasonNumber}e${episodeNumber} already exists.` }
            );
        }
    }

    // Update episode
    episode.seasonNumber = seasonNumber;
    episode.episodeNumber = episodeNumber;
    episode.name = req.body.name;
    episode.originalAirDate = req.body.originalAirDate;

    try {
        // Save updated series
        await series.save();

        // Send updated series
        res.json(episode);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/* 3.4 Remove one episode */

router.patch('/:id/remove-episode/:episode_id', getSeriesAndEpisode, async (req, res) => {
    const series = res.series;
    const episode = res.episode;

    const episodes = series.episodes;

    // Remove episode from episodes array in series
    episodes.pull(episode);

    // Reduce episode number by one for episodes after removed episode, in same season
    if (episodes.length > 0) {
        for (let i = 0; i < episodes.length; i++) {
            const existingEpisode = episodes[i];

            if (existingEpisode.seasonNumber === episode.seasonNumber && 
                existingEpisode.episodeNumber > episode.episodeNumber) {
                existingEpisode.episodeNumber -= 1;
            }
        }
    }

    // Reduce season number by one for episodes with a higher season number if the removed episode is the last in its season
    const episodesInSameSeason = episodes.filter(exisitingEpisode => exisitingEpisode.seasonNumber === episode.seasonNumber);
    if (episodesInSameSeason.length === 0) {
        episodes.forEach(existingEpisode => {
            if (existingEpisode.seasonNumber > episode.seasonNumber) {
                existingEpisode.seasonNumber -= 1;
            }
        });
    }

    try {
        // Save updated series
        await series.save();

        // Send removed episode
        res.json(episode);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* 4. Set delete routes */

// Delete one series
router.delete('/:id', getSeries, async (req, res) => {
    const series = res.series;

    try {
        // Remove series
        const deletedSeries = await series.remove();
        User.updateMany({},{ $pull: { series: { series_id: deletedSeries._id } } });

        // Send removed series
        res.json(deletedSeries);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * 5. Export router
 */

module.exports = router;

/**
 * Helper functions
 */

/* Sort episodes ascending */

 const sortEpisodes = episodes => {
    episodes.sort((a, b) => {
        if (a.seasonNumber === b.seasonNumber){
          return a.episodeNumber < b.episodeNumber ? -1 : 1
        } else {
          return a.seasonNumber < b.seasonNumber ? -1 : 1
        }
    });

    return episodes;
}
