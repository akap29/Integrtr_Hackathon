import axios from "axios";
import { SF_BASE_URL, getBasicAuthHeader } from "./config/successFactors.js";

const query = async () => {
  try {
    const response = await axios.get(`${SF_BASE_URL}/odata/v2/EmpJob?$top=1`, {
      headers: { Authorization: getBasicAuthHeader(), Accept: "application/json" }
    });
    console.log("EmpJob Fields:", Object.keys(response.data.d.results[0]));
    console.log("EmpJob Sample Record:", JSON.stringify(response.data.d.results[0], null, 2));
  } catch (err) {
    console.error("EmpJob Error:", err.message);
  }
};

query();
