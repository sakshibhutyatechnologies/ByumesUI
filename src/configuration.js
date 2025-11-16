const ENV = process.env.REACT_APP_ENV || "development";
console.log('Current ENV:', ENV);
console.log('Available env vars:', process.env.REACT_APP_API_BASE_URL);

const configuration = {
  development: {
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL || "http://localhost:4000/",
  },
  qa: {
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
  },
  production: {
    API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
  },
};

export default configuration[ENV];
