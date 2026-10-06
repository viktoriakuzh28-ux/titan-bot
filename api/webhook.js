const { neon } = require("@neondatabase/serverless");

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TG = `https://api.telegram.org/bot${TOKEN}`;
const sql = neon(process.env.DATABASE_URL);

// ==========================================
// TELEGRAM
// ==========================================

async function api(method, body) {
  return fetch(`${TG}/${method}`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

async function sendMessage(chat, text, keyboard) {
  return api("sendMessage", {
    chat_id: chat,
    text,
    reply_markup: keyboard
      ? { inline_keyboard: keyboard }
      : undefined
  });
}

function esc(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ==========================================
// СОЗДАНИЕ ТАБЛИЦ
// ==========================================

async function initDatabase() {
  await sql`
    CREATE TABLE IF NOT EXISTS trainers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS directions (
      id SERIAL PRIMARY KEY,
      trainer_id INTEGER NOT NULL
        REFERENCES trainers(id)
        ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS schedule (
      id SERIAL PRIMARY KEY,
      trainer_id INTEGER NOT NULL
        REFERENCES trainers(id)
        ON DELETE CASCADE,
      day TEXT NOT NULL,
      time TEXT NOT NULL,
      direction TEXT NOT NULL,
      hall TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS bot_state (
      chat_id BIGINT PRIMARY KEY,
      action TEXT,
      trainer_id INTEGER,
      schedule_id INTEGER,
      data JSONB DEFAULT '{}'::jsonb
    )
  `;

  const result = await sql`
    SELECT COUNT(*)::int AS count
    FROM trainers
  `;

  if (Number(result[0].count) === 0) {
    await seedDatabase();
  }
}
// ==========================================
// СТАРТОВЫЕ ДАННЫЕ ТРЕНЕРОВ
// ==========================================

async function seedDatabase() {
  const trainers = [
    {
      name: "Жижина Эльвира",
      phone: "+7 (904) 278-52-01",
      directions: [
        ["Хатха-йога",
         "Спокойная практика: гибкость, укрепление тела и снятие стресса."],
        ["Йога в гамаках",
         "Практика в гамаках: мобильность, разгрузка и контроль тела."]
      ],
      schedule: [
        ["СР", "07:30", "Хатха-йога", "5"],
        ["СР", "09:00", "Йога в гамаках", "2"],
        ["ПТ", "07:30", "Хатха-йога", "5"],
        ["ПТ", "09:00", "Йога в гамаках", "2"]
      ]
    },

    {
      name: "Фролова Екатерина",
      phone: "+7 (988) 095-26-91",
      directions: [
        ["Кундалини-йога",
         "Практика для развития осознанности и гармонизации тела и ума."]
      ],
      schedule: [
        ["СБ", "08:00", "Кундалини-йога", "5"]
      ]
    },

    {
      name: "Зорина Анна",
      phone: "+7 912 855-31-91",
      directions: [
        ["Кундалини-йога",
         "Практика для развития осознанности и гармонизации тела и ума."]
      ],
      schedule: [
        ["ПН", "09:00", "Кундалини-йога", "5"],
        ["ВС", "15:00–19:00", "Кундалини-йога", "2"]
      ]
    },

    {
      name: "Чупина Светлана",
      phone: "+7 982 828-38-27",
      directions: [
        ["TRX",
         "Функциональные тренировки с собственным весом."],
        ["Силовой фитнес",
         "Укрепление мышц и повышение выносливости."],
        ["Растяжка",
         "Развитие гибкости, улучшение осанки и снятие напряжения."],
        ["Мышечно-суставная гимнастика",
         "Здоровье суставов, подвижность и профилактика травм."],
        ["Фитнес-йога",
         "Силовые упражнения, растяжка и дыхательные практики."]
      ],
      schedule: [
        ["ПН", "17:00", "TRX", "2"],
        ["ПН", "18:00", "Силовой фитнес", "3"],
        ["ПН", "19:00", "Растяжка", "3"],
        ["ПН", "20:00", "Фитнес-йога", "2"],

        ["ВТ", "09:00", "Силовой фитнес", "3"],
        ["ВТ", "10:00", "Мышечно-суставная гимнастика", "2"],

        ["СР", "17:00", "Силовой фитнес", "3"],
        ["СР", "18:00", "Силовой фитнес", "3"],
        ["СР", "19:00", "TRX", "2"],
        ["СР", "20:00", "Фитнес-йога", "2"],

        ["ЧТ", "09:00", "Силовой фитнес", "3"],
        ["ЧТ", "10:00", "Растяжка", "2"],

        ["ПТ", "17:00", "Растяжка", "2"],
        ["ПТ", "18:00", "TRX", "2"],
        ["ПТ", "19:00", "Растяжка", "2"]
      ]
    },

    {
      name: "Федоренко Ольга",
      phone: "+7 904 247-08-15",
      directions: [
        ["Силовой тренинг",
         "Развитие силы, укрепление мышц и улучшение физической формы."],
        ["Кроссфит",
         "Интенсивная функциональная тренировка силы и выносливости."],
        ["Функционал",
         "Комплексная функциональная тренировка всего тела."],
        ["Тренажерный зал",
         "Силовые тренировки на тренажерах и со свободными весами."]
      ],
      schedule: [
        ["ПН", "11:00", "Силовой тренинг", "3"],
        ["ПН", "18:30", "Кроссфит", "1"],

        ["ВТ", "10:00", "Функционал", "3"],
        ["ВТ", "19:00", "Силовой тренинг", "3"],
        ["ВТ", "20:00", "Тренажерный зал", "GYM"],

        ["СР", "10:00", "Силовой тренинг", "3"],

        ["ЧТ", "10:00", "Функционал", "3"],
        ["ЧТ", "19:00", "Силовой тренинг", "3"],
        ["ЧТ", "20:00", "Тренажерный зал", "GYM"],

        ["ПТ", "10:00", "Кроссфит", "1"],
        ["СБ", "09:00", "Кроссфит", "1"]
      ]
    },

    {
      name: "Ижболдина Наталья",
      phone: "+7 982 837-57-69",
      directions: [
        ["Динамическая растяжка",
         "Гибкость, улучшение осанки, восстановление и профилактика травм."]
      ],
      schedule: [
        ["ВТ", "19:00", "Динамическая растяжка", "5"],
        ["ЧТ", "19:00", "Динамическая растяжка", "5"],
        ["ВС", "11:00", "Динамическая растяжка", "5"]
      ]
    },

    {
      name: "Солодова Алена",
      phone: "+7 982 127-49-22",
      directions: [
        ["Джампинг",
         "Кардио на мини-батутах: выносливость, координация и энергия."]
      ],
      schedule: [
        ["ВТ", "18:00", "Джампинг", "3"],
        ["ЧТ", "18:00", "Джампинг", "3"]
      ]
    },

    {
      name: "Кушнир Анна",
      phone: "+7 912 769-85-05",
      directions: [
        ["Силовой тренинг",
         "Укрепление мышц, развитие силы и выносливости."],
        ["Функционал",
         "Функциональная работа на силу, координацию и выносливость."]
      ],
      schedule: [
        ["СР", "18:00", "Силовой тренинг", "2"],
        ["ПТ", "18:00", "Функционал", "1"],
        ["ВС", "11:00", "Функционал", "1"]
      ]
    },

    {
      name: "Васильчевская Евгения",
      phone: "+7 (914) 936-82-32",
      directions: [
        ["Зумба",
         "Танцевальный фитнес: выносливость, координация и отличное настроение."]
      ],
      schedule: [
        ["ПТ", "18:30", "Зумба", "3"]
      ]
    }
  ];

  // Записываем тренеров в Neon
  for (let i = 0; i < trainers.length; i++) {
    const t = trainers[i];

    const inserted = await sql`
      INSERT INTO trainers (name, phone, sort_order)
      VALUES (${t.name}, ${t.phone}, ${i})
      RETURNING id
    `;

    const trainerId = inserted[0].id;

    // Направления
    for (let d = 0; d < t.directions.length; d++) {
      await sql`
        INSERT INTO directions (
          trainer_id,
          name,
          description,
          sort_order
        )
        VALUES (
          ${trainerId},
          ${t.directions[d][0]},
          ${t.directions[d][1]},
          ${d}
        )
      `;
    }

    // Расписание
    for (let s = 0; s < t.schedule.length; s++) {
      const item = t.schedule[s];

      await sql`
        INSERT INTO schedule (
          trainer_id,
          day,
          time,
          direction,
          hall,
          sort_order
        )
        VALUES (
          ${trainerId},
          ${item[0]},
          ${item[1]},
          ${item[2]},
          ${item[3]},
          ${s}
        )
      `;
    }
  }
}
// ==========================================
// ПОЛУЧЕНИЕ ДАННЫХ ИЗ NEON
// ==========================================

async function getTrainers() {
  return sql`
    SELECT *
    FROM trainers
    ORDER BY sort_order, id
  `;
}

async function getTrainer(id) {
  const rows = await sql`
    SELECT *
    FROM trainers
    WHERE id = ${id}
    LIMIT 1
  `;

  if (!rows.length) return null;

  const trainer = rows[0];

  const directions = await sql`
    SELECT *
    FROM directions
    WHERE trainer_id = ${id}
    ORDER BY sort_order, id
  `;

  const schedule = await sql`
    SELECT *
    FROM schedule
    WHERE trainer_id = ${id}
    ORDER BY sort_order, id
  `;

  return {
    ...trainer,
    directions,
    schedule
  };
}

// ==========================================
// СОСТОЯНИЕ РЕДАКТИРОВАНИЯ
// ==========================================

async function setState(
  chat,
  action,
  trainerId = null,
  scheduleId = null,
  data = {}
) {
  await sql`
    INSERT INTO bot_state (
      chat_id,
      action,
      trainer_id,
      schedule_id,
      data
    )
    VALUES (
      ${chat},
      ${action},
      ${trainerId},
      ${scheduleId},
      ${JSON.stringify(data)}::jsonb
    )
    ON CONFLICT (chat_id)
    DO UPDATE SET
      action = EXCLUDED.action,
      trainer_id = EXCLUDED.trainer_id,
      schedule_id = EXCLUDED.schedule_id,
      data = EXCLUDED.data
  `;
}

async function getState(chat) {
  const rows = await sql`
    SELECT *
    FROM bot_state
    WHERE chat_id = ${chat}
    LIMIT 1
  `;

  return rows[0] || null;
}

async function clearState(chat) {
  await sql`
    DELETE FROM bot_state
    WHERE chat_id = ${chat}
  `;
}

// ==========================================
// ОСНОВНЫЕ КНОПКИ
// ==========================================

function mainKeyboard() {
  return [
    [
      {
        text: "🖼 Создать инфографику",
        callback_data: "create"
      }
    ],
    [
      {
        text: "📅 Общее расписание",
        callback_data: "week"
      }
    ],
    [
      {
        text: "👤 Тренеры",
        callback_data: "trainers"
      }
    ],
    [
      {
        text: "✏️ Управление данными",
        callback_data: "admin"
      }
    ]
  ];
}

async function trainerKeyboard(prefix) {
  const trainers = await getTrainers();

  const keyboard = trainers.map(t => [
    {
      text: t.name,
      callback_data: `${prefix}:${t.id}`
    }
  ]);

  keyboard.push([
    {
      text: "⬅️ Назад",
      callback_data: "home"
    }
  ]);

  return keyboard;
}
// ==========================================
// АДМИН-МЕНЮ
// ==========================================

async function showAdmin(chat) {
  await clearState(chat);

  await sendMessage(
    chat,
    "✏️ УПРАВЛЕНИЕ ДАННЫМИ\n\nВыберите действие:",
    [
      [{
        text: "👤 Изменить тренера",
        callback_data: "admin_trainers"
      }],
      [{
        text: "➕ Добавить тренера",
        callback_data: "add_trainer"
      }],
      [{
        text: "🏠 В меню",
        callback_data: "home"
      }]
    ]
  );
}

// ==========================================
// УПРАВЛЕНИЕ ТРЕНЕРОМ
// ==========================================

async function showTrainerAdmin(chat, id) {
  const t = await getTrainer(id);

  if (!t) {
    return sendMessage(chat, "Тренер не найден.");
  }

  await sendMessage(
    chat,
    `👤 ${t.name}\n📞 ${t.phone}\n\nЧто изменить?`,
    [
      [{
        text: "📅 Расписание",
        callback_data: `admin_schedule:${id}`
      }],
      [{
        text: "✏️ Имя",
        callback_data: `edit_name:${id}`
      }],
      [{
        text: "📞 Телефон",
        callback_data: `edit_phone:${id}`
      }],
      [{
        text: "🏋️ Направления",
        callback_data: `admin_directions:${id}`
      }],
      [{
        text: "⬅️ К тренерам",
        callback_data: "admin_trainers"
      }],
      [{
        text: "🏠 В меню",
        callback_data: "home"
      }]
    ]
  );
}

// ==========================================
// РАСПИСАНИЕ ТРЕНЕРА
// ==========================================

async function showScheduleAdmin(chat, trainerId) {
  const t = await getTrainer(trainerId);

  if (!t) {
    return sendMessage(chat, "Тренер не найден.");
  }

  const keyboard = t.schedule.map(s => [
    {
      text:
        `${s.day} ${s.time} · ${s.direction} · ` +
        `${s.hall === "GYM" ? "Тренажерный зал" : "Зал " + s.hall}`,
      callback_data: `lesson:${s.id}`
    }
  ]);

  keyboard.push([
    {
      text: "➕ Добавить занятие",
      callback_data: `add_lesson:${trainerId}`
    }
  ]);

  keyboard.push([
    {
      text: "⬅️ Назад",
      callback_data: `admin_trainer:${trainerId}`
    }
  ]);

  await sendMessage(
    chat,
    `📅 РАСПИСАНИЕ\n${t.name}\n\nВыберите занятие:`,
    keyboard
  );
}

// ==========================================
// КОНКРЕТНОЕ ЗАНЯТИЕ
// ==========================================

async function showLessonAdmin(chat, scheduleId) {
  const rows = await sql`
    SELECT
      s.*,
      t.name AS trainer_name
    FROM schedule s
    JOIN trainers t
      ON t.id = s.trainer_id
    WHERE s.id = ${scheduleId}
    LIMIT 1
  `;

  if (!rows.length) {
    return sendMessage(chat, "Занятие не найдено.");
  }

  const s = rows[0];

  const hallText =
    s.hall === "GYM"
      ? "Тренажерный зал"
      : `Зал ${s.hall}`;

  await sendMessage(
    chat,
    `${s.trainer_name}\n\n` +
    `📅 ${s.day}\n` +
    `🕐 ${s.time}\n` +
    `🏋️ ${s.direction}\n` +
    `🚪 ${hallText}`,
    [
      [{
        text: "📅 Изменить день",
        callback_data: `lesson_day:${s.id}`
      }],
      [{
        text: "🕐 Изменить время",
        callback_data: `lesson_time:${s.id}`
      }],
      [{
        text: "🏋️ Изменить направление",
        callback_data: `lesson_direction:${s.id}`
      }],
      [{
        text: "🚪 Изменить зал",
        callback_data: `lesson_hall:${s.id}`
      }],
      [{
        text: "🗑 Удалить занятие",
        callback_data: `lesson_delete:${s.id}`
      }],
      [{
        text: "⬅️ Назад",
        callback_data: `admin_schedule:${s.trainer_id}`
      }]
    ]
  );
}
// ==========================================
// ОБРАБОТКА ВВЕДЁННЫХ ДАННЫХ
// ==========================================

async function processStateMessage(chat, text) {
  const state = await getState(chat);

  if (!state || !state.action) {
    return false;
  }

  text = text.trim();

  // ИЗМЕНИТЬ ИМЯ
  if (state.action === "edit_name") {
    await sql`
      UPDATE trainers
      SET name = ${text}
      WHERE id = ${state.trainer_id}
    `;

    const trainerId = state.trainer_id;

    await clearState(chat);
    await sendMessage(chat, "✅ Имя изменено.");
    await showTrainerAdmin(chat, trainerId);

    return true;
  }

  // ИЗМЕНИТЬ ТЕЛЕФОН
  if (state.action === "edit_phone") {
    await sql`
      UPDATE trainers
      SET phone = ${text}
      WHERE id = ${state.trainer_id}
    `;

    const trainerId = state.trainer_id;

    await clearState(chat);
    await sendMessage(chat, "✅ Телефон изменён.");
    await showTrainerAdmin(chat, trainerId);

    return true;
  }

  // ИЗМЕНИТЬ ДЕНЬ
  if (state.action === "lesson_day") {
    const day = text.toUpperCase();

    await sql`
      UPDATE schedule
      SET day = ${day}
      WHERE id = ${state.schedule_id}
    `;

    const lessonId = state.schedule_id;

    await clearState(chat);
    await sendMessage(chat, "✅ День изменён.");
    await showLessonAdmin(chat, lessonId);

    return true;
  }

  // ИЗМЕНИТЬ ВРЕМЯ
  if (state.action === "lesson_time") {
    await sql`
      UPDATE schedule
      SET time = ${text}
      WHERE id = ${state.schedule_id}
    `;

    const lessonId = state.schedule_id;

    await clearState(chat);
    await sendMessage(chat, "✅ Время изменено.");
    await showLessonAdmin(chat, lessonId);

    return true;
  }

  // ИЗМЕНИТЬ НАПРАВЛЕНИЕ
  if (state.action === "lesson_direction") {
    await sql`
      UPDATE schedule
      SET direction = ${text}
      WHERE id = ${state.schedule_id}
    `;

    const lessonId = state.schedule_id;

    await clearState(chat);
    await sendMessage(chat, "✅ Направление изменено.");
    await showLessonAdmin(chat, lessonId);

    return true;
  }

  // ИЗМЕНИТЬ ЗАЛ
  if (state.action === "lesson_hall") {
    let hall = text;

    if (/тренаж/i.test(hall)) {
      hall = "GYM";
    } else {
      hall = hall.replace(/[^\d]/g, "");
    }

    if (!hall) {
      await sendMessage(
        chat,
        "Введите номер зала: 1, 2, 3 или 5.\n" +
        "Для тренажёрного зала напишите: Тренажерный зал"
      );

      return true;
    }

    await sql`
      UPDATE schedule
      SET hall = ${hall}
      WHERE id = ${state.schedule_id}
    `;

    const lessonId = state.schedule_id;

    await clearState(chat);
    await sendMessage(chat, "✅ Зал изменён.");
    await showLessonAdmin(chat, lessonId);

    return true;
  }

  // ========================================
  // ДОБАВЛЕНИЕ НОВОГО ТРЕНЕРА
  // ========================================

  if (state.action === "add_trainer_name") {
    await setState(
      chat,
      "add_trainer_phone",
      null,
      null,
      { name: text }
    );

    await sendMessage(
      chat,
      "Теперь введите телефон тренера:"
    );

    return true;
  }

  if (state.action === "add_trainer_phone") {
    const info = state.data || {};

    const maxRows = await sql`
      SELECT COALESCE(MAX(sort_order), -1) AS max
      FROM trainers
    `;

    const result = await sql`
      INSERT INTO trainers (
        name,
        phone,
        sort_order
      )
      VALUES (
        ${info.name},
        ${text},
        ${Number(maxRows[0].max) + 1}
      )
      RETURNING id
    `;

    await clearState(chat);

    await sendMessage(
      chat,
      "✅ Новый тренер добавлен."
    );

    await showTrainerAdmin(
      chat,
      result[0].id
    );

    return true;
  }

  // ========================================
  // ДОБАВЛЕНИЕ НОВОГО ЗАНЯТИЯ
  // ========================================

  if (state.action === "add_lesson_day") {
    await setState(
      chat,
      "add_lesson_time",
      state.trainer_id,
      null,
      {
        day: text.toUpperCase()
      }
    );

    await sendMessage(
      chat,
      "Введите время.\nНапример: 18:00"
    );

    return true;
  }

  if (state.action === "add_lesson_time") {
    await setState(
      chat,
      "add_lesson_direction",
      state.trainer_id,
      null,
      {
        ...(state.data || {}),
        time: text
      }
    );

    await sendMessage(
      chat,
      "Введите направление.\nНапример: Хатха-йога"
    );

    return true;
  }

  if (state.action === "add_lesson_direction") {
    await setState(
      chat,
      "add_lesson_hall",
      state.trainer_id,
      null,
      {
        ...(state.data || {}),
        direction: text
      }
    );

    await sendMessage(
      chat,
      "Введите номер зала: 1, 2, 3 или 5.\n" +
      "Для тренажёрного зала напишите: Тренажерный зал"
    );

    return true;
  }

  if (state.action === "add_lesson_hall") {
    let hall = text;

    if (/тренаж/i.test(hall)) {
      hall = "GYM";
    } else {
      hall = hall.replace(/[^\d]/g, "");
    }

    if (!hall) {
      await sendMessage(
        chat,
        "Введите номер зала или «Тренажерный зал»."
      );

      return true;
    }

    const info = state.data || {};

    const maxRows = await sql`
      SELECT COALESCE(MAX(sort_order), -1) AS max
      FROM schedule
      WHERE trainer_id = ${state.trainer_id}
    `;

    await sql`
      INSERT INTO schedule (
        trainer_id,
        day,
        time,
        direction,
        hall,
        sort_order
      )
      VALUES (
        ${state.trainer_id},
        ${info.day},
        ${info.time},
        ${info.direction},
        ${hall},
        ${Number(maxRows[0].max) + 1}
      )
    `;

    const trainerId = state.trainer_id;

    await clearState(chat);
    await sendMessage(chat, "✅ Занятие добавлено.");
    await showScheduleAdmin(chat, trainerId);

    return true;
  }

  return false;
}
// ==========================================
// УПРАВЛЕНИЕ НАПРАВЛЕНИЯМИ
// ==========================================

async function showDirectionsAdmin(chat, trainerId) {
  const t = await getTrainer(trainerId);

  if (!t) {
    return sendMessage(chat, "Тренер не найден.");
  }

  const keyboard = t.directions.map(d => [
    {
      text: `🏋️ ${d.name}`,
      callback_data: `direction:${d.id}`
    }
  ]);

  keyboard.push([
    {
      text: "➕ Добавить направление",
      callback_data: `add_direction:${trainerId}`
    }
  ]);

  keyboard.push([
    {
      text: "⬅️ Назад",
      callback_data: `admin_trainer:${trainerId}`
    }
  ]);

  await sendMessage(
    chat,
    `🏋️ НАПРАВЛЕНИЯ\n${t.name}\n\nВыберите направление:`,
    keyboard
  );
}

async function showDirectionAdmin(chat, directionId) {
  const rows = await sql`
    SELECT
      d.*,
      t.name AS trainer_name
    FROM directions d
    JOIN trainers t
      ON t.id = d.trainer_id
    WHERE d.id = ${directionId}
    LIMIT 1
  `;

  if (!rows.length) {
    return sendMessage(chat, "Направление не найдено.");
  }

  const d = rows[0];

  await sendMessage(
    chat,
    `${d.trainer_name}\n\n` +
    `🏋️ ${d.name}\n\n` +
    `${d.description || "Описание не указано"}`,
    [
      [{
        text: "✏️ Изменить название",
        callback_data: `direction_name:${d.id}`
      }],
      [{
        text: "📝 Изменить описание",
        callback_data: `direction_desc:${d.id}`
      }],
      [{
        text: "🗑 Удалить направление",
        callback_data: `direction_delete:${d.id}`
      }],
      [{
        text: "⬅️ Назад",
        callback_data: `admin_directions:${d.trainer_id}`
      }]
    ]
  );
}

// ==========================================
// ВВОД ДАННЫХ ДЛЯ НАПРАВЛЕНИЙ
// ==========================================

async function processDirectionState(chat, text) {
  const state = await getState(chat);

  if (!state || !state.action) {
    return false;
  }

  text = text.trim();

  // Изменение названия
  if (state.action === "direction_name") {
    await sql`
      UPDATE directions
      SET name = ${text}
      WHERE id = ${state.schedule_id}
    `;

    const directionId = state.schedule_id;

    await clearState(chat);
    await sendMessage(chat, "✅ Название изменено.");
    await showDirectionAdmin(chat, directionId);

    return true;
  }

  // Изменение описания
  if (state.action === "direction_desc") {
    await sql`
      UPDATE directions
      SET description = ${text}
      WHERE id = ${state.schedule_id}
    `;

    const directionId = state.schedule_id;

    await clearState(chat);
    await sendMessage(chat, "✅ Описание изменено.");
    await showDirectionAdmin(chat, directionId);

    return true;
  }

  // Новое направление — название
  if (state.action === "add_direction_name") {
    await setState(
      chat,
      "add_direction_desc",
      state.trainer_id,
      null,
      { name: text }
    );

    await sendMessage(
      chat,
      "Теперь напишите короткое описание направления:"
    );

    return true;
  }

  // Новое направление — описание
  if (state.action === "add_direction_desc") {
    const info = state.data || {};

    const maxRows = await sql`
      SELECT COALESCE(MAX(sort_order), -1) AS max
      FROM directions
      WHERE trainer_id = ${state.trainer_id}
    `;

    await sql`
      INSERT INTO directions (
        trainer_id,
        name,
        description,
        sort_order
      )
      VALUES (
        ${state.trainer_id},
        ${info.name},
        ${text},
        ${Number(maxRows[0].max) + 1}
      )
    `;

    const trainerId = state.trainer_id;

    await clearState(chat);
    await sendMessage(chat, "✅ Направление добавлено.");
    await showDirectionsAdmin(chat, trainerId);

    return true;
  }

  return false;
}
// ==========================================
// ИНФОГРАФИКА ТИТАН — ЧАСТЬ 1
// ==========================================

const hallNames = {
  "1": "КРОССФИТ / БОКС",
  "2": "TRX / АНТИГРАВИТИ",
  "3": "СИЛОВОЙ ТРЕНИНГ",
  "5": "ЙОГА / АЭРОЙОГА",
  GYM: "ТРЕНАЖЕРНЫЙ ЗАЛ"
};

function shortHall(hall) {
  return hall === "GYM"
    ? "ТРЕНАЖЕРНЫЙ"
    : `ЗАЛ ${hall}`;
}

function splitText(text, maxChars) {
  const words = String(text || "").split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const test = current
      ? `${current} ${word}`
      : word;

    if (test.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }

  if (current) lines.push(current);

  return lines;
}

function svgLines(lines, x, y, size, color, weight, gap) {
  return lines.map((line, i) => `
    <text
      x="${x}"
      y="${y + i * gap}"
      fill="${color}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${size}"
      font-weight="${weight}"
    >${esc(line)}</text>
  `).join("");
}

function makePoster(t, theme = "color", trainerNumber = 1) {
  const bw = theme === "bw";

  const C = {
    bg: bw ? "#ffffff" : "#090909",
    surface: bw ? "#f1f1f1" : "#151515",
    surface2: bw ? "#fafafa" : "#101010",
    text: bw ? "#050505" : "#ffffff",
    muted: bw ? "#4d4d4d" : "#d0d0d0",
    accent: bw ? "#000000" : "#ff6a00",
    line: bw ? "#c9c9c9" : "#383838",
    ghost: bw ? "#eeeeee" : "#151515"
  };

  const W = 1240;
  const PAD = 72;

  // ========================================
  // НАПРАВЛЕНИЯ
  // ========================================

  const directionStart = 430;

  const directionData = t.directions.length
    ? t.directions
    : [{
        name: "НАПРАВЛЕНИЯ",
        description: "Добавьте направления через управление данными."
      }];

  const preparedDirections = directionData.map(d => {
    const descLines = splitText(
      d.description || "",
      65
    ).slice(0, 2);

    return {
      name: d.name,
      descLines,
      height: descLines.length > 1 ? 132 : 112
    };
  });

  let currentDirectionY = directionStart;

  const directionSvg = preparedDirections.map(d => {
    const y = currentDirectionY;

    currentDirectionY += d.height + 16;

    return `
      <g>
        <rect
          x="${PAD}"
          y="${y}"
          width="${W - PAD * 2}"
          height="${d.height}"
          rx="20"
          fill="${C.surface}"
          stroke="${C.line}"
          stroke-width="2"
        />

        <rect
          x="${PAD}"
          y="${y}"
          width="12"
          height="${d.height}"
          rx="6"
          fill="${C.accent}"
        />

        <text
          x="${PAD + 38}"
          y="${y + 44}"
          fill="${C.text}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="34"
          font-weight="900"
        >${esc(d.name).toUpperCase()}</text>

        ${svgLines(
          d.descLines,
          PAD + 38,
          y + 82,
          25,
          C.muted,
          700,
          31
        )}
      </g>
    `;
  }).join("");

  // ========================================
  // РАСПИСАНИЕ
  // ========================================

  const scheduleTitleY = currentDirectionY + 65;
  const scheduleHeaderY = scheduleTitleY + 72;
  const scheduleStartY = scheduleHeaderY + 55;
  const scheduleRowH = 88;

  let lastDay = "";

  const scheduleSvg = t.schedule.map((s, i) => {
    const y = scheduleStartY + i * scheduleRowH;
    const showDay = s.day !== lastDay;

    lastDay = s.day;

    return `
      <g>
        <rect
          x="${PAD}"
          y="${y}"
          width="${W - PAD * 2}"
          height="76"
          rx="16"
          fill="${i % 2 === 0 ? C.surface : C.surface2}"
          stroke="${C.line}"
          stroke-width="2"
        />

        ${
          showDay
            ? `
              <rect
                x="${PAD + 14}"
                y="${y + 10}"
                width="94"
                height="56"
                rx="13"
                fill="${C.accent}"
              />

              <text
                x="${PAD + 61}"
                y="${y + 49}"
                text-anchor="middle"
                fill="${bw ? "#ffffff" : "#090909"}"
                font-family="Arial, Helvetica, sans-serif"
                font-size="31"
                font-weight="900"
              >${esc(s.day)}</text>
            `
            : `
              <line
                x1="${PAD + 61}"
                y1="${y}"
                x2="${PAD + 61}"
                y2="${y + 76}"
                stroke="${C.line}"
                stroke-width="3"
              />
            `
        }

        <text
          x="${PAD + 150}"
          y="${y + 50}"
          fill="${C.text}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="32"
          font-weight="900"
        >${esc(s.time)}</text>

        <text
          x="${PAD + 405}"
          y="${y + 49}"
          fill="${C.text}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="27"
          font-weight="900"
        >${esc(s.direction).toUpperCase()}</text>

        <text
          x="${W - PAD - 18}"
          y="${y + 49}"
          text-anchor="end"
          fill="${C.accent}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="27"
          font-weight="900"
        >${esc(shortHall(s.hall))}</text>
      </g>
    `;
  }).join("");

  // ========================================
  // РАСШИФРОВКА ЗАЛОВ
  // ========================================

  const halls = [
    ...new Set(t.schedule.map(s => s.hall))
  ];

  const hallsTitleY =
    scheduleStartY +
    t.schedule.length * scheduleRowH +
    75;

  const hallCardsStartY = hallsTitleY + 65;
  const hallRowH = 108;

  const hallRows = Math.max(
    1,
    Math.ceil(halls.length / 2)
  );

  const hallSvg = halls.map((hall, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);

    const x = PAD + col * 558;
    const y = hallCardsStartY + row * hallRowH;

    return `
      <g>
        <rect
          x="${x}"
          y="${y}"
          width="530"
          height="90"
          rx="17"
          fill="${C.surface}"
          stroke="${C.line}"
          stroke-width="2"
        />

        <text
          x="${x + 25}"
          y="${y + 37}"
          fill="${C.accent}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="26"
          font-weight="900"
        >${esc(shortHall(hall))}</text>

        <text
          x="${x + 25}"
          y="${y + 69}"
          fill="${C.text}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="21"
          font-weight="800"
        >${esc(hallNames[hall] || "")}</text>
      </g>
    `;
  }).join("");

  const contactY =
    hallCardsStartY +
    hallRows * hallRowH +
    60;

  const H = Math.max(
    1754,
    contactY + 300
  );
    // ========================================
  // СОБИРАЕМ SVG
  // ========================================

  return `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="${W}"
    height="${H}"
    viewBox="0 0 ${W} ${H}"
  >
    <rect width="${W}" height="${H}" fill="${C.bg}" />

    <!-- Фоновый ТИТАН -->
    <text
      x="1210"
      y="330"
      text-anchor="end"
      fill="${C.ghost}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="215"
      font-weight="900"
    >ТИТАН</text>

    <path
      d="M970 0 L1240 0 L1240 270 Z"
      fill="${C.accent}"
      opacity="${bw ? "0.07" : "0.12"}"
    />

    <rect
      x="0"
      y="0"
      width="${W}"
      height="16"
      fill="${C.accent}"
    />

    <!-- ШАПКА -->
    <text
      x="${PAD}"
      y="92"
      fill="${C.accent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="50"
      font-weight="900"
    >ТИТАН</text>

    <text
      x="${W - PAD}"
      y="88"
      text-anchor="end"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="21"
      font-weight="900"
      letter-spacing="3"
    >ТРЕНЕР • ${String(trainerNumber).padStart(2, "0")}</text>

    <line
      x1="${PAD}"
      y1="125"
      x2="${W - PAD}"
      y2="125"
      stroke="${C.accent}"
      stroke-width="5"
    />

    <!-- ИМЯ -->
    <text
      x="${PAD}"
      y="220"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="61"
      font-weight="900"
    >${esc(t.name).toUpperCase()}</text>

    <text
      x="${PAD + 2}"
      y="269"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="25"
      font-weight="900"
      letter-spacing="3"
    >ГРУППОВЫЕ ТРЕНИРОВКИ</text>

    <!-- 01 НАПРАВЛЕНИЯ -->
    <text
      x="${PAD}"
      y="355"
      fill="${C.accent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="21"
      font-weight="900"
    >01</text>

    <line
      x1="${PAD + 52}"
      y1="349"
      x2="${PAD + 120}"
      y2="349"
      stroke="${C.accent}"
      stroke-width="4"
    />

    <text
      x="${PAD + 145}"
      y="358"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="32"
      font-weight="900"
      letter-spacing="2"
    >НАПРАВЛЕНИЯ</text>

    ${directionSvg}

    <!-- 02 РАСПИСАНИЕ -->
    <text
      x="${PAD}"
      y="${scheduleTitleY}"
      fill="${C.accent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="21"
      font-weight="900"
    >02</text>

    <line
      x1="${PAD + 52}"
      y1="${scheduleTitleY - 7}"
      x2="${PAD + 120}"
      y2="${scheduleTitleY - 7}"
      stroke="${C.accent}"
      stroke-width="4"
    />

    <text
      x="${PAD + 145}"
      y="${scheduleTitleY + 3}"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="32"
      font-weight="900"
      letter-spacing="2"
    >РАСПИСАНИЕ</text>

    <!-- ЗАГОЛОВКИ ТАБЛИЦЫ -->
    <text
      x="${PAD + 14}"
      y="${scheduleHeaderY}"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="21"
      font-weight="900"
    >ДЕНЬ</text>

    <text
      x="${PAD + 150}"
      y="${scheduleHeaderY}"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="21"
      font-weight="900"
    >ВРЕМЯ</text>

    <text
      x="${PAD + 405}"
      y="${scheduleHeaderY}"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="21"
      font-weight="900"
    >НАПРАВЛЕНИЕ</text>

    <text
      x="${W - PAD - 18}"
      y="${scheduleHeaderY}"
      text-anchor="end"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="21"
      font-weight="900"
    >ЗАЛ</text>

    ${scheduleSvg}

    <!-- 03 ЗАЛЫ -->
    <text
      x="${PAD}"
      y="${hallsTitleY}"
      fill="${C.accent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="21"
      font-weight="900"
    >03</text>

    <line
      x1="${PAD + 52}"
      y1="${hallsTitleY - 7}"
      x2="${PAD + 120}"
      y2="${hallsTitleY - 7}"
      stroke="${C.accent}"
      stroke-width="4"
    />

    <text
      x="${PAD + 145}"
      y="${hallsTitleY + 3}"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="32"
      font-weight="900"
      letter-spacing="2"
    >РАСШИФРОВКА ЗАЛОВ</text>

    ${hallSvg}

    <!-- КОНТАКТЫ -->
    <rect
      x="${PAD}"
      y="${contactY}"
      width="${W - PAD * 2}"
      height="184"
      rx="23"
      fill="${C.surface}"
      stroke="${C.accent}"
      stroke-width="4"
    />

    <text
      x="${PAD + 32}"
      y="${contactY + 45}"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="19"
      font-weight="900"
      letter-spacing="2"
    >ЗАПИСЬ К ТРЕНЕРУ</text>

    <text
      x="${PAD + 32}"
      y="${contactY + 106}"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="40"
      font-weight="900"
    >${esc(t.phone)}</text>

    <text
      x="${PAD + 32}"
      y="${contactY + 150}"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="21"
      font-weight="800"
    >г. Сарапул · ул. Советская, 46</text>

    <!-- QR PLACEHOLDER -->
    <rect
      x="${W - PAD - 145}"
      y="${contactY + 24}"
      width="132"
      height="132"
      rx="14"
      fill="#ffffff"
      stroke="${C.accent}"
      stroke-width="4"
    />

    <text
      x="${W - PAD - 79}"
      y="${contactY + 102}"
      text-anchor="middle"
      fill="#000000"
      font-family="Arial, Helvetica, sans-serif"
      font-size="26"
      font-weight="900"
    >QR</text>

    <text
      x="${PAD}"
      y="${contactY + 245}"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="22"
      font-weight="900"
      letter-spacing="2"
    >ТИТАН · САРАПУЛ</text>

    <line
      x1="${PAD}"
      y1="${contactY + 272}"
      x2="${W - PAD}"
      y2="${contactY + 272}"
      stroke="${C.accent}"
      stroke-width="6"
    />
  </svg>
  `;
}

// ==========================================
// ОТПРАВКА ИНФОГРАФИКИ В TELEGRAM
// ==========================================

async function sendPoster(chat, trainerId, theme) {
  const trainer = await getTrainer(trainerId);

  if (!trainer) {
    return sendMessage(chat, "Тренер не найден.");
  }

  const trainers = await getTrainers();

  const number =
    trainers.findIndex(
      t => Number(t.id) === Number(trainerId)
    ) + 1;

  const svg = makePoster(
    trainer,
    theme,
    number || 1
  );

  const form = new FormData();

  form.append("chat_id", String(chat));

  form.append(
    "document",
    new Blob(
      [svg],
      { type: "image/svg+xml" }
    ),
    `TITAN_${trainer.name.replace(/\s+/g, "_")}_${theme}.svg`
  );

  form.append(
    "caption",
    `${trainer.name}\n${
      theme === "bw"
        ? "Ч/Б вариант"
        : "Цветной вариант"
    }`
  );

  return fetch(`${TG}/sendDocument`, {
    method: "POST",
    body: form
  });
}
// ==========================================
// ОСНОВНОЙ WEBHOOK
// ==========================================

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(200).json({
      ok: true,
      service: "TITAN Bot"
    });
  }

  try {
    await initDatabase();

    const update = req.body || {};
    const message = update.message;
    const query = update.callback_query;

    const chat =
      message?.chat?.id ||
      query?.message?.chat?.id;

    if (!chat) {
      return res.status(200).json({ ok: true });
    }

    // Закрываем "часики" на Telegram-кнопке
    if (query) {
      await api("answerCallbackQuery", {
        callback_query_id: query.id
      });
    }

    const data = query?.data || "";
    const text = message?.text || "";

    // ========================================
    // /START И ГЛАВНОЕ МЕНЮ
    // ========================================

    if (text === "/start" || data === "home") {
      await clearState(chat);

      await sendMessage(
        chat,
        "ТИТАН — генератор инфографики\n\nВыберите действие:",
        mainKeyboard()
      );

      return res.status(200).json({ ok: true });
    }

    // ========================================
    // ТЕКСТ, КОТОРЫЙ ВВОДИТ АДМИНИСТРАТОР
    // ========================================

    if (message && text) {
      const directionProcessed =
        await processDirectionState(chat, text);

      if (directionProcessed) {
        return res.status(200).json({ ok: true });
      }

      const processed =
        await processStateMessage(chat, text);

      if (processed) {
        return res.status(200).json({ ok: true });
      }
    }

    // ========================================
    // СОЗДАНИЕ ИНФОГРАФИКИ
    // ========================================

    if (data === "create") {
      await sendMessage(
        chat,
        "Выберите вариант оформления:",
        [
          [
            {
              text: "🟧 Цветной",
              callback_data: "theme:color"
            },
            {
              text: "⬜ Ч/Б",
              callback_data: "theme:bw"
            }
          ],
          [
            {
              text: "⬅️ Назад",
              callback_data: "home"
            }
          ]
        ]
      );

      return res.status(200).json({ ok: true });
    }

    if (data.startsWith("theme:")) {
      const theme = data.split(":")[1];

      const keyboard =
        await trainerKeyboard(`poster_${theme}`);

      await sendMessage(
        chat,
        "Выберите тренера:",
        keyboard
      );

      return res.status(200).json({ ok: true });
    }

    // ========================================
    // ГЕНЕРАЦИЯ ПОСТЕРА
    // ========================================

    if (
      data.startsWith("poster_color:") ||
      data.startsWith("poster_bw:")
    ) {
      const [prefix, id] = data.split(":");

      const theme =
        prefix === "poster_bw"
          ? "bw"
          : "color";

      await sendMessage(
        chat,
        "Готовлю инфографику…"
      );

      await sendPoster(
        chat,
        Number(id),
        theme
      );

      await sendMessage(
        chat,
        "✅ Готово.",
        [
          [
            {
              text: "👤 Другой тренер",
              callback_data: `theme:${theme}`
            }
          ],
          [
            {
              text: "🏠 В меню",
              callback_data: "home"
            }
          ]
        ]
      );

      return res.status(200).json({ ok: true });
    }

    // ========================================
    // СПИСОК ТРЕНЕРОВ
    // ========================================

    if (data === "trainers") {
      const trainers = await getTrainers();

      const list = trainers
        .map(
          (t, i) =>
            `${i + 1}. ${t.name} — ${t.phone}`
        )
        .join("\n");

      await sendMessage(
        chat,
        `ТРЕНЕРЫ «ТИТАН»\n\n${list}`,
        [
          [
            {
              text: "🏠 В меню",
              callback_data: "home"
            }
          ]
        ]
      );

      return res.status(200).json({ ok: true });
    }

    // ========================================
    // ВХОД В УПРАВЛЕНИЕ
    // ========================================

    if (data === "admin") {
      await showAdmin(chat);

      return res.status(200).json({ ok: true });
    }

    if (data === "admin_trainers") {
      const keyboard =
        await trainerKeyboard("admin_trainer");

      await sendMessage(
        chat,
        "Выберите тренера:",
        keyboard
      );

      return res.status(200).json({ ok: true });
    }

    if (data.startsWith("admin_trainer:")) {
      const id = Number(data.split(":")[1]);

      await showTrainerAdmin(chat, id);

      return res.status(200).json({ ok: true });
    }

    // ========================================
    // РАСПИСАНИЕ
    // ========================================

    if (data.startsWith("admin_schedule:")) {
      const id = Number(data.split(":")[1]);

      await showScheduleAdmin(chat, id);

      return res.status(200).json({ ok: true });
    }

    if (data.startsWith("lesson:")) {
      const id = Number(data.split(":")[1]);

      await showLessonAdmin(chat, id);

      return res.status(200).json({ ok: true });
    }
        // ========================================
    // ИЗМЕНЕНИЕ ЗАНЯТИЯ
    // ========================================

    if (data.startsWith("lesson_day:")) {
      const id = Number(data.split(":")[1]);

      await setState(chat, "lesson_day", null, id);

      await sendMessage(
        chat,
        "Введите новый день.\nНапример: ПН, ВТ, СР, ЧТ, ПТ, СБ или ВС"
      );

      return res.status(200).json({ ok: true });
    }

    if (data.startsWith("lesson_time:")) {
      const id = Number(data.split(":")[1]);

      await setState(chat, "lesson_time", null, id);

      await sendMessage(
        chat,
        "Введите новое время.\nНапример: 18:30"
      );

      return res.status(200).json({ ok: true });
    }

    if (data.startsWith("lesson_direction:")) {
      const id = Number(data.split(":")[1]);

      await setState(
        chat,
        "lesson_direction",
        null,
        id
      );

      await sendMessage(
        chat,
        "Введите новое название направления:"
      );

      return res.status(200).json({ ok: true });
    }

    if (data.startsWith("lesson_hall:")) {
      const id = Number(data.split(":")[1]);

      await setState(chat, "lesson_hall", null, id);

      await sendMessage(
        chat,
        "Введите номер зала: 1, 2, 3 или 5.\nДля тренажёрного зала напишите: Тренажерный зал"
      );

      return res.status(200).json({ ok: true });
    }

    // ========================================
    // УДАЛЕНИЕ ЗАНЯТИЯ
    // ========================================

    if (data.startsWith("lesson_delete:")) {
      const id = Number(data.split(":")[1]);

      const rows = await sql`
        SELECT trainer_id
        FROM schedule
        WHERE id = ${id}
        LIMIT 1
      `;

      if (!rows.length) {
        await sendMessage(chat, "Занятие уже удалено.");

        return res.status(200).json({ ok: true });
      }

      const trainerId = rows[0].trainer_id;

      await sql`
        DELETE FROM schedule
        WHERE id = ${id}
      `;

      await sendMessage(
        chat,
        "🗑 Занятие удалено."
      );

      await showScheduleAdmin(
        chat,
        trainerId
      );

      return res.status(200).json({ ok: true });
    }

    // ========================================
    // ДОБАВЛЕНИЕ ЗАНЯТИЯ
    // ========================================

    if (data.startsWith("add_lesson:")) {
      const trainerId =
        Number(data.split(":")[1]);

      await setState(
        chat,
        "add_lesson_day",
        trainerId
      );

      await sendMessage(
        chat,
        "Введите день нового занятия.\nНапример: СР"
      );

      return res.status(200).json({ ok: true });
    }

    // ========================================
    // ИЗМЕНЕНИЕ ИМЕНИ И ТЕЛЕФОНА
    // ========================================

    if (data.startsWith("edit_name:")) {
      const id = Number(data.split(":")[1]);

      await setState(
        chat,
        "edit_name",
        id
      );

      await sendMessage(
        chat,
        "Введите новое имя тренера:"
      );

      return res.status(200).json({ ok: true });
    }

    if (data.startsWith("edit_phone:")) {
      const id = Number(data.split(":")[1]);

      await setState(
        chat,
        "edit_phone",
        id
      );

      await sendMessage(
        chat,
        "Введите новый номер телефона:"
      );

      return res.status(200).json({ ok: true });
    }

    // ========================================
    // ДОБАВЛЕНИЕ ТРЕНЕРА
    // ========================================

    if (data === "add_trainer") {
      await setState(
        chat,
        "add_trainer_name"
      );

      await sendMessage(
        chat,
        "Введите имя и фамилию нового тренера:"
      );

      return res.status(200).json({ ok: true });
    }

    // ========================================
    // НАПРАВЛЕНИЯ
    // ========================================

    if (data.startsWith("admin_directions:")) {
      const trainerId =
        Number(data.split(":")[1]);

      await showDirectionsAdmin(
        chat,
        trainerId
      );

      return res.status(200).json({ ok: true });
    }

    if (data.startsWith("direction:")) {
      const directionId =
        Number(data.split(":")[1]);

      await showDirectionAdmin(
        chat,
        directionId
      );

      return res.status(200).json({ ok: true });
    }

    if (data.startsWith("direction_name:")) {
      const directionId =
        Number(data.split(":")[1]);

      await setState(
        chat,
        "direction_name",
        null,
        directionId
      );

      await sendMessage(
        chat,
        "Введите новое название направления:"
      );

      return res.status(200).json({ ok: true });
    }

    if (data.startsWith("direction_desc:")) {
      const directionId =
        Number(data.split(":")[1]);

      await setState(
        chat,
        "direction_desc",
        null,
        directionId
      );

      await sendMessage(
        chat,
        "Введите новое описание направления:"
      );

      return res.status(200).json({ ok: true });
    }

    // ========================================
    // УДАЛЕНИЕ НАПРАВЛЕНИЯ
    // ========================================

    if (data.startsWith("direction_delete:")) {
      const directionId =
        Number(data.split(":")[1]);

      const rows = await sql`
        SELECT trainer_id
        FROM directions
        WHERE id = ${directionId}
        LIMIT 1
      `;

      if (!rows.length) {
        await sendMessage(
          chat,
          "Направление уже удалено."
        );

        return res.status(200).json({ ok: true });
      }

      const trainerId =
        rows[0].trainer_id;

      await sql`
        DELETE FROM directions
        WHERE id = ${directionId}
      `;

      await sendMessage(
        chat,
        "🗑 Направление удалено."
      );

      await showDirectionsAdmin(
        chat,
        trainerId
      );

      return res.status(200).json({ ok: true });
    }

    // ========================================
    // ДОБАВЛЕНИЕ НАПРАВЛЕНИЯ
    // ========================================

    if (data.startsWith("add_direction:")) {
      const trainerId =
        Number(data.split(":")[1]);

      await setState(
        chat,
        "add_direction_name",
        trainerId
      );

      await sendMessage(
        chat,
        "Введите название нового направления:"
      );

      return res.status(200).json({ ok: true });
    }

    // ========================================
    // ОБЩЕЕ РАСПИСАНИЕ
    // ========================================

    if (data === "week") {
      await sendMessage(
        chat,
        "📅 Общее расписание подключим следующим модулем.\n\nТеперь данные для него уже хранятся в Neon.",
        [
          [
            {
              text: "🏠 В меню",
              callback_data: "home"
            }
          ]
        ]
      );

      return res.status(200).json({ ok: true });
    }

    // Если пришла неизвестная команда
    await sendMessage(
      chat,
      "Выберите действие:",
      mainKeyboard()
    );

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error("TITAN BOT ERROR:", error);

    return res.status(200).json({
      ok: false,
      error: String(error)
    });
  }
};
