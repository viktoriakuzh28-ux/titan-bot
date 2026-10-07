// ============================================================
// БЛОК 1 / 3
// ТИТАН BOT
// БАЗА · СОСТОЯНИЯ · АДМИНКА · ТРЕНЕРЫ
// ============================================================

const { neon } = require("@neondatabase/serverless");
const QRCode = require("qrcode");

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TG = `https://api.telegram.org/bot${TOKEN}`;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured");
}

const sql = neon(process.env.DATABASE_URL);


// ============================================================
// TELEGRAM API
// ============================================================

async function api(method, payload = {}) {

  if (!TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }

  const response = await fetch(
    `${TG}/${method}`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(payload)
    }
  );

  const result = await response.json();

  if (!response.ok || !result.ok) {
    throw new Error(
      `${method}: ${JSON.stringify(result)}`
    );
  }

  return result;
}


async function sendMessage(
  chat,
  text,
  keyboard = null
) {

  const payload = {
    chat_id: chat,
    text: String(text || ""),
    disable_web_page_preview: true
  };

  if (keyboard) {
    payload.reply_markup = {
      inline_keyboard: keyboard
    };
  }

  return api(
    "sendMessage",
    payload
  );
}


// ============================================================
// SVG / HTML ESCAPE
// ============================================================

function esc(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}


// ============================================================
// БАЗА ДАННЫХ
// ============================================================

async function initDatabase() {

  // ----------------------------------------------------------
  // ТРЕНЕРЫ
  // ----------------------------------------------------------

  await sql`
    CREATE TABLE IF NOT EXISTS trainers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      qr_url TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0
    )
  `;

  // Миграции для старой базы.
  // Существующие данные НЕ удаляются.

  await sql`
    ALTER TABLE trainers
    ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT ''
  `;

  await sql`
    ALTER TABLE trainers
    ADD COLUMN IF NOT EXISTS qr_url TEXT DEFAULT ''
  `;

  await sql`
    ALTER TABLE trainers
    ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0
  `;


  // ----------------------------------------------------------
  // НАПРАВЛЕНИЯ
  // ----------------------------------------------------------

  await sql`
    CREATE TABLE IF NOT EXISTS directions (
      id SERIAL PRIMARY KEY,
      trainer_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0
    )
  `;

  await sql`
    ALTER TABLE directions
    ADD COLUMN IF NOT EXISTS description TEXT DEFAULT ''
  `;

  await sql`
    ALTER TABLE directions
    ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0
  `;


  // ----------------------------------------------------------
  // РАСПИСАНИЕ
  // ----------------------------------------------------------

  await sql`
    CREATE TABLE IF NOT EXISTS schedule (
      id SERIAL PRIMARY KEY,
      trainer_id INTEGER NOT NULL,
      day TEXT NOT NULL,
      time TEXT NOT NULL,
      direction TEXT NOT NULL,
      hall TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    )
  `;

  await sql`
    ALTER TABLE schedule
    ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0
  `;


  // ----------------------------------------------------------
  // СОСТОЯНИЕ БОТА
  // ----------------------------------------------------------

  await sql`
    CREATE TABLE IF NOT EXISTS bot_state (
      chat_id TEXT PRIMARY KEY,
      action TEXT,
      trainer_id INTEGER,
      item_id INTEGER,
      data JSONB DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    ALTER TABLE bot_state
    ADD COLUMN IF NOT EXISTS trainer_id INTEGER
  `;

  await sql`
    ALTER TABLE bot_state
    ADD COLUMN IF NOT EXISTS item_id INTEGER
  `;

  await sql`
    ALTER TABLE bot_state
    ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb
  `;

  await sql`
    ALTER TABLE bot_state
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()
  `;


  // ----------------------------------------------------------
  // ПЕРВИЧНОЕ ЗАПОЛНЕНИЕ
  //
  // Выполняется ТОЛЬКО если таблица trainers пустая.
  // Поэтому существующая рабочая база не перезаписывается.
  // ----------------------------------------------------------

  const countRows = await sql`
    SELECT COUNT(*)::int AS count
    FROM trainers
  `;

  if (
    Number(countRows[0]?.count || 0) === 0
  ) {
    await seedDatabase();
  }
}


// ============================================================
// ПЕРВИЧНЫЕ ДАННЫЕ
// Используются только для совершенно пустой базы.
// ============================================================

async function seedDatabase() {

  const inserted = await sql`
    INSERT INTO trainers
      (name, phone, qr_url, sort_order)
    VALUES
      ('Жижина Эльвира', '+7 (904) 278-52-01', '', 1),
      ('Фролова Екатерина', '+7 (988) 095-26-91', '', 2),
      ('Зорина Анна', '+7 912 855-31-91', '', 3),
      ('Чупина Светлана', '+7 982 828-38-27', '', 4),
      ('Федоренко Ольга', '+7 904 247-08-15', '', 5),
      ('Ижболдина Наталья', '+7 982 837-57-69', '', 6),
      ('Солодова Алена', '+7 982 127-49-22', '', 7),
      ('Кушнир Анна', '+7 912 769-85-05', '', 8),
      ('Васильчевская Евгения', '+7 (914) 936-82-32', '', 9)
    RETURNING id, name
  `;

  const ids = {};

  for (const trainer of inserted) {
    ids[trainer.name] = trainer.id;
  }


  // ----------------------------------------------------------
  // НАПРАВЛЕНИЯ
  // ----------------------------------------------------------

  await sql`
    INSERT INTO directions
      (trainer_id, name, description, sort_order)
    VALUES

      (
        ${ids["Жижина Эльвира"]},
        'Хатха-йога',
        'Баланс силы, гибкости и спокойствия',
        1
      ),

      (
        ${ids["Жижина Эльвира"]},
        'Йога в гамаках',
        'Практика с использованием подвесных гамаков',
        2
      ),

      (
        ${ids["Фролова Екатерина"]},
        'Кундалини-йога',
        'Практика дыхания, движения и концентрации',
        1
      ),

      (
        ${ids["Зорина Анна"]},
        'Кундалини-йога',
        'Практика дыхания, движения и концентрации',
        1
      ),

      (
        ${ids["Чупина Светлана"]},
        'TRX',
        'Функциональная тренировка с подвесными петлями',
        1
      ),

      (
        ${ids["Чупина Светлана"]},
        'Силовой фитнес',
        'Развитие силы и мышечной выносливости',
        2
      ),

      (
        ${ids["Чупина Светлана"]},
        'Растяжка',
        'Развитие гибкости и подвижности',
        3
      ),

      (
        ${ids["Чупина Светлана"]},
        'Мышечно-суставная гимнастика',
        'Мягкая работа над мобильностью и движением',
        4
      ),

      (
        ${ids["Чупина Светлана"]},
        'Фитнес-йога',
        'Сочетание элементов фитнеса и йоги',
        5
      ),

      (
        ${ids["Федоренко Ольга"]},
        'Силовой тренинг',
        'Развитие силы и общей физической формы',
        1
      ),

      (
        ${ids["Федоренко Ольга"]},
        'Кроссфит',
        'Интенсивная функциональная тренировка',
        2
      ),

      (
        ${ids["Федоренко Ольга"]},
        'Функционал',
        'Комплексная функциональная подготовка',
        3
      ),

      (
        ${ids["Федоренко Ольга"]},
        'Тренажерный зал',
        'Персональная работа в тренажерном зале',
        4
      ),

      (
        ${ids["Ижболдина Наталья"]},
        'Динамическая растяжка',
        'Гибкость, мобильность и работа с амплитудой',
        1
      ),

      (
        ${ids["Солодова Алена"]},
        'Джампинг',
        'Кардиотренировка на мини-батутах',
        1
      ),

      (
        ${ids["Кушнир Анна"]},
        'Силовой тренинг',
        'Силовая и функциональная подготовка',
        1
      ),

      (
        ${ids["Кушнир Анна"]},
        'Функционал',
        'Развитие силы, координации и выносливости',
        2
      ),

      (
        ${ids["Васильчевская Евгения"]},
        'Зумба',
        'Танцевальная кардиотренировка',
        1
      )
  `;


  // ----------------------------------------------------------
  // БАЗОВОЕ РАСПИСАНИЕ
  // Его можно полностью менять через Telegram.
  // ----------------------------------------------------------

  await sql`
    INSERT INTO schedule
      (
        trainer_id,
        day,
        time,
        direction,
        hall,
        sort_order
      )
    VALUES

      (
        ${ids["Жижина Эльвира"]},
        'СР',
        '07:30',
        'Хатха-йога',
        '5',
        1
      ),

      (
        ${ids["Жижина Эльвира"]},
        'СР',
        '09:00',
        'Йога в гамаках',
        '2',
        2
      ),

      (
        ${ids["Жижина Эльвира"]},
        'ПТ',
        '07:30',
        'Хатха-йога',
        '5',
        3
      ),

      (
        ${ids["Жижина Эльвира"]},
        'ПТ',
        '09:00',
        'Йога в гамаках',
        '2',
        4
      ),

      (
        ${ids["Фролова Екатерина"]},
        'СБ',
        '08:00',
        'Кундалини-йога',
        '5',
        1
      ),

      (
        ${ids["Зорина Анна"]},
        'ПН',
        '09:00',
        'Кундалини-йога',
        '5',
        1
      ),

      (
        ${ids["Зорина Анна"]},
        'ВС',
        '15:00–19:00',
        'Кундалини-йога',
        '2',
        2
      ),

      (
        ${ids["Ижболдина Наталья"]},
        'ВТ',
        '19:00',
        'Динамическая растяжка',
        '5',
        1
      ),

      (
        ${ids["Ижболдина Наталья"]},
        'ЧТ',
        '19:00',
        'Динамическая растяжка',
        '5',
        2
      ),

      (
        ${ids["Ижболдина Наталья"]},
        'ВС',
        '11:00',
        'Динамическая растяжка',
        '5',
        3
      ),

      (
        ${ids["Солодова Алена"]},
        'ВТ',
        '18:00',
        'Джампинг',
        '3',
        1
      ),

      (
        ${ids["Солодова Алена"]},
        'ЧТ',
        '18:00',
        'Джампинг',
        '3',
        2
      ),

      (
        ${ids["Кушнир Анна"]},
        'СР',
        '18:00',
        'Силовой тренинг',
        '2',
        1
      ),

      (
        ${ids["Кушнир Анна"]},
        'ПТ',
        '18:00',
        'Функционал',
        '1',
        2
      ),

      (
        ${ids["Кушнир Анна"]},
        'ВС',
        '11:00',
        'Функционал',
        '1',
        3
      ),

      (
        ${ids["Васильчевская Евгения"]},
        'ПТ',
        '18:30',
        'Зумба',
        '3',
        1
      )
  `;
}


// ============================================================
// ПОЛУЧЕНИЕ ТРЕНЕРОВ
// ============================================================

async function getTrainers() {

  return sql`
    SELECT
      id,
      name,
      phone,
      qr_url,
      sort_order
    FROM trainers
    ORDER BY
      sort_order ASC,
      id ASC
  `;
}


async function getTrainer(
  trainerId
) {

  const rows = await sql`
    SELECT
      id,
      name,
      phone,
      qr_url,
      sort_order
    FROM trainers
    WHERE id = ${trainerId}
    LIMIT 1
  `;

  if (!rows.length) {
    return null;
  }

  const trainer = rows[0];


  trainer.directions = await sql`
    SELECT
      id,
      trainer_id,
      name,
      description,
      sort_order
    FROM directions
    WHERE trainer_id = ${trainerId}
    ORDER BY
      sort_order ASC,
      id ASC
  `;


  trainer.schedule = await sql`
    SELECT
      id,
      trainer_id,
      day,
      time,
      direction,
      hall,
      sort_order
    FROM schedule
    WHERE trainer_id = ${trainerId}
    ORDER BY
      sort_order ASC,
      id ASC
  `;


  return trainer;
}


async function getTrainersByIds(
  trainerIds
) {

  const ids =
    (trainerIds || [])
      .map(Number)
      .filter(Number.isInteger);


  const trainers = [];

  // Важно сохранять порядок выбора пользователя.

  for (const id of ids) {

    const trainer =
      await getTrainer(id);

    if (trainer) {
      trainers.push(trainer);
    }
  }

  return trainers;
}


