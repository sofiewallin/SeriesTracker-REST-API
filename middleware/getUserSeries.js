/**
 * Get series added to a user middleware - Gets a series from database by id.
 * 
 * @author: Sofie Wallin
 */

 module.exports = async function getUserSeries(req, res, next) {
    let series;

    // Get id from parameter
    const seriesId = req.params.series_id;

    try {
        // Get episode by id
        series = await res.user.series.id(seriesId);

        // Send error if there is no episode matching the id
        if (series == null) return res.status(404).json({ message: `There is no series with id: ${seriesId}.` });
    } catch (err) {
        // Send error
        return res.status(500).json({ message: err.message });
    }

    res.series = series;
    next();
}