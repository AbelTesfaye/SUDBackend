const express = require('express')
const jwt = require('jsonwebtoken');
const { Profile, User, } = require('./db/models');
const { JWT_SECRET } = require('./env/env');
const { setupRCManagerRoutes } = require('./routes/rcmanager/rcmanager');
const { setupSystemAdminRoutes } = require('./routes/systemadmin/systemadmin');
const { sha256 } = require('./utils/utils')
const cors = require('cors')

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

    res.send({ token })

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

    res.send(p.toJSON());

  } catch (ex) {
    console.error(ex)
    res.status(500).send({
      error: ex.message
    });
  }
});


setupSystemAdminRoutes(app)
setupRCManagerRoutes(app)


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})