// ============================================================
// ОБЩЕЕ РАСПИСАНИЕ
// ============================================================

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
      t.sort_order ASC,
      s.sort_order ASC,
      s.id ASC
  `;
}


// ============================================================
// СОСТОЯНИЕ БОТА
// ============================================================

async function setState(
  chat,
  action,
  trainerId = null,
  itemId = null,
  data = {}
) {

  await sql`
    INSERT INTO bot_state
      (
        chat_id,
        action,
        trainer_id,
        item_id,
        data,
        updated_at
      )
    VALUES
      (
        ${String(chat)},
        ${action},
        ${trainerId},
        ${itemId},
        ${JSON.stringify(data)}::jsonb,
        NOW()
      )

    ON CONFLICT (chat_id)

    DO UPDATE SET
      action = EXCLUDED.action,
      trainer_id = EXCLUDED.trainer_id,
      item_id = EXCLUDED.item_id,
      data = EXCLUDED.data,
      updated_at = NOW()
  `;
}


async function getState(chat) {

  const rows = await sql`
    SELECT
      chat_id,
      action,
      trainer_id,
      item_id,
      data,
      updated_at
    FROM bot_state
    WHERE chat_id = ${String(chat)}
    LIMIT 1
  `;

  return rows[0] || null;
}


async function clearState(chat) {

  await sql`
    DELETE FROM bot_state
    WHERE chat_id = ${String(chat)}
  `;
}


function stateData(state) {

  if (!state?.data) {
    return {};
  }

  if (
    typeof state.data === "object"
  ) {
    return state.data;
  }

  try {
    return JSON.parse(state.data);
  } catch {
    return {};
  }
}


// ============================================================
// ОСНОВНАЯ КЛАВИАТУРА
// ============================================================

function mainKeyboard() {

  return [

    [
      {
        text: "👤 Тренеры",
        callback_data: "trainers"
      }
    ],

    [
      {
        text: "🖼 Создать инфографику",
        callback_data: "create"
      }
    ],

    [
      {
        text: "⚙️ Админка",
        callback_data: "admin"
      }
    ]

  ];
}


// ============================================================
// СПИСОК ТРЕНЕРОВ — КНОПКИ
// ============================================================

async function trainerKeyboard(
  prefix = "admin_trainer"
) {

  const trainers =
    await getTrainers();


  const keyboard =
    trainers.map(
      trainer => [

        {
          text: trainer.name,
          callback_data:
            `${prefix}:${trainer.id}`
        }

      ]
    );


  if (
    prefix ===
    "admin_trainer"
  ) {

    keyboard.push([

      {
        text: "➕ Добавить тренера",
        callback_data:
          "add_trainer"
      }

    ]);


    keyboard.push([

      {
        text: "⬅️ Назад",
        callback_data:
          "admin"
      }

    ]);
  }


  return keyboard;
}


// ============================================================
// ВЫБОР ТРЕНЕРОВ ДЛЯ ИНФОГРАФИКИ
// ============================================================

async function trainerSelectionKeyboard(
  prefix,
  selected = []
) {

  const trainers =
    await getTrainers();


  const selectedIds =
    selected.map(Number);


  return trainers.map(
    trainer => {

      const isSelected =
        selectedIds.includes(
          Number(trainer.id)
        );


      return [

        {
          text:
            `${
              isSelected
                ? "✅ "
                : ""
            }${trainer.name}`,

          callback_data:
            `${prefix}:${trainer.id}`
        }

      ];
    }
  );
}


// ============================================================
// АДМИНКА
// ============================================================

async function showAdmin(chat) {

  await clearState(chat);

  await sendMessage(

    chat,

    `⚙️ АДМИНКА «ТИТАН»

Здесь можно менять тренеров, их QR-ссылки, направления и расписание.

Изменения автоматически используются при следующем создании инфографики.`,

    [

      [
        {
          text: "👤 Тренеры",
          callback_data:
            "admin_trainers"
        }
      ],

      [
        {
          text: "🏠 Главное меню",
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


  const qrStatus =
    trainer.qr_url
      ? `✅ Установлена\n${trainer.qr_url}`
      : "❌ Не установлена";


  await sendMessage(

    chat,

    `👤 ${trainer.name}

📞 Телефон:
${trainer.phone || "—"}

🔗 QR-ссылка:
${qrStatus}

🏋️ Направлений:
${trainer.directions.length}

📅 Занятий:
${trainer.schedule.length}`,

    [

      [
        {
          text: "✏️ Изменить имя",
          callback_data:
            `edit_name:${trainer.id}`
        },

        {
          text: "📞 Изменить телефон",
          callback_data:
            `edit_phone:${trainer.id}`
        }
      ],

      [
        {
          text: "🔗 Ссылка для QR",
          callback_data:
            `edit_qr:${trainer.id}`
        }
      ],

      [
        {
          text: "🏋️ Направления",
          callback_data:
            `admin_directions:${trainer.id}`
        },

        {
          text: "📅 Расписание",
          callback_data:
            `admin_schedule:${trainer.id}`
        }
      ],

      [
        {
          text: "🗑 Удалить тренера",
          callback_data:
            `delete_trainer_confirm:${trainer.id}`
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
          text: "🏠 Главное меню",
          callback_data:
            "home"
        }
      ]

    ]
  );
}


// ============================================================
// РАСПИСАНИЕ ТРЕНЕРА — АДМИНКА
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
    trainer.schedule.map(
      lesson => [

        {
          text:
            `${lesson.day} · ${lesson.time} · ${lesson.direction}`,

          callback_data:
            `lesson:${lesson.id}`
        }

      ]
    );


  keyboard.push([

    {
      text: "➕ Добавить занятие",
      callback_data:
        `add_lesson:${trainer.id}`
    }

  ]);


  keyboard.push([

    {
      text: "⬅️ К тренеру",
      callback_data:
        `admin_trainer:${trainer.id}`
    }

  ]);


  await sendMessage(

    chat,

    `📅 РАСПИСАНИЕ

${trainer.name}

Выберите занятие для изменения:`,

    keyboard
  );
}


// ============================================================
// КОНКРЕТНОЕ ЗАНЯТИЕ
// ============================================================

async function showLessonAdmin(
  chat,
  lessonId
) {

  const rows = await sql`
    SELECT
      s.*,
      t.name AS trainer_name
    FROM schedule s
    JOIN trainers t
      ON t.id = s.trainer_id
    WHERE s.id = ${lessonId}
    LIMIT 1
  `;


  if (!rows.length) {

    await sendMessage(
      chat,
      "Занятие не найдено."
    );

    return;
  }


  const lesson =
    rows[0];


  await sendMessage(

    chat,

    `📅 ЗАНЯТИЕ

👤 ${lesson.trainer_name}

День: ${lesson.day}
Время: ${lesson.time}
Направление: ${lesson.direction}
Зал: ${
  String(lesson.hall).toUpperCase() === "GYM"
    ? "Тренажерный зал"
    : lesson.hall
}`,

    [

      [
        {
          text: "📆 День",
          callback_data:
            `lesson_day:${lesson.id}`
        },

        {
          text: "🕐 Время",
          callback_data:
            `lesson_time:${lesson.id}`
        }
      ],

      [
        {
          text: "🏋️ Направление",
          callback_data:
            `lesson_direction:${lesson.id}`
        }
      ],

      [
        {
          text: "🚪 Зал",
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
          text: "⬅️ К расписанию",
          callback_data:
            `admin_schedule:${lesson.trainer_id}`
        }
      ]

    ]
  );
}


// ============================================================
// НАПРАВЛЕНИЯ — АДМИНКА
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
      direction => [

        {
          text: direction.name,
          callback_data:
            `direction:${direction.id}`
        }

      ]
    );


  keyboard.push([

    {
      text: "➕ Добавить направление",
      callback_data:
        `add_direction:${trainer.id}`
    }

  ]);


  keyboard.push([

    {
      text: "⬅️ К тренеру",
      callback_data:
        `admin_trainer:${trainer.id}`
    }

  ]);


  await sendMessage(

    chat,

    `🏋️ НАПРАВЛЕНИЯ

${trainer.name}

Выберите направление для изменения:`,

    keyboard
  );
}


// ============================================================
// КОНКРЕТНОЕ НАПРАВЛЕНИЕ
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

    `🏋️ НАПРАВЛЕНИЕ

👤 ${direction.trainer_name}

Название:
${direction.name}

