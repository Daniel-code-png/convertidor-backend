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
  
  let result;

  if (category === 'temperature') {
    const baseToCelsius = (tempValue, tempUnit) => {
        if (tempUnit === 'celsius') return tempValue;
        if (tempUnit === 'fahrenheit') return (tempValue - 32) * 5/9;
        if (tempUnit === 'kelvin') return tempValue - 273.15;
    };
    
    const celsiusValue = baseToCelsius(value, fromUnit);
    
    if (toUnit === 'celsius') {
        result = celsiusValue;
    } else if (toUnit === 'fahrenheit') {
        result = (celsiusValue * 9/5) + 32;
    } else if (toUnit === 'kelvin') {
        result = celsiusValue + 273.15;
    }
  } else {
    const fromValue = conversionFactors[category][fromUnit];
    const toValue = conversionFactors[category][toUnit];
    result = (value / fromValue) * toValue;
  }

  res.json({ result });
});

module.exports = app;