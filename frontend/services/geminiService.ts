
// import { GoogleGenAI } from "@google/genai";

// const getAIClient = () => {
//   return new GoogleGenAI({ apiKey: process.env.API_KEY });
// };

// export const generateAIAnswer = async (questionTitle: string, questionContent?: string) => {
//   const ai = getAIClient();
//   const prompt = `You are an expert Cybersecurity Analyst on the platform "Codevirus Insights". 
//   Provide a detailed, technical, and ethically responsible answer to the following query. 
  
//   Question: ${questionTitle}
//   Context: ${questionContent || 'No additional context provided.'}
  
//   Format the answer in professional markdown. Include technical terms, best practices, and security considerations.`;

//   try {
//     const response = await ai.models.generateContent({
//       model: "gemini-3-flash-preview",
//       contents: prompt,
//       config: {
//         tools: [{ googleSearch: {} }],
//       },
//     });

//     const text = response.text || "Encryption error: Unable to generate response.";
//     const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
//       ?.filter((chunk: any) => chunk.web)
//       ?.map((chunk: any) => ({
//         title: chunk.web.title,
//         uri: chunk.web.uri,
//       })) || [];

//     return { text, sources };
//   } catch (error) {
//     console.error("Gemini Error:", error);
//     throw error;
//   }
// };

// export const generateTopicImage = async (topic: string) => {
//   const ai = getAIClient();
//   try {
//     const response = await ai.models.generateContent({
//       model: 'gemini-2.5-flash-image',
//       contents: {
//         parts: [
//           {
//             text: `A cinematic, high-tech cybersecurity conceptual image representing: ${topic}. Digital streams, matrix-style data, glowing nodes, professional security dashboard aesthetic. Blue color scheme.`,
//           },
//         ],
//       },
//       config: {
//         imageConfig: {
//           aspectRatio: "16:9",
//         },
//       },
//     });

//     for (const part of response.candidates[0].content.parts) {
//       if (part.inlineData) {
//         return `data:image/png;base64,${part.inlineData.data}`;
//       }
//     }
//   } catch (error) {
//     console.error("Image generation error:", error);
//     return `https://picsum.photos/seed/${topic}/800/450`;
//   }
// };
