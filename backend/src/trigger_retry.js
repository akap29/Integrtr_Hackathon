import axios from "axios";

const trigger = async () => {
  try {
    console.log("Triggering retry API...");
    const res = await axios.post("http://localhost:5000/api/onboarding/6a3542ab17d89d622d7eb182/retry");
    console.log("Response:", res.data);
    
    // Poll for status check every 3 seconds, up to 10 times
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const statusRes = await axios.get("http://localhost:5000/api/onboarding/6a3542ab17d89d622d7eb182");
      const doc = statusRes.data.data;
      console.log(`Poll ${i+1}: Overall Status: ${doc.overallStatus}, SF Write: ${doc.steps.sf_write.status}`);
      if (doc.overallStatus === "completed" || doc.overallStatus === "failed" || doc.steps.sf_write.status === "failed") {
        console.log("Onboarding completed or failed. Error if any:", doc.steps.sf_write.error);
        break;
      }
    }
  } catch (err) {
    console.error("Error triggering retry:", err.message);
  }
};

trigger();
