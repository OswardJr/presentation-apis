import type { AnalyticsData } from './analyticsTypes';
import type { UsageData } from './types';

export type InsightTone = 'calm' | 'watch' | 'alert';

export interface AgentInsight {
  id: string;
  tone: InsightTone;
  title: string;
  body: string;
  slide?: string;
}

function fmt(n: number): string {
  return n.toLocaleString('es-CO');
}

/** Humanized briefing from Semrush case + Ahrefs CSV forensics */
export function buildAgentBriefing(data: UsageData, logs: AnalyticsData): AgentInsight[] {
  const report = data.trigger_case.report;
  const { compare, previous: prev, current: cur } = logs;
  const openaiPrev = prev.by_agent.find((a) => a.name.includes('OpenAI'))?.units ?? 0;
  const topCall = cur.top_calls[0];

  return [
    {
      id: 'semrush-story',
      slide: 'semrush',
      tone: 'alert',
      title: 'Lo que nos pasó con Semrush',
      body: `En un fin de semana pasamos de ${fmt(report?.balance_start ?? 36370)} a cero. Casi todo ese gasto no dejó huella en nuestros sistemas. Fue como vaciar la nevera con la puerta cerrada: solo vimos que estaba vacía el lunes.`,
    },
    {
      id: 'semrush-lesson',
      slide: 'semrush',
      tone: 'watch',
      title: 'La lección en cristiano',
      body: 'Si alguien consulta por fuera de nuestra plataforma, nosotros no lo vemos. Con Ahrefs al menos el export dice quién usó la llave y si vino de un asistente de IA. Eso nos da ventaja para poner reglas.',
    },
    {
      id: 'prev-month',
      slide: 'csv-compare',
      tone: 'alert',
      title: 'El mes que se nos fue de las manos',
      body: `Entre junio y julio gastamos ${fmt(compare.previous.units)} unidades. Más de la mitad (${fmt(compare.previous.accesos)}) salió por Accesos con asistentes de IA. No fue el panel de Ahrefs: fueron conversaciones que pedían datos caros una y otra vez.`,
    },
    {
      id: 'orbit-vs-mcp',
      slide: 'csv-compare',
      tone: 'calm',
      title: 'Orbit no es el villano',
      body: `Cuando Orbit gasta (${fmt(compare.current.orbit)} este ciclo), casi siempre está armando o actualizando módulos. Esa información se guarda en Supabase para no pagar de nuevo. El gasto que duele es el de los chats: se usa y se olvida.`,
    },
    {
      id: 'pace',
      slide: 'csv-compare',
      tone: 'watch',
      title: 'El ritmo de ahora',
      body: `Vamos a unas ${fmt(compare.current.per_day)} unidades por día. Es casi el mismo ritmo del mes que se comió el cupo. Si no ponemos techo al uso por chat, en tres semanas estamos otra vez al borde.`,
    },
    {
      id: 'two-doors',
      slide: 'users-agents',
      tone: 'calm',
      title: 'Dos puertas al mismo presupuesto',
      body: `Hay dos llaves. Accesos (el equipo) abre la puerta de los chats de IA. Esteban / Orbit abre la de la plataforma. Las dos gastan del mismo bolsillo, pero solo Orbit deja el trabajo hecho para mañana.`,
    },
    {
      id: 'openai-burn',
      slide: 'users-agents',
      tone: 'alert',
      title: 'El chat que más nos costó',
      body: `Solo con OpenAI conectado a Ahrefs se fueron unas ${fmt(openaiPrev)} unidades el mes pasado. Una pregunta mal hecha —listas largas de keywords— puede costar más que una semana de trabajo ordenado en Orbit.`,
    },
    {
      id: 'expensive-call',
      slide: 'endpoints-geo',
      tone: 'alert',
      title: 'La llamada que duele',
      body: topCall
        ? `La más cara reciente: ${fmt(topCall.units)} unidades en un solo golpe (${topCall.endpoint}). Si eso se repite diez veces en una tarde, desaparece el margen del mes.`
        : 'Hay llamadas sueltas de más de trece mil unidades. Eso no es investigar: es vaciar el tanque.',
    },
    {
      id: 'where-from',
      slide: 'endpoints-geo',
      tone: 'watch',
      title: 'Desde dónde llega',
      body: 'Los chats de IA no dejan IP clara: aparecen como si vinieran “de la nube de Ahrefs”. Orbit sí deja rastro en servidores de Estados Unidos. Por eso conviene que el trabajo de clientes pase por Orbit: se ve y se reutiliza.',
    },
    {
      id: 'what-to-do',
      slide: 'actions',
      tone: 'calm',
      title: 'Qué haría yo esta semana',
      body: 'Poner un techo a la llave de Accesos. Pedir que el trabajo de clientes viva en Orbit. Dejar los chats solo para dudas puntuales, no para barrer mercados enteros. Y con Semrush: preguntar quién más tenía la llave.',
    },
    {
      id: 'closing',
      slide: 'close',
      tone: 'calm',
      title: 'En una frase',
      body: 'Cuidemos el presupuesto donde el gasto se evapora (chats). Protejamos y prefiramos donde el gasto deja memoria (Orbit).',
    },
  ];
}
