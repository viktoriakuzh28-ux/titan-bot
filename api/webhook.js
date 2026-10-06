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
  const bg = bw ? "#ffffff" : "#0b0b0b";
  const fg = bw ? "#111111" : "#ffffff";
  const muted = bw ? "#555555" : "#d8d8d8";
  const accent = bw ? "#111111" : "#ff6a00";
  const card = bw ? "#f2f2f2" : "#171717";
  const line = bw ? "#c7c7c7" : "#333333";

  const scheduleRows = t.schedule.map((s, i) => {
    const y = 720 + i * 62;
    return `
      <rect x="80" y="${y}" width="1080" height="50" rx="12"
            fill="${i % 2 ? card : bg}" stroke="${line}" stroke-width="2"/>
      <text x="105" y="${y + 33}" fill="${accent}" font-size="25" font-weight="800">${esc(s[0])}</text>
      <text x="185" y="${y + 33}" fill="${fg}" font-size="25" font-weight="700">${esc(s[1])}</text>
      <text x="375" y="${y + 33}" fill="${fg}" font-size="23">${esc(s[2])}</text>
      <text x="1125" y="${y + 33}" fill="${muted}" font-size="21" text-anchor="end">${esc(s[3])}</text>
    `;
  }).join("");

  const dirRows = t.directions.slice(0, 5).map((d, i) => {
    const y = 365 + i * 62;
    return `
      <text x="82" y="${y}" fill="${accent}" font-size="25" font-weight="800">${esc(d[0])}</text>
      <text x="82" y="${y + 29}" fill="${muted}" font-size="19">${esc(d[1])}</text>
    `;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="1240" height="1754" viewBox="0 0 1240 1754">
    <rect width="1240" height="1754" fill="${bg}"/>

    <rect x="0" y="0" width="1240" height="22" fill="${accent}"/>

    <text x="80" y="115" fill="${accent}"
          font-family="Arial, sans-serif" font-size="74" font-weight="900">ТИТАН</text>

    <text x="80" y="164" fill="${muted}"
          font-family="Arial, sans-serif" font-size="23" font-weight="700"
          letter-spacing="5">СПОРТИВНЫЙ КОМПЛЕКС</text>

    <line x1="80" y1="205" x2="1160" y2="205" stroke="${line}" stroke-width="3"/>

    <text x="80" y="278" fill="${fg}"
          font-family="Arial, sans-serif" font-size="54" font-weight="900">${esc(t.name)}</text>

    <text x="82" y="320" fill="${accent}"
          font-family="Arial, sans-serif" font-size="22" font-weight="800"
          letter-spacing="3">ГРУППОВЫЕ ТРЕНИРОВКИ</text>

    <g font-family="Arial, sans-serif">
      ${dirRows}

      <text x="80" y="675" fill="${fg}" font-size="32" font-weight="900">РАСПИСАНИЕ</text>
      ${scheduleRows}
    </g>

    <g transform="translate(80 1480)">
      <rect width="1080" height="170" rx="24" fill="${card}" stroke="${line}" stroke-width="2"/>

      <text x="35" y="52" fill="${muted}"
            font-family="Arial, sans-serif" font-size="20" font-weight="700">ЗАПИСЬ К ТРЕНЕРУ</text>

      <text x="35" y="103" fill="${fg}"
            font-family="Arial, sans-serif" font-size="35" font-weight="900">${esc(t.phone)}</text>

      <text x="35" y="139" fill="${muted}"
            font-family="Arial, sans-serif" font-size="18">г. Сарапул · ул. Советская, 46</text>

      <rect x="925" y="25" width="120" height="120" rx="12"
            fill="${bw ? "#fff" : "#fff"}"/>

      <text x="985" y="78" text-anchor="middle"
            fill="#111" font-family="Arial, sans-serif"
            font-size="16" font-weight="900">QR</text>

      <text x="985" y="101" text-anchor="middle"
            fill="#555" font-family="Arial, sans-serif"
            font-size="11">ЗОНА</text>
    </g>

    <text x="620" y="1710" text-anchor="middle"
          fill="${muted}" font-family="Arial, sans-serif"
          font-size="17" letter-spacing="2">ТИТАН · САРАПУЛ</text>
  </svg>`;
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
