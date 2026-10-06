const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TG = `https://api.telegram.org/bot${TOKEN}`;

// ======================================================
// ДАННЫЕ ТРЕНЕРОВ
// ======================================================

const trainers = [
  {
    name: "Жижина Эльвира",
    phone: "+7 (904) 278-52-01",
    directions: [
      {
        name: "Хатха-йога",
        desc: "Спокойная практика: гибкость, укрепление тела и снятие стресса."
      },
      {
        name: "Йога в гамаках",
        desc: "Практика с использованием гамаков: мобильность, разгрузка и контроль тела."
      }
    ],
    schedule: [
      { day: "СР", time: "07:30", direction: "Хатха-йога", hall: "5" },
      { day: "СР", time: "09:00", direction: "Йога в гамаках", hall: "2" },
      { day: "ПТ", time: "07:30", direction: "Хатха-йога", hall: "5" },
      { day: "ПТ", time: "09:00", direction: "Йога в гамаках", hall: "2" }
    ]
  },

  {
    name: "Фролова Екатерина",
    phone: "+7 (988) 095-26-91",
    directions: [
      {
        name: "Кундалини-йога",
        desc: "Практика для развития осознанности и гармонизации тела и ума."
      }
    ],
    schedule: [
      { day: "СБ", time: "08:00", direction: "Кундалини-йога", hall: "5" }
    ]
  },

  {
    name: "Зорина Анна",
    phone: "+7 912 855-31-91",
    directions: [
      {
        name: "Кундалини-йога",
        desc: "Практика для развития осознанности и гармонизации тела и ума."
      }
    ],
    schedule: [
      { day: "ПН", time: "09:00", direction: "Кундалини-йога", hall: "5" },
      { day: "ВС", time: "15:00–19:00", direction: "Кундалини-йога", hall: "2" }
    ]
  },

  {
    name: "Чупина Светлана",
    phone: "+7 982 828-38-27",
    directions: [
      {
        name: "TRX",
        desc: "Функциональные тренировки с собственным весом."
      },
      {
        name: "Силовой фитнес",
        desc: "Укрепление мышц и повышение выносливости."
      },
      {
        name: "Растяжка",
        desc: "Гибкость, улучшение осанки и снятие напряжения."
      },
      {
        name: "Мышечно-суставная гимнастика",
        desc: "Здоровье суставов, подвижность и профилактика травм."
      },
      {
        name: "Фитнес-йога",
        desc: "Силовые упражнения, растяжка и дыхательные практики."
      }
    ],
    schedule: [
      { day: "ПН", time: "17:00", direction: "TRX", hall: "2" },
      { day: "ПН", time: "18:00", direction: "Силовой фитнес", hall: "3" },
      { day: "ПН", time: "19:00", direction: "Растяжка", hall: "3" },
      { day: "ПН", time: "20:00", direction: "Фитнес-йога", hall: "2" },

      { day: "ВТ", time: "09:00", direction: "Силовой фитнес", hall: "3" },
      { day: "ВТ", time: "10:00", direction: "Мышечно-суставная гимнастика", hall: "2" },

      { day: "СР", time: "17:00", direction: "Силовой фитнес", hall: "3" },
      { day: "СР", time: "18:00", direction: "Силовой фитнес", hall: "3" },
      { day: "СР", time: "19:00", direction: "TRX", hall: "2" },
      { day: "СР", time: "20:00", direction: "Фитнес-йога", hall: "2" },

      { day: "ЧТ", time: "09:00", direction: "Силовой фитнес", hall: "3" },
      { day: "ЧТ", time: "10:00", direction: "Растяжка", hall: "2" },

      { day: "ПТ", time: "17:00", direction: "Растяжка", hall: "2" },
      { day: "ПТ", time: "18:00", direction: "TRX", hall: "2" },
      { day: "ПТ", time: "19:00", direction: "Растяжка", hall: "2" }
    ]
  },

  {
    name: "Федоренко Ольга",
    phone: "+7 904 247-08-15",
    directions: [
      {
        name: "Силовой тренинг",
        desc: "Силовая работа для развития мышц и общей физической формы."
      },
      {
        name: "Кроссфит",
        desc: "Интенсивная функциональная тренировка силы и выносливости."
      },
      {
        name: "Функционал",
        desc: "Комплексная тренировка всего тела."
      },
      {
        name: "Тренажерный зал",
        desc: "Силовые тренировки с использованием тренажеров и свободных весов."
      }
    ],
    schedule: [
      { day: "ПН", time: "11:00", direction: "Силовой тренинг", hall: "3" },
      { day: "ПН", time: "18:30", direction: "Кроссфит", hall: "1" },

      { day: "ВТ", time: "10:00", direction: "Функционал", hall: "3" },
      { day: "ВТ", time: "19:00", direction: "Силовой тренинг", hall: "3" },
      { day: "ВТ", time: "20:00", direction: "Тренажерный зал", hall: "GYM" },

      { day: "СР", time: "10:00", direction: "Силовой тренинг", hall: "3" },

      { day: "ЧТ", time: "10:00", direction: "Функционал", hall: "3" },
      { day: "ЧТ", time: "19:00", direction: "Силовой тренинг", hall: "3" },
      { day: "ЧТ", time: "20:00", direction: "Тренажерный зал", hall: "GYM" },

      { day: "ПТ", time: "10:00", direction: "Кроссфит", hall: "1" },
      { day: "СБ", time: "09:00", direction: "Кроссфит", hall: "1" }
    ]
  },

  {
    name: "Ижболдина Наталья",
    phone: "+7 982 837-57-69",
    directions: [
      {
        name: "Динамическая растяжка",
        desc: "Гибкость, улучшение осанки, восстановление и профилактика травм."
      }
    ],
    schedule: [
      { day: "ВТ", time: "19:00", direction: "Динамическая растяжка", hall: "5" },
      { day: "ЧТ", time: "19:00", direction: "Динамическая растяжка", hall: "5" },
      { day: "ВС", time: "11:00", direction: "Динамическая растяжка", hall: "5" }
    ]
  },

  {
    name: "Солодова Алена",
    phone: "+7 982 127-49-22",
    directions: [
      {
        name: "Джампинг",
        desc: "Динамичное кардио на мини-батутах: выносливость, координация и энергия."
      }
    ],
    schedule: [
      { day: "ВТ", time: "18:00", direction: "Джампинг", hall: "3" },
      { day: "ЧТ", time: "18:00", direction: "Джампинг", hall: "3" }
    ]
  },

  {
    name: "Кушнир Анна",
    phone: "+7 912 769-85-05",
    directions: [
      {
        name: "Силовой тренинг",
        desc: "Укрепление мышц, развитие силы и выносливости."
      },
      {
        name: "Функционал",
        desc: "Функциональная работа на силу, координацию и выносливость."
      }
    ],
    schedule: [
      { day: "СР", time: "18:00", direction: "Силовой тренинг", hall: "2" },
      { day: "ПТ", time: "18:00", direction: "Функционал", hall: "1" },
      { day: "ВС", time: "11:00", direction: "Функционал", hall: "1" }
    ]
  },

  {
    name: "Васильчевская Евгения",
    phone: "+7 (914) 936-82-32",
    directions: [
      {
        name: "Зумба",
        desc: "Танцевальный фитнес под энергичную музыку: выносливость, координация и настроение."
      }
    ],
    schedule: [
      { day: "ПТ", time: "18:30", direction: "Зумба", hall: "3" }
    ]
  }
];

