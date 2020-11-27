var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const counterSchema = new Schema(
    {
        _id: { type: String, required: true },
        seq: { type: Number, default: 0 }
    }
);

counterSchema.index({ _id: 1, seq: 1 }, { unique: true })

const counterModel = mongoose.model('counter', counterSchema);

const autoIncrementModelID = async function (modelName:any) {
    try {
        let counter = await counterModel.findByIdAndUpdate(        // ** Method call begins **
            modelName,                           // The ID to find for in counters model
            { $inc: { seq: 1 } },                // The update
            { new: true, upsert: true })         // The options
        return counter.seq;
    }
    catch (error) { return; }
}

module.exports = autoIncrementModelID;