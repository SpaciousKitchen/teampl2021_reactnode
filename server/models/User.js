module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "user",
    {
      userId: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },

      authToken: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      provider: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
    },
    {
      modelName: "User",
      tableName: "users",
      charset: "utf8",
      collate: "utf8_general_ci",
      sequelize,
    }
  );
};
