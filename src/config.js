import minimist from "minimist";
import dotenv from "dotenv";

dotenv.config();

const argv = minimist(process.argv.slice(2), {
  alias: {
    p: 'port',
    m: 'mode'
  },
  default: {
    port: process.argv.PORT || 8080,
    mode: 'fork'
  }
})

const PORT = parseInt(argv.port);

export default {
  PORT: PORT,
  mode: argv.mode,
  mongoRemote: {
    cnxStr: process.env.MONGODB_REMOTE,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  fileSystem: {
    path: "./DB",
  },
};
