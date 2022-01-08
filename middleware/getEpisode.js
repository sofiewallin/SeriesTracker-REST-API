/**
 * Get episode middleware - Gets an episode from database by id.
 * 
 * @author: Sofie Wallin
 */

module.exports = async function getEpisode(req, res, next) {
    let episode;

    // Get id from parameter
    const episodeId = req.params.episode_id;

    try {
        // Get episode by id
        episode = await res.series.episodes.id(episodeId);

        // Send error if there is no episode matching the id
        if (episode == null) return res.status(404).json({ message: `There is no episode with id: ${episodeId}.` });
    } catch (err) {
        // Send error
        return res.status(500).json({ message: err.message });
    }

    res.episode = episode;
    next();
}