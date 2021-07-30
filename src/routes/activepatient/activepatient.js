const { Profile, RC, User, enums, SupportGroup, SupportGroupMember, PhysicianProvidedTherapeuticResource, Task, PhysicianProvidedTherapeuticResourceShare, MoodQuestionAnswer, Event, SoberStory } = require('../../db/models');
const { isUndefined } = require('../../utils/utils');

const setupActivePatientRoutes = (app) => {
    /**
     * ACTIVE_PATIENT  
     */


    app.post('/tasks/createOrUpdate', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
            id = -1,
            name,
            isCompleted,
            dateCreated = new Date()
        } = req.body;

        try {
            if (userType !== enums.User.ACTIVE_PATIENT) throw Error("you don't have the required permission to access this endpoint");
            const [t] = await Task.findOrCreate({
                where: {
                    id
                }, defaults: {
                    id: null,
                    name,
                    isCompleted,
                    UserId: userId,
                    dateCreated
                }
            });

            t.name = name;
            t.isCompleted = isCompleted;
            await t.save()

            res.send(t);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/tasks/delete', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
            id = -1,
        } = req.body;

        try {
            if (userType !== enums.User.ACTIVE_PATIENT) throw Error("you don't have the required permission to access this endpoint");
            const t = await Task.findByPk(id)

            if (!t) throw Error("could not find task")

            await t.destroy()

            res.send(t);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/tasks/list', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
            id = -1,
        } = req.body;

        try {
            let getForUser = userId;

            if (userType === enums.User.CARETAKER) {
                const user = await User.findOne({
                    where: {
                        caretakerId: userId
                    }
                });

                if (!user) throw Error("this caretaker isn't looking after any user")
                getForUser = user.id

            } else if (userType === enums.User.PHYSICIAN) {
                getForUser = id
            }

            const t = await Task.findAll({
                where: {
                    UserId: getForUser
                }
            })

            res.send(t);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/therapeuticDocuments/list', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
        } = req.body;

        try {
            if (userType !== enums.User.ACTIVE_PATIENT && userType !== enums.User.PHYSICIAN) throw Error("you don't have the required permission to access this endpoint");
            const u = await User.findByPk(userId)

            if (!u) throw Error("could not find user")


            let r = [];

            if (userType === enums.User.ACTIVE_PATIENT) {
                r = await u.getPhysicianProvidedTherapeuticResources()
            } else {
                r = await PhysicianProvidedTherapeuticResource.findAll({
                    where: {
                        ownerId: userId
                    }
                })
            }

            res.send(r);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/dailyMoodQuestions/answer', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
            dateAnswered = new Date(),
            rating,
            comment
        } = req.body;

        try {
            if (userType !== enums.User.ACTIVE_PATIENT) throw Error("you don't have the required permission to access this endpoint");
            if (isUndefined(rating) || isUndefined(comment)) throw Error("rating and comment need to be defined");

            const m = await MoodQuestionAnswer.create({
                dateAnswered,
                rating,
                comment,
                UserId: userId
            });

            res.send(m);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/dailyMoodQuestions/list', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
            id = -1
        } = req.body;

        try {
            let getForUser = userId;

            if (userType === enums.User.CARETAKER) {
                const user = await User.findOne({
                    where: {
                        caretakerId: userId
                    }
                });

                if (!user) throw Error("this caretaker isn't looking after any user")
                getForUser = user.id

            } else if (userType === enums.User.PHYSICIAN) {
                getForUser = id
            }

            const d = await MoodQuestionAnswer.findAll({
                where: {
                    UserId: getForUser
                }
            })

            res.send(d);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/events/list', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
        } = req.body;

        try {
            let getForUser = userId;

            if (userType === enums.User.CARETAKER) {
                const user = await User.findOne({
                    where: {
                        caretakerId: userId
                    }
                });

                if (!user) throw Error("this caretaker isn't looking after any user")
                getForUser = user.id
            }

            const rce = await Event.findAll({
                where: {
                    RCId: userRCId,
                    SupportGroupId: null,
                }
            });

            const u = await User.findByPk(getForUser);
            const s = await u.getSupportGroups();
            const supportGroupEvents = [];

            for (const sg of s) {
                const e = await Event.findAll({
                    where:
                    {
                        SupportGroupId: sg.id
                    }
                });

                for (const ee of e) {
                    supportGroupEvents.push(ee)
                }
            }

            res.send({
                rCEvents: rce,
                supportGroupEvents,
            });

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/soberStories/list', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
        } = req.body;

        try {
            const s = await SoberStory.findAll({
                where: {
                    RCId: userRCId
                }
            })

            res.send(s);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/soberPatients/listNearby', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
            lat = 0,
            long = 0,
        } = req.body;

        try {
            const ret = []
            const u = await User.findAll({
                where: {
                    RCId: userRCId,
                    type: enums.User.SOBER_PATIENT,
                    lat: { $between: [lat - 0.5, lat + 0.5] },
                    long: { $between: [long - 0.5, long + 0.5] },
                },
            });

            for (const uu of u) {
                const p = await Profile.findOne({
                    where: {
                        UserId: uu.id
                    }
                });
                uu.Profile = p;
                ret.push({
                    ...uu.toJSON(),
                    profile: p.toJSON()
                })
            }

            res.send(ret);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });
}

module.exports = {
    setupActivePatientRoutes
}