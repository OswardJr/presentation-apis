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

/** Neutral, humanized briefing from Semrush case + Ahrefs CSV analysis. */
export function buildAgentBriefing(data: UsageData, logs: AnalyticsData): AgentInsight[] {
  const report = data.trigger_case.report;
  const { compare } = logs;

  return [
    {
      id: 'summary',
      slide: 'summary',
      tone: 'watch',
      title: 'Qué muestran los datos',
      body: `Semrush pasó de ${fmt(report?.balance_start ?? 36370)} a cero en tres días. En Ahrefs, el ciclo anterior llegó a ${fmt(compare.previous.units)} unidades y el actual lleva ${fmt(compare.current.units)}. Ya tenemos suficiente información para mejorar el control sin señalar a nadie.`,
    },
    {
      id: 'context',
      slide: 'summary',
      tone: 'calm',
      title: 'No todo consumo significa lo mismo',
      body: 'Parte del gasto prepara módulos de Orbit y deja datos guardados para reutilizarlos. Otra parte corresponde a búsquedas puntuales desde asistentes. La oportunidad es coordinar ambos caminos.',
    },
    {
      id: 'orbit-value',
      slide: 'orbit',
      tone: 'calm',
      title: 'El valor de guardar una vez',
      body: `Orbit consumió ${fmt(compare.current.orbit)} unidades en el ciclo actual, principalmente al preparar o actualizar módulos. Muchos resultados quedan en Supabase y pueden servir a varias personas sin volver a descargarlos.`,
    },
    {
      id: 'orbit-cost',
      slide: 'orbit',
      tone: 'calm',
      title: 'Operación baja, incorporación variable',
      body: 'Una vez que el módulo está listo y tiene datos almacenados, su operación diaria puede mantenerse con poco consumo. Las nuevas incorporaciones, históricos o mercados sí requieren una inversión inicial mayor.',
    },
    {
      id: 'collaboration',
      slide: 'recommendations',
      tone: 'watch',
      title: 'La mejora es trabajar juntos',
      body: 'Antes de repetir una búsqueda, podemos revisar si el dato ya existe en Orbit. Si hace falta algo nuevo, el equipo puede pedir que se almacene y quede disponible para todos.',
    },
    {
      id: 'guardrails',
      slide: 'recommendations',
      tone: 'calm',
      title: 'Límites que ayudan, no que bloquean',
      body: 'Topes por conexión, consultas pequeñas y alertas tempranas permiten seguir usando Ahrefs y los asistentes con libertad, evitando que una sola tarea consuma el margen del mes.',
    },
    {
      id: 'shared-plan',
      slide: 'plan',
      tone: 'calm',
      title: 'Una propuesta sencilla',
      body: 'Consultar primero lo que ya existe, pedir juntos los datos nuevos, guardarlos en Orbit y revisar el consumo cada semana. Es una mejora de proceso para todos, incluido quien presenta.',
    },
    {
      id: 'closing',
      slide: 'close',
      tone: 'calm',
      title: 'Objetivo común',
      body: 'No se trata de usar menos herramientas: se trata de aprovechar mejor cada descarga, compartir lo aprendido y cuidar juntos el presupuesto de la empresa.',
    },
  ];
}
