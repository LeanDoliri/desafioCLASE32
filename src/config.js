import minimist from "minimist";
import dotenv from "dotenv";

dotenv.config();

const PORT = minimist(process.argv.slice(2), {
  alias: { p: "port" },
  default: { port: 8080 },
});

export default {
  PORT: PORT,
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
