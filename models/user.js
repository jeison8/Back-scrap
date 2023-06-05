const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const UserSchema = Schema({
    document: {
        type: String,
        require:true
    },
    name: {
        type: String,
        require:true
    },
    password: {
        type: String,
        require:true
    },
    cost: {
        type: String,
        require:true
    },
    dateStart: {
        type: Date,
        require:true
    },
    dateEnd: {
        type: Date,
        require:true
    }
});

UserSchema.set('toJSON', {
    transform: (doc, ret) => {
      delete ret.password;
      return ret;
    },
    versionKey: false,
  });

UserSchema.plugin(mongoosePaginate);

module.exports = model('User',UserSchema);
