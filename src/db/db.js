const { sequelize } = require('./con');
const { User, Profile, enums } = require('./models');

sequelize.authenticate().then(async () => {

    console.log('Connection has been established successfully.');

    try {
        await sequelize.sync({ force: true });
        console.log("All models were synchronized successfully.");

        {
            const u = await User.create({
                type: enums.User.SYSTEM_ADMIN,
            })
            const p = await Profile.create({
                name: "system admin",
                email: "systemadmin@gmail.com",
                password: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" /* hash of empty string */,
            })

            p.setUser(u);
            await p.save();
        }

    } catch (ex) {
        console.error("unable to sync models:", ex)
        throw Error(ex)
    }

}).catch((error) => {
    console.error('Unable to connect to the database:', error);
});