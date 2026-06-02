const firstNameInput = document.getElementById("fName");
const lastNameInput = document.getElementById("lName");
const amountInput = document.getElementById("amount");
const depositBtn = document.getElementById("deposit");
const withdrawBtn = document.getElementById("withdraw");
const clearUserTransactionsBtn = document.getElementById("clearUserTransactionsBtn");
const saveBackupBtn = document.getElementById("saveBackupBtn");
const restoreBackupBtn = document.getElementById("restoreBackupBtn");
const clearAllBtn = document.getElementById("clearAllBtn");
const loginBtn = document.getElementById("loginBtn");
const passwordInput = document.getElementById("passwordInput");
const lockScreenBtn = document.getElementById("lockScreenBtn");
const changePasswordBtn = document.getElementById("changePasswordBtn");
const searchModalBtn = document.getElementById('searchModalBtn');
const searchModal = document.getElementById('searchModal');
const closeSearchModal = document.querySelector('.close-search-modal');
const searchInputModal = document.getElementById('searchInputModal');
const modal = document.getElementById('transactionModal');
const closeModal = document.querySelector('.close-modal');
const chartModal = document.getElementById('chartModal');
const closeChartModal = document.querySelector('.close-chart-modal');


// array for storage users localy 
let users = [];
let currentSelectedUser = null;
let balanceChart = null;

// users key for save to localstorage
const STORAGE_KEY = "users_data";

// password key for save to localstorage
const PASSWORD_KEY = "app_password";
const DEFAULT_PASSWORD = "1234";
let lockTimeout = null;
const LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minuts


// ! ====================== Save Password To Local Storage
// save password with simple encryption (btoa) to local storage
function savePassword(password) {
    localStorage.setItem(PASSWORD_KEY, btoa(password));
}

// !======================= Check Password Function
// check password functi9on
function checkPassword(inputPassword) {
    // Get saved password from localStorage
    const saved = localStorage.getItem(PASSWORD_KEY);
    // If no password was saved
    if (!saved) {
        // Save the default password
        savePassword(DEFAULT_PASSWORD);
        // Check if the entered password is the same as the default password (return true)
        return inputPassword === DEFAULT_PASSWORD;
    }
    // If there is a stored password Convert the stored password from Base64 to plain text and compare it with the entered password
    return inputPassword === atob(saved);
}

// ! ====================== Change Password Function
// change password function
function changePassword() {
    // get current password from user
    let oldPassword = prompt("Enter current password:");
    // check current password (authentication)
    if (oldPassword && checkPassword(oldPassword)) {
        // get new password from user 
        let newPassword = prompt("Enter new password (more than 3 characters):");
        if (newPassword && newPassword.length > 3 ) {
            // Save the new password
            savePassword(newPassword);
            showMessage("✅ Password changed successfully", "success");
            return true;
        } else{
            showLoginError("New password must be more than 3 characters");
            return false;
        }
    } 
    else{
        // If the current password was incorrect
        showLoginError("❌ The current password is incorrect");
        return false;
    }
}


// ! ====================== Lock Screen Function
// protect the application from unauthorized people by hiding the original content and displaying the login page.
function lockScreen() {
    // Show login page (lock)
    document.getElementById('loginOverlay').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('passwordInput').value = '';

    // fucus on password input after click on lock screen
    passwordInput.focus();

    // Cancel the auto-lock timer
    // If there was a timer set for auto-lock, cancel it Since the screen is now locked, there is no need for a timer to re-lock
    if (lockTimeout) clearTimeout(lockTimeout);
}

// ! ====================== Unlock Screen Function
// Checks the user's input password and, if correct, opens access to the main application.
function unlockScreen(password) {
    // Check password correctness
    if ( password && checkPassword(password)) {
        // If the password was correct Hide login page and Show the main program
        document.getElementById('loginOverlay').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        document.getElementById('passwordInput').value = '';
        // Start auto-lock timer if If the user does nothing in 5 minutes, the page will be locked again
        startLockTimer();
        return true;
    } else {
        // If the password is incorrect: Show error message to user
        showLoginError("❌ The password is incorrect!");
        passwordInput.value = '';
        return false;
    }
}

// ! ====================== Start Lock Timer Function
// Increase app security by automatically locking the screen after a period of user inactivity
function startLockTimer() {
    // If there is a previous timer, cancel it
    if (lockTimeout) clearTimeout(lockTimeout);
    // Set a new timer
    lockTimeout = setTimeout(() => {
        lockScreen();
    }, LOCK_TIMEOUT_MS);
}


