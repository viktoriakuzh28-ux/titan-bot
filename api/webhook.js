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
      ? {
          inline_keyboard: keyboard
        }
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

  if (!rows.length) {
    return null;
  }

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

async function getTrainersByIds(ids) {
  if (!ids || !ids.length) {
    return [];
  }

  const cleanIds = ids
    .map(Number)
    .filter(Number.isInteger);

  if (!cleanIds.length) {
    return [];
  }

  const trainers = await sql`
    SELECT *
    FROM trainers
    WHERE id = ANY(${cleanIds})
  `;

  const result = [];

  for (const id of cleanIds) {
    const trainer = trainers.find(
      t => Number(t.id) === Number(id)
    );

    if (!trainer) {
      continue;
    }

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

    result.push({
      ...trainer,
      directions,
      schedule
    });
  }

  return result;
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
  async function trainerSelectionKeyboard(
  prefix,
  selectedIds = []
) {
  const trainers = await getTrainers();

  return trainers.map(t => {
    const selected =
      selectedIds.includes(Number(t.id));

    return [
      {
        text: `${selected ? "✅ " : ""}${t.name}`,
        callback_data: `${prefix}:${t.id}`
      }
    ];
  });
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

// ==========================================
// ИНФОГРАФИКА ТРЕНЕРОВ — 1 / 2 / 3
// ==========================================

function makeMultiTrainerPoster(
  trainers,
  theme = "color"
) {
  const bw = theme === "bw";

  const C = {
    bg: bw ? "#ffffff" : "#090909",
    surface: bw ? "#f4f4f4" : "#151515",
    surface2: bw ? "#fafafa" : "#101010",
    text: bw ? "#050505" : "#ffffff",
    muted: bw ? "#555555" : "#bdbdbd",
    accent: bw ? "#000000" : "#ff6a00",
    line: bw ? "#cfcfcf" : "#333333",
    ghost: bw ? "#eeeeee" : "#151515"
  };

  // ==========================================
  // СТРОГО A4
  // ==========================================

  const W = 1240;
  const H = 1754;

  const PAD = 50;

  const HEADER_H = 180;
  const HALLS_H = 120;
  const FOOTER_H = 65;

  const count = Math.max(
    1,
    Math.min(trainers.length, 3)
  );

  // Вся центральная площадь отдаётся тренерам
  const trainersAreaTop = HEADER_H;
  const trainersAreaBottom =
    H - HALLS_H - FOOTER_H;

  const trainersAreaH =
    trainersAreaBottom -
    trainersAreaTop;

  const CARD_GAP =
    count === 1
      ? 0
      : count === 2
        ? 18
        : 12;

  const cardH =
    (
      trainersAreaH -
      CARD_GAP * (count - 1)
    ) / count;

  // ==========================================
  // ШРИФТЫ
  // ==========================================

  const S = {
    1: {
      name: 48,
      phone: 25,
      section: 22,
      dirName: 25,
      desc: 20,
      table: 20,
      tableHead: 18,
      rowH: 52
    },

    2: {
      name: 39,
      phone: 22,
      section: 19,
      dirName: 22,
      desc: 17,
      table: 17,
      tableHead: 16,
      rowH: 44
    },

    3: {
      name: 31,
      phone: 19,
      section: 16,
      dirName: 18,
      desc: 14,
      table: 14,
      tableHead: 14,
      rowH: 36
    }
  }[count];

  // ==========================================
  // SVG
  // ==========================================

  let svg = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="210mm"
  height="297mm"
  viewBox="0 0 ${W} ${H}"
  preserveAspectRatio="xMidYMid meet"
>

    <rect
      width="${W}"
      height="${H}"
      fill="${C.bg}"
    />

    <rect
      x="0"
      y="0"
      width="${W}"
      height="14"
      fill="${C.accent}"
    />

    <text
      x="${PAD}"
      y="67"
      fill="${C.accent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="48"
      font-weight="900"
    >ТИТАН</text>

    <text
      x="${W - PAD}"
      y="65"
      text-anchor="end"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="18"
      font-weight="900"
      letter-spacing="3"
    >СПОРТИВНЫЙ КОМПЛЕКС · САРАПУЛ</text>

    <line
      x1="${PAD}"
      y1="92"
      x2="${W - PAD}"
      y2="92"
      stroke="${C.accent}"
      stroke-width="4"
    />

    <text
      x="${PAD}"
      y="145"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="38"
      font-weight="900"
    >ТРЕНЕРЫ «ТИТАН»</text>

    <text
      x="${W - PAD}"
      y="145"
      text-anchor="end"
      fill="${C.ghost}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="70"
      font-weight="900"
    >ТИТАН</text>
  `;

  // ==========================================
  // КАРТОЧКИ
  // ==========================================

  trainers
    .slice(0, 3)
    .forEach(
      (trainer, trainerIndex) => {

        const directions =
          Array.isArray(
            trainer.directions
          )
            ? trainer.directions
            : [];

        const schedule =
          Array.isArray(
            trainer.schedule
          )
            ? trainer.schedule
            : [];

        const cardY =
          trainersAreaTop +
          trainerIndex *
            (cardH + CARD_GAP);

        const cardX = PAD;
        const cardW =
          W - PAD * 2;

        const innerX =
          cardX + 30;

        const innerW =
          cardW - 60;

        const innerTop =
          cardY + 25;

        const innerBottom =
          cardY +
          cardH -
          25;

        const innerH =
          innerBottom -
          innerTop;

        // ======================================
        // ПОДГОТАВЛИВАЕМ ТЕКСТ НАПРАВЛЕНИЙ
        // ======================================

        const preparedDirs =
          directions.map(d => {
            const lines =
              d.description
                ? splitText(
                    d.description,
                    count === 1
                      ? 85
                      : count === 2
                        ? 72
                        : 62
                  )
                : [];

            return {
              name:
                d.name || "",
              lines
            };
          });

        // ======================================
        // СЧИТАЕМ ЕСТЕСТВЕННУЮ ВЫСОТУ
        // ======================================

        const headerNatural =
          S.name + 65;

        let dirsNatural = 0;

        preparedDirs.forEach(d => {
          dirsNatural +=
            S.dirName +
            10;

          dirsNatural +=
            d.lines.length *
            (S.desc + 5);

          dirsNatural += 12;
        });

        if (!preparedDirs.length) {
          dirsNatural =
            S.desc + 20;
        }

        const scheduleNatural =
          40 +
          schedule.length *
            (S.rowH + 4);

        let naturalH =
          headerNatural +
          40 +
          dirsNatural +
          40 +
          scheduleNatural;

        // ======================================
        // ЕСЛИ ДАННЫХ МНОГО —
        // УМЕНЬШАЕМ ВЕСЬ ВНУТРЕННИЙ КОНТЕНТ
        // ======================================

        let scale = 1;

        if (
          naturalH >
          innerH
        ) {
          scale =
            innerH /
            naturalH;
        }

        // Не делаем слишком мелко
        scale =
          Math.max(
            scale,
            count === 3
              ? 0.72
              : count === 2
                ? 0.78
                : 0.82
          );

        const scaledNaturalH =
          naturalH * scale;

        // ======================================
        // ЕСЛИ МЕСТА МНОГО —
        // РАСТЯГИВАЕМ ИНТЕРВАЛЫ,
        // А НЕ ОСТАВЛЯЕМ ПУСТУЮ ПОЛОВИНУ
        // ======================================

        const freeSpace =
          Math.max(
            0,
            innerH -
            scaledNaturalH
          );

        const stretchPoints =
          Math.max(
            3,
            directions.length +
            schedule.length +
            2
          );

        const extraGap =
          freeSpace /
          stretchPoints;

        svg += `
          <rect
            x="${cardX}"
            y="${cardY}"
            width="${cardW}"
            height="${cardH}"
            rx="22"
            fill="${C.surface}"
            stroke="${C.line}"
            stroke-width="2"
          />

          <rect
            x="${cardX}"
            y="${cardY}"
            width="10"
            height="${cardH}"
            rx="5"
            fill="${C.accent}"
          />

          <g
            transform="
              translate(
                ${innerX},
                ${innerTop}
              )
              scale(${scale})
            "
          >
        `;

        let y = 0;

        // ======================================
        // ИМЯ
        // ======================================

        svg += `
          <text
            x="0"
            y="${S.name}"
            fill="${C.accent}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="18"
            font-weight="900"
          >${String(
            trainerIndex + 1
          ).padStart(2, "0")}</text>

          <text
            x="58"
            y="${S.name}"
            fill="${C.text}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="${S.name}"
            font-weight="900"
          >${esc(
            trainer.name || ""
          ).toUpperCase()}</text>

          <text
            x="${
              innerW / scale
            }"
            y="${S.name}"
            text-anchor="end"
            fill="${C.accent}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="${S.phone}"
            font-weight="900"
          >${esc(
            trainer.phone || ""
          )}</text>
        `;

        y =
          S.name + 24;

        svg += `
          <line
            x1="0"
            y1="${y}"
            x2="${
              innerW / scale
            }"
            y2="${y}"
            stroke="${C.line}"
            stroke-width="2"
          />
        `;

        y +=
          35 +
          extraGap / scale;

        // ======================================
        // НАПРАВЛЕНИЯ
        // ======================================

        svg += `
          <text
            x="0"
            y="${y}"
            fill="${C.muted}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="${S.section}"
            font-weight="900"
            letter-spacing="2"
          >НАПРАВЛЕНИЯ</text>
        `;

        y +=
          S.section + 18;

        if (
          preparedDirs.length
        ) {
          preparedDirs.forEach(
            direction => {

              svg += `
                <text
                  x="0"
                  y="${y}"
                  fill="${C.accent}"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="${S.dirName}"
                  font-weight="900"
                >${esc(
                  direction.name
                )}</text>
              `;

              y +=
                S.dirName + 9;

              direction.lines.forEach(
                line => {

                  svg += `
                    <text
                      x="0"
                      y="${y}"
                      fill="${C.text}"
                      font-family="Arial, Helvetica, sans-serif"
                      font-size="${S.desc}"
                      font-weight="600"
                    >${esc(line)}</text>
                  `;

                  y +=
                    S.desc + 5;
                }
              );

              y +=
                12 +
                extraGap /
                  scale;
            }
          );
        } else {
          svg += `
            <text
              x="0"
              y="${y}"
              fill="${C.muted}"
              font-family="Arial, Helvetica, sans-serif"
              font-size="${S.desc}"
              font-weight="700"
            >Направления не добавлены</text>
          `;

          y +=
            S.desc +
            20 +
            extraGap /
              scale;
        }

        // ======================================
        // РАСПИСАНИЕ
        // ======================================

        y += 10;

        svg += `
          <text
            x="0"
            y="${y}"
            fill="${C.muted}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="${S.section}"
            font-weight="900"
            letter-spacing="2"
          >РАСПИСАНИЕ</text>
        `;

        y +=
          S.section + 16;

        const tableW =
          innerW / scale;

        svg += `
          <rect
            x="0"
            y="${y}"
            width="${tableW}"
            height="40"
            rx="8"
            fill="${C.accent}"
          />

          <text
            x="18"
            y="${y + 27}"
            fill="${
              bw
                ? "#ffffff"
                : "#050505"
            }"
            font-family="Arial, Helvetica, sans-serif"
            font-size="${S.tableHead}"
            font-weight="900"
          >ДЕНЬ</text>

          <text
            x="120"
            y="${y + 27}"
            fill="${
              bw
                ? "#ffffff"
                : "#050505"
            }"
            font-family="Arial, Helvetica, sans-serif"
            font-size="${S.tableHead}"
            font-weight="900"
          >ВРЕМЯ</text>

          <text
            x="280"
            y="${y + 27}"
            fill="${
              bw
                ? "#ffffff"
                : "#050505"
            }"
            font-family="Arial, Helvetica, sans-serif"
            font-size="${S.tableHead}"
            font-weight="900"
          >НАПРАВЛЕНИЕ</text>

          <text
            x="${tableW - 18}"
            y="${y + 27}"
            text-anchor="end"
            fill="${
              bw
                ? "#ffffff"
                : "#050505"
            }"
            font-family="Arial, Helvetica, sans-serif"
            font-size="${S.tableHead}"
            font-weight="900"
          >ЗАЛ</text>
        `;

        y += 46;

        if (
          schedule.length
        ) {
          schedule.forEach(
            (s, rowIndex) => {

              svg += `
                <rect
                  x="0"
                  y="${y}"
                  width="${tableW}"
                  height="${S.rowH}"
                  rx="7"
                  fill="${
                    rowIndex % 2 === 0
                      ? C.surface2
                      : C.surface
                  }"
                  stroke="${C.line}"
                  stroke-width="1"
                />

                <text
                  x="18"
                  y="${
                    y +
                    S.rowH / 2 +
                    7
                  }"
                  fill="${C.accent}"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="${S.table}"
                  font-weight="900"
                >${esc(
                  s.day || ""
                )}</text>

                <text
                  x="120"
                  y="${
                    y +
                    S.rowH / 2 +
                    7
                  }"
                  fill="${C.text}"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="${S.table}"
                  font-weight="900"
                >${esc(
                  s.time || ""
                )}</text>

                <text
                  x="280"
                  y="${
                    y +
                    S.rowH / 2 +
                    7
                  }"
                  fill="${C.text}"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="${S.table}"
                  font-weight="700"
                >${esc(
                  s.direction || ""
                )}</text>

                <text
                  x="${tableW - 18}"
                  y="${
                    y +
                    S.rowH / 2 +
                    7
                  }"
                  text-anchor="end"
                  fill="${C.accent}"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="${S.table}"
                  font-weight="900"
                >${esc(
                  shortHall(
                    s.hall
                  )
                )}</text>
              `;

              y +=
                S.rowH +
                4 +
                extraGap /
                  scale;
            }
          );
        } else {
          svg += `
            <text
              x="0"
              y="${y + 30}"
              fill="${C.muted}"
              font-family="Arial, Helvetica, sans-serif"
              font-size="${S.table}"
              font-weight="700"
            >Расписание пока не добавлено</text>
          `;
        }

        svg += `
          </g>
        `;
      }
    );

  // ==========================================
  // ЗАЛЫ
  // ==========================================

  const hallsY =
    trainersAreaBottom + 10;

  svg += `
    <rect
      x="${PAD}"
      y="${hallsY}"
      width="${W - PAD * 2}"
      height="95"
      rx="16"
      fill="${C.surface}"
      stroke="${C.line}"
      stroke-width="2"
    />

    <text
      x="${PAD + 22}"
      y="${hallsY + 31}"
      fill="${C.accent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="18"
      font-weight="900"
    >ЗАЛЫ «ТИТАН»</text>

    <text
      x="${PAD + 22}"
      y="${hallsY + 65}"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="15"
      font-weight="800"
    >1 — ${esc(
      hallNames["1"]
    )}</text>

    <text
      x="${PAD + 260}"
      y="${hallsY + 65}"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="15"
      font-weight="800"
    >2 — ${esc(
      hallNames["2"]
    )}</text>

    <text
      x="${PAD + 530}"
      y="${hallsY + 65}"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="15"
      font-weight="800"
    >3 — ${esc(
      hallNames["3"]
    )}</text>

    <text
      x="${PAD + 760}"
      y="${hallsY + 65}"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="15"
      font-weight="800"
    >5 — ${esc(
      hallNames["5"]
    )}</text>

    <text
      x="${PAD + 970}"
      y="${hallsY + 65}"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="15"
      font-weight="800"
    >GYM</text>
  `;

  // ==========================================
  // FOOTER
  // ==========================================

  const footerY =
    H - 30;

  svg += `
    <text
      x="${PAD}"
      y="${footerY}"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="17"
      font-weight="800"
    >г. Сарапул · ул. Советская, 46</text>

    <text
      x="${W - PAD}"
      y="${footerY}"
      text-anchor="end"
      fill="${C.accent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="19"
      font-weight="900"
    >ТИТАН · САРАПУЛ</text>

    </svg>
  `;

  return svg;
}

// ==========================================
// ОБЩЕЕ РАСПИСАНИЕ — ИНФОГРАФИКА
// ==========================================

function makeWeekPoster(
  rows,
  theme = "color"
) {
  const bw = theme === "bw";

  const C = {
    bg: bw ? "#ffffff" : "#090909",
    surface: bw ? "#f3f3f3" : "#151515",
    surface2: bw ? "#fafafa" : "#101010",
    text: bw ? "#050505" : "#ffffff",
    muted: bw ? "#555555" : "#bdbdbd",
    accent: bw ? "#000000" : "#ff6a00",
    line: bw ? "#cccccc" : "#333333",
    ghost: bw ? "#eeeeee" : "#151515"
  };

  const W = 1240;
  const PAD = 60;

  const dayOrder = {
    ПН: 1,
    ВТ: 2,
    СР: 3,
    ЧТ: 4,
    ПТ: 5,
    СБ: 6,
    ВС: 7
  };

  // ========================================
  // СОРТИРОВКА
  // ========================================

  const sortedRows = [...rows].sort(
    (a, b) => {
      const dayDiff =
        (dayOrder[a.day] || 99) -
        (dayOrder[b.day] || 99);

      if (dayDiff !== 0) {
        return dayDiff;
      }

      return String(a.time || "")
        .localeCompare(
          String(b.time || "")
        );
    }
  );

  // ========================================
  // ГРУППИРОВКА ПО ДНЯМ
  // ========================================

  const grouped = {};

  sortedRows.forEach(row => {
    if (!grouped[row.day]) {
      grouped[row.day] = [];
    }

    grouped[row.day].push(row);
  });

  const days = Object.keys(grouped)
    .sort(
      (a, b) =>
        (dayOrder[a] || 99) -
        (dayOrder[b] || 99)
    );

  // ========================================
  // РАСЧЕТ ВЫСОТЫ
  // ========================================

  const HEADER_H = 265;

  let scheduleHeight = 0;

  days.forEach(day => {
    scheduleHeight +=
      70 +
      grouped[day].length * 58 +
      28;
  });

  if (!days.length) {
    scheduleHeight = 180;
  }

  const HALLS_H = 210;
  const FOOTER_H = 120;

  const H =
    HEADER_H +
    scheduleHeight +
    HALLS_H +
    FOOTER_H;

  // ========================================
  // ШАПКА
  // ========================================

  let svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="${W}"
      height="${H}"
      viewBox="0 0 ${W} ${H}"
    >

      <rect
        width="${W}"
        height="${H}"
        fill="${C.bg}"
      />

      <rect
        x="0"
        y="0"
        width="${W}"
        height="16"
        fill="${C.accent}"
      />

      <text
        x="${W - PAD}"
        y="220"
        text-anchor="end"
        fill="${C.ghost}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="190"
        font-weight="900"
      >ТИТАН</text>

      <text
        x="${PAD}"
        y="82"
        fill="${C.accent}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="50"
        font-weight="900"
      >ТИТАН</text>

      <text
        x="${W - PAD}"
        y="80"
        text-anchor="end"
        fill="${C.muted}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="20"
        font-weight="900"
        letter-spacing="3"
      >ОБЩЕЕ РАСПИСАНИЕ</text>

      <line
        x1="${PAD}"
        y1="112"
        x2="${W - PAD}"
        y2="112"
        stroke="${C.accent}"
        stroke-width="5"
      />

      <text
        x="${PAD}"
        y="180"
        fill="${C.text}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="52"
        font-weight="900"
      >РАСПИСАНИЕ «ТИТАН»</text>

      <text
        x="${PAD}"
        y="220"
        fill="${C.muted}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="22"
        font-weight="800"
        letter-spacing="2"
      >ГРУППОВЫЕ ТРЕНИРОВКИ</text>
  `;

  let y = HEADER_H;

  // ========================================
  // РАСПИСАНИЕ ПО ДНЯМ
  // ========================================

  if (!days.length) {
    svg += `
      <rect
        x="${PAD}"
        y="${y}"
        width="${W - PAD * 2}"
        height="120"
        rx="22"
        fill="${C.surface}"
        stroke="${C.line}"
        stroke-width="2"
      />

      <text
        x="${W / 2}"
        y="${y + 70}"
        text-anchor="middle"
        fill="${C.muted}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="25"
        font-weight="800"
      >Расписание пока не добавлено</text>
    `;

    y += 150;
  }

  days.forEach(day => {
    const dayRows = grouped[day];

    // ======================================
    // НАЗВАНИЕ ДНЯ
    // ======================================

    svg += `
      <rect
        x="${PAD}"
        y="${y}"
        width="${W - PAD * 2}"
        height="54"
        rx="16"
        fill="${C.accent}"
      />

      <text
        x="${PAD + 26}"
        y="${y + 36}"
        fill="${
          bw
            ? "#ffffff"
            : "#050505"
        }"
        font-family="Arial, Helvetica, sans-serif"
        font-size="24"
        font-weight="900"
      >${esc(day)}</text>
    `;

    y += 66;

    // ======================================
    // ШАПКА ТАБЛИЦЫ
    // ======================================

    svg += `
      <rect
        x="${PAD}"
        y="${y}"
        width="${W - PAD * 2}"
        height="44"
        rx="10"
        fill="${C.surface}"
        stroke="${C.line}"
        stroke-width="2"
      />

      <text
        x="${PAD + 24}"
        y="${y + 29}"
        fill="${C.muted}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="16"
        font-weight="900"
        letter-spacing="1"
      >ВРЕМЯ</text>

      <text
        x="${PAD + 175}"
        y="${y + 29}"
        fill="${C.muted}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="16"
        font-weight="900"
        letter-spacing="1"
      >НАПРАВЛЕНИЕ</text>

      <text
        x="${PAD + 650}"
        y="${y + 29}"
        fill="${C.muted}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="16"
        font-weight="900"
        letter-spacing="1"
      >ТРЕНЕР</text>

      <text
        x="${W - PAD - 24}"
        y="${y + 29}"
        text-anchor="end"
        fill="${C.muted}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="16"
        font-weight="900"
        letter-spacing="1"
      >ЗАЛ</text>
    `;

    y += 52;

    // ======================================
    // СТРОКИ
    // ======================================

    dayRows.forEach(
      (row, index) => {
        const trainerName =
          row.trainer_name ||
          row.trainer ||
          row.name ||
          "";

        svg += `
          <rect
            x="${PAD}"
            y="${y}"
            width="${W - PAD * 2}"
            height="50"
            rx="10"
            fill="${
              index % 2 === 0
                ? C.surface2
                : C.surface
            }"
            stroke="${C.line}"
            stroke-width="1"
          />

          <text
            x="${PAD + 24}"
            y="${y + 32}"
            fill="${C.accent}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="21"
            font-weight="900"
          >${esc(
            row.time || ""
          )}</text>

          <text
            x="${PAD + 175}"
            y="${y + 32}"
            fill="${C.text}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="19"
            font-weight="800"
          >${esc(
            row.direction || ""
          )}</text>

          <text
            x="${PAD + 650}"
            y="${y + 32}"
            fill="${C.text}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="18"
            font-weight="800"
          >${esc(
            trainerName
          )}</text>

          <text
            x="${W - PAD - 24}"
            y="${y + 32}"
            text-anchor="end"
            fill="${C.accent}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="18"
            font-weight="900"
          >${esc(
            shortHall(
              row.hall
            )
          )}</text>
        `;

        y += 58;
      }
    );

    y += 28;
  });

  // ========================================
  // ЗАЛЫ
  // ========================================

  const hallsY = y + 5;

  svg += `
    <rect
      x="${PAD}"
      y="${hallsY}"
      width="${W - PAD * 2}"
      height="165"
      rx="22"
      fill="${C.surface}"
      stroke="${C.line}"
      stroke-width="2"
    />

    <text
      x="${PAD + 30}"
      y="${hallsY + 42}"
      fill="${C.accent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="22"
      font-weight="900"
      letter-spacing="2"
    >ЗАЛЫ «ТИТАН»</text>

    <text
      x="${PAD + 30}"
      y="${hallsY + 78}"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="20"
      font-weight="800"
    >ЗАЛ 1 — ${esc(
      hallNames["1"]
    )}</text>

    <text
      x="${PAD + 30}"
      y="${hallsY + 112}"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="20"
      font-weight="800"
    >ЗАЛ 2 — ${esc(
      hallNames["2"]
    )}</text>

    <text
      x="${PAD + 600}"
      y="${hallsY + 78}"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="20"
      font-weight="800"
    >ЗАЛ 3 — ${esc(
      hallNames["3"]
    )}</text>

    <text
      x="${PAD + 600}"
      y="${hallsY + 112}"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="20"
      font-weight="800"
    >ЗАЛ 5 — ${esc(
      hallNames["5"]
    )}</text>

    <text
      x="${PAD + 30}"
      y="${hallsY + 145}"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="20"
      font-weight="800"
    >ТРЕНАЖЕРНЫЙ ЗАЛ — ${esc(
      hallNames.GYM
    )}</text>
  `;

  // ========================================
  // ФУТЕР
  // ========================================

  const footerY = H - 70;

  svg += `
    <text
      x="${PAD}"
      y="${footerY}"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="20"
      font-weight="800"
    >г. Сарапул · ул. Советская, 46</text>

    <text
      x="${W - PAD}"
      y="${footerY}"
      text-anchor="end"
      fill="${C.accent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="22"
      font-weight="900"
    >ТИТАН · САРАПУЛ</text>

    <line
      x1="${PAD}"
      y1="${footerY + 25}"
      x2="${W - PAD}"
      y2="${footerY + 25}"
      stroke="${C.accent}"
      stroke-width="6"
    />

    </svg>
  `;

  return svg;
}
async function sendMultiTrainerPoster(
  chat,
  trainerIds,
  theme = "color"
) {
  const trainers =
    await getTrainersByIds(trainerIds);

  if (!trainers.length) {
    throw new Error(
      "Не найдены выбранные тренеры"
    );
  }

  if (trainers.length !== trainerIds.length) {
    throw new Error(
      "Не удалось загрузить всех выбранных тренеров"
    );
  }

  const svg =
    makeMultiTrainerPoster(
      trainers,
      theme
    );

  const safeNames = trainers
    .map(t => t.name)
    .join("_")
    .replace(/[^\p{L}\p{N}_-]+/gu, "_");

  const filename =
    `TITAN_${safeNames}_${theme}.svg`;

  const form = new FormData();

  form.append(
    "chat_id",
    String(chat)
  );

  form.append(
    "document",
    new Blob(
      [svg],
      {
        type: "image/svg+xml"
      }
    ),
    filename
  );

  form.append(
    "caption",
    "🖼 ТИТАН — инфографика тренеров"
  );

  const response = await fetch(
    `${TG}/sendDocument`,
    {
      method: "POST",
      body: form
    }
  );

  if (!response.ok) {
    const body =
      await response.text();

    throw new Error(
      `Telegram sendDocument error: ${response.status} ${body}`
    );
  }

  return response;
}

