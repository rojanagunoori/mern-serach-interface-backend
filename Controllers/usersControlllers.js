const users = require("../models/usersSchema");
const moment = require("moment");
const csv=require("fast-csv")
const fs=require("fs")
const path = require("path");
const BASE_URL=process.env.BASE_URL

exports.userpost = async (req, res) => {
  const file = req.file ? req.file.filename : null;
  const { fname, lname, email, mobile, gender, location, status } = req.body;

  if (!fname || !lname || !email || !mobile || !gender || !location || !status || !file) {
    return res.status(401).json("All inputs are required");
  }
 
  try {
    const peruser = await users.findOne({ $or: [{ email: email }, { mobile: mobile }] });
  
    if (peruser) {
      if (peruser.email === email) {
        return res.status(401).json("This email already exists in our database");
      } else if (peruser.mobile === mobile) {
        return res.status(401).json("This mobile number is already taken");
      }
       
        
      
    } else {
      const dateCreated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

      const userData = new users({
        fname,
        lname,
        email,
        mobile,
        gender,
        location,
        status,
        profile: file,
        dateCreated
      });

      await userData.save();
      return res.status(200).json(userData);
    }
  } catch (error) {
    console.error("Error in catch block:", error);
    return res.status(500).json({ error: error.message });
  }
};

//userget

exports.userget=async(req,res)=>{
  const search=req.query.search || ""
  const gender=req.query.gender || ""
  const status=req.query.status || ""
  const sort=req.query.sort || ""
  const page=req.query.page || 1
  const ITEM_PER_PAGE=4

  const query={
    fname:{$regex:search,$options:"i"}
  }
  if(gender!=="All"){
    query.gender=gender
  }
  if(status!=="All"){
    query.status=status
  }
  try {
    const skip=(page-1)*ITEM_PER_PAGE //(1-1)*4=0

    const count=await users.countDocuments(query)
    
    
    const usersData=await users.find(query).sort({dateCreated:sort==="New"?-1:1})
    .limit(ITEM_PER_PAGE).skip(skip)
    const pageCount=Math.ceil(count/ITEM_PER_PAGE)  // 8/4=2
   
    res.status(200).json(
{Pagination:{count,pageCount},
      usersData}
    )
  } catch (error) {
    res.status(401).json(error)
  }
}

//single user get

exports.singleuserget=async(req,res)=>{
  const {id}=req.params
  try {
    const userdata=await users.findOne({_id:id})
    res.status(200).json(userdata)
  } catch (error) {
    res.status(401).json(error)
  }
}

//user edit 

// user edit
exports.useredit = async (req, res) => {
  const { id } = req.params;
  const { fname, lname, email, mobile, gender, location, status, user_profile } = req.body;
  const file = req.file ? req.file.filename : user_profile;
  const dateUpdated = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");

  try {
    // Find the current user by id
    const currentUser = await users.findById(id);

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if email or mobile already exists for another user
    const existingUserWithEmail = await users.findOne({ email: email, _id: { $ne: id } });
    const existingUserWithMobile = await users.findOne({ mobile: mobile, _id: { $ne: id } });

    if (existingUserWithEmail) {
      return res.status(401).json({ error: "This email already exists in our database" });
    }

    if (existingUserWithMobile) {
      return res.status(401).json({ error: "This mobile number is already taken" });
    }

    // Update the user
    const updatedUser = await users.findByIdAndUpdate(
      { _id: id },
      {
        fname,
        lname,
        email,
        mobile,
        gender,
        location,
        status,
        profile: file,
        dateUpdated,
      },
      { new: true }
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: error.message });
  }
};



//delete user

exports.userdelete=async(req,res)=>{
const {id}=req.params
try {
  const deleteuser=await users.findByIdAndDelete({_id:id})
  res.status(200).json(deleteuser)
} catch (error) {
  res.status(401).json(error)
}
}

//change status

exports.userstatus=async(req,res)=>{
  const {id}=req.params
  const {data}=req.body
  try {
    const userstatusupdate=await users.findByIdAndUpdate({_id:id},{status:data},{new:true})
    res.status(200).json(userstatusupdate)
  } catch (error) {
    console.log(error)
    res.status(401).json(error)
  }
}

//export user

exports.userExport = async (req, res) => {
  try {
      const usersdata = await users.find();
      
      const csvStream = csv.format({ headers: true });
      const exportDir = path.join(__dirname, "../public/files/export");

      // Ensure the export directory exists
      await fs.promises.mkdir(exportDir, { recursive: true });

      const writableStream = fs.createWriteStream(path.join(exportDir, "users.csv"));
      csvStream.pipe(writableStream);

      writableStream.on("finish", function () {
          res.json({
              downloadUrl: `${BASE_URL}/files/export/users.csv`
          });
      });

      if (usersdata.length > 0) {
          usersdata.forEach(user => {
              csvStream.write({
                  FirstName: user.fname || "-",
                  LastName: user.lname || "-",
                  Email: user.email || "-",
                  Phone: user.mobile || "-",
                  Gender: user.gender || "-",
                  Status: user.status || "-",
                  Profile: user.profile || "-",
                  Location: user.location || "-",
                  DateCreated: user.dateCreated || "-",
                  DateUpdated: user.dateUpdated || "-"
              });
          });
      }
      csvStream.end();
  } catch (error) {
      console.error("Error exporting users:", error);
      res.status(500).json({ error: error.message });
  }
};