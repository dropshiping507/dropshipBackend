const Leader = require("../models/Leader");
const bcrypt = require("bcryptjs");

const createLeader = async (username, password) => {
  try {
    const existing = await Leader.findOne();

    if (existing) {
      console.log("Leader already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Leader.create({
      username,
      password: hashedPassword,
    });

    console.log("✅ Leader created successfully");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = createLeader;
