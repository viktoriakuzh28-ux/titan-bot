const trainers = [
  {
    name: "Жижина Эльвира",
    phone: "+7 (904) 278-52-01",
    directions: [
      ["Хатха-йога", "Спокойная практика: гибкость, укрепление тела и снятие стресса."],
      ["Йога в гамаках", "Практика в подвесных гамаках для гибкости, лёгкости и расслабления."]
    ],
    schedule: [
      ["СР", "07:30", "Хатха-йога", "Зал 5"],
      ["СР", "09:00", "Йога в гамаках", "Зал 2"],
      ["ПТ", "07:30", "Хатха-йога", "Зал 5"],
      ["ПТ", "09:00", "Йога в гамаках", "Зал 2"]
    ]
  },
  {
    name: "Фролова Екатерина",
    phone: "+7 (988) 095-26-91",
    directions: [
      ["Кундалини-йога", "Практика для развития осознанности и гармонии тела и ума."]
    ],
    schedule: [
      ["СБ", "08:00", "Кундалини-йога", "Зал 5"]
    ]
  },
  {
    name: "Зорина Анна",
    phone: "+7 912 855-31-91",
    directions: [
      ["Кундалини-йога", "Практика для развития осознанности и гармонии тела и ума."]
    ],
    schedule: [
      ["ПН", "09:00", "Кундалини-йога", "Зал 5"],
      ["ВС", "15:00–19:00", "Кундалини-йога", "Зал 2"]
    ]
  },
  {
    name: "Чупина Светлана",
    phone: "+7 982 828-38-27",
    directions: [
      ["TRX", "Функциональные тренировки с собственным весом."],
      ["Силовой фитнес", "Укрепление мышц и повышение выносливости."],
      ["Растяжка", "Гибкость, улучшение осанки и снятие напряжения."],
      ["Мышечно-суставная гимнастика", "Здоровье суставов, подвижность и профилактика травм."],
      ["Фитнес-йога", "Силовые упражнения, растяжка и дыхательные практики."]
    ],
    schedule: [
      ["ПН", "17:00", "TRX", "Зал 2"],
      ["ПН", "18:00", "Силовой фитнес", "Зал 3"],
      ["ПН", "19:00", "Растяжка", "Зал 3"],
      ["ПН", "20:00", "Фитнес-йога", "Зал 2"],
      ["ВТ", "09:00", "Силовой фитнес", "Зал 3"],
      ["ВТ", "10:00", "Мышечно-суставная гимнастика", "Зал 2"],
      ["СР", "17:00", "Силовой фитнес", "Зал 3"],
      ["СР", "18:00", "Силовой фитнес", "Зал 3"],
      ["СР", "19:00", "TRX", "Зал 2"],
      ["СР", "20:00", "Фитнес-йога", "Зал 2"],
      ["ЧТ", "09:00", "Силовой фитнес", "Зал 3"],
      ["ЧТ", "10:00", "Растяжка", "Зал 2"],
      ["ПТ", "17:00", "Растяжка", "Зал 2"],
      ["ПТ", "18:00", "TRX", "Зал 2"],
      ["ПТ", "19:00", "Растяжка", "Зал 2"]
    ]
  },
  {
    name: "Федоренко Ольга",
    phone: "+7 904 247-08-15",
    directions: [
      ["Силовой тренинг", "Развитие силы, выносливости и мышечного тонуса."],
      ["Кроссфит", "Интенсивная функциональная тренировка всего тела."],
      ["Функционал", "Комплексная тренировка силы, координации и выносливости."]
    ],
    schedule: [
      ["ПН", "11:00", "Силовой тренинг", "Зал 3"],
      ["ПН", "18:30", "Кроссфит", "Зал 1"],
      ["ВТ", "10:00", "Функционал", "Зал 3"],
      ["ВТ", "19:00", "Силовой тренинг", "Зал 3"],
      ["ВТ", "20:00", "Тренажерный зал", "Тренажерный зал"],
      ["СР", "10:00", "Силовой тренинг", "Зал 3"],
      ["ЧТ", "10:00", "Функционал", "Зал 3"],
      ["ЧТ", "19:00", "Силовой тренинг", "Зал 3"],
      ["ЧТ", "20:00", "Тренажерный зал", "Тренажерный зал"],
      ["ПТ", "10:00", "Кроссфит", "Зал 1"],
      ["СБ", "09:00", "Кроссфит", "Зал 1"]
    ]
  },
  {
    name: "Ижболдина Наталья",
    phone: "+7 982 837-57-69",
    directions: [
      ["Динамическая растяжка", "Гибкость, улучшение осанки, восстановление и профилактика травм."]
    ],
    schedule: [
      ["ВТ", "19:00", "Динамическая растяжка", "Зал 5"],
      ["ЧТ", "19:00", "Динамическая растяжка", "Зал 5"],
      ["ВС", "11:00", "Динамическая растяжка", "Зал 5"]
    ]
  },
  {
    name: "Солодова Алена",
    phone: "+7 982 127-49-22",
    directions: [
      ["Джампинг", "Динамичное кардио на мини-батутах: выносливость, координация и энергия."]
    ],
    schedule: [
      ["ВТ", "18:00", "Джампинг", "Зал 3"],
      ["ЧТ", "18:00", "Джампинг", "Зал 3"]
    ]
  },
  {
    name: "Кушнир Анна",
    phone: "+7 912 769-85-05",
    directions: [
      ["Силовой тренинг", "Развитие силы и мышечного тонуса."],
      ["Функционал", "Функциональная тренировка всего тела."]
    ],
    schedule: [
      ["СР", "18:00", "Силовой тренинг", "Зал 2"],
      ["ПТ", "18:00", "Функционал", "Зал 1"],
      ["ВС", "11:00", "Функционал", "Зал 1"]
    ]
  },
  {
    name: "Васильчевская Евгения",
    phone: "+7 (914) 936-82-32",
    directions: [
      ["Зумба", "Танцевальный фитнес под энергичную музыку: выносливость, координация и настроение."]
    ],
    schedule: [
      ["ПТ", "18:30", "Зумба", "Зал 3"]
    ]
  }
];

