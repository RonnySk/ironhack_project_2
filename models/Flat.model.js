const { Schema, model } = require("mongoose");

const flatSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },

    owner: { type: Schema.Types.ObjectId },

    users: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },

  {
    timestamps: true,
  }
);

const Flat = model("Flat", flatSchema);

module.exports = Flat;
