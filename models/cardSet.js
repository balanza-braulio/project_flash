/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('cardSet', {
    cardSet_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    cardSet_name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'user_id'
      }
    }
  }, {
    tableName: 'cardSet',
    timestamps: false,
  });
};