Описание:
${direction.description || "—"}`,

    [

      [
        {
          text: "✏️ Название",
          callback_data:
            `direction_name:${direction.id}`
        }
      ],

      [
        {
          text: "📝 Описание",
          callback_data:
            `direction_desc:${direction.id}`
        }
      ],

      [
        {
          text: "🗑 Удалить",
          callback_data:
            `direction_delete:${direction.id}`
        }
      ],

      [
        {
          text: "⬅️ К направлениям",
          callback_data:
            `admin_directions:${direction.trainer_id}`
        }
      ]

    ]
  );
}


// ============================================================
// НОРМАЛИЗАЦИЯ ЗАЛА
// ============================================================

function normalizeHall(value) {

  const text =
    String(value || "")
      .trim()
      .toLowerCase();


  if (
    text === "gym" ||
    text.includes("тренаж")
  ) {
    return "GYM";
  }


  if (
    ["1", "2", "3", "5"].includes(text)
  ) {
    return text;
  }


  return null;
}


// ============================================================
// НОРМАЛИЗАЦИЯ ДНЯ
// ============================================================

function normalizeDay(value) {

  const raw =
    String(value || "")
      .trim()
      .toUpperCase()
      .replace(/\./g, "");


  const aliases = {

    ПН: "ПН",
    ПОНЕДЕЛЬНИК: "ПН",

    ВТ: "ВТ",
    ВТОРНИК: "ВТ",

    СР: "СР",
    СРЕДА: "СР",

    ЧТ: "ЧТ",
    ЧЕТВЕРГ: "ЧТ",

    ПТ: "ПТ",
    ПЯТНИЦА: "ПТ",

    СБ: "СБ",
    СУББОТА: "СБ",

    ВС: "ВС",
    ВОСКРЕСЕНЬЕ: "ВС"

  };


  return aliases[raw] || null;
}


// ============================================================
// ОБРАБОТКА ТЕКСТА В СОСТОЯНИИ АДМИНКИ
// ============================================================

async function processStateMessage(
  chat,
  text
) {

  const state =
    await getState(chat);


  if (!state?.action) {
    return false;
  }


  const value =
    String(text || "").trim();


  // ==========================================================
  // ИЗМЕНЕНИЕ ИМЕНИ
  // ==========================================================

  if (
    state.action ===
    "edit_name"
  ) {

    if (!value) {

      await sendMessage(
        chat,
        "Имя не может быть пустым."
      );

      return true;
    }


    await sql`
      UPDATE trainers
      SET name = ${value}
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


  // ==========================================================
  // ИЗМЕНЕНИЕ ТЕЛЕФОНА
  // ==========================================================

  if (
    state.action ===
    "edit_phone"
  ) {

    await sql`
      UPDATE trainers
      SET phone = ${value}
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


  // ==========================================================
  // ПЕРСОНАЛЬНАЯ ССЫЛКА ДЛЯ QR
  // ==========================================================

  if (
    state.action ===
    "edit_qr"
  ) {

    let qrUrl =
      value;


    if (
      qrUrl.toLowerCase() === "удалить" ||
      qrUrl.toLowerCase() === "очистить" ||
      qrUrl === "-"
    ) {

      qrUrl = "";
    }


    if (
      qrUrl &&
      !/^https?:\/\/\S+$/i.test(qrUrl)
    ) {

      await sendMessage(

        chat,

        `❌ Отправьте полную ссылку.

Например:

https://t.me/username

https://vk.com/username

Можно использовать Telegram, VK, сайт или страницу записи.

Чтобы убрать ссылку, отправьте:
удалить`
      );

      return true;
    }


    await sql`
      UPDATE trainers
      SET qr_url = ${qrUrl}
      WHERE id = ${state.trainer_id}
    `;


    const trainerId =
      state.trainer_id;


    await clearState(chat);


    await sendMessage(

      chat,

      qrUrl
        ? "✅ Персональная ссылка для QR сохранена."
        : "✅ Персональная ссылка для QR удалена."
    );


    await showTrainerAdmin(
      chat,
      trainerId
    );


    return true;
  }


  // ==========================================================
  // ДОБАВЛЕНИЕ ТРЕНЕРА — ИМЯ
  // ==========================================================

  if (
    state.action ===
    "add_trainer_name"
  ) {

    if (!value) {

      await sendMessage(
        chat,
        "Введите имя тренера."
      );

      return true;
    }


    await setState(

      chat,

      "add_trainer_phone",

      null,

      null,

      {
        name: value
      }
    );


    await sendMessage(
      chat,
      "Теперь введите телефон тренера:"
    );


    return true;
  }


  // ==========================================================
  // ДОБАВЛЕНИЕ ТРЕНЕРА — ТЕЛЕФОН
  // ==========================================================

  if (
    state.action ===
    "add_trainer_phone"
  ) {

    const data =
      stateData(state);


    const name =
      String(data.name || "").trim();


    if (!name) {

      await clearState(chat);

      await sendMessage(
        chat,
        "Не удалось получить имя. Добавьте тренера заново."
      );

      return true;
    }


    const maxRows = await sql`
      SELECT
        COALESCE(
          MAX(sort_order),
          0
        )::int AS max_order
      FROM trainers
    `;


    const nextOrder =
      Number(
        maxRows[0]?.max_order || 0
      ) + 1;


    const rows = await sql`
      INSERT INTO trainers
        (
          name,
          phone,
          qr_url,
          sort_order
        )
      VALUES
        (
          ${name},
          ${value},
          '',
          ${nextOrder}
        )
      RETURNING id
    `;


    const trainerId =
      rows[0].id;


    await clearState(chat);


    await sendMessage(

      chat,

      `✅ Тренер добавлен.

Теперь можно добавить ему QR-ссылку, направления и расписание.`
    );


    await showTrainerAdmin(
      chat,
      trainerId
    );


    return true;
  }


  // ==========================================================
  // ИЗМЕНЕНИЕ ДНЯ ЗАНЯТИЯ
  // ==========================================================

  if (
    state.action ===
    "lesson_day"
  ) {

    const day =
      normalizeDay(value);


    if (!day) {

      await sendMessage(
        chat,
        "❌ Введите: ПН, ВТ, СР, ЧТ, ПТ, СБ или ВС."
      );

      return true;
    }


    await sql`
      UPDATE schedule
      SET day = ${day}
      WHERE id = ${state.item_id}
    `;


    const lessonId =
      state.item_id;


    await clearState(chat);


    await sendMessage(
      chat,
      "✅ День изменён."
    );


    await showLessonAdmin(
      chat,
      lessonId
    );


    return true;
  }


  // ==========================================================
  // ИЗМЕНЕНИЕ ВРЕМЕНИ
  // ==========================================================

  if (
    state.action ===
    "lesson_time"
  ) {

    if (!value) {

      await sendMessage(
        chat,
        "Введите время занятия."
      );

      return true;
    }


    await sql`
      UPDATE schedule
      SET time = ${value}
      WHERE id = ${state.item_id}
    `;


    const lessonId =
      state.item_id;


    await clearState(chat);


    await sendMessage(
      chat,
      "✅ Время изменено."
    );


    await showLessonAdmin(
      chat,
      lessonId
    );


    return true;
  }


  // ==========================================================
  // ИЗМЕНЕНИЕ НАПРАВЛЕНИЯ ЗАНЯТИЯ
  // ==========================================================

  if (
    state.action ===
    "lesson_direction"
  ) {

    if (!value) {

      await sendMessage(
        chat,
        "Введите направление."
      );

      return true;
    }


    await sql`
      UPDATE schedule
      SET direction = ${value}
      WHERE id = ${state.item_id}
    `;


    const lessonId =
      state.item_id;


    await clearState(chat);


    await sendMessage(
      chat,
      "✅ Направление занятия изменено."
    );


    await showLessonAdmin(
      chat,
      lessonId
    );


    return true;
  }


  // ==========================================================
  // ИЗМЕНЕНИЕ ЗАЛА
  // ==========================================================

  if (
    state.action ===
    "lesson_hall"
  ) {

    const hall =
      normalizeHall(value);


    if (!hall) {

      await sendMessage(

        chat,

        `❌ Не понял зал.

Введите:
1
2
3
5
или
Тренажерный зал`
      );

      return true;
    }


    await sql`
      UPDATE schedule
      SET hall = ${hall}
      WHERE id = ${state.item_id}
    `;


    const lessonId =
      state.item_id;


    await clearState(chat);


    await sendMessage(
      chat,
      "✅ Зал изменён."
    );


    await showLessonAdmin(
      chat,
      lessonId
    );


    return true;
  }


  // ==========================================================
  // ДОБАВЛЕНИЕ ЗАНЯТИЯ — ДЕНЬ
  // ==========================================================

  if (
    state.action ===
    "add_lesson_day"
  ) {

    const day =
      normalizeDay(value);


    if (!day) {

      await sendMessage(
        chat,
        "❌ Введите: ПН, ВТ, СР, ЧТ, ПТ, СБ или ВС."
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
      "Введите время занятия, например 18:30:"
    );


    return true;
  }


  // ==========================================================
  // ДОБАВЛЕНИЕ ЗАНЯТИЯ — ВРЕМЯ
  // ==========================================================

  if (
    state.action ===
    "add_lesson_time"
  ) {

    const data =
      stateData(state);


    await setState(

      chat,

      "add_lesson_direction",

      state.trainer_id,

      null,

      {
        ...data,
        time: value
      }
    );


    await sendMessage(
      chat,
      "Введите направление занятия:"
    );


    return true;
  }


  // ==========================================================
  // ДОБАВЛЕНИЕ ЗАНЯТИЯ — НАПРАВЛЕНИЕ
  // ==========================================================

  if (
    state.action ===
    "add_lesson_direction"
  ) {

    const data =
      stateData(state);


    await setState(

      chat,

      "add_lesson_hall",

      state.trainer_id,

      null,

      {
        ...data,
        direction: value
      }
    );


    await sendMessage(

      chat,

      `Введите зал:

1
2
3
5
или
Тренажерный зал`
    );


    return true;
  }


  // ==========================================================
  // ДОБАВЛЕНИЕ ЗАНЯТИЯ — ЗАЛ
  // ==========================================================

  if (
    state.action ===
    "add_lesson_hall"
  ) {

    const hall =
      normalizeHall(value);


    if (!hall) {

      await sendMessage(
        chat,
        "❌ Введите зал: 1, 2, 3, 5 или «Тренажерный зал»."
      );

      return true;
    }


    const data =
      stateData(state);


    const maxRows = await sql`
      SELECT
        COALESCE(
          MAX(sort_order),
          0
        )::int AS max_order
      FROM schedule
      WHERE trainer_id = ${state.trainer_id}
    `;


    const nextOrder =
      Number(
        maxRows[0]?.max_order || 0
      ) + 1;


    await sql`
      INSERT INTO schedule
        (
          trainer_id,
          day,
          time,
          direction,
          hall,
          sort_order
        )
      VALUES
        (
          ${state.trainer_id},
          ${data.day},
          ${data.time},
          ${data.direction},
          ${hall},
          ${nextOrder}
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
  // ИЗМЕНЕНИЕ НАЗВАНИЯ НАПРАВЛЕНИЯ
  // ==========================================================

  if (
    state.action ===
    "direction_name"
  ) {

    if (!value) {

      await sendMessage(
        chat,
        "Название не может быть пустым."
      );

      return true;
    }


    await sql`
      UPDATE directions
      SET name = ${value}
      WHERE id = ${state.item_id}
    `;


    const directionId =
      state.item_id;


    await clearState(chat);


    await sendMessage(
      chat,
      "✅ Название направления изменено."
    );


    await showDirectionAdmin(
      chat,
      directionId
    );


    return true;
  }


  // ==========================================================
  // ИЗМЕНЕНИЕ ОПИСАНИЯ НАПРАВЛЕНИЯ
  // ==========================================================

  if (
    state.action ===
    "direction_desc"
  ) {

    await sql`
      UPDATE directions
      SET description = ${value}
      WHERE id = ${state.item_id}
    `;


    const directionId =
      state.item_id;


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
  // ДОБАВЛЕНИЕ НАПРАВЛЕНИЯ — НАЗВАНИЕ
  // ==========================================================

  if (
    state.action ===
    "add_direction_name"
  ) {

    if (!value) {

      await sendMessage(
        chat,
        "Введите название направления."
      );

      return true;
    }


    await setState(

      chat,

      "add_direction_desc",

      state.trainer_id,

      null,

      {
        name: value
      }
    );


    await sendMessage(
      chat,
      "Введите краткое описание направления:"
    );


    return true;
  }


  // ==========================================================
  // ДОБАВЛЕНИЕ НАПРАВЛЕНИЯ — ОПИСАНИЕ
  // ==========================================================

  if (
    state.action ===
    "add_direction_desc"
  ) {

    const data =
      stateData(state);


    const maxRows = await sql`
      SELECT
        COALESCE(
          MAX(sort_order),
          0
        )::int AS max_order
      FROM directions
      WHERE trainer_id = ${state.trainer_id}
    `;


    const nextOrder =
      Number(
        maxRows[0]?.max_order || 0
      ) + 1;


    await sql`
      INSERT INTO directions
        (
          trainer_id,
          name,
          description,
          sort_order
        )
      VALUES
        (
          ${state.trainer_id},
          ${data.name},
          ${value},
          ${nextOrder}
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
// КОНЕЦ БЛОКА 1 / 3
// ============================================================
// ============================================================
// БЛОК 2 / 3
// ТИТАН — ГЕНЕРАТОР A4
// 1 / 2 / 3 ТРЕНЕРА + ОБЩЕЕ РАСПИСАНИЕ
// ПЕРСОНАЛЬНЫЙ QR КАЖДОГО ТРЕНЕРА
// ============================================================


// ============================================================
// QR-КОД
// ============================================================

async function getTrainerQrDataUrl(trainer) {

  const qrUrl =
    String(trainer?.qr_url || "").trim();

  if (!qrUrl) {
    return null;
  }

  try {

    return await QRCode.toDataURL(
      qrUrl,
      {
        errorCorrectionLevel: "M",
        margin: 1,
        width: 500,
        type: "image/png"
      }
    );

  } catch (error) {

    console.error(
      "QR generation error:",
      error
    );

    return null;
  }
}


// ============================================================
// ТЕМА
// ============================================================

function trainerPosterTheme(mode = "color") {

  const bw =
    mode === "bw";


  if (bw) {

    return {
      bg: "#FFFFFF",
      card: "#FFFFFF",
      card2: "#F5F5F5",
      text: "#111111",
      muted: "#555555",
      line: "#111111",
      accent: "#111111",
      accentText: "#FFFFFF",
      watermark: "#EFEFEF",
      qrBg: "#FFFFFF",
      border: "#111111"
    };
  }


  return {
    bg: "#0A0A0A",
    card: "#121212",
    card2: "#181818",
    text: "#FFFFFF",
    muted: "#BDBDBD",
    line: "#343434",
    accent: "#FF6A00",
    accentText: "#FFFFFF",
    watermark: "#151515",
    qrBg: "#FFFFFF",
    border: "#2D2D2D"
  };
}


// ============================================================
// ПОРЯДОК ДНЕЙ
// ============================================================

function posterDayOrder(day) {

  const order = {
    ПН: 1,
    ВТ: 2,
    СР: 3,
    ЧТ: 4,
    ПТ: 5,
    СБ: 6,
    ВС: 7
  };

  return order[
    String(day || "")
      .trim()
      .toUpperCase()
  ] || 99;
}


// ============================================================
// ВРЕМЯ ДЛЯ СОРТИРОВКИ
// ============================================================

function posterTimeOrder(value) {

  const text =
    String(value || "");

  const match =
    text.match(
      /(\d{1,2})[:.](\d{2})/
    );

  if (!match) {
    return 9999;
  }

  return (
    Number(match[1]) * 60 +
    Number(match[2])
  );
}


// ============================================================
// СОРТИРОВКА РАСПИСАНИЯ
// ============================================================

function posterSortSchedule(items) {

  return [...(items || [])]
    .sort(
      (a, b) => {

        const dayDiff =
          posterDayOrder(a.day) -
          posterDayOrder(b.day);

        if (dayDiff !== 0) {
          return dayDiff;
        }

        const timeDiff =
          posterTimeOrder(a.time) -
          posterTimeOrder(b.time);

        if (timeDiff !== 0) {
          return timeDiff;
        }

        return (
          Number(a.sort_order || 0) -
          Number(b.sort_order || 0)
        );
      }
    );
}


// ============================================================
// ПЕРЕНОС ТЕКСТА
// ============================================================

function posterWrap(
  text,
  maxChars = 30,
  maxLines = 3
) {

  const value =
    String(text || "")
      .trim();

  if (!value) {
    return [];
  }


  const words =
    value.split(/\s+/);


  const lines = [];

  let current = "";


  for (const word of words) {

    const next =
      current
        ? `${current} ${word}`
        : word;


    if (
      next.length <= maxChars ||
      !current
    ) {

      current = next;

    } else {

      lines.push(current);

      current = word;

      if (
        lines.length >=
        maxLines - 1
      ) {
        break;
      }
    }
  }


  if (
    current &&
    lines.length < maxLines
  ) {
    lines.push(current);
  }


  const consumed =
    lines.join(" ").length;


  if (
    consumed <
    value.length &&
    lines.length
  ) {

    const lastIndex =
      lines.length - 1;

    let last =
      lines[lastIndex];


    if (
      last.length >
      maxChars - 1
    ) {

      last =
        last.slice(
          0,
          Math.max(
            1,
            maxChars - 1
          )
        );
    }


    lines[lastIndex] =
      `${last.replace(/[.,;:!?-]+$/, "")}…`;
  }


  return lines;
}


// ============================================================
// ОБРЕЗКА КОРОТКОГО ТЕКСТА
// ============================================================

function posterCut(
  text,
  maxChars
) {

  const value =
    String(text || "").trim();

  if (
    value.length <=
    maxChars
  ) {
    return value;
  }

  return (
    value
      .slice(
        0,
        Math.max(
          1,
          maxChars - 1
        )
      )
      .trimEnd() +
    "…"
  );
}


// ============================================================
// SVG TEXT HELPERS
// ============================================================

function posterText(
  x,
  y,
  text,
  options = {}
) {

  const {
    size = 24,
    weight = 400,
    fill = "#FFFFFF",
    anchor = "start",
    letterSpacing = 0,
    opacity = 1
  } = options;


  return `
    <text
      x="${x}"
      y="${y}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${size}"
      font-weight="${weight}"
      fill="${fill}"
      text-anchor="${anchor}"
      letter-spacing="${letterSpacing}"
      opacity="${opacity}"
    >${esc(text)}</text>
  `;
}


function posterMultiline(
  x,
  y,
  lines,
  options = {}
) {

  const {
    size = 24,
    weight = 400,
    fill = "#FFFFFF",
    lineHeight = Math.round(size * 1.25),
    anchor = "start"
  } = options;


  if (
    !lines ||
    !lines.length
  ) {
    return "";
  }


  return `
    <text
      x="${x}"
      y="${y}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${size}"
      font-weight="${weight}"
      fill="${fill}"
      text-anchor="${anchor}"
    >
      ${lines.map(
        (line, index) => `
          <tspan
            x="${x}"
            dy="${index === 0 ? 0 : lineHeight}"
          >${esc(line)}</tspan>
        `
      ).join("")}
    </text>
  `;
}


// ============================================================
// ОБЩАЯ ШАПКА A4
// ============================================================

function trainerPosterHeader(
  theme,
  subtitle
) {

  return `
    <rect
      x="0"
      y="0"
      width="1240"
      height="1754"
      fill="${theme.bg}"
    />

    <text
      x="620"
      y="104"
      text-anchor="middle"
      font-family="Arial, Helvetica, sans-serif"
      font-size="72"
      font-weight="900"
      letter-spacing="5"
      fill="${theme.accent}"
    >ТИТАН</text>

    <text
      x="620"
      y="151"
      text-anchor="middle"
      font-family="Arial, Helvetica, sans-serif"
      font-size="24"
      font-weight="700"
      letter-spacing="3"
      fill="${theme.text}"
    >${esc(subtitle)}</text>

    <line
      x1="56"
      y1="192"
      x2="1184"
      y2="192"
      stroke="${theme.accent}"
      stroke-width="3"
    />

    <text
      x="620"
      y="980"
      text-anchor="middle"
      font-family="Arial, Helvetica, sans-serif"
      font-size="250"
      font-weight="900"
      letter-spacing="10"
      fill="${theme.watermark}"
      opacity="0.42"
      transform="rotate(-25 620 980)"
    >ТИТАН</text>
  `;
}


// ============================================================
// ПОДВАЛ A4
// ============================================================

function trainerPosterFooter(theme) {

  return `
    <line
      x1="56"
      y1="1707"
      x2="1184"
      y2="1707"
      stroke="${theme.line}"
      stroke-width="2"
    />

    <text
      x="620"
      y="1740"
      text-anchor="middle"
      font-family="Arial, Helvetica, sans-serif"
      font-size="19"
      font-weight="700"
      letter-spacing="1.2"
      fill="${theme.muted}"
    >г. Сарапул · ул. Советская, 46</text>
  `;
}


// ============================================================
// QR ТРЕНЕРА
// ============================================================

function renderTrainerQr(
  trainer,
  qrDataUrl,
  x,
  y,
  size,
  theme,
  compact = false
) {

  const labelSize =
    compact
      ? 12
      : 15;


  if (!qrDataUrl) {

    return `
      <rect
        x="${x}"
        y="${y}"
        width="${size}"
        height="${size}"
        rx="${compact ? 9 : 12}"
        fill="${theme.card2}"
        stroke="${theme.line}"
        stroke-width="2"
      />

      <text
        x="${x + size / 2}"
        y="${y + size / 2 - 4}"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${compact ? 12 : 15}"
        font-weight="800"
        fill="${theme.muted}"
      >QR НЕ</text>

      <text
        x="${x + size / 2}"
        y="${y + size / 2 + 15}"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${compact ? 12 : 15}"
        font-weight="800"
        fill="${theme.muted}"
      >ЗАДАН</text>
    `;
  }


  return `
    <rect
      x="${x - 5}"
      y="${y - 5}"
      width="${size + 10}"
      height="${size + 10}"
      rx="${compact ? 8 : 12}"
      fill="${theme.qrBg}"
    />

    <image
      href="${qrDataUrl}"
      x="${x}"
      y="${y}"
      width="${size}"
      height="${size}"
      preserveAspectRatio="xMidYMid meet"
    />

    <text
      x="${x + size / 2}"
      y="${y + size + (compact ? 17 : 22)}"
      text-anchor="middle"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${labelSize}"
      font-weight="800"
      fill="${theme.muted}"
    >ЗАПИСЬ</text>
  `;
}


// ============================================================
// ЛЕГЕНДА ЗАЛОВ
// ============================================================

function trainerPosterLegend(
  x,
  y,
  width,
  theme,
  mode = "double"
) {

  if (
    mode === "triple"
  ) {

    return `
      ${posterText(
        x,
        y,
        "ЗАЛЫ:",
        {
          size: 12,
          weight: 900,
          fill: theme.accent
        }
      )}

      ${posterText(
        x + 48,
        y,
        "1 — КРОССФИТ / БОКС   ·   2 — TRX / АНТИГРАВИТИ   ·   3 — СИЛОВОЙ ТРЕНИНГ   ·   5 — ЙОГА / АЭРОЙОГА   ·   GYM — ТРЕНАЖЕРНЫЙ ЗАЛ",
        {
          size: 11,
          weight: 700,
          fill: theme.muted
        }
      )}
    `;
  }


  if (
    mode === "single"
  ) {

    return `
      ${posterText(
        x,
        y,
        "ЗАЛЫ",
        {
          size: 18,
          weight: 900,
          fill: theme.accent,
          letterSpacing: 1
        }
      )}

      ${posterText(
        x,
        y + 30,
        "1 — КРОССФИТ / БОКС     2 — TRX / АНТИГРАВИТИ     3 — СИЛОВОЙ ТРЕНИНГ",
        {
          size: 17,
          weight: 700,
          fill: theme.text
        }
      )}

      ${posterText(
        x,
        y + 58,
        "5 — ЙОГА / АЭРОЙОГА     GYM — ТРЕНАЖЕРНЫЙ ЗАЛ",
        {
          size: 17,
          weight: 700,
          fill: theme.text
        }
      )}
    `;
  }


  return `
    ${posterText(
      x,
      y,
      "ЗАЛЫ",
      {
        size: 15,
        weight: 900,
        fill: theme.accent,
        letterSpacing: 1
      }
    )}

    ${posterText(
      x,
      y + 25,
      "1 — КРОССФИТ / БОКС   ·   2 — TRX / АНТИГРАВИТИ   ·   3 — СИЛОВОЙ ТРЕНИНГ",
      {
        size: 14,
        weight: 700,
        fill: theme.text
      }
    )}

    ${posterText(
      x,
      y + 48,
      "5 — ЙОГА / АЭРОЙОГА   ·   GYM — ТРЕНАЖЕРНЫЙ ЗАЛ",
      {
        size: 14,
        weight: 700,
        fill: theme.text
      }
    )}
  `;
}


// ============================================================
// НАПРАВЛЕНИЯ ТРЕНЕРА
// ============================================================

function renderTrainerDirections(
  trainer,
  x,
  y,
  width,
  theme,
  layout = "double"
) {

  const directions =
    trainer.directions || [];


  if (!directions.length) {

    return {
      svg: "",
      height: 0
    };
  }


  let svg = "";


  // ==========================================================
  // ОДИН ТРЕНЕР
  // ==========================================================

  if (layout === "single") {

    const titleSize = 22;
    const descSize = 18;
    const lineHeight = 23;
    const gap = 16;

    let cursorY = y;


    for (const direction of directions) {

      svg += posterText(
        x,
        cursorY,
        direction.name,
        {
          size: titleSize,
          weight: 900,
          fill: theme.accent
        }
      );


      // Полное описание.
      // Количество строк НЕ ограничиваем.
      const lines =
        posterWrapFull(
          direction.description,
          72
        );


      if (lines.length) {

        svg += posterMultiline(
          x,
          cursorY + 27,
          lines,
          {
            size: descSize,
            weight: 500,
            fill: theme.muted,
            lineHeight
          }
        );
      }


      cursorY +=
        37 +
        Math.max(
          1,
          lines.length
        ) *
        lineHeight +
        gap;
    }


    return {
      svg,
      height: cursorY - y
    };
  }


  // ==========================================================
  // ДВА / ТРИ ТРЕНЕРА
  // ==========================================================

  const compact =
    layout === "triple";


  const useTwoColumns =
    compact
      ? directions.length >= 3
      : directions.length > 2;


  const columnGap =
    compact
      ? 18
      : 26;


  const columnWidth =
    useTwoColumns
      ? (
          width -
          columnGap
        ) / 2
      : width;


  const nameSize =
    compact
      ? 15
      : 19;


  const descSize =
  compact
    ? 14
    : 19;


const descLineHeight =
  compact
    ? 18
    : 24;


  const nameToDescription =
    compact
      ? 19
      : 24;


  const bottomGap =
    compact
      ? 9
      : 13;

const maxChars =
  useTwoColumns
    ? (
        compact
          ? 42
          : 55
      )
    : (
        compact
          ? 82
          : 110
      );
  

  // ==========================================================
  // СОЗДАЁМ БЛОКИ НАПРАВЛЕНИЙ
  //
  // У каждого направления своя реальная высота.
  // Никаких "...".
  // ==========================================================

  const blocks =
    directions.map(
      direction => {

        const descriptionLines =
          posterWrapFull(
            direction.description,
            maxChars
          );


        const height =
          nameToDescription +
          Math.max(
            1,
            descriptionLines.length
          ) *
          descLineHeight +
          bottomGap;


        return {
          direction,
          descriptionLines,
          height
        };
      }
    );


  // ==========================================================
  // ОДНА КОЛОНКА
  // ==========================================================

  if (!useTwoColumns) {

    let cursorY = y;


    for (const block of blocks) {

      svg += posterText(
        x,
        cursorY,
        block.direction.name,
        {
          size: nameSize,
          weight: 900,
          fill: theme.accent
        }
      );


      if (
        block.descriptionLines.length
      ) {

        svg += posterMultiline(
          x,
          cursorY +
          nameToDescription,
          block.descriptionLines,
          {
            size: descSize,
            weight: 500,
            fill: theme.muted,
            lineHeight:
              descLineHeight
          }
        );
      }


      cursorY +=
        block.height;
    }


    return {
      svg,
      height:
        cursorY - y
    };
  }


  // ==========================================================
  // ДВЕ КОЛОНКИ
  //
  // Распределяем направления по колонкам так,
  // чтобы их высота была примерно одинаковой.
  // ==========================================================

  const left = [];
  const right = [];

  let leftHeight = 0;
  let rightHeight = 0;


  for (const block of blocks) {

    if (
      leftHeight <=
      rightHeight
    ) {

      left.push(block);
      leftHeight +=
        block.height;

    } else {

      right.push(block);
      rightHeight +=
        block.height;
    }
  }


  function renderDirectionColumn(
    column,
    columnX
  ) {

    let result = "";
    let cursorY = y;


    for (const block of column) {

      result += posterText(
        columnX,
        cursorY,
        block.direction.name,
        {
          size: nameSize,
          weight: 900,
          fill: theme.accent
        }
      );


      if (
        block.descriptionLines.length
      ) {

        result += posterMultiline(
          columnX,
          cursorY +
          nameToDescription,
          block.descriptionLines,
          {
            size: descSize,
            weight: 500,
            fill: theme.muted,
            lineHeight:
              descLineHeight
          }
        );
      }


      cursorY +=
        block.height;
    }


    return result;
  }


  svg +=
    renderDirectionColumn(
      left,
      x
    );


  svg +=
    renderDirectionColumn(
      right,
      x +
      columnWidth +
      columnGap
    );


  return {
    svg,
    height:
      Math.max(
        leftHeight,
        rightHeight
      )
  };
}


// ============================================================
// ПОЛНЫЙ ПЕРЕНОС ОПИСАНИЯ
// БЕЗ СОКРАЩЕНИЯ И БЕЗ "..."
// ============================================================

function posterWrapFull(
  text,
  maxChars = 60
) {

  const value =
    String(text || "")
      .trim();


  if (!value) {
    return [];
  }


  const words =
    value.split(/\s+/);


  const lines = [];

  let current = "";


  for (const word of words) {

    const next =
      current
        ? `${current} ${word}`
        : word;


    if (
      next.length <= maxChars
    ) {

      current = next;

    } else {

      if (current) {
        lines.push(current);
      }


      // Если одно слово вдруг длиннее
      // допустимой строки, всё равно
      // сохраняем его полностью.

      current = word;
    }
  }


  if (current) {
    lines.push(current);
  }


  return lines;
}

// ============================================================
// ОДНА КОЛОНКА РАСПИСАНИЯ
// ============================================================

function renderScheduleColumn(
  items,
  x,
  y,
  width,
  availableHeight,
  theme,
  layout = "double"
) {

  if (!items.length) {
    return "";
  }


  const compact =
    layout === "triple";


  const single =
    layout === "single";


  const headerHeight =
    single
      ? 48
      : compact
        ? 29
        : 41;


  const maxRow =
    single
      ? 59
      : compact
        ? 33
        : 49;


  const minRow =
    single
      ? 34
      : compact
        ? 21
        : 29;


  const gap =
    single
      ? 6
      : compact
        ? 3
        : 5;


  const count =
    items.length;


  const totalGap =
    gap *
    Math.max(
      0,
      count - 1
    );


  const rawRowHeight =
    Math.floor(
      (
        availableHeight -
        headerHeight -
        7 -
        totalGap
      ) /
      count
    );


  const rowHeight =
    Math.max(
      minRow,
      Math.min(
        maxRow,
        rawRowHeight
      )
    );


  const fontSize =
    single
      ? 21
      : compact
        ? 12
        : 16;


  const directionFont =
    single
      ? 20
      : compact
        ? 11.5
        : 15;


  const hallFont =
    single
      ? 20
      : compact
        ? 12
        : 16;


  const pad =
    single
      ? 15
      : compact
        ? 7
        : 11;


  const dayW =
    single
      ? width * 0.13
      : width * 0.14;


  const timeW =
    single
      ? width * 0.20
      : width * 0.21;


  const hallW =
    single
      ? width * 0.12
      : width * 0.12;


  const directionW =
    width -
    dayW -
    timeW -
    hallW;


  let svg = "";


  // ----------------------------------------------------------
  // HEADER
  // ----------------------------------------------------------

  svg += `
    <rect
      x="${x}"
      y="${y}"
      width="${width}"
      height="${headerHeight}"
      rx="${compact ? 8 : 10}"
      fill="${theme.accent}"
    />
  `;


  const headerSize =
    single
      ? 17
      : compact
        ? 10
        : 13;


  const headerY =
    y +
    headerHeight / 2 +
    headerSize * 0.36;


  svg += posterText(
    x + pad,
    headerY,
    "ДЕНЬ",
    {
      size: headerSize,
      weight: 900,
      fill: theme.accentText
    }
  );


  svg += posterText(
    x + dayW + pad,
    headerY,
    "ВРЕМЯ",
    {
      size: headerSize,
      weight: 900,
      fill: theme.accentText
    }
  );


  svg += posterText(
    x +
    dayW +
    timeW +
    pad,
    headerY,
    "НАПРАВЛЕНИЕ",
    {
      size: headerSize,
      weight: 900,
      fill: theme.accentText
    }
  );


  svg += posterText(
    x +
    width -
    hallW / 2,
    headerY,
    "ЗАЛ",
    {
      size: headerSize,
      weight: 900,
      fill: theme.accentText,
      anchor: "middle"
    }
  );


  // ----------------------------------------------------------
  // ROWS
  // ----------------------------------------------------------

  let rowY =
    y +
    headerHeight +
    7;


  items.forEach(
    (
      item,
      index
    ) => {

      svg += `
        <rect
          x="${x}"
          y="${rowY}"
          width="${width}"
          height="${rowHeight}"
          rx="${compact ? 6 : 9}"
          fill="${
            index % 2 === 0
              ? theme.card2
              : theme.card
          }"
          stroke="${theme.line}"
          stroke-width="1"
        />
      `;


      const textY =
        rowY +
        rowHeight / 2 +
        fontSize * 0.35;


      svg += posterText(
        x + pad,
        textY,
        item.day,
        {
          size: fontSize,
          weight: 900,
          fill: theme.text
        }
      );


      svg += posterText(
        x + dayW + pad,
        textY,
        posterCut(
          item.time,
          compact
            ? 12
            : 16
        ),
        {
          size: fontSize,
          weight: 800,
          fill: theme.text
        }
      );


      svg += posterText(
        x +
        dayW +
        timeW +
        pad,
        textY,
        posterCut(
          item.direction,
          compact
            ? 24
            : single
              ? 42
              : 30
        ),
        {
          size: directionFont,
          weight: 700,
          fill: theme.text
        }
      );


      svg += posterText(
        x +
        width -
        hallW / 2,
        textY,
        String(
          item.hall || ""
        ).toUpperCase(),
        {
          size: hallFont,
          weight: 900,
          fill: theme.accent,
          anchor: "middle"
        }
      );


      rowY +=
        rowHeight +
        gap;
    }
  );


  return svg;
}


// ============================================================
// РАСПИСАНИЕ ТРЕНЕРА
// Автоматически выбирает 1 или 2 колонки.
// Все занятия сохраняются.
// ============================================================

function renderTrainerSchedule(
  schedule,
  x,
  y,
  width,
  availableHeight,
  theme,
  layout = "double"
) {

  const items =
    posterSortSchedule(
      schedule || []
    );


  if (!items.length) {

    return `
      <rect
        x="${x}"
        y="${y}"
        width="${width}"
        height="${Math.min(70, availableHeight)}"
        rx="10"
        fill="${theme.card2}"
        stroke="${theme.line}"
        stroke-width="1"
      />

      ${posterText(
        x + 18,
        y + 41,
        "Расписание пока не добавлено",
        {
          size:
            layout === "triple"
              ? 13
              : 18,
          weight: 700,
          fill: theme.muted
        }
      )}
    `;
  }


  const compact =
    layout === "triple";


  const single =
    layout === "single";


  const headerHeight =
    single
      ? 48
      : compact
        ? 29
        : 41;


  const minRow =
    single
      ? 34
      : compact
        ? 21
        : 29;


  const gap =
    single
      ? 6
      : compact
        ? 3
        : 5;


  const requiredOneColumn =
    headerHeight +
    7 +
    items.length *
    minRow +
    Math.max(
      0,
      items.length - 1
    ) *
    gap;


  let useTwoColumns =
    requiredOneColumn >
    availableHeight;


  // Для двух карточек длинное расписание
  // заранее делим на две колонки.
  if (
    layout === "double" &&
    items.length >= 8
  ) {
    useTwoColumns = true;
  }


  // Для трёх карточек делим раньше,
  // чтобы строки оставались читаемыми.
  if (
    layout === "triple" &&
    items.length >= 6
  ) {
    useTwoColumns = true;
  }


  if (!useTwoColumns) {

    return renderScheduleColumn(
      items,
      x,
      y,
      width,
      availableHeight,
      theme,
      layout
    );
  }


  const columnGap =
    compact
      ? 12
      : 18;


  const columnWidth =
    (
      width -
      columnGap
    ) / 2;


  const split =
    Math.ceil(
      items.length / 2
    );


  const leftItems =
    items.slice(
      0,
      split
    );


  const rightItems =
    items.slice(
      split
    );


  return `
    ${renderScheduleColumn(
      leftItems,
      x,
      y,
      columnWidth,
      availableHeight,
      theme,
      layout
    )}

    ${renderScheduleColumn(
      rightItems,
      x +
      columnWidth +
      columnGap,
      y,
      columnWidth,
      availableHeight,
      theme,
      layout
    )}
  `;
}


// ============================================================
// ОДНА КАРТОЧКА ТРЕНЕРА
// ============================================================

async function renderTrainerCard(
  trainer,
  x,
  y,
  width,
  height,
  theme,
  layout = "double"
) {

  const single =
    layout === "single";


  const triple =
    layout === "triple";


  const pad =
    single
      ? 38
      : triple
        ? 22
        : 28;


  const innerX =
    x + pad;


  const innerRight =
    x + width - pad;


  const innerWidth =
    width - pad * 2;


  const qrDataUrl =
    await getTrainerQrDataUrl(
      trainer
    );


  const qrSize =
    single
      ? 128
      : triple
        ? 62
        : 102;


  const lowerZoneHeight =
    single
      ? 155
      : triple
        ? 75
        : 126;


  const lowerZoneTop =
    y +
    height -
    lowerZoneHeight;


  const qrX =
    innerRight -
    qrSize;


  const qrY =
    y +
    height -
    qrSize -
    (
      single
        ? 22
        : triple
          ? 8
          : 13
    );


  const nameSize =
    single
      ? 40
      : triple
        ? 23
        : 31;


  const phoneSize =
    single
      ? 24
      : triple
        ? 14
        : 19;


  const nameY =
    y +
    (
      single
        ? 60
        : triple
          ? 38
          : 48
    );


  const phoneY =
    nameY +
    (
      single
        ? 40
        : triple
          ? 25
          : 32
    );


  let svg = `
    <rect
      x="${x}"
      y="${y}"
      width="${width}"
      height="${height}"
      rx="${
        single
          ? 28
          : triple
            ? 18
            : 22
      }"
      fill="${theme.card}"
      stroke="${theme.border}"
      stroke-width="2"
    />

    <rect
      x="${x}"
      y="${y}"
      width="${
        single
          ? 10
          : triple
            ? 7
            : 9
      }"
      height="${height}"
      rx="4"
      fill="${theme.accent}"
    />
  `;


  // ----------------------------------------------------------
  // ИМЯ
  // ----------------------------------------------------------

  svg += posterText(
    innerX,
    nameY,
    posterCut(
      trainer.name,
      single
        ? 45
        : triple
          ? 42
          : 45
    ),
    {
      size: nameSize,
      weight: 900,
      fill: theme.text
    }
  );


  // ----------------------------------------------------------
  // ТЕЛЕФОН
  // ----------------------------------------------------------

  svg += posterText(
    innerX,
    phoneY,
    trainer.phone || "Телефон не указан",
    {
      size: phoneSize,
      weight: 700,
      fill: theme.muted
    }
  );


  // ----------------------------------------------------------
  // ЛИНИЯ ПОД ШАПКОЙ КАРТОЧКИ
  // ----------------------------------------------------------

  const dividerY =
    phoneY +
    (
      single
        ? 27
        : triple
          ? 14
          : 20
    );


  svg += `
    <line
      x1="${innerX}"
      y1="${dividerY}"
      x2="${innerRight}"
      y2="${dividerY}"
      stroke="${theme.line}"
      stroke-width="2"
    />
  `;


  // ----------------------------------------------------------
  // НАПРАВЛЕНИЯ
  // ----------------------------------------------------------

  const directionsTitleY =
    dividerY +
    (
      single
        ? 40
        : triple
          ? 25
          : 31
    );


  svg += posterText(
    innerX,
    directionsTitleY,
    "НАПРАВЛЕНИЯ",
    {
      size:
        single
          ? 20
          : triple
            ? 12
            : 16,
      weight: 900,
      fill: theme.muted,
      letterSpacing:
        triple
          ? 1
          : 1.5
    }
  );


  const directionsY =
    directionsTitleY +
    (
      single
        ? 36
        : triple
          ? 25
          : 32
    );


  const directionResult =
    renderTrainerDirections(
      trainer,
      innerX,
      directionsY,
      innerWidth,
      theme,
      layout
    );


  svg +=
    directionResult.svg;


  // ----------------------------------------------------------
  // РАСПИСАНИЕ
  // ----------------------------------------------------------

  let scheduleTitleY =
    directionsY +
    directionResult.height +
    (
      single
        ? 20
        : triple
          ? 6
          : 10
    );


  // Защита для тренеров с большим количеством направлений.
  // Оставляем расписанию максимум возможного места.

  const minimumScheduleTitleY =
    directionsY +
    (
      single
        ? 55
        : triple
          ? 30
          : 42
    );


  scheduleTitleY =
    Math.max(
      scheduleTitleY,
      minimumScheduleTitleY
    );


  svg += posterText(
    innerX,
    scheduleTitleY,
    "РАСПИСАНИЕ",
    {
      size:
        single
          ? 20
          : triple
            ? 12
            : 16,
      weight: 900,
      fill: theme.muted,
      letterSpacing:
        triple
          ? 1
          : 1.5
    }
  );


  const scheduleY =
    scheduleTitleY +
    (
      single
        ? 25
        : triple
          ? 16
          : 21
    );


  const scheduleBottom =
    lowerZoneTop -
    (
      single
        ? 17
        : triple
          ? 8
          : 13
    );


  const scheduleHeight =
    Math.max(
      triple
        ? 55
        : single
          ? 105
          : 90,
      scheduleBottom -
      scheduleY
    );


  svg += renderTrainerSchedule(
    trainer.schedule,
    innerX,
    scheduleY,
    innerWidth,
    scheduleHeight,
    theme,
    layout
  );


  // ----------------------------------------------------------
  // НИЖНЯЯ ЗОНА
  // ----------------------------------------------------------

  svg += `
    <line
      x1="${innerX}"
      y1="${lowerZoneTop}"
      x2="${innerRight}"
      y2="${lowerZoneTop}"
      stroke="${theme.line}"
      stroke-width="2"
    />
  `;


  // QR всегда справа.
  svg += renderTrainerQr(
    trainer,
    qrDataUrl,
    qrX,
    qrY,
    qrSize,
    theme,
    triple
  );


  // Легенда не заходит под QR.
  const legendWidth =
    Math.max(
      200,
      qrX -
      innerX -
      (
        single
          ? 35
          : triple
            ? 15
            : 25
      )
    );


  svg += trainerPosterLegend(
    innerX,
    lowerZoneTop +
    (
      single
        ? 35
        : triple
          ? 27
          : 29
    ),
    legendWidth,
    theme,
    layout
  );


  return svg;
}


// ============================================================
// ОДИН ТРЕНЕР — A4
// ============================================================

async function makePoster(
  trainer,
  mode = "color"
) {

  const theme =
    trainerPosterTheme(mode);


  const cardX = 56;
  const cardY = 225;
  const cardWidth = 1128;
  const cardHeight = 1435;


  const card =
    await renderTrainerCard(
      trainer,
      cardX,
      cardY,
      cardWidth,
      cardHeight,
      theme,
      "single"
    );


  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      width="1240"
      height="1754"
      viewBox="0 0 1240 1754"
    >

      ${trainerPosterHeader(
        theme,
        "ТРЕНЕР · РАСПИСАНИЕ"
      )}

      ${card}

      ${trainerPosterFooter(theme)}

    </svg>
  `;
}


