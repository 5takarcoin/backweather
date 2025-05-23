import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import dotenv from "dotenv";
import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { MemorySaver } from "@langchain/langgraph";

dotenv.config();

const checkpointSaver = new MemorySaver();
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
});

const getWeatherSchema = z.object({
  locationName: z.string().describe("The name of the location"),
});

async function getWeather({ locationName }) {
  const link = `http://api.weatherapi.com/v1/current.json?key=${process.env.FreeWeather}&q=${locationName}&aqi=no`;
  const res = await fetch(link);
  const data = await res.json();

  console.log("Khaice reee, khaice re", data);
  return {
    temperature_in_celsius: data.current.temp_c,
    temperatur_in_fahrenheit: data.current.temp_f,
    location: data.location.name,
    windspeed: data.current.wind_kph,
    humidity: data.current.humidity,
    condition: data.current.condition.text,
    feels_like_in_celsius: data.current.feelslike_c,
    feels_like_in_fahrenheit: data.current.feelslike_f,
    precipitation: data.current.precip_mm,
    pressure: data.current.pressure_mb,
    description: `In ${data.location.name}, it's currently ${data.current.temp_c}°C with ${data.current.condition.text}.`,
  };
}

const getWeatherTool = tool(getWeather, {
  name: "getWeather",
  description: `
    Get current weather info for any location.
    The user may make a mistake in the location name, so be sure to check if the location is valid. Try to correct it if possible. Take the closest match if the location is not found.
    Example location names:
    - Dahka --> Call with Dhaka
    - Newyork --> Call with New York
    - Barishal --> Call with Barisal
    - Dhaka, Bangladesh --> Call with Dhaka
    Use this to answer any question involving temperature, rain, snow, heat, cold, umbrella needs, storms, or general weather condition. 
    Example questions:
    - Will it rain today in Dhaka?
    - Should I carry an umbrella?
    - What's the temperature in New York?
    - Is it sunny in Tokyo?
    - Will it be cats and dogs today in Paris?
  `,
  schema: getWeatherSchema,
});

export const agent = createReactAgent({
  llm: model,
  tools: [getWeatherTool],
  system: `You are a helpful weather assistant.
  If no units are specified, return the temperature in Celsius. 
  Get the weather information from the tool call and process it accordingly.
Only answer questions related to weather. 
If location is missing, ask the user for it. 
If the question is not weather-related, say: "Sorry, I can't answer that."`,
  checkpointSaver,
});

// console.log(await getWeather("Dhaka"));
