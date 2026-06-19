const { DataTypes } = require("sequelize");
const sequelize = require("../config/database.config");

const User = sequelize.define("User", {
    id_user: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
    },
    pseudo_uniq: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    pseudo: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    bio: {
        type: DataTypes.TEXT,
    },
    img_profile: {
        type: DataTypes.STRING,
    },
    signalement: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    banned_until: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },
    nb_followers: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    timestamps: true,
});

const Follow = sequelize.define("Follow", {}, {
    timestamps: true,
});

User.belongsToMany(User, {
    through: Follow,
    as: "Following",
    foreignKey: "follower_id",
    otherKey: "following_id",
});

User.belongsToMany(User, {
    through: Follow,
    as: "Followers",
    foreignKey: "following_id",
    otherKey: "follower_id",
});

module.exports = { User, Follow };