// ============================================================
// 2 / 3 ТРЕНЕРА — A4
// ============================================================

async function makeMultiTrainerPoster(
  trainers,
  mode = "color"
) {

  const safeTrainers =
    (trainers || [])
      .slice(0, 3);


  if (!safeTrainers.length) {

    throw new Error(
      "No trainers selected"
    );
  }


  if (
    safeTrainers.length === 1
  ) {

    return makePoster(
      safeTrainers[0],
      mode
    );
  }


  const theme =
    trainerPosterTheme(mode);


  const count =
    safeTrainers.length;


  const pageX = 56;
  const pageTop = 225;
  const pageBottom = 1660;
  const cardWidth = 1128;


  const gap =
    count === 2
      ? 24
      : 17;


  const cardHeight =
    (
      pageBottom -
      pageTop -
      gap *
      (
        count - 1
      )
    ) /
    count;


  const layout =
    count === 2
      ? "double"
      : "triple";


  let cards = "";


  for (
    let index = 0;
    index < safeTrainers.length;
    index++
  ) {

    const trainer =
      safeTrainers[index];


    const cardY =
      pageTop +
      index *
      (
        cardHeight +
        gap
      );


    cards +=
      await renderTrainerCard(
        trainer,
        pageX,
        cardY,
        cardWidth,
        cardHeight,
        theme,
        layout
      );
  }


  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      width="1240"
      height="1754"
      viewBox="0 0 1240 1754"
    >

      ${trainerPosterHeader(
        theme,
        count === 2
          ? "ТРЕНЕРЫ · РАСПИСАНИЕ"
          : "ТРЕНЕРЫ · РАСПИСАНИЕ"
      )}

      ${cards}

      ${trainerPosterFooter(theme)}

    </svg>
  `;
}


// ============================================================
// ОБЩЕЕ РАСПИСАНИЕ — ПОДГОТОВКА
// ============================================================

function groupWeekSchedule(
  schedule
) {

  const days = [
    "ПН",
    "ВТ",
    "СР",
    "ЧТ",
    "ПТ",
    "СБ",
    "ВС"
  ];


  const groups = {};


  for (const day of days) {
    groups[day] = [];
  }


  for (
    const item of schedule || []
  ) {

    const day =
      String(item.day || "")
        .trim()
        .toUpperCase();


    if (!groups[day]) {
      groups[day] = [];
    }


    groups[day].push(item);
  }


  for (
    const day of Object.keys(groups)
  ) {

    groups[day].sort(
      (a, b) => {

        const timeDiff =
          posterTimeOrder(a.time) -
          posterTimeOrder(b.time);

        if (timeDiff !== 0) {
          return timeDiff;
        }

        return String(
          a.trainer_name || ""
        ).localeCompare(
          String(
            b.trainer_name || ""
          ),
          "ru"
        );
      }
    );
  }


  return groups;
}


// ============================================================
// ОДИН ДЕНЬ ОБЩЕГО РАСПИСАНИЯ
// ============================================================

function renderWeekDay(
  day,
  items,
  x,
  y,
  width,
  height,
  theme
) {

  const titleHeight = 44;

  const rows =
    items || [];


  let svg = `
    <rect
      x="${x}"
      y="${y}"
      width="${width}"
      height="${height}"
      rx="18"
      fill="${theme.card}"
      stroke="${theme.border}"
      stroke-width="2"
    />

    <rect
      x="${x}"
      y="${y}"
      width="${width}"
      height="${titleHeight}"
      rx="18"
      fill="${theme.accent}"
    />

    <rect
      x="${x}"
      y="${y + titleHeight - 18}"
      width="${width}"
      height="18"
      fill="${theme.accent}"
    />

    ${posterText(
      x + 20,
      y + 30,
      day,
      {
        size: 20,
        weight: 900,
        fill: theme.accentText
      }
    )}
  `;


  if (!rows.length) {

    svg += posterText(
      x + 20,
      y + titleHeight + 38,
      "Нет занятий",
      {
        size: 16,
        weight: 700,
        fill: theme.muted
      }
    );


    return svg;
  }


  const available =
    height -
    titleHeight -
    18;


  const rowGap = 5;


  const rowHeight =
    Math.max(
      29,
      Math.min(
        48,
        Math.floor(
          (
            available -
            rowGap *
            Math.max(
              0,
              rows.length - 1
            )
          ) /
          rows.length
        )
      )
    );


  let rowY =
    y +
    titleHeight +
    10;


  rows.forEach(
    (
      item,
      index
    ) => {

      svg += `
        <rect
          x="${x + 10}"
          y="${rowY}"
          width="${width - 20}"
          height="${rowHeight}"
          rx="8"
          fill="${
            index % 2 === 0
              ? theme.card2
              : theme.card
          }"
          stroke="${theme.line}"
          stroke-width="1"
        />
      `;


      const centerY =
        rowY +
        rowHeight / 2 +
        5;


      svg += posterText(
        x + 22,
        centerY,
        posterCut(
          item.time,
          13
        ),
        {
          size: 14,
          weight: 900,
          fill: theme.accent
        }
      );


      svg += posterText(
        x + 115,
        centerY,
        posterCut(
          item.direction,
          25
        ),
        {
          size: 13,
          weight: 800,
          fill: theme.text
        }
      );


      svg += posterText(
        x + width - 145,
        centerY,
        posterCut(
          item.trainer_name,
          18
        ),
        {
          size: 12,
          weight: 700,
          fill: theme.muted,
          anchor: "end"
        }
      );


      svg += posterText(
        x + width - 22,
        centerY,
        String(
          item.hall || ""
        ).toUpperCase(),
        {
          size: 14,
          weight: 900,
          fill: theme.accent,
          anchor: "end"
        }
      );


      rowY +=
        rowHeight +
        rowGap;
    }
  );


  return svg;
}


// ============================================================
// ОБЩЕЕ РАСПИСАНИЕ A4
// ============================================================

async function makeWeekPoster(
  mode = "color"
) {

  const theme =
    trainerPosterTheme(mode);


  const schedule =
    await getWeekSchedule();


  const groups =
    groupWeekSchedule(
      schedule
    );


  const days = [
    "ПН",
    "ВТ",
    "СР",
    "ЧТ",
    "ПТ",
    "СБ",
    "ВС"
  ];


  const leftDays = [
    "ПН",
    "ВТ",
    "СР",
    "ЧТ"
  ];


  const rightDays = [
    "ПТ",
    "СБ",
    "ВС"
  ];


  const pageX = 56;
  const top = 225;
  const bottom = 1560;
  const columnGap = 22;


  const columnWidth =
    (
      1128 -
      columnGap
    ) / 2;


  const leftGap = 14;
  const rightGap = 14;


  const leftHeight =
    (
      bottom -
      top -
      leftGap *
      (
        leftDays.length - 1
      )
    ) /
    leftDays.length;


  const rightHeight =
    (
      bottom -
      top -
      rightGap *
      (
        rightDays.length - 1
      )
    ) /
    rightDays.length;


  let content = "";


  leftDays.forEach(
    (
      day,
      index
    ) => {

      const y =
        top +
        index *
        (
          leftHeight +
          leftGap
        );


      content +=
        renderWeekDay(
          day,
          groups[day],
          pageX,
          y,
          columnWidth,
          leftHeight,
          theme
        );
    }
  );


  rightDays.forEach(
    (
      day,
      index
    ) => {

      const y =
        top +
        index *
        (
          rightHeight +
          rightGap
        );


      content +=
        renderWeekDay(
          day,
          groups[day],
          pageX +
          columnWidth +
          columnGap,
          y,
          columnWidth,
          rightHeight,
          theme
        );
    }
  );


  // ----------------------------------------------------------
  // ЛЕГЕНДА ВНИЗУ
  // ----------------------------------------------------------

  content += `
    <rect
      x="56"
      y="1580"
      width="1128"
      height="80"
      rx="16"
      fill="${theme.card}"
      stroke="${theme.border}"
      stroke-width="2"
    />

    ${posterText(
      78,
      1611,
      "ЗАЛЫ",
      {
        size: 15,
        weight: 900,
        fill: theme.accent
      }
    )}

    ${posterText(
      78,
      1638,
      "1 — КРОССФИТ / БОКС   ·   2 — TRX / АНТИГРАВИТИ   ·   3 — СИЛОВОЙ ТРЕНИНГ   ·   5 — ЙОГА / АЭРОЙОГА   ·   GYM — ТРЕНАЖЕРНЫЙ ЗАЛ",
      {
        size: 13,
        weight: 700,
        fill: theme.text
      }
    )}
  `;


  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      width="1240"
      height="1754"
      viewBox="0 0 1240 1754"
    >

      ${trainerPosterHeader(
        theme,
        "ОБЩЕЕ РАСПИСАНИЕ"
      )}

      ${content}

      ${trainerPosterFooter(theme)}

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
  caption = ""
) {

  const boundary =
    `----TitanBoundary${Date.now()}`;


  const chunks = [];


  function pushText(text) {

    chunks.push(
      Buffer.from(
        text,
        "utf8"
      )
    );
  }


  pushText(
    `--${boundary}\r\n`
  );

  pushText(
    `Content-Disposition: form-data; name="chat_id"\r\n\r\n`
  );

  pushText(
    `${chat}\r\n`
  );


  if (caption) {

    pushText(
      `--${boundary}\r\n`
    );

    pushText(
      `Content-Disposition: form-data; name="caption"\r\n\r\n`
    );

    pushText(
      `${caption}\r\n`
    );
  }


  pushText(
    `--${boundary}\r\n`
  );

  pushText(
    `Content-Disposition: form-data; name="document"; filename="${filename}"\r\n`
  );

  pushText(
    `Content-Type: image/svg+xml\r\n\r\n`
  );


  chunks.push(
    Buffer.from(
      svg,
      "utf8"
    )
  );


  pushText(
    `\r\n--${boundary}--\r\n`
  );


  const body =
    Buffer.concat(chunks);


  const response =
    await fetch(
      `${TG}/sendDocument`,
      {
        method: "POST",

        headers: {
          "content-type":
            `multipart/form-data; boundary=${boundary}`
        },

        body
      }
    );


  const result =
    await response.json();


  if (
    !response.ok ||
    !result.ok
  ) {

    throw new Error(
      `sendDocument: ${JSON.stringify(result)}`
    );
  }


  return result;
}


// ============================================================
// ОТПРАВКА ОДНОГО ТРЕНЕРА
// ============================================================

async function sendPoster(
  chat,
  trainerId,
  mode = "color"
) {

  const trainer =
    await getTrainer(
      trainerId
    );


  if (!trainer) {

    await sendMessage(
      chat,
      "Тренер не найден."
    );

    return;
  }


  const svg =
    await makePoster(
      trainer,
      mode
    );


  const safeName =
    String(trainer.name || "trainer")
      .replace(
        /[^a-zA-Zа-яА-ЯёЁ0-9]+/g,
        "_"
      )
      .replace(
        /^_+|_+$/g,
        ""
      );


  await sendSvgDocument(
    chat,
    svg,
    `TITAN_${safeName}_${mode}.svg`,
    `ТИТАН · ${trainer.name}`
  );
}


// ============================================================
// ОТПРАВКА 2 / 3 ТРЕНЕРОВ
// ============================================================

async function sendMultiTrainerPoster(
  chat,
  trainerIds,
  mode = "color"
) {

  const trainers =
    await getTrainersByIds(
      trainerIds
    );


  if (!trainers.length) {

    await sendMessage(
      chat,
      "Не удалось получить выбранных тренеров."
    );

    return;
  }


  const svg =
    await makeMultiTrainerPoster(
      trainers,
      mode
    );


  await sendSvgDocument(
    chat,
    svg,
    `TITAN_trainers_${trainers.length}_${mode}.svg`,
    `ТИТАН · ${trainers.length} тренер${
      trainers.length === 2
        ? "а"
        : ""
    }`
  );
}


// ============================================================
// ОТПРАВКА ОБЩЕГО РАСПИСАНИЯ
// ============================================================

async function sendWeekPoster(
  chat,
  mode = "color"
) {

  const svg =
    await makeWeekPoster(
      mode
    );


  await sendSvgDocument(
    chat,
    svg,
    `TITAN_week_${mode}.svg`,
    "ТИТАН · Общее расписание"
  );
}


// ============================================================
// КОНЕЦ БЛОКА 2 / 3
// ============================================================
// ============================================================
// БЛОК 3 / 3
// ТИТАН BOT
// WEBHOOK · КНОПКИ · ГЕНЕРАЦИЯ · АДМИНКА
// ============================================================

module.exports = async function handler(req, res) {

  try {

    // ========================================================
    // ПРОВЕРКА СЕРВИСА
    // ========================================================

    if (req.method === "GET") {

      return res
        .status(200)
        .json({
          ok: true,
          service: "TITAN Bot",
          version: "3.0"
        });
    }


    if (req.method !== "POST") {

      return res
        .status(405)
        .json({
          ok: false,
          error: "Method not allowed"
        });
    }


    // ========================================================
    // БАЗА
    // ========================================================

    await initDatabase();


    const update =
      req.body || {};


    // ========================================================
    // CALLBACK QUERY
    // ========================================================

    if (update.callback_query) {

      const callback =
        update.callback_query;


      const chat =
        callback.message?.chat?.id;


      const data =
        String(
          callback.data || ""
        );


      if (!chat) {

        return res
          .status(200)
          .json({ ok: true });
      }


      // Убираем "часики" на Telegram-кнопке.

      try {

        await api(
          "answerCallbackQuery",
          {
            callback_query_id:
              callback.id
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

      if (
        data === "home"
      ) {

        await clearState(chat);


        await sendMessage(

          chat,

          `СПОРТИВНЫЙ КОМПЛЕКС «ТИТАН»

