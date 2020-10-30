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
    console.log('he entrado')
    const cookies = new Cookies();
    var cookieValue = cookies.get(name);
    console.log(cookieValue);
    if (cookieValue == undefined) {
        cookies.set(name, defaultValue, options);
    }
    
};
