const { Profile, RC, User, enums, SupportGroup, SupportGroupMember, PhysicianProvidedTherapeuticResource, Task, PhysicianProvidedTherapeuticResourceShare, MoodQuestionAnswer, Event, SoberStory } = require('../../db/models');
const { isUndefined } = require('../../utils/utils');

const setupCareTakerRoutes = (app) => {
    /**
     * CARE_TAKER  
     */


    app.post('/caretaker/events', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
        } = req.body;

        try {
            if (userType !== enums.User.SOBER_PATIENT) throw Error("you don't have the required permission to access this endpoint");
            const [s] = await SoberStory.findOrCreate({
                where: {
                    id,
                }, defaults: {
                    title,
                    content,
                    datePosted
                }
            });

            s.title = title;
            s.content = content;
            s.isActive = isActive;
            s.RCId = userRCId;

            if (isAnonymous) {
                s.postedById = null
            } else {
                s.postedById = userId
            }

            await s.save()

            res.send(s);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.get('/caretaker', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;
        const {
        } = req.body;

        try {
            if (userType !== enums.User.RC_MANAGER) throw Error("you don't have the required permission to access this endpoint");

            const users = await User.findAll({
                where: {
                    RCId: userRCId,
                    type: enums.User.CARETAKER,
                },
                include: [Profile]
            });

            res.send(users);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });

    app.post('/caretaker/getPatient', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
        } = req.body;

        try {
            if (userType !== enums.User.CARETAKER) throw Error("you don't have the required permission to access this endpoint");

            const u = await User.findAll({
                plain: true,
                where: {
                    caretakerId: userId
                },

                include: [
                    { model: Profile },
                    { model: User, as: 'sponsor', include: [Profile] },
                    { model: User, as: 'physician', include: [Profile] },
                ]
            });

            res.send(u);

        } catch (ex) {
            console.error(ex)
            res.status(500).send({
                error: ex.message
            });
        }
    });
}

module.exports = {
    setupCareTakerRoutes
}