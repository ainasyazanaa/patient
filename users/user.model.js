const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
		identityCard: { type: DataTypes.STRING, allowNull: false},
		fullName: { type: DataTypes.STRING, allowNull: false },
		email: { type: DataTypes.STRING, allowNull: false },
		phoneNumber: { type: DataTypes.STRING,allowNull: false },
		hash: { type: DataTypes.STRING, allowNull: false }
    };

    const options = {
        defaultScope: {
            // exclude hash by default
            attributes: { exclude: ['hash'] }
        },
        scopes: {
            // include hash with this scope
            withHash: { attributes: {}, }
        }
    };

    return sequelize.define('Patient', attributes, options);
}