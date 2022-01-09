/**
 * Get series middleware.
 * 
 * Gets a series from database by id and sets it as
 * res.series for routes.
 * 
 * @author: Sofie Wallin
 */

// Models
const Series = require('../models/Series');

module.exports = async function getSeries(req, res, next) {
    let series;

    // Get id from parameter
    const seriesId = req.params.id;

    try {
        // Get series from database by id
        series = await Series.findById(seriesId);

        // Check if there is a match on the id in the database
        if (series == null) return res.status(404).json({ message: `There is no series with id: ${seriesId}.` });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    // Set series response
    res.series = series;

    next();
}
