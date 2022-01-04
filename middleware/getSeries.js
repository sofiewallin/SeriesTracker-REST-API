// Models
const Series = require('../models/Series');

/**
 * Creates middleware for getting a series by id, which can be used 
 * in the routes that require a specific series.
 * 
 * @author: Sofie Wallin
 */

// Get Series by id
module.exports = async function getSeries(req, res, next) {
    let series;
    const seriesId = req.params.id;
    try {
        series = await Series.findById(seriesId);

        if (series == null) {
            return res.status(404).json({ message: `There is no series with id: ${seriesId}` });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.series = series;
    next();
}