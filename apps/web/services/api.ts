import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3333",

    withCredentials: true,
    //Envia cookies em requisições cross-origin, necessário para autenticação via cookie.
    // withCredentials: true — sem isso, o browser NÃO envia cookies
    // em requisições para outra origem (cross-origin).
    // Como web (porta 5173) e api (porta 3333) são origens diferentes
    // em dev, isso é obrigatório.
});