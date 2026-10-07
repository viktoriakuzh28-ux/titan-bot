// ============================================================
// БЛОК 1
// ТИТАН BOT — БАЗА ДАННЫХ, TELEGRAM, АДМИНКА, СОСТОЯНИЯ
// ============================================================

const { neon } = require("@neondatabase/serverless");

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TG = `https://api.telegram.org/bot${TOKEN}`;
const sql = neon(process.env.DATABASE_URL);


// ============================================================
// TELEGRAM API
// ============================================================

async function api(method, body) {
  const response = await fetch(`${TG}/${method}`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Telegram ${method}: ${response.status} ${errorText}`
    );
  }

  return response.json();
}


async function sendMessage(chat, text, keyboard = null) {
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


// ============================================================
// ОБЩИЕ ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================

function esc(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}


function normalizeHall(value = "") {
  const text = String(value).trim();

  if (
    /^gym$/i.test(text) ||
    /тренаж/i.test(text)
  ) {
    return "GYM";
  }

  const number = text.replace(/[^\d]/g, "");

  if (["1", "2", "3", "5"].includes(number)) {
    return number;
  }

  return "";
}


function hallText(hall) {
  if (String(hall).toUpperCase() === "GYM") {
    return "Тренажерный зал";
  }

  return `Зал ${hall}`;
}


// ============================================================
// БАЗА ДАННЫХ
// ============================================================

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


  const count = await sql`
    SELECT COUNT(*)::int AS count
    FROM trainers
  `;

  if (Number(count[0].count) === 0) {
    await seedDatabase();
  }
}


// ============================================================
// ПЕРВИЧНЫЕ ДАННЫЕ
// Используются ТОЛЬКО если база полностью пустая
// ============================================================

async function seedDatabase() {

  const seed = [

    // --------------------------------------------------------
    // ЖИЖИНА ЭЛЬВИРА
    // --------------------------------------------------------

    {
      name: "Жижина Эльвира",
      phone: "+7 (904) 278-52-01",

      directions: [
        [
          "Хатха-йога",
          "Практика для развития гибкости, силы, баланса и снятия напряжения."
        ],

        [
          "Йога в гамаках",
          "Практика в гамаках для мобильности, разгрузки позвоночника и контроля тела."
        ]
      ],

      schedule: [
        ["СР", "07:30", "Хатха-йога", "5"],
        ["СР", "09:00", "Йога в гамаках", "2"],
        ["ПТ", "07:30", "Хатха-йога", "5"],
        ["ПТ", "09:00", "Йога в гамаках", "2"]
      ]
    },


    // --------------------------------------------------------
    // ФРОЛОВА ЕКАТЕРИНА
    // --------------------------------------------------------

    {
      name: "Фролова Екатерина",
      phone: "+7 (988) 095-26-91",

      directions: [
        [
          "Йога",
          "Практика для развития гибкости, укрепления тела, восстановления и внутреннего баланса."
        ]
      ],

      schedule: [
        ["СБ", "08:00", "Йога", "5"]
      ]
    },


    // --------------------------------------------------------
    // ЗОРИНА АННА
    // --------------------------------------------------------

    {
      name: "Зорина Анна",
      phone: "+7 912 855-31-91",

      directions: [
        [
          "Йога",
          "Практика для гибкости, восстановления, осознанности и улучшения самочувствия."
        ]
      ],

      schedule: [
        ["ПН", "09:00", "Йога", "5"],
        ["ВС", "15:00–19:00", "Йога", "2"]
      ]
    },


    // --------------------------------------------------------
    // ЧУПИНА СВЕТЛАНА
    // --------------------------------------------------------

    {
      name: "Чупина Светлана",
      phone: "+7 982 828-38-27",

      directions: [
        [
          "TRX",
          "Функциональные тренировки с собственным весом."
        ],

        [
          "Силовой фитнес",
          "Укрепление мышц и повышение выносливости."
        ],

        [
          "Растяжка",
          "Развитие гибкости, улучшение осанки и снятие напряжения."
        ],

        [
          "Мышечно-суставная гимнастика",
          "Развитие подвижности суставов и профилактика травм."
        ],

        [
          "Фитнес-йога",
          "Силовые упражнения, растяжка и дыхательные практики."
        ]
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


    // --------------------------------------------------------
    // ФЕДОРЕНКО ОЛЬГА
    // --------------------------------------------------------

    {
      name: "Федоренко Ольга",
      phone: "+7 904 247-08-15",

      directions: [
        [
          "Силовой тренинг",
          "Развитие силы, укрепление мышц и улучшение физической формы."
        ],

        [
          "Кроссфит",
          "Интенсивная функциональная тренировка силы и выносливости."
        ],

        [
          "Функционал",
          "Комплексная функциональная тренировка всего тела."
        ],

        [
          "Тренажерный зал",
          "Силовые тренировки на тренажерах и со свободными весами."
        ]
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


    // --------------------------------------------------------
    // ИЖБОЛДИНА НАТАЛЬЯ
    // --------------------------------------------------------

    {
      name: "Ижболдина Наталья",
      phone: "+7 982 837-57-69",

      directions: [
        [
          "Динамическая растяжка",
          "Гибкость, улучшение осанки, восстановление и профилактика травм."
        ]
      ],

      schedule: [
        ["ВТ", "19:00", "Динамическая растяжка", "5"],
        ["ЧТ", "19:00", "Динамическая растяжка", "5"],
        ["ВС", "11:00", "Динамическая растяжка", "5"]
      ]
    },


    // --------------------------------------------------------
    // СОЛОДОВА АЛЁНА
    // --------------------------------------------------------

    {
      name: "Солодова Алёна",
      phone: "+7 982 127-49-22",

      directions: [
        [
          "Джампинг",
          "Кардио на мини-батутах: выносливость, координация и энергия."
        ]
      ],

      schedule: [
        ["ВТ", "18:00", "Джампинг", "3"],
        ["ЧТ", "18:00", "Джампинг", "3"]
      ]
    },


    // --------------------------------------------------------
    // КУШНИР АННА
    // --------------------------------------------------------

    {
      name: "Кушнир Анна",
      phone: "+7 912 769-85-05",

      directions: [
        [
          "Силовой тренинг",
          "Укрепление мышц, развитие силы и выносливости."
        ],

        [
          "Функционал",
          "Функциональная работа на силу, координацию и выносливость."
        ]
      ],

      schedule: [
        ["СР", "18:00", "Силовой тренинг", "2"],
        ["ПТ", "18:00", "Функционал", "1"],
        ["ВС", "11:00", "Функционал", "1"]
      ]
    },


    // --------------------------------------------------------
    // ВАСИЛЬЧЕВСКАЯ ЕВГЕНИЯ
    // --------------------------------------------------------

    {
      name: "Васильчевская Евгения",
      phone: "+7 (914) 936-82-32",

      directions: [
        [
          "Зумба",
          "Танцевальный фитнес: кардио, координация, выносливость и энергия."
        ]
      ],

      schedule: [
        ["ПТ", "18:30", "Зумба", "3"]
      ]
    }

  ];


  for (let i = 0; i < seed.length; i++) {

    const trainer = seed[i];

    const inserted = await sql`
      INSERT INTO trainers (
        name,
        phone,
        sort_order
      )
      VALUES (
        ${trainer.name},
        ${trainer.phone},
        ${i}
      )
      RETURNING id
    `;

    const trainerId = inserted[0].id;


    for (
      let directionIndex = 0;
      directionIndex < trainer.directions.length;
      directionIndex++
    ) {

      const direction =
        trainer.directions[directionIndex];

      await sql`
        INSERT INTO directions (
          trainer_id,
          name,
          description,
          sort_order
        )
        VALUES (
          ${trainerId},
          ${direction[0]},
          ${direction[1]},
          ${directionIndex}
        )
      `;
    }


    for (
      let scheduleIndex = 0;
      scheduleIndex < trainer.schedule.length;
      scheduleIndex++
    ) {

      const lesson =
        trainer.schedule[scheduleIndex];

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
          ${lesson[0]},
          ${lesson[1]},
          ${lesson[2]},
          ${lesson[3]},
          ${scheduleIndex}
        )
      `;
    }
  }
}


// ============================================================
// ПОЛУЧЕНИЕ ДАННЫХ
// ============================================================

async function getTrainers() {

  return sql`
    SELECT *
    FROM trainers
    ORDER BY sort_order, id
  `;
}


