const { neon } = require("@neondatabase/serverless");

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TG = `https://api.telegram.org/bot${TOKEN}`;
const sql = neon(process.env.DATABASE_URL);

// ==========================================
// TELEGRAM
// ==========================================

async function api(method, body) {
  const response = await fetch(`${TG}/${method}`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();

    throw new Error(
      `Telegram API ${method}: ${response.status} ${text}`
    );
  }

  return response.json();
}

async function sendMessage(
  chat,
  text,
  keyboard = null
) {
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
// DATABASE
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

  if (
    Number(result[0].count) === 0
  ) {
    await seedDatabase();
  }
}

// ==========================================
// СТАРТОВЫЕ ДАННЫЕ
// ==========================================

async function seedDatabase() {
  const trainers = [
    {
      name: "Жижина Эльвира",
      phone: "+7 (904) 278-52-01",

      directions: [
        [
          "Хатха-йога",
          "Гибкость, укрепление тела, контроль дыхания и снятие напряжения."
        ],
        [
          "Йога в гамаках",
          "Практика в гамаках: мобильность, разгрузка позвоночника и контроль тела."
        ]
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
        [
          "Йога",
          "Практика для развития гибкости, мобильности, дыхания и внутреннего баланса."
        ]
      ],

      schedule: [
        ["СБ", "08:00", "Йога / аэройога", "5"]
      ]
    },

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
          "Здоровье суставов, подвижность и профилактика травм."
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

    {
      name: "Солодова Алена",
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

    {
      name: "Васильчевская Евгения",
      phone: "+7 (914) 936-82-32",

      directions: [
        [
          "Зумба",
          "Танцевальный фитнес: кардио, координация и высокий темп."
        ]
      ],

      schedule: [
        ["ПТ", "18:30", "Силовой тренинг", "3"]
      ]
    }
  ];

  for (
    let i = 0;
    i < trainers.length;
    i++
  ) {
    const trainer =
      trainers[i];

    const inserted =
      await sql`
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

    const trainerId =
      inserted[0].id;

    for (
      let d = 0;
      d < trainer.directions.length;
      d++
    ) {
      const direction =
        trainer.directions[d];

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
          ${d}
        )
      `;
    }

    for (
      let s = 0;
      s < trainer.schedule.length;
      s++
    ) {
      const lesson =
        trainer.schedule[s];

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
          ${s}
        )
      `;
    }
  }
}

// ==========================================
// ПОЛУЧЕНИЕ ДАННЫХ
// ==========================================

async function getTrainers() {
  return sql`
    SELECT *
    FROM trainers
    ORDER BY sort_order, id
  `;
}

async function getTrainer(id) {
  const rows =
    await sql`
      SELECT *
      FROM trainers
      WHERE id = ${id}
      LIMIT 1
    `;

  if (!rows.length) {
    return null;
  }

  const trainer =
    rows[0];

  const directions =
    await sql`
      SELECT *
      FROM directions
      WHERE trainer_id = ${id}
      ORDER BY sort_order, id
    `;

  const schedule =
    await sql`
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

async function getTrainersByIds(
  ids
) {
  const cleanIds =
    (ids || [])
      .map(Number)
      .filter(Number.isInteger);

  if (!cleanIds.length) {
    return [];
  }

  const trainers =
    await sql`
      SELECT *
      FROM trainers
      WHERE id = ANY(${cleanIds})
    `;

  const result = [];

  for (
    const id of cleanIds
  ) {
    const trainer =
      trainers.find(
        item =>
          Number(item.id) ===
          Number(id)
      );

    if (!trainer) {
      continue;
    }

    const directions =
      await sql`
        SELECT *
        FROM directions
        WHERE trainer_id = ${id}
        ORDER BY sort_order, id
      `;

    const schedule =
      await sql`
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

// ==========================================
// STATE
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
  const rows =
    await sql`
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
// КНОПКИ
// ==========================================

function mainKeyboard() {
  return [
    [
      {
        text:
          "🖼 Создать инфографику",
        callback_data:
          "create"
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
          "👤 Тренеры",
        callback_data:
          "trainers"
      }
    ],
    [
      {
        text:
          "✏️ Управление данными",
        callback_data:
          "admin"
      }
    ]
  ];
}

async function trainerKeyboard(
  prefix
) {
  const trainers =
    await getTrainers();

  const keyboard =
    trainers.map(
      trainer => [
        {
          text:
            trainer.name,
          callback_data:
            `${prefix}:${trainer.id}`
        }
      ]
    );

  keyboard.push([
    {
      text:
        "⬅️ Назад",
      callback_data:
        "home"
    }
  ]);

  return keyboard;
}

async function trainerSelectionKeyboard(
  prefix,
  selectedIds = []
) {
  const trainers =
    await getTrainers();

  return trainers.map(
    trainer => [
      {
        text:
          `${
            selectedIds.includes(
              Number(trainer.id)
            )
              ? "✅ "
              : ""
          }${trainer.name}`,

        callback_data:
          `${prefix}:${trainer.id}`
      }
    ]
  );
}

// ==========================================
// ADMIN
// ==========================================

async function showAdmin(chat) {
  await clearState(chat);

  await sendMessage(
    chat,
    "✏️ УПРАВЛЕНИЕ ДАННЫМИ\n\n" +
    "Выберите действие:",
    [
      [
        {
          text:
            "👤 Изменить тренера",
          callback_data:
            "admin_trainers"
        }
      ],
      [
        {
          text:
            "➕ Добавить тренера",
          callback_data:
            "add_trainer"
        }
      ],
      [
        {
          text:
            "🏠 В меню",
          callback_data:
            "home"
        }
      ]
    ]
  );
}

async function showTrainerAdmin(
  chat,
  trainerId
) {
  const trainer =
    await getTrainer(
      trainerId
    );

  if (!trainer) {
    return sendMessage(
      chat,
      "Тренер не найден."
    );
  }

  await sendMessage(
    chat,

    `👤 ${trainer.name}\n` +
    `📞 ${trainer.phone}\n\n` +
    "Что изменить?",

    [
      [
        {
          text:
            "📅 Расписание",
          callback_data:
            `admin_schedule:${trainerId}`
        }
      ],
      [
        {
          text:
            "✏️ Имя",
          callback_data:
            `edit_name:${trainerId}`
        }
      ],
      [
        {
          text:
            "📞 Телефон",
          callback_data:
            `edit_phone:${trainerId}`
        }
      ],
      [
        {
          text:
            "🏋️ Направления",
          callback_data:
            `admin_directions:${trainerId}`
        }
      ],
      [
        {
          text:
            "⬅️ К тренерам",
          callback_data:
            "admin_trainers"
        }
      ],
      [
        {
          text:
            "🏠 В меню",
          callback_data:
            "home"
        }
      ]
    ]
  );
}

async function showScheduleAdmin(
  chat,
  trainerId
) {
  const trainer =
    await getTrainer(
      trainerId
    );

  if (!trainer) {
    return sendMessage(
      chat,
      "Тренер не найден."
    );
  }

  const keyboard =
    trainer.schedule.map(
      lesson => [
        {
          text:
            `${lesson.day} ` +
            `${lesson.time} · ` +
            `${lesson.direction} · ` +
            (
              lesson.hall ===
              "GYM"
                ? "Тренажерный зал"
                : `Зал ${lesson.hall}`
            ),

          callback_data:
            `lesson:${lesson.id}`
        }
      ]
    );

  keyboard.push([
    {
      text:
        "➕ Добавить занятие",
      callback_data:
        `add_lesson:${trainerId}`
    }
  ]);

  keyboard.push([
    {
      text:
        "⬅️ Назад",
      callback_data:
        `admin_trainer:${trainerId}`
    }
  ]);

  keyboard.push([
    {
      text:
        "🏠 В меню",
      callback_data:
        "home"
    }
  ]);

  await sendMessage(
    chat,

    `📅 РАСПИСАНИЕ\n` +
    `${trainer.name}\n\n` +
    "Выберите занятие:",

    keyboard
  );
}

async function showLessonAdmin(
  chat,
  scheduleId
) {
  const rows =
    await sql`
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
    return sendMessage(
      chat,
      "Занятие не найдено."
    );
  }

  const lesson =
    rows[0];

  const hallText =
    lesson.hall === "GYM"
      ? "Тренажерный зал"
      : `Зал ${lesson.hall}`;

  await sendMessage(
    chat,

    `${lesson.trainer_name}\n\n` +
    `📅 ${lesson.day}\n` +
    `🕐 ${lesson.time}\n` +
    `🏋️ ${lesson.direction}\n` +
    `🚪 ${hallText}`,

    [
      [
        {
          text:
            "📅 Изменить день",
          callback_data:
            `lesson_day:${lesson.id}`
        }
      ],
      [
        {
          text:
            "🕐 Изменить время",
          callback_data:
            `lesson_time:${lesson.id}`
        }
      ],
      [
        {
          text:
            "🏋️ Изменить направление",
          callback_data:
            `lesson_direction:${lesson.id}`
        }
      ],
      [
        {
          text:
            "🚪 Изменить зал",
          callback_data:
            `lesson_hall:${lesson.id}`
        }
      ],
      [
        {
          text:
            "🗑 Удалить занятие",
          callback_data:
            `lesson_delete:${lesson.id}`
        }
      ],
      [
        {
          text:
            "⬅️ Назад",
          callback_data:
            `admin_schedule:${lesson.trainer_id}`
        }
      ]
    ]
  );
}

async function showDirectionsAdmin(
  chat,
  trainerId
) {
  const trainer =
    await getTrainer(
      trainerId
    );

  if (!trainer) {
    return sendMessage(
      chat,
      "Тренер не найден."
    );
  }

  const keyboard =
    trainer.directions.map(
      direction => [
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
      text:
        "➕ Добавить направление",
      callback_data:
        `add_direction:${trainerId}`
    }
  ]);

  keyboard.push([
    {
      text:
        "⬅️ Назад",
      callback_data:
        `admin_trainer:${trainerId}`
    }
  ]);

  keyboard.push([
    {
      text:
        "🏠 В меню",
      callback_data:
        "home"
    }
  ]);

  await sendMessage(
    chat,

    `🏋️ НАПРАВЛЕНИЯ\n` +
    `${trainer.name}\n\n` +
    "Выберите направление:",

    keyboard
  );
}

async function showDirectionAdmin(
  chat,
  directionId
) {
  const rows =
    await sql`
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
    return sendMessage(
      chat,
      "Направление не найдено."
    );
  }

  const direction =
    rows[0];

  await sendMessage(
    chat,

    `${direction.trainer_name}\n\n` +
    `🏋️ ${direction.name}\n\n` +
    `${
      direction.description ||
      "Описание не указано"
    }`,

    [
      [
        {
          text:
            "✏️ Изменить название",
          callback_data:
            `direction_name:${direction.id}`
        }
      ],
      [
        {
          text:
            "📝 Изменить описание",
          callback_data:
            `direction_desc:${direction.id}`
        }
      ],
      [
        {
          text:
            "🗑 Удалить направление",
          callback_data:
            `direction_delete:${direction.id}`
        }
      ],
      [
        {
          text:
            "⬅️ Назад",
          callback_data:
            `admin_directions:${direction.trainer_id}`
        }
      ]
    ]
  );
}

// ==========================================
// НОРМАЛИЗАЦИЯ ЗАЛА
// ==========================================

function normalizeHall(
  value = ""
) {
  let hall =
    String(value).trim();

  if (
    /тренаж/i.test(hall)
  ) {
    return "GYM";
  }

  hall =
    hall.replace(
      /[^\d]/g,
      ""
    );

  return [
    "1",
    "2",
    "3",
    "5"
  ].includes(hall)
    ? hall
    : "";
}

// ==========================================
// ОБРАБОТКА ТЕКСТОВОГО ВВОДА
// ==========================================

async function processStateMessage(
  chat,
  rawText
) {
  const state =
    await getState(chat);

  if (
    !state ||
    !state.action
  ) {
    return false;
  }

  const text =
    String(
      rawText || ""
    ).trim();

  if (!text) {
    return true;
  }

  // ========================================
  // ИЗМЕНИТЬ ИМЯ
  // ========================================

  if (
    state.action ===
    "edit_name"
  ) {
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

  // ========================================
  // ИЗМЕНИТЬ ТЕЛЕФОН
  // ========================================

  if (
    state.action ===
    "edit_phone"
  ) {
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

  // ========================================
  // ДОБАВИТЬ ТРЕНЕРА — ИМЯ
  // ========================================

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

  // ========================================
  // ДОБАВИТЬ ТРЕНЕРА — ТЕЛЕФОН
  // ========================================

  if (
    state.action ===
    "add_trainer_phone"
  ) {
    const info =
      state.data || {};

    const maxRows =
      await sql`
        SELECT
          COALESCE(
            MAX(sort_order),
            -1
          ) AS max
        FROM trainers
      `;

    const result =
      await sql`
        INSERT INTO trainers (
          name,
          phone,
          sort_order
        )
        VALUES (
          ${
            info.name ||
            "Без имени"
          },
          ${text},
          ${
            Number(
              maxRows[0].max
            ) + 1
          }
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
  // ИЗМЕНИТЬ ДЕНЬ
  // ========================================

  if (
    state.action ===
    "lesson_day"
  ) {
    const day =
      text.toUpperCase();

    if (
      ![
        "ПН",
        "ВТ",
        "СР",
        "ЧТ",
        "ПТ",
        "СБ",
        "ВС"
      ].includes(day)
    ) {
      await sendMessage(
        chat,
        "Введите: ПН, ВТ, СР, ЧТ, ПТ, СБ или ВС."
      );

      return true;
    }

    await sql`
      UPDATE schedule
      SET day = ${day}
      WHERE id = ${state.schedule_id}
    `;

    const lessonId =
      state.schedule_id;

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

  // ========================================
  // ИЗМЕНИТЬ ВРЕМЯ
  // ========================================

  if (
    state.action ===
    "lesson_time"
  ) {
    await sql`
      UPDATE schedule
      SET time = ${text}
      WHERE id = ${state.schedule_id}
    `;

    const lessonId =
      state.schedule_id;

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

  // ========================================
  // ИЗМЕНИТЬ НАПРАВЛЕНИЕ
  // ========================================

  if (
    state.action ===
    "lesson_direction"
  ) {
    await sql`
      UPDATE schedule
      SET direction = ${text}
      WHERE id = ${state.schedule_id}
    `;

    const lessonId =
      state.schedule_id;

    await clearState(chat);

    await sendMessage(
      chat,
      "✅ Направление изменено."
    );

    await showLessonAdmin(
      chat,
      lessonId
    );

    return true;
  }

  // ========================================
  // ИЗМЕНИТЬ ЗАЛ
  // ========================================

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

    const lessonId =
      state.schedule_id;

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

  // ========================================
  // ДОБАВИТЬ ЗАНЯТИЕ — ДЕНЬ
  // ========================================

  if (
    state.action ===
    "add_lesson_day"
  ) {
    const day =
      text.toUpperCase();

    if (
      ![
        "ПН",
        "ВТ",
        "СР",
        "ЧТ",
        "ПТ",
        "СБ",
        "ВС"
      ].includes(day)
    ) {
      await sendMessage(
        chat,
        "Введите: ПН, ВТ, СР, ЧТ, ПТ, СБ или ВС."
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
      "Введите время. Например: 18:00"
    );

    return true;
  }

  // ========================================
  // ДОБАВИТЬ ЗАНЯТИЕ — ВРЕМЯ
  // ========================================

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
        ...(state.data || {}),
        time: text
      }
    );

    await sendMessage(
      chat,
      "Введите направление:"
    );

    return true;
  }

  // ========================================
  // ДОБАВИТЬ ЗАНЯТИЕ — НАПРАВЛЕНИЕ
  // ========================================

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
        ...(state.data || {}),
        direction: text
      }
    );

    await sendMessage(
      chat,
      "Введите 1, 2, 3, 5 или «Тренажерный зал»."
    );

    return true;
  }

  // ========================================
  // ДОБАВИТЬ ЗАНЯТИЕ — ЗАЛ
  // ========================================

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

    const info =
      state.data || {};

    const maxRows =
      await sql`
        SELECT
          COALESCE(
            MAX(sort_order),
            -1
          ) AS max

        FROM schedule

        WHERE trainer_id =
          ${state.trainer_id}
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
        ${
          Number(
            maxRows[0].max
          ) + 1
        }
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

  // ========================================
  // ИЗМЕНИТЬ НАЗВАНИЕ НАПРАВЛЕНИЯ
  // ========================================

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

  // ========================================
  // ИЗМЕНИТЬ ОПИСАНИЕ НАПРАВЛЕНИЯ
  // ========================================

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

  // ========================================
  // НОВОЕ НАПРАВЛЕНИЕ — НАЗВАНИЕ
  // ========================================

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

  // ========================================
  // НОВОЕ НАПРАВЛЕНИЕ — ОПИСАНИЕ
  // ========================================

  if (
    state.action ===
    "add_direction_desc"
  ) {
    const info =
      state.data || {};

    const maxRows =
      await sql`
        SELECT
          COALESCE(
            MAX(sort_order),
            -1
          ) AS max

        FROM directions

        WHERE trainer_id =
          ${state.trainer_id}
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
        ${
          Number(
            maxRows[0].max
          ) + 1
        }
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
// ==========================================
// ГЕНЕРАТОР ИНФОГРАФИКИ «ТИТАН»
// ==========================================

function trainerPosterTheme(
  theme = "color"
) {
  const bw =
    theme === "bw";

  return {
    bg:
      bw
        ? "#ffffff"
        : "#0b0d10",

    card:
      bw
        ? "#f3f3f3"
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
        ? "#555555"
        : "#b8bec8",

    line:
      bw
        ? "#cecece"
        : "#30343b",

    accent:
      bw
        ? "#000000"
        : "#ff6a00",

    ghost:
      bw
        ? "#ededed"
        : "#171a20",

    onAccent:
      "#ffffff"
  };
}


// ==========================================
// СОРТИРОВКА
// ==========================================

function trainerPosterDayOrder(
  day
) {
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
      String(day || "")
        .trim()
        .toUpperCase()
    ] || 99
  );
}


function trainerPosterTimeOrder(
  time
) {
  const match =
    String(time || "")
      .match(
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


function trainerPosterSortSchedule(
  rows
) {
  return [...(rows || [])]
    .sort(
      (a, b) => {
        const dayDiff =
          trainerPosterDayOrder(
            a.day
          ) -
          trainerPosterDayOrder(
            b.day
          );

        if (dayDiff !== 0) {
          return dayDiff;
        }

        return (
          trainerPosterTimeOrder(
            a.time
          ) -
          trainerPosterTimeOrder(
            b.time
          )
        );
      }
    );
}


// ==========================================
// ПЕРЕНОС ТЕКСТА
// ==========================================

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

  for (
    const word of words
  ) {
    const next =
      current
        ? `${current} ${word}`
        : word;

    if (
      next.length >
        maxChars &&
      current
    ) {
      lines.push(
        current
      );

      current = word;
    } else {
      current = next;
    }
  }

  if (current) {
    lines.push(
      current
    );
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
      (line, index) => `
        <text
          x="${x}"
          y="${y + index * gap}"
          fill="${color}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${size}"
          font-weight="${weight}"
        >${esc(line)}</text>
      `
    )
    .join("");
}


// ==========================================
// ЗАЛ
// ==========================================

function trainerPosterHall(
  hall
) {
  const value =
    String(hall || "")
      .trim()
      .toUpperCase();

  if (
    value === "GYM"
  ) {
    return "ТРЕНАЖЕРНЫЙ";
  }

  if (!value) {
    return "";
  }

  return `ЗАЛ ${value}`;
}


// ==========================================
// ШАПКА
// ==========================================

function trainerPosterHeader(C) {
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
      y="72"
      fill="${C.accent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="50"
      font-weight="900"
    >ТИТАН</text>

    <text
      x="1184"
      y="69"
      text-anchor="end"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="18"
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
      y="155"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="47"
      font-weight="900"
    >ТРЕНЕРЫ «ТИТАН»</text>

    <text
      x="56"
      y="193"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="20"
      font-weight="900"
      letter-spacing="2"
    >АКТУАЛЬНОЕ РАСПИСАНИЕ</text>

    <text
      x="1184"
      y="183"
      text-anchor="end"
      fill="${C.ghost}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="84"
      font-weight="900"
    >ТИТАН</text>
  `;
}


// ==========================================
// ФУТЕР
// ==========================================

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
      y="1731"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="16"
      font-weight="800"
    >г. Сарапул · ул. Советская, 46</text>

    <text
      x="1184"
      y="1731"
      text-anchor="end"
      fill="${C.accent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="18"
      font-weight="900"
    >ТИТАН · САРАПУЛ</text>
  `;
}


// ==========================================
// ЛЕГЕНДА ЗАЛОВ
// ==========================================

function renderHallLegend(
  x,
  y,
  width,
  C,
  compact = false
) {
  const size =
    compact
      ? 12
      : 14;

  return `
    <text
      x="${x}"
      y="${y}"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${size + 2}"
      font-weight="900"
      letter-spacing="1.5"
    >ЗАЛЫ</text>

    <text
      x="${x + 64}"
      y="${y}"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${size}"
      font-weight="800"
    >1 — КРОССФИТ / БОКС · 2 — TRX / АНТИГРАВИТИ · 3 — СИЛОВОЙ · 5 — ЙОГА / АЭРОЙОГА · GYM — ТРЕНАЖЕРНЫЙ</text>
  `;
}


// ==========================================
// УМНОЕ РАСПИСАНИЕ
// ==========================================

function renderTrainerSchedule({
  rows = [],
  x,
  y,
  width,
  height,
  C,
  mode = "single"
}) {
  const original =
    trainerPosterSortSchedule(
      rows
    );


  if (!original.length) {
    return `
      <rect
        x="${x}"
        y="${y}"
        width="${width}"
        height="64"
        rx="10"
        fill="${C.card2}"
        stroke="${C.line}"
        stroke-width="1"
      />

      <text
        x="${x + 18}"
        y="${y + 40}"
        fill="${C.muted}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="18"
        font-weight="800"
      >Расписание пока не заполнено</text>
    `;
  }


  let preferredMinRowH;
  let maxRowH;
  let maxColumns;


  if (
    mode === "single"
  ) {
    preferredMinRowH = 34;
    maxRowH = 58;
    maxColumns = 2;
  } else if (
    mode === "double"
  ) {
    preferredMinRowH = 30;
    maxRowH = 42;
    maxColumns = 2;
  } else {
    preferredMinRowH = 24;
    maxRowH = 34;
    maxColumns = 2;
  }


  const headerH =
    mode === "triple"
      ? 28
      : 32;


  const columnGap =
    mode === "triple"
      ? 8
      : 12;


  // ========================================
  // ВЫБИРАЕМ ЧИСЛО КОЛОНОК
  // ========================================

  let columns = 1;


  const oneColumnRowH =
    Math.floor(
      (
        height -
        headerH -
        8
      ) /
      original.length
    );


  if (
    oneColumnRowH <
      preferredMinRowH
  ) {
    columns =
      Math.min(
        maxColumns,
        2
      );
  }


  let rowsPerColumn =
    Math.ceil(
      original.length /
      columns
    );


  let rowH =
    Math.floor(
      (
        height -
        headerH -
        8
      ) /
      rowsPerColumn
    );


  // ========================================
  // ЗАЩИТА ОТ ПЕРЕПОЛНЕНИЯ
  // ========================================

  let schedule =
    original;


  const absoluteMin =
    mode === "single"
      ? 27
      : mode === "double"
      ? 24
      : 20;


  const maxRowsPerColumn =
    Math.max(
      1,
      Math.floor(
        (
          height -
          headerH -
          8
        ) /
        absoluteMin
      )
    );


  const capacity =
    maxRowsPerColumn *
    columns;


  if (
    original.length >
    capacity
  ) {
    const omitted =
      original.length -
      (capacity - 1);


    schedule = [
      ...original.slice(
        0,
        capacity - 1
      ),

      {
        day: "",
        time: "",
        direction:
          `+ ЕЩЁ ${omitted} ЗАНЯТИЙ`,
        hall: ""
      }
    ];


    rowsPerColumn =
      Math.ceil(
        schedule.length /
        columns
      );


    rowH =
      Math.floor(
        (
          height -
          headerH -
          8
        ) /
        rowsPerColumn
      );
  }


  rowH =
    Math.max(
      absoluteMin,
      Math.min(
        maxRowH,
        rowH
      )
    );


  const columnWidth =
    (
      width -
      columnGap *
        (
          columns - 1
        )
    ) /
    columns;


  let svg = "";


  // ========================================
  // ШАПКА ТАБЛИЦЫ
  // ========================================

  for (
    let column = 0;
    column < columns;
    column++
  ) {
    const cx =
      x +
      column *
        (
          columnWidth +
          columnGap
        );


    const baseFont =
      mode === "single"
        ? 13
        : mode === "double"
        ? 12
        : 10;


    svg += `
      <rect
        x="${cx}"
        y="${y}"
        width="${columnWidth}"
        height="${headerH}"
        rx="8"
        fill="${C.accent}"
      />

      <text
        x="${cx + 10}"
        y="${y + headerH - 9}"
        fill="${C.onAccent}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${baseFont}"
        font-weight="900"
      >ДЕНЬ</text>

      <text
        x="${cx + 66}"
        y="${y + headerH - 9}"
        fill="${C.onAccent}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${baseFont}"
        font-weight="900"
      >ВРЕМЯ</text>

      <text
        x="${cx + 150}"
        y="${y + headerH - 9}"
        fill="${C.onAccent}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${baseFont}"
        font-weight="900"
      >НАПРАВЛЕНИЕ</text>

      <text
        x="${
          cx +
          columnWidth -
          10
        }"
        y="${y + headerH - 9}"
        text-anchor="end"
        fill="${C.onAccent}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${baseFont}"
        font-weight="900"
      >ЗАЛ</text>
    `;
  }


  // ========================================
  // СТРОКИ
  // ========================================

  schedule.forEach(
    (
      lesson,
      index
    ) => {
      const column =
        Math.floor(
          index /
          rowsPerColumn
        );


      const localIndex =
        index %
        rowsPerColumn;


      const rx =
        x +
        column *
          (
            columnWidth +
            columnGap
          );


      const ry =
        y +
        headerH +
        6 +
        localIndex *
          rowH;


      const summaryRow =
        String(
          lesson.direction || ""
        ).startsWith(
          "+ ЕЩЁ"
        );


      let fontSize;


      if (
        mode === "single"
      ) {
        fontSize =
          Math.max(
            14,
            Math.min(
              19,
              rowH * 0.44
            )
          );
      } else if (
        mode === "double"
      ) {
        fontSize =
          Math.max(
            13,
            Math.min(
              17,
              rowH * 0.46
            )
          );
      } else {
        fontSize =
          Math.max(
            10.5,
            Math.min(
              14,
              rowH * 0.47
            )
          );
      }


      const directionChars =
        columns === 1
          ? mode === "single"
            ? 43
            : 34
          : mode === "single"
          ? 20
          : mode === "double"
          ? 17
          : 13;


      const direction =
        trainerPosterWrap(
          lesson.direction || "",
          directionChars
        )[0] || "";


      svg += `
        <rect
          x="${rx}"
          y="${ry}"
          width="${columnWidth}"
          height="${Math.max(
            18,
            rowH - 4
          )}"
          rx="7"
          fill="${
            localIndex % 2 === 0
              ? C.card2
              : C.card
          }"
          stroke="${C.line}"
          stroke-width="1"
        />
      `;


      if (
        summaryRow
      ) {
        svg += `
          <text
            x="${rx + 12}"
            y="${
              ry +
              rowH / 2 +
              5
            }"
            fill="${C.accent}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="${fontSize}"
            font-weight="900"
          >${esc(
            lesson.direction
          )}</text>
        `;

        return;
      }


      svg += `
        <text
          x="${rx + 10}"
          y="${
            ry +
            rowH / 2 +
            5
          }"
          fill="${C.accent}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${fontSize}"
          font-weight="900"
        >${esc(
          lesson.day || ""
        )}</text>

        <text
          x="${rx + 66}"
          y="${
            ry +
            rowH / 2 +
            5
          }"
          fill="${C.text}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${fontSize}"
          font-weight="900"
        >${esc(
          lesson.time || ""
        )}</text>

        <text
          x="${rx + 150}"
          y="${
            ry +
            rowH / 2 +
            5
          }"
          fill="${C.text}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${Math.max(
            9,
            fontSize - 1
          )}"
          font-weight="800"
        >${esc(direction)}</text>

        <text
          x="${
            rx +
            columnWidth -
            10
          }"
          y="${
            ry +
            rowH / 2 +
            5
          }"
          text-anchor="end"
          fill="${C.accent}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${Math.max(
            9,
            fontSize - 1
          )}"
          font-weight="900"
        >${esc(
          trainerPosterHall(
            lesson.hall
          )
        )}</text>
      `;
    }
  );


  return svg;
}


// ==========================================
// КАРТОЧКИ НАПРАВЛЕНИЙ
// ==========================================

function renderDirectionCards({
  directions = [],
  x,
  y,
  width,
  C,
  mode = "single"
}) {
  const list =
    Array.isArray(
      directions
    )
      ? directions
      : [];


  if (!list.length) {
    return {
      svg: `
        <rect
          x="${x}"
          y="${y}"
          width="${width}"
          height="64"
          rx="10"
          fill="${C.card2}"
          stroke="${C.line}"
          stroke-width="1"
        />

        <text
          x="${x + 16}"
          y="${y + 39}"
          fill="${C.muted}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="17"
          font-weight="800"
        >Направления пока не заполнены</text>
      `,

      height: 64
    };
  }


  // ========================================
  // 1 ТРЕНЕР
  // ========================================

  if (
    mode === "single"
  ) {
    const visible =
      list.slice(
        0,
        6
      );


    const columns =
      visible.length === 1
        ? 1
        : 2;


    const gap =
      12;


    const cardW =
      (
        width -
        gap *
          (
            columns - 1
          )
      ) /
      columns;


    const cardH =
      94;


    const rows =
      Math.ceil(
        visible.length /
        columns
      );


    let svg = "";


    visible.forEach(
      (
        direction,
        index
      ) => {
        const col =
          index % columns;

        const row =
          Math.floor(
            index /
            columns
          );


        const dx =
          x +
          col *
            (
              cardW +
              gap
            );


        const dy =
          y +
          row *
            (
              cardH +
              gap
            );


        const description =
          trainerPosterWrap(
            direction.description ||
              "",
            columns === 1
              ? 80
              : 42
          ).slice(
            0,
            2
          );


        svg += `
          <rect
            x="${dx}"
            y="${dy}"
            width="${cardW}"
            height="${cardH}"
            rx="12"
            fill="${C.card2}"
            stroke="${C.line}"
            stroke-width="1"
          />

          <rect
            x="${dx}"
            y="${dy}"
            width="7"
            height="${cardH}"
            rx="4"
            fill="${C.accent}"
          />

          <text
            x="${dx + 18}"
            y="${dy + 31}"
            fill="${C.accent}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="22"
            font-weight="900"
          >${esc(
            String(
              direction.name || ""
            ).toUpperCase()
          )}</text>

          ${trainerPosterLines(
            description,
            dx + 18,
            dy + 57,
            14,
            C.text,
            700,
            18
          )}
        `;
      }
    );


    return {
      svg,
      height:
        rows * cardH +
        Math.max(
          0,
          rows - 1
        ) * gap
    };
  }


  // ========================================
  // 2 ТРЕНЕРА
  // ========================================

  if (
    mode === "double"
  ) {
    const visible =
      list.slice(
        0,
        6
      );


    const columns =
      visible.length === 1
        ? 1
        : 2;


    const gap =
      10;


    const cardW =
      (
        width -
        gap *
          (
            columns - 1
          )
      ) /
      columns;


    const cardH =
      86;


    const rows =
      Math.ceil(
        visible.length /
        columns
      );


    let svg = "";


    visible.forEach(
      (
        direction,
        index
      ) => {
        const col =
          index % columns;

        const row =
          Math.floor(
            index /
            columns
          );


        const dx =
          x +
          col *
            (
              cardW +
              gap
            );


        const dy =
          y +
          row *
            (
              cardH +
              gap
            );


        const titleLines =
          trainerPosterWrap(
            String(
              direction.name || ""
            ).toUpperCase(),
            27
          ).slice(
            0,
            2
          );


        const description =
          trainerPosterWrap(
            direction.description ||
              "",
            42
          ).slice(
            0,
            2
          );


        svg += `
          <rect
            x="${dx}"
            y="${dy}"
            width="${cardW}"
            height="${cardH}"
            rx="11"
            fill="${C.card2}"
            stroke="${C.line}"
            stroke-width="1"
          />

          <rect
            x="${dx}"
            y="${dy}"
            width="7"
            height="${cardH}"
            rx="4"
            fill="${C.accent}"
          />

          ${trainerPosterLines(
            titleLines,
            dx + 18,
            dy + 27,
            18,
            C.accent,
            900,
            20
          )}

          ${trainerPosterLines(
            description,
            dx + 18,
            dy +
              (
                titleLines.length > 1
                  ? 66
                  : 52
              ),
            13,
            C.text,
            700,
            15
          )}
        `;
      }
    );


    return {
      svg,
      height:
        rows * cardH +
        Math.max(
          0,
          rows - 1
        ) * gap
    };
  }


  // ========================================
  // 3 ТРЕНЕРА
  // ========================================

  const visible =
    list.slice(
      0,
      4
    );


  const columns =
    visible.length <= 2
      ? visible.length
      : 2;


  const gap =
    8;


  const cardW =
    (
      width -
      gap *
        (
          columns - 1
        )
    ) /
    columns;


  const cardH =
    58;


  const rows =
    Math.ceil(
      visible.length /
      columns
    );


  let svg = "";


  visible.forEach(
    (
      direction,
      index
    ) => {
      const col =
        index %
        columns;

      const row =
        Math.floor(
          index /
          columns
        );


      const dx =
        x +
        col *
          (
            cardW +
            gap
          );


      const dy =
        y +
        row *
          (
            cardH +
            gap
          );


      const title =
        trainerPosterWrap(
          String(
            direction.name || ""
          ).toUpperCase(),
          25
        )[0] || "";


      const description =
        trainerPosterWrap(
          direction.description ||
            "",
          38
        )[0] || "";


      svg += `
        <rect
          x="${dx}"
          y="${dy}"
          width="${cardW}"
          height="${cardH}"
          rx="9"
          fill="${C.card2}"
          stroke="${C.line}"
          stroke-width="1"
        />

        <rect
          x="${dx}"
          y="${dy}"
          width="6"
          height="${cardH}"
          rx="3"
          fill="${C.accent}"
        />

        <text
          x="${dx + 15}"
          y="${dy + 24}"
          fill="${C.accent}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="14"
          font-weight="900"
        >${esc(title)}</text>

        <text
          x="${dx + 15}"
          y="${dy + 44}"
          fill="${C.text}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="10.5"
          font-weight="700"
        >${esc(description)}</text>
      `;
    }
  );


  return {
    svg,
    height:
      rows * cardH +
      Math.max(
        0,
        rows - 1
      ) * gap
  };
}


// ==========================================
// ОДИН ТРЕНЕР
// ==========================================

function makePoster(
  trainer,
  theme = "color"
) {
  const C =
    trainerPosterTheme(
      theme
    );


  const W = 1240;
  const H = 1754;

  const x = 56;
  const y = 225;

  const cardW =
    1128;

  const cardH =
    1435;


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


  const directionsBlock =
    renderDirectionCards({
      directions,
      x:
        x + 28,
      y:
        y + 160,
      width:
        cardW - 56,
      C,
      mode:
        "single"
    });


  const scheduleTitleY =
    y +
    160 +
    directionsBlock.height +
    38;


  const hallsY =
    y +
    cardH -
    78;


  const scheduleY =
    scheduleTitleY +
    18;


  const scheduleHeight =
    hallsY -
    scheduleY -
    35;


  return `
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
        y="${y + 61}"
        fill="${C.accent}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="24"
        font-weight="900"
      >01</text>

      <text
        x="${x + 82}"
        y="${y + 64}"
        fill="${C.text}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="50"
        font-weight="900"
      >${esc(
        String(
          trainer.name || ""
        ).toUpperCase()
      )}</text>

      <text
        x="${
          x +
          cardW -
          28
        }"
        y="${y + 62}"
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
        y1="${y + 91}"
        x2="${
          x +
          cardW -
          28
        }"
        y2="${y + 91}"
        stroke="${C.line}"
        stroke-width="2"
      />

      <text
        x="${x + 28}"
        y="${y + 136}"
        fill="${C.muted}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="20"
        font-weight="900"
        letter-spacing="2"
      >НАПРАВЛЕНИЯ</text>

      ${directionsBlock.svg}

      <text
        x="${x + 28}"
        y="${scheduleTitleY}"
        fill="${C.muted}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="20"
        font-weight="900"
        letter-spacing="2"
      >РАСПИСАНИЕ</text>

      ${renderTrainerSchedule({
        rows:
          schedule,

        x:
          x + 28,

        y:
          scheduleY,

        width:
          cardW - 56,

        height:
          scheduleHeight,

        C,

        mode:
          "single"
      })}

      ${renderHallLegend(
        x + 28,
        hallsY,
        cardW - 56,
        C,
        false
      )}

      ${trainerPosterFooter(C)}

    </svg>
  `;
}


// ==========================================
// 2 ИЛИ 3 ТРЕНЕРА
// ==========================================

function makeMultiTrainerPoster(
  trainers,
  theme = "color"
) {
  const list =
    Array.isArray(
      trainers
    )
      ? trainers.slice(
          0,
          3
        )
      : [];


  if (!list.length) {
    throw new Error(
      "Нет выбранных тренеров"
    );
  }


  if (
    list.length === 1
  ) {
    return makePoster(
      list[0],
      theme
    );
  }


  const C =
    trainerPosterTheme(
      theme
    );


  const W = 1240;
  const H = 1754;

  const PAD = 56;

  const count =
    list.length;


  const top =
    225;


  const bottom =
    1655;


  const gap =
    count === 2
      ? 24
      : 16;


  const cardH =
    (
      bottom -
      top -
      gap *
        (
          count - 1
        )
    ) /
    count;


  const cardW =
    W -
    PAD * 2;


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
    (
      trainer,
      trainerIndex
    ) => {
      const cardY =
        top +
        trainerIndex *
          (
            cardH +
            gap
          );


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


      // ====================================
      // РАЗМЕРЫ ДЛЯ 2 ТРЕНЕРОВ
      // ====================================

      const nameSize =
        count === 2
          ? 42
          : 30;


      const phoneSize =
        count === 2
          ? 22
          : 17;


      const sectionSize =
        count === 2
          ? 18
          : 14;


      const headerLineY =
        cardY +
        (
          count === 2
            ? 78
            : 65
        );


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
          width="10"
          height="${cardH}"
          rx="5"
          fill="${C.accent}"
        />

        <text
          x="${innerX}"
          y="${
            cardY +
            (
              count === 2
                ? 50
                : 42
            )
          }"
          fill="${C.accent}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${
            count === 2
              ? 20
              : 15
          }"
          font-weight="900"
        >${String(
          trainerIndex + 1
        ).padStart(
          2,
          "0"
        )}</text>

        <text
          x="${innerX + 52}"
          y="${
            cardY +
            (
              count === 2
                ? 52
                : 44
            )
          }"
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
          x="${
            PAD +
            cardW -
            26
          }"
          y="${
            cardY +
            (
              count === 2
                ? 50
                : 43
            )
          }"
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
          y1="${headerLineY}"
          x2="${
            PAD +
            cardW -
            26
          }"
          y2="${headerLineY}"
          stroke="${C.line}"
          stroke-width="1.5"
        />
      `;


      const directionTitleY =
        headerLineY +
        (
          count === 2
            ? 38
            : 30
        );


      svg += `
        <text
          x="${innerX}"
          y="${directionTitleY}"
          fill="${C.muted}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${sectionSize}"
          font-weight="900"
          letter-spacing="2"
        >НАПРАВЛЕНИЯ</text>
      `;


      const directionBlock =
        renderDirectionCards({
          directions,

          x:
            innerX,

          y:
            directionTitleY +
            16,

          width:
            innerW,

          C,

          mode:
            count === 2
              ? "double"
              : "triple"
        });


      svg +=
        directionBlock.svg;


      const scheduleTitleY =
        directionTitleY +
        16 +
        directionBlock.height +
        (
          count === 2
            ? 32
            : 22
        );


      const hallY =
        cardY +
        cardH -
        (
          count === 2
            ? 42
            : 34
        );


      const scheduleY =
        scheduleTitleY +
        15;


      const scheduleHeight =
        hallY -
        scheduleY -
        (
          count === 2
            ? 24
            : 18
        );


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

        ${renderTrainerSchedule({
          rows:
            schedule,

          x:
            innerX,

          y:
            scheduleY,

          width:
            innerW,

          height:
            scheduleHeight,

          C,

          mode:
            count === 2
              ? "double"
              : "triple"
        })}

        ${renderHallLegend(
          innerX,
          hallY,
          innerW,
          C,
          count === 3
        )}
      `;
    }
  );


  svg += `
      ${trainerPosterFooter(C)}

    </svg>
  `;


  return svg;
}


// ==========================================
// ОБЩЕЕ РАСПИСАНИЕ
// ==========================================

function makeWeekPoster(
  rows,
  theme = "color"
) {
  const C =
    trainerPosterTheme(
      theme
    );


  const W =
    1240;


  const H =
    1754;


  const PAD =
    56;


  const schedule =
    trainerPosterSortSchedule(
      Array.isArray(rows)
        ? rows
        : []
    );


  const grouped = {};


  for (
    const lesson of schedule
  ) {
    const day =
      String(
        lesson.day || ""
      )
        .trim()
        .toUpperCase();


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
        (
          a,
          b
        ) =>
          trainerPosterDayOrder(a) -
          trainerPosterDayOrder(b)
      );


  // ========================================
  // РАСПРЕДЕЛЯЕМ ДНИ ПО ДВУМ КОЛОНКАМ
  // ========================================

  const leftDays = [];
  const rightDays = [];

  let leftWeight = 0;
  let rightWeight = 0;


  for (
    const day of days
  ) {
    const weight =
      grouped[day].length +
      1.6;


    if (
      leftWeight <=
      rightWeight
    ) {
      leftDays.push(day);
      leftWeight += weight;
    } else {
      rightDays.push(day);
      rightWeight += weight;
    }
  }


  const top =
    230;


  const bottom =
    1600;


  const columnGap =
    22;


  const columnWidth =
    (
      W -
      PAD * 2 -
      columnGap
    ) / 2;


  function renderWeekColumn(
    dayList,
    x
  ) {
    const lessonCount =
      dayList.reduce(
        (
          sum,
          day
        ) =>
          sum +
          grouped[day].length,
        0
      );


    const headersHeight =
      dayList.length * 44;


    const gapsHeight =
      Math.max(
        0,
        dayList.length - 1
      ) * 10;


    const availableHeight =
      bottom - top;


    let rowH =
      lessonCount
        ? Math.floor(
            (
              availableHeight -
              headersHeight -
              gapsHeight
            ) /
            lessonCount
          )
        : 40;


    rowH =
      Math.max(
        24,
        Math.min(
          44,
          rowH
        )
      );


    let currentY =
      top;


    let svg = "";


    for (
      const day of dayList
    ) {
      const lessons =
        grouped[day];


      svg += `
        <rect
          x="${x}"
          y="${currentY}"
          width="${columnWidth}"
          height="36"
          rx="9"
          fill="${C.accent}"
        />

        <text
          x="${x + 14}"
          y="${currentY + 25}"
          fill="${C.onAccent}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="18"
          font-weight="900"
        >${esc(day)}</text>

        <text
          x="${
            x +
            columnWidth -
            14
          }"
          y="${currentY + 25}"
          text-anchor="end"
          fill="${C.onAccent}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="11"
          font-weight="900"
        >${lessons.length} ЗАН.</text>
      `;


      currentY +=
        42;


      lessons.forEach(
        (
          lesson,
          index
        ) => {
          const fontSize =
            rowH <= 26
              ? 10
              : rowH <= 32
              ? 11.5
              : 13;


          const direction =
            trainerPosterWrap(
              lesson.direction || "",
              18
            )[0] || "";


          const trainer =
            trainerPosterWrap(
              lesson.trainer_name ||
                "",
              14
            )[0] || "";


          svg += `
            <rect
              x="${x}"
              y="${currentY}"
              width="${columnWidth}"
              height="${
                rowH - 4
              }"
              rx="7"
              fill="${
                index % 2 === 0
                  ? C.card
                  : C.card2
              }"
              stroke="${C.line}"
              stroke-width="1"
            />

            <text
              x="${x + 10}"
              y="${
                currentY +
                rowH / 2 +
                4
              }"
              fill="${C.accent}"
              font-family="Arial, Helvetica, sans-serif"
              font-size="${
                fontSize + 1
              }"
              font-weight="900"
            >${esc(
              lesson.time || ""
            )}</text>

            <text
              x="${x + 80}"
              y="${
                currentY +
                rowH / 2 +
                4
              }"
              fill="${C.text}"
              font-family="Arial, Helvetica, sans-serif"
              font-size="${fontSize}"
              font-weight="800"
            >${esc(direction)}</text>

            <text
              x="${x + 275}"
              y="${
                currentY +
                rowH / 2 +
                4
              }"
              fill="${C.muted}"
              font-family="Arial, Helvetica, sans-serif"
              font-size="${Math.max(
                8,
                fontSize - 1
              )}"
              font-weight="700"
            >${esc(trainer)}</text>

            <text
              x="${
                x +
                columnWidth -
                10
              }"
              y="${
                currentY +
                rowH / 2 +
                4
              }"
              text-anchor="end"
              fill="${C.accent}"
              font-family="Arial, Helvetica, sans-serif"
              font-size="${fontSize}"
              font-weight="900"
            >${esc(
              trainerPosterHall(
                lesson.hall
              )
            )}</text>
          `;


          currentY +=
            rowH;
        }
      );


      currentY += 10;
    }


    return svg;
  }


  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="210mm"
      height="297mm"
      viewBox="0 0 ${W} ${H}"
      preserveAspectRatio="xMidYMid meet"
    >

      <rect
        x="0"
        y="0"
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
        x="56"
        y="72"
        fill="${C.accent}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="50"
        font-weight="900"
      >ТИТАН</text>

      <text
        x="1184"
        y="69"
        text-anchor="end"
        fill="${C.muted}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="18"
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
        y="155"
        fill="${C.text}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="47"
        font-weight="900"
      >ОБЩЕЕ РАСПИСАНИЕ</text>

      <text
        x="56"
        y="193"
        fill="${C.muted}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="20"
        font-weight="900"
        letter-spacing="2"
      >ГРУППОВЫЕ ТРЕНИРОВКИ</text>

      ${renderWeekColumn(
        leftDays,
        PAD
      )}

      ${renderWeekColumn(
        rightDays,
        PAD +
        columnWidth +
        columnGap
      )}

      <text
        x="${PAD}"
        y="1647"
        fill="${C.muted}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="12"
        font-weight="800"
      >1 — КРОССФИТ / БОКС · 2 — TRX / АНТИГРАВИТИ · 3 — СИЛОВОЙ · 5 — ЙОГА / АЭРОЙОГА · GYM — ТРЕНАЖЕРНЫЙ ЗАЛ</text>

      ${trainerPosterFooter(C)}

    </svg>
  `;
}


