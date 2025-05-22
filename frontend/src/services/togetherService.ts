import axios from 'axios';

// Define the DocumentAnalysis interface based on your expected output
// (Assuming this is what your component expects after analysis)
export interface DocumentAnalysis {
  id: string;
  summary: string;
  keyPoints: string[];
  topics: { name: string; confidence: number }[];
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

// Define the expected structure of the Together API response
interface TogetherApiResponse {
  analysis_id: string;
  summary: string;
  key_points: string[];
  topics?: { name: string; confidence: number }[]; // Make topics optional to match fallback logic
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  // Add other fields you expect from Together API if any
}

// Helper function to convert ArrayBuffer to Base64 in a browser environment
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary); // btoa is available in browsers for Base64 encoding
};

// Together API service for document analysis
export const togetherService = {
  // API configuration
  apiConfig: {
    baseURL: 'https://api.together.xyz/v1',
    // Securely get API key from environment variable
    // IMPORTANT: Ensure VITE_TOGETHER_API_KEY is set in your .env file
    // Do NOT hardcode sensitive API keys directly in client-side code for production.
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_TOGETHER_API_KEY}`,
      'Content-Type': 'application/json'
    }
  },

  /**
   * Analyzes a document using the Together API
   * @param fileContents - The file contents as ArrayBuffer
   * @returns DocumentAnalysis object with the analysis results
   * @throws Error if the API request fails
   */
  analyzeDocument: async (fileContents: ArrayBuffer): Promise<DocumentAnalysis> => {
    // Validate API key presence
    if (!import.meta.env.VITE_TOGETHER_API_KEY) {
      console.error("VITE_TOGETHER_API_KEY is not set. Please ensure it's in your .env file.");
      if (import.meta.env.DEV) {
        console.warn('Returning mock data due to missing API key in development mode.');
        return togetherService.getMockAnalysis();
      }
      throw new Error('API key is missing for document analysis.');
    }

    try {
      // Convert ArrayBuffer to Base64 using browser-compatible function
      const base64File = arrayBufferToBase64(fileContents);

      // Prepare request payload
      const payload = {
        file_data: base64File,
        analysis_type: 'comprehensive', // Ensure this is a valid type for Together API
        output_format: 'json'
      };

      console.log('Sending document analysis request to Together API...');
      const response = await axios.post<TogetherApiResponse>( // Specify response type for better typing
        `${togetherService.apiConfig.baseURL}/document-analysis`,
        payload,
        { headers: togetherService.apiConfig.headers }
      );

      // Process response data
      const data = response.data;
      console.log('Together API response:', data);

      // Transform API response to our DocumentAnalysis interface
      return {
        id: data.analysis_id || `analysis-${Date.now()}-fallback`, // Use fallback ID if missing
        summary: data.summary || 'No summary available.',
        keyPoints: data.key_points || [],
        // Ensure topics are correctly mapped and handled if null/undefined
        topics: data.topics?.map(topic => ({
          name: topic.name,
          confidence: topic.confidence
        })) || [],
        sentiment: data.sentiment || { // Provide default sentiment if missing
          positive: 0,
          neutral: 0,
          negative: 0
        }
      };

    } catch (error) {
      console.error('Error analyzing document:', error);

      // More granular error handling
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('API Error Response Data:', error.response.data);
          console.error('API Error Status:', error.response.status);
          console.error('API Error Headers:', error.response.headers);

          if (error.response.status === 401 || error.response.status === 403) {
             throw new Error('Authentication failed. Please check your API key.');
          } else if (error.response.status === 429) {
             throw new Error('Too many requests. Please try again after some time.');
          } else if (error.response.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
             throw new Error(`API Error: ${error.response.data.message}`);
          }
          throw new Error(`Server error: ${error.response.status} - ${error.response.statusText}`);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('No response received:', error.request);
          throw new Error('Network error. Please check your internet connection.');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Axios setup error:', error.message);
          throw new Error(`Request setup failed: ${error.message}`);
        }
      }

      // Fallback to mock data in development if an error occurs
      if (import.meta.env.DEV) {
        console.warn('Returning mock data in development mode after an error.');
        return togetherService.getMockAnalysis();
      }

      throw new Error('Failed to analyze document. An unexpected error occurred.');
    }
  },

  /**
   * Provides mock analysis data for development/testing
   * @returns Mock DocumentAnalysis
   */
  getMockAnalysis: (): DocumentAnalysis => {
    return {
      id: `mock-analysis-${Date.now()}`,
      summary: 'This is a mock summary of the document. It highlights the main points and overall content, indicating that the document is well-structured and informative.',
      keyPoints: [
        'Mock Key Point 1: Important concept discussed.',
        'Mock Key Point 2: Specific detail or finding.',
        'Mock Key Point 3: Future implications or recommendations.'
      ],
      topics: [
        { name: 'Mock Topic A', confidence: 0.88 },
        { name: 'Mock Topic B', confidence: 0.75 },
        { name: 'Mock Topic C', confidence: 0.60 }
      ],
      sentiment: {
        positive: 0.70,
        neutral: 0.25,
        negative: 0.05
      }
    };
  }
};