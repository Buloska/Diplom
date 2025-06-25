const { Project, ProjectMember } = require('../config/db');
const { Op } = require('sequelize');

const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    const ownerId = req.user.id;

    const project = await Project.create({ name, description, ownerId });

    // ✅ Добавляем создателя как owner в ProjectMembers
    await ProjectMember.create({
      projectId: project.id,
      userId: ownerId,
      role: 'owner'
    });

    res.status(201).json(project);
  } catch (err) {
    console.error('Ошибка при создании проекта:', err);
    res.status(500).json({ message: 'Ошибка при создании проекта' });
  }
};

const getProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Текущий пользователь:', req.user);

    // Находим все projectId, где пользователь участник
    const memberRecords = await ProjectMember.findAll({
      where: { userId },
      attributes: ['projectId']
    });

    const projectIds = memberRecords.map(pm => pm.projectId);

    const projects = await Project.findAll({
      where: {
        id: { [Op.in]: projectIds }
      }
    });

    res.json(projects);
  } catch (err) {
    console.error('Ошибка при получении проектов:', err);
    res.status(500).json({ message: 'Ошибка при получении проектов' });
  }
};

const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    project.name = name || project.name;
    project.description = description || project.description;

    await project.save();
    res.json({ message: 'Проект обновлён', project });
  } catch (err) {
    console.error('Ошибка при обновлении проекта:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const deleteProject = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    await project.destroy();
    res.json({ message: 'Проект удалён' });
  } catch (err) {
    console.error('Ошибка при удалении проекта:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

const getProjectById = async (req, res) => {
  const projectId = req.params.id;
  try {
    const userId = req.user.id;

    const project = await Project.findByPk(projectId, {
      include: [
        {
          model: ProjectMember,
          as: 'members'
        }
      ]
    });

    if (!project) {
      return res.status(404).json({ message: 'Проект не найден' });
    }

    const isOwner = project.ownerId === userId;
    const isMember = project.members.some(m => m.userId === userId);

    if (!isOwner && !isMember) {
      return res.status(403).json({ message: 'Нет доступа к проекту' });
    }

    res.json(project);
  } catch (err) {
    console.error('Ошибка при получении проекта:', err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  getProjectById
};
