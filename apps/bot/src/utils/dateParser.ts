import {
  parse,
  addDays,
  setHours,
  setMinutes,
  nextDay,
  startOfDay,
  Day,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";

const TZ = "America/Sao_Paulo";

const WEEKDAYS: Record<string, Day> = {
  domingo: 0,
  segunda: 1,
  "segunda-feira": 1,
  terça: 2,
  "terça-feira": 2,
  quarta: 3,
  "quarta-feira": 3,
  quinta: 4,
  "quinta-feira": 4,
  sexta: 5,
  "sexta-feira": 5,
  sábado: 6,
  sabado: 6,
};

function extractTime(text: string): { hour: number; minute: number } | null {
  const match = text.match(/(\d{1,2})h(?:(\d{2}))?|(\d{1,2}):(\d{2})/i);
  if (!match) return null;
  const hour = parseInt(match[1] ?? match[3]);
  const minute = parseInt(match[2] ?? match[4] ?? "0");
  return { hour, minute };
}

function applyTime(date: Date, hour: number, minute: number): Date {
  return setMinutes(setHours(date, hour), minute);
}

export function parseAppointment(
  text: string
): { title: string; date: Date } | null {
  const lower = text.toLowerCase();
  const now = toZonedTime(new Date(), TZ);
  const time = extractTime(lower);

  let date: Date | null = null;

  // "amanhã"
  if (lower.includes("amanhã") || lower.includes("amanha")) {
    date = addDays(startOfDay(now), 1);
  }
  // "hoje"
  else if (lower.includes("hoje")) {
    date = startOfDay(now);
  }
  // "próximo <dia>"
  else {
    for (const [dayName, dayIndex] of Object.entries(WEEKDAYS)) {
      if (lower.includes(dayName)) {
        date = nextDay(now, dayIndex);
        break;
      }
    }
  }

  if (!date || !time) return null;

  date = applyTime(date, time.hour, time.minute);

  // Limpar o título removendo palavras de comando e data/hora
  const title = text
    .replace(/agendar|agenda|compromisso|reunião|consulta/gi, "")
    .replace(/amanhã|amanha|hoje|próximo|proximo|próxima|proxima/gi, "")
    .replace(
      /domingo|segunda[-\s]?feira?|terça[-\s]?feira?|quarta[-\s]?feira?|quinta[-\s]?feira?|sexta[-\s]?feira?|sábado|sabado/gi,
      ""
    )
    .replace(/\d{1,2}h\d{0,2}|\d{1,2}:\d{2}/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return { title: title || "Compromisso", date };
}

export function parseReminder(
  text: string
): { message: string; date: Date } | null {
  const parsed = parseAppointment(text);
  if (!parsed) return null;

  const message = text
    .replace(/lembrar|lembre|lembrete|me avisa[r]?|me avise/gi, "")
    .replace(/amanhã|amanha|hoje|próximo|proximo|próxima|proxima/gi, "")
    .replace(
      /domingo|segunda[-\s]?feira?|terça[-\s]?feira?|quarta[-\s]?feira?|quinta[-\s]?feira?|sexta[-\s]?feira?|sábado|sabado/gi,
      ""
    )
    .replace(/\d{1,2}h\d{0,2}|\d{1,2}:\d{2}/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  return { message: message || text, date: parsed.date };
}
