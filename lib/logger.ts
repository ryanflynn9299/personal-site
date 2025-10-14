import pino from 'pino';

// Define the options for pino. We'll use a ternary operator to switch
// between production and development settings.
const pinoOptions = {
  // Set the minimum log level.
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  
  // Conditionally set the transport for development ONLY.
  // In production, this will be undefined, and pino will default to its
  // highly performant, standard behavior of writing JSON to stdout.
  transport: process.env.NODE_ENV !== 'production' 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
        },
      }
    : undefined,
};

// Create the single logger instance.
const log = pino(pinoOptions);

export default log;