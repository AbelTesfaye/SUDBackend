const { Profile, RC, User, enums, SupportGroup, SupportGroupMember, PhysicianProvidedTherapeuticResource, Task, PhysicianProvidedTherapeuticResourceShare, MoodQuestionAnswer, Event, SoberStory } = require('../../db/models');
const { isUndefined } = require('../../utils/utils');

const setupSoberPatientRoutes = (app) => {
    /**
     * SOBER_PATIENT  
     */


    app.post('/soberStories/createOrUpdate', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
            id = -1,
            isAnonymous = false,
            title,
            content,
            isActive = true,
            datePosted = new Date()
        } = req.body;

        try {
            if (userType !== enums.User.SOBER_PATIENT) throw Error("you don't have the required permission to access this endpoint");
            const [s] = await SoberStory.findOrCreate({
                where: {
                    id,
                }, defaults: {
                    id: null,
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

    app.post('/location/publish', async (req, res) => {
        const { profileId, userId, userRCId, userType } = req.decodedJwtObj;

        const {
            lat = 0,
            long = 0,
        } = req.body;

        try {
            if (userType !== enums.User.SOBER_PATIENT) throw Error("you don't have the required permission to access this endpoint");
            const u = await User.findByPk(userId);
            u.lat = lat;
            u.long = long;
            await u.save();

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
    setupSoberPatientRoutes
}