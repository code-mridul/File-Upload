const express = require('express');
const bodyParser = require('body-parser');
const path =  require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const methodOverride = require('method-override');


const app = express();

// Middleware
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');


// Mongo URI
const mongoURI = 'mongodb://file:file123@ds117422.mlab.com:17422/file-upload';

// Create mongo connection
const conn = mongoose.createConnection(mongoURI);

// Init gfs
let gfs;


conn.once('open', () => {
    // init stream
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

// create storage engine
const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads'
          };
          resolve(fileInfo);
        });
      });
    }
  });
  const upload = multer({ storage });


// get route = loads form
app.get('/', (req, res) => {
    res.render('index');
});

// post or upload route = uploads file to db
// upload multiple file upload.array('file',4) or upload.any()
app.post('/upload', upload.single('file'), (req, res) => {
    res.json({ file: req.file });
}) ;


const port = 8000;

app.listen(port, () => console.log(`Server started on port ${port}`));