const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const content = document.getElementById('content');
const addForm = document.getElementById('add-Card');
const addButton = document.getElementById("add-button");
const editButton = document.getElementById("edit-button");
const cancelButton = document.getElementById("cancel");
editButton.style.display = "none";
addForm.style.display = "none";

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function hideAddForm(){
    addForm.style.display = "none";
    signupForm.style.display="none";
    loginForm.style.display="none";
    content.style.display="flex";
}

addForm.addEventListener("keydown", (event)=>{
    if(event.key === "Escape" || event.key === "Esc"){
        hideAddForm();
    }
})

function showAddForm(){
    addForm.style.display = "flex";
    signupForm.style.display="none";
    loginForm.style.display="none";
    content.style.display="None";
}

function showsignup(){
    signupForm.style.display="flex";
    loginForm.style.display="none";
    content.style.display="None";
}

function showlogin(){
    signupForm.style.display="none";
    loginForm.style.display="flex";
    content.style.display="None";
}

function checkAuth() {
    const token = getCookie('token');
    if (!token) {
        showlogin();
    } else {
        fetchUserCards();
    }
}

function logout(){
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.reload();
}

function displayCards(data){
    signupForm.style.display="none";
    loginForm.style.display="none";
    content.style.display="flex";
    addForm.style.display="none";
    const cards = document.getElementById("cards");
    cards.innerHTML="";
    data.forEach(card => {
        const expDate = new Date(card.expiration_date);
        const day = String(expDate.getDate()).padStart(2, '0');
        const month = String(expDate.getMonth() + 1).padStart(2, '0');
        const year = expDate.getFullYear();
        const formattedDate = `${day}-${month}-${year}`;
        const card_box = document.createElement('div');
        card_box.classList.add("card");
        card_box.innerHTML = `<div class="card" id="${card.card_id}">
            <div class="topCard">
                <div class="topLeft">
                    <div class="namehead">Card Holder</div>
                    <div class="name">${card.cardholder_name}</div>
                </div>
                <div class="topRight">
                    <div class="pointer" onclick="editCard(${card.card_id}, '${card.cardholder_name}' ,${card.card_number}, '${card.card_type}', '${card.expiration_date}', ${card.cvv}, '${card.bank_name}', '${card.issuing_country}');"><svg xmlns="http://www.w3.org/2000/svg" id="Bold" viewBox="0 0 24 24" width="24" height="24"><path d="M21,11.5V15H18a3,3,0,0,0-3,3v3H4.5A1.5,1.5,0,0,1,3,19.5V4.5A1.5,1.5,0,0,1,4.5,3h9A1.5,1.5,0,0,0,15,1.5h0A1.5,1.5,0,0,0,13.5,0h-9A4.5,4.5,0,0,0,0,4.5v15A4.5,4.5,0,0,0,4.5,24H16.484a4.5,4.5,0,0,0,3.181-1.317l3.017-3.017A4.5,4.5,0,0,0,24,16.485V11.5A1.5,1.5,0,0,0,22.5,10h0A1.5,1.5,0,0,0,21,11.5Z"/><path d="M17.793,1.793l-12.5,12.5A1,1,0,0,0,5,15v3a1,1,0,0,0,1,1H9a1,1,0,0,0,.707-.293L22.038,6.376a3.379,3.379,0,0,0,.952-3.17A3.118,3.118,0,0,0,17.793,1.793Z"/></svg></div>
                    <div class="pointer" onclick="deleteCard(${card.card_id})"><svg version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="24" height="24">
<g>
	<path d="M490.667,96c0-17.673-14.327-32-32-32h-80.555C364.632,25.757,328.549,0.13,288,0h-64   c-40.549,0.13-76.632,25.757-90.112,64H53.333c-17.673,0-32,14.327-32,32l0,0c0,17.673,14.327,32,32,32H64v266.667   C64,459.468,116.532,512,181.333,512h149.333C395.468,512,448,459.468,448,394.667V128h10.667   C476.34,128,490.667,113.673,490.667,96z M384,394.667C384,424.122,360.122,448,330.667,448H181.333   C151.878,448,128,424.122,128,394.667V128h256V394.667z"/>
	<path d="M202.667,384c17.673,0,32-14.327,32-32V224c0-17.673-14.327-32-32-32s-32,14.327-32,32v128   C170.667,369.673,184.994,384,202.667,384z"/>
	<path d="M309.333,384c17.673,0,32-14.327,32-32V224c0-17.673-14.327-32-32-32s-32,14.327-32,32v128   C277.333,369.673,291.66,384,309.333,384z"/>
</g></div></div>
            </div>
            <div class="bottomCard">
                <div class="card_number">${card.card_number}</div>
                <div class="bottom_bottom">
                    <div>
                        <div class="cvv">CVV: ${card.cvv}</div>
                        <div class="date">Exp Date: ${formattedDate}</div>
                    </div>
                    <div>
                        <div class="bank_name">Bank: ${card.bank_name}</div>
                        <div class="country">Country: ${card.issuing_country}</div>
                    </div>
                </div>
            </div>
        </div>`;
        cards.append(card_box);
    });
}

