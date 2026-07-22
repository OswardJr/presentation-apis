export interface PresenterGuide {
  id: string;
  title: string;
  say: string;
  tip: string;
  links: { label: string; url: string }[];
}

/** Order matches the public deck. */
export const PRESENTER_GUIDES: PresenterGuide[] = [
  {
    id: 'title',
    title: 'Portada',
    say: '“Voy a compartir datos y opciones de mejora. No buscamos responsables; buscamos que la información útil se pueda reutilizar.”',
    tip: 'Empieza despacio. Explica el orden: datos → Orbit → recomendaciones → gobernanza.',
    links: [],
  },
  {
    id: 'summary',
    title: 'Resumen de datos',
    say: '“Semrush nos mostró la necesidad de trazabilidad. Ahrefs nos permitió ver el volumen y comparar dos ciclos.”',
    tip: 'No entres todavía en usuarios ni herramientas. Quédate en los tres números grandes.',
    links: [
      {
        label: 'Ahrefs · límites y uso',
        url: 'https://docs.ahrefs.com/en/api/reference/subscription-info/get-limits-and-usage',
      },
      {
        label: 'Semrush · saldo de unidades',
        url: 'https://developer.semrush.com/api/get-started/api-units-balance/',
      },
    ],
  },
  {
    id: 'data',
    title: 'Lectura del consumo',
    say: '“Ambos usos tienen valor: uno responde necesidades puntuales y otro construye módulos compartidos. La mejora está en coordinarlos.”',
    tip: 'Evita decir “quién gastó”. Habla de canales: asistentes y módulos de Orbit.',
    links: [
      {
        label: 'Cómo Ahrefs calcula unidades',
        url: 'https://docs.ahrefs.com/en/api/docs/limits-consumption',
      },
      {
        label: 'Precios por créditos Ahrefs',
        url: 'https://help.ahrefs.com/en/articles/6061657-ahrefs-usage-based-pricing-for-credit-based-plans',
      },
    ],
  },
  {
    id: 'orbit',
    title: 'Cómo trabaja Orbit',
    say: '“Orbit convierte una descarga inicial en un dato que varias personas pueden consultar. El costo sube al incorporar; luego baja al reutilizar.”',
    tip: 'Pon un ejemplo real de un módulo: se descarga una vez, se guarda en Supabase y después se consulta desde la interfaz.',
    links: [
      {
        label: 'Ahrefs · cache y costo real',
        url: 'https://docs.ahrefs.com/en/api/docs/limits-consumption',
      },
    ],
  },
  {
    id: 'recommendations',
    title: 'Recomendaciones',
    say: '“Son opciones de trabajo, no prohibiciones. Si el dato falta, lo pedimos y buscamos dejarlo disponible para todos.”',
    tip: 'Invita al equipo a proponer qué datos repetitivos deberían convertirse en módulos.',
    links: [
      {
        label: 'Ahrefs MCP · límites por conexión',
        url: 'https://docs.ahrefs.com/en/mcp/docs/introduction',
      },
      {
        label: 'Ahrefs · administrar API keys',
        url: 'https://docs.ahrefs.com/en/api/docs/api-keys-creation-and-management',
      },
      {
        label: 'Semrush · ahorrar con display_limit',
        url: 'https://developer.semrush.com/api/get-started/api-units-balance/',
      },
    ],
  },
  {
    id: 'governance',
    title: 'Gobernanza',
    say: '“Para que esto funcione necesitamos una fuente de verdad, excepciones claras y responsabilidades compartidas. La intención es resolver rápido, no crear burocracia.”',
    tip: 'Recorre las tres columnas sin entrar en detalles técnicos. Confirma al final si el equipo está de acuerdo con los responsables propuestos.',
    links: [
      {
        label: 'Ahrefs · administrar API keys',
        url: 'https://docs.ahrefs.com/en/api/docs/api-keys-creation-and-management',
      },
      {
        label: 'Ahrefs · consultar límites',
        url: 'https://docs.ahrefs.com/en/api/reference/subscription-info/get-limits-and-usage',
      },
    ],
  },
  {
    id: 'plan',
    title: 'Plan conjunto',
    say: '“Propongo empezar pequeño: inventario esta semana, decisión conjunta en cada necesidad y una revisión de diez minutos los viernes.”',
    tip: 'Pregunta: “¿Qué búsqueda repiten hoy y les gustaría ver guardada en Orbit?”',
    links: [
      {
        label: 'Semrush · restricciones de uso',
        url: 'https://developer.semrush.com/api/introduction/api-usage-restrictions/',
      },
      {
        label: 'Ahrefs · guía de API',
        url: 'https://docs.ahrefs.com/en/api/docs/introduction',
      },
    ],
  },
  {
    id: 'close',
    title: 'Cierre',
    say: '“Descargar una vez y aprovechar entre todos. La propuesta también me incluye a mí: cualquiera puede repetir algo si no sabe que ya existe.”',
    tip: 'Cierra con una pausa y abre preguntas. No agregues más cifras.',
    links: [],
  },
];

/** Private path — not linked from the public deck. */
export const PRESENTER_NOTES_PATH = '/osward-apoyo-privado-7k3m';
