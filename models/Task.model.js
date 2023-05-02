const { Schema, model } = require("mongoose");

const taskSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    user: { type: Schema.Types.ObjectId, ref: "User" },

    isdone: {
      type: Boolean,
      default: false,
    }, 

    flatId: {
      type: Schema.Types.ObjectId, ref: "Flat"
    }
  },
  {
    timestamps: true
  }
);

const Task = model("Task", taskSchema);

module.exports = Task;


