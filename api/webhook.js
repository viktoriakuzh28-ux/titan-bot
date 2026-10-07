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

  // ==========================================
// ТИТАН — ГЕНЕРАТОР ТРЕНЕРОВ
// 1 / 2 / 3 ТРЕНЕРА · A4 · ЦВЕТ / ЧБ
// ==========================================

function trainerPosterTheme(theme = "color") {
  const bw = theme === "bw";

  return {
    bw,
    bg: bw ? "#ffffff" : "#0b0d10",
    card: bw ? "#f7f7f7" : "#15181d",
    card2: bw ? "#ffffff" : "#1b1f25",
    text: bw ? "#111111" : "#ffffff",
    muted: bw ? "#666666" : "#b8bec8",
    line: bw ? "#d8d8d8" : "#30343b",
    accent: bw ? "#000000" : "#ff6a00",
    ghost: bw ? "#eeeeee" : "#171a20",
    onAccent: bw ? "#ffffff" : "#090909"
  };
}

function trainerPosterDayOrder(day) {
  const order = {
    ПН: 1,
    ВТ: 2,
    СР: 3,
    ЧТ: 4,
    ПТ: 5,
    СБ: 6,
    ВС: 7
  };

  return (
    order[
      String(day || "").toUpperCase()
    ] || 99
  );
}

function trainerPosterTimeOrder(time) {
  const match =
    String(time || "").match(
      /(\d{1,2}):(\d{2})/
    );

  if (!match) {
    return 9999;
  }

  return (
    Number(match[1]) * 60 +
    Number(match[2])
  );
}

function trainerPosterSortSchedule(rows) {
  return [...(rows || [])].sort(
    (a, b) => {
      const dayDiff =
        trainerPosterDayOrder(a.day) -
        trainerPosterDayOrder(b.day);

      if (dayDiff !== 0) {
        return dayDiff;
      }

      return (
        trainerPosterTimeOrder(a.time) -
        trainerPosterTimeOrder(b.time)
      );
    }
  );
}

