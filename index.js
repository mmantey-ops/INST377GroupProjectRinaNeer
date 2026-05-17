const express = require('express');
const bodyParser = require('body-parser');
const supabaseClient = require('@supabase/supabase-js');
const dotenv = require('dotenv');

const app = express();
const port = 3000;
dotenv.config();

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabaseClient.createClient(supabaseUrl, supabaseKey);

app.get('/', (req, res) => {
  res.sendFile('public/index.html', { root: __dirname });
});

app.get('/api/fruit/:name', async (req, res) => {
  console.log('getting fruit data!');
  
  const fruitName = req.params.name;
  console.log(`Fruit name: ${fruitName}`);

  try {
    const response = await fetch(`https://fruityvice.com/api/fruit/${fruitName}`);
    const data = await response.json();

    console.log('fruit data has been retrieved:', data.name);
    res.json(data);
  } catch (error) {
    console.log(`Error: ${error}`);
    res.statusCode = 500;
    res.send(error);
  }
});

app.get('/api/saved-fruits', async (req, res) => {
  console.log('trying to get all saved fruits!');

  const { data, error } = await supabase
    .from('favorites')
    .select();

  if (error) {
    console.log(`Error: ${error}`);
    res.statusCode = 500;
    res.send(error);
  } else {
    console.log('Received Data:', data.length);
    res.json(data);
  }
});

app.post('/api/saved-fruits', async (req, res) => {
  console.log('Adding saved fruit');
  console.log(`Request: ${JSON.stringify(req.body)}`);

  const fruitName = req.body.name;
  const calories = req.body.nutritions.calories;
  const sugar = req.body.nutritions.sugar;
  const carbohydrates = req.body.nutritions.carbohydrates;

  const { data, error } = await supabase
    .from('favorites')
    .insert({
      fruit_name: fruitName,
      calories: calories,
      sugar: sugar,
      carbohydrates: carbohydrates,
    })
    .select();

  if (error) {
    console.log(`Error: ${error.message}`);
    res.statusCode = 500;
    res.send(error.message);
  } else {
    console.log('Fruit saved successfully');
    res.json(data);
  }
});

app.listen(port, () => {
  console.log(`App is available on port: ${port}`);
});