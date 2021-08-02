const express = require('express')
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const cors = require('cors');
const multer = require('multer')
const cloudinary = require('cloudinary').v2;
const { Profile, User, Message, enums, SupportGroupMember, } = require('./db/models');
const { JWT_SECRET } = require('./env/env');
const { setupRCManagerRoutes } = require('./routes/rcmanager/rcmanager');
const { setupSystemAdminRoutes } = require('./routes/systemadmin/systemadmin');
const { setupPhysicianRoutes } = require('./routes/physician/physician');
const { sha256, isUndefined } = require('./utils/utils');
const { setupActivePatientRoutes } = require('./routes/activepatient/activepatient');
const { setupSoberPatientRoutes } = require('./routes/soberpatient/soberpatient');
const { setupCareTakerRoutes } = require('./routes/caretaker/caretaker');
const { iLIKE } = require('./db/con');

cloudinary.config({
  cloud_name: 'dfifwdmr9',
  api_key: '158848835582553',
  api_secret: 'mh98mgs9xddxvzZl_Z6OTMzStFk'
});

const cloudinaryUpload = (fileBuffer) => new Promise((resolve, reject) => {
  cloudinary.uploader.upload_stream((err, res) => {
    if (err) reject(err);
    else resolve(res);
  }).end(fileBuffer);
})

const app = express()
const port = process.env.PORT || 3000
const upload = multer({})

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/login', async (req, res) => {
  const { email = "", password = "" } = req.body;
  const hashedPassword = sha256(password);

  try {
    const p = await Profile.findOne({
      where: {
        email: iLIKE('email', email),
        password: hashedPassword
      }
    });

    if (p === null) throw Error('invalid email/password');

    const u = await p.getUser();

    const jsonTokenData = {
      profileId: p.id,
      userId: u.id,
      userRCId: u.RCId,
      userType: u.type,
    }

    const token = jwt.sign(jsonTokenData, JWT_SECRET, {
      expiresIn: 360 * 24 * 60 * 60 /* Expire in 360 days */
    });

    res.send({ token, userInfo: u })

  } catch (ex) {
    console.error(ex)
    res.status(500).send({
      error: ex.message
    });
  }
})

app.use((req, res, next) => {
  try {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send({ error: 'no token provided' });

    const bearerToken = token.split(" ")[1];
    if (!bearerToken) return res.status(401).send({ error: 'invalid authorization header value' });

    jwt.verify(bearerToken, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(500).send({ error: 'failed to authenticate token.' });

      req.decodedJwtObj = decoded

      next();
    });
  } catch (ex) {
    console.error(ex)
    res.status(500).send({
      error: ex.message
    });
  }
});

app.post('/me', async (req, res) => {
  const { userId, profileId, userRCId, userType } = req.decodedJwtObj;
  try {

    const u = await User.findByPk(userId, {
      include: [
        { model: User, as: 'sponsor', include: [Profile] },
        { model: User, as: 'physician', include: [Profile] },
        { model: User, as: 'caretaker', include: [Profile] },
      ]
    })
    const p = await Profile.findByPk(profileId)

    res.send({
      user: u,
      profile: p
    });
  } catch (ex) {
    console.error(ex)
    res.status(500).send({
      error: ex.message
    });
  }
});

app.post('/profile/update', async (req, res) => {
  const { profileId, userId, userRCId, userType } = req.decodedJwtObj;
  const {
    name = "",
    email = "",
    password = "",
    phoneNumber = "",

    isActive = false,
    wantsToSponsor = false,
    isPublic = false
  } = req.body;
  const hashedPassword = sha256(password);

  try {

    const p = await Profile.findByPk(profileId);

    p.name = name;
    p.email = email;
    if (password.length !== 0) {
      p.password = hashedPassword;
    }
    p.phoneNumber = phoneNumber;

    const u = await User.findByPk(userId);

    u.isActive = isActive;
    u.wantsToSponsor = wantsToSponsor;
    u.isPublic = isPublic;

    await u.save();
    await p.save();

    res.send({
      profile: p,
      user: u
    });

  } catch (ex) {
    console.error(ex)
    res.status(500).send({
      error: ex.message
    });
  }
});

app.get('/profile/:userId', async (req, res) => {
  const { profileId, userId, userRCId, userType } = req.decodedJwtObj;
  const {
  } = req.body;

  try {
    const uId = req.params.userId
    const u = await User.findByPk(uId, {
      include: [Profile,
        { model: User, as: 'sponsor', include: [Profile] },
        { model: User, as: 'physician', include: [Profile] },
        { model: User, as: 'caretaker', include: [Profile] },
      ]
    });

    if (!u) throw Error("user doesn't exist")
    res.send({
      user: u
    });

  } catch (ex) {
    console.error(ex)
    res.status(500).send({
      error: ex.message
    });
  }
});

app.post('/messages/create', async (req, res) => {
  const { profileId, userId, userRCId, userType } = req.decodedJwtObj;
  const {
    content,
    toUserId,
    toSupportGroupId,
  } = req.body;

  try {

    if (isUndefined(content)) throw Error("content should not be undefined");
    if (isUndefined(toUserId) && isUndefined(toSupportGroupId)) throw Error("toUserId or toSupportGroupId should be defined");

    const m = await Message.create({
      fromId: userId,
      content,
      date: new Date(),
      imageUrl: ""
    });

    if (!isUndefined(toUserId)) {
      m.toUserId = toUserId
    } else {
      m.toSupportGroupId = toSupportGroupId
    }

    await m.save();

    res.send(m);

  } catch (ex) {
    console.error(ex)
    res.status(500).send({
      error: ex.message
    });
  }
});