// ! ====================== Reset Lock Timer Function
// Reset the user's inactivity time to zero. If the user is actively working with the application, the application will not lock.
function resetLockTimer() {
    // Check if the main application is running or not
    if (document.getElementById('mainApp').style.display === 'block') {
        // Restart the timer.
        startLockTimer();
    }
}


// ! ====================== Show Login Error Function
// display login errors (such as incorrect password) in a temporary and way
function showLoginError(msg) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = msg;
    messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            padding: 15px 28px;
            border-radius: 12px;
            z-index: 2000;
            background: rgb(0, 0, 0);
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideDown 0.3s ease;
    `;
    document.body.insertAdjacentElement("afterbegin",messageDiv);
    document.getElementById("loginOverlay").style.background='linear-gradient(135deg, rgb(230, 0, 0) 0%, rgb(160, 0, 0) 100%)';
    setTimeout(() => {
        messageDiv.remove();
        document.getElementById("loginOverlay").style.background ='linear-gradient(135deg, var(--primary) 0%, rgb(5, 87, 62) 100%)';
    }, 3000);
}


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
// get data from input , check validation and excute deposit transaction function
function deposit() {
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

    // implementation of deposit operations
    depositTransaction(firstName , lastName , amount);
    
    // Empty the input values
    firstNameInput.value = "";
    lastNameInput.value = "";
    amountInput.value = "";

    // fucus on the first input
    firstNameInput.focus();
}

// ! ========================= Deposit Transaction Function
// implementation of deposit operations
function depositTransaction(firstName, lastName , amount) {
    // change amount type from string to number
    const amountNum = parseFloat(amount)

    const existingUser = findUserByName(firstName, lastName);
    const dateTime = getCurrentDateTime();

    // creat transaction object
    const newTransaction = {
        date : dateTime.date,
        time : dateTime.time,
        amount : amountNum,
        type : "deposit",
        timestamp : dateTime.timestamp
    }    

    // check user existing
    if (existingUser) {
        existingUser.transactions.push(newTransaction);
        existingUser.totalAssets += amountNum; // add new amount to totalAssets
        saveToLocalStorage();
        renderTable();
        showMessage(`🟢 transaction successful ${amountNum.toLocaleString()} $ added to ${capitalizeFirstLetter(firstName)} ${capitalizeFirstLetter(lastName)}`,"success");
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
    };

    return true
};


// ! ===================== Show Transactions 
// show user transactions in modal
function showTransactions(person) {
    currentSelectedUser = person;
    const modal = document.getElementById("transactionModal");
    const modalTitle = document.getElementById("modalTitle");
    const transactionsList = document.getElementById("transactionsList");

    modalTitle.textContent = `📋 ${capitalizeFirstLetter(person.firstName)} ${capitalizeFirstLetter(person.lastName)} Transactions`;

    if (person.transactions.length === 0) {
        transactionsList.innerHTML = '<div class="empty-state">No Transactions Recorded</div>';
    } else{
        transactionsList.innerHTML = person.transactions.map((trans , index) => {
            const isDeposit = trans.type === "deposit";
            const amountClass = isDeposit ? "deposit-amount" : "withdraw-amount";
            const amountSign = isDeposit ? "+" : "-";
            const transactionClass = isDeposit ? "transaction-deposit" : "transaction-withdraw";
            const typeText = isDeposit ? "Deposit" : "Withdraw";
            const typeBadgeClass = isDeposit ? "type-deposit" : "type-withdraw";
                
            return `
                <div class="transaction-item ${transactionClass}">
                    <div>
                        <strong>#${index + 1}</strong> - 
                        <span class="transaction-type-badge ${typeBadgeClass}">${typeText}</span>
                        Amount: <span class="${amountClass}">${amountSign} ${trans.amount.toLocaleString()} $</span>
                    </div>
                    <div style="margin-top: 5px; font-size: 0.8rem; font-weight: 500; color: rgba(255, 255, 255, 0.85);">
                        📅  Date: ${trans.date} - 🕐 Hour: ${trans.time}
                    </div>
                </div>
            `;
        }).join('');
    }

    modal.style.display = 'flex';
}    


// ! ===================== Calculate Balance Over Time Function
// Inventory calculation function over time
function calculateBalanceOverTime(person) {
    let sortedTransactions = [...person.transactions].sort((a, b) => 
        a.date.localeCompare(b.date)  // Compare solar date
    );
    
    const dates = [];        // Array for storing dates
    const balances = [];     // Array for storing inventory
    let currentBalance = 0;  // Current balance (starts at zero)
    
    // Balance calculation after each transaction
    sortedTransactions.forEach(trans => {
        if (trans.type === 'deposit') {
            currentBalance += trans.amount; // Deposit: Increase balance
        } else {
            currentBalance -= trans.amount; // Withdraw: Inventory reduction
        }
        dates.push(trans.date); // Save the date 
        balances.push(currentBalance); // Save new inventory
    }); 
 
    // Returning data for charting
    return { dates, balances };
}


// ! ===================== Show Chart Function
// creating charts with Chart.js
function showChart(person) {
    // Calculating chart data
    const { dates, balances } = calculateBalanceOverTime(person);

    // Checking for transaction existence
    if (dates.length === 0) {
        showMessage(`❌ User ${person.firstName} ${person.lastName} has no transactions to display! `, "error");
        return;
    }
    
    // modal display
    const modalTitle = document.getElementById('chartModalTitle');
    modalTitle.innerHTML = `📊 ${escapeHtml(capitalizeFirstLetter(person.firstName))} ${escapeHtml(capitalizeFirstLetter(person.lastName))} Financial Trend Chart`;    
    chartModal.style.display = 'flex';

    // Determination of colors
    const textColor ='#cbd5e0';
    const lineColor = 'rgb(0, 174, 255)';
    const gridColor = 'rgba(255, 255, 255, 0.27)';
    
    // Getting the canvas background for drawing a chart and (Getting a 2D texture for drawing)
    const ctx = document.getElementById('balanceChart').getContext('2d');
        
    // If the previous graph exists, destroy it
    if (balanceChart) {
        balanceChart.destroy();
    }

    // Check for the existence of the Chart.js library
    if (typeof Chart === 'undefined') {
        showMessage("❌ Error loading chart!", "erroe");
        return;
    }

    // Creating a new chart with Chart.js
    balanceChart = new Chart(ctx, {
        type: 'line',                  // Chart type
        data: {                        
            labels: dates,             // X-axis labels ["1402/11/10", "1402/11/15", "1402/11/20"]
            datasets: [{
                label: 'Assets',       // Data series title
                data: balances,        // Y axis values [100000, 200000, 150000]
                borderWidth: 3,        
                borderColor: lineColor,
                backgroundColor: 'rgba(0, 174, 255, 0.11)',  // Underline color (semi-transparent)
                fill: true,             // Fill in below the line    
                tension: 0.3,           // Line curvature (0=smooth, 1=curved)
                pointRadius: 5,         // The size of the points on the line
                pointHoverRadius: 7,    // The size of the points on the line (Hoverd)
                pointBackgroundColor: lineColor,
                pointBorderColor: 'rgb(255, 255, 255)'
            }]
        },
        options: {
            responsive: true,           // Responsive (changes with the page)
            maintainAspectRatio: true,  // Maintain aspect ratio
            plugins: {                  // Plugins are additional features that are added to Chart.js and change the behavior of the chart.
                legend: {               // Help settings (When the user clicks on any Legend item, that dataset is hidden or displayed in the chart.)
                    display: true,
                    position: 'top',
                    align: 'center',
                    labels: {
                        color: textColor,
                        font: { size: 14 },
                        padding: 5,
                        pointStyle: 'circle', // box shape 'circle', 'cross', 'crossRot', 'dash', 'line', 'rect', 'rectRounded', 'rectRot', 'star', 'triangle'
                        usePointStyle: true,  // Using a point shape instead of a box
                        boxWidth: 8,
                        boxHeight: 8,
                    }
                },
                tooltip: {              // Hover description management
                    caretSize: 0,       // Delete pointer
                    caretPadding: 0,    // Pointer distance
                    cornerRadius: 10,   // Rounding tooltip corners
                    titleColor: 'rgb(221, 221, 221)',
                    bodyColor: 'rgb(255, 255, 255)',
                    borderColor: 'rgba(0, 0, 0, 0.7)',
                    backgroundColor:'rgba(0, 0, 0, 0.6)',
                    borderWidth: 2,      
                    padding : 8,
                    displayColors: false, // Remove the colored box inside the tooltip
                    callbacks: {
                        title: (tooltipItems) => {
                            // Change the description title
                            return `📅 Date: ${tooltipItems[0].label}`;
                        },
                        label: function(context) {
                            // context.raw = point value (e.g. 150000)
                            return `💰 Total Assets: ${context.raw.toLocaleString()} $`;
                        }
                    }
                }
            },
            scales: {                  // Axis settings
                y: {                   // Y-Axis settings
                    type: 'linear',    // Scale type
                    beginAtZero: true, // Axis starts from zero.
                    ticks: {           // Label settings (numbers on the axis)
                        color: textColor,
                        callback: function(value) {
                            return value.toLocaleString() + ' $';
                        }
                    },
                    grid: {
                        color: gridColor
                    },
                    border: {
                        color: 'rgb(226, 226, 226)',
                        width: 2
                    },
                  
                },
                x: {                   // X-Axis settings
                    ticks: {
                        color: textColor,
                        maxRotation: 45,
                        minRotation: 45,
                    },
                    grid: { 
                        color: gridColor,
                    },
                    border: {
                        color: 'rgb(226, 226, 226)',
                        width: 2
                    },
                }
            }
        }
    });
}


// ! ===================== Withdraw Function
// get data from input , check validation and excute withdraw transaction function
function withdraw() {
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

    // implementation of withdraw operations
    withdrawTransaction(firstName , lastName , amount);
    
    // Empty the input values
    firstNameInput.value = "";
    lastNameInput.value = "";
    amountInput.value = "";

    // fucus on the first input
    firstNameInput.focus();
}


// ! ===================== Withdraw Tranaction Function
// Checking user existence and implementation of withdraw operations
function withdrawTransaction(firstName , lastName , amount) {
    // change amount type from string to number
    const amountNum = parseFloat(amount)

    const existingUser = findUserByName(firstName, lastName);
    const dateTime = getCurrentDateTime();

    // creat transaction object
    const newTransaction = {
        date : dateTime.date,
        time : dateTime.time,
        amount : amountNum,
        type : "withdraw",
        timestamp : dateTime.timestamp
    }  

    if (!existingUser) {
        showMessage(`❌ Error: User with name ${capitalizeFirstLetter(firstName)} ${capitalizeFirstLetter(lastName)} not found! User must exist to withdraw`,"fail");
        return false;
    }

    if (existingUser.totalAssets < amountNum) {
        showMessage(`❌ Error: Insufficient balance! The current balance is ${existingUser.totalAssets.toLocaleString()} $`,"fail");
        return false;
    }

    existingUser.transactions.push(newTransaction);
    existingUser.totalAssets -= amountNum;
    saveToLocalStorage();
    renderTable();
    showMessage(`🔴 Withdrawal of ${amountNum.toLocaleString()} $ from ${capitalizeFirstLetter(firstName)} ${capitalizeFirstLetter(lastName)} account was successful! New balance: ${existingUser.totalAssets.toLocaleString()} $`,"success");
    return true;
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

            showMessage(`🗑 All transactions for ${capitalizeFirstLetter(user.firstName)} ${capitalizeFirstLetter(user.lastName)} have been deleted`,"success");
        }
    }
}

// ! ====================== Search Modal Events Function
// Open modal on button click
function openSearchModal() {
    searchModal.style.display = 'flex';
    searchInputModal.value = '';
    searchInputModal.focus();
    document.getElementById('searchResults').innerHTML = '<div class="no-results"> Type something ...</div>';
}

// Live search (every time the user types)
searchInputModal.addEventListener("input", (e) => {
    performSearch(e.target.value)
});

// Search with Enter key (optional)
searchInputModal.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch(e.target.value);
    }
});


// ! ====================== Performa Search Function
// Search capability in modal
function performSearch(searchTerm) {
    const resultsDiv = document.getElementById("searchResults");
    const term = sanitizeInput(searchTerm.trim()).toLocaleString();
    
    // If the search term was empty
    if (!term) {
        resultsDiv.innerHTML = '<div class="no-results">🔍 Enter search term... </div>';
        return;
    }

    // Filter users by first or last name
    const filteredUsers = users.filter(user => 
        user.firstName.toLowerCase().includes(term) || 
        user.lastName.toLowerCase().includes(term)
    );
        
    // If no results are found
    if (filteredUsers.length === 0) {
        resultsDiv.innerHTML = '<div class="no-results">❌ No users found with this term!</div>';
        return;
    }

    // Creating HTML to display results
    resultsDiv.innerHTML = filteredUsers.map(user => `
        <div class="search-result-item" data-id="${user.id}">
            <div class="search-result-name">${escapeHtml(capitalizeFirstLetter(user.firstName))} ${escapeHtml(capitalizeFirstLetter(user.lastName))}</div>
            <div class="search-result-details">
                <span class="search-result-balance">💰 Total Assets: ${user.totalAssets.toLocaleString()} $</span>
                <span>📋 transactions: ${user.transactions.length}</span>
            </div>
        </div>
    `).join('');

    // Add a click event to each result
    document.querySelectorAll(".search-result-item").forEach(item => {
        item.addEventListener("click" , () => {
            const userId = parseInt(item.dataset.id);
            const user = users.find(u => u.id === userId);

            if (user) {
                searchModal.style.display = 'none';
                showTransactions(user)
            }
        })
    })
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
    firstNameCell.textContent = capitalizeFirstLetter(person.firstName);

    // last name cell
    const lastNameCell = document.createElement('td');
    lastNameCell.textContent = capitalizeFirstLetter(person.lastName);

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

    // financial chart cell
    const financialChartCell = document.createElement('td');
    const chartButton = document.createElement("a");
    chartButton.textContent = "Chart";
    chartButton.className = "chart-btn";

    // add chart button into financial chart cell
    financialChartCell.appendChild(chartButton);

    // financial chart event
    chartButton.addEventListener("click" , () => {
        showChart(person);
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
    row.appendChild(financialChartCell);
    row.appendChild(actionCell);

    return row;
}

// ! ======================= Delete A User 
// delete a user using exact index
function deleteUserByIndex(index) {
    
    if (index >= 0 && index < users.length) {
        users.splice(index , 1); // delete from array
        saveToLocalStorage(); // save in local storage
        renderTable(); // Re-render the table
        showMessage(`🗑 User ${capitalizeFirstLetter(users[index].firstName)} ${capitalizeFirstLetter(users[index].lastName)} was successfully deleted`, "success");

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

// ! ===================== Capitalize First Letter Function
// change the first letter of a string to uppercase
function capitalizeFirstLetter(str) {
    if (!str) return '';
    str = str.trim().toLowerCase();
    return str.charAt(0).toUpperCase() + str.slice(1);
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
}

init(); // RUN


// ! ====================== Close Modal Events
// close transaction modal  
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

// close chart modal
closeChartModal.addEventListener('click', () => {
    chartModal.style.display = 'none';
    if (balanceChart) {
        balanceChart.destroy(); // Destroying the graph to free up memory
        balanceChart = null;
    }
});

// Close by clicking on the dark background
window.addEventListener('click', (e) => {
    if (e.target === chartModal) {
        chartModal.style.display = 'none';
        if (balanceChart) {
            balanceChart.destroy(); // Destroying the graph to free up memory
            balanceChart = null;
        }
    }
});

// close search modal
closeSearchModal.addEventListener("click" , () => {
    searchModal.style.display = 'none';
});

// Close modal by clicking on dark background
window.addEventListener("click" , (e) => {
    if (e.target === searchModal ) {
        searchModal.style.display = 'none';
    }
});


// ! ===================== User Actions To Reset The Timer Function
// User actions to reset the timer
const events = ['click', 'keypress', 'scroll', 'mousemove'];
events.forEach(ev => document.addEventListener(ev, resetLockTimer));


// ! ===================== Events Execution
// event execution
loginBtn.addEventListener("click" , () => unlockScreen(passwordInput.value) ? resetLockTimer() : false );
passwordInput.addEventListener("keypress" , (e) => { if(e.key === 'Enter') loginBtn.click()});
lockScreenBtn.addEventListener("click" , lockScreen);
changePasswordBtn.addEventListener("click" , changePassword);
searchModalBtn.addEventListener("click", openSearchModal);
depositBtn.addEventListener("click" , deposit);
withdrawBtn.addEventListener("click" , withdraw);
clearUserTransactionsBtn.addEventListener("click" , () => currentSelectedUser ? clearUserTransactions(currentSelectedUser.id) : false);
saveBackupBtn.addEventListener("click" , saveBackup);
restoreBackupBtn.addEventListener("click" , restoreBackup)
clearAllBtn.addEventListener("click" , clearAllData);