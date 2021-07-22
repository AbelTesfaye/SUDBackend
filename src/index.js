const express = require('express')
const jwt = require('jsonwebtoken');
const { Profile, User, Message, } = require('./db/models');
const { JWT_SECRET } = require('./env/env');
const cors = require('cors');
const { setupRCManagerRoutes } = require('./routes/rcmanager/rcmanager');
const { setupSystemAdminRoutes } = require('./routes/systemadmin/systemadmin');
const { setupPhysicianRoutes } = require('./routes/physician/physician');
const { sha256, isUndefined } = require('./utils/utils')

const app = express()
const port = process.env.PORT || 3000

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
        email,
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

    const u = await User.findByPk(userId)
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

    res.send(p);

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

    const from = await User.findByPk(userId);
    const m = await Message.create({
      from,
      content,
      date: new Date(),
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

setupSystemAdminRoutes(app)
setupRCManagerRoutes(app)
setupPhysicianRoutes(app)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})