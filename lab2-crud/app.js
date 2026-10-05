const express = require("express");
const fs = require("fs");
const app = express();
const port = 3000;

app.use(express.json());

app.use((req, res, next) => {
  const log = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;

  console.log(log.trim());

  fs.appendFile("access.log", log, (err) => {
    if (err) {
      console.error("Ошибка записи лога:", err);
    }
  });

  next();
});

let courses = [
  {
    id: 1,
    title: "backend-разработка",
    duration: 164,
    level: "beginner",
    price: 90000,
  },
  {
    id: 2,
    title: "frontend-разработка",
    duration: 135,
    level: "beginner",
    price: 120000,
  },
  {
    id: 3,
    title: "мобильная разработка",
    duration: 220,
    level: "advanced",
    price: 150000,
  },
];

let nextId = 4;

app.get("/courses", (req, res) => {
  if (req.query.search) {
    const searchedName = req.query.search.toLowerCase();

    const result = courses.filter((course) =>
      course.title.toLowerCase().includes(searchedName),
    );

    return res.json({
      message: "результаты поиска",
      items: result,
    });
  }

  if (req.query.sort) {
    let result = [...courses];
    const sortField = req.query.sort;
    const order = req.query.order || "asc";

    result.sort((a, b) => {
      if (typeof a[sortField] === "number") {
        return order === "desc"
          ? b[sortField] - a[sortField]
          : a[sortField] - b[sortField];
      }

      return order === "desc"
        ? String(b[sortField]).localeCompare(String(a[sortField]))
        : String(a[sortField]).localeCompare(String(b[sortField]));
    });

    return res.json({
      message: "успешная сортировка",
      items: result,
    });
  }

  if (req.query.page) {
    let result = [...courses];
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || result.length;

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedCourses = result.slice(startIndex, endIndex);

    return res.json({
      page: page,
      limit: limit,
      total: result.length,
      items: paginatedCourses,
    });
  }

  return res.json({
    count: courses.length,
    items: courses,
  });
});

app.get("/courses/stats", (req, res) => {
  const stats = {};

  courses.forEach(course => {
    if (stats[course.level] === undefined) {
      stats[course.level] = 1;
    } else {
      stats[course.level]++;
    }
  });

  res.json(stats);
});

app.get("/courses/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const item = courses.find((i) => i.id === id);

  if (!item) {
    return res.status(404).json({ error: "Такого курса не существует" });
  }

  res.json(item);
});

app.get("/courses/:id/related", (req, res) => {
  const id = parseInt(req.params.id);
  const item = courses.find((i) => i.id === id);

  if (!item) {
    return res.status(404).json({ error: "Такого курса не существует" });
  }

  const level = item.level;

  const relatedCourses = courses.filter((i) => {
    return i.level === level && i.id !== id;
  });

  res.json({
    related_count: relatedCourses.length,
    related: relatedCourses,
  });
});

app.post("/courses", (req, res) => {
  const { title, duration, level, price } = req.body;

  if (!title || duration === undefined || !level || price === undefined) {
    return res.status(400).json({ error: "Обязательные поля не заполнены" });
  }

  if (
    typeof title !== "string" ||
    Number.isFinite(duration) === false ||
    duration <= 0 ||
    typeof level !== "string" ||
    Number.isFinite(price) === false ||
    price <= 0
  ) {
    return res
      .status(400)
      .json({ error: "Неверный тип данных или недопустимый диапазон данных" });
  }

  const newItem = { id: nextId++, title, duration, level, price };
  courses.push(newItem);

  res.status(201).json(newItem);
});

app.post("/courses/bulk", (req, res) => {
  if (!Array.isArray(req.body)) {
    return res.status(400).json({
      error: "Ожидается массив объектов",
    });
  }

  const newCourses = [];

  for (let i = 0; i < req.body.length; i++) {
    const { title, duration, level, price } = req.body[i];

    if (!title || duration === undefined || !level || price === undefined) {
      return res.status(400).json({ error: "Обязательные поля не заполнены" });
    }

    if (
      typeof title !== "string" ||
      Number.isFinite(duration) === false ||
      duration <= 0 ||
      typeof level !== "string" ||
      Number.isFinite(price) === false ||
      price <= 0
    ) {
      return res
        .status(400)
        .json({
          error: "Неверный тип данных или недопустимый диапазон данных",
        });
    }

    const newItem = { id: nextId++, title, duration, level, price };
    newCourses.push(newItem);
  }

  courses.push(...newCourses);

  res.status(201).json(newCourses);
});

app.put("/courses/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = courses.findIndex((i) => i.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Такого курса не существует" });
  }

  const { title, duration, level, price } = req.body;

  if (!title || duration === undefined || !level || price === undefined) {
    return res.status(400).json({ error: "Обязательные поля не заполнены" });
  }

  if (
    typeof title !== "string" ||
    Number.isFinite(duration) === false ||
    duration <= 0 ||
    typeof level !== "string" ||
    Number.isFinite(price) === false ||
    price <= 0
  ) {
    return res
      .status(400)
      .json({ error: "Неверный тип данных или недопустимый диапазон данных" });
  }

  courses[index] = {
    id,
    title,
    duration,
    level,
    price,
  };

  res.status(200).json(courses[index]);
});

app.patch("/courses/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = courses.findIndex((i) => i.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Такого курса не существует" });
  }

  const { title, duration, level, price } = req.body;

  if (
    (title !== undefined && typeof title !== "string") ||
    (duration !== undefined && (Number.isFinite(duration) === false || duration <= 0)) ||
    (level !== undefined && typeof level !== "string") ||
    (price !== undefined && (Number.isFinite(price) === false || price <= 0))
  ) {
    return res
      .status(400)
      .json({ error: "Неверный тип данных или недопустимый диапазон данных" });
  }

  courses[index] = {
    id,
    title: title ?? courses[index].title,
    duration: duration ?? courses[index].duration,
    level: level ?? courses[index].level,
    price: price ?? courses[index].price,
  };

  res.status(200).json(courses[index]);
});

app.delete("/courses", (req, res) => {
  courses.length = 0;

  res.status(204).send();
});

app.delete("/courses/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = courses.findIndex((i) => i.id === id);

  if (index === -1) {
    return res.status(404).json({ error: "Такого курса не существует" });
  }

  courses.splice(index, 1);

  res.status(204).send();
});

// app.get('/test-500', (req, res) => { throw new Error('Test 500'); });

app.use((req, res) => {
  res.status(404).json({ error: "Такого маршрута не существует" });
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    error: "Внутренняя ошибка сервера",
  });
});

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`);
});
