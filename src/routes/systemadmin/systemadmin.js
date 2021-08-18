const { Profile, RC, User, enums } = require('../../db/models');
const { sha256, isUndefined } = require('../../utils/utils')

const setupSystemAdminRoutes = (app) => {
    /**
     * SYSTEM_ADMIN  
     */


    app.post('/rc/create', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
            name = "",
            managerEmail = "",
        } = req.body;

        try {
            if (userType !== enums.User.SYSTEM_ADMIN) throw Error("you don't have the required permission to access this endpoint");
            const [r] = await RC.findOrCreate({
                where: {
                    name
                }
            });

            const [p] = await Profile.findOrCreate({
                where: {
                    email: managerEmail,
                },
                defaults: {
                    name: "",
                    password: sha256("")
                }
            });

            if (await p.getUser() !== null) throw Error("this email has already been used")

            const u = await User.create({
                type: enums.User.RC_MANAGER,
            });

            p.setUser(u);
            u.setRC(r);

            await p.save();
            await u.save();

            res.send({
                rc: r,
                profile: p,
                user: u,
            });

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/rc/reset', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;
        const {
            rcId
        } = req.body;

        try {
            if (userType !== enums.User.SYSTEM_ADMIN) throw Error("you don't have the required permission to access this endpoint");
            if (isUndefined(rcId)) throw Error("rcId is empty");

            const u = await User.findOne({
                where: {
                    type: enums.User.RC_MANAGER,
                    RCId: rcId
                }
            });

            if (!u) throw Error("there is no manager with that rc id")

            const p = await Profile.findOne({
                where: {
                    UserId: u.id
                }
            });

            if (!p) throw Error("there is no profile with that user id")

            p.password = sha256("")
            await p.save();

            res.send(p);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/rc/toggleActivation', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;
        const {
            rcId
        } = req.body;

        try {
            if (userType !== enums.User.SYSTEM_ADMIN) throw Error("you don't have the required permission to access this endpoint");

            if (isUndefined(rcId)) throw Error("rcId is empty");

            const rc = await RC.findOne({
                where: {
                    id: rcId
                }
            });

            rc.isActive = !rc.isActive;
            await rc.save();

            res.send(rc);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.get('/rc/list', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;
        const {
        } = req.body;

        try {
            if (userType !== enums.User.SYSTEM_ADMIN) throw Error("you don't have the required permission to access this endpoint");

            const rc = await RC.findAll();

            res.send(rc);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.get('/rc/info/:id', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;
        const {
        } = req.body;

        try {
            if (userType !== enums.User.SYSTEM_ADMIN) throw Error("you don't have the required permission to access this endpoint");

            const rId = req.params.id

            const rc = await RC.findByPk(rId);

            res.send(rc);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });
}

module.exports = {
    setupSystemAdminRoutes
}