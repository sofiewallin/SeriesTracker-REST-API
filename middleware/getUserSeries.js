/**
 * Get series added to a user middleware
 * 
 * Gets a series from database by id.
 * 
 * @author: Sofie Wallin
 */

 module.exports = async function getUserSeries(req, res, next) {
    const user = res.user;
    let series;

    // Get id from parameter
    const seriesId = req.params.series_id;

    try {
        // Get episode from database by id
        series = await user.series.id(seriesId);

        // Check if there is a match on the id in the database
        if (series == null) return res.status(404).json({ message: `There is no series added with id: ${seriesId}.` });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.series = series;
    next();
}