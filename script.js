const firstNameInput = document.getElementById("fName");
const lastNameInput = document.getElementById("lName");
const amountInput = document.getElementById("amount");
const depositBtn = document.getElementById("deposit");
const withdrawBtn = document.getElementById("withdraw");
const clearUserTransactionsBtn = document.getElementById("clearUserTransactionsBtn");
const saveBackupBtn = document.getElementById("saveBackupBtn");
const restoreBackupBtn = document.getElementById("restoreBackupBtn");
const clearAllBtn = document.getElementById("clearAllBtn");



// array for storage users localy 
let users = [];
let currentSelectedUser = null;

// key for save to localstorage
const STORAGE_KEY = "users_data";


// ! ====================== Save Array To Local Storage
// save array to local storage
function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY , JSON.stringify(users))
}


// ! ====================== Get Array From Local Storage
// get array from local storage
function loadFromLocalStorage() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    
    if (savedData) {
        users = JSON.parse(savedData);
    } else {
        users = []; // if there is no data the array is empty
    }
}


// ! ====================== Get Current Date And Time
// get current date and time and return it as an object
function getCurrentDateTime() {
    const now = new Date();  
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return {
        date: `${year}/${month}/${day}`,
        time: `${hours}:${minutes}:${seconds}`,
        timestamp: now.getTime()
    };
}



// ! ======================= Find User By Name
// find existing user by name and last-name in array and return it
function findUserByName(firstName, lastName) {
    return users.find(user => 
        user.firstName.trim().toLowerCase() === firstName.trim().toLowerCase() &&
        user.lastName.trim().toLowerCase() === lastName.trim().toLowerCase()
    );
}


