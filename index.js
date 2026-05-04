
```javascript
const Anthropic = require("@anthropic-ai/sdk");

// Inicializar cliente de Anthropic
const client = new Anthropic();

// Noticias financieras de ejemplo para análisis
const financialNews = [
  {
    id: 1,
    title: "Banco Central anuncia reducción de tasas de interés",
    content:
      "El Banco Central ha anunciado una reducción de 0.5% en las tasas de interés para el próximo trimestre. Los analistas consideran esta medida positiva para el mercado de valores y la economía general.",
    date: "2024-01-15",
  },
  {
    id: 2,
    title: "Startup tecnológica pierde 50% de su valor de mercado",
    content:
      "Una conocida startup de tecnología ha visto caer su valuación en más del 50% después de reportar pérdidas significativas. Los inversores expresan preocupación sobre el modelo de negocio de la empresa.",
    date: "2024-01-14",
  },
  {
    id: 3,
    title: "Empresa de energía renovable supera expectativas de ganancias",
    content:
      "La empresa de energía renovable reportó ganancias un 25% por encima de las proyecciones. El crecimiento en demanda de energía limpia continúa impulsando el sector positivamente.",
    date: "2024-01-13",
  },
  {
    id: 4,
    title: "Crisis en cadena de suministro global afecta múltiples sectores",
    content:
      "Disrupciones en la cadena de suministro están causando retrasos significativos en entregas. Múltiples empresas manufactureras han advertido que los márgenes de ganancia serán impactados negativamente.",
    date: "2024-01-12",
  },
  {
    id: 5,
    title: "Fusión corporativa crea nuevo gigante tecnológico",
    content:
      "Dos líderes de la industria tecnológica anunciaron su fusión, creando una entidad valorada en más de 500 mil millones de dólares. El mercado ha respondido positivamente con un aumento en el índice tecnológico.",
    date: "2024-01-11",
  },
];

// Función para analizar el sentimiento de una noticia usando Claude
async function analyzeSentiment(newsItem) {
  const prompt = `Analiza el sentimiento de la siguiente noticia financiera. Clasifica el sentimiento como POSITIVO, NEGATIVO o NEUTRAL.

Título: ${newsItem.title}
Contenido: ${newsItem.content}

Proporciona tu análisis en el siguiente formato JSON:
{
  "sentimiento": "POSITIVO|NEGATIVO|NEUTRAL",
  "confianza": 0-100,
  "explicacion": "breve explicación del sentimiento",
  "impacto_mercado": "alto|medio|bajo"
}`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  // Extraer el texto de respuesta
  const responseText =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Parsear JSON de la respuesta
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  return null;
}

// Función para generar un resumen del análisis usando Claude
async function generateSummary(sentimentAnalyses) {
  const analysisText = sentimentAnalyses
    .map(
      (item, index) =>
        `${index + 1}. ${item.newsItem.title} - Sentimiento: ${item.analysis.sentimiento}`
    )
    .join("\n");

  const prompt = `Basado en estos análisis de sentimiento de noticias financieras:

${analysisText}

Genera un resumen ejecutivo que:
1. Indique el sentimiento general del mercado
2. Identifique los principales riesgos y oportunidades
3. Sugiera acciones recomendadas para inversores
4. Proporcione un pronóstico de tendencia de corto plazo`;

  const message = await client.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return message.content[0].type === "text" ? message.content[0].text : "";
}

// Función principal
async function main() {
  console.log("=".repeat(80));
  console.log(
    "BOT DE ANÁLISIS DE SENTIMIENTO DE NOTICIAS FINANCIERAS".padStart(65)
  );
  console.log("=".repeat(80));
  console.log();

  const sentimentAnalyses = [];

  // Analizar cada noticia
  console.log("Analizando noticias financieras...\n");

  for (const newsItem of financialNews) {
    try {
      console.log(`📰 Analizando: ${newsItem.title}`);
      const analysis = await analyzeSentiment(newsItem);

      if (analysis) {
        sentimentAnalyses.push({
          newsItem,
          analysis,
        });

        console.log(
          `   Sentimiento: ${analysis.sentimiento} (Confianza: ${analysis.confianza}%)`
        );
        console.log(`   Explicación: ${analysis.explicacion}`);
        console.log(`   Impacto de mercado: ${analysis.