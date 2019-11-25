module.exports = function(sequelize, DataTypes) {
    return sequelize.define('liked', {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      cardSet_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    }, {
      tableName: 'liked',
      timestamps: false,
    });
  };