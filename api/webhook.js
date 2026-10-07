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
// СТАРТОВЫЕ ТРЕНЕРЫ
// ==========================================

async function seedDatabase() {
  const trainers = [
    {
      name: "Жижина Эльвира",
      phone: "+7 (904) 278-52-01",

      directions: [
        [
          "Хатха-йога",
          "Спокойная практика: гибкость, укрепление тела и снятие стресса."
        ],
        [
          "Йога в гамаках",
          "Практика в гамаках: мобильность, разгрузка и контроль тела."
        ]
      ],

      schedule: [
        [
          "СР",
          "07:30",
          "Хатха-йога",
          "5"
        ],
        [
          "СР",
          "09:00",
          "Йога в гамаках",
          "2"
        ],
        [
          "ПТ",
          "07:30",
          "Хатха-йога",
          "5"
        ],
        [
          "ПТ",
          "09:00",
          "Йога в гамаках",
          "2"
        ]
      ]
    },

    {
      name: "Фролова Екатерина",
      phone: "+7 (988) 095-26-91",

      directions: [
        [
          "Кундалини-йога",
          "Практика для развития осознанности и гармонизации тела и ума."
        ]
      ],

      schedule: [
        [
          "СБ",
          "08:00",
          "Кундалини-йога",
          "5"
        ]
      ]
    },

    {
      name: "Зорина Анна",
      phone: "+7 912 855-31-91",

      directions: [
        [
          "Кундалини-йога",
          "Практика для развития осознанности и гармонизации тела и ума."
        ]
      ],

      schedule: [
        [
          "ПН",
          "09:00",
          "Кундалини-йога",
          "5"
        ],
        [
          "ВС",
          "15:00–19:00",
          "Кундалини-йога",
          "2"
        ]
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
        [
          "ПН",
          "17:00",
          "TRX",
          "2"
        ],
        [
          "ПН",
          "18:00",
          "Силовой фитнес",
          "3"
        ],
        [
          "ПН",
          "19:00",
          "Растяжка",
          "3"
        ],
        [
          "ПН",
          "20:00",
          "Фитнес-йога",
          "2"
        ],

        [
          "ВТ",
          "09:00",
          "Силовой фитнес",
          "3"
        ],
        [
          "ВТ",
          "10:00",
          "Мышечно-суставная гимнастика",
          "2"
        ],

        [
          "СР",
          "17:00",
          "Силовой фитнес",
          "3"
        ],
        [
          "СР",
          "18:00",
          "Силовой фитнес",
          "3"
        ],
        [
          "СР",
          "19:00",
          "TRX",
          "2"
        ],
        [
          "СР",
          "20:00",
          "Фитнес-йога",
          "2"
        ],

        [
          "ЧТ",
          "09:00",
          "Силовой фитнес",
          "3"
        ],
        [
          "ЧТ",
          "10:00",
          "Растяжка",
          "2"
        ],

        [
          "ПТ",
          "17:00",
          "Растяжка",
          "2"
        ],
        [
          "ПТ",
          "18:00",
          "TRX",
          "2"
        ],
        [
          "ПТ",
          "19:00",
          "Растяжка",
          "2"
        ]
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
        [
          "ПН",
          "11:00",
          "Силовой тренинг",
          "3"
        ],
        [
          "ПН",
          "18:30",
          "Кроссфит",
          "1"
        ],

        [
          "ВТ",
          "10:00",
          "Функционал",
          "3"
        ],
        [
          "ВТ",
          "19:00",
          "Силовой тренинг",
          "3"
        ],
        [
          "ВТ",
          "20:00",
          "Тренажерный зал",
          "GYM"
        ],

        [
          "СР",
          "10:00",
          "Силовой тренинг",
          "3"
        ],

        [
          "ЧТ",
          "10:00",
          "Функционал",
          "3"
        ],
        [
          "ЧТ",
          "19:00",
          "Силовой тренинг",
          "3"
        ],
        [
          "ЧТ",
          "20:00",
          "Тренажерный зал",
          "GYM"
        ],

        [
          "ПТ",
          "10:00",
          "Кроссфит",
          "1"
        ],
        [
          "СБ",
          "09:00",
          "Кроссфит",
          "1"
        ]
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
        [
          "ВТ",
          "19:00",
          "Динамическая растяжка",
          "5"
        ],
        [
          "ЧТ",
          "19:00",
          "Динамическая растяжка",
          "5"
        ],
        [
          "ВС",
          "11:00",
          "Динамическая растяжка",
          "5"
        ]
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
        [
          "ВТ",
          "18:00",
          "Джампинг",
          "3"
        ],
        [
          "ЧТ",
          "18:00",
          "Джампинг",
          "3"
        ]
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
        [
          "СР",
          "18:00",
          "Силовой тренинг",
          "2"
        ],
        [
          "ПТ",
          "18:00",
          "Функционал",
          "1"
        ],
        [
          "ВС",
          "11:00",
          "Функционал",
          "1"
        ]
      ]
    },

    {
      name: "Васильчевская Евгения",
      phone: "+7 (914) 936-82-32",

      directions: [
        [
          "Зумба",
          "Танцевальный фитнес: выносливость, координация и отличное настроение."
        ]
      ],

      schedule: [
        [
          "ПТ",
          "18:30",
          "Зумба",
          "3"
        ]
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
// DATA
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
// ОСНОВНЫЕ КНОПКИ
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
// ОБРАБОТКА ТЕКСТОВОГО ВВОДА
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
  // ИМЯ
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
  // ТЕЛЕФОН
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
  // НОВОЕ ЗАНЯТИЕ — ДЕНЬ
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
  // НОВОЕ ЗАНЯТИЕ — ВРЕМЯ
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
  // НОВОЕ ЗАНЯТИЕ — НАПРАВЛЕНИЕ
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
  // НОВОЕ ЗАНЯТИЕ — ЗАЛ
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
        : "#b8bec8",

    line:
      bw
        ? "#d4d4d4"
        : "#30343b",

    accent:
      bw
        ? "#000000"
        : "#ff6a00",

    ghost:
      bw
        ? "#eeeeee"
        : "#171a20",

    onAccent:
      "#ffffff"
  };
}


// ==========================================
// СОРТИРОВКА РАСПИСАНИЯ
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
// ЗАЛЫ
// ==========================================

function trainerPosterHall(
  hall
) {
  const value =
    String(hall || "")
      .toUpperCase();

  if (value === "GYM") {
    return "ТРЕНАЖЕРНЫЙ";
  }

  return `ЗАЛ ${value}`;
}


// ==========================================
// ШАПКА A4
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


// ==========================================
// ФУТЕР A4
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

function renderTrainerSchedule({
  rows = [],
  x,
  y,
  width,
  height,
  C,
  compact = false
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
        height="58"
        rx="10"
        fill="${C.card2}"
        stroke="${C.line}"
        stroke-width="1"
      />

      <text
        x="${x + 18}"
        y="${y + 36}"
        fill="${C.muted}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="15"
        font-weight="700"
      >Расписание пока не заполнено</text>
    `;
  }


  const headerH =
    compact
      ? 28
      : 36;

  const minRowH =
    compact
      ? 21
      : 30;

  const maxRowH =
    compact
      ? 38
      : 64;

  const gap =
    compact
      ? 8
      : 12;


  // ========================================
  // ВЫЧИСЛЯЕМ ВМЕСТИМОСТЬ
  // ========================================

  const maxRowsPerColumn =
    Math.max(
      1,
      Math.floor(
        (
          height -
          headerH -
          8
        ) /
        minRowH
      )
    );


  let columns = 1;

  while (
    columns < 3 &&
    original.length >
      maxRowsPerColumn *
        columns
  ) {
    columns++;
  }


  const capacity =
    maxRowsPerColumn *
    columns;


  let schedule =
    original;


  let omitted = 0;


  // Если даже 3 колонки не вмещают всё,
  // оставляем последнюю строку под сообщение
  // «+ ещё N занятий».
  if (
    original.length >
    capacity
  ) {
    omitted =
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
  }


  const rowsPerColumn =
    Math.ceil(
      schedule.length /
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


  rowH =
    Math.max(
      minRowH,
      Math.min(
        maxRowH,
        rowH
      )
    );


  const columnWidth =
    (
      width -
      gap *
        (columns - 1)
    ) /
    columns;


  let svg = "";


  // ========================================
  // ЗАГОЛОВКИ
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
          gap
        );


    svg += `
      <rect
        x="${cx}"
        y="${y}"
        width="${columnWidth}"
        height="${headerH}"
        rx="7"
        fill="${C.accent}"
      />

      <text
        x="${cx + 9}"
        y="${y + headerH - 9}"
        fill="${C.onAccent}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${
          compact
            ? 9
            : 12
        }"
        font-weight="900"
      >ДЕНЬ</text>

      <text
        x="${cx + 57}"
        y="${y + headerH - 9}"
        fill="${C.onAccent}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${
          compact
            ? 9
            : 12
        }"
        font-weight="900"
      >ВРЕМЯ</text>

      <text
        x="${cx + 132}"
        y="${y + headerH - 9}"
        fill="${C.onAccent}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${
          compact
            ? 9
            : 12
        }"
        font-weight="900"
      >НАПРАВЛЕНИЕ</text>

      <text
        x="${
          cx +
          columnWidth -
          9
        }"
        y="${y + headerH - 9}"
        text-anchor="end"
        fill="${C.onAccent}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${
          compact
            ? 9
            : 12
        }"
        font-weight="900"
      >ЗАЛ</text>
    `;
  }


  // ========================================
  // СТРОКИ
  // ========================================

  schedule.forEach(
    (lesson, index) => {
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
            gap
          );


      const ry =
        y +
        headerH +
        6 +
        localIndex *
          rowH;


      const fontSize =
        compact
          ? Math.max(
              9,
              Math.min(
                13,
                rowH * 0.4
              )
            )
          : Math.max(
              12,
              Math.min(
                18,
                rowH * 0.35
              )
            );


      const directionChars =
        columns === 1
          ? 42
          : columns === 2
          ? 20
          : 12;


      const direction =
        trainerPosterWrap(
          lesson.direction || "",
          directionChars
        )[0] || "";


      const summaryRow =
        String(
          lesson.direction || ""
        ).startsWith(
          "+ ЕЩЁ"
        );


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
            summaryRow
              ? C.card2
              : localIndex % 2 === 0
              ? C.card2
              : C.card
          }"
          stroke="${C.line}"
          stroke-width="1"
        />
      `;


      if (summaryRow) {
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
          x="${rx + 9}"
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
          x="${rx + 57}"
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
          x="${rx + 132}"
          y="${
            ry +
            rowH / 2 +
            5
          }"
          fill="${C.text}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${Math.max(
            8,
            fontSize - 1
          )}"
          font-weight="800"
        >${esc(direction)}</text>

        <text
          x="${
            rx +
            columnWidth -
            9
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
            8,
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
      font-size="48"
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
      y="${y + 61}"
      text-anchor="end"
      fill="${C.accent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="24"
      font-weight="900"
    >${esc(
      trainer.phone || ""
    )}</text>

    <line
      x1="${x + 28}"
      y1="${y + 88}"
      x2="${
        x +
        cardW -
        28
      }"
      y2="${y + 88}"
      stroke="${C.line}"
      stroke-width="2"
    />

    <text
      x="${x + 28}"
      y="${y + 130}"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="18"
      font-weight="900"
      letter-spacing="2"
    >НАПРАВЛЕНИЯ</text>
  `;


  const visibleDirections =
    directions.slice(
      0,
      5
    );


  const directionTop =
    y + 150;


  const directionH =
    visibleDirections.length <= 2
      ? 98
      : visibleDirections.length <= 4
      ? 76
      : 64;


  const directionGap =
    9;


  visibleDirections.forEach(
    (
      direction,
      index
    ) => {
      const dy =
        directionTop +
        index *
          (
            directionH +
            directionGap
          );


      const description =
        trainerPosterWrap(
          direction.description ||
            "",
          75
        ).slice(
          0,
          2
        );


      svg += `
        <rect
          x="${x + 28}"
          y="${dy}"
          width="${cardW - 56}"
          height="${directionH}"
          rx="12"
          fill="${C.card2}"
          stroke="${C.line}"
          stroke-width="1"
        />

        <rect
          x="${x + 28}"
          y="${dy}"
          width="7"
          height="${directionH}"
          rx="4"
          fill="${C.accent}"
        />

        <text
          x="${x + 48}"
          y="${dy + 28}"
          fill="${C.accent}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${
            visibleDirections.length >= 5
              ? 19
              : 23
          }"
          font-weight="900"
        >${esc(
          String(
            direction.name || ""
          ).toUpperCase()
        )}</text>

        ${trainerPosterLines(
          description,
          x + 48,
          dy + 52,
          visibleDirections.length >= 5
            ? 13
            : 15,
          C.text,
          700,
          18
        )}
      `;
    }
  );


  const directionsBottom =
    directionTop +
    visibleDirections.length *
      (
        directionH +
        directionGap
      );


  const scheduleTitleY =
    Math.max(
      directionsBottom + 24,
      y + 465
    );


  const hallsY =
    y +
    cardH -
    165;


  const scheduleY =
    scheduleTitleY + 20;


  const scheduleHeight =
    hallsY -
    scheduleY -
    30;


  svg += `
    <text
      x="${x + 28}"
      y="${scheduleTitleY}"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="18"
      font-weight="900"
      letter-spacing="2"
    >РАСПИСАНИЕ</text>

    ${renderTrainerSchedule({
      rows: schedule,
      x: x + 28,
      y: scheduleY,
      width:
        cardW - 56,
      height:
        scheduleHeight,
      C,
      compact: false
    })}

    <text
      x="${x + 28}"
      y="${hallsY}"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="16"
      font-weight="900"
      letter-spacing="2"
    >ЗАЛЫ «ТИТАН»</text>

    <text
      x="${x + 28}"
      y="${hallsY + 31}"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="13"
      font-weight="800"
    >1 — КРОССФИТ / БОКС · 2 — TRX / АНТИГРАВИТИ · 3 — СИЛОВОЙ ТРЕНИНГ</text>

    <text
      x="${x + 28}"
      y="${hallsY + 57}"
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


      const nameSize =
        count === 2
          ? 34
          : 26;


      const phoneSize =
        count === 2
          ? 18
          : 14;


      const sectionSize =
        count === 2
          ? 15
          : 12;


      svg += `
        <rect
          x="${PAD}"
          y="${cardY}"
          width="${cardW}"
          height="${cardH}"
          rx="21"
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
          y="${cardY + 43}"
          fill="${C.accent}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${
            count === 2
              ? 17
              : 13
          }"
          font-weight="900"
        >${String(
          trainerIndex + 1
        ).padStart(
          2,
          "0"
        )}</text>

        <text
          x="${innerX + 43}"
          y="${cardY + 45}"
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
          y="${cardY + 43}"
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
          y1="${cardY + 64}"
          x2="${
            PAD +
            cardW -
            26
          }"
          y2="${cardY + 64}"
          stroke="${C.line}"
          stroke-width="1.5"
        />
      `;


      const directionTitleY =
        cardY +
        (
          count === 2
            ? 100
            : 87
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


      const maxDirections =
        count === 2
          ? 4
          : 3;


      const visibleDirections =
        directions.slice(
          0,
          maxDirections
        );


      const directionGap =
        8;


      const directionCount =
        Math.max(
          1,
          visibleDirections.length
        );


      const directionW =
        (
          innerW -
          directionGap *
            (
              directionCount -
              1
            )
        ) /
        directionCount;


      const directionH =
        count === 2
          ? 88
          : 61;


      visibleDirections.forEach(
        (
          direction,
          directionIndex
        ) => {
          const dx =
            innerX +
            directionIndex *
              (
                directionW +
                directionGap
              );


          const description =
            trainerPosterWrap(
              direction.description ||
                "",
              count === 2
                ? 25
                : 16
            ).slice(
              0,
              count === 2
                ? 2
                : 1
            );


          svg += `
            <rect
              x="${dx}"
              y="${
                directionTitleY +
                13
              }"
              width="${directionW}"
              height="${directionH}"
              rx="10"
              fill="${C.card2}"
              stroke="${C.line}"
              stroke-width="1"
            />

            <rect
              x="${dx}"
              y="${
                directionTitleY +
                13
              }"
              width="6"
              height="${directionH}"
              rx="3"
              fill="${C.accent}"
            />

            <text
              x="${dx + 14}"
              y="${
                directionTitleY +
                36
              }"
              fill="${C.accent}"
              font-family="Arial, Helvetica, sans-serif"
              font-size="${
                count === 2
                  ? 15
                  : 11.5
              }"
              font-weight="900"
            >${esc(
              String(
                direction.name ||
                  ""
              ).toUpperCase()
            )}</text>

            ${trainerPosterLines(
              description,
              dx + 14,
              directionTitleY +
                56,
              count === 2
                ? 10.5
                : 8,
              C.text,
              700,
              14
            )}
          `;
        }
      );


      const scheduleTitleY =
        directionTitleY +
        13 +
        directionH +
        (
          count === 2
            ? 30
            : 22
        );


      const hallsY =
        cardY +
        cardH -
        (
          count === 2
            ? 63
            : 46
        );


      const scheduleY =
        scheduleTitleY +
        13;


      const scheduleHeight =
        hallsY -
        scheduleY -
        16;


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
          rows: schedule,
          x: innerX,
          y: scheduleY,
          width:
            innerW,
          height:
            scheduleHeight,
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
          x="${innerX + 58}"
          y="${hallsY}"
          fill="${C.text}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${
            count === 2
              ? 9.5
              : 7.5
          }"
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


  const W = 1240;
  const H = 1754;

  const PAD = 56;


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
        (a, b) =>
          trainerPosterDayOrder(a) -
          trainerPosterDayOrder(b)
      );


  const leftDays = [];
  const rightDays = [];

  let leftWeight = 0;
  let rightWeight = 0;


  for (
    const day of days
  ) {
    const weight =
      grouped[day].length +
      1.5;


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
    225;

  const bottom =
    1605;

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
      dayList.length * 42;


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
        : 38;


    rowH =
      Math.max(
        18,
        Math.min(
          43,
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
          height="34"
          rx="9"
          fill="${C.accent}"
        />

        <text
          x="${x + 14}"
          y="${currentY + 23}"
          fill="${C.onAccent}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="17"
          font-weight="900"
        >${esc(day)}</text>

        <text
          x="${
            x +
            columnWidth -
            14
          }"
          y="${currentY + 23}"
          text-anchor="end"
          fill="${C.onAccent}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="10"
          font-weight="900"
        >${lessons.length} ЗАН.</text>
      `;


      currentY += 40;


      lessons.forEach(
        (
          lesson,
          index
        ) => {
          const fontSize =
            rowH <= 22
              ? 8.5
              : rowH <= 28
              ? 10
              : 12;


          const direction =
            trainerPosterWrap(
              lesson.direction || "",
              19
            )[0] || "";


          const trainer =
            trainerPosterWrap(
              lesson.trainer_name || "",
              15
            )[0] || "";


          svg += `
            <rect
              x="${x}"
              y="${currentY}"
              width="${columnWidth}"
              height="${Math.max(
                14,
                rowH - 4
              )}"
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
              x="${x + 76}"
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
              x="${x + 270}"
              y="${
                currentY +
                rowH / 2 +
                4
              }"
              fill="${C.muted}"
              font-family="Arial, Helvetica, sans-serif"
              font-size="${Math.max(
                7,
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
      >ОБЩЕЕ РАСПИСАНИЕ</text>

      <text
        x="56"
        y="192"
        fill="${C.muted}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="19"
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
        y="1645"
        fill="${C.muted}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="10.5"
        font-weight="800"
      >1 — КРОССФИТ / БОКС · 2 — TRX / АНТИГРАВИТИ · 3 — СИЛОВОЙ · 5 — ЙОГА / АЭРОЙОГА · GYM — ТРЕНАЖЕРНЫЙ ЗАЛ</text>

      ${trainerPosterFooter(C)}

    </svg>
  `;
}


// ==========================================
// ОТПРАВКА ИНФОГРАФИКИ ТРЕНЕРОВ
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
        method: "POST",
        body: form
      }
    );


  if (!response.ok) {
    const body =
      await response.text();


    throw new Error(
      `Telegram sendDocument error: ` +
      `${response.status} ${body}`
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
        method: "POST",
        body: form
      }
    );


  if (!response.ok) {
    const body =
      await response.text();


    throw new Error(
      `Telegram sendDocument error: ` +
      `${response.status} ${body}`
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
    // ПРОВЕРКА МЕТОДА
    // ======================================

    if (
      req.method !== "POST"
    ) {
      return res
        .status(200)
        .json({
          ok: true,
          service: "TITAN Bot"
        });
    }


    // ======================================
    // ИНИЦИАЛИЗАЦИЯ БАЗЫ
    // ======================================

    await initDatabase();


    // ======================================
    // UPDATE
    // ======================================

    const update =
      req.body || {};


    const message =
      update.message || null;


    const query =
      update.callback_query || null;


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
    // ПОДТВЕРЖДАЕМ CALLBACK
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
        message.text.trim();


      // ====================================
      // /start
      // ====================================

      if (
        text === "/start"
      ) {
        await clearState(chat);


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
      // ОБРАБОТКА СОСТОЯНИЯ
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
    // ЕСЛИ ЭТО НЕ CALLBACK
    // ======================================

    if (!query) {
      return res
        .status(200)
        .json({
          ok: true
        });
    }


    const data =
      query.data || "";


    // ======================================
    // ГЛАВНОЕ МЕНЮ
    // ======================================

    if (
      data === "home"
    ) {
      await clearState(chat);


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
      await clearState(chat);


      await sendMessage(
        chat,
        "🖼 СОЗДАТЬ ИНФОГРАФИКУ\n\n" +
        "Что создаём?",
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


    // ======================================
    // ВЫБОР КОЛИЧЕСТВА ТРЕНЕРОВ
    // ======================================

    if (
      data ===
      "trainer_poster_menu"
    ) {
      await clearState(chat);


      await sendMessage(
        chat,
        "👤 Сколько тренеров разместить на одном A4?",
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


    // ======================================
    // КОЛИЧЕСТВО ТРЕНЕРОВ
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
        ![1, 2, 3]
          .includes(count)
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
          text: "⬅️ Назад",
          callback_data:
            "trainer_poster_menu"
        }
      ]);


      await sendMessage(
        chat,
        `Выберите ${count} тренер${
          count === 1
            ? "а"
            : "ов"
        }:`,
        keyboard
      );


      return res
        .status(200)
        .json({
          ok: true
        });
    }


    // ======================================
    // ВЫБОР ТРЕНЕРА
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
        await getState(chat);


      if (
        !state ||
        state.action !==
          "poster_select"
      ) {
        await sendMessage(
          chat,
          "Выбор устарел. Начните заново.",
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
          : [];


      if (
        selectedIds.includes(
          trainerId
        )
      ) {
        selectedIds =
          selectedIds.filter(
            id =>
              id !== trainerId
          );
      } else {
        if (
          selectedIds.length <
          count
        ) {
          selectedIds.push(
            trainerId
          );
        }
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
            text: "➡️ Продолжить",
            callback_data:
              "poster_theme"
          }
        ]);
      }


      keyboard.push([
        {
          text: "⬅️ Назад",
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
    // ВЫБОР ТЕМЫ
    // ======================================

    if (
      data ===
      "poster_theme"
    ) {
      const state =
        await getState(chat);


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


      if (
        !Array.isArray(
          info.selectedIds
        ) ||
        info.selectedIds.length !==
          Number(info.count)
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
        "Выберите вариант:",
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


    // ======================================
    // ГЕНЕРАЦИЯ ИНФОГРАФИКИ ТРЕНЕРОВ
    // ======================================

    if (
      data.startsWith(
        "poster_generate:"
      )
    ) {
      const theme =
        data.split(":")[1] === "bw"
          ? "bw"
          : "color";


      const state =
        await getState(chat);


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


      if (!selectedIds.length) {
        await sendMessage(
          chat,
          "Тренеры не выбраны."
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


      await clearState(chat);


      await sendMessage(
        chat,
        "✅ Инфографика готова.",
        [
          [
            {
              text: "🖼 Создать ещё",
              callback_data:
                "trainer_poster_menu"
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


    // ======================================
    // ПУБЛИЧНЫЙ СПИСОК ТРЕНЕРОВ
    // ======================================

    if (
      data === "trainers"
    ) {
      const trainers =
        await getTrainers();


      const text =
        trainers.length
          ? trainers
              .map(
                trainer =>
                  `👤 ${trainer.name}\n` +
                  `📞 ${trainer.phone || "—"}`
              )
              .join("\n\n")
          : "Тренеры пока не добавлены.";


      await sendMessage(
        chat,
        `👤 ТРЕНЕРЫ «ТИТАН»\n\n${text}`,
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


    // ======================================
    // АДМИН
    // ======================================

    if (
      data === "admin"
    ) {
      await showAdmin(chat);


      return res
        .status(200)
        .json({
          ok: true
        });
    }


    // ======================================
    // СПИСОК ТРЕНЕРОВ В АДМИНКЕ
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
    // ИЗМЕНИТЬ ДЕНЬ
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
        "Введите новый день:\n" +
        "ПН, ВТ, СР, ЧТ, ПТ, СБ или ВС"
      );


      return res
        .status(200)
        .json({
          ok: true
        });
    }


    // ======================================
    // ИЗМЕНИТЬ ВРЕМЯ
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
        "Введите новое время:"
      );


      return res
        .status(200)
        .json({
          ok: true
        });
    }


    // ======================================
    // ИЗМЕНИТЬ НАПРАВЛЕНИЕ
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
    // ИЗМЕНИТЬ ЗАЛ
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
        "Введите 1, 2, 3, 5\n" +
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
          WHERE id = ${lessonId}
          RETURNING trainer_id
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
        "Введите день:\n" +
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
    // ИЗМЕНИТЬ ОПИСАНИЕ
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
        "Введите новое описание:"
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
          WHERE id = ${directionId}
          RETURNING trainer_id
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
    // ОБЩЕЕ РАСПИСАНИЕ
    // ======================================

    if (
      data === "week"
    ) {
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


    // ======================================
    // НЕИЗВЕСТНАЯ КНОПКА
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


    // Важно: возвращаем 200,
    // чтобы Telegram не отправлял
    // одно и то же обновление повторно.

    return res
      .status(200)
      .json({
        ok: false,
        error:
          "Internal server error"
      });
  }
};
