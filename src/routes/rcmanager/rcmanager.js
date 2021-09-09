const { Profile, User, enums, Event, SoberStory } = require('../../db/models');
const { sha256, isUndefined, generateRandomPassword } = require('../../utils/utils')

const setupRCManagerRoutes = (app) => {
    /**
     * RC_MANAGER
     */

    app.post('/physician/create', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;
        const {
            physicianEmail = "",
        } = req.body;

        try {
            if (userType !== enums.User.RC_MANAGER) throw Error("you don't have the required permission to access this endpoint");

            const defaultPassword = generateRandomPassword()
            const [p] = await Profile.findOrCreate({
                where: {
                    email: physicianEmail,
                },
                defaults: {
                    name: "",
                    password: sha256(defaultPassword),
                    defaultPassword,
                    ...req.body,
                }
            });

            if (await p.getUser() !== null) throw Error("this email has already been used")

            const u = await User.create({
                type: enums.User.PHYSICIAN,

            });

            p.setUser(u);
            u.RCId = userRCId;

            await p.save();
            await u.save();

            res.send({
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

    app.post('/physician/toggleActivation', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;
        const {
            physicianEmail = "",
        } = req.body;

        try {
            if (userType !== enums.User.RC_MANAGER) throw Error("you don't have the required permission to access this endpoint");

            const p = await Profile.findOne({
                where: {
                    email: physicianEmail,
                }
            });

            if (!p) throw Error("physician not found");

            const u = await p.getUser()
            u.isActive = !u.isActive

            await u.save();

            res.send(u);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/physician/reset', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;
        const {
            physicianEmail = "",
        } = req.body;

        try {
            if (userType !== enums.User.RC_MANAGER) throw Error("you don't have the required permission to access this endpoint");

            const p = await Profile.findOne({
                where: {
                    email: physicianEmail,
                }
            });

            if (!p) throw Error("physician not found");

            p.password = sha256(p.defaultPassword)

            await p.save();

            res.send(p);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.get('/physician', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;
        const {
        } = req.body;

        try {
            if (userType !== enums.User.RC_MANAGER) throw Error("you don't have the required permission to access this endpoint");

            const users = await User.findAll({
                where: {
                    RCId: userRCId,
                    type: enums.User.PHYSICIAN,
                },
            });

            const userProfiles = []
            for (const u of users) {
                const uu = u.toJSON()
                const p = await Profile.findOne({
                    where: {
                        UserId: u.id
                    }
                })
                uu.profile = p.toJSON();
                userProfiles.push(uu)
            }

            res.send(userProfiles);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/patient/create', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;
        const {
            activePatientEmail = "",
        } = req.body;

        try {
            if (userType !== enums.User.RC_MANAGER) throw Error("you don't have the required permission to access this endpoint");

            const defaultPassword = generateRandomPassword()
            const [p] = await Profile.findOrCreate({
                where: {
                    email: activePatientEmail,
                },
                defaults: {
                    name: "",
                    password: sha256(defaultPassword),
                    defaultPassword,
                    ...req.body,
                }
            });

            if (await p.getUser() !== null) throw Error("this email has already been used")

            const u = await User.create({
                type: enums.User.ACTIVE_PATIENT,

            });

            p.setUser(u);
            u.RCId = userRCId;

            await p.save();
            await u.save();

            res.send({
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

    app.post('/patient/toggleActivation', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;
        const {
            patientEmail = "",
        } = req.body;

        try {
            if (userType !== enums.User.RC_MANAGER) throw Error("you don't have the required permission to access this endpoint");

            const p = await Profile.findOne({
                where: {
                    email: patientEmail,
                }
            });

            if (!p) throw Error("patient not found");

            const u = await p.getUser()
            u.isActive = !u.isActive

            await u.save();

            res.send(u);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/patient/reset', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;
        const {
            patientEmail = "",
        } = req.body;

        try {
            if (userType !== enums.User.RC_MANAGER) throw Error("you don't have the required permission to access this endpoint");

            const p = await Profile.findOne({
                where: {
                    email: patientEmail,
                }
            });

            if (!p) throw Error("patient not found");

            p.password = sha256(p.defaultPassword)

            await p.save();

            res.send(p);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/caretaker/create', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;
        const {
            caretakerEmail = "",
        } = req.body;

        try {
            if (userType !== enums.User.RC_MANAGER) throw Error("you don't have the required permission to access this endpoint");

            const defaultPassword = generateRandomPassword()
            const [p] = await Profile.findOrCreate({
                where: {
                    email: caretakerEmail,
                },
                defaults: {
                    name: "",
                    password: sha256(defaultPassword),
                    defaultPassword,
                    ...req.body,
                }
            });

            if (await p.getUser() !== null) throw Error("this email has already been used")

            const u = await User.create({
                type: enums.User.CARETAKER,
            });

            p.setUser(u);
            u.RCId = userRCId;

            await p.save();
            await u.save();

            res.send({
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

    app.post('/caretaker/toggleActivation', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;
        const {
            caretakerEmail = "",
        } = req.body;

        try {
            if (userType !== enums.User.RC_MANAGER) throw Error("you don't have the required permission to access this endpoint");

            const p = await Profile.findOne({
                where: {
                    email: caretakerEmail,
                }
            });

            if (!p) throw Error("patient not found");

            const u = await p.getUser()
            u.isActive = !u.isActive

            await u.save();

            res.send(u);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/caretaker/reset', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;
        const {
            caretakerEmail = "",
        } = req.body;

        try {
            if (userType !== enums.User.RC_MANAGER) throw Error("you don't have the required permission to access this endpoint");

            const p = await Profile.findOne({
                where: {
                    email: caretakerEmail,
                }
            });

            if (!p) throw Error("patient not found");

            p.password = sha256(p.defaultPassword)

            await p.save();

            res.send(p);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/events/createOrUpdate', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;
        const {
            id = -1,
            supportGroupId,
            name,
            description = "",
            startTime,
            endTime,
            isActive
        } = req.body;

        try {
            if (
                userType !== enums.User.RC_MANAGER
                && userType !== enums.User.PHYSICIAN
            )
                throw Error("you don't have the required permission to access this endpoint");

            if (userType === enums.User.PHYSICIAN && isUndefined(supportGroupId))
                throw Error('supportGroupId is required for physician')

            const [e] = await Event.findOrCreate({
                where: {
                    id,
                },
                defaults: {
                    id: null,
                    name,
                    description,
                    startTime,
                    endTime,
                    RCId: userRCId,
                }
            })

            e.name = name
            e.description = description
            e.startTime = startTime
            e.endTime = endTime
            e.isActive = isActive
            e.RCId = userRCId

            if (userType === enums.User.PHYSICIAN) {
                e.SupportGroupId = supportGroupId;
            }

            await e.save();

            res.send(e);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/patient/linkPhysician', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;
        const {
            physicianEmail = "",
            patientEmail = "",
        } = req.body;

        try {
            if (
                userType !== enums.User.RC_MANAGER
            )
                throw Error("you don't have the required permission to access this endpoint");

            const physician = await Profile.findOne({
                where: {
                    email: physicianEmail
                },
                include: User
            })

            if (!physician) throw Error('cant find physician with this email')

            const patient = await Profile.findOne({
                where: {
                    email: patientEmail
                },
                include: User
            })

            if (!patient) throw Error('cant find patient with this email')

            const pa = patient.User;
            pa.physicianId = physician.User.id

            await pa.save();

            res.send(patient);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/soberStories/toggleApproval', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;
        const {
            id = -1,
        } = req.body;

        try {
            if (userType !== enums.User.RC_MANAGER) throw Error("you don't have the required permission to access this endpoint");

            const ss = await SoberStory.findByPk(id);

            if (!ss) throw Error("could not find this sober story")

            ss.isApproved = !ss.isApproved;

            await ss.save()

            res.send(ss);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });
}


module.exports = {
    setupRCManagerRoutes
}