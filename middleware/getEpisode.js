/**
 * Get episode middleware.
 * 
 * Gets an episode from database by id and sets it as
 * res.episode for routes.
 * 
 * @author: Sofie Wallin
 */

module.exports = async function getEpisode(req, res, next) {
    const series = res.series; 
    let episode;

    // Get id from parameter
    const episodeId = req.params.episode_id;

    try {
        // Get episode from database by id
        episode = await series.episodes.id(episodeId);

        // Check if there is a match on the id in the database
        if (episode == null) return res.status(404).json({ message: `There is no episode with id: ${episodeId}.` });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    // Set episode response
    res.episode = episode;
    
    next();
}