Выберите раздел:`,

          mainKeyboard()
        );


        return res
          .status(200)
          .json({ ok: true });
      }


      // ======================================================
      // ПУБЛИЧНЫЙ СПИСОК ТРЕНЕРОВ
      // ======================================================

      if (
        data === "trainers"
      ) {

        await clearState(chat);


        const trainers =
          await getTrainers();


        let text =
          `👤 ТРЕНЕРЫ «ТИТАН»`;


        if (!trainers.length) {

          text +=
            `\n\nТренеры пока не добавлены.`;

        } else {

          for (
            const trainer of trainers
          ) {

            text +=
              `\n\n${trainer.name}`;

            if (trainer.phone) {

              text +=
                `\n📞 ${trainer.phone}`;
            }
          }
        }


        await sendMessage(

          chat,

          text,

          [
            [
              {
                text:
                  "🏠 Главное меню",
                callback_data:
                  "home"
              }
            ]
          ]
        );


        return res
          .status(200)
          .json({ ok: true });
      }


      // ======================================================
      // МЕНЮ СОЗДАНИЯ ИНФОГРАФИКИ
      // ======================================================

      if (
        data === "create"
      ) {

        await clearState(chat);


        await sendMessage(

          chat,

          `🖼 СОЗДАТЬ ИНФОГРАФИКУ