function trainerPosterWrap(
  text,
  maxChars = 35
) {
  const words =
    String(text || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  const lines = [];
  let current = "";

  for (const word of words) {
    const next =
      current
        ? `${current} ${word}`
        : word;

    if (
      next.length > maxChars &&
      current
    ) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function trainerPosterLines(
  lines,
  x,
  y,
  size,
  color,
  weight = 700,
  gap = 20
) {
  return (lines || [])
    .map(
      (line, i) => `
        <text
          x="${x}"
          y="${y + i * gap}"
          fill="${color}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${size}"
          font-weight="${weight}"
        >${esc(line)}</text>
      `
    )
    .join("");
}

function trainerPosterHall(hall) {
  if (hall === "GYM") {
    return "ТРЕНАЖЕРНЫЙ";
  }

  return `ЗАЛ ${hall || ""}`;
}

function trainerPosterHeader(C) {
  return `
    <rect
      width="1240"
      height="1754"
      fill="${C.bg}"
    />

    <rect
      x="0"
      y="0"
      width="1240"
      height="14"
      fill="${C.accent}"
    />

    <text
      x="56"
      y="72"
      fill="${C.accent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="48"
      font-weight="900"
    >ТИТАН</text>

    <text
      x="1184"
      y="70"
      text-anchor="end"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="17"
      font-weight="900"
      letter-spacing="2"
    >СПОРТИВНЫЙ КОМПЛЕКС · САРАПУЛ</text>

    <line
      x1="56"
      y1="98"
      x2="1184"
      y2="98"
      stroke="${C.accent}"
      stroke-width="4"
    />

    <text
      x="56"
      y="154"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="46"
      font-weight="900"
    >ТРЕНЕРЫ «ТИТАН»</text>

    <text
      x="56"
      y="192"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="19"
      font-weight="900"
      letter-spacing="2"
    >АКТУАЛЬНОЕ РАСПИСАНИЕ</text>

    <text
      x="1184"
      y="182"
      text-anchor="end"
      fill="${C.ghost}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="82"
      font-weight="900"
    >ТИТАН</text>
  `;
}

function trainerPosterFooter(C) {
  return `
    <line
      x1="56"
      y1="1696"
      x2="1184"
      y2="1696"
      stroke="${C.accent}"
      stroke-width="4"
    />

    <text
      x="56"
      y="1730"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="15"
      font-weight="800"
    >г. Сарапул · ул. Советская, 46</text>

    <text
      x="1184"
      y="1730"
      text-anchor="end"
      fill="${C.accent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="17"
      font-weight="900"
    >ТИТАН · САРАПУЛ</text>
  `;
}


// ==========================================
// ТАБЛИЦА РАСПИСАНИЯ
// ==========================================

function trainerPosterSchedule({
  schedule,
  x,
  y,
  width,
  height,
  C,
  compact = false
}) {
  const rows =
    trainerPosterSortSchedule(
      schedule
    );

  if (!rows.length) {
    return `
      <rect
        x="${x}"
        y="${y}"
        width="${width}"
        height="58"
        rx="10"
        fill="${C.card2}"
        stroke="${C.line}"
      />

      <text
        x="${x + 18}"
        y="${y + 36}"
        fill="${C.muted}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="16"
        font-weight="700"
      >Расписание пока не заполнено</text>
    `;
  }

  const headH =
    compact ? 28 : 34;

  const minRowH =
    compact ? 24 : 32;

  const maxRowH =
    compact ? 38 : 64;

  let columns = 1;
  let rowH = 0;

  for (
    let testColumns = 1;
    testColumns <= 3;
    testColumns++
  ) {
    const rowsPerCol =
      Math.ceil(
        rows.length /
        testColumns
      );

    const candidate =
      Math.floor(
        (
          height -
          headH -
          8
        ) /
        rowsPerCol
      );

    if (
      candidate >= minRowH ||
      testColumns === 3
    ) {
      columns =
        testColumns;

      rowH =
        candidate;

      break;
    }
  }

  rowH =
    Math.max(
      minRowH,
      Math.min(
        maxRowH,
        rowH
      )
    );

  const gap = 12;

  const colW =
    (
      width -
      gap *
        (columns - 1)
    ) /
    columns;

  const rowsPerCol =
    Math.ceil(
      rows.length /
      columns
    );

  let svg = "";

  for (
    let col = 0;
    col < columns;
    col++
  ) {
    const cx =
      x +
      col *
        (colW + gap);

    svg += `
      <rect
        x="${cx}"
        y="${y}"
        width="${colW}"
        height="${headH}"
        rx="8"
        fill="${C.accent}"
      />

      <text
        x="${cx + 10}"
        y="${y + headH - 9}"
        fill="${C.onAccent}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${compact ? 10 : 13}"
        font-weight="900"
      >ДЕНЬ</text>

      <text
        x="${cx + 62}"
        y="${y + headH - 9}"
        fill="${C.onAccent}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${compact ? 10 : 13}"
        font-weight="900"
      >ВРЕМЯ</text>

      <text
        x="${cx + 145}"
        y="${y + headH - 9}"
        fill="${C.onAccent}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${compact ? 10 : 13}"
        font-weight="900"
      >НАПРАВЛЕНИЕ</text>

      <text
        x="${cx + colW - 10}"
        y="${y + headH - 9}"
        text-anchor="end"
        fill="${C.onAccent}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${compact ? 10 : 13}"
        font-weight="900"
      >ЗАЛ</text>
    `;
  }

  rows.forEach(
    (row, index) => {
      const col =
        Math.floor(
          index /
          rowsPerCol
        );

      const localIndex =
        index %
        rowsPerCol;

      const rx =
        x +
        col *
          (colW + gap);

      const ry =
        y +
        headH +
        6 +
        localIndex *
          rowH;

      const fontSize =
        compact
          ? Math.max(
              9,
              Math.min(
                14,
                rowH * 0.38
              )
            )
          : Math.max(
              12,
              Math.min(
                19,
                rowH * 0.34
              )
            );

      const maxDirection =
        columns === 1
          ? 38
          : columns === 2
          ? 19
          : 12;

      const direction =
        trainerPosterWrap(
          row.direction || "",
          maxDirection
        )[0] || "";

      svg += `
        <rect
          x="${rx}"
          y="${ry}"
          width="${colW}"
          height="${Math.max(
            18,
            rowH - 4
          )}"
          rx="8"
          fill="${
            localIndex % 2 === 0
              ? C.card2
              : C.card
          }"
          stroke="${C.line}"
          stroke-width="1"
        />

        <text
          x="${rx + 10}"
          y="${ry + rowH / 2 + 5}"
          fill="${C.accent}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${fontSize}"
          font-weight="900"
        >${esc(row.day || "")}</text>

        <text
          x="${rx + 62}"
          y="${ry + rowH / 2 + 5}"
          fill="${C.text}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${fontSize}"
          font-weight="900"
        >${esc(row.time || "")}</text>

        <text
          x="${rx + 145}"
          y="${ry + rowH / 2 + 5}"
          fill="${C.text}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${Math.max(
            8,
            fontSize - 1
          )}"
          font-weight="800"
        >${esc(direction)}</text>

        <text
          x="${rx + colW - 10}"
          y="${ry + rowH / 2 + 5}"
          text-anchor="end"
          fill="${C.accent}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${Math.max(
            8,
            fontSize - 1
          )}"
          font-weight="900"
        >${esc(
          trainerPosterHall(
            row.hall
          )
        )}</text>
      `;
    }
  );

  return svg;
}


// ==========================================
// ОДИН ТРЕНЕР
// ==========================================

function makePoster(
  trainer,
  theme = "color"
) {
  const C =
    trainerPosterTheme(theme);

  const W = 1240;
  const H = 1754;

  const x = 56;
  const y = 225;

  const cardW = 1128;
  const cardH = 1435;

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

  let svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="210mm"
      height="297mm"
      viewBox="0 0 ${W} ${H}"
      preserveAspectRatio="xMidYMid meet"
    >

    ${trainerPosterHeader(C)}

    <rect
      x="${x}"
      y="${y}"
      width="${cardW}"
      height="${cardH}"
      rx="24"
      fill="${C.card}"
      stroke="${C.line}"
      stroke-width="2"
    />

    <rect
      x="${x}"
      y="${y}"
      width="10"
      height="${cardH}"
      rx="5"
      fill="${C.accent}"
    />

    <text
      x="${x + 28}"
      y="${y + 62}"
      fill="${C.accent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="22"
      font-weight="900"
    >01</text>

    <text
      x="${x + 78}"
      y="${y + 63}"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="52"
      font-weight="900"
    >${esc(
      String(
        trainer.name || ""
      ).toUpperCase()
    )}</text>

    <text
      x="${x + cardW - 28}"
      y="${y + 61}"
      text-anchor="end"
      fill="${C.accent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="26"
      font-weight="900"
    >${esc(
      trainer.phone || ""
    )}</text>

    <line
      x1="${x + 28}"
      y1="${y + 86}"
      x2="${x + cardW - 28}"
      y2="${y + 86}"
      stroke="${C.line}"
      stroke-width="2"
    />

    <text
      x="${x + 28}"
      y="${y + 130}"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="19"
      font-weight="900"
      letter-spacing="2"
    >НАПРАВЛЕНИЯ</text>
  `;

  const visibleDirections =
    directions.slice(0, 4);

  const dirTop =
    y + 150;

  const dirH =
    visibleDirections.length <= 2
      ? 96
      : 76;

  const dirGap = 10;

  visibleDirections.forEach(
    (direction, i) => {
      const dy =
        dirTop +
        i *
          (dirH + dirGap);

      const description =
        trainerPosterWrap(
          direction.description || "",
          72
        ).slice(0, 2);

      svg += `
        <rect
          x="${x + 28}"
          y="${dy}"
          width="${cardW - 56}"
          height="${dirH}"
          rx="13"
          fill="${C.card2}"
          stroke="${C.line}"
          stroke-width="1"
        />

        <rect
          x="${x + 28}"
          y="${dy}"
          width="7"
          height="${dirH}"
          rx="4"
          fill="${C.accent}"
        />

        <text
          x="${x + 48}"
          y="${dy + 29}"
          fill="${C.accent}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="24"
          font-weight="900"
        >${esc(
          String(
            direction.name || ""
          ).toUpperCase()
        )}</text>

        ${trainerPosterLines(
          description,
          x + 48,
          dy + 54,
          16,
          C.text,
          700,
          20
        )}
      `;
    }
  );

  const directionsBottom =
    dirTop +
    visibleDirections.length *
      (dirH + dirGap);

  const scheduleTitleY =
    Math.max(
      directionsBottom + 22,
      y + 465
    );

  const hallsY =
    y +
    cardH -
    165;

  const scheduleY =
    scheduleTitleY + 20;

  const scheduleH =
    hallsY -
    scheduleY -
    30;

  svg += `
    <text
      x="${x + 28}"
      y="${scheduleTitleY}"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="19"
      font-weight="900"
      letter-spacing="2"
    >РАСПИСАНИЕ</text>

    ${trainerPosterSchedule({
      schedule,
      x: x + 28,
      y: scheduleY,
      width: cardW - 56,
      height: scheduleH,
      C,
      compact: false
    })}

    <text
      x="${x + 28}"
      y="${hallsY}"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="17"
      font-weight="900"
      letter-spacing="2"
    >ЗАЛЫ «ТИТАН»</text>

    <text
      x="${x + 28}"
      y="${hallsY + 32}"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="13"
      font-weight="800"
    >1 — КРОССФИТ / БОКС · 2 — TRX / АНТИГРАВИТИ · 3 — СИЛОВОЙ ТРЕНИНГ</text>

    <text
      x="${x + 28}"
      y="${hallsY + 58}"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="13"
      font-weight="800"
    >5 — ЙОГА / АЭРОЙОГА · GYM — ТРЕНАЖЕРНЫЙ ЗАЛ</text>

    ${trainerPosterFooter(C)}

    </svg>
  `;

  return svg;
}


// ==========================================
// ДВА / ТРИ ТРЕНЕРА
// ==========================================

function makeMultiTrainerPoster(
  trainers,
  theme = "color"
) {
  const list =
    Array.isArray(trainers)
      ? trainers.slice(0, 3)
      : [];

  if (!list.length) {
    throw new Error(
      "Нет тренеров для инфографики"
    );
  }

  if (list.length === 1) {
    return makePoster(
      list[0],
      theme
    );
  }

  const C =
    trainerPosterTheme(theme);

  const W = 1240;
  const H = 1754;

  const PAD = 56;

  const count =
    list.length;

  const top = 225;
  const bottom = 1655;

  const gap =
    count === 2
      ? 24
      : 16;

  const cardH =
    (
      bottom -
      top -
      gap *
        (count - 1)
    ) /
    count;

  const cardW =
    W - PAD * 2;

  let svg = `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="210mm"
      height="297mm"
      viewBox="0 0 ${W} ${H}"
      preserveAspectRatio="xMidYMid meet"
    >

    ${trainerPosterHeader(C)}
  `;

  list.forEach(
    (trainer, index) => {
      const cardY =
        top +
        index *
          (cardH + gap);

      const innerX =
        PAD + 26;

      const innerW =
        cardW - 52;

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

      const nameSize =
        count === 2
          ? 37
          : 28;

      const phoneSize =
        count === 2
          ? 20
          : 16;

      const sectionSize =
        count === 2
          ? 16
          : 13;

      svg += `
        <rect
          x="${PAD}"
          y="${cardY}"
          width="${cardW}"
          height="${cardH}"
          rx="22"
          fill="${C.card}"
          stroke="${C.line}"
          stroke-width="2"
        />

        <rect
          x="${PAD}"
          y="${cardY}"
          width="9"
          height="${cardH}"
          rx="5"
          fill="${C.accent}"
        />

        <text
          x="${innerX}"
          y="${cardY + 45}"
          fill="${C.accent}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${count === 2 ? 18 : 14}"
          font-weight="900"
        >${String(
          index + 1
        ).padStart(2, "0")}</text>

        <text
          x="${innerX + 44}"
          y="${cardY + 47}"
          fill="${C.text}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${nameSize}"
          font-weight="900"
        >${esc(
          String(
            trainer.name || ""
          ).toUpperCase()
        )}</text>

        <text
          x="${PAD + cardW - 26}"
          y="${cardY + 45}"
          text-anchor="end"
          fill="${C.accent}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${phoneSize}"
          font-weight="900"
        >${esc(
          trainer.phone || ""
        )}</text>

        <line
          x1="${innerX}"
          y1="${cardY + 66}"
          x2="${PAD + cardW - 26}"
          y2="${cardY + 66}"
          stroke="${C.line}"
          stroke-width="1.5"
        />
      `;

      const dirTitleY =
        cardY +
        (count === 2
          ? 102
          : 90);

      svg += `
        <text
          x="${innerX}"
          y="${dirTitleY}"
          fill="${C.muted}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${sectionSize}"
          font-weight="900"
          letter-spacing="2"
        >НАПРАВЛЕНИЯ</text>
      `;

      const maxDirs =
        count === 2
          ? 3
          : 2;

      const visibleDirs =
        directions.slice(
          0,
          maxDirs
        );

      const dirGap = 10;

      const dirCount =
        Math.max(
          1,
          visibleDirs.length
        );

      const dirW =
        (
          innerW -
          dirGap *
            (dirCount - 1)
        ) /
        dirCount;

      const dirH =
        count === 2
          ? 94
          : 66;

      visibleDirs.forEach(
        (direction, dirIndex) => {
          const dx =
            innerX +
            dirIndex *
              (dirW + dirGap);

          const description =
            trainerPosterWrap(
              direction.description || "",
              count === 2
                ? 28
                : 18
            ).slice(
              0,
              count === 2
                ? 2
                : 1
            );

          svg += `
            <rect
              x="${dx}"
              y="${dirTitleY + 14}"
              width="${dirW}"
              height="${dirH}"
              rx="11"
              fill="${C.card2}"
              stroke="${C.line}"
              stroke-width="1"
            />

            <rect
              x="${dx}"
              y="${dirTitleY + 14}"
              width="6"
              height="${dirH}"
              rx="3"
              fill="${C.accent}"
            />

            <text
              x="${dx + 15}"
              y="${dirTitleY + 39}"
              fill="${C.accent}"
              font-family="Arial, Helvetica, sans-serif"
              font-size="${count === 2 ? 18 : 14}"
              font-weight="900"
            >${esc(
              String(
                direction.name || ""
              ).toUpperCase()
            )}</text>

            ${trainerPosterLines(
              description,
              dx + 15,
              dirTitleY + 60,
              count === 2
                ? 12
                : 9.5,
              C.text,
              700,
              15
            )}
          `;
        }
      );

      const scheduleTitleY =
        dirTitleY +
        14 +
        dirH +
        (count === 2
          ? 31
          : 25);

      const hallsY =
        cardY +
        cardH -
        (count === 2
          ? 64
          : 49);

      const scheduleY =
        scheduleTitleY + 14;

      const scheduleH =
        hallsY -
        scheduleY -
        17;

      svg += `
        <text
          x="${innerX}"
          y="${scheduleTitleY}"
          fill="${C.muted}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${sectionSize}"
          font-weight="900"
          letter-spacing="2"
        >РАСПИСАНИЕ</text>

        ${trainerPosterSchedule({
          schedule,
          x: innerX,
          y: scheduleY,
          width: innerW,
          height: scheduleH,
          C,
          compact: true
        })}

        <text
          x="${innerX}"
          y="${hallsY}"
          fill="${C.muted}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${sectionSize}"
          font-weight="900"
          letter-spacing="2"
        >ЗАЛЫ</text>

        <text
          x="${innerX + 64}"
          y="${hallsY}"
          fill="${C.text}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${count === 2 ? 11 : 8.5}"
          font-weight="800"
        >1 — КРОССФИТ / БОКС · 2 — TRX / АНТИГРАВИТИ · 3 — СИЛОВОЙ · 5 — ЙОГА / АЭРОЙОГА · GYM — ТРЕНАЖЕРНЫЙ</text>
      `;
    }
  );

  svg += `
    ${trainerPosterFooter(C)}
    </svg>
  `;

  return svg;
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
