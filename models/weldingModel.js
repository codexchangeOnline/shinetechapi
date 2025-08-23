const mongoose = require('mongoose')

const testRowSchema = mongoose.Schema({
    idSysCode: {
        type: String,
        default: ''
    },
    filmSize: {
        type: String,
        default: ''
    },

    jointNo: {
        type: String,
        default: ''
    },
    welderNo: {
        type: String,
        default: ''
    },
      segment: {
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

const wedingSchema = mongoose.Schema({
    // Report data
    clientName: {
        type: String,
        default: ''
    },
    dateOfRt: {
        type: String,
        default: ''
    },
    reportNo: {
        type: String,
        default: ''
    },
    project: {
        type: String,
        default: ''
    },
    inspectionAgen: {
        type: String,
        default: ''
    },
    dateOfSubnm: {
        type: String,
        default: ''
    },
    materialNthick: {
        type: String,
        default: ''
    },
    source: {
        type: String,
        default: ''
    },
    strength: {
        type: String,
        default: ''
    },

    RtTechq: {
        type: String,
        default: ''
    },

    filmUsed: {
        type: String,
        default: ''
    },
    screen: {
        type: String,
        default: ''
    },
    jointType: {
        type: String,
        default: ''
    },
    expoTime: {
        type: String,
        default: ''
    },
    devTime: {
        type: String,
        default: ''
    },
    atTemp: {
        type: String,
        default: ''
    },
    cDensity: {
        type: String,
        default: ''
    },
    ug: {
        type: String,
        default: ''
    },
    weldingProcess: {
        type: String,
        default: ''
    },
    acceptOnCriteria: {
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

module.exports = mongoose.model("Welding", wedingSchema)