Что нужно создать?`,

          [

            [
              {
                text:
                  "👤 Тренеры",
                callback_data:
                  "trainer_poster_menu"
              }
            ],

            [
              {
                text:
                  "📅 Общее расписание",
                callback_data:
                  "week"
              }
            ],

            [
              {
                text:
                  "⬅️ Назад",
                callback_data:
                  "home"
              }
            ]

          ]
        );


        return res
          .status(200)
          .json({ ok: true });
      }


      // ======================================================
      // КОЛИЧЕСТВО ТРЕНЕРОВ
      // ======================================================

      if (
        data ===
        "trainer_poster_menu"
      ) {

        await clearState(chat);


        await sendMessage(

          chat,

          `👤 ИНФОГРАФИКА ТРЕНЕРОВ

Сколько тренеров разместить на одном листе A4?`,

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
          .json({ ok: true });
      }


      // ======================================================
      // НАЧАЛО ВЫБОРА ТРЕНЕРОВ
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
            .json({ ok: true });
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
            text:
              "⬅️ Назад",
            callback_data:
              "trainer_poster_menu"
          }

        ]);


        await sendMessage(

          chat,

          `Выберите ${
            count === 1
              ? "1 тренера"
              : `${count} тренеров`
          }:`,

          keyboard
        );


        return res
          .status(200)
          .json({ ok: true });
      }


      // ======================================================
      // ВЫБОР КОНКРЕТНОГО ТРЕНЕРА
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

            `Выбор устарел.

