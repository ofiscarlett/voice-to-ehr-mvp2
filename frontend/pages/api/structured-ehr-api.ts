//set up Api server to process raw text to backend 
import type {NextApiRequest, NextApiResponse  } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }
    const { text, ehr_id } = req.body;

    console.log("Received text:", text); // Log the received text
    if (!text || text.length < 10) {
        console.error("Text is required or too short"); // Log the error
        // Return a 400 Bad Request response if the text is not provided or too short
      return res.status(400).json({ 
        status: 'error',
        code: 400,
        message: 'Text is required or too short',
        data: null, });
    }
    try {
      // Process the text here, e.g., save it to a database or perform some analysis
      console.log("Debug processing text:", text); // Log the text being processed
      const backendResponse = await fetch("http://localhost:5001/api/analysis/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, ehr_id }),//add ehr_id to get ehrid
      });
      const BackendResult = await backendResponse.json();

      if (!backendResponse.ok) {
        console.warn(' Backend error:', BackendResult);
        return res.status(backendResponse.status).json({
          status: 'error',
          code: backendResponse.status,
          message: BackendResult.message || 'Backend analysis failed',
          data: BackendResult.data || null
        });
      }
      console.log('Debug API response:', BackendResult); 
      return res.status(200).json({
        status: 'success',
        code: 200,
        message: 'Analysis completed',
        data: BackendResult
      });

    } catch (error) {
        console.error('Internal error:', error);
        return res.status(500).json({
            status: 'error',
            code: 500,
            message: 'Internal server error',
            data: null
        });
    }   
}
