const { Profile, RC, User, enums, SupportGroup, SupportGroupMember } = require('../../db/models');
const { isUndefined } = require('../../utils/utils');

const setupPhysicianRoutes = (app) => {
    /**
     * PHYSICIAN  
     */


    app.post('/supportGroup/create', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
            name = "",
        } = req.body;

        try {
            if (userType !== enums.User.PHYSICIAN) throw Error("you don't have the required permission to access this endpoint");
            const sg = await SupportGroup.create({
                name,
                dateCreated: new Date()
            });

            const a = await sg.addUser(await User.findByPk(userId), { through: { isAdmin: true } });
            sg.ownerId = userId;

            if (!a) throw Error('could not add user');

            await sg.save();

            res.send(sg);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/supportGroup/delete', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
            id = -1,
        } = req.body;

        try {
            if (userType !== enums.User.PHYSICIAN) throw Error("you don't have the required permission to access this endpoint");
            const sg = await SupportGroup.findByPk(id);

            if (!sg) throw Error("the support group you provided doesn't exist")

            await sg.destroy();

            res.send(sg);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/supportGroup/update', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
            id = -1,
            name = "",
        } = req.body;

        try {
            if (userType !== enums.User.PHYSICIAN) throw Error("you don't have the required permission to access this endpoint");
            const sg = await SupportGroup.findByPk(id);

            if (!sg) throw Error("the support group you provided doesn't exist")

            sg.name = name;
            await sg.save();

            res.send(sg);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/supportGroup/list', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {

        } = req.body;

        try {
            if (userType !== enums.User.PHYSICIAN) throw Error("you don't have the required permission to access this endpoint");
            const u = await User.findByPk(userId);
            const sgs = await u.getSupportGroups()

            res.send(sgs);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/supportGroup/addUser', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
            supportGroupId,
            uId
        } = req.body;

        try {
            if (userType !== enums.User.PHYSICIAN) throw Error("you don't have the required permission to access this endpoint");

            if (isUndefined(supportGroupId) || isUndefined(uId))
                throw Error("uId and supportGroupId must be defined");

            const sg = await SupportGroup.findByPk(supportGroupId);
            if (!sg) throw Error("support group not found");

            const u = await User.findByPk(uId);
            if (!u) throw Error("user not found");

            const a = await sg.addUser(u);

            if (!a) throw Error('could not add user');

            res.send({ added: a });

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/supportGroup/removeUser', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
            supportGroupId,
            uId
        } = req.body;

        try {
            if (userType !== enums.User.PHYSICIAN) throw Error("you don't have the required permission to access this endpoint");

            if (isUndefined(supportGroupId) || isUndefined(uId))
                throw Error("uId and supportGroupId must be defined");

            const sg = await SupportGroup.findByPk(supportGroupId);
            if (!sg) throw Error("support group not found");

            const u = await User.findByPk(uId);
            if (!u) throw Error("user not found");

            const r = await sg.removeUser(u);

            res.send({
                removed: r
            });

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/supportGroup/toggleModerator', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
            uId,
            supportGroupId
        } = req.body;

        try {
            if (userType !== enums.User.PHYSICIAN) throw Error("you don't have the required permission to access this endpoint");

            if (isUndefined(uId) || isUndefined(supportGroupId))
                throw Error("uId and supportGroupId must be defined");

            const sgm = await SupportGroupMember.findOne({
                where: {
                    UserId: uId,
                    supportGroupId
                }
            });
            if (!sgm) throw Error("support group member not found");

            sgm.isAdmin = !sgm.isAdmin

            sgm.save();

            res.send(sgm);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/patient/toggleSoberity', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
            patientId
        } = req.body;

        try {
            if (userType !== enums.User.PHYSICIAN) throw Error("you don't have the required permission to access this endpoint");

            if (isUndefined(patientId))
                throw Error("patientId must be defined");

            const p = await User.findByPk(patientId);
            if (!p) throw Error("could not find patient");

            if (!p.dateLastSober) {
                p.dateLastSober = new Date()
                p.type = enums.User.SOBER_PATIENT
            } else {
                p.dateLastSober = null
                p.type = enums.User.ACTIVE_PATIENT
            }

            await p.save();

            res.send(p);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/patient/linkSponsor', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
            sponsorId,
            patientId
        } = req.body;

        try {
            if (userType !== enums.User.PHYSICIAN) throw Error("you don't have the required permission to access this endpoint");

            if (isUndefined(patientId) || isUndefined(sponsorId))
                throw Error("patientId and sponsorId must be defined");

            const s = await User.findByPk(sponsorId);
            if (!s) throw Error("could not find sponsor");

            const p = await User.findByPk(patientId);
            if (!p) throw Error("could not find patient");

            p.setSponsor(s);

            await p.save();

            res.send(p);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/rc/listSoberPatients', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
        } = req.body;

        try {
            if (userType !== enums.User.PHYSICIAN) throw Error("you don't have the required permission to access this endpoint");

            const soberPatients = await User.findAll({
                where: {
                    type: enums.User.SOBER_PATIENT,
                    RCId: userRCId
                }
            });

            res.send(soberPatients);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

}

module.exports = {
    setupPhysicianRoutes
}