// ! ======================= Show Message Function
// display a message box at the top of the page after add or minus
function showMessage(msg, type) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = msg;
    messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? 'rgb(0, 117, 82)' : 'rgb(231, 0, 0)'};
            color: white;
            padding: 12px 24px;
            border-radius: 12px;
            z-index: 2000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            animation: slideDown 0.3s ease;
    `;
    document.body.appendChild(messageDiv);
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}



// ! ====================== Depoit Function
// get data from input , check validation and add to main array and local storage
function Deposit() {
    const firstName = sanitizeInput(firstNameInput.value.trim());
    const lastName = sanitizeInput(lastNameInput.value.trim());
    const amount = sanitizeNumber( amountInput.value.trim());
    
    
    // input data validation
    if (firstName === "" || lastName === "" || amount === "") {
        alert("⚠️ Please, fill in the blanks");
        return;
    }

    if (isNaN(amount)) {
        alert("⚠️ Please, enter a valid number!");
        return;
    }

    // add user to users array and save to localstorage
    addUser(firstName , lastName , amount);
    
    // Empty the input values
    firstNameInput.value = "";
    lastNameInput.value = "";
    amountInput.value = "";

    // fucus on the first input
    firstNameInput.focus();
}

// ! ========================= Add User Function (main function)
// Add User to main array
function addUser(firstName, lastName , amount) {
    // change amount type from string to number
    const amountNum = parseFloat(amount)

    const existingUser = findUserByName(firstName, lastName);
    const dateTime = getCurrentDateTime();

    // creat transaction object
    const newTransaction = {
        date : dateTime.date,
        time : dateTime.time,
        amount : amountNum,
        timestamp : dateTime.timestamp
    }
    

    // check user existing
    if (existingUser) {
        existingUser.transactions.push(newTransaction);
        existingUser.totalAssets += amountNum; // add new amount to totalAssets
        saveToLocalStorage();
        renderTable();
        showMessage(`✅ transaction successful ${amountNum.toLocaleString()} $ added to ${firstName} ${lastName}`,"success");
    } else{
        
        // create new user
        const newUser = {
            id : Date.now(),
            firstName : escapeHtml(firstName),
            lastName : escapeHtml(lastName),
            totalAssets : amountNum,
            transactions : [newTransaction]
        };

        // add new user objec to array
        users.push(newUser);

        // save in local storage
        saveToLocalStorage();

        // Re-render the table
        renderTable();

        // show message (user added)
        showMessage( "✅ User Added","success");
    }
    return true
};


// ! ===================== show Transactions 
// show user transactions in modal
function showTransactions(person) {
    currentSelectedUser = person;
    const modal = document.getElementById("transactionModal");
    const modalTitle = document.getElementById("modalTitle");
    const transactionsList = document.getElementById("transactionsList");

    modalTitle.textContent = `📋 ${person.firstName} ${person.lastName} transactions`;

    if (person.transactions.length === 0) {
        transactionsList.innerHTML = '<div class="empty-state">No Transactions Recorded</div>';
    } else{
        transactionsList.innerHTML = person.transactions.map((trans , index) => `
            <div class="transaction-item">
                <strong>#${index + 1}</strong> - Amount: <span style="color: rgb(7, 204, 145); font-weight: bold;">${trans.amount.toLocaleString()} $</span><br> 📅 Date: ${trans.date} - 🕐 Hour: ${trans.time}
            </div>
        `).join('');
    }

    modal.style.display = 'flex';
}


// ! ====================== Clear User Transactions Function
// clear user transactions by id
function clearUserTransactions(userId) {
    if (confirm("⚠️ Are you sure? All transactions for this user will be deleted and the balance will be reduced to '0 $'")) {
        const user = users.find(person => person.id === userId);
        if (user) {
            user.transactions = [];
            user.totalAssets = 0;

            saveToLocalStorage();
            renderTable();

            const modal = document.getElementById("transactionModal");
            if (modal.style.display === "flex") {
                modal.style.display = "none";
                currentSelectedUser = null;
            }

            showMessage(`🗑 All transactions for ${user.firstName} ${user.lastName} have been deleted`,"success");
        }
    }
}


// ! ====================== Render The Table
// render the table
function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = ''; // clear current table

    if (users.length === 0) {
        // Display empty message
        const emptyRow = document.createElement('tr');
        emptyRow.className = 'empty-row';
        emptyRow.innerHTML = '<td colspan="6">There is no data 📭 </td>';
        tableBody.appendChild(emptyRow);
    }
    else{
        users.forEach((item, index) => {
            // create a row for each item in array
            const row = createTableRow(item, index);
            tableBody.appendChild(row);
        });
    }

    // updating counter
    updateCounter();
}


// ! ====================== Create New Row For Each User
// create new row for each user
function createTableRow(person , index) {
    const row = document.createElement("tr");

    // number cell
    const numberCell = document.createElement('td');
    numberCell.textContent = index+1;

    // first name cell
    const firstNameCell = document.createElement('td');
    firstNameCell.textContent = person.firstName;

    // last name cell
    const lastNameCell = document.createElement('td');
    lastNameCell.textContent = person.lastName;

    // assets cell
    const totalAssetsCell = document.createElement('td');
    totalAssetsCell.textContent = person.totalAssets + " $";

    // transaction cell
    const transactionCell = document.createElement('td');
    const viewButton = document.createElement("a");
    viewButton.textContent = "Show";
    viewButton.className = "view-btn";

    // add view button into transaction cell
    transactionCell.appendChild(viewButton);

    // view transactions event
    viewButton.addEventListener("click" , () => {
        showTransactions(person);
    })

    // action cell (delete button)
    const actionCell = document.createElement('td');
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'ِDelete'; // 🗑
    deleteButton.className = 'delete-btn';
    
    // add delete button into action cell
    actionCell.appendChild(deleteButton);

    // delete event - using exact index
    deleteButton.addEventListener('click', () => {
        if (confirm("⚠️ Are you sure you want to 'Delete' this user ?")) {
            deleteUserByIndex(index); 
        }
    });

    row.appendChild(numberCell);
    row.appendChild(firstNameCell);
    row.appendChild(lastNameCell);
    row.appendChild(totalAssetsCell);
    row.appendChild(transactionCell);
    row.appendChild(actionCell);

    return row;
}



// ! ====================== Minus Function

function Minus(params) {
    
}

// ! ======================= Delete A User 
// delete a user using exact index
function deleteUserByIndex(index) {
    
    if (index >= 0 && index < users.length) {
        users.splice(index , 1); // delete from array
        saveToLocalStorage(); // save in local storage
        renderTable(); // Re-render the table
        showMessage(`🗑 User ${users[index].firstName} ${users[index].lastName} was successfully deleted`, "success");

    }
}


// ! ======================= Update Counter
// update records counter
function updateCounter() {
    const counterSpan = document.getElementById("rowCounter");
    counterSpan.textContent = `Record Count: ${users.length}`;
}

// ! ======================= Save Backup
// deep copy and save as backup in local storage
function saveBackup() {
    const backup = JSON.parse(JSON.stringify(users));
    if (backup.length === 0) {
        showMessage("❌ There is no data to backup","fail");
    } else{
        localStorage.setItem("users-backup" , JSON.stringify(backup));
        showMessage("Backup saved successfully 💾","success");
    }
}

// ! ======================= Restore Backup
// restore the= last backup from local storage
function restoreBackup() {
    const savedBackup = localStorage.getItem("users-backup");
    if (savedBackup) {
        if (confirm("⚠️ Are you sure ? The current data will be replaced with the 'backup'")) {
            users = JSON.parse(savedBackup);
            saveToLocalStorage();
            renderTable();
            showMessage("📂 Data successfully restored from backup","success");
        }
    } else{
        showMessage("❌ No backup found! Click the 'Backup' button first","fail");
    }
}

// ! ======================= Clear All Data
// clear all data in array and local storage
function clearAllData() {
    if (users.length === 0) {
        return showMessage("❌ There is no data to delete","fail");
    }
    if (confirm("⚠️ Are you sure you want to 'Delete' all data")) {
        users = [];
        saveToLocalStorage();
        renderTable();
    }
}


// ! ======================= Handle Enter Key
// handeling the enter key
function onEnterKey(e) {
    if (e.key === "Enter") {
        e.preventDefault();
        Deposit();
    }
}


// ! ===================== Security functions
// Security function 1 : Clear user input (for storage)
function sanitizeInput(str) {
    if (!str) return '';
    // Remove spaces from the beginning and end
    let cleaned = str.trim();
    // Remove duplicate spaces
    cleaned = cleaned.replace(/\s+/g, ' ');
    // Remove control characters
    cleaned = cleaned.replace(/[\x00-\x1F\x7F]/g, '');
    return cleaned;
}

// Security Function 2 : Validation Number (for Value Field)
function sanitizeNumber(input) {
    let num = parseFloat(input);
    if (isNaN(num)) return 0;
    if (num < 0) return 0;
    // Limit to 10 billion
    if (num > 10000000000) return 10000000000;
    return num;
}

// Security Function 3 : helper function to prevent XSS 
function escapeHtml(str) {
    // If the input was empty
    if (!str) return '';
    // Character Conversion Map
    const escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;'
    };
    // Replace with regex
    return str.replace(/[&<>"'/]/g, function(m) {
        return escapeMap[m];
    });
}


// ! ===================== Initialization On Page Load
// initialization on page load
function init() {
    // get array data from local storage
    loadFromLocalStorage();
    // show data in rable
    renderTable();
    // handle the enter key
    const inputs = ['fName','lName','amount'];
    inputs.forEach((id) => {
        document.getElementById(id).addEventListener('keypress' , onEnterKey);
    })
}

init(); // RUN


// ! ====================== Modal Event
// close modal event
const modal = document.getElementById('transactionModal');
const closeModal = document.querySelector('.close-modal');
    
closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    currentSelectedUser = null;
});
    
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
        currentSelectedUser = null;
    }
});


depositBtn.addEventListener("click" , Deposit);
withdrawBtn.addEventListener("click" , Minus);
clearUserTransactionsBtn.addEventListener("click" , () => currentSelectedUser ? clearUserTransactions(currentSelectedUser.id) : false);
saveBackupBtn.addEventListener("click" , saveBackup);
restoreBackupBtn.addEventListener("click" , restoreBackup)
clearAllBtn.addEventListener("click" , clearAllData);