// ==========================================
// ОТПРАВКА ОБЩЕГО РАСПИСАНИЯ
// ==========================================

async function sendWeekPoster(
  chat,
  theme = "color"
) {
  const rows =
    await getWeekSchedule();

  const svg =
    makeWeekPoster(
      rows,
      theme
    );

  const form =
    new FormData();

  form.append(
    "chat_id",
    String(chat)
  );

  form.append(
    "document",
    new Blob(
      [svg],
      {
        type: "image/svg+xml"
      }
    ),
    "titan-week-schedule.svg"
  );

  form.append(
    "caption",
    theme === "bw"
      ? "📅 Общее расписание «ТИТАН» — Ч/Б"
      : "📅 Общее расписание «ТИТАН»"
  );

  const response =
    await fetch(
      `${TG}/sendDocument`,
      {
        method: "POST",
        body: form
      }
    );

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `Telegram sendDocument error: ${response.status} ${body}`
    );
  }

  return response;
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

    if (query) {
      await api("answerCallbackQuery", {
        callback_query_id: query.id
      });
    }

    const data = query?.data || "";
    const text = message?.text || "";

    // ========================================
    // ГЛАВНОЕ МЕНЮ
    // ========================================

    if (
      text === "/start" ||
      data === "home"
    ) {
      await clearState(chat);

      await sendMessage(
        chat,
        "ТИТАН — генератор инфографики\n\nВыберите действие:",
        mainKeyboard()
      );

      return res.status(200).json({
        ok: true
      });
    }

    // ========================================
    // ТЕКСТОВЫЙ ВВОД
    // ========================================

    if (message && text) {
      const directionProcessed =
        await processDirectionState(
          chat,
          text
        );

      if (directionProcessed) {
        return res.status(200).json({
          ok: true
        });
      }

      const processed =
        await processStateMessage(
          chat,
          text
        );

      if (processed) {
        return res.status(200).json({
          ok: true
        });
      }
    }

    // ========================================
    // СОЗДАТЬ ИНФОГРАФИКУ
    // ========================================

    if (data === "create") {
      await sendMessage(
        chat,
        "🖼 ТИТАН — ГЕНЕРАТОР ИНФОГРАФИКИ\n\nВыберите, что создать:",
        [
          [
            {
              text: "👤 Тренеры",
              callback_data: "trainer_poster_menu"
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
              text: "⬅️ Назад",
              callback_data: "home"
            }
          ]
        ]
      );

      return res.status(200).json({
        ok: true
      });
    }

    // ========================================
    // ИНФОГРАФИКА ТРЕНЕРОВ
    // ========================================

    if (data === "trainer_poster_menu") {
      await clearState(chat);

      await sendMessage(
        chat,
        "👤 ИНФОГРАФИКА ТРЕНЕРОВ\n\nВыберите количество тренеров:",
        [
          [
            {
              text: "1️⃣ Один тренер",
              callback_data: "poster_count:1"
            }
          ],
          [
            {
              text: "2️⃣ Два тренера",
              callback_data: "poster_count:2"
            }
          ],
          [
            {
              text: "3️⃣ Три тренера",
              callback_data: "poster_count:3"
            }
          ],
          [
            {
              text: "⬅️ Назад",
              callback_data: "create"
            }
          ]
        ]
      );

      return res.status(200).json({
        ok: true
      });
    }

    if (data.startsWith("poster_count:")) {
      const count =
        Number(data.split(":")[1]);

      if (![1, 2, 3].includes(count)) {
        return res.status(200).json({
          ok: true
        });
      }

      await setState(
        chat,
        "poster_select_trainers",
        null,
        null,
        {
          count,
          selectedIds: []
        }
      );

      const keyboard =
        await trainerSelectionKeyboard(
          "poster_select",
          []
        );

      keyboard.push([
        {
          text: "⬅️ Назад",
          callback_data: "trainer_poster_menu"
        }
      ]);

      await sendMessage(
        chat,
        `Выберите тренера №1 из ${count}:`,
        keyboard
      );

      return res.status(200).json({
        ok: true
      });
    }

    if (data.startsWith("poster_select:")) {
      const trainerId =
        Number(data.split(":")[1]);

      const state =
        await getState(chat);

      if (
        !state ||
        state.action !==
          "poster_select_trainers"
      ) {
        return res.status(200).json({
          ok: true
        });
      }

      const info =
        state.data || {};

      const count =
        Number(info.count || 1);

      let selectedIds =
        Array.isArray(info.selectedIds)
          ? info.selectedIds.map(Number)
          : [];

      if (
        selectedIds.includes(trainerId)
      ) {
        selectedIds =
          selectedIds.filter(
            id => id !== trainerId
          );
      } else {
        if (
          selectedIds.length >= count
        ) {
          return res.status(200).json({
            ok: true
          });
        }

        selectedIds.push(trainerId);
      }

      await setState(
        chat,
        "poster_select_trainers",
        null,
        null,
        {
          count,
          selectedIds
        }
      );

      const keyboard =
        await trainerSelectionKeyboard(
          "poster_select",
          selectedIds
        );

      if (
        selectedIds.length === count
      ) {
        keyboard.push([
          {
            text: "✅ Продолжить",
            callback_data: "poster_theme"
          }
        ]);
      }

      keyboard.push([
        {
          text: "⬅️ Назад",
          callback_data: "trainer_poster_menu"
        }
      ]);

      await sendMessage(
        chat,
        `Выбрано: ${selectedIds.length} из ${count}`,
        keyboard
      );

      return res.status(200).json({
        ok: true
      });
    }

    if (data === "poster_theme") {
      const state =
        await getState(chat);

      if (
        !state ||
        state.action !==
          "poster_select_trainers"
      ) {
        return res.status(200).json({
          ok: true
        });
      }

      await sendMessage(
        chat,
        "Выберите вариант оформления:",
        [
          [
            {
              text: "🟧 Цветной",
              callback_data:
                "poster_generate:color"
            },
            {
              text: "⬜ Ч/Б",
              callback_data:
                "poster_generate:bw"
            }
          ],
          [
            {
              text: "⬅️ Назад",
              callback_data:
                "trainer_poster_menu"
            }
          ]
        ]
      );

      return res.status(200).json({
        ok: true
      });
    }

    if (
      data.startsWith(
        "poster_generate:"
      )
    ) {
      const theme =
        data.split(":")[1];

      if (
        theme !== "color" &&
        theme !== "bw"
      ) {
        return res.status(200).json({
          ok: true
        });
      }

      const state =
        await getState(chat);

      if (
        !state ||
        state.action !==
          "poster_select_trainers"
      ) {
        await sendMessage(
          chat,
          "⚠️ Выбор тренеров потерян. Начните заново."
        );

        return res.status(200).json({
          ok: true
        });
      }

      const info =
        state.data || {};

      const selectedIds =
        Array.isArray(
          info.selectedIds
        )
          ? info.selectedIds
              .map(Number)
              .filter(Boolean)
          : [];

      const count =
        Number(info.count || 0);

      if (
        ![1, 2, 3].includes(count) ||
        selectedIds.length !== count
      ) {
        await sendMessage(
          chat,
          "⚠️ Выберите нужное количество тренеров."
        );

        return res.status(200).json({
          ok: true
        });
      }

      await sendMessage(
        chat,
        "⏳ Готовлю инфографику…"
      );

      await sendMultiTrainerPoster(
        chat,
        selectedIds,
        theme
      );

      await clearState(chat);

      await sendMessage(
        chat,
        "✅ Инфографика готова.",
        [
          [
            {
              text: "👤 Другие тренеры",
              callback_data:
                "trainer_poster_menu"
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
              text: "🏠 В меню",
              callback_data: "home"
            }
          ]
        ]
      );

      return res.status(200).json({
        ok: true
      });
    }

    // ========================================
    // СПИСОК ТРЕНЕРОВ
    // ========================================

    if (data === "trainers") {
      const trainers =
        await getTrainers();

      const list =
        trainers
          .map(
            (t, i) =>
              `${i + 1}. ${t.name} — ${t.phone || "без телефона"}`
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

      return res.status(200).json({
        ok: true
      });
    }

    // ========================================
    // АДМИН-МЕНЮ
    // ========================================

    if (data === "admin") {
      await showAdmin(chat);

      return res.status(200).json({
        ok: true
      });
    }

    if (data === "admin_trainers") {
      const keyboard =
        await trainerKeyboard(
          "admin_trainer"
        );

      await sendMessage(
        chat,
        "Выберите тренера:",
        keyboard
      );

      return res.status(200).json({
        ok: true
      });
    }

    if (
      data.startsWith(
        "admin_trainer:"
      )
    ) {
      const id =
        Number(data.split(":")[1]);

      await showTrainerAdmin(
        chat,
        id
      );

      return res.status(200).json({
        ok: true
      });
    }

    // ========================================
    // РАСПИСАНИЕ ТРЕНЕРА
    // ========================================

    if (
      data.startsWith(
        "admin_schedule:"
      )
    ) {
      const id =
        Number(data.split(":")[1]);

      await showScheduleAdmin(
        chat,
        id
      );

      return res.status(200).json({
        ok: true
      });
    }

    if (
      data.startsWith("lesson:")
    ) {
      const id =
        Number(data.split(":")[1]);

      await showLessonAdmin(
        chat,
        id
      );

      return res.status(200).json({
        ok: true
      });
    }

    if (
      data.startsWith(
        "lesson_day:"
      )
    ) {
      const id =
        Number(data.split(":")[1]);

      await setState(
        chat,
        "lesson_day",
        null,
        id
      );

      await sendMessage(
        chat,
        "Введите новый день.\nНапример: ПН, ВТ, СР, ЧТ, ПТ, СБ или ВС"
      );

      return res.status(200).json({
        ok: true
      });
    }

    if (
      data.startsWith(
        "lesson_time:"
      )
    ) {
      const id =
        Number(data.split(":")[1]);

      await setState(
        chat,
        "lesson_time",
        null,
        id
      );

      await sendMessage(
        chat,
        "Введите новое время.\nНапример: 18:30"
      );

      return res.status(200).json({
        ok: true
      });
    }

    if (
      data.startsWith(
        "lesson_direction:"
      )
    ) {
      const id =
        Number(data.split(":")[1]);

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

      return res.status(200).json({
        ok: true
      });
    }

    if (
      data.startsWith(
        "lesson_hall:"
      )
    ) {
      const id =
        Number(data.split(":")[1]);

      await setState(
        chat,
        "lesson_hall",
        null,
        id
      );

      await sendMessage(
        chat,
        "Введите номер зала: 1, 2, 3 или 5.\nДля тренажёрного зала напишите: Тренажерный зал"
      );

      return res.status(200).json({
        ok: true
      });
    }

    if (
      data.startsWith(
        "lesson_delete:"
      )
    ) {
      const id =
        Number(data.split(":")[1]);

      const rows =
        await sql`
          SELECT trainer_id
          FROM schedule
          WHERE id = ${id}
          LIMIT 1
        `;

      if (!rows.length) {
        await sendMessage(
          chat,
          "Занятие уже удалено."
        );

        return res.status(200).json({
          ok: true
        });
      }

      const trainerId =
        rows[0].trainer_id;

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

      return res.status(200).json({
        ok: true
      });
    }

    if (
      data.startsWith(
        "add_lesson:"
      )
    ) {
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

      return res.status(200).json({
        ok: true
      });
    }

    // ========================================
    // ИМЯ / ТЕЛЕФОН / НОВЫЙ ТРЕНЕР
    // ========================================

    if (
      data.startsWith(
        "edit_name:"
      )
    ) {
      const id =
        Number(data.split(":")[1]);

      await setState(
        chat,
        "edit_name",
        id
      );

      await sendMessage(
        chat,
        "Введите новое имя тренера:"
      );

      return res.status(200).json({
        ok: true
      });
    }

    if (
      data.startsWith(
        "edit_phone:"
      )
    ) {
      const id =
        Number(data.split(":")[1]);

      await setState(
        chat,
        "edit_phone",
        id
      );

      await sendMessage(
        chat,
        "Введите новый номер телефона:"
      );

      return res.status(200).json({
        ok: true
      });
    }

    if (data === "add_trainer") {
      await setState(
        chat,
        "add_trainer_name"
      );

      await sendMessage(
        chat,
        "Введите имя и фамилию нового тренера:"
      );

      return res.status(200).json({
        ok: true
      });
    }

    // ========================================
    // НАПРАВЛЕНИЯ
    // ========================================

    if (
      data.startsWith(
        "admin_directions:"
      )
    ) {
      const trainerId =
        Number(data.split(":")[1]);

      await showDirectionsAdmin(
        chat,
        trainerId
      );

      return res.status(200).json({
        ok: true
      });
    }

    if (
      data.startsWith(
        "direction:"
      )
    ) {
      const directionId =
        Number(data.split(":")[1]);

      await showDirectionAdmin(
        chat,
        directionId
      );

      return res.status(200).json({
        ok: true
      });
    }

    if (
      data.startsWith(
        "direction_name:"
      )
    ) {
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

      return res.status(200).json({
        ok: true
      });
    }

    if (
      data.startsWith(
        "direction_desc:"
      )
    ) {
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

      return res.status(200).json({
        ok: true
      });
    }

    if (
      data.startsWith(
        "direction_delete:"
      )
    ) {
      const directionId =
        Number(data.split(":")[1]);

      const rows =
        await sql`
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

        return res.status(200).json({
          ok: true
        });
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

      return res.status(200).json({
        ok: true
      });
    }

    if (
      data.startsWith(
        "add_direction:"
      )
    ) {
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

      return res.status(200).json({
        ok: true
      });
    }

    // ========================================
    // ОБЩЕЕ РАСПИСАНИЕ
    // ========================================

    if (data === "week") {
      await sendMessage(
        chat,
        "📅 Выберите вариант общего расписания:",
        [
          [
            {
              text: "🟧 Цветное",
              callback_data:
                "week_color"
            },
            {
              text: "⬜ Ч/Б",
              callback_data:
                "week_bw"
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

      return res.status(200).json({
        ok: true
      });
    }

    if (data === "week_color") {
      await sendMessage(
        chat,
        "⏳ Готовлю общее расписание…"
      );

      await sendWeekPoster(
        chat,
        "color"
      );

      await sendMessage(
        chat,
        "✅ Общее расписание готово.",
        [
          [
            {
              text: "🏠 В меню",
              callback_data: "home"
            }
          ]
        ]
      );

      return res.status(200).json({
        ok: true
      });
    }

    if (data === "week_bw") {
      await sendMessage(
        chat,
        "⏳ Готовлю общее расписание…"
      );

      await sendWeekPoster(
        chat,
        "bw"
      );

      await sendMessage(
        chat,
        "✅ Общее расписание готово.",
        [
          [
            {
              text: "🏠 В меню",
              callback_data: "home"
            }
          ]
        ]
      );

      return res.status(200).json({
        ok: true
      });
    }

    // ========================================
    // НЕИЗВЕСТНАЯ КНОПКА
    // ========================================

    await sendMessage(
      chat,
      "Выберите действие:",
      mainKeyboard()
    );

    return res.status(200).json({
      ok: true
    });

  } catch (error) {
    console.error(
      "WEBHOOK ERROR:",
      error
    );

    return res.status(500).json({
      ok: false,
      error: "Internal server error"
    });
  }
};
