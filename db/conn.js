const mongoose = require("mongoose");
const url = process.env.MONGO_URL;

mongoose.connect(url, {
   
    dbName: 'mernYoutubeSearchInterface',
   
})
.then(async () => {
    console.log(`MongoDB Connected...`);

   
    const conn = mongoose.connection;
    const collection = conn.collection('users');

    try {
        const indexes = await collection.indexes();
       // console.log("Indexes on 'users' collection:", indexes);
    } catch (error) {
        console.error("Error checking indexes:", error);
        if (error.code === 11000 && error.keyPattern && error.keyPattern.mobile) {
           
            return res.status(400).json({ error: "Mobile number already exists." });
        } else {
            
            console.error("Error:", error);
            return res.status(500).json({ error: "Internal server error." });
        }
    }
})
.catch((err) => {
    console.log("Error while creating MongoDB connection ", err);
});
