const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName,
      email,
      passwordHash: hashedPassword,
    });

    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({ message: 'Регистрация успешна', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка регистрации' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ message: 'Неверный пароль' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
  message: 'Вход выполнен',
  token,
  user: {
    id: user.id,
    fullName: user.fullName,
    email: user.email
  }
});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка входа' });
  }
};

module.exports = { register, login };
