const { generateRandomPassword, sha256 } = require('../utils/utils');
const { sequelize } = require('./con');
const { User, Profile, enums, RC } = require('./models');

sequelize.authenticate().then(async () => {

    console.log('Connection has been established successfully.');

    try {
        await sequelize.sync({ force: true });
        console.log("All models were synchronized successfully.");
        
        const defaultPassword = 'p';

        const rc = await RC.create({
            name: "test rc"
        });

        {
            const u = await User.create({
                type: enums.User.SYSTEM_ADMIN,
            })

            const p = await Profile.create({
                name: "system admin",
                email: "systemadmin@gmail.com",
                password: sha256(defaultPassword),
                defaultPassword,    
            })

            p.setUser(u);

            await p.save();
        }

        {
            const u = await User.create({
                type: enums.User.RC_MANAGER,
            })

            u.setRC(rc);

            const p = await Profile.create({
                name: "rc manager",
                email: "rcmanager@gmail.com",
                password: sha256(defaultPassword),
                defaultPassword,     
            })

            p.setUser(u);

            await p.save();
        }

        {
            const u = await User.create({
                type: enums.User.PHYSICIAN,
            })

            u.setRC(rc);

            const p = await Profile.create({
                name: "physician",
                email: "physician@gmail.com",
                password: sha256(defaultPassword),
                defaultPassword,
            })

            p.setUser(u);

            await p.save();
        }

        {
            const u = await User.create({
                type: enums.User.ACTIVE_PATIENT,
            })

            u.setRC(rc);

            const p = await Profile.create({
                name: "active patient",
                email: "activepatient@gmail.com",
                password: sha256(defaultPassword),
                defaultPassword,    
            })

            p.setUser(u);

            await p.save();
        }

        {
            const u = await User.create({
                type: enums.User.SOBER_PATIENT,
            })

            u.setRC(rc);

            const p = await Profile.create({
                name: "sober patient",
                email: "soberpatient@gmail.com",
                password: sha256(defaultPassword),
                defaultPassword,    
            })

            p.setUser(u);

            await p.save();
        }

        {
            const u = await User.create({
                type: enums.User.CARETAKER,
            })

            u.setRC(rc);

            const p = await Profile.create({
                name: "care taker",
                email: "caretaker@gmail.com",
                password: sha256(defaultPassword),
                defaultPassword,
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