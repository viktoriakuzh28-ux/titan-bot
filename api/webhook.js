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
          "Кундалини-йога",
          "Практика для развития осознанности, дыхания и внутреннего баланса."
        ]
      ],

      schedule: [
        ["СБ", "08:00", "Кундалини-йога", "5"]
      ]
    },

    {
      name: "Зорина Анна",
      phone: "+7 912 855-31-91",

      directions: [
        [
          "Кундалини-йога",
          "Практика для гибкости, восстановления и улучшения самочувствия."
        ]
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
        ["ПТ", "18:30", "Зумба", "3"]
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

async function getTrainersByIds(ids) {
  const cleanIds =
    (ids || [])
      .map(Number)
      .filter(Number.isInteger);

  if (!cleanIds.length) {
    return [];
  }

  const result = [];

  for (
    const id of cleanIds
  ) {
    const trainer =
      await getTrainer(id);

    if (trainer) {
      result.push(trainer);
    }
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
            "🗑 Удалить тренера",
          callback_data:
            `delete_trainer_confirm:${trainerId}`
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
              lesson.hall === "GYM"
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
// БЛОК 2
// ГЕНЕРАТОР A4 «ТИТАН»
// ==========================================


// ==========================================
// ТЕМА
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
        ? "#f5f5f5"
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
        ? "#6a6a6a"
        : "#aeb5bf",

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
        ? "#ededed"
        : "#171a20",

    onAccent:
      "#ffffff"
  };
}


// ==========================================
// СОРТИРОВКА ДНЕЙ
// ==========================================

function trainerPosterDayOrder(
  day
) {
  const map = {
    ПН: 1,
    ВТ: 2,
    СР: 3,
    ЧТ: 4,
    ПТ: 5,
    СБ: 6,
    ВС: 7
  };

  return (
    map[
      String(day || "")
        .trim()
        .toUpperCase()
    ] || 99
  );
}


// ==========================================
// СОРТИРОВКА ВРЕМЕНИ
// ==========================================

function trainerPosterTimeOrder(
  time
) {
  const match =
    String(time || "")
      .match(
        /(\d{1,2}):(\d{2})/
      );

  if (!match) {
    return 99999;
  }

  return (
    Number(match[1]) * 60 +
    Number(match[2])
  );
}


// ==========================================
// СОРТИРОВКА РАСПИСАНИЯ
// ==========================================

function trainerPosterSortSchedule(
  rows = []
) {
  return [...rows]
    .sort(
      (a, b) => {
        const dayDiff =
          trainerPosterDayOrder(
            a.day
          ) -
          trainerPosterDayOrder(
            b.day
          );

        if (
          dayDiff !== 0
        ) {
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
  maxChars = 40
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
      current &&
      next.length >
        maxChars
    ) {
      lines.push(
        current
      );

      current =
        word;
    } else {
      current =
        next;
    }
  }

  if (current) {
    lines.push(
      current
    );
  }

  return lines;
}


// ==========================================
// SVG ЛИНИИ ТЕКСТА
// ==========================================

function trainerPosterLines(
  lines,
  x,
  y,
  size,
  color,
  weight = 700,
  gap = 20
) {
  return (
    lines || []
  )
    .map(
      (
        line,
        index
      ) => `
        <text
          x="${x}"
          y="${
            y +
            index * gap
          }"
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
// НАЗВАНИЕ ЗАЛА
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
    return "GYM";
  }

  return value;
}


// ==========================================
// ШАПКА
// ==========================================

function trainerPosterHeader(
  C,
  title =
    "ТРЕНЕРЫ «ТИТАН»",
  subtitle =
    "АКТУАЛЬНОЕ РАСПИСАНИЕ"
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
      y="72"
      fill="${C.accent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="52"
      font-weight="900"
    >ТИТАН</text>

    <text
      x="1184"
      y="69"
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
    >${esc(title)}</text>

    <text
      x="56"
      y="193"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="20"
      font-weight="900"
      letter-spacing="2"
    >${esc(subtitle)}</text>

    <text
      x="1182"
      y="184"
      text-anchor="end"
      fill="${C.ghost}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="86"
      font-weight="900"
    >ТИТАН</text>
  `;
}


// ==========================================
// ФУТЕР
// ==========================================

function trainerPosterFooter(
  C
) {
  return `
    <text
      x="56"
      y="1718"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="16"
      font-weight="800"
    >г. Сарапул · ул. Советская, 46</text>

    <text
      x="1184"
      y="1718"
      text-anchor="end"
      fill="${C.accent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="17"
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


// ==========================================
// КАРТОЧКИ ЗАЛОВ
// ==========================================

function renderHallCards(
  x,
  y,
  width,
  C
) {
  const gapX =
    20;

  const gapY =
    14;

  const cardW =
    (
      width -
      gapX
    ) / 2;

  const cardH =
    88;

  const halls = [
    {
      title:
        "ЗАЛ 1",

      text:
        "КРОССФИТ / БОКС"
    },

    {
      title:
        "ЗАЛ 2",

      text:
        "TRX / АНТИГРАВИТИ"
    },

    {
      title:
        "ЗАЛ 3",

      text:
        "СИЛОВОЙ ТРЕНИНГ"
    },

    {
      title:
        "ЗАЛ 5",

      text:
        "ЙОГА / АЭРОЙОГА"
    }
  ];

  let svg = "";

  halls.forEach(
    (
      hall,
      index
    ) => {
      const col =
        index % 2;

      const row =
        Math.floor(
          index / 2
        );

      const cx =
        x +
        col *
          (
            cardW +
            gapX
          );

      const cy =
        y +
        row *
          (
            cardH +
            gapY
          );

      svg += `
        <rect
          x="${cx}"
          y="${cy}"
          width="${cardW}"
          height="${cardH}"
          rx="14"
          fill="${C.card2}"
          stroke="${C.line}"
          stroke-width="1.5"
        />

        <text
          x="${cx + 24}"
          y="${cy + 36}"
          fill="${C.text}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="22"
          font-weight="900"
        >${hall.title}</text>

        <text
          x="${cx + 24}"
          y="${cy + 66}"
          fill="${C.text}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="17"
          font-weight="900"
        >${hall.text}</text>
      `;
    }
  );

  return {
    svg,

    height:
      cardH * 2 +
      gapY
  };
}


// ==========================================
// НАПРАВЛЕНИЯ — 1 ТРЕНЕР
// ==========================================

function renderSingleDirections(
  directions,
  x,
  y,
  width,
  C
) {
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
          height="72"
          rx="12"
          fill="${C.card2}"
          stroke="${C.line}"
          stroke-width="1.5"
        />

        <text
          x="${x + 22}"
          y="${y + 44}"
          fill="${C.muted}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="18"
          font-weight="800"
        >Направления пока не заполнены</text>
      `,

      height:
        72
    };
  }

  const visible =
    list.slice(
      0,
      5
    );

  const hidden =
    Math.max(
      0,
      list.length -
      visible.length
    );

  let svg = "";

  let currentY =
    y;

  const gap =
    12;

  visible.forEach(
    direction => {
      const titleLines =
        trainerPosterWrap(
          String(
            direction.name ||
            ""
          ).toUpperCase(),
          52
        ).slice(
          0,
          2
        );

      const descLines =
        trainerPosterWrap(
          direction.description ||
          "",
          80
        ).slice(
          0,
          2
        );

      const titleExtra =
        titleLines.length > 1
          ? 22
          : 0;

      const descExtra =
        descLines.length > 1
          ? 18
          : 0;

      const cardH =
        84 +
        titleExtra +
        descExtra;

      svg += `
        <rect
          x="${x}"
          y="${currentY}"
          width="${width}"
          height="${cardH}"
          rx="13"
          fill="${C.card2}"
          stroke="${C.line}"
          stroke-width="1.5"
        />

        <rect
          x="${x}"
          y="${currentY}"
          width="8"
          height="${cardH}"
          rx="4"
          fill="${C.accent}"
        />

        ${trainerPosterLines(
          titleLines,
          x + 24,
          currentY + 32,
          24,
          C.accent,
          900,
          24
        )}

        ${trainerPosterLines(
          descLines,
          x + 24,
          currentY +
            (
              titleLines.length > 1
                ? 82
                : 59
            ),
          16,
          C.text,
          700,
          20
        )}
      `;

      currentY +=
        cardH +
        gap;
    }
  );

  if (
    hidden > 0
  ) {
    svg += `
      <text
        x="${x + 4}"
        y="${currentY + 19}"
        fill="${C.accent}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="17"
        font-weight="900"
      >+ ещё ${hidden} направлен${
        hidden === 1
          ? "ие"
          : "ия"
      }</text>
    `;

    currentY +=
      30;
  }

  return {
    svg,

    height:
      currentY -
      y -
      gap
  };
}


// ==========================================
// РАСПИСАНИЕ — 1 ТРЕНЕР
// ==========================================

function renderSingleSchedule(
  rows,
  x,
  y,
  width,
  maxHeight,
  C
) {
  const schedule =
    trainerPosterSortSchedule(
      rows || []
    );

  if (!schedule.length) {
    return {
      svg: `
        <rect
          x="${x}"
          y="${y}"
          width="${width}"
          height="70"
          rx="12"
          fill="${C.card2}"
          stroke="${C.line}"
          stroke-width="1.5"
        />

        <text
          x="${x + 22}"
          y="${y + 43}"
          fill="${C.muted}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="18"
          font-weight="800"
        >Расписание пока не заполнено</text>
      `,

      height:
        70
    };
  }

  const headerH =
    50;

  const rowH =
    66;

  const gap =
    9;

  const capacity =
    Math.max(
      1,
      Math.floor(
        (
          maxHeight -
          headerH -
          8
        ) /
        (
          rowH +
          gap
        )
      )
    );

  let visible =
    schedule;

  if (
    schedule.length >
    capacity
  ) {
    const normalRows =
      Math.max(
        1,
        capacity - 1
      );

    visible = [
      ...schedule.slice(
        0,
        normalRows
      ),

      {
        day: "",
        time: "",
        direction:
          `+ ещё ${
            schedule.length -
            normalRows
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
      height="${headerH}"
      rx="12"
      fill="${C.accent}"
    />

    <text
      x="${x + 28}"
      y="${y + 33}"
      fill="${C.onAccent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="15"
      font-weight="900"
    >ДЕНЬ</text>

    <text
      x="${x + 170}"
      y="${y + 33}"
      fill="${C.onAccent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="15"
      font-weight="900"
    >ВРЕМЯ</text>

    <text
      x="${x + 430}"
      y="${y + 33}"
      fill="${C.onAccent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="15"
      font-weight="900"
    >НАПРАВЛЕНИЕ</text>

    <text
      x="${x + width - 28}"
      y="${y + 33}"
      text-anchor="end"
      fill="${C.onAccent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="15"
      font-weight="900"
    >ЗАЛ</text>
  `;

  let currentY =
    y +
    headerH +
    10;

  visible.forEach(
    (
      lesson,
      index
    ) => {
      const summary =
        String(
          lesson.direction || ""
        ).startsWith(
          "+"
        );

      svg += `
        <rect
          x="${x}"
          y="${currentY}"
          width="${width}"
          height="${rowH}"
          rx="13"
          fill="${
            index % 2 === 0
              ? C.card2
              : C.card
          }"
          stroke="${C.line}"
          stroke-width="1.5"
        />
      `;

      if (summary) {
        svg += `
          <text
            x="${x + 28}"
            y="${currentY + 40}"
            fill="${C.accent}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="20"
            font-weight="900"
          >${esc(
            lesson.direction
          )}</text>
        `;
      } else {
        svg += `
          <text
            x="${x + 28}"
            y="${currentY + 41}"
            fill="${C.accent}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="23"
            font-weight="900"
          >${esc(
            lesson.day || ""
          )}</text>

          <text
            x="${x + 170}"
            y="${currentY + 41}"
            fill="${C.text}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="23"
            font-weight="900"
          >${esc(
            lesson.time || ""
          )}</text>

          <text
            x="${x + 430}"
            y="${currentY + 41}"
            fill="${C.text}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="21"
            font-weight="800"
          >${esc(
            trainerPosterWrap(
              lesson.direction ||
              "",
              34
            )[0] || ""
          )}</text>

          <text
            x="${x + width - 28}"
            y="${currentY + 41}"
            text-anchor="end"
            fill="${C.accent}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="20"
            font-weight="900"
          >${
            String(
              lesson.hall ||
              ""
            ).toUpperCase() ===
            "GYM"
              ? "GYM"
              : `ЗАЛ ${esc(
                  lesson.hall ||
                  ""
                )}`
          }</text>
        `;
      }

      currentY +=
        rowH +
        gap;
    }
  );

  return {
    svg,

    height:
      currentY -
      y -
      gap
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

  const W =
    1240;

  const H =
    1754;

  const cardX =
    56;

  const cardY =
    225;

  const cardW =
    1128;

  const cardH =
    1435;

  const innerX =
    cardX + 34;

  const innerW =
    cardW - 68;

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

  const directionsY =
    cardY +
    190;

  const directionsBlock =
    renderSingleDirections(
      directions,
      innerX,
      directionsY,
      innerW,
      C
    );

  const scheduleTitleY =
    directionsY +
    directionsBlock.height +
    56;

  const hallsTitleY =
    cardY +
    cardH -
    365;

  const scheduleY =
    scheduleTitleY +
    42;

  const scheduleMaxHeight =
    Math.max(
      120,
      hallsTitleY -
      scheduleY -
      35
    );

  const scheduleBlock =
    renderSingleSchedule(
      schedule,
      innerX,
      scheduleY,
      innerW,
      scheduleMaxHeight,
      C
    );

  const hallCardsY =
    hallsTitleY +
    36;

  const halls =
    renderHallCards(
      innerX,
      hallCardsY,
      innerW,
      C
    );

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
        x="${cardX}"
        y="${cardY}"
        width="${cardW}"
        height="${cardH}"
        rx="24"
        fill="${C.card}"
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

      <text
        x="${innerX}"
        y="${cardY + 68}"
        fill="${C.accent}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="23"
        font-weight="900"
      >01</text>

      <text
        x="${innerX + 70}"
        y="${cardY + 70}"
        fill="${C.text}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="54"
        font-weight="900"
      >${esc(
        String(
          trainer.name ||
          ""
        ).toUpperCase()
      )}</text>

      <text
        x="${cardX + cardW - 34}"
        y="${cardY + 68}"
        text-anchor="end"
        fill="${C.accent}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="27"
        font-weight="900"
      >${esc(
        trainer.phone ||
        ""
      )}</text>

      <line
        x1="${innerX}"
        y1="${cardY + 105}"
        x2="${cardX + cardW - 34}"
        y2="${cardY + 105}"
        stroke="${C.line}"
        stroke-width="2"
      />

      <text
        x="${innerX}"
        y="${cardY + 157}"
        fill="${C.muted}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="19"
        font-weight="900"
        letter-spacing="2"
      >НАПРАВЛЕНИЯ</text>

      ${directionsBlock.svg}

      <text
        x="${innerX}"
        y="${scheduleTitleY}"
        fill="${C.muted}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="19"
        font-weight="900"
        letter-spacing="2"
      >РАСПИСАНИЕ</text>

      ${scheduleBlock.svg}

      <text
        x="${innerX}"
        y="${hallsTitleY}"
        fill="${C.muted}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="19"
        font-weight="900"
        letter-spacing="2"
      >ЗАЛЫ «ТИТАН»</text>

      ${halls.svg}

      <text
        x="${innerX}"
        y="${
          hallCardsY +
          halls.height +
          32
        }"
        fill="${C.muted}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="15"
        font-weight="800"
      >GYM — ТРЕНАЖЕРНЫЙ ЗАЛ</text>

      ${trainerPosterFooter(C)}

    </svg>
  `;
}


// ==========================================
// НАПРАВЛЕНИЯ — 2 / 3 ТРЕНЕРА
// ==========================================

function renderCompactDirections(
  directions,
  x,
  y,
  width,
  C,
  mode
) {
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
          height="54"
          rx="10"
          fill="${C.card2}"
          stroke="${C.line}"
          stroke-width="1.2"
        />

        <text
          x="${x + 16}"
          y="${y + 35}"
          fill="${C.muted}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="16"
          font-weight="800"
        >Направления не заполнены</text>
      `,

      height:
        54
    };
  }

  const isDouble =
    mode === "double";

  const maxVisible =
    isDouble
      ? 3
      : 2;

  const visible =
    list.slice(
      0,
      maxVisible
    );

  const hidden =
    Math.max(
      0,
      list.length -
      visible.length
    );

  const cardH =
    isDouble
      ? 74
      : 56;

  const gap =
    isDouble
      ? 9
      : 7;

  let currentY =
    y;

  let svg = "";

  visible.forEach(
    direction => {
      const title =
        trainerPosterWrap(
          String(
            direction.name ||
            ""
          ).toUpperCase(),
          isDouble
            ? 50
            : 40
        )[0] || "";

      const desc =
        trainerPosterWrap(
          direction.description ||
          "",
          isDouble
            ? 78
            : 58
        )[0] || "";

      svg += `
        <rect
          x="${x}"
          y="${currentY}"
          width="${width}"
          height="${cardH}"
          rx="10"
          fill="${C.card2}"
          stroke="${C.line}"
          stroke-width="1.2"
        />

        <rect
          x="${x}"
          y="${currentY}"
          width="7"
          height="${cardH}"
          rx="3"
          fill="${C.accent}"
        />

        <text
          x="${x + 18}"
          y="${
            currentY +
            (
              isDouble
                ? 29
                : 24
            )
          }"
          fill="${C.accent}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${
            isDouble
              ? 20
              : 16
          }"
          font-weight="900"
        >${esc(title)}</text>

        <text
          x="${x + 18}"
          y="${
            currentY +
            (
              isDouble
                ? 55
                : 44
            )
          }"
          fill="${C.text}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${
            isDouble
              ? 15
              : 12
          }"
          font-weight="700"
        >${esc(desc)}</text>
      `;

      currentY +=
        cardH +
        gap;
    }
  );

  if (
    hidden > 0
  ) {
    svg += `
      <text
        x="${x + 4}"
        y="${currentY + 19}"
        fill="${C.accent}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${
          isDouble
            ? 16
            : 13
        }"
        font-weight="900"
      >+ ещё ${hidden} направлен${
        hidden === 1
          ? "ие"
          : "ия"
      }</text>
    `;

    currentY +=
      isDouble
        ? 28
        : 24;
  }

  return {
    svg,

    height:
      currentY -
      y -
      gap
  };
}


// ==========================================
// РАСПИСАНИЕ — 2 / 3 ТРЕНЕРА
// ==========================================

function renderCompactSchedule(
  rows,
  x,
  y,
  width,
  height,
  C,
  mode
) {
  const schedule =
    trainerPosterSortSchedule(
      rows || []
    );

  const isDouble =
    mode === "double";

  if (!schedule.length) {
    return `
      <rect
        x="${x}"
        y="${y}"
        width="${width}"
        height="56"
        rx="10"
        fill="${C.card2}"
        stroke="${C.line}"
        stroke-width="1.2"
      />

      <text
        x="${x + 16}"
        y="${y + 36}"
        fill="${C.muted}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${
          isDouble
            ? 16
            : 13
        }"
        font-weight="800"
      >Расписание не заполнено</text>
    `;
  }

  const headerH =
    isDouble
      ? 38
      : 32;

  const rowH =
    isDouble
      ? 46
      : 36;

  const gap =
    isDouble
      ? 7
      : 5;

  const capacity =
    Math.max(
      1,
      Math.floor(
        (
          height -
          headerH -
          7
        ) /
        (
          rowH +
          gap
        )
      )
    );

  let visible =
    schedule;

  if (
    schedule.length >
    capacity
  ) {
    const normalRows =
      Math.max(
        1,
        capacity - 1
      );

    visible = [
      ...schedule.slice(
        0,
        normalRows
      ),

      {
        day: "",
        time: "",
        direction:
          `+ ещё ${
            schedule.length -
            normalRows
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
      height="${headerH}"
      rx="9"
      fill="${C.accent}"
    />

    <text
      x="${x + 14}"
      y="${y + headerH - 11}"
      fill="${C.onAccent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${
        isDouble
          ? 13
          : 11
      }"
      font-weight="900"
    >ДЕНЬ</text>

    <text
      x="${x + 86}"
      y="${y + headerH - 11}"
      fill="${C.onAccent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${
        isDouble
          ? 13
          : 11
      }"
      font-weight="900"
    >ВРЕМЯ</text>

    <text
      x="${x + 190}"
      y="${y + headerH - 11}"
      fill="${C.onAccent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${
        isDouble
          ? 13
          : 11
      }"
      font-weight="900"
    >НАПРАВЛЕНИЕ</text>

    <text
      x="${x + width - 14}"
      y="${y + headerH - 11}"
      text-anchor="end"
      fill="${C.onAccent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="${
        isDouble
          ? 13
          : 11
      }"
      font-weight="900"
    >ЗАЛ</text>
  `;

  let currentY =
    y +
    headerH +
    8;

  visible.forEach(
    (
      lesson,
      index
    ) => {
      const summary =
        String(
          lesson.direction ||
          ""
        ).startsWith(
          "+"
        );

      svg += `
        <rect
          x="${x}"
          y="${currentY}"
          width="${width}"
          height="${rowH}"
          rx="9"
          fill="${
            index % 2 === 0
              ? C.card2
              : C.card
          }"
          stroke="${C.line}"
          stroke-width="1.2"
        />
      `;

      if (summary) {
        svg += `
          <text
            x="${x + 16}"
            y="${
              currentY +
              rowH / 2 +
              6
            }"
            fill="${C.accent}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="${
              isDouble
                ? 17
                : 14
            }"
            font-weight="900"
          >${esc(
            lesson.direction
          )}</text>
        `;
      } else {
        svg += `
          <text
            x="${x + 14}"
            y="${
              currentY +
              rowH / 2 +
              6
            }"
            fill="${C.accent}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="${
              isDouble
                ? 18
                : 14
            }"
            font-weight="900"
          >${esc(
            lesson.day || ""
          )}</text>

          <text
            x="${x + 86}"
            y="${
              currentY +
              rowH / 2 +
              6
            }"
            fill="${C.text}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="${
              isDouble
                ? 18
                : 14
            }"
            font-weight="900"
          >${esc(
            lesson.time || ""
          )}</text>

          <text
            x="${x + 190}"
            y="${
              currentY +
              rowH / 2 +
              6
            }"
            fill="${C.text}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="${
              isDouble
                ? 17
                : 13.5
            }"
            font-weight="800"
          >${esc(
            trainerPosterWrap(
              lesson.direction ||
              "",
              isDouble
                ? 34
                : 27
            )[0] || ""
          )}</text>

          <text
            x="${x + width - 14}"
            y="${
              currentY +
              rowH / 2 +
              6
            }"
            text-anchor="end"
            fill="${C.accent}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="${
              isDouble
                ? 16
                : 13
            }"
            font-weight="900"
          >${
            String(
              lesson.hall ||
              ""
            ).toUpperCase() ===
            "GYM"
              ? "GYM"
              : `ЗАЛ ${esc(
                  lesson.hall ||
                  ""
                )}`
          }</text>
        `;
      }

      currentY +=
        rowH +
        gap;
    }
  );

  return svg;
}


// ==========================================
// 2 / 3 ТРЕНЕРА
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

  const W =
    1240;

  const H =
    1754;

  const PAD =
    56;

  const count =
    list.length;

  const top =
    225;

  const bottom =
    1650;

  const gap =
    count === 2
      ? 26
      : 18;

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
      index
    ) => {
      const isDouble =
        count === 2;

      const cardY =
        top +
        index *
          (
            cardH +
            gap
          );

      const innerX =
        PAD + 30;

      const innerW =
        cardW - 60;

      const nameY =
        cardY +
        (
          isDouble
            ? 60
            : 48
        );

      const dividerY =
        cardY +
        (
          isDouble
            ? 88
            : 68
        );

      const directionTitleY =
        dividerY +
        (
          isDouble
            ? 36
            : 27
        );

      const dirBlock =
        renderCompactDirections(
          trainer.directions,
          innerX,
          directionTitleY + 14,
          innerW,
          C,
          isDouble
            ? "double"
            : "triple"
        );

      const scheduleTitleY =
        directionTitleY +
        14 +
        dirBlock.height +
        (
          isDouble
            ? 31
            : 21
        );

      const legendY =
        cardY +
        cardH -
        (
          isDouble
            ? 36
            : 29
        );

      const scheduleY =
        scheduleTitleY +
        14;

      const scheduleHeight =
        Math.max(
          85,
          legendY -
          scheduleY -
          18
        );

      svg += `
        <rect
          x="${PAD}"
          y="${cardY}"
          width="${cardW}"
          height="${cardH}"
          rx="23"
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
          y="${nameY}"
          fill="${C.accent}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${
            isDouble
              ? 21
              : 17
          }"
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
          font-family="Arial, Helvetica, sans-serif"
          font-size="${
            isDouble
              ? 42
              : 34
          }"
          font-weight="900"
        >${esc(
          String(
            trainer.name ||
            ""
          ).toUpperCase()
        )}</text>

        <text
          x="${PAD + cardW - 30}"
          y="${nameY - 2}"
          text-anchor="end"
          fill="${C.accent}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${
            isDouble
              ? 22
              : 18
          }"
          font-weight="900"
        >${esc(
          trainer.phone ||
          ""
        )}</text>

        <line
          x1="${innerX}"
          y1="${dividerY}"
          x2="${PAD + cardW - 30}"
          y2="${dividerY}"
          stroke="${C.line}"
          stroke-width="1.5"
        />

        <text
          x="${innerX}"
          y="${directionTitleY}"
          fill="${C.muted}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${
            isDouble
              ? 18
              : 15
          }"
          font-weight="900"
          letter-spacing="2"
        >НАПРАВЛЕНИЯ</text>

        ${dirBlock.svg}

        <text
          x="${innerX}"
          y="${scheduleTitleY}"
          fill="${C.muted}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${
            isDouble
              ? 18
              : 15
          }"
          font-weight="900"
          letter-spacing="2"
        >РАСПИСАНИЕ</text>

        ${renderCompactSchedule(
          trainer.schedule,
          innerX,
          scheduleY,
          innerW,
          scheduleHeight,
          C,
          isDouble
            ? "double"
            : "triple"
        )}

        <text
          x="${innerX}"
          y="${legendY}"
          fill="${C.muted}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="${
            isDouble
              ? 13
              : 11
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
    Object.keys(
      grouped
    )
      .sort(
        (
          a,
          b
        ) =>
          trainerPosterDayOrder(a) -
          trainerPosterDayOrder(b)
      );

  const left = [];
  const right = [];

  let leftWeight =
    0;

  let rightWeight =
    0;

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
      left.push(day);

      leftWeight +=
        weight;
    } else {
      right.push(day);

      rightWeight +=
        weight;
    }
  }

  const columnGap =
    24;

  const columnWidth =
    (
      W -
      PAD * 2 -
      columnGap
    ) / 2;

  const top =
    235;

  const bottom =
    1580;

  function renderWeekColumn(
    dayList,
    x
  ) {
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
          height="42"
          rx="10"
          fill="${C.accent}"
        />

        <text
          x="${x + 16}"
          y="${currentY + 29}"
          fill="${C.onAccent}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="20"
          font-weight="900"
        >${esc(day)}</text>

        <text
          x="${x + columnWidth - 16}"
          y="${currentY + 29}"
          text-anchor="end"
          fill="${C.onAccent}"
          font-family="Arial, Helvetica, sans-serif"
          font-size="13"
          font-weight="900"
        >${lessons.length} ЗАН.</text>
      `;

      currentY +=
        49;

      const rowH =
        42;

      for (
        let i = 0;
        i < lessons.length;
        i++
      ) {
        if (
          currentY +
          rowH >
          bottom
        ) {
          svg += `
            <text
              x="${x + 14}"
              y="${currentY + 26}"
              fill="${C.accent}"
              font-family="Arial, Helvetica, sans-serif"
              font-size="17"
              font-weight="900"
            >+ ещё ${
              lessons.length -
              i
            } занятий</text>
          `;

          currentY +=
            38;

          break;
        }

        const lesson =
          lessons[i];

        const direction =
          trainerPosterWrap(
            lesson.direction ||
            "",
            17
          )[0] || "";

        const trainer =
          trainerPosterWrap(
            lesson.trainer_name ||
            "",
            13
          )[0] || "";

        svg += `
          <rect
            x="${x}"
            y="${currentY}"
            width="${columnWidth}"
            height="${rowH - 5}"
            rx="8"
            fill="${
              i % 2 === 0
                ? C.card
                : C.card2
            }"
            stroke="${C.line}"
            stroke-width="1.1"
          />

          <text
            x="${x + 13}"
            y="${currentY + 27}"
            fill="${C.accent}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="17"
            font-weight="900"
          >${esc(
            lesson.time ||
            ""
          )}</text>

          <text
            x="${x + 92}"
            y="${currentY + 27}"
            fill="${C.text}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="16"
            font-weight="900"
          >${esc(direction)}</text>

          <text
            x="${x + 285}"
            y="${currentY + 27}"
            fill="${C.muted}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="14"
            font-weight="800"
          >${esc(trainer)}</text>

          <text
            x="${x + columnWidth - 13}"
            y="${currentY + 27}"
            text-anchor="end"
            fill="${C.accent}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="15"
            font-weight="900"
          >${
            String(
              lesson.hall ||
              ""
            ).toUpperCase() ===
            "GYM"
              ? "GYM"
              : `ЗАЛ ${esc(
                  lesson.hall ||
                  ""
                )}`
          }</text>
        `;

        currentY +=
          rowH;
      }

      currentY +=
        10;
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

      ${trainerPosterHeader(
        C,
        "ОБЩЕЕ РАСПИСАНИЕ",
        "ГРУППОВЫЕ ТРЕНИРОВКИ"
      )}

      ${renderWeekColumn(
        left,
        PAD
      )}

      ${renderWeekColumn(
        right,
        PAD +
        columnWidth +
        columnGap
      )}

      <text
        x="56"
        y="1635"
        fill="${C.muted}"
        font-family="Arial, Helvetica, sans-serif"
        font-size="14"
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
// БЛОК 3
// ГЛАВНЫЙ WEBHOOK
// ==========================================

module.exports = async function webhook(
  req,
  res
) {
  try {

    // ======================================
    // HEALTH CHECK / GET
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
    // DATABASE
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
    // ВЫБОР КОЛИЧЕСТВА ТРЕНЕРОВ
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
    // ПОДТВЕРЖДЕНИЕ УДАЛЕНИЯ ТРЕНЕРА
    // ======================================

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
          .json({
            ok: true
          });
      }


      await sendMessage(
        chat,

        "⚠️ УДАЛЕНИЕ ТРЕНЕРА\n\n" +
        `${trainer.name}\n` +
        `${trainer.phone || ""}\n\n` +
        "Будут также удалены его направления и расписание.\n\n" +
        "Удалить тренера?",

        [
          [
            {
              text:
                "🗑 Да, удалить",

              callback_data:
                `delete_trainer:${trainerId}`
            }
          ],

          [
            {
              text:
                "↩️ Отмена",

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


    // ======================================
    // УДАЛЕНИЕ ТРЕНЕРА
    // ======================================

    if (
      data.startsWith(
        "delete_trainer:"
      )
    ) {
      const trainerId =
        Number(
          data.split(":")[1]
        );


      const deleted =
        await sql`
          DELETE FROM trainers

          WHERE id =
            ${trainerId}

          RETURNING
            name
        `;


      await clearState(
        chat
      );


      if (
        !deleted.length
      ) {
        await sendMessage(
          chat,

          "Тренер уже удалён или не найден.",

          [
            [
              {
                text:
                  "👤 К списку тренеров",

                callback_data:
                  "admin_trainers"
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

        `✅ Тренер «${deleted[0].name}» удалён.\n\n` +
        "Его расписание и направления также удалены.",

        [
          [
            {
              text:
                "👤 К списку тренеров",

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
    // ОБЩЕЕ РАСПИСАНИЕ
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
    // ОБЩЕЕ РАСПИСАНИЕ — Ч/Б
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


    return res
      .status(200)
      .json({
        ok: false,
        error:
          "Internal server error"
      });
  }
};