const hallNames = {
  "1": "КРОССФИТ / БОКС",
  "2": "TRX / АНТИГРАВИТИ",
  "3": "СИЛОВОЙ ТРЕНИНГ",
  "5": "ЙОГА / АЭРОЙОГА",
  GYM: "ТРЕНАЖЕРНЫЙ ЗАЛ"
};

// ======================================================
// TELEGRAM
// ======================================================

async function api(method, body) {
  return fetch(`${TG}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
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

function esc(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function shortHall(hall) {
  if (hall === "GYM") return "ТРЕНАЖЕРНЫЙ ЗАЛ";
  return `ЗАЛ ${hall}`;
}

// ======================================================
// ПОСТЕР
// ======================================================

function makePoster(t, theme = "color", trainerNumber = 1) {
  const bw = theme === "bw";

  const C = {
    bg: bw ? "#ffffff" : "#090909",
    surface: bw ? "#f2f2f2" : "#151515",
    surface2: bw ? "#ffffff" : "#101010",
    text: bw ? "#050505" : "#ffffff",
    muted: bw ? "#5c5c5c" : "#b8b8b8",
    accent: bw ? "#000000" : "#ff6a00",
    line: bw ? "#cfcfcf" : "#353535",
    ghost: bw ? "#eeeeee" : "#151515"
  };

  const W = 1240;
  const PAD = 72;

  // Компактная высота блоков
  const dirCount = t.directions.length;
  const rowCount = t.schedule.length;

  const directionStart = 430;
  const directionRowH = 112;

  const scheduleTitleY =
    directionStart + dirCount * directionRowH + 80;

  const scheduleHeaderY = scheduleTitleY + 58;
  const scheduleStartY = scheduleHeaderY + 52;
  const scheduleRowH = 76;

  const halls = [...new Set(t.schedule.map(x => x.hall))];

  const hallsTitleY =
    scheduleStartY + rowCount * scheduleRowH + 75;

  const hallCardsStartY = hallsTitleY + 55;
  const hallRows = Math.ceil(halls.length / 2);
  const hallRowH = 92;

  const contactY =
    hallCardsStartY + hallRows * hallRowH + 65;

  const H = Math.max(1754, contactY + 300);

  // ---------- направления ----------
  const directionSvg = t.directions
    .map((d, i) => {
      const y = directionStart + i * directionRowH;

      return `
        <g>
          <rect
            x="${PAD}"
            y="${y}"
            width="${W - PAD * 2}"
            height="94"
            rx="18"
            fill="${C.surface}"
            stroke="${C.line}"
            stroke-width="2"
          />

          <rect
            x="${PAD}"
            y="${y}"
            width="10"
            height="94"
            rx="5"
            fill="${C.accent}"
          />

          <text
            x="${PAD + 32}"
            y="${y + 38}"
            fill="${C.text}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="30"
            font-weight="900"
          >${esc(d.name).toUpperCase()}</text>

          <text
            x="${PAD + 32}"
            y="${y + 70}"
            fill="${C.muted}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="17"
            font-weight="600"
          >${esc(d.desc)}</text>
        </g>
      `;
    })
    .join("");

  // ---------- расписание ----------
  let lastDay = "";

  const scheduleSvg = t.schedule
    .map((s, i) => {
      const y = scheduleStartY + i * scheduleRowH;
      const showDay = s.day !== lastDay;
      lastDay = s.day;

      return `
        <g>
          <rect
            x="${PAD}"
            y="${y}"
            width="${W - PAD * 2}"
            height="64"
            rx="14"
            fill="${i % 2 === 0 ? C.surface : C.surface2}"
            stroke="${C.line}"
            stroke-width="1.5"
          />

          ${
            showDay
              ? `
                <rect
                  x="${PAD + 14}"
                  y="${y + 8}"
                  width="82"
                  height="48"
                  rx="11"
                  fill="${C.accent}"
                />

                <text
                  x="${PAD + 55}"
                  y="${y + 41}"
                  text-anchor="middle"
                  fill="${bw ? "#ffffff" : "#090909"}"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="25"
                  font-weight="900"
                >${esc(s.day)}</text>
              `
              : `
                <line
                  x1="${PAD + 55}"
                  y1="${y}"
                  x2="${PAD + 55}"
                  y2="${y + 64}"
                  stroke="${C.line}"
                  stroke-width="2"
                />
              `
          }

          <text
            x="${PAD + 135}"
            y="${y + 41}"
            fill="${C.text}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="27"
            font-weight="900"
          >${esc(s.time)}</text>

          <text
            x="${PAD + 345}"
            y="${y + 40}"
            fill="${C.text}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="22"
            font-weight="800"
          >${esc(s.direction).toUpperCase()}</text>

          <text
            x="${W - PAD - 20}"
            y="${y + 40}"
            text-anchor="end"
            fill="${C.accent}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="21"
            font-weight="900"
          >${esc(shortHall(s.hall))}</text>
        </g>
      `;
    })
    .join("");

  // ---------- залы ----------
  const hallSvg = halls
    .map((hall, i) => {
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
            height="74"
            rx="15"
            fill="${C.surface}"
            stroke="${C.line}"
            stroke-width="2"
          />

          <text
            x="${x + 24}"
            y="${y + 29}"
            fill="${C.accent}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="20"
            font-weight="900"
          >${esc(shortHall(hall))}</text>

          <text
            x="${x + 24}"
            y="${y + 56}"
            fill="${C.text}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="16"
            font-weight="700"
          >${esc(hallNames[hall] || "")}</text>
        </g>
      `;
    })
    .join("");

  return `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="${W}"
    height="${H}"
    viewBox="0 0 ${W} ${H}"
  >
    <rect width="${W}" height="${H}" fill="${C.bg}" />

    <!-- Фоновая графика -->
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
      opacity="${bw ? "0.08" : "0.12"}"
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
      font-size="48"
      font-weight="900"
    >ТИТАН</text>

    <text
      x="${W - PAD}"
      y="88"
      text-anchor="end"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="18"
      font-weight="800"
      letter-spacing="3"
    >ТРЕНЕР • ${String(trainerNumber).padStart(2, "0")}</text>

    <line
      x1="${PAD}"
      y1="125"
      x2="${W - PAD}"
      y2="125"
      stroke="${C.accent}"
      stroke-width="4"
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
      y="267"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="22"
      font-weight="800"
      letter-spacing="3"
    >ГРУППОВЫЕ ТРЕНИРОВКИ</text>

    <!-- номер секции -->
    <text
      x="${PAD}"
      y="355"
      fill="${C.accent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="18"
      font-weight="900"
    >01</text>

    <line
      x1="${PAD + 48}"
      y1="349"
      x2="${PAD + 112}"
      y2="349"
      stroke="${C.accent}"
      stroke-width="3"
    />

    <text
      x="${PAD + 135}"
      y="357"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="27"
      font-weight="900"
      letter-spacing="2"
    >НАПРАВЛЕНИЯ</text>

    ${directionSvg}

    <!-- РАСПИСАНИЕ -->
    <text
      x="${PAD}"
      y="${scheduleTitleY}"
      fill="${C.accent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="18"
      font-weight="900"
    >02</text>

    <line
      x1="${PAD + 48}"
      y1="${scheduleTitleY - 6}"
      x2="${PAD + 112}"
      y2="${scheduleTitleY - 6}"
      stroke="${C.accent}"
      stroke-width="3"
    />

    <text
      x="${PAD + 135}"
      y="${scheduleTitleY + 2}"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="27"
      font-weight="900"
      letter-spacing="2"
    >РАСПИСАНИЕ</text>

    <text
      x="${PAD + 14}"
      y="${scheduleHeaderY}"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="14"
      font-weight="900"
    >ДЕНЬ</text>

    <text
      x="${PAD + 135}"
      y="${scheduleHeaderY}"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="14"
      font-weight="900"
    >ВРЕМЯ</text>

    <text
      x="${PAD + 345}"
      y="${scheduleHeaderY}"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="14"
      font-weight="900"
    >НАПРАВЛЕНИЕ</text>

    <text
      x="${W - PAD - 20}"
      y="${scheduleHeaderY}"
      text-anchor="end"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="14"
      font-weight="900"
    >ЗАЛ</text>

    ${scheduleSvg}

    <!-- ЗАЛЫ -->
    <text
      x="${PAD}"
      y="${hallsTitleY}"
      fill="${C.accent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="18"
      font-weight="900"
    >03</text>

    <line
      x1="${PAD + 48}"
      y1="${hallsTitleY - 6}"
      x2="${PAD + 112}"
      y2="${hallsTitleY - 6}"
      stroke="${C.accent}"
      stroke-width="3"
    />

    <text
      x="${PAD + 135}"
      y="${hallsTitleY + 2}"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="27"
      font-weight="900"
      letter-spacing="2"
    >РАСШИФРОВКА ЗАЛОВ</text>

    ${hallSvg}

    <!-- КОНТАКТ -->
    <rect
      x="${PAD}"
      y="${contactY}"
      width="${W - PAD * 2}"
      height="174"
      rx="22"
      fill="${C.surface}"
      stroke="${C.accent}"
      stroke-width="3"
    />

    <text
      x="${PAD + 30}"
      y="${contactY + 43}"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="16"
      font-weight="900"
      letter-spacing="2"
    >ЗАПИСЬ К ТРЕНЕРУ</text>

    <text
      x="${PAD + 30}"
      y="${contactY + 101}"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="38"
      font-weight="900"
    >${esc(t.phone)}</text>

    <text
      x="${PAD + 30}"
      y="${contactY + 140}"
      fill="${C.muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="18"
      font-weight="700"
    >г. Сарапул · ул. Советская, 46</text>

    <!-- QR -->
    <rect
      x="${W - PAD - 140}"
      y="${contactY + 22}"
      width="126"
      height="126"
      rx="13"
      fill="#ffffff"
      stroke="${C.accent}"
      stroke-width="3"
    />

    <text
      x="${W - PAD - 77}"
      y="${contactY + 96}"
      text-anchor="middle"
      fill="#000000"
      font-family="Arial, Helvetica, sans-serif"
      font-size="25"
      font-weight="900"
    >QR</text>

    <text
      x="${PAD}"
      y="${contactY + 232}"
      fill="${C.text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="20"
      font-weight="900"
      letter-spacing="2"
    >ТИТАН · САРАПУЛ</text>

    <line
      x1="${PAD}"
      y1="${contactY + 258}"
      x2="${W - PAD}"
      y2="${contactY + 258}"
      stroke="${C.accent}"
      stroke-width="5"
    />
  </svg>
  `;
}

