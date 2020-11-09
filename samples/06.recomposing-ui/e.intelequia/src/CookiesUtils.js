import Cookies from 'universal-cookie';


export const setCookie = (name, value, options) => {
    const cookies = new Cookies();
    cookies.set(name, value, options);
};

export const getCookie = (name) => {
    const cookies = new Cookies();
    return cookies.get(name);
};


export const checkCookie = (name, defaultValue, options) => {
    const cookies = new Cookies();
    var cookieValue = cookies.get(name);
    if (cookieValue == undefined) {
        cookies.set(name, defaultValue, options);
        cookieValue = cookies.get(name);
    }
    return cookieValue;    
};
