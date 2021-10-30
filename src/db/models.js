const { DataTypes } = require('sequelize');
const { sequelize } = require('./util');

const Profile = sequelize.define('Profile', {
    name: { type: DataTypes.TEXT, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    defaultPassword: { type: DataTypes.TEXT, allowNull: false, },
    password: { type: DataTypes.TEXT, allowNull: false, },

    gender: { type: DataTypes.TEXT, defaultValue: "" },
    addictionType: { type: DataTypes.TEXT, defaultValue: "" },
    phoneNumber: { type: DataTypes.TEXT, defaultValue: "" },
    profilePictureUrl: { type: DataTypes.TEXT, defaultValue: "" },
});

const RC = sequelize.define('RC', {
    name: { type: DataTypes.STRING, allowNull: false, unique: true },

    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
});

const User = sequelize.define('User', {
    type: { type: DataTypes.TEXT, allowNull: false },

    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    wantsToSponsor: { type: DataTypes.BOOLEAN, defaultValue: false },
    isPublic: { type: DataTypes.BOOLEAN, defaultValue: false },
    dateLastSober: { type: DataTypes.DATE },
    lat: { type: DataTypes.DOUBLE, defaultValue: 0 },
    long: { type: DataTypes.DOUBLE, defaultValue: 0 },
});

const Event = sequelize.define('Event', {
    name: { type: DataTypes.TEXT, allowNull: false },
    startTime: { type: DataTypes.DATE, allowNull: false },
    endTime: { type: DataTypes.DATE, allowNull: false },

    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    description: { type: DataTypes.TEXT, defaultValue: "" },
});

const Task = sequelize.define('Task', {
    name: { type: DataTypes.TEXT, allowNull: false },
    dateCreated: { type: DataTypes.DATE, allowNull: false },

    isCompleted: { type: DataTypes.BOOLEAN, defaultValue: false },
});

const SupportGroup = sequelize.define('SupportGroup', {
    name: { type: DataTypes.STRING, allowNull: false },
    dateCreated: { type: DataTypes.DATE, allowNull: false },

});

const Message = sequelize.define('Message', {
    content: { type: DataTypes.TEXT, allowNull: false },
    date: { type: DataTypes.DATE, allowNull: false },

    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    imageUrl: { type: DataTypes.TEXT, defaultValue: true },
});

const MoodQuestionAnswer = sequelize.define('MoodQuestionAnswer', {
    dateAnswered: { type: DataTypes.DATE, allowNull: false },
    rating: { type: DataTypes.INTEGER, allowNull: false },

    comment: { type: DataTypes.TEXT, defaultValue: "" },
});

const PhysicianProvidedTherapeuticResource = sequelize.define('PhysicianProvidedTherapeuticResource', {
    title: { type: DataTypes.TEXT, allowNull: false },
    datePosted: { type: DataTypes.DATE, allowNull: false },
    type: { type: DataTypes.TEXT, allowNull: false },
    url: { type: DataTypes.TEXT, allowNull: false },

    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
});

const SoberStory = sequelize.define('SoberStory', {
    title: { type: DataTypes.TEXT, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    datePosted: { type: DataTypes.DATE, allowNull: false },

    isApproved: { type: DataTypes.BOOLEAN, defaultValue: false },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
});

const SupportGroupMember = sequelize.define('SupportGroupMember', {
    isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
});

const PhysicianProvidedTherapeuticResourceShare = sequelize.define('PhysicianProvidedTherapeuticResourceShare', {});


/*
    Associations
*/
User.hasOne(Profile);
Profile.belongsTo(User);

User.belongsTo(RC);
User.belongsTo(User, { as: 'caretaker' });

Event.belongsTo(SupportGroup);
Event.belongsTo(RC);

Task.belongsTo(User);

SupportGroup.belongsTo(User, { as: 'owner' });
SupportGroup.belongsToMany(User, { through: SupportGroupMember });
User.belongsToMany(SupportGroup, { through: SupportGroupMember });

User.belongsTo(User, { as: 'physician' });
User.belongsTo(User, { as: 'sponsor' });

Message.belongsTo(User, { as: 'from' });
Message.belongsTo(User, { as: 'toUser' });
Message.belongsTo(SupportGroup, { as: 'toSupportGroup' });

MoodQuestionAnswer.belongsTo(User);

PhysicianProvidedTherapeuticResource.belongsTo(User, { as: 'owner' });
PhysicianProvidedTherapeuticResource.belongsToMany(User, { through: PhysicianProvidedTherapeuticResourceShare });
User.belongsToMany(PhysicianProvidedTherapeuticResource, { through: PhysicianProvidedTherapeuticResourceShare });


SoberStory.belongsTo(User, { as: 'postedBy' });
SoberStory.belongsTo(RC);

module.exports = {
    enums: {
        User: { SYSTEM_ADMIN: "SYSTEM_ADMIN", RC_MANAGER: "RC_MANAGER", PHYSICIAN: "PHYSICIAN", ACTIVE_PATIENT: "ACTIVE_PATIENT", SOBER_PATIENT: "SOBER_PATIENT", CARETAKER: "CARETAKER" },
        PhysicianProvidedTherapeuticResource: { DOC: "DOC", VIDEO: "VIDEO", BLOG: "BLOG" }
    },
    Profile,
    RC,
    User,
    Event,
    Task,
    SupportGroup,
    Message,
    MoodQuestionAnswer,
    PhysicianProvidedTherapeuticResource,
    SoberStory,
    SupportGroupMember,
    PhysicianProvidedTherapeuticResourceShare,
}