function fetchUserCards() {
    const token = getCookie('token');
    const userId = getCookie('user_id');
    if (!token || !userId) {
        showlogin();
        return;
    }

    fetch(`http://localhost:5000/cards?user_id=${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            displayCards(data.cards);
        } else {
            console.log('Failed to fetch cards: ' + data.message);
        }
    })
    .catch(error => console.error('Error fetching cards:', error));
}

async function login(username, password, isAdmin){
    const data = {
        username: username,
        password: password,
        role: isAdmin ? 'admin' : 'user'
    };

    try {
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            // document.cookie = `token=${result.token}; path=/;`;
            document.cookie = `user_id=${result.user_id}; path=/;`;
            document.getElementById("greeting").innerHTML = `Hi ${result.name}!`
            if(isAdmin){
                window.location.href = "http://localhost:5000/admin";
            }else{
                fetchUserCards();
            }
        } else {
            alert(`Login failed: ${result.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during login.');
    }
}

async function deleteCard(cardId) {
    const token = getCookie('token');
    if (!token) {
        alert('You are not authenticated. Please log in.');
        return;
    }
    try {
        const response = await fetch(`/cards/${cardId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.ok) {
            alert('Card deleted successfully!');
            fetchUserCards();
        } else {
            const data = await response.json();
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while deleting the card.');
    }
}

function hideEditForm(){
    document.getElementById("formHead").innerHTML = "Add Card";
    editButton.style.display = "none";
    addButton.style.display = "flex";
    cancelButton.setAttribute(onclick, "hideAddForm()");
    signupForm.style.display="none";
    loginForm.style.display="none";
    content.style.display="flex";
    addForm.style.display="none";
    localStorage.removeItem("card_id");
}

function editCard(id, cardholder_name,card_number,card_type,expiration_date,cvv,bank_name,issuing_country){
    localStorage.setItem("card_id",id);
    document.getElementById("formHead").innerHTML = "Edit Card";
    editButton.style.display = "";
    addButton.style.display = "none";
    cancelButton.setAttribute(onclick, "hideEditForm()");
    signupForm.style.display="none";
    loginForm.style.display="none";
    content.style.display="none";
    addForm.style.display="flex";
    const expDate = new Date(expiration_date);
    const day = String(expDate.getDate()).padStart(2, '0');
    const month = String(expDate.getMonth() + 1).padStart(2, '0');
    const year = expDate.getFullYear();
    const formattedDate = `${year}-${month}-${day}`;
    document.getElementById('cardHolderName').value = cardholder_name;
    document.getElementById('cardNumber').value = card_number;
    document.getElementById('cardType').value = card_type;
    document.getElementById('expirationDate').value = formattedDate;
    document.getElementById('cvv').value = cvv;
    document.getElementById('bankName').value = bank_name;
    document.getElementById('country').value = issuing_country;
}

document.addEventListener('DOMContentLoaded', () => {
    
    document.getElementById('signupButton').addEventListener('click', async () => {
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const phone = document.getElementById('signupPhone').value;
        const username = document.getElementById('signupUsername').value;
        const password = document.getElementById('signupPassword').value;
        const repassword = document.getElementById('signupRePassword').value;

        const messageElement = document.getElementById('signupMessage');

        if (password !== repassword) {
            messageElement.textContent = 'Passwords do not match.';
            return;
        }
        try {
            const response = await fetch('http://localhost:5000/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({name, username, email, phone, password })
            });

            const data = await response.json();

            if (response.ok) {
                messageElement.textContent = 'Signup successful!';
                login(username, password, false);
            } else {
                messageElement.textContent = `Error: ${data.message}`;
            }
        } catch (error) {
            console.error('Error:', error);
            messageElement.textContent = 'An error occurred. Please try again.';
        }
    });

    const loginButton = document.getElementById('login-button');

    loginButton.addEventListener('click', async () => {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const isAdmin = document.getElementById('isAdmin').checked;
        
        login(username, password, isAdmin);
    });

    // Add
    document.getElementById('add-button').addEventListener('click', async (event) => {
        event.preventDefault();
        const cardholderName = document.getElementById('cardHolderName').value;
        const cardNumber = document.getElementById('cardNumber').value;
        const cardType = document.getElementById('cardType').value;
        const expirationDate = document.getElementById('expirationDate').value;
        const cvv = document.getElementById('cvv').value;
        const bankName = document.getElementById('bankName').value;
        const issuingCountry = document.getElementById('country').value;

        const nameRegex = /^[a-zA-Z\s'-]{2,255}$/;
        const numberRegex = /^\d{13,19}$/;
        const cvvRegex = /^\d{3,4}$/;
        const bankNameRegex = /^[a-zA-Z\s-]{2,100}$/;
        const countryRegex = /^[a-zA-Z]{2,255}$/;

        if (!nameRegex.test(cardholderName)) {
            alert('Invalid Card Holder Name.');
            return;
        }
        if (!numberRegex.test(cardNumber)) {
            alert('Invalid Card Number.');
            return;
        }
        if (!cvvRegex.test(cvv)) {
            alert('Invalid CVV.');
            return;
        }
        if (!bankNameRegex.test(bankName)) {
            alert('Invalid Bank Name.');
            return;
        }
        if (!countryRegex.test(issuingCountry)) {
            alert('Invalid Issuing Country.');
            return;
        }
        const token = getCookie("token");
    
        if (!token) {
            alert('You are not authenticated. Please log in.');
            return;
        }
        const cardDetails = {
            cardholder_name: cardholderName,
            card_number: cardNumber,
            card_type: cardType,
            expiration_date: expirationDate,
            cvv: cvv,
            bank_name: bankName,
            issuing_country: issuingCountry
        };
    
        try {
            const response = await fetch('http://localhost:5000/cards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Send token for authentication
                },
                body: JSON.stringify(cardDetails)
            });
    
            const data = await response.json();
    
            if (response.ok) {
                alert('Card added successfully!');
                document.getElementById('cardHolderName').value = "";
                document.getElementById('cardNumber').value = 0;
                document.getElementById('cardType').value = "";
                document.getElementById('expirationDate').value = "";
                document.getElementById('cvv').value = "";
                document.getElementById('bankName').value = "";
                document.getElementById('country').value = "";
                localStorage.removeItem("card_id");
                fetchUserCards();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while adding the card.');
        }
    });

    // Edit
    document.getElementById('edit-button').addEventListener('click', async () => {
        const id = localStorage.getItem("card_id");
        const cardholderName = document.getElementById('cardHolderName').value;
        const cardNumber = document.getElementById('cardNumber').value;
        const cardType = document.getElementById('cardType').value;
        const expirationDate = document.getElementById('expirationDate').value;
        const cvv = document.getElementById('cvv').value;
        const bankName = document.getElementById('bankName').value;
        const issuingCountry = document.getElementById('country').value;

        const nameRegex = /^[a-zA-Z\s'-]{2,255}$/;
        const numberRegex = /^\d{13,19}$/;
        const cvvRegex = /^\d{3,4}$/;
        const bankNameRegex = /^[a-zA-Z\s-]{2,100}$/;
        const countryRegex = /^[a-zA-Z]{2,255}$/;

        if (!nameRegex.test(cardholderName)) {
            alert('Invalid Card Holder Name.');
            return;
        }
        if (!numberRegex.test(cardNumber)) {
            alert('Invalid Card Number.');
            return;
        }
        if (!cvvRegex.test(cvv)) {
            alert('Invalid CVV.');
            return;
        }
        if (!bankNameRegex.test(bankName)) {
            alert('Invalid Bank Name.');
            return;
        }
        if (!countryRegex.test(issuingCountry)) {
            alert('Invalid Issuing Country.');
            return;
        }
        const token = getCookie("token");
    
        if (!token) {
            alert('You are not authenticated. Please log in.');
            return;
        }
        const cardDetails = {
            cardholder_name: cardholderName,
            card_number: cardNumber,
            card_type: cardType,
            expiration_date: expirationDate,
            cvv: cvv,
            bank_name: bankName,
            issuing_country: issuingCountry
        };
    
        try {
            const response = await fetch(`http://localhost:5000/cards/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(cardDetails)
            });
    
            const data = await response.json();
    
            if (response.ok) {
                alert('Card successfully Edited!');
                document.getElementById('cardHolderName').value = ""
                document.getElementById('cardNumber').value = 0
                document.getElementById('cardType').value = ""
                document.getElementById('expirationDate').value = ""
                document.getElementById('cvv').value = ""
                document.getElementById('bankName').value = ""
                document.getElementById('country').value = ""
                document.getElementById("formHead").innerHTML = "Add Card";
                editButton.style.display = "none";
                addButton.style.display = "unset";
                cancelButton.setAttribute("onclick", "hideAddForm()");
                fetchUserCards();
            } else {
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while adding the card.');
        }
    });
    checkAuth();

});