async function getTrainer(id) {

  const trainers = await sql`
    SELECT *
    FROM trainers
    WHERE id = ${id}
    LIMIT 1
  `;

  if (!trainers.length) {
    return null;
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


  return {
    ...trainers[0],
    directions,
    schedule
  };
}


async function getTrainersByIds(ids) {

  const trainers = [];

  for (const rawId of ids || []) {

    const id = Number(rawId);

    if (!Number.isInteger(id)) {
      continue;
    }

    const trainer =
      await getTrainer(id);

    if (trainer) {
      trainers.push(trainer);
    }
  }

  return trainers;
}


async function getWeekSchedule() {

  return sql`
    SELECT
      s.id,
      s.trainer_id,
      s.day,
      s.time,
      s.direction,
      s.hall,
      s.sort_order,
      t.name AS trainer_name

    FROM schedule s

    JOIN trainers t
      ON t.id = s.trainer_id

    ORDER BY

      CASE UPPER(s.day)

        WHEN 'ПН' THEN 1
        WHEN 'ВТ' THEN 2
        WHEN 'СР' THEN 3
        WHEN 'ЧТ' THEN 4
        WHEN 'ПТ' THEN 5
        WHEN 'СБ' THEN 6
        WHEN 'ВС' THEN 7

        ELSE 99

      END,

      s.time,
      s.sort_order,
      s.id
  `;
}


// ============================================================
// СОСТОЯНИЯ БОТА
// ============================================================

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


function stateData(state) {

  if (!state?.data) {
    return {};
  }

  if (typeof state.data === "object") {
    return state.data;
  }

  try {
    return JSON.parse(state.data);
  } catch {
    return {};
  }
}


async function clearState(chat) {

  await sql`
    DELETE FROM bot_state
    WHERE chat_id = ${chat}
  `;
}


// ============================================================
// КЛАВИАТУРЫ
// ============================================================

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

  const trainers =
    await getTrainers();

  const keyboard =
    trainers.map((trainer) => [

      {
        text: trainer.name,
        callback_data:
          `${prefix}:${trainer.id}`
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

  const selected =
    selectedIds.map(Number);

  const trainers =
    await getTrainers();


  return trainers.map((trainer) => [

    {
      text:
        `${
          selected.includes(
            Number(trainer.id)
          )
            ? "✅ "
            : ""
        }${trainer.name}`,

      callback_data:
        `${prefix}:${trainer.id}`
    }

  ]);
}


// ============================================================
// АДМИНКА
// ============================================================

async function showAdmin(chat) {

  await clearState(chat);


  await sendMessage(
    chat,

    "✏️ УПРАВЛЕНИЕ ДАННЫМИ\n\nВыберите действие:",

    [

      [
        {
          text: "👤 Изменить тренера",
          callback_data:
            "admin_trainers"
        }
      ],

      [
        {
          text: "➕ Добавить тренера",
          callback_data:
            "add_trainer"
        }
      ],

      [
        {
          text: "🏠 В меню",
          callback_data:
            "home"
        }
      ]

    ]
  );
}


// ============================================================
// КАРТОЧКА ТРЕНЕРА В АДМИНКЕ
// ============================================================

async function showTrainerAdmin(
  chat,
  trainerId
) {

  const trainer =
    await getTrainer(trainerId);


  if (!trainer) {

    await sendMessage(
      chat,
      "Тренер не найден."
    );

    return;
  }


  await sendMessage(

    chat,

    `👤 ${trainer.name}
📞 ${trainer.phone || "—"}

Что изменить?`,

    [

      [
        {
          text: "📅 Расписание",
          callback_data:
            `admin_schedule:${trainerId}`
        }
      ],

      [
        {
          text: "✏️ Имя",
          callback_data:
            `edit_name:${trainerId}`
        },

        {
          text: "📞 Телефон",
          callback_data:
            `edit_phone:${trainerId}`
        }
      ],

      [
        {
          text: "🏋️ Направления",
          callback_data:
            `admin_directions:${trainerId}`
        }
      ],

      [
        {
          text: "🗑 Удалить тренера",
          callback_data:
            `delete_trainer_confirm:${trainerId}`
        }
      ],

      [
        {
          text: "⬅️ К тренерам",
          callback_data:
            "admin_trainers"
        }
      ],

      [
        {
          text: "🏠 В меню",
          callback_data:
            "home"
        }
      ]

    ]
  );
}


// ============================================================
// РАСПИСАНИЕ ТРЕНЕРА
// ============================================================

async function showScheduleAdmin(
  chat,
  trainerId
) {

  const trainer =
    await getTrainer(trainerId);


  if (!trainer) {

    await sendMessage(
      chat,
      "Тренер не найден."
    );

    return;
  }


  const keyboard =
    trainer.schedule.map((lesson) => [

      {
        text:
          `${lesson.day} ${lesson.time} · ` +
          `${lesson.direction} · ` +
          `${hallText(lesson.hall)}`,

        callback_data:
          `lesson:${lesson.id}`
      }

    ]);


  keyboard.push([

    {
      text: "➕ Добавить занятие",
      callback_data:
        `add_lesson:${trainerId}`
    }

  ]);


  keyboard.push([

    {
      text: "⬅️ Назад",
      callback_data:
        `admin_trainer:${trainerId}`
    }

  ]);


  await sendMessage(

    chat,

    `📅 РАСПИСАНИЕ
${trainer.name}

Выберите занятие:`,

    keyboard
  );
}


// ============================================================
// КАРТОЧКА ЗАНЯТИЯ
// ============================================================

async function showLessonAdmin(
  chat,
  scheduleId
) {

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

    await sendMessage(
      chat,
      "Занятие не найдено."
    );

    return;
  }


  const lesson = rows[0];


  await sendMessage(

    chat,

    `${lesson.trainer_name}

📅 ${lesson.day}
🕐 ${lesson.time}
🏋️ ${lesson.direction}
🚪 ${hallText(lesson.hall)}`,

    [

      [
        {
          text: "📅 Изменить день",
          callback_data:
            `lesson_day:${lesson.id}`
        }
      ],

      [
        {
          text: "🕐 Изменить время",
          callback_data:
            `lesson_time:${lesson.id}`
        }
      ],

      [
        {
          text: "🏋️ Изменить направление",
          callback_data:
            `lesson_direction:${lesson.id}`
        }
      ],

      [
        {
          text: "🚪 Изменить зал",
          callback_data:
            `lesson_hall:${lesson.id}`
        }
      ],

      [
        {
          text: "🗑 Удалить занятие",
          callback_data:
            `lesson_delete:${lesson.id}`
        }
      ],

      [
        {
          text: "⬅️ Назад",
          callback_data:
            `admin_schedule:${lesson.trainer_id}`
        }
      ]

    ]
  );
}


// ============================================================
// НАПРАВЛЕНИЯ ТРЕНЕРА
// ============================================================

async function showDirectionsAdmin(
  chat,
  trainerId
) {

  const trainer =
    await getTrainer(trainerId);


  if (!trainer) {

    await sendMessage(
      chat,
      "Тренер не найден."
    );

    return;
  }


  const keyboard =
    trainer.directions.map(
      (direction) => [

        {
          text:
            `🏋️ ${direction.name}`,

          callback_data:
            `direction:${direction.id}`
        }

      ]
    );


  keyboard.push([

    {
      text: "➕ Добавить направление",
      callback_data:
        `add_direction:${trainerId}`
    }

  ]);


  keyboard.push([

    {
      text: "⬅️ Назад",
      callback_data:
        `admin_trainer:${trainerId}`
    }

  ]);


  await sendMessage(

    chat,

    `🏋️ НАПРАВЛЕНИЯ
${trainer.name}

Выберите направление:`,

    keyboard
  );
}


// ============================================================
// КАРТОЧКА НАПРАВЛЕНИЯ
// ============================================================

async function showDirectionAdmin(
  chat,
  directionId
) {

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

    await sendMessage(
      chat,
      "Направление не найдено."
    );

    return;
  }


  const direction =
    rows[0];


  await sendMessage(

    chat,

    `${direction.trainer_name}

🏋️ ${direction.name}

${direction.description || "Описание не указано"}`,

    [

      [
        {
          text: "✏️ Изменить название",
          callback_data:
            `direction_name:${direction.id}`
        }
      ],

      [
        {
          text: "📝 Изменить описание",
          callback_data:
            `direction_desc:${direction.id}`
        }
      ],

      [
        {
          text: "🗑 Удалить направление",
          callback_data:
            `direction_delete:${direction.id}`
        }
      ],

      [
        {
          text: "⬅️ Назад",
          callback_data:
            `admin_directions:${direction.trainer_id}`
        }
      ]

    ]
  );
}


// ============================================================
// ОБРАБОТКА ТЕКСТОВОГО ВВОДА
// ============================================================

async function processStateMessage(
  chat,
  rawText
) {

  const state =
    await getState(chat);


  if (!state?.action) {
    return false;
  }


  const text =
    String(rawText || "").trim();


  if (!text) {
    return true;
  }


  const data =
    stateData(state);


  // ----------------------------------------------------------
  // ИЗМЕНЕНИЕ ИМЕНИ
  // ----------------------------------------------------------

  if (state.action === "edit_name") {

    await sql`
      UPDATE trainers
      SET name = ${text}
      WHERE id = ${state.trainer_id}
    `;

    const trainerId =
      state.trainer_id;

    await clearState(chat);

    await sendMessage(
      chat,
      "✅ Имя изменено."
    );

    await showTrainerAdmin(
      chat,
      trainerId
    );

    return true;
  }


  // ----------------------------------------------------------
  // ИЗМЕНЕНИЕ ТЕЛЕФОНА
  // ----------------------------------------------------------

  if (state.action === "edit_phone") {

    await sql`
      UPDATE trainers
      SET phone = ${text}
      WHERE id = ${state.trainer_id}
    `;

    const trainerId =
      state.trainer_id;

    await clearState(chat);

    await sendMessage(
      chat,
      "✅ Телефон изменён."
    );

    await showTrainerAdmin(
      chat,
      trainerId
    );

    return true;
  }


  // ----------------------------------------------------------
  // ДОБАВЛЕНИЕ ТРЕНЕРА — ИМЯ
  // ----------------------------------------------------------

  if (
    state.action ===
    "add_trainer_name"
  ) {

    await setState(
      chat,
      "add_trainer_phone",
      null,
      null,
      {
        name: text
      }
    );


    await sendMessage(
      chat,
      "Введите телефон тренера:"
    );

    return true;
  }


  // ----------------------------------------------------------
  // ДОБАВЛЕНИЕ ТРЕНЕРА — ТЕЛЕФОН
  // ----------------------------------------------------------

  if (
    state.action ===
    "add_trainer_phone"
  ) {

    const maxRows = await sql`
      SELECT
        COALESCE(
          MAX(sort_order),
          -1
        ) AS max

      FROM trainers
    `;


    const sortOrder =
      Number(maxRows[0].max) + 1;


    const inserted = await sql`

      INSERT INTO trainers (
        name,
        phone,
        sort_order
      )

      VALUES (
        ${data.name || "Без имени"},
        ${text},
        ${sortOrder}
      )

      RETURNING id
    `;


    const trainerId =
      inserted[0].id;


    await clearState(chat);


    await sendMessage(
      chat,
      "✅ Новый тренер добавлен."
    );


    await showTrainerAdmin(
      chat,
      trainerId
    );


    return true;
  }


  // ----------------------------------------------------------
  // ИЗМЕНЕНИЕ ДНЯ
  // ----------------------------------------------------------

  if (
    state.action ===
    "lesson_day"
  ) {

    const day =
      text.toUpperCase();


    const validDays = [
      "ПН",
      "ВТ",
      "СР",
      "ЧТ",
      "ПТ",
      "СБ",
      "ВС"
    ];


    if (!validDays.includes(day)) {

      await sendMessage(
        chat,
        "Введите ПН, ВТ, СР, ЧТ, ПТ, СБ или ВС."
      );

      return true;
    }


    await sql`
      UPDATE schedule
      SET day = ${day}
      WHERE id = ${state.schedule_id}
    `;


    const scheduleId =
      state.schedule_id;


    await clearState(chat);


    await sendMessage(
      chat,
      "✅ День изменён."
    );


    await showLessonAdmin(
      chat,
      scheduleId
    );


    return true;
  }


  // ----------------------------------------------------------
  // ИЗМЕНЕНИЕ ВРЕМЕНИ
  // ----------------------------------------------------------

  if (
    state.action ===
    "lesson_time"
  ) {

    await sql`
      UPDATE schedule
      SET time = ${text}
      WHERE id = ${state.schedule_id}
    `;


    const scheduleId =
      state.schedule_id;


    await clearState(chat);


    await sendMessage(
      chat,
      "✅ Время изменено."
    );


    await showLessonAdmin(
      chat,
      scheduleId
    );


    return true;
  }


  // ----------------------------------------------------------
  // ИЗМЕНЕНИЕ НАПРАВЛЕНИЯ ЗАНЯТИЯ
  // ----------------------------------------------------------

  if (
    state.action ===
    "lesson_direction"
  ) {

    await sql`
      UPDATE schedule
      SET direction = ${text}
      WHERE id = ${state.schedule_id}
    `;


    const scheduleId =
      state.schedule_id;


    await clearState(chat);


    await sendMessage(
      chat,
      "✅ Направление изменено."
    );


    await showLessonAdmin(
      chat,
      scheduleId
    );


    return true;
  }


  // ----------------------------------------------------------
  // ИЗМЕНЕНИЕ ЗАЛА
  // ----------------------------------------------------------

  if (
    state.action ===
    "lesson_hall"
  ) {

    const hall =
      normalizeHall(text);


    if (!hall) {

      await sendMessage(
        chat,
        "Введите 1, 2, 3, 5 или «Тренажерный зал»."
      );

      return true;
    }


    await sql`
      UPDATE schedule
      SET hall = ${hall}
      WHERE id = ${state.schedule_id}
    `;


    const scheduleId =
      state.schedule_id;


    await clearState(chat);


    await sendMessage(
      chat,
      "✅ Зал изменён."
    );


    await showLessonAdmin(
      chat,
      scheduleId
    );


    return true;
  }


  // ==========================================================
  // ДОБАВЛЕНИЕ ЗАНЯТИЯ
  // ==========================================================

  if (
    state.action ===
    "add_lesson_day"
  ) {

    const day =
      text.toUpperCase();


    const validDays = [
      "ПН",
      "ВТ",
      "СР",
      "ЧТ",
      "ПТ",
      "СБ",
      "ВС"
    ];


    if (!validDays.includes(day)) {

      await sendMessage(
        chat,
        "Введите ПН, ВТ, СР, ЧТ, ПТ, СБ или ВС."
      );

      return true;
    }


    await setState(
      chat,
      "add_lesson_time",
      state.trainer_id,
      null,
      {
        day
      }
    );


    await sendMessage(
      chat,
      "Введите время, например 18:00:"
    );


    return true;
  }


  if (
    state.action ===
    "add_lesson_time"
  ) {

    await setState(
      chat,
      "add_lesson_direction",
      state.trainer_id,
      null,
      {
        ...data,
        time: text
      }
    );


    await sendMessage(
      chat,
      "Введите направление:"
    );


    return true;
  }


  if (
    state.action ===
    "add_lesson_direction"
  ) {

    await setState(
      chat,
      "add_lesson_hall",
      state.trainer_id,
      null,
      {
        ...data,
        direction: text
      }
    );


    await sendMessage(
      chat,
      "Введите 1, 2, 3, 5 или «Тренажерный зал»."
    );


    return true;
  }


  if (
    state.action ===
    "add_lesson_hall"
  ) {

    const hall =
      normalizeHall(text);


    if (!hall) {

      await sendMessage(
        chat,
        "Введите 1, 2, 3, 5 или «Тренажерный зал»."
      );

      return true;
    }


    const maxRows = await sql`

      SELECT
        COALESCE(
          MAX(sort_order),
          -1
        ) AS max

      FROM schedule

      WHERE trainer_id =
        ${state.trainer_id}
    `;


    const sortOrder =
      Number(maxRows[0].max) + 1;


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
        ${data.day},
        ${data.time},
        ${data.direction},
        ${hall},
        ${sortOrder}
      )
    `;


    const trainerId =
      state.trainer_id;


    await clearState(chat);


    await sendMessage(
      chat,
      "✅ Занятие добавлено."
    );


    await showScheduleAdmin(
      chat,
      trainerId
    );


    return true;
  }


  // ==========================================================
  // РЕДАКТИРОВАНИЕ НАПРАВЛЕНИЯ
  // ==========================================================

  if (
    state.action ===
    "direction_name"
  ) {

    await sql`
      UPDATE directions
      SET name = ${text}
      WHERE id = ${state.schedule_id}
    `;


    const directionId =
      state.schedule_id;


    await clearState(chat);


    await sendMessage(
      chat,
      "✅ Название изменено."
    );


    await showDirectionAdmin(
      chat,
      directionId
    );


    return true;
  }


  if (
    state.action ===
    "direction_desc"
  ) {

    await sql`
      UPDATE directions
      SET description = ${text}
      WHERE id = ${state.schedule_id}
    `;


    const directionId =
      state.schedule_id;


    await clearState(chat);


    await sendMessage(
      chat,
      "✅ Описание изменено."
    );


    await showDirectionAdmin(
      chat,
      directionId
    );


    return true;
  }


  // ==========================================================
  // ДОБАВЛЕНИЕ НАПРАВЛЕНИЯ
  // ==========================================================

  if (
    state.action ===
    "add_direction_name"
  ) {

    await setState(
      chat,
      "add_direction_desc",
      state.trainer_id,
      null,
      {
        name: text
      }
    );


    await sendMessage(
      chat,
      "Введите короткое описание направления:"
    );


    return true;
  }


  if (
    state.action ===
    "add_direction_desc"
  ) {

    const maxRows = await sql`

      SELECT
        COALESCE(
          MAX(sort_order),
          -1
        ) AS max

      FROM directions

      WHERE trainer_id =
        ${state.trainer_id}
    `;


    const sortOrder =
      Number(maxRows[0].max) + 1;


    await sql`

      INSERT INTO directions (
        trainer_id,
        name,
        description,
        sort_order
      )

      VALUES (
        ${state.trainer_id},
        ${data.name},
        ${text},
        ${sortOrder}
      )
    `;


    const trainerId =
      state.trainer_id;


    await clearState(chat);


    await sendMessage(
      chat,
      "✅ Направление добавлено."
    );


    await showDirectionsAdmin(
      chat,
      trainerId
    );


    return true;
  }


  return false;
}


// ============================================================
// КОНЕЦ БЛОКА 1
// БЛОК 2 ВСТАВЛЯЕТСЯ СРАЗУ НИЖЕ
// ============================================================
// ============================================================
// БЛОК 2
// ТИТАН — ГЕНЕРАТОР ИНФОГРАФИКИ A4
//
// 1 ТРЕНЕР
// 2 ТРЕНЕРА — ОСНОВНОЙ ФОРМАТ
// 3 ТРЕНЕРА
// ОБЩЕЕ РАСПИСАНИЕ
//
// QR-КОД НА КАЖДОЙ КАРТОЧКЕ ТРЕНЕРА
// ============================================================


// ============================================================
// QR
// ============================================================

const TITAN_QR_URL =
  "https://t.me/Titannt_bot";


function titanQrImageUrl(
  value,
  size = 300
) {

  const rawUrl =
    "https://api.qrserver.com/v1/create-qr-code/" +
    "?size=" +
    size +
    "x" +
    size +
    "&margin=8" +
    "&data=" +
    encodeURIComponent(value);


  // ВАЖНО:
  // SVG является XML.
  // Обычный & внутри href ломает весь SVG.
  // Поэтому URL обязательно экранируем.
  return esc(rawUrl);
}


// ============================================================
// ТЕМА
// ============================================================

function trainerPosterTheme(
  themeName = "color"
) {

  const bw =
    themeName === "bw";


  return {

    bg:
      bw
        ? "#ffffff"
        : "#0b0d10",

    card:
      bw
        ? "#f4f4f4"
        : "#15181d",

    card2:
      bw
        ? "#ffffff"
        : "#1b1f25",

    text:
      bw
        ? "#111111"
        : "#ffffff",

    muted:
      bw
        ? "#666666"
        : "#aab0b9",

    line:
      bw
        ? "#d0d0d0"
        : "#30343b",

    accent:
      bw
        ? "#000000"
        : "#ff6a00",

    onAccent:
      "#ffffff",

    ghost:
      bw
        ? "#eeeeee"
        : "#16191e"

  };
}


// ============================================================
// СОРТИРОВКА РАСПИСАНИЯ
// ============================================================

function posterDayOrder(day) {

  const days = {

    ПН: 1,
    ВТ: 2,
    СР: 3,
    ЧТ: 4,
    ПТ: 5,
    СБ: 6,
    ВС: 7

  };


  return (
    days[
      String(day || "")
        .toUpperCase()
    ] || 99
  );
}


function posterTimeOrder(time) {

  const match =
    String(time || "")
      .match(/(\d{1,2}):(\d{2})/);


  if (!match) {
    return 99999;
  }


  return (
    Number(match[1]) * 60 +
    Number(match[2])
  );
}


function posterSortSchedule(
  rows = []
) {

  return [...rows].sort(
    (a, b) =>

      posterDayOrder(a.day) -
        posterDayOrder(b.day)

      ||

      posterTimeOrder(a.time) -
        posterTimeOrder(b.time)

      ||

      Number(a.sort_order || 0) -
        Number(b.sort_order || 0)

  );
}


// ============================================================
// РАБОТА С ТЕКСТОМ
// ============================================================

function posterWrap(
  value,
  maxLength = 40
) {

  const words =
    String(value || "")
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
      current &&
      next.length > maxLength
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


function posterCut(
  value,
  maxLength
) {

  const text =
    String(value || "");


  if (
    text.length <= maxLength
  ) {

    return text;
  }


  return (
    text.slice(
      0,
      Math.max(
        1,
        maxLength - 1
      )
    ) + "…"
  );
}


// ============================================================
// ШАПКА A4
// ============================================================

function trainerPosterHeader(
  C,
  title = "ТРЕНЕРЫ «ТИТАН»",
  subtitle = "АКТУАЛЬНОЕ РАСПИСАНИЕ"
) {

  return `

  <rect
    x="0"
    y="0"
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
    y="70"
    fill="${C.accent}"
    font-family="Arial, sans-serif"
    font-size="52"
    font-weight="900"
  >ТИТАН</text>


  <text
    x="1184"
    y="68"
    text-anchor="end"
    fill="${C.muted}"
    font-family="Arial, sans-serif"
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
    font-family="Arial, sans-serif"
    font-size="46"
    font-weight="900"
  >${esc(title)}</text>


  <text
    x="56"
    y="193"
    fill="${C.muted}"
    font-family="Arial, sans-serif"
    font-size="20"
    font-weight="900"
    letter-spacing="2"
  >${esc(subtitle)}</text>


  <text
    x="1180"
    y="185"
    text-anchor="end"
    fill="${C.ghost}"
    font-family="Arial, sans-serif"
    font-size="86"
    font-weight="900"
  >ТИТАН</text>

  `;
}


// ============================================================
// ПОДВАЛ A4
// ============================================================

function trainerPosterFooter(C) {

  return `

  <text
    x="56"
    y="1717"
    fill="${C.muted}"
    font-family="Arial, sans-serif"
    font-size="17"
    font-weight="800"
  >г. Сарапул · ул. Советская, 46</text>


  <text
    x="1184"
    y="1717"
    text-anchor="end"
    fill="${C.accent}"
    font-family="Arial, sans-serif"
    font-size="18"
    font-weight="900"
  >ТИТАН · САРАПУЛ</text>


  <line
    x1="56"
    y1="1740"
    x2="1184"
    y2="1740"
    stroke="${C.accent}"
    stroke-width="4"
  />

  `;
}


// ============================================================
// QR-КОД
// ============================================================

function renderTrainerQr(
  x,
  y,
  size,
  C,
  showLabel = true
) {

  const qrUrl =
    titanQrImageUrl(
      TITAN_QR_URL,
      400
    );


  return `

  ${
    showLabel
      ? `

        <text
          x="${x - 18}"
          y="${y + size / 2 - 8}"
          text-anchor="end"
          fill="${C.text}"
          font-family="Arial, sans-serif"
          font-size="18"
          font-weight="900"
        >ТЕЛЕГРАМ-БОТ</text>


        <text
          x="${x - 18}"
          y="${y + size / 2 + 18}"
          text-anchor="end"
          fill="${C.muted}"
          font-family="Arial, sans-serif"
          font-size="14"
          font-weight="700"
        >СКАНИРУЙ QR</text>

      `
      : ""
  }


  <rect
    x="${x - 6}"
    y="${y - 6}"
    width="${size + 12}"
    height="${size + 12}"
    rx="12"
    fill="#ffffff"
    stroke="${C.accent}"
    stroke-width="3"
  />


  <image
    href="${qrUrl}"
    x="${x}"
    y="${y}"
    width="${size}"
    height="${size}"
    preserveAspectRatio="xMidYMid meet"
  />

  `;
}


// ============================================================
// ЛЕГЕНДА ЗАЛОВ
// ============================================================

function trainerPosterLegend(
  x,
  y,
  C,
  mode = "double",
  maxWidth = 820
) {

  const fontSize =
    mode === "single"
      ? 18
      : mode === "double"
        ? 16
        : 13;


  const lineGap =
    mode === "single"
      ? 26
      : mode === "double"
        ? 23
        : 20;


  const lines = [

    "1 — КРОССФИТ / БОКС · 2 — TRX / АНТИГРАВИТИ",

    "3 — СИЛОВОЙ ТРЕНИНГ · 5 — ЙОГА / АЭРОЙОГА",

    "GYM — ТРЕНАЖЕРНЫЙ ЗАЛ"

  ];


  let svg = `

  <line
    x1="${x}"
    y1="${y - 18}"
    x2="${x + maxWidth}"
    y2="${y - 18}"
    stroke="${C.line}"
    stroke-width="2"
  />

  `;


  lines.forEach(
    (line, index) => {

      svg += `

      <text
        x="${x}"
        y="${y + index * lineGap}"
        fill="${C.text}"
        font-family="Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="900"
      >${esc(line)}</text>

      `;
    }
  );


  return svg;
}


// ============================================================
// НАПРАВЛЕНИЯ
// ============================================================

function renderTrainerDirections(
  directions,
  x,
  y,
  width,
  C,
  mode = "double"
) {

  const list =
    Array.isArray(directions)
      ? directions.slice(0, 6)
      : [];


  if (!list.length) {

    return {

      svg: `

      <text
        x="${x}"
        y="${y + 28}"
        fill="${C.muted}"
        font-family="Arial, sans-serif"
        font-size="18"
        font-weight="700"
      >Направления пока не указаны</text>

      `,

      height: 48
    };
  }


  // ----------------------------------------------------------
  // ОДИН ТРЕНЕР
  // ----------------------------------------------------------

  if (mode === "single") {

    let svg = "";

    let currentY = y;


    for (
      let index = 0;
      index < list.length;
      index++
    ) {

      const direction =
        list[index];


      const nameLines =
        posterWrap(
          String(
            direction.name || ""
          ).toUpperCase(),
          42
        ).slice(0, 2);


      const descLines =
        posterWrap(
          direction.description || "",
          76
        ).slice(0, 2);


      const cardHeight =
        104 +
        Math.max(
          0,
          nameLines.length - 1
        ) * 24 +
        Math.max(
          0,
          descLines.length - 1
        ) * 20;


      svg += `

      <rect
        x="${x}"
        y="${currentY}"
        width="${width}"
        height="${cardHeight}"
        rx="14"
        fill="${C.card2}"
        stroke="${C.line}"
        stroke-width="1.5"
      />


      <rect
        x="${x}"
        y="${currentY}"
        width="8"
        height="${cardHeight}"
        rx="4"
        fill="${C.accent}"
      />

      `;


      nameLines.forEach(
        (line, lineIndex) => {

          svg += `

          <text
            x="${x + 24}"
            y="${currentY + 34 + lineIndex * 25}"
            fill="${C.accent}"
            font-family="Arial, sans-serif"
            font-size="25"
            font-weight="900"
          >${esc(line)}</text>

          `;
        }
      );


      const descStart =
        currentY +
        70 +
        Math.max(
          0,
          nameLines.length - 1
        ) * 24;


      descLines.forEach(
        (line, lineIndex) => {

          svg += `

          <text
            x="${x + 24}"
            y="${descStart + lineIndex * 21}"
            fill="${C.text}"
            font-family="Arial, sans-serif"
            font-size="17"
            font-weight="700"
          >${esc(line)}</text>

          `;
        }
      );


      currentY +=
        cardHeight + 12;
    }


    return {

      svg,

      height:
        currentY - y
    };
  }


  // ----------------------------------------------------------
  // ДВА ТРЕНЕРА
  // ----------------------------------------------------------

  if (mode === "double") {

    const count =
      list.length;


    const columns =
      count <= 2
        ? 1
        : 2;


    const gap = 14;


    const columnWidth =
      columns === 1
        ? width
        : (width - gap) / 2;


    const titleSize =
      count <= 2
        ? 27
        : count <= 4
          ? 24
          : 21;


    const descSize =
      count <= 2
        ? 19
        : count <= 4
          ? 17
          : 15;


    const cardHeight =
      count <= 2
        ? 88
        : count <= 4
          ? 82
          : 76;


    let svg = "";


    list.forEach(
      (direction, index) => {

        const column =
          columns === 1
            ? 0
            : index % 2;


        const row =
          columns === 1
            ? index
            : Math.floor(index / 2);


        const cardX =
          x +
          column *
            (columnWidth + gap);


        const cardY =
          y +
          row *
            (cardHeight + 10);


        const title =
          posterCut(
            String(
              direction.name || ""
            ).toUpperCase(),
            columns === 1
              ? 52
              : 26
          );


        const description =
          posterCut(
            direction.description || "",
            columns === 1
              ? 92
              : 46
          );


        svg += `

        <rect
          x="${cardX}"
          y="${cardY}"
          width="${columnWidth}"
          height="${cardHeight}"
          rx="12"
          fill="${C.card2}"
          stroke="${C.line}"
          stroke-width="1.5"
        />


        <rect
          x="${cardX}"
          y="${cardY}"
          width="7"
          height="${cardHeight}"
          rx="4"
          fill="${C.accent}"
        />


        <text
          x="${cardX + 19}"
          y="${cardY + 32}"
          fill="${C.accent}"
          font-family="Arial, sans-serif"
          font-size="${titleSize}"
          font-weight="900"
        >${esc(title)}</text>


        <text
          x="${cardX + 19}"
          y="${cardY + 61}"
          fill="${C.text}"
          font-family="Arial, sans-serif"
          font-size="${descSize}"
          font-weight="700"
        >${esc(description)}</text>

        `;
      }
    );


    const rows =
      columns === 1
        ? count
        : Math.ceil(count / 2);


    return {

      svg,

      height:
        rows *
          (cardHeight + 10)
        - 10
    };
  }


  // ----------------------------------------------------------
  // ТРИ ТРЕНЕРА
  // ----------------------------------------------------------

  const cardHeight = 64;

  const gap = 8;

  let svg = "";

  let currentY = y;


  list.slice(0, 4).forEach(
    (direction) => {

      const title =
        posterCut(
          String(
            direction.name || ""
          ).toUpperCase(),
          31
        );


      const description =
        posterCut(
          direction.description || "",
          56
        );


      svg += `

      <rect
        x="${x}"
        y="${currentY}"
        width="${width}"
        height="${cardHeight}"
        rx="10"
        fill="${C.card2}"
        stroke="${C.line}"
        stroke-width="1.2"
      />


      <rect
        x="${x}"
        y="${currentY}"
        width="6"
        height="${cardHeight}"
        rx="3"
        fill="${C.accent}"
      />


      <text
        x="${x + 18}"
        y="${currentY + 27}"
        fill="${C.accent}"
        font-family="Arial, sans-serif"
        font-size="19"
        font-weight="900"
      >${esc(title)}</text>


      <text
        x="${x + 18}"
        y="${currentY + 51}"
        fill="${C.text}"
        font-family="Arial, sans-serif"
        font-size="14"
        font-weight="700"
      >${esc(description)}</text>

      `;


      currentY +=
        cardHeight + gap;
    }
  );


  return {

    svg,

    height:
      currentY - y
  };
}


// ============================================================
// РАСПИСАНИЕ ОДНОГО ТРЕНЕРА
// ============================================================

function renderTrainerSchedule(
  rows,
  x,
  y,
  width,
  maxHeight,
  C,
  mode = "double"
) {

  const schedule =
    posterSortSchedule(
      rows || []
    );


  if (!schedule.length) {

    return `

    <text
      x="${x}"
      y="${y + 30}"
      fill="${C.muted}"
      font-family="Arial, sans-serif"
      font-size="18"
      font-weight="700"
    >Расписание пока не добавлено</text>

    `;
  }


  // ==========================================================
  // ПАРАМЕТРЫ РАЗМЕРА
  // ==========================================================

  let headerHeight;
  let rowHeight;
  let gap;

  let headerFont;
  let dayFont;
  let timeFont;
  let directionFont;
  let hallFont;


  if (mode === "single") {

    headerHeight = 50;
    rowHeight = 62;
    gap = 8;

    headerFont = 16;
    dayFont = 23;
    timeFont = 23;
    directionFont = 21;
    hallFont = 20;

  } else if (mode === "double") {

    headerHeight = 48;
    rowHeight = 52;
    gap = 7;

    headerFont = 18;
    dayFont = 22;
    timeFont = 22;
    directionFont = 20;
    hallFont = 19;

  } else {

    headerHeight = 34;
    rowHeight = 36;
    gap = 5;

    headerFont = 12;
    dayFont = 15;
    timeFont = 15;
    directionFont = 14;
    hallFont = 13;
  }


  // ==========================================================
  // ЕСЛИ У ТРЕНЕРА МНОГО ЗАНЯТИЙ
  // В ФОРМАТЕ 2 ТРЕНЕРА ДЕЛАЕМ ДВЕ КОЛОНКИ
  // ==========================================================

  if (
    mode === "double" &&
    schedule.length > 9
  ) {

    const columnGap = 16;

    const columnWidth =
      (width - columnGap) / 2;


    const middle =
      Math.ceil(
        schedule.length / 2
      );


    const leftRows =
      schedule.slice(
        0,
        middle
      );


    const rightRows =
      schedule.slice(
        middle
      );


    const renderColumn = (
      columnRows,
      columnX
    ) => {

      const smallHeaderHeight = 38;

      const smallRowHeight = 42;

      const smallGap = 5;


      let svg = `

      <rect
        x="${columnX}"
        y="${y}"
        width="${columnWidth}"
        height="${smallHeaderHeight}"
        rx="9"
        fill="${C.accent}"
      />


      <text
        x="${columnX + 12}"
        y="${y + 26}"
        fill="${C.onAccent}"
        font-family="Arial, sans-serif"
        font-size="13"
        font-weight="900"
      >ДЕНЬ</text>


      <text
        x="${columnX + 70}"
        y="${y + 26}"
        fill="${C.onAccent}"
        font-family="Arial, sans-serif"
        font-size="13"
        font-weight="900"
      >ВРЕМЯ</text>


      <text
        x="${columnX + 164}"
        y="${y + 26}"
        fill="${C.onAccent}"
        font-family="Arial, sans-serif"
        font-size="13"
        font-weight="900"
      >НАПРАВЛЕНИЕ</text>


      <text
        x="${columnX + columnWidth - 12}"
        y="${y + 26}"
        text-anchor="end"
        fill="${C.onAccent}"
        font-family="Arial, sans-serif"
        font-size="13"
        font-weight="900"
      >ЗАЛ</text>

      `;


      let currentY =
        y +
        smallHeaderHeight +
        6;


      for (
        const lesson of columnRows
      ) {

        if (
          currentY +
            smallRowHeight >
          y + maxHeight
        ) {

          break;
        }


        svg += `

        <rect
          x="${columnX}"
          y="${currentY}"
          width="${columnWidth}"
          height="${smallRowHeight}"
          rx="8"
          fill="${C.card2}"
          stroke="${C.line}"
          stroke-width="1.2"
        />


        <text
          x="${columnX + 12}"
          y="${currentY + 28}"
          fill="${C.accent}"
          font-family="Arial, sans-serif"
          font-size="17"
          font-weight="900"
        >${esc(lesson.day)}</text>


        <text
          x="${columnX + 70}"
          y="${currentY + 28}"
          fill="${C.text}"
          font-family="Arial, sans-serif"
          font-size="17"
          font-weight="900"
        >${esc(lesson.time)}</text>


        <text
          x="${columnX + 164}"
          y="${currentY + 28}"
          fill="${C.text}"
          font-family="Arial, sans-serif"
          font-size="15"
          font-weight="800"
        >${esc(
          posterCut(
            lesson.direction || "",
            22
          )
        )}</text>


        <text
          x="${columnX + columnWidth - 12}"
          y="${currentY + 28}"
          text-anchor="end"
          fill="${C.accent}"
          font-family="Arial, sans-serif"
          font-size="15"
          font-weight="900"
        >${
          String(
            lesson.hall
          ).toUpperCase() === "GYM"
            ? "GYM"
            : `ЗАЛ ${esc(lesson.hall)}`
        }</text>

        `;


        currentY +=
          smallRowHeight +
          smallGap;
      }


      return svg;
    };


    return (

      renderColumn(
        leftRows,
        x
      )

      +

      renderColumn(
        rightRows,
        x +
          columnWidth +
          columnGap
      )

    );
  }


  // ==========================================================
  // ОБЫЧНАЯ ТАБЛИЦА
  // ==========================================================

  const availableForRows =
    Math.max(
      50,
      maxHeight -
        headerHeight -
        7
    );


  const maximumRows =
    Math.max(
      1,
      Math.floor(
        availableForRows /
          (rowHeight + gap)
      )
    );


  let visible =
    schedule;


  if (
    schedule.length >
    maximumRows
  ) {

    const realRows =
      Math.max(
        1,
        maximumRows - 1
      );


    visible = [

      ...schedule.slice(
        0,
        realRows
      ),

      {
        day: "",
        time: "",
        direction:
          `+ ещё ${
            schedule.length -
            realRows
          } занятий`,
        hall: ""
      }

    ];
  }


  let svg = `

  <rect
    x="${x}"
    y="${y}"
    width="${width}"
    height="${headerHeight}"
    rx="10"
    fill="${C.accent}"
  />


  <text
    x="${x + 16}"
    y="${y + headerHeight - 15}"
    fill="${C.onAccent}"
    font-family="Arial, sans-serif"
    font-size="${headerFont}"
    font-weight="900"
  >ДЕНЬ</text>


  <text
    x="${x + 110}"
    y="${y + headerHeight - 15}"
    fill="${C.onAccent}"
    font-family="Arial, sans-serif"
    font-size="${headerFont}"
    font-weight="900"
  >ВРЕМЯ</text>


  <text
    x="${x + 300}"
    y="${y + headerHeight - 15}"
    fill="${C.onAccent}"
    font-family="Arial, sans-serif"
    font-size="${headerFont}"
    font-weight="900"
  >НАПРАВЛЕНИЕ</text>


  <text
    x="${x + width - 16}"
    y="${y + headerHeight - 15}"
    text-anchor="end"
    fill="${C.onAccent}"
    font-family="Arial, sans-serif"
    font-size="${headerFont}"
    font-weight="900"
  >ЗАЛ</text>

  `;


  let currentY =
    y +
    headerHeight +
    7;


  visible.forEach(
    (lesson, index) => {

      svg += `

      <rect
        x="${x}"
        y="${currentY}"
        width="${width}"
        height="${rowHeight}"
        rx="10"
        fill="${
          index % 2
            ? C.card
            : C.card2
        }"
        stroke="${C.line}"
        stroke-width="1.2"
      />

      `;


      if (
        String(
          lesson.direction || ""
        ).startsWith("+")
      ) {

        svg += `

        <text
          x="${x + 18}"
          y="${
            currentY +
            rowHeight / 2 +
            7
          }"
          fill="${C.accent}"
          font-family="Arial, sans-serif"
          font-size="${directionFont}"
          font-weight="900"
        >${esc(lesson.direction)}</text>

        `;

      } else {

        svg += `

        <text
          x="${x + 16}"
          y="${
            currentY +
            rowHeight / 2 +
            7
          }"
          fill="${C.accent}"
          font-family="Arial, sans-serif"
          font-size="${dayFont}"
          font-weight="900"
        >${esc(lesson.day)}</text>


        <text
          x="${x + 110}"
          y="${
            currentY +
            rowHeight / 2 +
            7
          }"
          fill="${C.text}"
          font-family="Arial, sans-serif"
          font-size="${timeFont}"
          font-weight="900"
        >${esc(lesson.time)}</text>


        <text
          x="${x + 300}"
          y="${
            currentY +
            rowHeight / 2 +
            7
          }"
          fill="${C.text}"
          font-family="Arial, sans-serif"
          font-size="${directionFont}"
          font-weight="800"
        >${esc(
          posterCut(
            lesson.direction || "",
            mode === "single"
              ? 45
              : 37
          )
        )}</text>


        <text
          x="${x + width - 16}"
          y="${
            currentY +
            rowHeight / 2 +
            7
          }"
          text-anchor="end"
          fill="${C.accent}"
          font-family="Arial, sans-serif"
          font-size="${hallFont}"
          font-weight="900"
        >${
          String(
            lesson.hall
          ).toUpperCase() === "GYM"
            ? "GYM"
            : `ЗАЛ ${esc(lesson.hall)}`
        }</text>

        `;
      }


      currentY +=
        rowHeight + gap;
    }
  );


  return svg;
}


// ============================================================
// ОДИН ТРЕНЕР НА A4
// ============================================================

function makePoster(
  trainer,
  themeName = "color"
) {

  const C =
    trainerPosterTheme(
      themeName
    );


  const x = 56;

  const y = 225;

  const width = 1128;

  const height = 1435;

  const innerX =
    x + 34;

  const innerWidth =
    width - 68;


  const directions =
    renderTrainerDirections(
      trainer.directions,
      innerX,
      y + 205,
      innerWidth,
      C,
      "single"
    );


  const scheduleTitleY =
    y +
    205 +
    directions.height +
    42;


  const scheduleY =
    scheduleTitleY + 42;


  const bottomZoneY =
    y +
    height -
    175;


  const scheduleHeight =
    Math.max(
      180,
      bottomZoneY -
        scheduleY -
        30
    );


  const qrSize = 118;

  const qrX =
    x +
    width -
    34 -
    qrSize;

  const qrY =
    y +
    height -
    145;


  return `

  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="210mm"
    height="297mm"
    viewBox="0 0 1240 1754"
  >

  ${trainerPosterHeader(C)}


  <rect
    x="${x}"
    y="${y}"
    width="${width}"
    height="${height}"
    rx="24"
    fill="${C.card}"
    stroke="${C.line}"
    stroke-width="2"
  />


  <rect
    x="${x}"
    y="${y}"
    width="10"
    height="${height}"
    rx="5"
    fill="${C.accent}"
  />


  <text
    x="${innerX}"
    y="${y + 70}"
    fill="${C.accent}"
    font-family="Arial, sans-serif"
    font-size="24"
    font-weight="900"
  >01</text>


  <text
    x="${innerX + 72}"
    y="${y + 72}"
    fill="${C.text}"
    font-family="Arial, sans-serif"
    font-size="52"
    font-weight="900"
  >${esc(
    String(
      trainer.name || ""
    ).toUpperCase()
  )}</text>


  <text
    x="${x + width - 34}"
    y="${y + 70}"
    text-anchor="end"
    fill="${C.accent}"
    font-family="Arial, sans-serif"
    font-size="27"
    font-weight="900"
  >${esc(trainer.phone || "")}</text>


  <line
    x1="${innerX}"
    y1="${y + 108}"
    x2="${x + width - 34}"
    y2="${y + 108}"
    stroke="${C.line}"
    stroke-width="2"
  />


  <text
    x="${innerX}"
    y="${y + 166}"
    fill="${C.muted}"
    font-family="Arial, sans-serif"
    font-size="22"
    font-weight="900"
    letter-spacing="2"
  >НАПРАВЛЕНИЯ</text>


  ${directions.svg}


  <text
    x="${innerX}"
    y="${scheduleTitleY}"
    fill="${C.muted}"
    font-family="Arial, sans-serif"
    font-size="22"
    font-weight="900"
    letter-spacing="2"
  >РАСПИСАНИЕ</text>


  ${
    renderTrainerSchedule(
      trainer.schedule,
      innerX,
      scheduleY,
      innerWidth,
      scheduleHeight,
      C,
      "single"
    )
  }


  ${
    trainerPosterLegend(
      innerX,
      y + height - 118,
      C,
      "single",
      innerWidth - 280
    )
  }


  ${
    renderTrainerQr(
      qrX,
      qrY,
      qrSize,
      C,
      true
    )
  }


  ${trainerPosterFooter(C)}

  </svg>

  `;
}


// ============================================================
// 2 ИЛИ 3 ТРЕНЕРА НА ОДНОМ A4
// ============================================================

function makeMultiTrainerPoster(
  trainers,
  themeName = "color"
) {

  const list =
    (trainers || [])
      .slice(0, 3);


  if (!list.length) {

    throw new Error(
      "Нет выбранных тренеров"
    );
  }


  if (list.length === 1) {

    return makePoster(
      list[0],
      themeName
    );
  }


  const C =
    trainerPosterTheme(
      themeName
    );


  const count =
    list.length;


  const pageX = 56;

  const pageTop = 225;

  const pageBottom = 1650;

  const cardWidth = 1128;


  const gap =
    count === 2
      ? 28
      : 18;


  const cardHeight =
    (
      pageBottom -
      pageTop -
      gap *
        (count - 1)
    ) / count;


  let svg = `

  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="210mm"
    height="297mm"
    viewBox="0 0 1240 1754"
  >

  ${trainerPosterHeader(C)}

  `;


  list.forEach(
    (trainer, index) => {

      const doubleMode =
        count === 2;


      const mode =
        doubleMode
          ? "double"
          : "triple";


      const y =
        pageTop +
        index *
          (
            cardHeight +
            gap
          );


      const innerX =
        pageX + 28;


      const innerWidth =
        cardWidth - 56;


      const numberFont =
        doubleMode
          ? 23
          : 17;


      const nameFont =
        doubleMode
          ? (
              String(
                trainer.name || ""
              ).length > 20
                ? 41
                : 47
            )
          : 33;


      const phoneFont =
        doubleMode
          ? 24
          : 18;


      const nameY =
        y +
        (
          doubleMode
            ? 62
            : 47
        );


      const dividerY =
        y +
        (
          doubleMode
            ? 92
            : 69
        );


      const directionTitleY =
        dividerY +
        (
          doubleMode
            ? 37
            : 27
        );


      const directionStartY =
        directionTitleY +
        (
          doubleMode
            ? 15
            : 12
        );


      const directionBlock =
        renderTrainerDirections(
          trainer.directions,
          innerX,
          directionStartY,
          innerWidth,
          C,
          mode
        );


      const scheduleTitleY =
        directionStartY +
        directionBlock.height +
        (
          doubleMode
            ? 31
            : 20
        );


      const scheduleY =
        scheduleTitleY +
        (
          doubleMode
            ? 15
            : 12
        );


      // ------------------------------------------------------
      // НИЖНЯЯ ЗОНА КАРТОЧКИ:
      // легенда + QR
      // ------------------------------------------------------

      const qrSize =
        doubleMode
          ? 104
          : 72;


      const qrX =
        pageX +
        cardWidth -
        28 -
        qrSize;


      const qrY =
        y +
        cardHeight -
        qrSize -
        (
          doubleMode
            ? 24
            : 17
        );


      const legendY =
        y +
        cardHeight -
        (
          doubleMode
            ? 87
            : 62
        );


      const bottomReserved =
        doubleMode
          ? 140
          : 100;


      const scheduleHeight =
        Math.max(
          70,
          y +
            cardHeight -
            bottomReserved -
            scheduleY
        );


      svg += `

      <rect
        x="${pageX}"
        y="${y}"
        width="${cardWidth}"
        height="${cardHeight}"
        rx="23"
        fill="${C.card}"
        stroke="${C.line}"
        stroke-width="2"
      />


      <rect
        x="${pageX}"
        y="${y}"
        width="10"
        height="${cardHeight}"
        rx="5"
        fill="${C.accent}"
      />


      <text
        x="${innerX}"
        y="${nameY}"
        fill="${C.accent}"
        font-family="Arial, sans-serif"
        font-size="${numberFont}"
        font-weight="900"
      >${String(
        index + 1
      ).padStart(
        2,
        "0"
      )}</text>


      <text
        x="${innerX + 62}"
        y="${nameY}"
        fill="${C.text}"
        font-family="Arial, sans-serif"
        font-size="${nameFont}"
        font-weight="900"
      >${esc(
        String(
          trainer.name || ""
        ).toUpperCase()
      )}</text>


      <text
        x="${pageX + cardWidth - 28}"
        y="${nameY - 2}"
        text-anchor="end"
        fill="${C.accent}"
        font-family="Arial, sans-serif"
        font-size="${phoneFont}"
        font-weight="900"
      >${esc(
        trainer.phone || ""
      )}</text>


      <line
        x1="${innerX}"
        y1="${dividerY}"
        x2="${pageX + cardWidth - 28}"
        y2="${dividerY}"
        stroke="${C.line}"
        stroke-width="1.5"
      />


      <text
        x="${innerX}"
        y="${directionTitleY}"
        fill="${C.muted}"
        font-family="Arial, sans-serif"
        font-size="${
          doubleMode
            ? 21
            : 15
        }"
        font-weight="900"
        letter-spacing="2"
      >НАПРАВЛЕНИЯ</text>


      ${directionBlock.svg}


      <text
        x="${innerX}"
        y="${scheduleTitleY}"
        fill="${C.muted}"
        font-family="Arial, sans-serif"
        font-size="${
          doubleMode
            ? 21
            : 15
        }"
        font-weight="900"
        letter-spacing="2"
      >РАСПИСАНИЕ</text>


      ${
        renderTrainerSchedule(
          trainer.schedule,
          innerX,
          scheduleY,
          innerWidth,
          scheduleHeight,
          C,
          mode
        )
      }


      ${
        trainerPosterLegend(
          innerX,
          legendY,
          C,
          mode,
          doubleMode
            ? innerWidth - 330
            : innerWidth - 245
        )
      }


      ${
        renderTrainerQr(
          qrX,
          qrY,
          qrSize,
          C,
          doubleMode
        )
      }

      `;
    }
  );


  svg += `

  ${trainerPosterFooter(C)}

  </svg>

  `;


  return svg;
}


// ============================================================
// ОБЩЕЕ РАСПИСАНИЕ
// ============================================================

function makeWeekPoster(
  rows,
  themeName = "color"
) {

  const C =
    trainerPosterTheme(
      themeName
    );


  const schedule =
    posterSortSchedule(
      rows || []
    );


  const grouped = {};


  for (const lesson of schedule) {

    const day =
      String(
        lesson.day || ""
      ).toUpperCase();


    if (!grouped[day]) {
      grouped[day] = [];
    }


    grouped[day].push(
      lesson
    );
  }


  const days =
    Object.keys(grouped)
      .sort(
        (a, b) =>
          posterDayOrder(a) -
          posterDayOrder(b)
      );


  const leftDays = [];

  const rightDays = [];

  let leftWeight = 0;

  let rightWeight = 0;


  for (const day of days) {

    const weight =
      grouped[day].length +
      1.5;


    if (
      leftWeight <=
      rightWeight
    ) {

      leftDays.push(day);

      leftWeight +=
        weight;

    } else {

      rightDays.push(day);

      rightWeight +=
        weight;
    }
  }


  const pageX = 56;

  const columnGap = 24;

  const columnWidth =
    (
      1240 -
      pageX * 2 -
      columnGap
    ) / 2;


  const top = 235;

  const bottom = 1580;


  function renderWeekColumn(
    dayList,
    x
  ) {

    let currentY = top;

    let svg = "";


    const totalLessons =
      dayList.reduce(
        (
          total,
          day
        ) =>
          total +
          grouped[day].length,
        0
      );


    const headerSpace =
      dayList.length * 52;


    const available =
      bottom -
      top -
      headerSpace;


    const rowHeight =
      Math.max(
        38,
        Math.min(
          50,
          totalLessons
            ? Math.floor(
                available /
                totalLessons
              )
            : 45
        )
      );


    for (const day of dayList) {

      const lessons =
        grouped[day];


      svg += `

      <rect
        x="${x}"
        y="${currentY}"
        width="${columnWidth}"
        height="42"
        rx="10"
        fill="${C.accent}"
      />


      <text
        x="${x + 16}"
        y="${currentY + 29}"
        fill="${C.onAccent}"
        font-family="Arial, sans-serif"
        font-size="20"
        font-weight="900"
      >${esc(day)}</text>


      <text
        x="${x + columnWidth - 16}"
        y="${currentY + 29}"
        text-anchor="end"
        fill="${C.onAccent}"
        font-family="Arial, sans-serif"
        font-size="13"
        font-weight="900"
      >${lessons.length} ЗАН.</text>

      `;


      currentY += 49;


      for (
        let index = 0;
        index < lessons.length;
        index++
      ) {

        if (
          currentY +
            rowHeight >
          bottom
        ) {

          svg += `

          <text
            x="${x + 14}"
            y="${currentY + 24}"
            fill="${C.accent}"
            font-family="Arial, sans-serif"
            font-size="17"
            font-weight="900"
          >+ ещё ${
            lessons.length -
            index
          } занятий</text>

          `;

          break;
        }


        const lesson =
          lessons[index];


        svg += `

        <rect
          x="${x}"
          y="${currentY}"
          width="${columnWidth}"
          height="${rowHeight - 5}"
          rx="8"
          fill="${
            index % 2
              ? C.card2
              : C.card
          }"
          stroke="${C.line}"
          stroke-width="1.1"
        />


        <text
          x="${x + 13}"
          y="${
            currentY +
            rowHeight / 2 +
            6
          }"
          fill="${C.accent}"
          font-family="Arial, sans-serif"
          font-size="17"
          font-weight="900"
        >${esc(
          lesson.time
        )}</text>


        <text
          x="${x + 92}"
          y="${
            currentY +
            rowHeight / 2 +
            6
          }"
          fill="${C.text}"
          font-family="Arial, sans-serif"
          font-size="16"
          font-weight="900"
        >${esc(
          posterCut(
            lesson.direction || "",
            20
          )
        )}</text>


        <text
          x="${x + 300}"
          y="${
            currentY +
            rowHeight / 2 +
            6
          }"
          fill="${C.muted}"
          font-family="Arial, sans-serif"
          font-size="14"
          font-weight="800"
        >${esc(
          posterCut(
            lesson.trainer_name || "",
            15
          )
        )}</text>


        <text
          x="${x + columnWidth - 13}"
          y="${
            currentY +
            rowHeight / 2 +
            6
          }"
          text-anchor="end"
          fill="${C.accent}"
          font-family="Arial, sans-serif"
          font-size="15"
          font-weight="900"
        >${
          String(
            lesson.hall
          ).toUpperCase() === "GYM"
            ? "GYM"
            : `ЗАЛ ${esc(lesson.hall)}`
        }</text>

        `;


        currentY +=
          rowHeight;
      }


      currentY += 10;
    }


    return svg;
  }


  return `

  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="210mm"
    height="297mm"
    viewBox="0 0 1240 1754"
  >

  ${
    trainerPosterHeader(
      C,
      "ОБЩЕЕ РАСПИСАНИЕ",
      "ГРУППОВЫЕ ТРЕНИРОВКИ"
    )
  }


  ${
    renderWeekColumn(
      leftDays,
      pageX
    )
  }


  ${
    renderWeekColumn(
      rightDays,
      pageX +
        columnWidth +
        columnGap
    )
  }


  <text
    x="56"
    y="1618"
    fill="${C.text}"
    font-family="Arial, sans-serif"
    font-size="15"
    font-weight="900"
  >1 — КРОССФИТ / БОКС · 2 — TRX / АНТИГРАВИТИ · 3 — СИЛОВОЙ ТРЕНИНГ</text>


  <text
    x="56"
    y="1644"
    fill="${C.text}"
    font-family="Arial, sans-serif"
    font-size="15"
    font-weight="900"
  >5 — ЙОГА / АЭРОЙОГА · GYM — ТРЕНАЖЕРНЫЙ ЗАЛ</text>


  ${trainerPosterFooter(C)}

  </svg>

  `;
}


// ============================================================
// ОТПРАВКА SVG В TELEGRAM
// ============================================================

async function sendSvgDocument(
  chat,
  svg,
  filename,
  caption
) {

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
        type:
          "image/svg+xml;charset=utf-8"
      }
    ),

    filename
  );


  if (caption) {

    form.append(
      "caption",
      caption
    );
  }


  const response =
    await fetch(
      `${TG}/sendDocument`,
      {
        method: "POST",
        body: form
      }
    );


  if (!response.ok) {

    const errorText =
      await response.text();


    throw new Error(
      `sendDocument: ` +
      `${response.status} ` +
      errorText
    );
  }


  return response.json();
}


// ============================================================
// ОТПРАВКА 1 ТРЕНЕРА
// ============================================================

async function sendPoster(
  chat,
  trainerId,
  themeName = "color"
) {

  const trainer =
    await getTrainer(
      trainerId
    );


  if (!trainer) {

    throw new Error(
      "Тренер не найден"
    );
  }


  const svg =
    makePoster(
      trainer,
      themeName
    );


  const safeName =
    String(
      trainer.name || "trainer"
    )
      .replace(
        /[^\p{L}\p{N}_-]+/gu,
        "_"
      );


  return sendSvgDocument(

    chat,

    svg,

    `TITAN_${safeName}_${themeName}.svg`,

    "🖼 ТИТАН — инфографика тренера"
  );
}


// ============================================================
// ОТПРАВКА 1 / 2 / 3 ТРЕНЕРОВ
// ============================================================

async function sendMultiTrainerPoster(
  chat,
  trainerIds,
  themeName = "color"
) {

  const ids =
    (trainerIds || [])
      .map(Number)
      .filter(
        Number.isInteger
      );


  const trainers =
    await getTrainersByIds(
      ids
    );


  if (
    trainers.length !==
    ids.length
  ) {

    throw new Error(
      "Не удалось загрузить выбранных тренеров"
    );
  }


  const svg =
    makeMultiTrainerPoster(
      trainers,
      themeName
    );


  const names =
    trainers
      .map(
        (trainer) =>
          trainer.name
      )
      .join("_")
      .replace(
        /[^\p{L}\p{N}_-]+/gu,
        "_"
      );


  return sendSvgDocument(

    chat,

    svg,

    `TITAN_${names}_${themeName}.svg`,

    trainers.length === 1
      ? "🖼 ТИТАН — инфографика тренера"
      : "🖼 ТИТАН — инфографика тренеров"
  );
}


// ============================================================
// ОТПРАВКА ОБЩЕГО РАСПИСАНИЯ
// ============================================================

async function sendWeekPoster(
  chat,
  themeName = "color"
) {

  const rows =
    await getWeekSchedule();


  const svg =
    makeWeekPoster(
      rows,
      themeName
    );


  return sendSvgDocument(

    chat,

    svg,

    `TITAN_WEEK_${themeName}.svg`,

    "📅 ТИТАН — общее расписание"
  );
}


// ============================================================
// КОНЕЦ БЛОКА 2
//
// БЛОК 3 ВСТАВЛЯЕТСЯ СРАЗУ НИЖЕ.
// ПОКА COMMIT НЕ НАЖИМАЕМ.
// ============================================================
// ============================================================
// БЛОК 3
// ТИТАН BOT — ОСНОВНОЙ WEBHOOK
// КНОПКИ, ГЕНЕРАЦИЯ, АДМИНКА
// ============================================================

module.exports = async function handler(
  req,
  res
) {

  // ==========================================================
  // ПРОВЕРКА МЕТОДА
  // ==========================================================

  if (req.method !== "POST") {

    return res
      .status(200)
      .json({
        ok: true,
        service: "TITAN Bot"
      });
  }


  try {

    // ========================================================
    // ИНИЦИАЛИЗАЦИЯ БАЗЫ
    // ========================================================

    await initDatabase();


    const update =
      req.body || {};


    // ========================================================
    // ОБЫЧНОЕ СООБЩЕНИЕ
    // ========================================================

    if (update.message) {

      const message =
        update.message;


      const chat =
        message.chat?.id;


      const text =
        String(
          message.text || ""
        ).trim();


      if (!chat) {

        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ------------------------------------------------------
      // /start
      // ------------------------------------------------------

      if (
        text === "/start" ||
        text.startsWith("/start ")
      ) {

        await clearState(chat);


        await sendMessage(

          chat,

          `ТИТАН