// ==========================================
// ОТПРАВКА ТРЕНЕРОВ
// ==========================================

async function sendMultiTrainerPoster(
  chat,
  trainerIds,
  theme = "color"
) {
  const trainers =
    await getTrainersByIds(
      trainerIds
    );


  if (!trainers.length) {
    throw new Error(
      "Не найдены выбранные тренеры"
    );
  }


  if (
    trainers.length !==
    trainerIds.length
  ) {
    throw new Error(
      "Не удалось загрузить всех выбранных тренеров"
    );
  }


  const svg =
    makeMultiTrainerPoster(
      trainers,
      theme
    );


  const safeNames =
    trainers
      .map(
        trainer =>
          trainer.name
      )
      .join("_")
      .replace(
        /[^\p{L}\p{N}_-]+/gu,
        "_"
      );


  const filename =
    `TITAN_${safeNames}_${theme}.svg`;


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
          "image/svg+xml"
      }
    ),
    filename
  );


  form.append(
    "caption",
    "🖼 ТИТАН — инфографика тренеров"
  );


  const response =
    await fetch(
      `${TG}/sendDocument`,
      {
        method:
          "POST",

        body:
          form
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


  const filename =
    `TITAN_WEEK_${theme}.svg`;


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
          "image/svg+xml"
      }
    ),
    filename
  );


  form.append(
    "caption",
    "📅 ТИТАН — общее расписание"
  );


  const response =
    await fetch(
      `${TG}/sendDocument`,
      {
        method:
          "POST",

        body:
          form
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
// ГЛАВНЫЙ WEBHOOK
// ==========================================

module.exports = async function webhook(
  req,
  res
) {
  try {

    // ======================================
    // GET / ПРОВЕРКА СЕРВИСА
    // ======================================

    if (
      req.method !== "POST"
    ) {
      return res
        .status(200)
        .json({
          ok: true,
          service:
            "TITAN Bot"
        });
    }


    // ======================================
    // БАЗА ДАННЫХ
    // ======================================

    await initDatabase();


    // ======================================
    // TELEGRAM UPDATE
    // ======================================

    const update =
      req.body || {};


    const message =
      update.message ||
      null;


    const query =
      update.callback_query ||
      null;


    const chat =
      message?.chat?.id ||
      query?.message?.chat?.id;


    if (!chat) {
      return res
        .status(200)
        .json({
          ok: true
        });
    }


    // ======================================
    // CALLBACK ACK
    // ======================================

    if (
      query?.id
    ) {
      await api(
        "answerCallbackQuery",
        {
          callback_query_id:
            query.id
        }
      ).catch(
        () => {}
      );
    }


    // ======================================
    // ТЕКСТОВЫЕ СООБЩЕНИЯ
    // ======================================

    if (
      message?.text
    ) {
      const text =
        String(
          message.text
        ).trim();


      // ====================================
      // /START
      // ====================================

      if (
        text === "/start"
      ) {
        await clearState(
          chat
        );


        await sendMessage(
          chat,

          "🏋️ СПОРТИВНЫЙ КОМПЛЕКС «ТИТАН»\n\n" +
          "Выберите действие:",

          mainKeyboard()
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ====================================
      // СОСТОЯНИЯ РЕДАКТИРОВАНИЯ
      // ====================================

      const handled =
        await processStateMessage(
          chat,
          text
        );


      if (handled) {
        return res
          .status(200)
          .json({
            ok: true
          });
      }


      // ====================================
      // ЛЮБОЙ ДРУГОЙ ТЕКСТ
      // ====================================

      await sendMessage(
        chat,

        "Выберите действие:",

        mainKeyboard()
      );


      return res
        .status(200)
        .json({
          ok: true
        });
    }


    // ======================================
    // ЕСЛИ CALLBACK НЕТ
    // ======================================

    if (!query) {
      return res
        .status(200)
        .json({
          ok: true
        });
    }


    const data =
      String(
        query.data || ""
      );


    // ======================================
    // ГЛАВНОЕ МЕНЮ
    // ======================================

    if (
      data === "home"
    ) {
      await clearState(
        chat
      );


      await sendMessage(
        chat,

        "🏠 ГЛАВНОЕ МЕНЮ",

        mainKeyboard()
      );


      return res
        .status(200)
        .json({
          ok: true
        });
    }


    // ======================================
    // СОЗДАТЬ ИНФОГРАФИКУ
    // ======================================

    if (
      data === "create"
    ) {
      await clearState(
        chat
      );


      await sendMessage(
        chat,

        "🖼 СОЗДАТЬ ИНФОГРАФИКУ\n\n" +
        "Что создаём?",

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
                "🏠 В меню",

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


    // ======================================
    // ВЫБОР 1 / 2 / 3 ТРЕНЕРА
    // ======================================

    if (
      data ===
      "trainer_poster_menu"
    ) {
      await clearState(
        chat
      );


      await sendMessage(
        chat,

        "👤 Сколько тренеров разместить на одном листе A4?",

        [
          [
            {
              text:
                "1 тренер",

              callback_data:
                "poster_count:1"
            }
          ],

          [
            {
              text:
                "2 тренера",

              callback_data:
                "poster_count:2"
            }
          ],

          [
            {
              text:
                "3 тренера",

              callback_data:
                "poster_count:3"
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
        .json({
          ok: true
        });
    }


    // ======================================
    // СОХРАНЯЕМ КОЛИЧЕСТВО
    // ======================================

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
        ![
          1,
          2,
          3
        ].includes(
          count
        )
      ) {
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
          text:
            "⬅️ Назад",

          callback_data:
            "trainer_poster_menu"
        }
      ]);


      await sendMessage(
        chat,

        count === 1
          ? "Выберите одного тренера:"
          : `Выберите ${count} тренеров:`,

        keyboard
      );


      return res
        .status(200)
        .json({
          ok: true
        });
    }


    // ======================================
    // ВЫБОР КОНКРЕТНОГО ТРЕНЕРА
    // ======================================

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
        await getState(
          chat
        );


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


      const info =
        state.data || {};


      const count =
        Number(
          info.count || 1
        );


      let selectedIds =
        Array.isArray(
          info.selectedIds
        )
          ? info.selectedIds
              .map(Number)
              .filter(
                Number.isInteger
              )
          : [];


      // ====================================
      // ПОВТОРНОЕ НАЖАТИЕ — СНЯТЬ ВЫБОР
      // ====================================

      if (
        selectedIds.includes(
          trainerId
        )
      ) {
        selectedIds =
          selectedIds.filter(
            id =>
              id !==
              trainerId
          );
      }

      else if (
        selectedIds.length <
        count
      ) {
        selectedIds.push(
          trainerId
        );
      }


      await setState(
        chat,
        "poster_select",
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
        selectedIds.length ===
        count
      ) {
        keyboard.push([
          {
            text:
              "➡️ Продолжить",

            callback_data:
              "poster_theme"
          }
        ]);
      }


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

        `Выбрано: ${selectedIds.length}/${count}`,

        keyboard
      );


      return res
        .status(200)
        .json({
          ok: true
        });
    }


    // ======================================
    // ВЫБОР ЦВЕТ / ЧБ
    // ======================================

    if (
      data ===
      "poster_theme"
    ) {
      const state =
        await getState(
          chat
        );


      if (
        !state ||
        state.action !==
          "poster_select"
      ) {
        await sendMessage(
          chat,

          "Выбор устарел.",

          mainKeyboard()
        );


        return res
          .status(200)
          .json({
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
          : [];


      if (
        selectedIds.length !==
        Number(
          info.count
        )
      ) {
        await sendMessage(
          chat,

          "Сначала выберите нужное количество тренеров."
        );


        return res
          .status(200)
          .json({
            ok: true
          });
      }


      await sendMessage(
        chat,

        "🎨 Выберите оформление:",

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
                "🏠 В меню",

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


    // ======================================
    // ГЕНЕРАЦИЯ ТРЕНЕРОВ
    // ======================================

    if (
      data.startsWith(
        "poster_generate:"
      )
    ) {
      const requestedTheme =
        data.split(":")[1];


      const theme =
        requestedTheme === "bw"
          ? "bw"
          : "color";


      const state =
        await getState(
          chat
        );


      if (
        !state ||
        state.action !==
          "poster_select"
      ) {
        await sendMessage(
          chat,

          "Выбор устарел.",

          mainKeyboard()
        );


        return res
          .status(200)
          .json({
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
              .filter(
                Number.isInteger
              )
          : [];


      if (
        selectedIds.length !==
        Number(
          info.count
        )
      ) {
        await sendMessage(
          chat,

          "Тренеры выбраны неправильно. Попробуйте ещё раз.",

          [
            [
              {
                text:
                  "👤 Выбрать заново",

                callback_data:
                  "trainer_poster_menu"
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


      await sendMessage(
        chat,

        "⏳ Готовлю инфографику…"
      );


      await sendMultiTrainerPoster(
        chat,
        selectedIds,
        theme
      );


      await clearState(
        chat
      );


      await sendMessage(
        chat,

        "✅ Инфографика готова.",

        [
          [
            {
              text:
                "🖼 Создать ещё",

              callback_data:
                "trainer_poster_menu"
            }
          ],

          [
            {
              text:
                "🏠 В меню",

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


    // ======================================
    // ПУБЛИЧНЫЙ СПИСОК ТРЕНЕРОВ
    // ======================================

    if (
      data ===
      "trainers"
    ) {
      const trainers =
        await getTrainers();


      const trainerText =
        trainers.length
          ? trainers
              .map(
                trainer =>
                  `👤 ${trainer.name}\n` +
                  `📞 ${
                    trainer.phone ||
                    "—"
                  }`
              )
              .join(
                "\n\n"
              )
          : "Тренеры пока не добавлены.";


      await sendMessage(
        chat,

        "👤 ТРЕНЕРЫ «ТИТАН»\n\n" +
        trainerText,

        [
          [
            {
              text:
                "🏠 В меню",

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


    // ======================================
    // ADMIN
    // ======================================

    if (
      data === "admin"
    ) {
      await showAdmin(
        chat
      );


      return res
        .status(200)
        .json({
          ok: true
        });
    }


    // ======================================
    // СПИСОК ТРЕНЕРОВ В ADMIN
    // ======================================

    if (
      data ===
      "admin_trainers"
    ) {
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


    // ======================================
    // КАРТОЧКА ТРЕНЕРА
    // ======================================

    if (
      data.startsWith(
        "admin_trainer:"
      )
    ) {
      const trainerId =
        Number(
          data.split(":")[1]
        );


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


    // ======================================
    // ИЗМЕНИТЬ ИМЯ
    // ======================================

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


    // ======================================
    // ИЗМЕНИТЬ ТЕЛЕФОН
    // ======================================

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

        "Введите новый телефон:"
      );


      return res
        .status(200)
        .json({
          ok: true
        });
    }


    // ======================================
    // ДОБАВИТЬ ТРЕНЕРА
    // ======================================

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

        "Введите имя нового тренера:"
      );


      return res
        .status(200)
        .json({
          ok: true
        });
    }


    // ======================================
    // РАСПИСАНИЕ ТРЕНЕРА
    // ======================================

    if (
      data.startsWith(
        "admin_schedule:"
      )
    ) {
      const trainerId =
        Number(
          data.split(":")[1]
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


    // ======================================
    // КОНКРЕТНОЕ ЗАНЯТИЕ
    // ======================================

    if (
      data.startsWith(
        "lesson:"
      )
    ) {
      const lessonId =
        Number(
          data.split(":")[1]
        );


      await showLessonAdmin(
        chat,
        lessonId
      );


      return res
        .status(200)
        .json({
          ok: true
        });
    }


    // ======================================
    // ДЕНЬ
    // ======================================

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

        "Введите новый день:\n\n" +
        "ПН, ВТ, СР, ЧТ, ПТ, СБ или ВС"
      );


      return res
        .status(200)
        .json({
          ok: true
        });
    }


    // ======================================
    // ВРЕМЯ
    // ======================================

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

        "Введите новое время.\n\n" +
        "Например: 18:00"
      );


      return res
        .status(200)
        .json({
          ok: true
        });
    }


    // ======================================
    // НАПРАВЛЕНИЕ ЗАНЯТИЯ
    // ======================================

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

        "Введите новое направление:"
      );


      return res
        .status(200)
        .json({
          ok: true
        });
    }


    // ======================================
    // ЗАЛ
    // ======================================

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

        "Введите зал:\n\n" +
        "1 — Кроссфит / бокс\n" +
        "2 — TRX / антигравити\n" +
        "3 — Силовой тренинг\n" +
        "5 — Йога / аэройога\n" +
        "или «Тренажерный зал»"
      );


      return res
        .status(200)
        .json({
          ok: true
        });
    }


    // ======================================
    // УДАЛИТЬ ЗАНЯТИЕ
    // ======================================

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

          WHERE id =
            ${lessonId}

          RETURNING
            trainer_id
        `;


      if (
        rows.length
      ) {
        await sendMessage(
          chat,

          "✅ Занятие удалено."
        );


        await showScheduleAdmin(
          chat,
          rows[0].trainer_id
        );
      }


      return res
        .status(200)
        .json({
          ok: true
        });
    }


    // ======================================
    // ДОБАВИТЬ ЗАНЯТИЕ
    // ======================================

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

        "Введите день занятия:\n\n" +
        "ПН, ВТ, СР, ЧТ, ПТ, СБ или ВС"
      );


      return res
        .status(200)
        .json({
          ok: true
        });
    }


    // ======================================
    // НАПРАВЛЕНИЯ ТРЕНЕРА
    // ======================================

    if (
      data.startsWith(
        "admin_directions:"
      )
    ) {
      const trainerId =
        Number(
          data.split(":")[1]
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


    // ======================================
    // КОНКРЕТНОЕ НАПРАВЛЕНИЕ
    // ======================================

    if (
      data.startsWith(
        "direction:"
      )
    ) {
      const directionId =
        Number(
          data.split(":")[1]
        );


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


    // ======================================
    // ИЗМЕНИТЬ НАЗВАНИЕ НАПРАВЛЕНИЯ
    // ======================================

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


    // ======================================
    // ИЗМЕНИТЬ ОПИСАНИЕ НАПРАВЛЕНИЯ
    // ======================================

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


    // ======================================
    // УДАЛИТЬ НАПРАВЛЕНИЕ
    // ======================================

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

          WHERE id =
            ${directionId}

          RETURNING
            trainer_id
        `;


      if (
        rows.length
      ) {
        await sendMessage(
          chat,

          "✅ Направление удалено."
        );


        await showDirectionsAdmin(
          chat,
          rows[0].trainer_id
        );
      }


      return res
        .status(200)
        .json({
          ok: true
        });
    }


    // ======================================
    // ДОБАВИТЬ НАПРАВЛЕНИЕ
    // ======================================

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


    // ======================================
    // ОБЩЕЕ РАСПИСАНИЕ — ВЫБОР ТЕМЫ
    // ======================================

    if (
      data === "week"
    ) {
      await sendMessage(
        chat,

        "📅 ОБЩЕЕ РАСПИСАНИЕ\n\n" +
        "Выберите оформление:",

        [
          [
            {
              text:
                "🟧 Цветное",

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
                "🏠 В меню",

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


    // ======================================
    // ОБЩЕЕ РАСПИСАНИЕ — ЦВЕТ
    // ======================================

    if (
      data ===
      "week_color"
    ) {
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
              text:
                "📅 Создать ещё",

              callback_data:
                "week"
            }
          ],

          [
            {
              text:
                "🏠 В меню",

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


    // ======================================
    // ОБЩЕЕ РАСПИСАНИЕ — ЧБ
    // ======================================

    if (
      data ===
      "week_bw"
    ) {
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
              text:
                "📅 Создать ещё",

              callback_data:
                "week"
            }
          ],

          [
            {
              text:
                "🏠 В меню",

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


    // ======================================
    // НЕИЗВЕСТНЫЙ CALLBACK
    // ======================================

    await sendMessage(
      chat,

      "Выберите действие:",

      mainKeyboard()
    );


    return res
      .status(200)
      .json({
        ok: true
      });


  } catch (error) {

    console.error(
      "WEBHOOK ERROR:",
      error
    );


    // Telegram должен получить 200,
    // чтобы не гонять одно обновление
    // повторно при внутренней ошибке.

    return res
      .status(200)
      .json({
        ok: false,
        error:
          "Internal server error"
      });
  }
};
