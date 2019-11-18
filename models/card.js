/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('card', {
    card_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    card_front: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    cardSet_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'card_set',
        key: 'set_id'
      }
    }
  }, {
    tableName: 'card',
    timestamps: false,
  });
};
