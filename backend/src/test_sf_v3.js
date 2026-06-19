import axios from "axios";
import { getBasicAuthHeader } from "./config/successFactors.js";

const testSF = async () => {
  const base_url = "https://apisalesdemo.successfactors.eu";
  const payload = {
    __metadata: { uri: "PerPerson" },
    personIdExternal: "john.doe.v3",
    dateOfBirth: `/Date(${new Date("1996-03-14").getTime()})/`
  };
  
  console.log("SF_BASE_URL:", base_url);
  console.log("Headers:", {
    Authorization: getBasicAuthHeader(),
    "Content-Type": "application/json",
    Accept: "application/json",
  });
  console.log("Payload:", payload);
  
  try {
    const response = await axios.post(`${base_url}/odata/v2/upsert`, payload, {
      headers: {
        Authorization: getBasicAuthHeader(),
        "Content-Type": "application/json",
        Accept: "application/json",
      }
    });
    console.log("Status:", response.status);
    console.log("Data:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("Error Status:", error.response?.status);
    console.error("Error Data:", JSON.stringify(error.response?.data, null, 2));
    console.error("Error Message:", error.message);
  }
};

testSF();
