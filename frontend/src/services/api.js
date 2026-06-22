import axios from "axios";
export const BASE_URL="http://localhost:5000";
const authApi=axios.create({
    baseURL:BASE_URL
});
authApi.interceptors.request.use(
    (config)=>{
        const token=localStorage.getItem("token");
        if(token){
            config.headers.Authorization=`Bearer ${token}`;
        }
        return config;
    },
    (error)=>{
        return Promise.reject(error);
    }
);
export default authApi;