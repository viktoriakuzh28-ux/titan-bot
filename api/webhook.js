// ============================================================
// БЛОК 1
// ТИТАН BOT
// БАЗА ДАННЫХ · TELEGRAM · СОСТОЯНИЯ · АДМИНКА
// ============================================================

const { neon } = require("@neondatabase/serverless");
const QRCode = require("qrcode");

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TOKEN) {
  throw new Error("TELEGRAM_BOT_TOKEN is not configured");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured");
}

const TG = `https://api.telegram.org/bot${TOKEN}`;
const sql = neon(process.env.DATABASE_URL);


// ============================================================
// TELEGRAM API
// ============================================================

async function api(method, payload = {}) {

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

  const data = await response.json();

  if (!data.ok) {
    throw new Error(
      `${method}: ${JSON.stringify(data)}`
    );
  }

  return data.result;
}


async function sendMessage(
  chat,
  text,
  keyboard = null
) {

  const payload = {
    chat_id: chat,
    text,
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
// XML / SVG ESCAPE
// ============================================================

function esc(value) {

  return String(
    value ?? ""
  )
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
      chat_id TEXT PRIMARY KEY,
      action TEXT,
      trainer_id INTEGER,
      item_id INTEGER,
      data JSONB DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Обновление старой таблицы bot_state
  // Эти команды безопасны: существующие данные не удаляются.

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


  const countRows =
    await sql`
      SELECT COUNT(*)::int AS count
      FROM trainers
    `;


  const count =
    Number(
      countRows[0]?.count || 0
    );


  if (count === 0) {
    await seedDatabase();
  }
}


// ============================================================
// НАЧАЛЬНЫЕ ДАННЫЕ
// Заполняются только если таблица trainers пустая.
// Существующие данные пользователя не перезаписываются.
// ============================================================

async function seedDatabase() {

  // ----------------------------------------------------------
  // 1. ЖИЖИНА ЭЛЬВИРА
  // ----------------------------------------------------------

  const [zhizhina] =
    await sql`
      INSERT INTO trainers
        (name, phone, sort_order)
      VALUES
        (
          'Жижина Эльвира',
          '+7 (904) 278-52-01',
          1
        )
      RETURNING id
    `;


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
        ${zhizhina.id},
        'Хатха-йога',
        'Спокойная практика: гибкость, укрепление тела и снятие стресса.',
        1
      ),
      (
        ${zhizhina.id},
        'Йога в гамаках',
        'Практика в гамаках: мобильность, разгрузка и контроль тела.',
        2
      )
  `;


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
        ${zhizhina.id},
        'СР',
        '07:30',
        'Хатха-йога',
        '5',
        1
      ),
      (
        ${zhizhina.id},
        'СР',
        '09:00',
        'Йога в гамаках',
        '2',
        2
      ),
      (
        ${zhizhina.id},
        'ПТ',
        '07:30',
        'Хатха-йога',
        '5',
        3
      ),
      (
        ${zhizhina.id},
        'ПТ',
        '09:00',
        'Йога в гамаках',
        '2',
        4
      )
  `;


  // ----------------------------------------------------------
  // 2. ФРОЛОВА ЕКАТЕРИНА
  // ----------------------------------------------------------

  const [frolova] =
    await sql`
      INSERT INTO trainers
        (name, phone, sort_order)
      VALUES
        (
          'Фролова Екатерина',
          '+7 (988) 095-26-91',
          2
        )
      RETURNING id
    `;


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
        ${frolova.id},
        'Кундалини-йога',
        'Практика для развития осознанности и гармонизации тела и ума.',
        1
      )
  `;


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
        ${frolova.id},
        'СБ',
        '08:00',
        'Кундалини-йога',
        '5',
        1
      )
  `;


  // ----------------------------------------------------------
  // 3. ЗОРИНА АННА
  // ----------------------------------------------------------

  const [zorina] =
    await sql`
      INSERT INTO trainers
        (name, phone, sort_order)
      VALUES
        (
          'Зорина Анна',
          '+7 912 855-31-91',
          3
        )
      RETURNING id
    `;


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
        ${zorina.id},
        'Йога',
        'Практика для развития гибкости, баланса, силы и осознанности.',
        1
      )
  `;


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
        ${zorina.id},
        'ПН',
        '09:00',
        'Йога',
        '5',
        1
      ),
      (
        ${zorina.id},
        'ВС',
        '15:00–19:00',
        'Йога',
        '2',
        2
      )
  `;


  // ----------------------------------------------------------
  // 4. ЧУПИНА СВЕТЛАНА
  // ----------------------------------------------------------

  const [chupina] =
    await sql`
      INSERT INTO trainers
        (name, phone, sort_order)
      VALUES
        (
          'Чупина Светлана',
          '+7 982 828-38-27',
          4
        )
      RETURNING id
    `;


  const chupinaDirections = [
    [
      "TRX",
      "Функциональная тренировка с использованием подвесных петель."
    ],
    [
      "Силовой фитнес",
      "Силовая тренировка для развития мышц, выносливости и тонуса."
    ],
    [
      "Растяжка",
      "Работа над гибкостью, мобильностью и восстановлением."
    ],
    [
      "Мышечно-суставная гимнастика",
      "Комплекс упражнений для мобильности суставов и комфортного движения."
    ],
    [
      "Фитнес-йога",
      "Сочетание элементов йоги и функциональной физической нагрузки."
    ]
  ];


  for (
    let i = 0;
    i < chupinaDirections.length;
    i++
  ) {

    const [
      name,
      description
    ] = chupinaDirections[i];


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
          ${chupina.id},
          ${name},
          ${description},
          ${i + 1}
        )
    `;
  }


  // ----------------------------------------------------------
  // 5. ФЕДОРЕНКО ОЛЬГА
  // ----------------------------------------------------------

  const [fedorenko] =
    await sql`
      INSERT INTO trainers
        (name, phone, sort_order)
      VALUES
        (
          'Федоренко Ольга',
          '+7 904 247-08-15',
          5
        )
      RETURNING id
    `;


  const fedorenkoDirections = [
    [
      "Силовой тренинг",
      "Силовая работа для развития мышц, выносливости и общей физической формы."
    ],
    [
      "Кроссфит",
      "Интенсивная функциональная тренировка с сочетанием силовых и кардиоэлементов."
    ],
    [
      "Функционал",
      "Функциональная тренировка для силы, координации и выносливости."
    ],
    [
      "Тренажерный зал",
      "Персональная работа в тренажёрном зале."
    ]
  ];


  for (
    let i = 0;
    i < fedorenkoDirections.length;
    i++
  ) {

    const [
      name,
      description
    ] = fedorenkoDirections[i];


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
          ${fedorenko.id},
          ${name},
          ${description},
          ${i + 1}
        )
    `;
  }


  // ----------------------------------------------------------
  // 6. ИЖБОЛДИНА НАТАЛЬЯ
  // ----------------------------------------------------------

  const [izhboldina] =
    await sql`
      INSERT INTO trainers
        (name, phone, sort_order)
      VALUES
        (
          'Ижболдина Наталья',
          '+7 982 837-57-69',
          6
        )
      RETURNING id
    `;


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
        ${izhboldina.id},
        'Динамическая растяжка',
        'Активная работа над гибкостью, мобильностью и свободой движения.',
        1
      )
  `;


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
        ${izhboldina.id},
        'ВТ',
        '19:00',
        'Динамическая растяжка',
        '5',
        1
      ),
      (
        ${izhboldina.id},
        'ЧТ',
        '19:00',
        'Динамическая растяжка',
        '5',
        2
      ),
      (
        ${izhboldina.id},
        'ВС',
        '11:00',
        'Динамическая растяжка',
        '5',
        3
      )
  `;


  // ----------------------------------------------------------
  // 7. СОЛОДОВА АЛЁНА
  // ----------------------------------------------------------

  const [solodova] =
    await sql`
      INSERT INTO trainers
        (name, phone, sort_order)
      VALUES
        (
          'Солодова Алёна',
          '+7 982 127-49-22',
          7
        )
      RETURNING id
    `;


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
        ${solodova.id},
        'Джампинг',
        'Кардиотренировка на мини-батутах: энергия, координация и выносливость.',
        1
      )
  `;


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
        ${solodova.id},
        'ВТ',
        '18:00',
        'Джампинг',
        '3',
        1
      ),
      (
        ${solodova.id},
        'ЧТ',
        '18:00',
        'Джампинг',
        '3',
        2
      )
  `;


  // ----------------------------------------------------------
  // 8. КУШНИР АННА
  // ----------------------------------------------------------

  const [kushnir] =
    await sql`
      INSERT INTO trainers
        (name, phone, sort_order)
      VALUES
        (
          'Кушнир Анна',
          '+7 912 769-85-05',
          8
        )
      RETURNING id
    `;


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
        ${kushnir.id},
        'Силовой тренинг',
        'Силовая работа для развития мышц и общей физической формы.',
        1
      ),
      (
        ${kushnir.id},
        'Функционал',
        'Функциональная тренировка на силу, координацию и выносливость.',
        2
      )
  `;


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
        ${kushnir.id},
        'СР',
        '18:00',
        'Силовой тренинг',
        '2',
        1
      ),
      (
        ${kushnir.id},
        'ПТ',
        '18:00',
        'Функционал',
        '1',
        2
      ),
      (
        ${kushnir.id},
        'ВС',
        '11:00',
        'Функционал',
        '1',
        3
      )
  `;


  // ----------------------------------------------------------
  // 9. ВАСИЛЬЧЕВСКАЯ ЕВГЕНИЯ
  // ----------------------------------------------------------

  const [vasilchevskaya] =
    await sql`
      INSERT INTO trainers
        (name, phone, sort_order)
      VALUES
        (
          'Васильчевская Евгения',
          '+7 (914) 936-82-32',
          9
        )
      RETURNING id
    `;


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
        ${vasilchevskaya.id},
        'Зумба',
        'Танцевальная кардиотренировка под энергичную музыку.',
        1
      )
  `;


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
        ${vasilchevskaya.id},
        'ПТ',
        '18:30',
        'Зумба',
        '3',
        1
      )
  `;
}


