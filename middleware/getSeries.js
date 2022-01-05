/**
 * Get series middleware - Gets an series from database by id.
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
        // Get series by id
        series = await Series.findById(seriesId);

        // Send error if there is no series matching the id
        if (series == null) return res.status(404).json({ message: `There is no series with id: ${seriesId}` });
    } catch (err) {
        // Send error
        return res.status(500).json({ message: err.message });
    }

    res.series = series;
    next();
}