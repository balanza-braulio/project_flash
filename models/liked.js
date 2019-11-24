module.exports = function(sequelize, DataTypes) {
    return sequelize.define('liked', {
      liked_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
      },
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