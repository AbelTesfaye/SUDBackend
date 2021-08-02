const { Op } = require('sequelize');
const { Profile, RC, User, enums, SupportGroup, SupportGroupMember, PhysicianProvidedTherapeuticResource } = require('../../db/models');
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

    app.post('/supportGroup/listUsers', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
            supportGroupId
        } = req.body;

        try {
            if (userType !== enums.User.PHYSICIAN) throw Error("you don't have the required permission to access this endpoint");
            const s = await SupportGroup.findByPk(supportGroupId)
            if (!s) throw Error('could not find support group')

            const m = await s.getUsers({ include: [Profile] });

            res.send(m);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/supportGroup/listModeratorUsers', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
            supportGroupId
        } = req.body;

        try {
            if (userType !== enums.User.PHYSICIAN) throw Error("you don't have the required permission to access this endpoint");
            const s = await SupportGroup.findByPk(supportGroupId)
            if (!s) throw Error('could not find support group')

            const m = await s.getUsers({
                through: {
                    where: {
                        isAdmin: true,
                    },
                },

                include: [Profile]
            });

            res.send(m);

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
                    SupportGroupId: supportGroupId
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

    app.post('/supportGroup/details', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
            supportGroupId
        } = req.body;

        try {
            if (userType !== enums.User.PHYSICIAN) throw Error("you don't have the required permission to access this endpoint");
            const s = await SupportGroup.findByPk(supportGroupId)

            if (!s) throw Error('support group not found')

            res.send(s);

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

            const u = await User.findByPk(patientId);
            if (!u) throw Error("could not find patient");

            if (u.type === enums.User.ACTIVE_PATIENT) {
                u.dateLastSober = new Date()
                u.type = enums.User.SOBER_PATIENT
            } else {
                u.dateLastSober = null
                u.type = enums.User.ACTIVE_PATIENT

                const sgm = await SupportGroupMember.findAll({
                    where: {
                        UserId: patientId
                    }
                })

                for (const ss of sgm) {
                    ss.isAdmin = false;
                    await ss.save();
                }

                const sp = await User.findAll({
                    where: {
                        sponsorId: patientId
                    }
                })

                for (const ss of sp) {
                    ss.sponsorId = null;
                    await ss.save();
                }
            }

            await u.save();

            res.send(u);

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

    app.post('/patient/linkCaretaker', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
            caretakerId,
            patientId
        } = req.body;

        try {
            if (userType !== enums.User.RC_MANAGER) throw Error("you don't have the required permission to access this endpoint");

            if (isUndefined(patientId) || isUndefined(caretakerId))
                throw Error("patientId and caretakerId must be defined");

            const c = await User.findByPk(caretakerId);
            if (!c) throw Error("could not find caretaker");

            const p = await User.findByPk(patientId);
            if (!p) throw Error("could not find patient");

            p.setCaretaker(c);

            await p.save();

            res.send(p);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/patient/list', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
            showSober = true,
            showActive = true,
        } = req.body;

        try {
            if (userType !== enums.User.PHYSICIAN && userType !== enums.User.RC_MANAGER) throw Error("you don't have the required permission to access this endpoint");
            let p = [];

            const filter = []

            if (showSober) filter.push({ type: enums.User.SOBER_PATIENT })
            if (showActive) filter.push({ type: enums.User.ACTIVE_PATIENT })

            if (userType === enums.User.RC_MANAGER) {
                p = await User.findAll({
                    where: {
                        RCId: userRCId,
                        [Op.or]: filter
                    },
                    include: Profile
                })
            } else {
                p = await User.findAll({
                    where: {
                        physicianId: userId,
                        [Op.or]: filter
                    },
                    include: Profile
                })
            }


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
            wantsToSponsor = true,
        } = req.body;

        try {
            if (userType !== enums.User.PHYSICIAN) throw Error("you don't have the required permission to access this endpoint");

            const soberPatients = await User.findAll({
                where: {
                    type: enums.User.SOBER_PATIENT,
                    wantsToSponsor,
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

    app.post('/therapeuticDocuments/createOrUpdate', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
            id = -1,
            title,
            type,
            url,
            isActive = true,
        } = req.body;

        try {
            if (userType !== enums.User.PHYSICIAN) throw Error("you don't have the required permission to access this endpoint");

            if (Object.keys(enums.PhysicianProvidedTherapeuticResource).indexOf(type) === -1)
                throw Error(`type must be one of: ${Object.keys(enums.PhysicianProvidedTherapeuticResource)}`)

            if (!title || !url)
                throw Error('title and url must have content')

            const [t] = await PhysicianProvidedTherapeuticResource.findOrCreate({
                where: {
                    id,
                },
                defaults: {
                    id: null,
                    title,
                    datePosted: new Date(),
                    type,
                    url,
                    ownerId: userId
                }
            });

            t.isActive = isActive;
            t.title = title;
            t.url = url;
            await t.save();

            res.send(t);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/therapeuticDocuments/share', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
            therapeuticDocumentId,
            shareToUserId
        } = req.body;

        try {
            if (userType !== enums.User.PHYSICIAN) throw Error("you don't have the required permission to access this endpoint");

            if (!therapeuticDocumentId || !shareToUserId)
                throw Error('therapeuticDocumentId and shareToUserId must be defined')

            const t = await PhysicianProvidedTherapeuticResource.findByPk(therapeuticDocumentId);
            if (!t) throw Error("could not find the therapeutic resource")

            const u = await User.findByPk(shareToUserId);
            if (!u) throw Error("could not find the user")

            const added = await t.addUser(u);
            if (!added) throw Error("could not add")

            res.send(added);

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