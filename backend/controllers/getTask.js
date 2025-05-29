const getTasks = async (req, res) => {
    try {
      const userId = req.user.id;
      const { status } = req.query;
  
      const where = { userId };
      if (status) {
        where.status = status; 
      }
  
      const tasks = await Task.findAll({ where });
      res.json(tasks);
    } catch (err) {
      console.error('Ошибка при получении задач:', err);
      res.status(500).json({ message: 'Ошибка сервера при получении задач' });
    }
  };
  