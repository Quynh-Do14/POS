import axios from "axios";

const baseUrl = "http://localhost:8080/api/";
// const baseUrl = import.meta.env.;

class Http {
  constructor() {
    this.instance = axios.create({
      baseURL: baseUrl,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });
    // Interceptor để thêm accessToken vào request
    // Interceptor để xử lý lỗi response (ví dụ: token hết hạn)
  }
}

const http = new Http().instance;
export default http;
