/**
 * Creates middleware for getting an episode by id, which can be used 
 * in the routes that require a specific episode.
 * 
 * @author: Sofie Wallin
 */

// Get Series by id
module.exports = async function getEpisode(req, res, next) {
    let episode;
    const episodeId = req.params.episode_id;
    try {
        episode = await res.series.episodes.id(episodeId);

        if (episode == null) {
            return res.status(404).json({ message: `There is no episode with id: ${episodeId}` });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.episode = episode;
    next();
}