const express = require('express')
var jwt = require('jsonwebtoken');
const { Profile, RC, User } = require('./db/models');
const { JWT_SECRET } = require('./env/env');
const { sha256 } = require('./utils/utils')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/login', async (req, res) => {
  const { email = "", password = "" } = req.body
  const hashedPassword = sha256(password);

  try {
    const p = await Profile.findOne({
      where: {
        email,
        password: hashedPassword
      },
      include: User
    });

    if (p === null) throw Error('invalid email/password');

    const jsonTokenData = p.toJSON();

    console.log(jsonTokenData)

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

      req.jwt = decoded

      next();
    });
  } catch (ex) {
    console.error(ex)
    res.status(500).send({
      error: ex.message
    });
  }
});

app.post('/me', (req, res) => {
  res.send(req.jwt);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})