// ============================================================
// ПОЛУЧЕНИЕ ДАННЫХ
// ============================================================

async function getTrainers() {

  return sql`
    SELECT
      id,
      name,
      phone,
      sort_order
    FROM trainers
    ORDER BY
      sort_order,
      name,
      id
  `;
}


async function getTrainer(
  trainerId
) {

  const rows =
    await sql`
      SELECT
        id,
        name,
        phone,
        sort_order
      FROM trainers
      WHERE id = ${trainerId}
      LIMIT 1
    `;


  if (!rows.length) {
    return null;
  }


  const trainer = rows[0];


  trainer.directions =
    await sql`
      SELECT
        id,
        name,
        description,
        sort_order
      FROM directions
      WHERE trainer_id = ${trainerId}
      ORDER BY
        sort_order,
        id
    `;


  trainer.schedule =
    await sql`
      SELECT
        id,
        day,
        time,
        direction,
        hall,
        sort_order
      FROM schedule
      WHERE trainer_id = ${trainerId}
      ORDER BY
        sort_order,
        id
    `;


  return trainer;
}


async function getTrainersByIds(
  ids
) {

  const result = [];


  for (const id of ids) {

    const trainer =
      await getTrainer(
        Number(id)
      );


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
      t.sort_order,
      s.sort_order,
      s.id
  `;
}


// ============================================================
// СОСТОЯНИЯ
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

  const rows =
    await sql`
      SELECT
        chat_id,
        action,
        trainer_id,
        item_id,
        data
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

  if (!state) {
    return {};
  }


  if (
    state.data &&
    typeof state.data === "object"
  ) {
    return state.data;
  }


  try {

    return JSON.parse(
      state.data || "{}"
    );

  } catch {

    return {};
  }
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
        text: "👤 Тренеры",
        callback_data: "trainers"
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


async function trainerKeyboard(
  callbackPrefix
) {

  const trainers =
    await getTrainers();


  const keyboard =
    trainers.map(
      (trainer) => [

        {
          text: trainer.name,
          callback_data:
            `${callbackPrefix}:${trainer.id}`
        }

      ]
    );


  if (
    callbackPrefix ===
    "admin_trainer"
  ) {

    keyboard.push([

      {
        text: "➕ Добавить тренера",
        callback_data: "add_trainer"
      }

    ]);


    keyboard.push([

      {
        text: "⬅️ Назад",
        callback_data: "admin"
      }

    ]);
  }


  return keyboard;
}


async function trainerSelectionKeyboard(
  callbackPrefix,
  selected = []
) {

  const trainers =
    await getTrainers();


  const selectedIds =
    selected.map(Number);


  return trainers.map(
    (trainer) => [

      {
        text:
          selectedIds.includes(
            Number(trainer.id)
          )
            ? `✅ ${trainer.name}`
            : trainer.name,

        callback_data:
          `${callbackPrefix}:${trainer.id}`
      }

    ]
  );
}


// ============================================================
// АДМИНКА
// ============================================================

async function showAdmin(chat) {

  await clearState(chat);


  await sendMessage(

    chat,

    "⚙️ АДМИНКА «ТИТАН»\n\nЧто редактируем?",

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
          text: "🏠 В меню",
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

    await sendMessage(
      chat,
      "Тренер не найден."
    );

    return;
  }


  await sendMessage(

    chat,

    `👤 ${trainer.name}\n\n📞 ${trainer.phone || "—"}\n\nНаправлений: ${trainer.directions.length}\nЗанятий в расписании: ${trainer.schedule.length}`,

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
          text: "🏋️ Направления",
          callback_data:
            `admin_directions:${trainer.id}`
        }
      ],

      [
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
          text: "🏠 В меню",
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

    await sendMessage(
      chat,
      "Тренер не найден."
    );

    return;
  }


  const keyboard =
    trainer.schedule.map(
      (lesson) => [

        {
          text:
            `${lesson.day} · ${lesson.time} · ${lesson.direction} · ${
              String(lesson.hall).toUpperCase() === "GYM"
                ? "GYM"
                : `зал ${lesson.hall}`
            }`,

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

    `📅 РАСПИСАНИЕ\n\n${trainer.name}`,

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

    await sendMessage(
      chat,
      "Занятие не найдено."
    );

    return;
  }


  const lesson = rows[0];


  await sendMessage(

    chat,

    `📅 ЗАНЯТИЕ

${lesson.trainer_name}

День: ${lesson.day}
Время: ${lesson.time}
Направление: ${lesson.direction}
Зал: ${lesson.hall}`,

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
        },

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
          text: "⬅️ Назад",
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

    `🏋️ НАПРАВЛЕНИЯ\n\n${trainer.name}`,

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

    `🏋️ ${direction.name}

Тренер: ${direction.trainer_name}

${direction.description || "Описание не указано."}`,

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
// ЗАЛ
// ============================================================

function normalizeHall(value) {

  const text =
    String(value || "")
      .trim()
      .toUpperCase();


  if (
    text === "GYM" ||
    text.includes("ТРЕНАЖ")
  ) {

    return "GYM";
  }


  const number =
    text.match(/\d+/)?.[0];


  if (
    ["1", "2", "3", "5"].includes(
      number
    )
  ) {

    return number;
  }


  return String(value || "").trim();
}


// ============================================================
// ОБРАБОТКА ТЕКСТА ПОСЛЕ КНОПОК АДМИНКИ
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


  if (!value) {

    await sendMessage(
      chat,
      "Введите значение текстом."
    );

    return true;
  }


  // ----------------------------------------------------------
  // ИМЯ
  // ----------------------------------------------------------

  if (
    state.action ===
    "edit_name"
  ) {

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


  // ----------------------------------------------------------
  // ТЕЛЕФОН
  // ----------------------------------------------------------

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
        name: value
      }
    );


    await sendMessage(
      chat,
      "Теперь введите номер телефона тренера:"
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

    const data =
      stateData(state);


    const maxRows =
      await sql`
        SELECT
          COALESCE(
            MAX(sort_order),
            0
          )::int AS max
        FROM trainers
      `;


    const sortOrder =
      Number(
        maxRows[0]?.max || 0
      ) + 1;


    const inserted =
      await sql`
        INSERT INTO trainers
          (
            name,
            phone,
            sort_order
          )
        VALUES
          (
            ${data.name || "Новый тренер"},
            ${value},
            ${sortOrder}
          )
        RETURNING id
      `;


    await clearState(chat);


    await sendMessage(
      chat,
      "✅ Тренер добавлен."
    );


    await showTrainerAdmin(
      chat,
      inserted[0].id
    );


    return true;
  }


  // ----------------------------------------------------------
  // РЕДАКТИРОВАНИЕ ЗАНЯТИЯ
  // ----------------------------------------------------------

  if (
    state.action ===
    "lesson_day"
  ) {

    const day =
      value.toUpperCase();


    const validDays =
      [
        "ПН",
        "ВТ",
        "СР",
        "ЧТ",
        "ПТ",
        "СБ",
        "ВС"
      ];


    if (
      !validDays.includes(day)
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
      WHERE id = ${state.item_id}
    `;


    const itemId =
      state.item_id;


    await clearState(chat);


    await sendMessage(
      chat,
      "✅ День изменён."
    );


    await showLessonAdmin(
      chat,
      itemId
    );


    return true;
  }


  if (
    state.action ===
    "lesson_time"
  ) {

    await sql`
      UPDATE schedule
      SET time = ${value}
      WHERE id = ${state.item_id}
    `;


    const itemId =
      state.item_id;


    await clearState(chat);


    await sendMessage(
      chat,
      "✅ Время изменено."
    );


    await showLessonAdmin(
      chat,
      itemId
    );


    return true;
  }


  if (
    state.action ===
    "lesson_direction"
  ) {

    await sql`
      UPDATE schedule
      SET direction = ${value}
      WHERE id = ${state.item_id}
    `;


    const itemId =
      state.item_id;


    await clearState(chat);


    await sendMessage(
      chat,
      "✅ Направление изменено."
    );


    await showLessonAdmin(
      chat,
      itemId
    );


    return true;
  }


  if (
    state.action ===
    "lesson_hall"
  ) {

    const hall =
      normalizeHall(value);


    await sql`
      UPDATE schedule
      SET hall = ${hall}
      WHERE id = ${state.item_id}
    `;


    const itemId =
      state.item_id;


    await clearState(chat);


    await sendMessage(
      chat,
      "✅ Зал изменён."
    );


    await showLessonAdmin(
      chat,
      itemId
    );


    return true;
  }


  // ----------------------------------------------------------
  // ДОБАВЛЕНИЕ ЗАНЯТИЯ
  // ----------------------------------------------------------

  if (
    state.action ===
    "add_lesson_day"
  ) {

    const day =
      value.toUpperCase();


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
      "Введите время, например 18:30:"
    );


    return true;
  }


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
      "Введите зал: 1, 2, 3, 5 или «Тренажерный зал»:"
    );


    return true;
  }


  if (
    state.action ===
    "add_lesson_hall"
  ) {

    const data =
      stateData(state);


    const maxRows =
      await sql`
        SELECT
          COALESCE(
            MAX(sort_order),
            0
          )::int AS max
        FROM schedule
        WHERE trainer_id = ${state.trainer_id}
      `;


    const sortOrder =
      Number(
        maxRows[0]?.max || 0
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
          ${normalizeHall(value)},
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


  // ----------------------------------------------------------
  // РЕДАКТИРОВАНИЕ НАПРАВЛЕНИЯ
  // ----------------------------------------------------------

  if (
    state.action ===
    "direction_name"
  ) {

    await sql`
      UPDATE directions
      SET name = ${value}
      WHERE id = ${state.item_id}
    `;


    const itemId =
      state.item_id;


    await clearState(chat);


    await sendMessage(
      chat,
      "✅ Название изменено."
    );


    await showDirectionAdmin(
      chat,
      itemId
    );


    return true;
  }


  if (
    state.action ===
    "direction_desc"
  ) {

    await sql`
      UPDATE directions
      SET description = ${value}
      WHERE id = ${state.item_id}
    `;


    const itemId =
      state.item_id;


    await clearState(chat);


    await sendMessage(
      chat,
      "✅ Описание изменено."
    );


    await showDirectionAdmin(
      chat,
      itemId
    );


    return true;
  }


  // ----------------------------------------------------------
  // ДОБАВЛЕНИЕ НАПРАВЛЕНИЯ
  // ----------------------------------------------------------

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
        name: value
      }
    );


    await sendMessage(
      chat,
      "Введите описание направления:"
    );


    return true;
  }


  if (
    state.action ===
    "add_direction_desc"
  ) {

    const data =
      stateData(state);


    const maxRows =
      await sql`
        SELECT
          COALESCE(
            MAX(sort_order),
            0
          )::int AS max
        FROM directions
        WHERE trainer_id = ${state.trainer_id}
      `;


    const sortOrder =
      Number(
        maxRows[0]?.max || 0
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
//
// СРАЗУ ПОСЛЕ ЭТОГО КОММЕНТАРИЯ БУДЕТ БЛОК 2.
// НИЧЕГО НЕ КОММИТИМ, ПОКА НЕ ВСТАВИМ ВСЕ 3 БЛОКА.
// ============================================================
// ============================================================
// БЛОК 2
// ТИТАН — ГЕНЕРАТОР A4
// 1 / 2 / 3 ТРЕНЕРА + ОБЩЕЕ РАСПИСАНИЕ
// ВСТРОЕННЫЙ QR
// ============================================================

const TITAN_QR_URL = "https://t.me/Titannt_bot";


// ============================================================
// QR
// ============================================================

async function getTitanQrDataUrl() {

  return QRCode.toDataURL(
    TITAN_QR_URL,
    {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 420,
      color: {
        dark: "#000000",
        light: "#FFFFFF"
      }
    }
  );
}


// ============================================================
// ЦВЕТОВАЯ ТЕМА
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
// СОРТИРОВКА
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
// ТЕКСТОВЫЕ ФУНКЦИИ
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
// ПОДВАЛ
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
// QR НА КАРТОЧКЕ
// ============================================================

function renderTrainerQr(
  x,
  y,
  size,
  C,
  qrDataUrl,
  showLabel = true
) {

  return `

  ${
    showLabel
      ? `

        <text
          x="${x - 18}"
          y="${y + size / 2 - 9}"
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
    href="${qrDataUrl}"
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
  maxWidth = 800
) {

  const fontSize =
    mode === "single"
      ? 20
      : mode === "double"
        ? 18
        : 14;


  const lineGap =
    mode === "single"
      ? 29
      : mode === "double"
        ? 27
        : 21;


  const lines = [

    "1 — КРОССФИТ / БОКС · 2 — TRX / АНТИГРАВИТИ",

    "3 — СИЛОВОЙ ТРЕНИНГ · 5 — ЙОГА / АЭРОЙОГА",

    "GYM — ТРЕНАЖЕРНЫЙ ЗАЛ"

  ];


  let svg = `

  <line
    x1="${x}"
    y1="${y - 19}"
    x2="${x + maxWidth}"
    y2="${y - 19}"
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
        y="${y + 30}"
        fill="${C.muted}"
        font-family="Arial, sans-serif"
        font-size="19"
        font-weight="700"
      >Направления пока не указаны</text>

      `,

      height: 50
    };
  }


  // ==========================================================
  // ОДИН ТРЕНЕР
  // ==========================================================

  if (mode === "single") {

    let svg = "";
    let currentY = y;


    for (const direction of list) {

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
        108 +
        Math.max(
          0,
          nameLines.length - 1
        ) * 26 +
        Math.max(
          0,
          descLines.length - 1
        ) * 22;


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
            y="${currentY + 36 + lineIndex * 27}"
            fill="${C.accent}"
            font-family="Arial, sans-serif"
            font-size="27"
            font-weight="900"
          >${esc(line)}</text>

          `;
        }
      );


      const descStart =
        currentY +
        73 +
        Math.max(
          0,
          nameLines.length - 1
        ) * 26;


      descLines.forEach(
        (line, lineIndex) => {

          svg += `

          <text
            x="${x + 24}"
            y="${descStart + lineIndex * 22}"
            fill="${C.text}"
            font-family="Arial, sans-serif"
            font-size="19"
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
      height: currentY - y
    };
  }


  // ==========================================================
  // ДВА ТРЕНЕРА
  // ==========================================================

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
        ? 30
        : count <= 4
          ? 26
          : 22;


    const descSize =
      count <= 2
        ? 21
        : count <= 4
          ? 18
          : 16;


    const cardHeight =
      count <= 2
        ? 100
        : count <= 4
          ? 90
          : 80;


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
            (
              columnWidth +
              gap
            );


        const cardY =
          y +
          row *
            (
              cardHeight +
              10
            );


        const title =
          posterCut(
            String(
              direction.name || ""
            ).toUpperCase(),
            columns === 1
              ? 54
              : 27
          );


        const description =
          posterCut(
            direction.description || "",
            columns === 1
              ? 100
              : 48
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
          x="${cardX + 20}"
          y="${cardY + 38}"
          fill="${C.accent}"
          font-family="Arial, sans-serif"
          font-size="${titleSize}"
          font-weight="900"
        >${esc(title)}</text>

        <text
          x="${cardX + 20}"
          y="${cardY + 72}"
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


  // ==========================================================
  // ТРИ ТРЕНЕРА
  // ==========================================================

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
    height: currentY - y
  };
}


// ============================================================
// РАСПИСАНИЕ ТРЕНЕРА
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
      font-size="19"
      font-weight="700"
    >Расписание пока не добавлено</text>

    `;
  }


  // ==========================================================
  // ДВА ТРЕНЕРА — ОСНОВНОЙ РЕЖИМ
  // ==========================================================

  if (mode === "double") {

    const headerHeight = 48;
    const gap = 7;


    const availableRowsHeight =
      Math.max(
        70,
        maxHeight -
          headerHeight -
          8
      );


    const calculatedRowHeight =
      Math.floor(
        (
          availableRowsHeight -
          gap *
            Math.max(
              0,
              schedule.length - 1
            )
        ) /
        Math.max(
          1,
          schedule.length
        )
      );


    // --------------------------------------------------------
    // Если занятий много — две колонки.
    // Ничего не скрываем.
    // --------------------------------------------------------

    if (
      calculatedRowHeight < 38 &&
      schedule.length > 7
    ) {

      const columnGap = 16;

      const columnWidth =
        (
          width -
          columnGap
        ) / 2;


      const splitAt =
        Math.ceil(
          schedule.length / 2
        );


      const columns = [

        schedule.slice(
          0,
          splitAt
        ),

        schedule.slice(
          splitAt
        )

      ];


      let svg = "";


      columns.forEach(
        (
          columnRows,
          columnIndex
        ) => {

          const columnX =
            x +
            columnIndex *
              (
                columnWidth +
                columnGap
              );


          const localAvailable =
            Math.max(
              70,
              maxHeight -
                headerHeight -
                8
            );


          const localRowHeight =
            Math.max(
              34,
              Math.min(
                50,
                Math.floor(
                  (
                    localAvailable -
                    gap *
                      Math.max(
                        0,
                        columnRows.length - 1
                      )
                  ) /
                  Math.max(
                    1,
                    columnRows.length
                  )
                )
              )
            );


          svg += `

          <rect
            x="${columnX}"
            y="${y}"
            width="${columnWidth}"
            height="${headerHeight}"
            rx="10"
            fill="${C.accent}"
          />

          <text
            x="${columnX + 12}"
            y="${y + 31}"
            fill="${C.onAccent}"
            font-family="Arial, sans-serif"
            font-size="14"
            font-weight="900"
          >ДЕНЬ</text>

          <text
            x="${columnX + 72}"
            y="${y + 31}"
            fill="${C.onAccent}"
            font-family="Arial, sans-serif"
            font-size="14"
            font-weight="900"
          >ВРЕМЯ</text>

          <text
            x="${columnX + 165}"
            y="${y + 31}"
            fill="${C.onAccent}"
            font-family="Arial, sans-serif"
            font-size="14"
            font-weight="900"
          >НАПРАВЛЕНИЕ</text>

          <text
            x="${columnX + columnWidth - 12}"
            y="${y + 31}"
            text-anchor="end"
            fill="${C.onAccent}"
            font-family="Arial, sans-serif"
            font-size="14"
            font-weight="900"
          >ЗАЛ</text>

          `;


          let currentY =
            y +
            headerHeight +
            8;


          columnRows.forEach(
            (
              lesson,
              index
            ) => {

              svg += `

              <rect
                x="${columnX}"
                y="${currentY}"
                width="${columnWidth}"
                height="${localRowHeight}"
                rx="8"
                fill="${
                  index % 2
                    ? C.card
                    : C.card2
                }"
                stroke="${C.line}"
                stroke-width="1.2"
              />

              <text
                x="${columnX + 12}"
                y="${
                  currentY +
                  localRowHeight / 2 +
                  6
                }"
                fill="${C.accent}"
                font-family="Arial, sans-serif"
                font-size="17"
                font-weight="900"
              >${esc(lesson.day)}</text>

              <text
                x="${columnX + 72}"
                y="${
                  currentY +
                  localRowHeight / 2 +
                  6
                }"
                fill="${C.text}"
                font-family="Arial, sans-serif"
                font-size="17"
                font-weight="900"
              >${esc(lesson.time)}</text>

              <text
                x="${columnX + 165}"
                y="${
                  currentY +
                  localRowHeight / 2 +
                  6
                }"
                fill="${C.text}"
                font-family="Arial, sans-serif"
                font-size="15"
                font-weight="800"
              >${esc(
                posterCut(
                  lesson.direction || "",
                  20
                )
              )}</text>

              <text
                x="${columnX + columnWidth - 12}"
                y="${
                  currentY +
                  localRowHeight / 2 +
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
                  : `ЗАЛ ${esc(
                      lesson.hall
                    )}`
              }</text>

              `;


              currentY +=
                localRowHeight +
                gap;
            }
          );
        }
      );


      return svg;
    }


    // --------------------------------------------------------
    // ОДНА КОЛОНКА
    // --------------------------------------------------------

    const rowHeight =
      Math.max(
        38,
        Math.min(
          62,
          calculatedRowHeight
        )
      );


    const compact =
      rowHeight < 46;


    const headerFont =
      compact
        ? 15
        : 17;


    const mainFont =
      compact
        ? 18
        : 22;


    const directionFont =
      compact
        ? 17
        : 21;


    const hallFont =
      compact
        ? 17
        : 20;


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
      y="${y + 31}"
      fill="${C.onAccent}"
      font-family="Arial, sans-serif"
      font-size="${headerFont}"
      font-weight="900"
    >ДЕНЬ</text>

    <text
      x="${x + 112}"
      y="${y + 31}"
      fill="${C.onAccent}"
      font-family="Arial, sans-serif"
      font-size="${headerFont}"
      font-weight="900"
    >ВРЕМЯ</text>

    <text
      x="${x + 302}"
      y="${y + 31}"
      fill="${C.onAccent}"
      font-family="Arial, sans-serif"
      font-size="${headerFont}"
      font-weight="900"
    >НАПРАВЛЕНИЕ</text>

    <text
      x="${x + width - 16}"
      y="${y + 31}"
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
      8;


    schedule.forEach(
      (
        lesson,
        index
      ) => {

        svg += `

        <rect
          x="${x}"
          y="${currentY}"
          width="${width}"
          height="${rowHeight}"
          rx="9"
          fill="${
            index % 2
              ? C.card
              : C.card2
          }"
          stroke="${C.line}"
          stroke-width="1.2"
        />

        <text
          x="${x + 16}"
          y="${
            currentY +
            rowHeight / 2 +
            7
          }"
          fill="${C.accent}"
          font-family="Arial, sans-serif"
          font-size="${mainFont}"
          font-weight="900"
        >${esc(lesson.day)}</text>

        <text
          x="${x + 112}"
          y="${
            currentY +
            rowHeight / 2 +
            7
          }"
          fill="${C.text}"
          font-family="Arial, sans-serif"
          font-size="${mainFont}"
          font-weight="900"
        >${esc(lesson.time)}</text>

        <text
          x="${x + 302}"
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
            39
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
            : `ЗАЛ ${esc(
                lesson.hall
              )}`
        }</text>

        `;


        currentY +=
          rowHeight +
          gap;
      }
    );


    return svg;
  }


  // ==========================================================
  // ОДИН / ТРИ ТРЕНЕРА
  // ==========================================================

  let headerHeight;
  let baseRowHeight;
  let gap;

  let headerFont;
  let mainFont;
  let directionFont;
  let hallFont;


  if (mode === "single") {

    headerHeight = 50;
    baseRowHeight = 64;
    gap = 8;

    headerFont = 17;
    mainFont = 23;
    directionFont = 21;
    hallFont = 20;

  } else {

    headerHeight = 34;
    baseRowHeight = 38;
    gap = 5;

    headerFont = 12;
    mainFont = 15;
    directionFont = 14;
    hallFont = 13;
  }


  const availableRowsHeight =
    Math.max(
      50,
      maxHeight -
        headerHeight -
        7
    );


  const calculatedRowHeight =
    Math.floor(
      (
        availableRowsHeight -
        gap *
          Math.max(
            0,
            schedule.length - 1
          )
      ) /
      Math.max(
        1,
        schedule.length
      )
    );


  const minimumRowHeight =
    mode === "single"
      ? 38
      : 26;


  const rowHeight =
    Math.max(
      minimumRowHeight,
      Math.min(
        baseRowHeight,
        calculatedRowHeight
      )
    );


  let svg = `

  <rect
    x="${x}"
    y="${y}"
    width="${width}"
    height="${headerHeight}"
    rx="9"
    fill="${C.accent}"
  />

  <text
    x="${x + 16}"
    y="${
      y +
      headerHeight / 2 +
      6
    }"
    fill="${C.onAccent}"
    font-family="Arial, sans-serif"
    font-size="${headerFont}"
    font-weight="900"
  >ДЕНЬ</text>

  <text
    x="${x + 110}"
    y="${
      y +
      headerHeight / 2 +
      6
    }"
    fill="${C.onAccent}"
    font-family="Arial, sans-serif"
    font-size="${headerFont}"
    font-weight="900"
  >ВРЕМЯ</text>

  <text
    x="${x + 300}"
    y="${
      y +
      headerHeight / 2 +
      6
    }"
    fill="${C.onAccent}"
    font-family="Arial, sans-serif"
    font-size="${headerFont}"
    font-weight="900"
  >НАПРАВЛЕНИЕ</text>

  <text
    x="${x + width - 16}"
    y="${
      y +
      headerHeight / 2 +
      6
    }"
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


  schedule.forEach(
    (
      lesson,
      index
    ) => {

      svg += `

      <rect
        x="${x}"
        y="${currentY}"
        width="${width}"
        height="${rowHeight}"
        rx="8"
        fill="${
          index % 2
            ? C.card
            : C.card2
        }"
        stroke="${C.line}"
        stroke-width="1.2"
      />

      <text
        x="${x + 16}"
        y="${
          currentY +
          rowHeight / 2 +
          6
        }"
        fill="${C.accent}"
        font-family="Arial, sans-serif"
        font-size="${mainFont}"
        font-weight="900"
      >${esc(lesson.day)}</text>

      <text
        x="${x + 110}"
        y="${
          currentY +
          rowHeight / 2 +
          6
        }"
        fill="${C.text}"
        font-family="Arial, sans-serif"
        font-size="${mainFont}"
        font-weight="900"
      >${esc(lesson.time)}</text>

      <text
        x="${x + 300}"
        y="${
          currentY +
          rowHeight / 2 +
          6
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
            : 34
        )
      )}</text>

      <text
        x="${x + width - 16}"
        y="${
          currentY +
          rowHeight / 2 +
          6
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
          : `ЗАЛ ${esc(
              lesson.hall
            )}`
      }</text>

      `;


      currentY +=
        rowHeight +
        gap;
    }
  );


  return svg;
}


// ============================================================
// ОДИН ТРЕНЕР
// ============================================================

function makePoster(
  trainer,
  themeName = "color",
  qrDataUrl = ""
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
    180;


  const scheduleHeight =
    Math.max(
      180,
      bottomZoneY -
        scheduleY -
        30
    );


  const qrSize = 130;

  const qrX =
    x +
    width -
    34 -
    qrSize;

  const qrY =
    y +
    height -
    154;


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
  >${esc(
    trainer.phone || ""
  )}</text>

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
      y + height - 120,
      C,
      "single",
      innerWidth - 320
    )
  }

  ${
    renderTrainerQr(
      qrX,
      qrY,
      qrSize,
      C,
      qrDataUrl,
      true
    )
  }

  ${trainerPosterFooter(C)}

  </svg>

  `;
}


