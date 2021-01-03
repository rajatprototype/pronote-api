const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helpers = require('./helpers');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const STORAGE_BUCKET_DIR = path.join(__dirname, 'notes');

/**
 * Absolute path of specific note
 * @param {string} noteId - Note Id
 * @returns {string}
 */
function getNoteFilePath (noteId) {
  return path.join(STORAGE_BUCKET_DIR, noteId);
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Create storage bucket
if (fs.existsSync(STORAGE_BUCKET_DIR) === false) {
  fs.mkdirSync(STORAGE_BUCKET_DIR);
}

/**
 * Intro page 
 * @route GET /
 */
app.get('/', function (req, res) {
  return res.status(200).send("<code>Pronote API</code>");
});

/**
 * Get specific note
 * @route GET /note/[noteId]
 */
app.get('/note/:noteId', function (req, res) {
  const noteId = req.params.noteId;
  const noteFilePath = getNoteFilePath(noteId);
  let note = null;
  let status, message;

  try {
    if (fs.existsSync(noteFilePath)) {
      note = fs.readFileSync(noteFilePath, 'utf8'); // Read note
      status = 200;
      message = "Note found";
    }
    else {
      status = 404;
      message = "Can't find requested note"
    }
  }
  catch (err) {
    status = 500;
    message = "Error while getting requested note";
  }

  return res.status(status).json({
    message,
    note,
    id: noteId
  });
});

/**
 * Create or rewrite existing note
 * @route POST /note/[noteId]
 */
app.post('/note/:noteId', function (req, res) {
  const noteId = req.params.noteId;
  const noteFilePath = getNoteFilePath(noteId);
  const note = req.body.note || '';
  let status, message;

  if (typeof note === 'string' && note.length > 0) {
    try {
      fs.writeFileSync(noteFilePath, note, 'utf8'); // Write note
      status = 201;
      message = "Note saved";
    } catch (err) {
      status = 500;
      message = "Can't save your note";
    }
  }
  else {
    status = 400;
    message = "Can't save empty note";
  }

  return res.status(status).json({
    message,
    id: noteId
  });
});

/**
 * Delete specific note
 * @route DELETE /note/[noteId]
 */
app.delete('/note/:noteId', function (req, res) {
  const noteId = req.params.noteId;
  const noteFilePath = getNoteFilePath(noteId);
  let status, message;

  try {
    if (fs.existsSync(noteFilePath)) {
      fs.unlinkSync(noteFilePath); // Delete note
      status = 201;
      message = "Note deleted";
    }
  }
  catch (err) {
    status = 500;
    message = "Error while deleting note";
  }

  return res.status(status).json({
    message,
    id: noteId
  });
});

/**
 * Generate random note id
 * @route GET /id
 */
app.get('/id', function (req, res) {
  let genId, noteFilePath;

  do {
    genId = helpers.generateRandomNoteId();
    noteFilePath = getNoteFilePath(genId);
  }
  while (fs.existsSync(noteFilePath));

  return res.status(200).json({
    message: "Id generated",
    id: genId
  });
});

/**
 * Testing route
 * @route GET /test
 */
app.get('/test', function (req, res) {
  return res.status(200).json({
    message: "Testing endpoint"
  });
});

app.listen(PORT, function () {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`Server running on port:${PORT}`);
  }
});