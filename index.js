import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.js';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  organization: process.env.ORG,
  apiKey: process.env.API,
});
const openai = new OpenAIApi(configuration);

/* CONFIGURATIONS */
const app = express();
dotenv.config();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('common'));
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));

// Set up CORS headers
app.use(cors());

/* ROUTES */
app.use('/auth', authRoutes);

app.post('/create', async (req, res) => {
  const { message } = req.body;
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: `write a short tv add script with these suggestions:${message}, make sure its concluded within 306 letters and if there are characters names in the suggestion make sure they have a fun, concise script dialog.`,
    max_tokens: 75,
    temperature: 0,
  });
  console.log(response.data);
  if (response.data.choices[0].text) {
    res.header('Access-Control-Allow-Origin', 'https://gleeful-tulumba-524329.netlify.app');
    res.json({
      message: response.data.choices[0].text,
    });
  }
});

/* MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
  })
  .catch((error) => console.log(`${error} did not connect`));