// ============================================================
// 2 / 3 ТРЕНЕРА
// ============================================================

function makeMultiTrainerPoster(
  trainers,
  themeName = "color",
  qrDataUrl = ""
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
      themeName,
      qrDataUrl
    );
  }


  const C =
    trainerPosterTheme(
      themeName
    );


  const count =
    list.length;


  // ==========================================================
  // ГЕОМЕТРИЯ ЛИСТА
  // ==========================================================

  const pageX = 56;
  const cardWidth = 1128;

  const pageTop = 225;
  const pageBottom = 1660;


  const gap =
    count === 2
      ? 24
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


      const innerRight =
        pageX +
        cardWidth -
        28;


      const innerWidth =
        cardWidth - 56;


      // ======================================================
      // ИМЯ
      // ======================================================

      const rawName =
        String(
          trainer.name || ""
        ).toUpperCase();


      let nameFont;


      if (doubleMode) {

        if (
          rawName.length > 24
        ) {

          nameFont = 37;

        } else if (
          rawName.length > 20
        ) {

          nameFont = 41;

        } else if (
          rawName.length > 16
        ) {

          nameFont = 45;

        } else {

          nameFont = 48;
        }

      } else {

        if (
          rawName.length > 24
        ) {

          nameFont = 27;

        } else if (
          rawName.length > 19
        ) {

          nameFont = 30;

        } else {

          nameFont = 33;
        }
      }


      const numberFont =
        doubleMode
          ? 22
          : 17;


      const phoneFont =
        doubleMode
          ? 23
          : 18;


      const sectionFont =
        doubleMode
          ? 21
          : 15;


      // ======================================================
      // ВЕРХ КАРТОЧКИ
      // ======================================================

      const nameY =
        y +
        (
          doubleMode
            ? 61
            : 46
        );


      const dividerY =
        y +
        (
          doubleMode
            ? 91
            : 69
        );


      const directionTitleY =
        dividerY +
        (
          doubleMode
            ? 39
            : 27
        );


      const directionStartY =
        directionTitleY +
        (
          doubleMode
            ? 17
            : 12
        );


      // ======================================================
      // НАПРАВЛЕНИЯ
      // ======================================================

      const directionBlock =
        renderTrainerDirections(
          trainer.directions,
          innerX,
          directionStartY,
          innerWidth,
          C,
          mode
        );


      // ======================================================
      // РАСПИСАНИЕ
      // ======================================================

      const scheduleTitleY =
        directionStartY +
        directionBlock.height +
        (
          doubleMode
            ? 35
            : 21
        );


      const scheduleY =
        scheduleTitleY +
        (
          doubleMode
            ? 20
            : 14
        );


      // ======================================================
      // QR
      // ======================================================

      const qrSize =
        doubleMode
          ? 120
          : 76;


      const qrX =
        innerRight -
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


      // ======================================================
      // ЛЕГЕНДА
      // ======================================================

      const legendY =
        y +
        cardHeight -
        (
          doubleMode
            ? 93
            : 63
        );


      // ======================================================
      // СВОБОДНАЯ ВЫСОТА ПОД РАСПИСАНИЕ
      // ======================================================

      const bottomReserved =
        doubleMode
          ? 160
          : 105;


      const scheduleHeight =
        Math.max(

          doubleMode
            ? 125
            : 75,

          y +
            cardHeight -
            bottomReserved -
            scheduleY
        );


      // ======================================================
      // КАРТОЧКА
      // ======================================================

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


      <!-- НОМЕР -->

      <text
        x="${innerX}"
        y="${nameY}"
        fill="${C.accent}"
        font-family="Arial, sans-serif"
        font-size="${numberFont}"
        font-weight="900"
      >${
        String(
          index + 1
        ).padStart(
          2,
          "0"
        )
      }</text>


      <!-- ИМЯ -->

      <text
        x="${innerX + 62}"
        y="${nameY}"
        fill="${C.text}"
        font-family="Arial, sans-serif"
        font-size="${nameFont}"
        font-weight="900"
      >${esc(rawName)}</text>


      <!-- ТЕЛЕФОН -->

      <text
        x="${innerRight}"
        y="${nameY - 2}"
        text-anchor="end"
        fill="${C.accent}"
        font-family="Arial, sans-serif"
        font-size="${phoneFont}"
        font-weight="900"
      >${esc(
        trainer.phone || ""
      )}</text>


      <!-- ЛИНИЯ -->

      <line
        x1="${innerX}"
        y1="${dividerY}"
        x2="${innerRight}"
        y2="${dividerY}"
        stroke="${C.line}"
        stroke-width="1.5"
      />


      <!-- НАПРАВЛЕНИЯ -->

      <text
        x="${innerX}"
        y="${directionTitleY}"
        fill="${C.muted}"
        font-family="Arial, sans-serif"
        font-size="${sectionFont}"
        font-weight="900"
        letter-spacing="2"
      >НАПРАВЛЕНИЯ</text>


      ${directionBlock.svg}


      <!-- РАСПИСАНИЕ -->

      <text
        x="${innerX}"
        y="${scheduleTitleY}"
        fill="${C.muted}"
        font-family="Arial, sans-serif"
        font-size="${sectionFont}"
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


      <!-- ЛЕГЕНДА -->

      ${
        trainerPosterLegend(
          innerX,
          legendY,
          C,
          mode,
          doubleMode
            ? innerWidth - 365
            : innerWidth - 250
        )
      }


      <!-- QR -->

      ${
        renderTrainerQr(
          qrX,
          qrY,
          qrSize,
          C,
          qrDataUrl,
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


  for (
    const lesson of schedule
  ) {

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
      leftWeight += weight;

    } else {

      rightDays.push(day);
      rightWeight += weight;
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


      lessons.forEach(
        (
          lesson,
          index
        ) => {

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
              : `ЗАЛ ${esc(
                  lesson.hall
                )}`
          }</text>

          `;


          currentY +=
            rowHeight;
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
      `sendDocument: ${response.status} ${errorText}`
    );
  }


  return response.json();
}


// ============================================================
// ОТПРАВКА ОДНОГО ТРЕНЕРА
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


  const qrDataUrl =
    await getTitanQrDataUrl();


  const svg =
    makePoster(
      trainer,
      themeName,
      qrDataUrl
    );


  const safeName =
    String(
      trainer.name ||
      "trainer"
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
// ОТПРАВКА 2 / 3 ТРЕНЕРОВ
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


  // Генерируем QR один раз.
  // Встроенная PNG-картинка используется
  // на каждой карточке.

  const qrDataUrl =
    await getTitanQrDataUrl();


  const svg =
    makeMultiTrainerPoster(
      trainers,
      themeName,
      qrDataUrl
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

    "🖼 ТИТАН — инфографика тренеров"
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
// СРАЗУ НИЖЕ БУДЕТ БЛОК 3.
// ПОКА COMMIT НЕ НАЖИМАЙ.
// ============================================================
// ============================================================
// БЛОК 3
// ТИТАН BOT
// WEBHOOK · КНОПКИ · ГЕНЕРАЦИЯ · АДМИНКА
// ============================================================

module.exports = async function handler(req, res) {

  // ----------------------------------------------------------
  // Telegram webhook работает через POST.
  // GET оставляем для простой проверки endpoint.
  // ----------------------------------------------------------

  if (req.method === "GET") {

    return res.status(200).json({
      ok: true,
      service: "TITAN Telegram Bot",
      webhook: true
    });
  }


  if (req.method !== "POST") {

    return res.status(405).json({
      ok: false,
      error: "Method not allowed"
    });
  }


  try {

    // ========================================================
    // БАЗА
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

        return res.status(200).json({
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

          `🏋️ ТИТАН

Спортивный комплекс · Сарапул

Здесь можно посмотреть тренеров, актуальное расписание и создать фирменную инфографику.`,

          mainKeyboard()
        );


        return res.status(200).json({
          ok: true
        });
      }


      // ------------------------------------------------------
      // Если админка ожидает текст
      // ------------------------------------------------------

      if (text) {

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


      // ------------------------------------------------------
      // Любое другое сообщение
      // ------------------------------------------------------

      await sendMessage(

        chat,

        `ТИТАН · САРАПУЛ

Выберите нужный раздел:`,

        mainKeyboard()
      );


      return res.status(200).json({
        ok: true
      });
    }


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

        return res.status(200).json({
          ok: true
        });
      }


      // ------------------------------------------------------
      // Убираем "часики" Telegram
      // ------------------------------------------------------

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

      if (data === "home") {

        await clearState(chat);


        await sendMessage(

          chat,

          `🏋️ ТИТАН

Спортивный комплекс · Сарапул

Выберите нужный раздел:`,

          mainKeyboard()
        );


        return res.status(200).json({
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


        return res.status(200).json({
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

          `👤 ИНФОГРАФИКА ТРЕНЕРОВ

Сколько тренеров разместить на одном листе A4?`,

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


        return res.status(200).json({
          ok: true
        });
      }


      // ======================================================
      // СОХРАНЯЕМ КОЛИЧЕСТВО
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


          return res.status(200).json({
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
            text:
              "⬅️ Назад",
            callback_data:
              "trainer_poster_menu"
          }

        ]);


        await sendMessage(

          chat,

          `Выберите ${count} ${
            count === 1
              ? "тренера"
              : "тренеров"
          }:`,

          keyboard
        );


        return res.status(200).json({
          ok: true
        });
      }


      // ======================================================
      // ВЫБОР ТРЕНЕРА ДЛЯ ПОСТЕРА
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

            [
              [
                {
                  text:
                    "🖼 Создать инфографику",
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


        const info =
          stateData(state);


        const count =
          Number(
            info.count || 1
          );


        let selected =
          Array.isArray(
            info.selected
          )
            ? info.selected.map(Number)
            : [];


        // Если нажали на уже выбранного —
        // снимаем выбор.

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
        // Нужное количество выбрано
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


          const trainers =
            await getTrainersByIds(
              selected
            );


          const names =
            trainers
              .map(
                (trainer) =>
                  `• ${trainer.name}`
              )
              .join("\n");


          await sendMessage(

            chat,

            `✅ Выбрано:

${names}

Теперь выберите оформление:`,

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
                    "⬛ Ч/Б",
                  callback_data:
                    "poster_generate:bw"
                }
              ],

              [
                {
                  text:
                    "⬅️ Выбрать заново",
                  callback_data:
                    `poster_count:${count}`
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


          return res.status(200).json({
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
            text:
              "⬅️ Начать выбор заново",
            callback_data:
              `poster_count:${count}`
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

          `Выбрано: ${selected.length} из ${count}.

Выберите следующего тренера:`,

          keyboard
        );


        return res.status(200).json({
          ok: true
        });
      }


      // ======================================================
      // ГЕНЕРАЦИЯ ТРЕНЕРОВ
      // ======================================================

      if (
        data.startsWith(
          "poster_generate:"
        )
      ) {

        const theme =
          data.split(":")[1];


        if (
          ![
            "color",
            "bw"
          ].includes(theme)
        ) {

          await sendMessage(
            chat,
            "Неизвестный вариант оформления."
          );


          return res.status(200).json({
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

            "Выбор тренеров не найден. Начните создание заново.",

            [
              [
                {
                  text:
                    "🖼 Создать инфографику",
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


        const info =
          stateData(state);


        const selected =
          Array.isArray(
            info.selected
          )
            ? info.selected
                .map(Number)
                .filter(
                  Number.isInteger
                )
            : [];


        if (!selected.length) {

          await sendMessage(
            chat,
            "Не выбраны тренеры."
          );


          return res.status(200).json({
            ok: true
          });
        }


        await sendMessage(
          chat,
          "⏳ Создаю A4-инфографику…"
        );


        if (
          selected.length === 1
        ) {

          await sendPoster(
            chat,
            selected[0],
            theme
          );

        } else {

          await sendMultiTrainerPoster(
            chat,
            selected,
            theme
          );
        }


        await clearState(chat);


        await sendMessage(

          chat,

          "✅ Готово. Инфографика отправлена выше.",

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


        return res.status(200).json({
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


        if (!trainers.length) {

          text +=
            "Тренеры пока не добавлены.";

        } else {

          trainers.forEach(
            (
              trainer,
              index
            ) => {

              text +=
                `${index + 1}. ${trainer.name}\n` +
                `📞 ${trainer.phone || "—"}\n\n`;
            }
          );
        }


        await sendMessage(

          chat,

          text.trim(),

          [

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


        return res.status(200).json({
          ok: true
        });
      }


      // ======================================================
      // АДМИНКА
      // ======================================================

      if (data === "admin") {

        await showAdmin(chat);


        return res.status(200).json({
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

          "👤 ТРЕНЕРЫ\n\nВыберите тренера для редактирования:",

          keyboard
        );


        return res.status(200).json({
          ok: true
        });
      }


      // ======================================================
      // КАРТОЧКА ТРЕНЕРА В АДМИНКЕ
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


        return res.status(200).json({
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


        return res.status(200).json({
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


        return res.status(200).json({
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
          "Введите имя нового тренера:"
        );


        return res.status(200).json({
          ok: true
        });
      }


      // ======================================================
      // УДАЛЕНИЕ ТРЕНЕРА — ПОДТВЕРЖДЕНИЕ
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
            "Тренер уже удалён или не найден."
          );


          return res.status(200).json({
            ok: true
          });
        }


        await sendMessage(

          chat,

          `⚠️ Удалить тренера?

${trainer.name}

Будут также удалены его направления и расписание.`,

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
                  "❌ Отмена",
                callback_data:
                  `admin_trainer:${trainer.id}`
              }
            ]

          ]
        );


        return res.status(200).json({
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


        // Удаляем дочерние записи явно.
        // Даже если старая версия таблицы была создана
        // без ON DELETE CASCADE, удаление всё равно сработает.

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
            "Тренер уже был удалён."
          );
        }


        const keyboard =
          await trainerKeyboard(
            "admin_trainer"
          );


        await sendMessage(

          chat,

          "👤 ТРЕНЕРЫ\n\nВыберите тренера для редактирования:",

          keyboard
        );


        return res.status(200).json({
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


        return res.status(200).json({
          ok: true
        });
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


        return res.status(200).json({
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
          "Введите день: ПН, ВТ, СР, ЧТ, ПТ, СБ или ВС."
        );


        return res.status(200).json({
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
          "Введите новое время, например 18:30:"
        );


        return res.status(200).json({
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
          "Введите название направления:"
        );


        return res.status(200).json({
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
          "Введите зал: 1, 2, 3, 5 или «Тренажерный зал»:"
        );


        return res.status(200).json({
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
            "Занятие уже удалено."
          );


          return res.status(200).json({
            ok: true
          });
        }


        const trainerId =
          rows[0].trainer_id;


        await sendMessage(
          chat,
          "✅ Занятие удалено."
        );


        await showScheduleAdmin(
          chat,
          trainerId
        );


        return res.status(200).json({
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
          "Введите день занятия: ПН, ВТ, СР, ЧТ, ПТ, СБ или ВС."
        );


        return res.status(200).json({
          ok: true
        });
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


        return res.status(200).json({
          ok: true
        });
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


        return res.status(200).json({
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


        return res.status(200).json({
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


        return res.status(200).json({
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
            DELETE FROM directions
            WHERE id = ${directionId}
            RETURNING trainer_id
          `;


        await clearState(chat);


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


        await sendMessage(
          chat,
          "✅ Направление удалено."
        );


        await showDirectionsAdmin(
          chat,
          trainerId
        );


        return res.status(200).json({
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


        return res.status(200).json({
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

          `📅 ОБЩЕЕ РАСПИСАНИЕ

Выберите оформление:`,

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
                  "⬛ Ч/Б",
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


        return res.status(200).json({
          ok: true
        });
      }


      // ======================================================
      // ОБЩЕЕ РАСПИСАНИЕ — ЦВЕТ
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

          "✅ Цветное расписание готово.",

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


        return res.status(200).json({
          ok: true
        });
      }


      // ======================================================
      // ОБЩЕЕ РАСПИСАНИЕ — Ч/Б
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

          "✅ Чёрно-белое расписание готово.",

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


        return res.status(200).json({
          ok: true
        });
      }


      // ======================================================
      // НЕИЗВЕСТНАЯ КНОПКА
      // ======================================================

      await sendMessage(

        chat,

        "Эта кнопка больше неактуальна. Вернитесь в главное меню.",

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


      return res.status(200).json({
        ok: true
      });
    }


    // ========================================================
    // НЕИЗВЕСТНЫЙ UPDATE
    // ========================================================

    return res.status(200).json({
      ok: true
    });


  } catch (error) {

    console.error(
      "TITAN WEBHOOK ERROR:",
      error
    );


    // Telegram должен получить 200,
    // иначе начнёт повторно присылать тот же update.

    return res.status(200).json({
      ok: false,
      error:
        error?.message ||
        String(error)
    });
  }
};


// ============================================================
// КОНЕЦ БЛОКА 3
// КОНЕЦ api/webhook.js
// ============================================================