Откройте создание инфографики заново.`,

            [
              [
                {
                  text:
                    "🖼 Создать инфографику",
                  callback_data:
                    "create"
                }
              ]
            ]
          );


          return res
            .status(200)
            .json({ ok: true });
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


        // Если уже выбран —
        // повторное нажатие снимает выбор.

        if (
          selected.includes(
            trainerId
          )
        ) {

          selected =
            selected.filter(
              id =>
                id !==
                trainerId
            );

        } else {

          if (
            selected.length <
            count
          ) {

            selected.push(
              trainerId
            );
          }
        }


        // ----------------------------------------------------
        // НУЖНО ЕЩЁ ВЫБИРАТЬ
        // ----------------------------------------------------

        if (
          selected.length <
          count
        ) {

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
              text:
                "🔄 Сбросить выбор",
              callback_data:
                `poster_count:${count}`
            }

          ]);


          keyboard.push([

            {
              text:
                "⬅️ Назад",
              callback_data:
                "trainer_poster_menu"
            }

          ]);


          await sendMessage(

            chat,

            `Выбрано: ${selected.length} из ${count}

Выберите ${
  count - selected.length
} ещё:`,

            keyboard
          );


          return res
            .status(200)
            .json({ ok: true });
        }


        // ----------------------------------------------------
        // ВСЕ ТРЕНЕРЫ ВЫБРАНЫ
        // ----------------------------------------------------

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


        const names =
          selectedTrainers
            .map(
              trainer =>
                `• ${trainer.name}`
            )
            .join("\n");


        await sendMessage(

          chat,

          `✅ Тренеры выбраны:

${names}

Выберите вариант инфографики:`,

          [

            [
              {
                text:
                  "🟧 Цветной",
                callback_data:
                  "poster_generate:color"
              },

              {
                text:
                  "⬜ Ч/Б",
                callback_data:
                  "poster_generate:bw"
              }
            ],

            [
              {
                text:
                  "🔄 Выбрать заново",
                callback_data:
                  `poster_count:${count}`
              }
            ],

            [
              {
                text:
                  "⬅️ Назад",
                callback_data:
                  "trainer_poster_menu"
              }
            ]

          ]
        );


        return res
          .status(200)
          .json({ ok: true });
      }


      // ======================================================
      // ГЕНЕРАЦИЯ ИНФОГРАФИКИ ТРЕНЕРОВ
      // ======================================================

      if (
        data.startsWith(
          "poster_generate:"
        )
      ) {

        const mode =
          data.split(":")[1];


        if (
          !["color", "bw"].includes(
            mode
          )
        ) {

          await sendMessage(
            chat,
            "Некорректный вариант оформления."
          );


          return res
            .status(200)
            .json({ ok: true });
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

            `Выбор тренеров не найден.

Создайте инфографику заново.`,

            [
              [
                {
                  text:
                    "🖼 Создать инфографику",
                  callback_data:
                    "create"
                }
              ]
            ]
          );


          return res
            .status(200)
            .json({ ok: true });
        }


        const current =
          stateData(state);


        const selected =
          Array.isArray(
            current.selected
          )
            ? current.selected
                .map(Number)
                .filter(
                  Number.isInteger
                )
            : [];


        if (!selected.length) {

          await clearState(chat);


          await sendMessage(
            chat,
            "Тренеры не выбраны."
          );


          return res
            .status(200)
            .json({ ok: true });
        }


        await sendMessage(
          chat,
          "⏳ Создаю инфографику..."
        );


        if (
          selected.length === 1
        ) {

          await sendPoster(
            chat,
            selected[0],
            mode
          );

        } else {

          await sendMultiTrainerPoster(
            chat,
            selected,
            mode
          );
        }


        await clearState(chat);


        await sendMessage(

          chat,

          `✅ Готово.

QR-код каждой карточки использует персональную ссылку этого тренера.`,

          [

            [
              {
                text:
                  "🖼 Создать ещё",
                callback_data:
                  "create"
              }
            ],

            [
              {
                text:
                  "🏠 Главное меню",
                callback_data:
                  "home"
              }
            ]

          ]
        );


        return res
          .status(200)
          .json({ ok: true });
      }


      // ======================================================
      // ОБЩЕЕ РАСПИСАНИЕ
      // ======================================================

      if (
        data === "week"
      ) {

        await clearState(chat);


        await sendMessage(

          chat,

          `📅 ОБЩЕЕ РАСПИСАНИЕ

