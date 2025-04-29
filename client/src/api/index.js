import axios from "axios";

const mainURL = axios.create({
  // baseURL: "http://localhost:8080",
  baseURL: "https://apionesale.vercel.app/",
});

export default mainURL;
