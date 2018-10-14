const express = require('express');
const app = express();

app.use(express.static('public'));

const PORT = 4000 || process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server Started listening at port ${PORT}...`)
});
