import axios from "axios";
import * as config from "config";

const githubApi = axios.create({
  baseURL: `${config.get("github.apiUrl")}`
});

/**
 * Return the main axios instance in order to get data from Github Api, need user providing
 * access_token
 * @param {string} token - user provided access token
 * @returns {AxiosInstance} the main axios instance
 */
const github = token => {
  return axios.create({
    baseURL: `${config.get("github.apiUrl")}`,
    headers: { Authorization: `token ${token}` }
  });
};

const githubApiPreview = axios.create({
  baseURL: `${config.get("github.apiUrl")}`,
  headers: {
    Accept: "application/vnd.github.inertia-preview+json"
  }
});

const githubGetTokenApi = axios.create({
  baseURL: "https://github.com/login/oauth/access_token"
});

const githubAuthUrl = "https://github.com/login/oauth/authorize";

export {
  githubApi,
  github,
  githubApiPreview,
  githubAuthUrl,
  githubGetTokenApi
};
