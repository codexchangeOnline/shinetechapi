const mongoose = require('mongoose')

const testRowSchema = mongoose.Schema({
    idLoc: {
        type: String,
        default: ''
    },
    filmSize: {
        type: String,
        default: ''
    },
    tech: {
        type: String,
        default: ''
    },
    thick: {
        type: String,
        default: ''
    },
    density: {
        type: String,
        default: ''
    },
    sfd: {
        type: String,
        default: ''
    },
    iqi: {
        type: String,
        default: ''
    },
    x: {
        type: String,
        default: ''
    },
    sens: {
        type: String,
        default: ''
    },
    finding: {
        type: String,
        default: ''
    },
    result: {
        type: String,
        default: ''
    }
})

const invoiceSchema = mongoose.Schema({
      isMailSent: {
    type: Boolean,
    default: false   // by default true
  },
    // Report data
    clientName: {
        type: String,
        default: ''
    },
    customerName: {
        type: String,
        default: ''
    },
    date: {
        type: String,
        default: ''
    },
    reportNo: {
        type: String,
        default: ''
    },
    jobDescription: {
        type: String,
        default: ''
    },
    srNoRtNo: {
        type: String,
        default: ''
    },
    dieToolNo: {
        type: String,
        default: ''
    },
    heatNo: {
        type: String,
        default: ''
    },
    material: {
        type: String,
        default: ''
    },
    drgNo: {
        type: String,
        default: ''
    },
    dateOfTesting: {
        type: String,
        default: ''
    },
    offerNo: {
        type: String,
        default: ''
    },
    testCarriedOutAt: {
        type: String,
        default: ''
    },
    poNo: {
        type: String,
        default: ''
    },
    procedureNo: {
        type: String,
        default: ''
    },
    procedureFollowed: {
        type: String,
        default: ''
    },
    evalStndrd: {
        type: String,
        default: ''
    },
    acptanceStndrd: {
        type: String,
        default: ''
    },
    coverage: {
        type: String,
        default: ''
    },
    shootingKetchNo: {
        type: String,
        default: ''
    },
    radiationSource: {
        type: String,
        default: ''
    },
    sourceStrength: {
        type: String,
        default: ''
    },
    sourceSize: {
        type: String,
        default: ''
    },
    screen: {
        type: String,
        default: ''
    },
    exposureTime: {
        type: String,
        default: ''
    },
    filmBrandType: {
        type: String,
        default: ''
    },
    filmProcessing: {
        type: String,
        default: ''
    },
    processingTime: {
        type: String,
        default: ''
    },
    filmDensity: {
        type: String,
        default: ''
    },
    filmSizeSummary: {
        type: String,
        default: ''
    },
    totalFilms: {
        type: String,
        default: ''
    },
    totalSqInches: {
        type: String,
        default: ''
    },
    createdBy: {
        type: String,
        default: ''
    },
    // Test rows array
    testRows: [testRowSchema]
}, {
    timestamps: true,
})

module.exports = mongoose.model("Invoice", invoiceSchema)