// ======================================================
// ОТПРАВКА ПОСТЕРА
// ======================================================

async function sendPoster(chat, trainerIndex, theme) {
  const trainer = trainers[trainerIndex];

  if (!trainer) {
    return sendMessage(chat, "Тренер не найден.");
  }

  const svg = makePoster(
    trainer,
    theme,
    trainerIndex + 1
  );

  const form = new FormData();

  form.append("chat_id", String(chat));

  form.append(
    "document",
    new Blob([svg], { type: "image/svg+xml" }),
    `TITAN_${trainer.name.replace(/\s+/g, "_")}_${theme}.svg`
  );

  form.append(
    "caption",
    `${trainer.name}\n${theme === "bw" ? "Ч/Б вариант" : "Цветной вариант"}`
  );

  const response = await fetch(`${TG}/sendDocument`, {
    method: "POST",
    body: form
  });

  return response.json();
}

// ======================================================
// КЛАВИАТУРЫ
// ======================================================

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
    ]
  ];
}

function trainerKeyboard(theme) {
  const buttons = trainers.map((t, i) => [
    {
      text: t.name,
      callback_data: `poster:${theme}:${i}`
    }
  ]);

  buttons.push([
    {
      text: "⬅️ Назад",
      callback_data: "create"
    }
  ]);

  return buttons;
}