const token = process.env.TELEGRAM_BOT_TOKEN;

async function api(method, body) {
  return fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });
}

function esc(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function makePoster(t, theme) {
    const bw = theme === "bw";

  // ===== ЦВЕТА =====
  const bg = bw ? "#ffffff" : "#090909";
  const card = bw ? "#f2f2f2" : "#151515";
  const card2 = bw ? "#ffffff" : "#101010";
  const text = bw ? "#000000" : "#ffffff";
  const muted = bw ? "#555555" : "#b8b8b8";
  const accent = bw ? "#000000" : "#ff6a00";
  const line = bw ? "#c8c8c8" : "#353535";

  // ===== ДАННЫЕ =====
  const name = esc(t.name || "ТРЕНЕР");
  const phone = esc(t.phone || "");

  const directions = Array.isArray(t.directions)
    ? t.directions
    : Array.isArray(t.activities)
      ? t.activities
      : [];

  const schedule = Array.isArray(t.schedule) ? t.schedule : [];

  const hallNames = {
    "1": "КРОССФИТ / БОКС",
    "2": "TRX / АНТИГРАВИТИ",
    "3": "СИЛОВОЙ ТРЕНИНГ",
    "5": "ЙОГА / АЭРОЙОГА"
  };

  const dayOrder = {
    "ПН": 1,
    "ВТ": 2,
    "СР": 3,
    "ЧТ": 4,
    "ПТ": 5,
    "СБ": 6,
    "ВС": 7
  };

  const cleanDay = value =>
    String(value || "")
      .trim()
      .toUpperCase()
      .replace("ПОНЕДЕЛЬНИК", "ПН")
      .replace("ВТОРНИК", "ВТ")
      .replace("СРЕДА", "СР")
      .replace("ЧЕТВЕРГ", "ЧТ")
      .replace("ПЯТНИЦА", "ПТ")
      .replace("СУББОТА", "СБ")
      .replace("ВОСКРЕСЕНЬЕ", "ВС");

  const cleanHall = value => {
    const raw = String(value || "").trim();

    if (/тренаж/i.test(raw)) {
      return {
        short: "ТРЕНАЖЕРНЫЙ ЗАЛ",
        key: "gym"
      };
    }

    const match = raw.match(/\d+/);
    const n = match ? match[0] : raw;

    return {
      short: n ? `ЗАЛ ${n}` : "—",
      key: n
    };
  };

  const getDirectionName = d => {
    if (typeof d === "string") return d;
    return d?.name || d?.title || d?.direction || "";
  };

  const getDirectionDescription = d => {
    if (typeof d === "string") return "";
    return d?.description || d?.desc || d?.text || "";
  };

  // ===== НАПРАВЛЕНИЯ =====
  let directionSource = directions;

  if (!directionSource.length && schedule.length) {
    const unique = [];

    for (const s of schedule) {
      const n = s.direction || s.activity || s.title || "";
      if (n && !unique.includes(n)) unique.push(n);
    }

    directionSource = unique;
  }

  const directionBlocks = directionSource
    .slice(0, 5)
    .map((d, i) => {
      const dName = esc(getDirectionName(d)).toUpperCase();
      const dDesc = esc(getDirectionDescription(d));

      const y = 570 + i * 128;

      return `
        <g>
          <rect
            x="90"
            y="${y}"
            width="1060"
            height="104"
            rx="18"
            fill="${card}"
            stroke="${line}"
            stroke-width="2"
          />

          <rect
            x="90"
            y="${y}"
            width="10"
            height="104"
            rx="5"
            fill="${accent}"
          />

          <text
            x="125"
            y="${y + 42}"
            fill="${text}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="31"
            font-weight="900"
          >${dName}</text>

          ${
            dDesc
              ? `
                <text
                  x="125"
                  y="${y + 76}"
                  fill="${muted}"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="18"
                  font-weight="500"
                >${dDesc}</text>
              `
              : ""
          }
        </g>
      `;
    })
    .join("");

  // ===== РАСПИСАНИЕ =====
  const normalizedSchedule = schedule
    .map(s => ({
      day: cleanDay(s.day || s.weekday),
      time: String(s.time || "").trim(),
      direction: String(
        s.direction || s.activity || s.title || ""
      ).trim(),
      hall: cleanHall(s.hall || s.room || "")
    }))
    .sort((a, b) => {
      const dayDiff =
        (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99);

      if (dayDiff !== 0) return dayDiff;

      return a.time.localeCompare(b.time, "ru");
    });

  const scheduleStartY =
    570 + Math.max(directionSource.slice(0, 5).length, 1) * 128 + 125;

  let previousDay = "";

  const scheduleRows = normalizedSchedule
    .map((s, i) => {
      const y = scheduleStartY + 95 + i * 82;
      const showDay = s.day !== previousDay;
      previousDay = s.day;

      return `
        <g>
          <rect
            x="90"
            y="${y - 48}"
            width="1060"
            height="72"
            rx="14"
            fill="${i % 2 === 0 ? card : card2}"
            stroke="${line}"
            stroke-width="1.5"
          />

          ${
            showDay
              ? `
                <rect
                  x="105"
                  y="${y - 37}"
                  width="92"
                  height="50"
                  rx="12"
                  fill="${accent}"
                />

                <text
                  x="151"
                  y="${y - 3}"
                  text-anchor="middle"
                  fill="${bw ? "#ffffff" : "#090909"}"
                  font-family="Arial, Helvetica, sans-serif"
                  font-size="27"
                  font-weight="900"
                >${esc(s.day)}</text>
              `
              : ""
          }

          <text
            x="245"
            y="${y}"
            fill="${text}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="29"
            font-weight="900"
          >${esc(s.time)}</text>

          <text
            x="470"
            y="${y}"
            fill="${text}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="25"
            font-weight="800"
          >${esc(s.direction).toUpperCase()}</text>

          <text
            x="1115"
            y="${y}"
            text-anchor="end"
            fill="${accent}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="23"
            font-weight="900"
          >${esc(s.hall.short)}</text>
        </g>
      `;
    })
    .join("");

  // ===== ИСПОЛЬЗУЕМЫЕ ЗАЛЫ =====
  const usedHalls = [];

  for (const s of normalizedSchedule) {
    if (
      s.hall.key &&
      !usedHalls.some(h => h.key === s.hall.key)
    ) {
      usedHalls.push(s.hall);
    }
  }

  const hallY =
    scheduleStartY +
    120 +
    Math.max(normalizedSchedule.length, 1) * 82;

  const hallCards = usedHalls
    .map((h, i) => {
      const columns = 2;
      const col = i % columns;
      const row = Math.floor(i / columns);

      const x = 90 + col * 540;
      const y = hallY + 95 + row * 105;

      const title =
        h.key === "gym"
          ? "ТРЕНАЖЕРНЫЙ ЗАЛ"
          : `ЗАЛ ${esc(h.key)}`;

      const description =
        h.key === "gym"
          ? "ТРЕНАЖЕРНЫЙ ЗАЛ"
          : hallNames[h.key] || "";

      return `
        <g>
          <rect
            x="${x}"
            y="${y}"
            width="520"
            height="82"
            rx="16"
            fill="${card}"
            stroke="${line}"
            stroke-width="2"
          />

          <text
            x="${x + 25}"
            y="${y + 33}"
            fill="${accent}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="22"
            font-weight="900"
          >${title}</text>

          <text
            x="${x + 25}"
            y="${y + 61}"
            fill="${text}"
            font-family="Arial, Helvetica, sans-serif"
            font-size="17"
            font-weight="700"
          >${esc(description)}</text>
        </g>
      `;
    })
    .join("");

  const hallRows = Math.max(
    1,
    Math.ceil(usedHalls.length / 2)
  );

  const contactY = hallY + 125 + hallRows * 105;

  // ===== SVG =====
  return `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1240"
    height="${Math.max(contactY + 360, 1754)}"
    viewBox="0 0 1240 ${Math.max(contactY + 360, 1754)}"
  >
    <rect
      width="100%"
      height="100%"
      fill="${bg}"
    />

    <!-- декоративная надпись -->
    <text
      x="1180"
      y="370"
      text-anchor="end"
      fill="${bw ? "#eeeeee" : "#171717"}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="205"
      font-weight="900"
    >ТИТАН</text>

    <!-- верхняя оранжевая линия -->
    <rect
      x="0"
      y="0"
      width="1240"
      height="18"
      fill="${accent}"
    />

    <!-- шапка -->
    <text
      x="90"
      y="115"
      fill="${accent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="56"
      font-weight="900"
    >ТИТАН</text>

    <text
      x="1150"
      y="108"
      text-anchor="end"
      fill="${muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="20"
      font-weight="800"
      letter-spacing="3"
    >ТРЕНЕР • 01</text>

    <line
      x1="90"
      y1="150"
      x2="1150"
      y2="150"
      stroke="${accent}"
      stroke-width="4"
    />

    <text
      x="90"
      y="260"
      fill="${text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="65"
      font-weight="900"
    >${name.toUpperCase()}</text>

    <text
      x="92"
      y="310"
      fill="${muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="24"
      font-weight="800"
      letter-spacing="3"
    >ГРУППОВЫЕ ТРЕНИРОВКИ</text>

    <!-- направления -->
    <text
      x="90"
      y="505"
      fill="${accent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="24"
      font-weight="900"
      letter-spacing="3"
    >НАПРАВЛЕНИЯ</text>

    ${directionBlocks}

    <!-- расписание -->
    <text
      x="90"
      y="${scheduleStartY}"
      fill="${accent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="31"
      font-weight="900"
      letter-spacing="3"
    >РАСПИСАНИЕ</text>

    <text
      x="105"
      y="${scheduleStartY + 53}"
      fill="${muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="16"
      font-weight="800"
    >ДЕНЬ</text>

    <text
      x="245"
      y="${scheduleStartY + 53}"
      fill="${muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="16"
      font-weight="800"
    >ВРЕМЯ</text>

    <text
      x="470"
      y="${scheduleStartY + 53}"
      fill="${muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="16"
      font-weight="800"
    >НАПРАВЛЕНИЕ</text>

    <text
      x="1115"
      y="${scheduleStartY + 53}"
      text-anchor="end"
      fill="${muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="16"
      font-weight="800"
    >ЗАЛ</text>

    ${scheduleRows}

    <!-- расшифровка залов -->
    <text
      x="90"
      y="${hallY + 35}"
      fill="${accent}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="27"
      font-weight="900"
      letter-spacing="2"
    >РАСШИФРОВКА ЗАЛОВ</text>

    ${hallCards}

    <!-- контакт -->
    <rect
      x="90"
      y="${contactY}"
      width="1060"
      height="185"
      rx="24"
      fill="${card}"
      stroke="${accent}"
      stroke-width="3"
    />

    <text
      x="125"
      y="${contactY + 50}"
      fill="${muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="18"
      font-weight="800"
      letter-spacing="2"
    >ЗАПИСЬ К ТРЕНЕРУ</text>

    <text
      x="125"
      y="${contactY + 108}"
      fill="${text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="40"
      font-weight="900"
    >${phone}</text>

    <text
      x="125"
      y="${contactY + 150}"
      fill="${muted}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="19"
      font-weight="700"
    >г. Сарапул · ул. Советская, 46</text>

    <!-- место под QR -->
    <rect
      x="970"
      y="${contactY + 27}"
      width="130"
      height="130"
      rx="12"
      fill="${bw ? "#ffffff" : "#ffffff"}"
      stroke="${accent}"
      stroke-width="3"
    />

    <text
      x="1035"
      y="${contactY + 101}"
      text-anchor="middle"
      fill="#000000"
      font-family="Arial, Helvetica, sans-serif"
      font-size="25"
      font-weight="900"
    >QR</text>

    <!-- низ -->
    <text
      x="90"
      y="${contactY + 255}"
      fill="${text}"
      font-family="Arial, Helvetica, sans-serif"
      font-size="22"
      font-weight="900"
    >ТИТАН · САРАПУЛ</text>

    <line
      x1="90"
      y1="${contactY + 280}"
      x2="1150"
      y2="${contactY + 280}"
      stroke="${accent}"
      stroke-width="5"
    />
  </svg>
  `;
}

async function sendPoster(chat, trainer, theme) {
  const svg = makePoster(trainer, theme);
  const form = new FormData();

  form.append("chat_id", String(chat));
  form.append(
    "document",
    new Blob([svg], { type: "image/svg+xml" }),
    `TITAN_${trainer.name.replace(/\s+/g, "_")}_${theme}.svg`
  );

  form.append(
    "caption",
    `ТИТАН • ${trainer.name}\n${theme === "bw" ? "Ч/Б" : "Цветная"} версия • A4`
  );

  return fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
    method: "POST",
    body: form
  });
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(200).json({ ok: true, service: "TITAN Bot" });
  }

  try {
    const u = req.body || {};
    const m = u.message;
    const q = u.callback_query;
    const chat = m?.chat?.id || q?.message?.chat?.id;

    if (!chat) return res.status(200).json({ ok: true });

    if (q) {
      await api("answerCallbackQuery", {
        callback_query_id: q.id
      });
    }

    const d = q?.data || "";
    let text = "";
    let keyboard;

    if (m?.text === "/start" || d === "home") {
      text = "ТИТАН — генератор инфографики\n\nВыберите действие:";
      keyboard = [
        [{ text: "🖼 Создать инфографику", callback_data: "create" }],
        [{ text: "📅 Общее расписание", callback_data: "week" }],
        [{ text: "👤 Тренеры", callback_data: "trainers" }]
      ];
    }

    else if (d === "create") {
      text = "Выберите формат инфографики:";
      keyboard = [
        [{ text: "👤 1 тренер", callback_data: "count:1" }],
        [{ text: "👥 2 тренера", callback_data: "count:2" }],
        [{ text: "👥 3 тренера", callback_data: "count:3" }],
        [{ text: "⬅️ Назад", callback_data: "home" }]
      ];
    }

    else if (d.startsWith("count:")) {
      const n = d.split(":")[1];

      if (n !== "1") {
        text = `${n} тренера — шаблон подключим следующим этапом.\n\nСейчас полностью работает формат «1 тренер».`;
        keyboard = [
          [{ text: "👤 Создать для 1 тренера", callback_data: "count:1" }],
          [{ text: "⬅️ Назад", callback_data: "create" }]
        ];
      } else {
        text = "Выберите оформление:";
        keyboard = [
          [
            { text: "🟧 Цветная", callback_data: "theme:color" },
            { text: "⬜ Ч/Б", callback_data: "theme:bw" }
          ],
          [{ text: "⬅️ Назад", callback_data: "create" }]
        ];
      }
    }

    else if (d.startsWith("theme:")) {
      const theme = d.split(":")[1];
      text = "Выберите тренера:";

      keyboard = trainers.map((t, i) => [
        {
          text: t.name,
          callback_data: `poster:${theme}:${i}`
        }
      ]);

      keyboard.push([
        { text: "⬅️ Назад", callback_data: "count:1" }
      ]);
    }

    else if (d.startsWith("poster:")) {
      const [, theme, index] = d.split(":");
      const trainer = trainers[Number(index)];

      if (!trainer) throw new Error("Trainer not found");

      await api("sendMessage", {
        chat_id: chat,
        text: `⚙️ Создаю A4-инфографику для ${trainer.name}…`
      });

      await sendPoster(chat, trainer, theme);

      text = "Готово ✅\n\nМожно создать ещё одну инфографику:";
      keyboard = [
        [{ text: "🖼 Создать ещё", callback_data: "create" }],
        [{ text: "🏠 Главное меню", callback_data: "home" }]
      ];
    }

    else if (d === "trainers") {
      text =
        "ТРЕНЕРЫ «ТИТАН»\n\n" +
        trainers.map((t, i) =>
          `${i + 1}. ${t.name}\n${t.phone}`
        ).join("\n\n");

      keyboard = [
        [{ text: "🏠 Главное меню", callback_data: "home" }]
      ];
    }

    else if (d === "week") {
      text = "📅 Генератор общего недельного расписания подключим следующим модулем.";
      keyboard = [
        [{ text: "🏠 Главное меню", callback_data: "home" }]
      ];
    }

    else {
      text = "Нажмите /start";
    }

    if (text) {
      await api("sendMessage", {
        chat_id: chat,
        text,
        reply_markup: keyboard
          ? { inline_keyboard: keyboard }
          : undefined
      });
    }

    return res.status(200).json({ ok: true });

  } catch (e) {
    console.error(e);
    return res.status(200).json({
      ok: false,
      error: String(e?.message || e)
    });
  }
};
