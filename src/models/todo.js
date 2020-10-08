import DataTypes from 'sequelize'
export default (sequelize) => {
    const Todos = sequelize.define('todos', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        owner_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        date: {
            type: DataTypes.DATEONLY,
        },
        done: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    })

    return Todos
}