app.post('/messages/toggleActivation', async (req, res) => {
  const { profileId, userId, userRCId, userType } = req.decodedJwtObj;
  const {
    messageId,
  } = req.body;

  try {

    if (isUndefined(messageId)) throw Error("messageId should not be undefined");

    const m = await Message.findByPk(messageId)

    if (!m) throw Error("message couldn't be found")

    if (m.toSupportGroupId !== null) {
      const supportGroupAdmin = await SupportGroupMember.findOne({
        where: {
          UserId: userId,
          SupportGroupId: m.toSupportGroupId,
          isAdmin: true
        }
      })

      if (!supportGroupAdmin)
        throw Error("You don't have admin permissions in this support group");
    }

    m.isActive = !m.isActive;

    await m.save();

    res.send(m);

  } catch (ex) {
    console.error(ex)
    res.status(500).send({
      error: ex.message
    });
  }
});


app.post('/messages/listAvailable', async (req, res) => {
  const { profileId, userId, userRCId, userType } = req.decodedJwtObj;
  const {
  } = req.body;

  try {
    let allAvailable = [];

    if (userType === enums.User.PHYSICIAN) {
      // get all users linked to this physician and their caretakers too
      const u = await User.findAll({
        where: {
          physicianId: userId
        },
        include: Profile
      });

      for (const a of u) {
        allAvailable.push(a.toJSON())
      }

      const caretakers = []
      for (const a of u) {
        if (a.caretakerId) {
          a.caretaker = (await User.findByPk(a.caretakerId, { include: Profile })).toJSON()
          caretakers.push(a.caretaker)
        }
      }
      allAvailable = [...allAvailable, ...caretakers]
    }

    if (userType === enums.User.SOBER_PATIENT) {
      const u = await User.findByPk(userId, {
        include: [
          { model: User, as: 'sponsor', include: [Profile] },
          { model: User, as: 'physician', include: [Profile] },
          { model: User, as: 'caretaker', include: [Profile] },
        ]
      });

      const s = await User.findOne({
        where: {
          sponsorId: userId,
        },
        include: [Profile]
      })

      const spg = await u.getSupportGroups()
      if (spg.length !== 0) {
        allAvailable.push({ isSupportGroup: true, ...spg[0].toJSON() })
      }

      if (s) allAvailable.push(s.toJSON())
      if (u.physician) allAvailable.push(u.physician.toJSON())
    }

    for (const a of allAvailable) {
      a.lastMessage = {}

      if (a.isSupportGroup) {
        const lastMessageG = await Message.findOne({
          where: {
            toSupportGroupId: a.id,
            isActive: true,
          },
          order: [['date', 'DESC']],
        });

        if (lastMessageG) {
          a.lastMessage = lastMessageG.toJSON()
        }
        console.log(a,lastMessageG)

      } else {

        const lastMessageR = await Message.findOne({
          where: {
            fromId: a.id,
            toUserId: userId,
            isActive: true,
          },
          order: [['date', 'DESC']],
        });

        const lastMessageS = await Message.findOne({
          where: {
            fromId: userId,
            toUserId: a.id,
            isActive: true,
          },
          order: [['date', 'DESC']],
        });

        if (lastMessageR) {
          a.lastMessage = lastMessageR.toJSON();
        }

        if (lastMessageS) {
          const sj = lastMessageS.toJSON();
          if (!lastMessageR) a.lastMessage = sj

          if (sj.date > a.lastMessage.date) {
            a.lastMessage = sj
          }
        }



      }

    }




    res.send(allAvailable);

  } catch (ex) {
    console.error(ex)
    res.status(500).send({
      error: ex.message
    });
  }
});

app.post('/messages/listThread', async (req, res) => {
  const { profileId, userId, userRCId, userType } = req.decodedJwtObj;
  const {
    withUserId = -1,
    withSupportGroupId = -1
  } = req.body;

  try {
    const lastMessages = await Message.findAll({
      where: {
        [Op.or]: [
          { fromId: withUserId, toUserId: userId },
          { fromId: userId, toUserId: withUserId },
          { toSupportGroupId: withSupportGroupId },
        ],
        isActive: true,
      },
    });

    res.send(lastMessages);

  } catch (ex) {
    console.error(ex)
    res.status(500).send({
      error: ex.message
    });
  }
});

app.post('/upload', upload.single('photo'), async (req, res) => {
  const { profileId, userId, userRCId, userType } = req.decodedJwtObj;
  const {
    toUserId,
    toSupportGroupId,
    setAsProfilePicture,
  } = req.body;
  const file = req.file;

  try {

    if (!setAsProfilePicture &&
      (isUndefined(toSupportGroupId) && isUndefined(toUserId)))
      throw Error("either toSupportGroupId or toUserId must be defined");

    const uploaded = await cloudinaryUpload(file.buffer);
    const uploadedUrl = uploaded.secure_url;

    if (setAsProfilePicture) {
      const p = await Profile.findByPk(profileId);
      p.profilePictureUrl = uploadedUrl;
      await p.save();

    } else {
      const m = await Message.create({
        fromId: userId,
        imageUrl: uploadedUrl,
        content: file.originalname,
        date: new Date()
      });

      if (!isUndefined(toUserId)) {
        m.toUserId = toUserId
      } else {
        m.toSupportGroupId = toSupportGroupId
      }

      await m.save();
    }

    res.send({ uploadedUrl: uploadedUrl });

  } catch (ex) {
    console.error(ex)
    res.status(500).send({
      error: ex.message
    });
  }
})

setupSystemAdminRoutes(app)
setupRCManagerRoutes(app)
setupPhysicianRoutes(app)
setupActivePatientRoutes(app)
setupSoberPatientRoutes(app)
setupCareTakerRoutes(app)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})