Выберите вариант:`,

          [

            [
              {
                text:
                  "🟧 Цветной",
                callback_data:
                  "week_color"
              },

              {
                text:
                  "⬜ Ч/Б",
                callback_data:
                  "week_bw"
              }
            ],

            [
              {
                text:
                  "⬅️ Назад",
                callback_data:
                  "create"
              }
            ]

          ]
        );


        return res
          .status(200)
          .json({ ok: true });
      }


      // ======================================================
      // ОБЩЕЕ РАСПИСАНИЕ — ЦВЕТ
      // ======================================================

      if (
        data === "week_color"
      ) {

        await sendMessage(
          chat,
          "⏳ Создаю общее расписание..."
        );


        await sendWeekPoster(
          chat,
          "color"
        );


        await sendMessage(

          chat,

          "✅ Цветное расписание готово.",

          [
            [
              {
                text:
                  "🖼 Создать ещё",
                callback_data:
                  "create"
              }
            ],

            [
              {
                text:
                  "🏠 Главное меню",
                callback_data:
                  "home"
              }
            ]
          ]
        );


        return res
          .status(200)
          .json({ ok: true });
      }


      // ======================================================
      // ОБЩЕЕ РАСПИСАНИЕ — Ч/Б
      // ======================================================

      if (
        data === "week_bw"
      ) {

        await sendMessage(
          chat,
          "⏳ Создаю общее расписание..."
        );


        await sendWeekPoster(
          chat,
          "bw"
        );


        await sendMessage(

          chat,

          "✅ Чёрно-белое расписание готово.",

          [
            [
              {
                text:
                  "🖼 Создать ещё",
                callback_data:
                  "create"
              }
            ],

            [
              {
                text:
                  "🏠 Главное меню",
                callback_data:
                  "home"
              }
            ]
          ]
        );


        return res
          .status(200)
          .json({ ok: true });
      }


      // ======================================================
      // АДМИНКА
      // ======================================================

      if (
        data === "admin"
      ) {

        await showAdmin(chat);


        return res
          .status(200)
          .json({ ok: true });
      }


      // ======================================================
      // АДМИНКА — СПИСОК ТРЕНЕРОВ
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

          `👤 ТРЕНЕРЫ

Выберите тренера для редактирования:`,

          keyboard
        );


        return res
          .status(200)
          .json({ ok: true });
      }


      // ======================================================
      // АДМИНКА — КОНКРЕТНЫЙ ТРЕНЕР
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
          .json({ ok: true });
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

          `✏️ Отправьте новое имя тренера.

Чтобы отменить изменение, вернитесь в главное меню.`
        );


        return res
          .status(200)
          .json({ ok: true });
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
          "📞 Отправьте новый номер телефона:"
        );


        return res
          .status(200)
          .json({ ok: true });
      }


      // ======================================================
      // ИЗМЕНИТЬ QR-СЫЛКУ
      // ======================================================

      if (
        data.startsWith(
          "edit_qr:"
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
            "Тренер не найден."
          );


          return res
            .status(200)
            .json({ ok: true });
        }


        await setState(
          chat,
          "edit_qr",
          trainerId
        );


        const currentQr =
          trainer.qr_url
            ? `\n\nСейчас установлено:\n${trainer.qr_url}`
            : `\n\nСейчас персональная ссылка не установлена.`;


        await sendMessage(

          chat,

          `🔗 QR-КОД

Отправьте ссылку, на которую должен вести QR-код тренера.

Например:
https://t.me/username

Можно вставить Telegram, VK, сайт или страницу записи.${currentQr}

Чтобы убрать QR-ссылку, отправьте:
удалить`
        );


        return res
          .status(200)
          .json({ ok: true });
      }


      // ======================================================
      // ДОБАВИТЬ ТРЕНЕРА
      // ======================================================

      if (
        data === "add_trainer"
      ) {

        await setState(
          chat,
          "add_trainer_name"
        );


        await sendMessage(
          chat,
          "➕ Введите имя нового тренера:"
        );


        return res
          .status(200)
          .json({ ok: true });
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
            "Тренер не найден."
          );


          return res
            .status(200)
            .json({ ok: true });
        }


        await sendMessage(

          chat,

          `⚠️ УДАЛИТЬ ТРЕНЕРА?

${trainer.name}

Вместе с тренером будут удалены его направления и расписание.

Это действие нельзя отменить.`,

          [

            [
              {
                text:
                  "🗑 Да, удалить",
                callback_data:
                  `delete_trainer:${trainer.id}`
              }
            ],

            [
              {
                text:
                  "Отмена",
                callback_data:
                  `admin_trainer:${trainer.id}`
              }
            ]

          ]
        );


        return res
          .status(200)
          .json({ ok: true });
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
            WHERE id = ${trainerId}
            RETURNING name
          `;


        await clearState(chat);


        if (deleted.length) {

          await sendMessage(
            chat,
            `✅ Тренер «${deleted[0].name}» удалён.`
          );

        } else {

          await sendMessage(
            chat,
            "Тренер уже удалён или не найден."
          );
        }


        const keyboard =
          await trainerKeyboard(
            "admin_trainer"
          );


        await sendMessage(

          chat,

          "👤 ТРЕНЕРЫ",

          keyboard
        );


        return res
          .status(200)
          .json({ ok: true });
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
          .json({ ok: true });
      }


      // ======================================================
      // КОНКРЕТНОЕ ЗАНЯТИЕ
      // ======================================================

      if (
        data.startsWith(
          "lesson:"
        )
      ) {

        const lessonId =
          Number(
            data.split(":")[1]
          );


        await clearState(chat);


        await showLessonAdmin(
          chat,
          lessonId
        );


        return res
          .status(200)
          .json({ ok: true });
      }


      // ======================================================
      // ИЗМЕНИТЬ ДЕНЬ
      // ======================================================

      if (
        data.startsWith(
          "lesson_day:"
        )
      ) {

        const lessonId =
          Number(
            data.split(":")[1]
          );


        await setState(
          chat,
          "lesson_day",
          null,
          lessonId
        );


        await sendMessage(

          chat,

          `📆 Отправьте новый день:

ПН
ВТ
СР
ЧТ
ПТ
СБ
ВС`
        );


        return res
          .status(200)
          .json({ ok: true });
      }


      // ======================================================
      // ИЗМЕНИТЬ ВРЕМЯ
      // ======================================================

      if (
        data.startsWith(
          "lesson_time:"
        )
      ) {

        const lessonId =
          Number(
            data.split(":")[1]
          );


        await setState(
          chat,
          "lesson_time",
          null,
          lessonId
        );


        await sendMessage(
          chat,
          "🕐 Отправьте новое время, например 18:30:"
        );


        return res
          .status(200)
          .json({ ok: true });
      }


      // ======================================================
      // ИЗМЕНИТЬ НАПРАВЛЕНИЕ ЗАНЯТИЯ
      // ======================================================

      if (
        data.startsWith(
          "lesson_direction:"
        )
      ) {

        const lessonId =
          Number(
            data.split(":")[1]
          );


        await setState(
          chat,
          "lesson_direction",
          null,
          lessonId
        );


        await sendMessage(
          chat,
          "🏋️ Отправьте новое название направления:"
        );


        return res
          .status(200)
          .json({ ok: true });
      }


      // ======================================================
      // ИЗМЕНИТЬ ЗАЛ
      // ======================================================

      if (
        data.startsWith(
          "lesson_hall:"
        )
      ) {

        const lessonId =
          Number(
            data.split(":")[1]
          );


        await setState(
          chat,
          "lesson_hall",
          null,
          lessonId
        );


        await sendMessage(

          chat,

          `🚪 Отправьте новый зал:

1
2
3
5

или:
Тренажерный зал`
        );


        return res
          .status(200)
          .json({ ok: true });
      }


      // ======================================================
      // УДАЛЕНИЕ ЗАНЯТИЯ
      // ======================================================

      if (
        data.startsWith(
          "lesson_delete:"
        )
      ) {

        const lessonId =
          Number(
            data.split(":")[1]
          );


        const rows =
          await sql`
            DELETE FROM schedule
            WHERE id = ${lessonId}
            RETURNING trainer_id
          `;


        await clearState(chat);


        if (!rows.length) {

          await sendMessage(
            chat,
            "Занятие не найдено."
          );


          return res
            .status(200)
            .json({ ok: true });
        }


        await sendMessage(
          chat,
          "✅ Занятие удалено."
        );


        await showScheduleAdmin(
          chat,
          rows[0].trainer_id
        );


        return res
          .status(200)
          .json({ ok: true });
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

          `➕ НОВОЕ ЗАНЯТИЕ

Введите день:

ПН
ВТ
СР
ЧТ
ПТ
СБ
ВС`
        );


        return res
          .status(200)
          .json({ ok: true });
      }


      // ======================================================
      // НАПРАВЛЕНИЯ ТРЕНЕРА
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
          .json({ ok: true });
      }


      // ======================================================
      // КОНКРЕТНОЕ НАПРАВЛЕНИЕ
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
          .json({ ok: true });
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
          "✏️ Отправьте новое название направления:"
        );


        return res
          .status(200)
          .json({ ok: true });
      }


      // ======================================================
      // ИЗМЕНИТЬ ОПИСАНИЕ
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
          "📝 Отправьте новое описание направления:"
        );


        return res
          .status(200)
          .json({ ok: true });
      }


      // ======================================================
      // УДАЛЕНИЕ НАПРАВЛЕНИЯ
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
            DELETE FROM directions
            WHERE id = ${directionId}
            RETURNING trainer_id
          `;


        await clearState(chat);


        if (!rows.length) {

          await sendMessage(
            chat,
            "Направление не найдено."
          );


          return res
            .status(200)
            .json({ ok: true });
        }


        await sendMessage(
          chat,
          "✅ Направление удалено."
        );


        await showDirectionsAdmin(
          chat,
          rows[0].trainer_id
        );


        return res
          .status(200)
          .json({ ok: true });
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

          `➕ НОВОЕ НАПРАВЛЕНИЕ

Введите название:`
        );


        return res
          .status(200)
          .json({ ok: true });
      }


      // ======================================================
      // НЕИЗВЕСТНАЯ КНОПКА
      // ======================================================

      await sendMessage(

        chat,

        "Эта кнопка больше не актуальна. Откройте главное меню.",

        [
          [
            {
              text:
                "🏠 Главное меню",
              callback_data:
                "home"
            }
          ]
        ]
      );


      return res
        .status(200)
        .json({ ok: true });
    }


    // ========================================================
    // ОБЫЧНОЕ ТЕКСТОВОЕ СООБЩЕНИЕ
    // ========================================================

    if (update.message) {

      const message =
        update.message;


      const chat =
        message.chat?.id;


      if (!chat) {

        return res
          .status(200)
          .json({ ok: true });
      }


      const text =
        String(
          message.text || ""
        ).trim();


      // ======================================================
      // /start
      // ======================================================

      if (
        text === "/start" ||
        text.startsWith(
          "/start "
        )
      ) {

        await clearState(chat);


        await sendMessage(

          chat,

          `СПОРТИВНЫЙ КОМПЛЕКС «ТИТАН»

г. Сарапул · ул. Советская, 46

Выберите раздел:`,

          mainKeyboard()
        );


        return res
          .status(200)
          .json({ ok: true });
      }


      // ======================================================
      // /menu
      // ======================================================

      if (
        text === "/menu"
      ) {

        await clearState(chat);


        await sendMessage(

          chat,

          "Главное меню:",

          mainKeyboard()
        );


        return res
          .status(200)
          .json({ ok: true });
      }


      // ======================================================
      // /cancel
      // ======================================================

      if (
        text === "/cancel"
      ) {

        await clearState(chat);


        await sendMessage(

          chat,

          "Действие отменено.",

          mainKeyboard()
        );


        return res
          .status(200)
          .json({ ok: true });
      }


      // ======================================================
      // СОСТОЯНИЕ АДМИНКИ
      // ======================================================

      if (text) {

        const processed =
          await processStateMessage(
            chat,
            text
          );


        if (processed) {

          return res
            .status(200)
            .json({ ok: true });
        }
      }


      // ======================================================
      // ОБЫЧНОЕ СООБЩЕНИЕ
      // ======================================================

      await sendMessage(

        chat,

        `Выберите нужный раздел:`,

        mainKeyboard()
      );


      return res
        .status(200)
        .json({ ok: true });
    }


    // ========================================================
    // ДРУГИЕ TELEGRAM UPDATE
    // ========================================================

    return res
      .status(200)
      .json({ ok: true });


  } catch (error) {

    // Telegram желательно всегда получать HTTP 200,
    // иначе он будет повторно присылать один и тот же update.

    console.error(
      "TITAN webhook error:",
      error
    );


    return res
      .status(200)
      .json({
        ok: false,
        error:
          String(
            error?.message ||
            error
          )
      });
  }
};


// ============================================================
// КОНЕЦ БЛОКА 3 / 3
// ============================================================
