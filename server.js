const express = require('express')
const app = express();
const {MongoClient} = require('mongodb');

app.use(express.json({extended : false}));

const withDB = async(operations,res) =>{
    try {
        const client = await MongoClient.connect('mongodb://localhost:27017');
        const db = client.db("Blogs");
        await operations(db);
        client.close();
        
    } catch (error) {
      res.status(500).json({message:"erron in connection",error})  
    }
}


app.get('/api/articles/:name',async (req,res)=>{
withDB(async (db)=>{
    const articleName = req.params.name ;
    const articleInfo = await db.collection('articles').findOne({name:articleName});
    res.status(200).json(articleInfo);
},res)



})


app.post("/api/articles/:name/add-comments",(req,res)=>{
   const {username , text} = req.body
    const articleName = req.params.name

  withDB(async(db) =>{
    const articleInfo = await db.collection('articles').findOne({name:articleName});
    await db.collection('articles').updateOne({name:articleName},
        {
    $set :{
        comments:articleInfo.comments.concat({username,text}),
    },
  }
  );  
  const updateArticleInfo = await db.collection('articles').findOne({name:articleName})
                             
  res.status(200).json(updateArticleInfo);
},res);
});


app.post("/Signup",(req,res)=>{
  const {uname,password} = req.body
const usersData = {
  uname:uname,
  password:password
}

  withDB(async(db)=>{
    const uData = await db.collection('userData').insertOne(usersData)
    res.status(200).json({message:"success"}); 
  }, res);
  
})

app.post("/",(req,res)=>{
  const {email,pass} = req.body;

  withDB(async(db) =>{
    const getData = await db.collection('userData').findOne({uname:email})

    if(getData.uname===email && getData.password===pass){
      res.status(200).json({message:"Login sucess"});
    }
  },res)

})


app.listen(8000, ()=> console.log("http://localhost:8000/")) 


// const express = require('express');
// const app = express();
// const { MongoClient } = require('mongodb');

// app.use(express.json({ extended: false }));

// app.get('/api/articles/:name', async (req, res) => {
//     try {
//         const articleName = req.params.name;
//         console.log('Article Name:', articleName);  // Debugging log
//         const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true });
//         const db = client.db("Blogs");
        
//         // Log all documents in the collection for debugging
//         const allArticles = await db.collection('articles').find().toArray();
//         console.log('All Articles:', allArticles);

//         const articleInfo = await db.collection('articles').findOne({ articleName });
//         console.log('Article Info:', articleInfo);  // Debugging log

//         if (articleInfo) {
//             res.status(200).json(articleInfo);
//         } else {
//             res.status(404).json({ message: "Article not found" });
//         }
        
//         client.close();
//     } catch (error) {
//         console.error('Error in connection:', error);  // Debugging log
//         res.status(500).json({ message: "Error in connection", error });
//     }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