Спортивный комплекс · Сарапул

Выберите раздел:`,

          mainKeyboard()
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ------------------------------------------------------
      // Если бот ждёт текст от администратора
      // ------------------------------------------------------

      const processed =
        await processStateMessage(
          chat,
          text
        );


      if (processed) {

        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ------------------------------------------------------
      // Любое другое сообщение
      // ------------------------------------------------------

      await sendMessage(

        chat,

        "Выберите нужный раздел:",

        mainKeyboard()
      );


      return res
        .status(200)
        .json({
          ok: true
        });
    }


    // ========================================================
    // CALLBACK QUERY
    // ========================================================

    if (update.callback_query) {

      const query =
        update.callback_query;


      const chat =
        query.message?.chat?.id;


      const data =
        String(
          query.data || ""
        );


      if (!chat) {

        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ------------------------------------------------------
      // Убираем "часики" на Telegram-кнопке
      // ------------------------------------------------------

      try {

        await api(
          "answerCallbackQuery",
          {
            callback_query_id:
              query.id
          }
        );

      } catch (error) {

        console.error(
          "answerCallbackQuery:",
          error
        );
      }


      // ======================================================
      // ГЛАВНОЕ МЕНЮ
      // ======================================================

      if (data === "home") {

        await clearState(chat);


        await sendMessage(

          chat,

          `ТИТАН

