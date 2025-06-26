const { ProjectMember, User } = require('../config/db');

// Добавление участника
const addMember = async (req, res) => {
  const { projectId } = req.params;
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Пользователь с таким email не найден' });
    }

    const exists = await ProjectMember.findOne({
      where: { projectId, userId: user.id }
    });

    if (exists) {
      return res.status(400).json({ message: 'Пользователь уже в проекте' });
    }

    const newMember = await ProjectMember.create({
      projectId,
      userId: user.id,
      role: 'member'
    });

    res.status(201).json({ message: 'Участник добавлен', member: newMember });
  } catch (err) {
    console.error('Ошибка при добавлении участника:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Удаление участника
const removeMember = async (req, res) => {
  const { projectId, userId } = req.params;

  try {
    const deleted = await ProjectMember.destroy({
      where: { projectId, userId }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Участник не найден' });
    }

    res.json({ message: 'Участник удалён' });
  } catch (err) {
    console.error('Ошибка при удалении участника:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Обновление роли
const updateMemberRole = async (req, res) => {
  const { projectId, userId } = req.params;
  const { role } = req.body;

  try {
    const member = await ProjectMember.findOne({
      where: { projectId, userId }
    });

    if (!member) {
      return res.status(404).json({ message: 'Участник не найден' });
    }

    member.role = role;
    await member.save();

    res.json({ message: 'Роль обновлена', member });
  } catch (err) {
    console.error('Ошибка при обновлении роли:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

// Получение участников проекта
const getProjectMembers = async (req, res) => {
  const { projectId } = req.params;

  try {
    const members = await ProjectMember.findAll({
      where: { projectId },
      include: [{
        model: User,
        attributes: ['id', 'fullName', 'email']  // <-- ВАЖНО! Это даёт имя и email
      }]
    });

    res.json(members);
  } catch (err) {
    console.error('Ошибка при получении участников:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  addMember,
  removeMember,
  updateMemberRole,
  getProjectMembers
};
