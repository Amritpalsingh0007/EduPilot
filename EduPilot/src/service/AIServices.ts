import axios from "axios";
const BaseURL = import.meta.env.VITE_BACKEND_BASE_URL;
// Fetches response for chat conversion
async function getResponse(token: string, message: string) {
  try {
    const response = await axios.post(
      BaseURL + "/api/v1/chat",
      { prompt: message },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.response[0].content;
  } catch (error) {
    console.error("Error:", error);
    return "Error fetching response";
  }
}

// Fetches roadmap
async function getRoadmap(token: string) {
  try {
    const response = await axios.get(BaseURL + "/api/v1/roadmap", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(`error ${error}`);
    return {};
  }
}

// Uploads a file
async function uploadFile(token: string, file: File) {
    try {
      const formData = new FormData();
      formData.append("file", file); 
  
      const response = await axios.post( BaseURL+ 
        "/api/v1/file/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      return response.data;
    } catch (error) {
      console.error("Upload error:", error);
      return { error: "Error uploading file" };
    }
  }
  
// Fetches files for the user
async function getUserFiles(token: string) {
  console.log("Fetching user files... : "+ `${BaseURL}api/v1/file/`);
    try {
      const response = await axios.get( BaseURL+"/api/v1/file/", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return response.data.files; 
    } catch (error) {
      console.error("Error fetching user files:", error);
      return [];
    }
  }
  
// Fetches lessons for a specific file
async function getLessons(token: string, fileId: string) {
  try {
    const response = await axios.get(`${BaseURL}/api/v1/file/lessons/${fileId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data.lessons; 
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return [];
  }
}

 
// Fetches lessons for a specific file
async function getContent(token: string, fileId: string) {
  try {
    const response = await axios.get(`${BaseURL}/api/v1/file/lessons/content/${fileId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data.lesson; 
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return [];
  }
}


// Fetches lessons for a specific file
async function createLesson(token: string, fileId: string) {
  try {
    const response = await axios.get(`${BaseURL}/api/v1/lesson/create/${fileId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data; 
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return [];
  }
}

// Fetches lessons for a specific file
async function getQuiz(token: string, lessonID: string) {
  try {
    const response = await axios.get(`${BaseURL}/api/v1/lesson/quiz/${lessonID}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data.quiz.questions; 
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return [];
  }
}

async function submitQuiz(token: string, fileID: string, strengths: string[], weaknesses: string[], mcq_score: number) {
  try {
    await axios.post(`${BaseURL}/api/v1/file/${fileID}`,{
      strength: strengths,
      weakness: weaknesses,
      mcq_score: mcq_score
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });; 
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return [];
  }

}


async function getActivity(token: string) {
  try {
    const response = await axios.get(`${BaseURL}/api/v1/file/activity`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data.activity; 
  } catch (error) {
    console.error("Error fetching lessons:", error);
    return [];
  }
}

export { getResponse, getRoadmap, uploadFile, getUserFiles, getLessons, getContent, createLesson, getQuiz, submitQuiz, getActivity };
