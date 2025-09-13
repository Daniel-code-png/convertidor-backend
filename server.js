
const express = require('express');
const cors = require('cors');
const app = express();


const corsOptions = {
  origin: 'https://convertidor-frontend.vercel.app',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());


const conversionFactors = {
  time: {
    hours: 1, 
    days: 1 / 24,
    months: 1 / 730.5,
    years: 1 / 8766,
  },
  weight: {
    grams: 1, 
    kilograms: 0.001,
    pounds: 0.00220462,
  },
  temperature: {
    celsius: 1, 
    fahrenheit: (c) => (c * 9) / 5 + 32,
    kelvin: (c) => c + 273.15,
  },
  money: {
    USD: 1, 
    COP: 4000,
    CHF: 0.9,
  },
};


const translations = {
  es: {
    time: {
      hours: 'horas',
      days: 'días',
      months: 'meses',
      years: 'años',
    },
    weight: {
      grams: 'gramos',
      kilograms: 'kilogramos',
      pounds: 'libras',
    },
    temperature: {
      celsius: 'celsius',
      fahrenheit: 'fahrenheit',
      kelvin: 'kelvin',
    },
    money: {
      USD: 'dólar estadounidense',
      COP: 'peso colombiano',
      CHF: 'franco suizo',
    },
  },
};


app.get('/api/units/:category/:lang', (req, res) => {
  const { category, lang } = req.params;
  
  if (!conversionFactors[category] || !translations[lang] || !translations[lang][category]) {
    return res.status(404).json({ error: 'Category or language not found.' });
  }
  
  const translatedUnits = Object.keys(conversionFactors[category]).map(key => ({
    key: key,
    name: translations[lang][category][key],
  }));

  res.json(translatedUnits);
});


app.post('/api/convert', (req, res) => {
  const { category, value, fromUnit, toUnit } = req.body;
  
  const fromValue = conversionFactors[category][fromUnit];
  const toValue = conversionFactors[category][toUnit];

  let result;

  if (category === 'temperature') {
    const baseValue = (fromUnit === 'celsius') ? value : conversionFactors.temperature[fromUnit].celsius(value);
    result = conversionFactors.temperature[toUnit] === 1 ? baseValue : conversionFactors.temperature[toUnit](baseValue);
  } else {
    result = (value / fromValue) * toValue;
  }

  res.json({ result });
});


module.exports = app;