// ======================================================
// WEBHOOK
// ======================================================

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(200).json({
      ok: true,
      service: "TITAN Bot"
    });
  }

  try {
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

    // START
    if (text === "/start" || data === "home") {
      await sendMessage(
        chat,
        "ТИТАН — генератор инфографики\n\nВыберите действие:",
        mainKeyboard()
      );

      return res.status(200).json({ ok: true });
    }

    // СОЗДАНИЕ
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

    // ТЕМА
    if (data.startsWith("theme:")) {
      const theme = data.split(":")[1];

      await sendMessage(
        chat,
        "Выберите тренера:",
        trainerKeyboard(theme)
      );

      return res.status(200).json({ ok: true });
    }

    // ГЕНЕРАЦИЯ
    if (data.startsWith("poster:")) {
      const parts = data.split(":");

      const theme = parts[1];
      const trainerIndex = Number(parts[2]);

      await sendMessage(
        chat,
        `Готовлю инфографику: ${trainers[trainerIndex]?.name || ""}…`
      );

      await sendPoster(
        chat,
        trainerIndex,
        theme
      );

      await sendMessage(
        chat,
        "Готово.",
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

    // СПИСОК ТРЕНЕРОВ
    if (data === "trainers") {
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

    // ОБЩЕЕ РАСПИСАНИЕ
    if (data === "week") {
      await sendMessage(
        chat,
        "Общее расписание будет следующим модулем. Персональные карточки тренеров уже доступны.",
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

    await sendMessage(
      chat,
      "Нажмите /start",
      mainKeyboard()
    );

    return res.status(200).json({ ok: true });

  } catch (error) {
    console.error(error);

    return res.status(200).json({
      ok: false,
      error: String(error)
    });
  }
};
