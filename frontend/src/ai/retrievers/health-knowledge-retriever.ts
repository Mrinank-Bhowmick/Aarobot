"use server";

interface Document {
  content: Array<{ text: string }>;
  metadata: { [key: string]: any };
}

function createDocument(
  text: string,
  metadata: { [key: string]: any }
): Document {
  return {
    content: [{ text }],
    metadata,
  };
}

const healthDocs: Document[] = [
  createDocument(
    "Common cold symptoms include runny or stuffy nose, sore throat, cough, congestion, slight body aches or a mild headache, sneezing, and low-grade fever. Most people recover in 7-10 days.",
    { topic: "common cold", source: "internal KB" }
  ),
  createDocument(
    "High blood pressure (hypertension) often has no symptoms. If left untreated, it can cause health problems, such as heart disease and stroke. A reading of 130/80 mmHg or higher is considered high.",
    { topic: "hypertension", source: "internal KB" }
  ),
  createDocument(
    "Type 2 diabetes is a condition where the body doesn’t use insulin properly. Symptoms can include increased thirst, frequent urination, hunger, fatigue, and blurred vision. Management involves lifestyle changes and sometimes medication.",
    { topic: "diabetes", source: "internal KB" }
  ),
  createDocument(
    "General wellness tips include eating a balanced diet, getting regular exercise (at least 150 minutes of moderate-intensity activity per week), ensuring adequate sleep (7-9 hours for adults), managing stress, and avoiding smoking.",
    { topic: "wellness", source: "internal KB" }
  ),
  createDocument(
    "Migraines are severe headaches often accompanied by nausea, vomiting, and sensitivity to light and sound. Triggers vary but can include stress, certain foods, hormonal changes, and lack of sleep. Treatment may involve pain relievers and preventative medications.",
    { topic: "migraine", source: "internal KB" }
  ),
];

export async function findRelevantHealthDocs(
  query: string
): Promise<Document[]> {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter((word) => word.length > 2);

  return healthDocs.filter((doc) => {
    const contentLower = doc.content[0]?.text?.toLowerCase() || "";
    if (
      doc.metadata?.topic &&
      queryWords.some((word) => (doc.metadata!.topic as string).includes(word))
    ) {
      return true;
    }
    return queryWords.some((word) => contentLower.includes(word));
  });
}
