import mongoose from "mongoose";


const onboardingSchema = new mongoose.Schema(
{
  onboardingRequestId: {
    type: String,
    required: true,
    unique: true
  },


  initiatedAt: {
    type: Date,
    default: Date.now
  },


  employee: {

    firstName: {
      type: String,
      required: true,
      trim: true
    },


    lastName: {
      type: String,
      required: true,
      trim: true
    },


    maritalStatus:{
      type: String,
      enum: [
        "single",
        "married",
        "divorced",
        "widowed"
      ]
    },


    nationalId:{
      type: String,
      required: true,
      select: false
    },


    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },


    dateOfBirth:{
      type: Date,
      required: true
    },


    gender:{
      type: String,
      enum:[
        "male",
        "female",
        "other"
      ]
    },


    nationality:{
      type:String,
      trim:true
    },


    department:{
      type:String,
      trim:true
    },


    jobTitle:{
      type:String,
      trim:true
    },


    designation:{
      type:String,
      trim:true
    },


    joiningDate: Date

  },


  hr:{

    name:{
      type:String,
      required:true,
      trim:true
    },


    email:{
      type:String,
      required:true,
      lowercase:true,
      trim:true
    }

  },


  successFactors:{

    employeeId:String,

    profileUrl:String

  },


  steps:{


    sf_write:{

      status:{
        type:String,
        enum:[
          "pending",
          "success",
          "failed"
        ],
        default:"pending"
      },


      error:String,


      executedAt:Date

    },


    team_slack:{


      status:{
        type:String,
        enum:[
          "pending",
          "success",
          "failed"
        ],
        default:"pending"
      },


      error:String,


      executedAt:Date

    },


    hr_slack:{


      status:{
        type:String,
        enum:[
          "pending",
          "success",
          "failed"
        ],
        default:"pending"
      },


      error:String,


      executedAt:Date

    }

  },


  overallStatus:{

    type:String,

    enum:[
      "pending",
      "in_progress",
      "completed",
      "partially_failed",
      "failed"
    ],

    default:"pending"

  },


  retryCount:{

    type:Number,

    default:0,

    max:5

  }

},
{
  timestamps:true
});



// Unique employee check using National ID / Aadhaar
onboardingSchema.index(
  {
    "employee.nationalId":1
  },
  {
    unique:true
  }
);



const EmployeeOnboarding = mongoose.model(
  "EmployeeOnboarding",
  onboardingSchema
);

export default EmployeeOnboarding;