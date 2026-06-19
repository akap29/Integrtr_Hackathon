import mongoose from "mongoose";

const run = async () => {
  await mongoose.connect("mongodb://127.0.0.1:27017/integrtr_hackathon");
  const docs = await mongoose.connection.db.collection("employeeonboardings").find({ overallStatus: "completed" }).toArray();
  for (const doc of docs) {
    console.log(`Emp: ${doc.employee?.firstName} ${doc.employee?.lastName}`);
    console.log(`  Dept: ${doc.employee?.department}`);
    console.log(`  Title: ${doc.employee?.jobTitle}`);
    console.log(`  Joining: ${doc.employee?.joiningDate}`);
    console.log(`  SF ID: ${doc.successFactors?.employeeId}`);
  }
  await mongoose.disconnect();
};

run();
