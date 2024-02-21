import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function Callback() {
    const location = useLocation();

    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const id = urlParams.get('id');
        const username = urlParams.get('email');
        const firstname = urlParams.get('firstname');
        const lastname = urlParams.get('lastname');
        const email = urlParams.get('email');
        const role = urlParams.get('role');
        const address = urlParams.get('address');
        const phone = urlParams.get('phone');

        localStorage.setItem('user_id', id);
        localStorage.setItem('username', username);
        localStorage.setItem('firstname', firstname);
        localStorage.setItem('lastname', lastname);
        localStorage.setItem('email', email);
        localStorage.setItem('address', address);
        localStorage.setItem('phone', phone);
        localStorage.setItem('role', role);
        localStorage.setItem('isLoggedIn', true);

        window.location.href = '/';
    }, []);
    return (
        <>
        </>
    )
}

export default Callback;