Спортивный комплекс · Сарапул

Выберите раздел:`,

          mainKeyboard()
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // СОЗДАНИЕ ИНФОГРАФИКИ
      // ======================================================

      if (data === "create") {

        await clearState(chat);


        await sendMessage(

          chat,

          "🖼 СОЗДАТЬ ИНФОГРАФИКУ\n\nЧто создаём?",

          [

            [
              {
                text: "👤 Тренеры",
                callback_data:
                  "trainer_poster_menu"
              }
            ],

            [
              {
                text: "📅 Общее расписание",
                callback_data:
                  "week"
              }
            ],

            [
              {
                text: "🏠 В меню",
                callback_data:
                  "home"
              }
            ]

          ]
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // ВЫБОР КОЛИЧЕСТВА ТРЕНЕРОВ
      // ======================================================

      if (
        data ===
        "trainer_poster_menu"
      ) {

        await clearState(chat);


        await sendMessage(

          chat,

          "👤 Сколько тренеров разместить на одном листе A4?",

          [

            [
              {
                text: "1 тренер",
                callback_data:
                  "poster_count:1"
              }
            ],

            [
              {
                text: "2 тренера",
                callback_data:
                  "poster_count:2"
              }
            ],

            [
              {
                text: "3 тренера",
                callback_data:
                  "poster_count:3"
              }
            ],

            [
              {
                text: "⬅️ Назад",
                callback_data:
                  "create"
              }
            ]

          ]
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // ЗАПОМИНАЕМ КОЛИЧЕСТВО
      // ======================================================

      if (
        data.startsWith(
          "poster_count:"
        )
      ) {

        const count =
          Number(
            data.split(":")[1]
          );


        if (
          ![1, 2, 3].includes(
            count
          )
        ) {

          await sendMessage(
            chat,
            "Некорректное количество тренеров."
          );


          return res
            .status(200)
            .json({
              ok: true
            });
        }


        await setState(

          chat,

          "poster_select",

          null,

          null,

          {
            count,
            selected: []
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
            callback_data:
              "trainer_poster_menu"
          }

        ]);


        await sendMessage(

          chat,

          `Выберите ${
            count === 1
              ? "тренера"
              : count === 2
                ? "2 тренеров"
                : "3 тренеров"
          }:`,

          keyboard
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // ВЫБОР КОНКРЕТНЫХ ТРЕНЕРОВ
      // ======================================================

      if (
        data.startsWith(
          "poster_select:"
        )
      ) {

        const trainerId =
          Number(
            data.split(":")[1]
          );


        const state =
          await getState(chat);


        if (
          !state ||
          state.action !==
            "poster_select"
        ) {

          await sendMessage(
            chat,
            "Выбор устарел. Начните создание инфографики заново.",
            mainKeyboard()
          );


          return res
            .status(200)
            .json({
              ok: true
            });
        }


        const current =
          stateData(state);


        const count =
          Number(
            current.count || 1
          );


        let selected =
          Array.isArray(
            current.selected
          )
            ? current.selected
                .map(Number)
                .filter(
                  Number.isInteger
                )
            : [];


        // ----------------------------------------------------
        // Повторное нажатие снимает выбор
        // ----------------------------------------------------

        if (
          selected.includes(
            trainerId
          )
        ) {

          selected =
            selected.filter(
              (id) =>
                id !== trainerId
            );

        } else {

          // --------------------------------------------------
          // Не даём выбрать больше указанного количества
          // --------------------------------------------------

          if (
            selected.length >=
            count
          ) {

            await sendMessage(

              chat,

              `Уже выбрано ${count}. Если хотите заменить тренера, нажмите сначала на уже выбранного.`

            );


            return res
              .status(200)
              .json({
                ok: true
              });
          }


          selected.push(
            trainerId
          );
        }


        // ----------------------------------------------------
        // Если набрали нужное количество — выбираем тему
        // ----------------------------------------------------

        if (
          selected.length ===
          count
        ) {

          await setState(

            chat,

            "poster_theme",

            null,

            null,

            {
              count,
              selected
            }
          );


          const selectedTrainers =
            await getTrainersByIds(
              selected
            );


          const selectedNames =
            selectedTrainers
              .map(
                (trainer) =>
                  `• ${trainer.name}`
              )
              .join("\n");


          await sendMessage(

            chat,

            `Выбрано:\n${selectedNames}\n\nКакой вариант создать?`,

            [

              [
                {
                  text: "🟧 Цветной",
                  callback_data:
                    "poster_generate:color"
                },

                {
                  text: "⬛ Ч/Б",
                  callback_data:
                    "poster_generate:bw"
                }
              ],

              [
                {
                  text: "🔄 Выбрать заново",
                  callback_data:
                    `poster_count:${count}`
                }
              ],

              [
                {
                  text: "🏠 В меню",
                  callback_data:
                    "home"
                }
              ]

            ]
          );


          return res
            .status(200)
            .json({
              ok: true
            });
        }


        // ----------------------------------------------------
        // Продолжаем выбор
        // ----------------------------------------------------

        await setState(

          chat,

          "poster_select",

          null,

          null,

          {
            count,
            selected
          }
        );


        const keyboard =
          await trainerSelectionKeyboard(
            "poster_select",
            selected
          );


        keyboard.push([

          {
            text: "⬅️ Назад",
            callback_data:
              "trainer_poster_menu"
          }

        ]);


        await sendMessage(

          chat,

          `Выбрано: ${selected.length} из ${count}\n\nВыберите следующего тренера:`,

          keyboard
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // СОЗДАНИЕ ИНФОГРАФИКИ ТРЕНЕРОВ
      // ======================================================

      if (
        data.startsWith(
          "poster_generate:"
        )
      ) {

        const theme =
          data.split(":")[1];


        if (
          !["color", "bw"].includes(
            theme
          )
        ) {

          await sendMessage(
            chat,
            "Неизвестный вариант оформления."
          );


          return res
            .status(200)
            .json({
              ok: true
            });
        }


        const state =
          await getState(chat);


        if (
          !state ||
          state.action !==
            "poster_theme"
        ) {

          await sendMessage(

            chat,

            "Выбор тренеров устарел. Начните создание заново.",

            mainKeyboard()
          );


          return res
            .status(200)
            .json({
              ok: true
            });
        }


        const current =
          stateData(state);


        const ids =
          Array.isArray(
            current.selected
          )
            ? current.selected
                .map(Number)
                .filter(
                  Number.isInteger
                )
            : [];


        if (!ids.length) {

          await sendMessage(

            chat,

            "Тренеры не выбраны. Начните создание заново.",

            mainKeyboard()
          );


          return res
            .status(200)
            .json({
              ok: true
            });
        }


        await sendMessage(
          chat,
          "⏳ Создаю инфографику…"
        );


        if (
          ids.length === 1
        ) {

          await sendPoster(
            chat,
            ids[0],
            theme
          );

        } else {

          await sendMultiTrainerPoster(
            chat,
            ids,
            theme
          );
        }


        await clearState(chat);


        await sendMessage(

          chat,

          "✅ Готово.",

          [

            [
              {
                text: "🖼 Создать ещё",
                callback_data:
                  "create"
              }
            ],

            [
              {
                text: "🏠 В меню",
                callback_data:
                  "home"
              }
            ]

          ]
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // ПУБЛИЧНЫЙ СПИСОК ТРЕНЕРОВ
      // Только имя + телефон
      // ======================================================

      if (data === "trainers") {

        const trainers =
          await getTrainers();


        let text =
          "👤 ТРЕНЕРЫ «ТИТАН»\n\n";


        trainers.forEach(
          (trainer) => {

            text +=
              `${trainer.name}\n` +
              `📞 ${
                trainer.phone || "—"
              }\n\n`;
          }
        );


        await sendMessage(

          chat,

          text.trim(),

          [

            [
              {
                text: "🏠 В меню",
                callback_data:
                  "home"
              }
            ]

          ]
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // АДМИНКА
      // ======================================================

      if (data === "admin") {

        await showAdmin(chat);


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // СПИСОК ТРЕНЕРОВ В АДМИНКЕ
      // ======================================================

      if (
        data ===
        "admin_trainers"
      ) {

        await clearState(chat);


        const keyboard =
          await trainerKeyboard(
            "admin_trainer"
          );


        await sendMessage(

          chat,

          "👤 Выберите тренера:",

          keyboard
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // КАРТОЧКА ТРЕНЕРА
      // ======================================================

      if (
        data.startsWith(
          "admin_trainer:"
        )
      ) {

        const trainerId =
          Number(
            data.split(":")[1]
          );


        await clearState(chat);


        await showTrainerAdmin(
          chat,
          trainerId
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // ИЗМЕНИТЬ ИМЯ
      // ======================================================

      if (
        data.startsWith(
          "edit_name:"
        )
      ) {

        const trainerId =
          Number(
            data.split(":")[1]
          );


        await setState(
          chat,
          "edit_name",
          trainerId
        );


        await sendMessage(
          chat,
          "Введите новое имя тренера:"
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // ИЗМЕНИТЬ ТЕЛЕФОН
      // ======================================================

      if (
        data.startsWith(
          "edit_phone:"
        )
      ) {

        const trainerId =
          Number(
            data.split(":")[1]
          );


        await setState(
          chat,
          "edit_phone",
          trainerId
        );


        await sendMessage(
          chat,
          "Введите новый номер телефона:"
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // ДОБАВИТЬ ТРЕНЕРА
      // ======================================================

      if (
        data ===
        "add_trainer"
      ) {

        await setState(
          chat,
          "add_trainer_name"
        );


        await sendMessage(
          chat,
          "Введите имя и фамилию нового тренера:"
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // ПОДТВЕРЖДЕНИЕ УДАЛЕНИЯ ТРЕНЕРА
      // ======================================================

      if (
        data.startsWith(
          "delete_trainer_confirm:"
        )
      ) {

        const trainerId =
          Number(
            data.split(":")[1]
          );


        const trainer =
          await getTrainer(
            trainerId
          );


        if (!trainer) {

          await sendMessage(
            chat,
            "Тренер уже удалён."
          );


          return res
            .status(200)
            .json({
              ok: true
            });
        }


        await sendMessage(

          chat,

          `⚠️ Удалить тренера?\n\n${trainer.name}\n\nВместе с тренером будут удалены его направления и расписание.`,

          [

            [
              {
                text: "🗑 Да, удалить",
                callback_data:
                  `delete_trainer:${trainerId}`
              }
            ],

            [
              {
                text: "❌ Отмена",
                callback_data:
                  `admin_trainer:${trainerId}`
              }
            ]

          ]
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // УДАЛЕНИЕ ТРЕНЕРА
      // ======================================================

      if (
        data.startsWith(
          "delete_trainer:"
        )
      ) {

        const trainerId =
          Number(
            data.split(":")[1]
          );


        // ----------------------------------------------------
        // Удаляем связанные записи явно.
        // Так удаление работает даже если старая таблица
        // была создана без ON DELETE CASCADE.
        // ----------------------------------------------------

        await sql`
          DELETE FROM schedule
          WHERE trainer_id = ${trainerId}
        `;


        await sql`
          DELETE FROM directions
          WHERE trainer_id = ${trainerId}
        `;


        const deleted =
          await sql`

            DELETE FROM trainers

            WHERE id =
              ${trainerId}

            RETURNING name
          `;


        await clearState(chat);


        if (!deleted.length) {

          await sendMessage(
            chat,
            "Тренер уже удалён."
          );

        } else {

          await sendMessage(

            chat,

            `✅ ${deleted[0].name} удалён(а).`

          );
        }


        const keyboard =
          await trainerKeyboard(
            "admin_trainer"
          );


        await sendMessage(

          chat,

          "👤 Выберите тренера:",

          keyboard
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // РАСПИСАНИЕ ТРЕНЕРА
      // ======================================================

      if (
        data.startsWith(
          "admin_schedule:"
        )
      ) {

        const trainerId =
          Number(
            data.split(":")[1]
          );


        await clearState(chat);


        await showScheduleAdmin(
          chat,
          trainerId
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // КАРТОЧКА ЗАНЯТИЯ
      // ======================================================

      if (
        data.startsWith(
          "lesson:"
        )
      ) {

        const scheduleId =
          Number(
            data.split(":")[1]
          );


        await clearState(chat);


        await showLessonAdmin(
          chat,
          scheduleId
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // ИЗМЕНИТЬ ДЕНЬ
      // ======================================================

      if (
        data.startsWith(
          "lesson_day:"
        )
      ) {

        const scheduleId =
          Number(
            data.split(":")[1]
          );


        await setState(
          chat,
          "lesson_day",
          null,
          scheduleId
        );


        await sendMessage(
          chat,
          "Введите день: ПН, ВТ, СР, ЧТ, ПТ, СБ или ВС."
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // ИЗМЕНИТЬ ВРЕМЯ
      // ======================================================

      if (
        data.startsWith(
          "lesson_time:"
        )
      ) {

        const scheduleId =
          Number(
            data.split(":")[1]
          );


        await setState(
          chat,
          "lesson_time",
          null,
          scheduleId
        );


        await sendMessage(
          chat,
          "Введите новое время, например 18:30:"
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // ИЗМЕНИТЬ НАПРАВЛЕНИЕ ЗАНЯТИЯ
      // ======================================================

      if (
        data.startsWith(
          "lesson_direction:"
        )
      ) {

        const scheduleId =
          Number(
            data.split(":")[1]
          );


        await setState(
          chat,
          "lesson_direction",
          null,
          scheduleId
        );


        await sendMessage(
          chat,
          "Введите новое название направления:"
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // ИЗМЕНИТЬ ЗАЛ
      // ======================================================

      if (
        data.startsWith(
          "lesson_hall:"
        )
      ) {

        const scheduleId =
          Number(
            data.split(":")[1]
          );


        await setState(
          chat,
          "lesson_hall",
          null,
          scheduleId
        );


        await sendMessage(
          chat,
          "Введите 1, 2, 3, 5 или «Тренажерный зал»."
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // УДАЛИТЬ ЗАНЯТИЕ
      // ======================================================

      if (
        data.startsWith(
          "lesson_delete:"
        )
      ) {

        const scheduleId =
          Number(
            data.split(":")[1]
          );


        const rows =
          await sql`

            SELECT trainer_id

            FROM schedule

            WHERE id =
              ${scheduleId}

            LIMIT 1
          `;


        if (!rows.length) {

          await sendMessage(
            chat,
            "Занятие уже удалено."
          );


          return res
            .status(200)
            .json({
              ok: true
            });
        }


        const trainerId =
          rows[0].trainer_id;


        await sql`
          DELETE FROM schedule
          WHERE id = ${scheduleId}
        `;


        await clearState(chat);


        await sendMessage(
          chat,
          "✅ Занятие удалено."
        );


        await showScheduleAdmin(
          chat,
          trainerId
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // ДОБАВИТЬ ЗАНЯТИЕ
      // ======================================================

      if (
        data.startsWith(
          "add_lesson:"
        )
      ) {

        const trainerId =
          Number(
            data.split(":")[1]
          );


        await setState(
          chat,
          "add_lesson_day",
          trainerId
        );


        await sendMessage(
          chat,
          "Введите день: ПН, ВТ, СР, ЧТ, ПТ, СБ или ВС."
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // НАПРАВЛЕНИЯ
      // ======================================================

      if (
        data.startsWith(
          "admin_directions:"
        )
      ) {

        const trainerId =
          Number(
            data.split(":")[1]
          );


        await clearState(chat);


        await showDirectionsAdmin(
          chat,
          trainerId
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // КАРТОЧКА НАПРАВЛЕНИЯ
      // ======================================================

      if (
        data.startsWith(
          "direction:"
        )
      ) {

        const directionId =
          Number(
            data.split(":")[1]
          );


        await clearState(chat);


        await showDirectionAdmin(
          chat,
          directionId
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // ИЗМЕНИТЬ НАЗВАНИЕ НАПРАВЛЕНИЯ
      // ======================================================

      if (
        data.startsWith(
          "direction_name:"
        )
      ) {

        const directionId =
          Number(
            data.split(":")[1]
          );


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


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // ИЗМЕНИТЬ ОПИСАНИЕ НАПРАВЛЕНИЯ
      // ======================================================

      if (
        data.startsWith(
          "direction_desc:"
        )
      ) {

        const directionId =
          Number(
            data.split(":")[1]
          );


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


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // УДАЛИТЬ НАПРАВЛЕНИЕ
      // ======================================================

      if (
        data.startsWith(
          "direction_delete:"
        )
      ) {

        const directionId =
          Number(
            data.split(":")[1]
          );


        const rows =
          await sql`

            SELECT trainer_id

            FROM directions

            WHERE id =
              ${directionId}

            LIMIT 1
          `;


        if (!rows.length) {

          await sendMessage(
            chat,
            "Направление уже удалено."
          );


          return res
            .status(200)
            .json({
              ok: true
            });
        }


        const trainerId =
          rows[0].trainer_id;


        await sql`
          DELETE FROM directions
          WHERE id = ${directionId}
        `;


        await clearState(chat);


        await sendMessage(
          chat,
          "✅ Направление удалено."
        );


        await showDirectionsAdmin(
          chat,
          trainerId
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // ДОБАВИТЬ НАПРАВЛЕНИЕ
      // ======================================================

      if (
        data.startsWith(
          "add_direction:"
        )
      ) {

        const trainerId =
          Number(
            data.split(":")[1]
          );


        await setState(
          chat,
          "add_direction_name",
          trainerId
        );


        await sendMessage(
          chat,
          "Введите название нового направления:"
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // ОБЩЕЕ РАСПИСАНИЕ
      // ======================================================

      if (data === "week") {

        await clearState(chat);


        await sendMessage(

          chat,

          "📅 ОБЩЕЕ РАСПИСАНИЕ\n\nКакой вариант создать?",

          [

            [
              {
                text: "🟧 Цветной",
                callback_data:
                  "week_color"
              },

              {
                text: "⬛ Ч/Б",
                callback_data:
                  "week_bw"
              }
            ],

            [
              {
                text: "🏠 В меню",
                callback_data:
                  "home"
              }
            ]

          ]
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // ЦВЕТНОЕ ОБЩЕЕ РАСПИСАНИЕ
      // ======================================================

      if (
        data ===
        "week_color"
      ) {

        await sendMessage(
          chat,
          "⏳ Создаю общее расписание…"
        );


        await sendWeekPoster(
          chat,
          "color"
        );


        await sendMessage(

          chat,

          "✅ Готово.",

          [

            [
              {
                text: "📅 Создать ещё",
                callback_data:
                  "week"
              }
            ],

            [
              {
                text: "🏠 В меню",
                callback_data:
                  "home"
              }
            ]

          ]
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // Ч/Б ОБЩЕЕ РАСПИСАНИЕ
      // ======================================================

      if (
        data ===
        "week_bw"
      ) {

        await sendMessage(
          chat,
          "⏳ Создаю общее расписание…"
        );


        await sendWeekPoster(
          chat,
          "bw"
        );


        await sendMessage(

          chat,

          "✅ Готово.",

          [

            [
              {
                text: "📅 Создать ещё",
                callback_data:
                  "week"
              }
            ],

            [
              {
                text: "🏠 В меню",
                callback_data:
                  "home"
              }
            ]

          ]
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ======================================================
      // НЕИЗВЕСТНАЯ КНОПКА
      // ======================================================

      await sendMessage(

        chat,

        "Команда устарела. Вернитесь в главное меню.",

        mainKeyboard()
      );


      return res
        .status(200)
        .json({
          ok: true
        });
    }


    // ========================================================
    // TELEGRAM UPDATE БЕЗ MESSAGE / CALLBACK
    // ========================================================

    return res
      .status(200)
      .json({
        ok: true
      });


  } catch (error) {

    // ========================================================
    // ЛОГИРУЕМ ОШИБКУ
    // ========================================================

    console.error(
      "TITAN WEBHOOK ERROR:",
      error
    );


    // Telegram должен получить 200,
    // иначе он начнёт повторно присылать тот же update.

    return res
      .status(200)
      .json({
        ok: false,
        error:
          error?.message ||
          "Unknown error"
      });
  }
};


// ============================================================
// КОНЕЦ БЛОКА 3
// КОНЕЦ ФАЙЛА api/webhook.js
// ============================================================
