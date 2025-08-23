const express = require('express')
const router = express.Router()
const {
      getWelding,
    getWeldingById,
    createWelding,
    updateWelding,
    deleteWelding,
    getWeldingByDateRange,
    getWeldingByCustomer,
    getNextReportNo
} = require('../controllers/weldingController')
const validateToken = require('../middleware/validateToken')

// Public routes (can be made protected later if needed)
router.route("/").post(createWelding)
router.route("/loadall/:createdBy").get(getWelding)

router.route("/next-report-no").get(getNextReportNo)
router.route("/:id").get(getWeldingById).put(updateWelding).delete(deleteWelding)

// Additional routes
router.route("/date-range").get(getWeldingByDateRange)
router.route("/client/:clientName").get( getWeldingByCustomer,
)

module.exports = router
