const { Profile, User, enums, Event } = require('../../db/models');
const { sha256 } = require('../../utils/utils')

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
            if (userType !== enums.User.RC_MANAGER) throw Error("you are not an rc manager, you cant access this endpoint");

            const [p] = await Profile.findOrCreate({
                where: {
                    email: physicianEmail,
                },
                defaults: {
                    name: "",
                    password: sha256("")
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
                profile: p.toJSON(),
                user: u.toJSON(),
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
            if (userType !== enums.User.RC_MANAGER) throw Error("you are not an rc manager, you cant access this endpoint");

            const p = await Profile.findOne({
                where: {
                    email: physicianEmail,
                }
            });

            if (!p) throw Error("physician not found");

            const u = await p.getUser()
            u.isActive = !u.isActive

            await u.save();

            res.send(u.toJSON());

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
            if (userType !== enums.User.RC_MANAGER) throw Error("you are not an rc manager, you cant access this endpoint");

            const p = await Profile.findOne({
                where: {
                    email: physicianEmail,
                }
            });

            if (!p) throw Error("physician not found");

            p.password = sha256("")

            await p.save();

            res.send(p.toJSON());

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
            if (userType !== enums.User.RC_MANAGER) throw Error("you are not an rc manager, you cant access this endpoint");

            const [p] = await Profile.findOrCreate({
                where: {
                    email: activePatientEmail,
                },
                defaults: {
                    name: "",
                    password: sha256("")
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
                profile: p.toJSON(),
                user: u.toJSON(),
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
            if (userType !== enums.User.RC_MANAGER) throw Error("you are not an rc manager, you cant access this endpoint");

            const p = await Profile.findOne({
                where: {
                    email: patientEmail,
                }
            });

            if (!p) throw Error("patient not found");

            const u = await p.getUser()
            u.isActive = !u.isActive

            await u.save();

            res.send(u.toJSON());

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
            if (userType !== enums.User.RC_MANAGER) throw Error("you are not an rc manager, you cant access this endpoint");

            const p = await Profile.findOne({
                where: {
                    email: patientEmail,
                }
            });

            if (!p) throw Error("patient not found");

            p.password = sha256("")

            await p.save();

            res.send(p.toJSON());

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
            if (userType !== enums.User.RC_MANAGER) throw Error("you are not an rc manager, you cant access this endpoint");

            const [p] = await Profile.findOrCreate({
                where: {
                    email: caretakerEmail,
                },
                defaults: {
                    name: "",
                    password: sha256("")
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
                profile: p.toJSON(),
                user: u.toJSON(),
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
            if (userType !== enums.User.RC_MANAGER) throw Error("you are not an rc manager, you cant access this endpoint");

            const p = await Profile.findOne({
                where: {
                    email: caretakerEmail,
                }
            });

            if (!p) throw Error("patient not found");

            const u = await p.getUser()
            u.isActive = !u.isActive

            await u.save();

            res.send(u.toJSON());

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
            if (userType !== enums.User.RC_MANAGER) throw Error("you are not an rc manager, you cant access this endpoint");

            const p = await Profile.findOne({
                where: {
                    email: caretakerEmail,
                }
            });

            if (!p) throw Error("patient not found");

            p.password = sha256("")

            await p.save();

            res.send(p.toJSON());

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
            id = "",
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
                throw Error("you are not an rc manager or physician, you cant access this endpoint");

            const [e] = await Event.findOrCreate({
                where: {
                    id,
                },
                defaults: {
                    name,
                    description,
                    startTime,
                    endTime
                }
            })

            e.name = name
            e.description = description
            e.startTime = startTime
            e.endTime = endTime
            e.isActive = isActive

            if (userType === enums.User.PHYSICIAN) {
                if (!supportGroupId) throw Error("supportGroupId is required")
                e.SupportGroupId = supportGroupId;
            }

            await e.save();

            res.send(e.toJSON());

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/patient/link', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;
        const {
            physicianEmail = "",
            patientEmail = "",
        } = req.body;

        try {
            if (
                userType !== enums.User.RC_MANAGER
            )
                throw Error("you are not an rc manager, you cant access this endpoint");

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

            res.send(patient.toJSON());

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