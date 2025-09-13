const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;


app.use(cors());
app.use(express.json());


const conversionFactors = {
  time: {
    hours: { days: 1 / 24, months: 1 / 730.5, years: 1 / 8766 },
    days: { hours: 24, months: 1 / 30.44, years: 1 / 365.25 },
    months: { hours: 730.5, days: 30.44, years: 1 / 12 },
    years: { hours: 8766, days: 365.25, months: 12 },
  },
  weight: {
    grams: { kilograms: 0.001, pounds: 0.00220462 },
    kilograms: { grams: 1000, pounds: 2.20462 },
    pounds: { grams: 453.592, kilograms: 0.453592 },
  },
  temperature: {
    celsius: {
      fahrenheit: (c) => (c * 9) / 5 + 32,
      kelvin: (c) => c + 273.15,
    },
    fahrenheit: {
      celsius: (f) => ((f - 32) * 5) / 9,
      kelvin: (f) => ((f - 32) * 5) / 9 + 273.15,
    },
    kelvin: {
      celsius: (k) => k - 273.15,
      fahrenheit: (k) => ((k - 273.15) * 9) / 5 + 32,
    },
  },
  money: {
    USD: { COP: 4000, CHF: 0.9 }, 
    COP: { USD: 1 / 4000, CHF: 0.9 / 4000 },
    CHF: { USD: 1 / 0.9, COP: 4000 / 0.9 },
  },
};

// Ruta para realizar las conversiones
app.post('/api/convert', (req, res) => {
  const { category, value, fromUnit, toUnit } = req.body;
  let result;

  const categoryData = conversionFactors[category];
  if (!categoryData || !categoryData[fromUnit] || !categoryData[fromUnit][toUnit]) {
    return res.status(400).json({ error: 'Conversión no válida.' });
  }

  const conversionFuncOrFactor = categoryData[fromUnit][toUnit];

  // La temperatura requiere una función en lugar de un factor simple
  if (category === 'temperature') {
    result = conversionFuncOrFactor(value);
  } else {
    result = value * conversionFuncOrFactor;
  }

  res.json({ result });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});