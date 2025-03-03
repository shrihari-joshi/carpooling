import { GoogleGenerativeAI } from "@google/generative-ai";


const API_KEY = 'AIzaSyBqB0Cx88L4GgWEV6xl98Yx5eeV_5tG_3o'; // Ensure you have this in your .env.local file

const genAI = new GoogleGenerativeAI(API_KEY);

export const getDirections = async (driverStart, driverEnd, passengerLocations) => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const locations = [driverStart];
    passengerLocations.forEach((passenger) => {
        locations.push(passenger.pickup);
        locations.push(passenger.dropoff);
    });
    locations.push(driverEnd);

    const prompt = `
    Provide step-by-step driving directions starting from ${driverStart} and ending at ${driverEnd}, 
    picking up and dropping off passengers at the following locations in the given order:

    Locations: ${locations}

    Provide detailed, turn-by-turn directions suitable for a driver.
    Also provide a google maps link which will redirect to google maps.

  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return text;
    } catch (error) {
        console.error("Gemini API error:", error);
        throw new Error("Failed to generate directions."); // Throw an error that can be caught in your component
    }
};