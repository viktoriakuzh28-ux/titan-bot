const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TG = `https://api.telegram.org/bot${TOKEN}`;

// ======================================================
// ТРЕНЕРЫ
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
        desc: "Практика в гамаках: мобильность, разгрузка и контроль тела."
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
        desc: "Развитие гибкости, улучшение осанки и снятие напряжения."
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
        desc: "Развитие силы, укрепление мышц и улучшение физической формы."
      },
      {
        name: "Кроссфит",
        desc: "Интенсивная функциональная тренировка силы и выносливости."
      },
      {
        name: "Функционал",
        desc: "Комплексная функциональная тренировка всего тела."
      },
      {
        name: "Тренажерный зал",
        desc: "Силовые тренировки на тренажерах и со свободными весами."
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
        desc: "Кардио на мини-батутах: выносливость, координация и энергия."
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
        desc: "Танцевальный фитнес: выносливость, координация и отличное настроение."
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

function esc(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function shortHall(hall) {
  if (hall === "GYM") return "ТРЕНАЖЕРНЫЙ";
  return `ЗАЛ ${hall}`;
}

// ======================================================
// ПЕРЕНОС ТЕКСТА
// ======================================================

function splitText(text, maxChars) {
  const words = String(text).split(/\s+/);
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
  return lines
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

// ======================================================
// ПОСТЕР
// ======================================================

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

  // ====================================================
  // НАПРАВЛЕНИЯ
  // ====================================================

  const directionStart = 430;

  const directionData = t.directions.map(d => {
    const descLines = splitText(d.desc, 65).slice(0, 2);

    return {
      ...d,
      descLines,
      height: descLines.length > 1 ? 132 : 112
    };
  });

  let currentDirectionY = directionStart;

  const directionSvg = directionData
    .map(d => {
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
    })
    .join("");

  const scheduleTitleY = currentDirectionY + 65;

  // ====================================================
  // РАСПИСАНИЕ
  // ====================================================

  const scheduleHeaderY = scheduleTitleY + 72;
  const scheduleStartY = scheduleHeaderY + 55;

  // Строки стали выше, чтобы крупный текст не теснился
  const scheduleRowH = 88;

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
    })
    .join("");

  // ====================================================
  // ЗАЛЫ
  // ====================================================

  const halls = [...new Set(t.schedule.map(x => x.hall))];

  const hallsTitleY =
    scheduleStartY +
    t.schedule.length * scheduleRowH +
    75;

  const hallCardsStartY = hallsTitleY + 65;
  const hallRowH = 108;
  const hallRows = Math.ceil(halls.length / 2);

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
    })
    .join("");

  const contactY =
    hallCardsStartY +
    hallRows * hallRowH +
    60;

  const H = Math.max(1754, contactY + 300);

  // ====================================================
  // SVG
  // ====================================================

  return `
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

    <!-- декоративный ТИТАН -->

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

    <!-- 01 -->

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

    <!-- 02 -->

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

    <!-- КРУПНЫЕ ЗАГОЛОВКИ ТАБЛИЦЫ -->

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

    <!-- 03 -->

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

    <!-- КОНТАКТ -->

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

    <!-- QR -->

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

    <!-- НИЗ -->

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

// ======================================================
// ОТПРАВКА
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

// ======================================================
// КНОПКИ
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

    // ГЛАВНОЕ МЕНЮ

    if (text === "/start" || data === "home") {
      await sendMessage(
        chat,
        "ТИТАН — генератор инфографики\n\nВыберите действие:",
        mainKeyboard()
      );

      return res.status(200).json({ ok: true });
    }

    // СОЗДАТЬ

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

    // ВЫБОР ТЕМЫ

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
        `Готовлю инфографику: ${
          trainers[trainerIndex]?.name || ""
        }…`
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

    // ТРЕНЕРЫ

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
        "Общее расписание будет следующим модулем.",
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
