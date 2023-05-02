const { Schema, model } = require("mongoose");

const taskSchema = new Schema(
  {
    task: {
      type: String,
      required: true,
    },

    description: {
      type: String,
    },

    users: { type: Schema.Types.ObjectId, ref: "User" }
  },
  {
    timestamps: true
  }
);

const Task = model("Task", taskSchema);

module.exports = Schedule;


//connect to flat 