import axios from "axios";
import { SF_BASE_URL, getBasicAuthHeader } from "./config/successFactors.js";

const getSaksham = async () => {
  try {
    const response = await axios.get(`${SF_BASE_URL}/odata/v2/User('saksham')`, {
      headers: {
        Authorization: getBasicAuthHeader(),
        Accept: "application/json",
      }
    });
    console.log("Saksham Data:", JSON.stringify({
      userId: response.data.d.userId,
      username: response.data.d.username,
      status: response.data.d.status,
      firstName: response.data.d.firstName,
      lastName: response.data.d.lastName,
      displayName: response.data.d.displayName
    }, null, 2));
  } catch (error) {
    console.error("Error:", error.message);
  }
};

getSaksham();
