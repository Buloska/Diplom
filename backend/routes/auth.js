const express = require('express');
const bcrypt = require('bcrypt');
const {User} = require('../models/user');
const { register, login } = require('../controllers/authController');


const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

   
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Такой email уже зарегистрирован' });
    }

  
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

 
    const newUser = await User.create({
      fullName,
      email,
      passwordHash: hash,
    });

    res.status(201).json({ message: 'Пользователь создан', user: { id: newUser.id, fullName: newUser.fullName } });
  } catch (err) {
    console.error('Ошибка регистрации:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

const jwt = require('jsonwebtoken');



router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Пользователь не найден' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный пароль' });
    }

    const token = jwt.sign(
      { id: user.id, fullName: user.fullName },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Вход выполнен',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (err) {
    console.error('Ошибка входа:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});




module.exports = router;
