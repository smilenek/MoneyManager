/* =========================================================
   CAPMONEY PWA
   Core Application
========================================================= */


/* =========================================================
   DATABASE
========================================================= */

const STORAGE_KEY = "capmoney_data";


const defaultData = {

    profile: {
        name: "Nos",
        currency: "VND",
        language: "vi",
        theme: "dark"
    },

    accounts: [
        {
            id: "wallet",
            name: "Wallet",
            type: "wallet",
            balance: 0,
            favorite: true
        },

        {
            id: "bank",
            name: "Bank",
            type: "bank",
            balance: 0,
            favorite: false
        }
    ],

    transactions: [],

    loans: [],

    investments: [],

    budgets: [],

    savings: [],

    recurring: [],

    friends: [],

    groups: [],

    categories: [
        {
            id: "food",
            name: "Ăn uống",
            icon: "🍜",
            type: "expense"
        },
        {
            id: "transport",
            name: "Di chuyển",
            icon: "🚗",
            type: "expense"
        },
        {
            id: "shopping",
            name: "Mua sắm",
            icon: "🛍️",
            type: "expense"
        },
        {
            id: "entertainment",
            name: "Giải trí",
            icon: "🎮",
            type: "expense"
        },
        {
            id: "salary",
            name: "Lương",
            icon: "💰",
            type: "income"
        },
        {
            id: "other-income",
            name: "Thu nhập khác",
            icon: "💵",
            type: "income"
        }
    ]

};


let data =
    JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    ) ||
    structuredClone(defaultData);


/* =========================================================
   STATE
========================================================= */

let currentPage = "home";

let selectedDate = new Date();

let currentMonth =
    new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1
    );

let statisticsMonth =
    new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1
    );

let accountMonth =
    new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1
    );

let balanceVisible = true;

let accountFilter = "all";


/* =========================================================
   SAVE
========================================================= */

function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

}


/* =========================================================
   FORMAT MONEY
========================================================= */

function formatMoney(value) {

    if (!balanceVisible) {
        return "••••";
    }

    value = Number(value) || 0;

    return new Intl.NumberFormat(
        "vi-VN"
    ).format(value) + "đ";

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(date) {

    const d =
        new Date(date);

    const year =
        d.getFullYear();

    const month =
        String(
            d.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            d.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


/* =========================================================
   NAVIGATION
========================================================= */

function navigate(page) {

    currentPage = page;

    document
        .querySelectorAll(".page")
        .forEach(el => {

            el.classList.remove("active");

        });


    const target =
        document.getElementById(
            `page-${page}`
        );


    if (target) {
        target.classList.add("active");
    }


    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === page
            );

        });


    if (page === "home") {
        renderHome();
    }

    if (page === "statistics") {
        renderStatistics();
    }

    if (page === "accounts") {
        renderAccounts();
    }

    if (page === "profile") {
        renderProfile();
    }

}


/* =========================================================
   GREETING
========================================================= */

function updateGreeting() {

    const hour =
        new Date().getHours();

    let greeting;

    if (hour < 5) {
        greeting = "Chào buổi đêm 🌙";
    }
    else if (hour < 12) {
        greeting = "Chào buổi sáng ☀️";
    }
    else if (hour < 18) {
        greeting = "Chào buổi chiều 🌤️";
    }
    else {
        greeting = "Chào buổi tối 🌅";
    }


    const el =
        document.getElementById(
            "greetingText"
        );


    if (el) {
        el.textContent = greeting;
    }

}


/* =========================================================
   HOME
========================================================= */

function renderHome() {

    updateGreeting();

    updateHomeSummary();

    renderCalendar();

    updateDailyStatus();

}


function updateHomeSummary() {

    const month =
        currentMonth.getMonth();

    const year =
        currentMonth.getFullYear();


    let income = 0;

    let expense = 0;


    data.transactions
        .filter(t => {

            const d =
                new Date(t.date);

            return (
                d.getMonth() === month &&
                d.getFullYear() === year
            );

        })
        .forEach(t => {

            if (t.type === "income") {
                income += Number(t.amount);
            }

            if (t.type === "expense") {
                expense += Number(t.amount);
            }

        });


    document.getElementById(
        "homeIncome"
    ).textContent =
        formatMoney(income);


    document.getElementById(
        "homeExpense"
    ).textContent =
        formatMoney(expense);

}


function updateDailyStatus() {

    const today =
        formatDate(
            new Date()
        );


    const spent =
        data.transactions.some(
            t =>
                t.type === "expense" &&
                t.date === today
        );


    document.getElementById(
        "dailyStatus"
    ).textContent =
        spent
            ? "Hôm nay đã có chi tiêu"
            : "Hôm nay chưa chi tiêu";

}


/* =========================================================
   CALENDAR
========================================================= */

function renderCalendar() {

    const calendar =
        document.getElementById(
            "calendar"
        );


    if (!calendar) return;


    const year =
        currentMonth.getFullYear();

    const month =
        currentMonth.getMonth();


    const monthNames = [
        "tháng 1",
        "tháng 2",
        "tháng 3",
        "tháng 4",
        "tháng 5",
        "tháng 6",
        "tháng 7",
        "tháng 8",
        "tháng 9",
        "tháng 10",
        "tháng 11",
        "tháng 12"
    ];


    document.getElementById(
        "monthLabel"
    ).textContent =
        `${monthNames[month]} ${year}`;


    const firstDay =
        new Date(
            year,
            month,
            1
        );


    let startDay =
        firstDay.getDay();

    /*
       JS:
       Sunday = 0

       CapMoney:
       Monday = 0
    */

    startDay =
        startDay === 0
            ? 6
            : startDay - 1;


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    const weekNames = [
        "T2",
        "T3",
        "T4",
        "T5",
        "T6",
        "T7",
        "CN"
    ];


    let html = `

        <div class="calendar-week">

            ${weekNames
                .map(
                    day =>
                        `<div>${day}</div>`
                )
                .join("")}

        </div>

        <div class="calendar-grid">
    `;


    for (
        let i = 0;
        i < startDay;
        i++
    ) {

        html += `
            <div class="calendar-day empty">
                <span>0</span>
            </div>
        `;

    }


    const today =
        formatDate(
            new Date()
        );


    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const date =
            new Date(
                year,
                month,
                day
            );


        const dateString =
            formatDate(date);


        const hasData =
            data.transactions.some(
                t =>
                    t.date === dateString
            );


        const isToday =
            dateString === today;


        html += `

            <div
                class="
                    calendar-day
                    ${hasData ? "has-data" : ""}
                    ${isToday ? "today" : ""}
                "
                onclick="selectCalendarDate('${dateString}')"
            >

                <span class="calendar-number">
                    ${day}
                </span>

                ${
                    hasData
                        ? `<span class="day-dot"></span>`
                        : ""
                }

            </div>

        `;

    }


    html += `
        </div>
    `;


    calendar.innerHTML = html;

}


function selectCalendarDate(date) {

    selectedDate =
        new Date(date);

    openDayTransactions(date);

}


function changeMonth(direction) {

    currentMonth.setMonth(
        currentMonth.getMonth() + direction
    );

    renderHome();

}


/* =========================================================
   HOME VIEW
========================================================= */

function setHomeView(mode) {

    document
        .getElementById("dayViewButton")
        .classList.toggle(
            "selected",
            mode === "day"
        );


    document
        .getElementById("monthViewButton")
        .classList.toggle(
            "selected",
            mode === "month"
        );


    if (mode === "day") {

        openDayTransactions(
            formatDate(
                new Date()
            )
        );

    }

}


/* =========================================================
   ACCOUNT FILTER
========================================================= */

function setAccountFilter(
    filter,
    button
) {

    accountFilter = filter;


    document
        .querySelectorAll(".account-filter .filter")
        .forEach(
            el =>
                el.classList.remove(
                    "active"
                )
        );


    button.classList.add("active");

    renderHome();

}


/* =========================================================
   BALANCE VISIBILITY
========================================================= */

function toggleBalanceVisibility() {

    balanceVisible =
        !balanceVisible;

    renderHome();
    renderStatistics();
    renderAccounts();

}


/* =========================================================
   STATISTICS
========================================================= */

function renderStatistics() {

    const month =
        statisticsMonth.getMonth();

    const year =
        statisticsMonth.getFullYear();


    document.getElementById(
        "statisticsMonth"
    ).textContent =
        `tháng ${month + 1} ${year}`;


    let income = 0;

    let expense = 0;


    data.transactions
        .filter(t => {

            const d =
                new Date(t.date);

            return (
                d.getMonth() === month &&
                d.getFullYear() === year
            );

        })
        .forEach(t => {

            if (t.type === "income") {
                income += Number(t.amount);
            }

            if (t.type === "expense") {
                expense += Number(t.amount);
            }

        });


    document.getElementById(
        "statisticsIncome"
    ).textContent =
        formatMoney(income);


    document.getElementById(
        "statisticsExpense"
    ).textContent =
        formatMoney(expense);


    document.getElementById(
        "statisticsBalance"
    ).textContent =
        "+" +
        formatMoney(
            income - expense
        );

}


function changeStatisticsMode(
    mode,
    button
) {

    document
        .querySelectorAll(
            ".statistics-tabs button"
        )
        .forEach(
            el =>
                el.classList.remove(
                    "active"
                )
        );

    button.classList.add("active");

}


function changeStatisticsMonth(
    direction
) {

    statisticsMonth.setMonth(
        statisticsMonth.getMonth() +
        direction
    );

    renderStatistics();

}


/* =========================================================
   ACCOUNTS
========================================================= */

function renderAccounts() {

    const total =
        data.accounts.reduce(
            (
                sum,
                account
            ) =>
                sum +
                Number(
                    account.balance
                ),
            0
        );


    let income = 0;
    let expense = 0;


    data.transactions.forEach(t => {

        if (t.type === "income") {
            income += Number(t.amount);
        }

        if (t.type === "expense") {
            expense += Number(t.amount);
        }

    });


    document.getElementById(
        "totalBalance"
    ).textContent =
        formatMoney(total);


    document.getElementById(
        "accountIncome"
    ).textContent =
        formatMoney(income);


    document.getElementById(
        "accountExpense"
    ).textContent =
        formatMoney(expense);


    const list =
        document.getElementById(
            "accountsList"
        );


    list.innerHTML =
        data.accounts
            .map(account => `

                <div
                    class="account-item"
                    onclick="openAccountDetails('${account.id}')"
                >

                    <div
                        class="
                            account-icon
                            ${account.type === "bank" ? "bank" : ""}
                        "
                    >
                        ${
                            account.type === "bank"
                                ? "🏛"
                                : "▣"
                        }
                    </div>


                    <div class="account-info">

                        <strong>
                            ${escapeHTML(account.name)}

                            ${
                                account.favorite
                                    ? `<span>⭐</span>`
                                    : ""
                            }

                            <small>đ</small>
                        </strong>

                        <div class="account-balance">
                            ${formatMoney(account.balance)}
                        </div>

                    </div>


                    <div class="account-arrow">
                        ›
                    </div>

                </div>

            `)
            .join("");

}


function changeAccountMonth(
    direction
) {

    accountMonth.setMonth(
        accountMonth.getMonth() +
        direction
    );


    document.getElementById(
        "accountMonth"
    ).textContent =
        `tháng ${
            accountMonth.getMonth() + 1
        } ${
            accountMonth.getFullYear()
        }`;

}


function showAccountSection(
    section,
    button
) {

    document
        .querySelectorAll(
            ".section-tabs button"
        )
        .forEach(
            el =>
                el.classList.remove(
                    "active"
                )
        );


    button.classList.add("active");


    document.getElementById(
        "account-section"
    ).style.display =
        section === "accounts"
            ? "block"
            : "none";


    document.getElementById(
        "loan-section"
    ).style.display =
        section === "loans"
            ? "block"
            : "none";


    document.getElementById(
        "investment-section"
    ).style.display =
        section === "investments"
            ? "block"
            : "none";


    if (section === "loans") {
        renderLoans();
    }

}


/* =========================================================
   TRANSACTIONS
========================================================= */

function openTransactionModal(
    date = formatDate(new Date())
) {

    showModal(`

        <div class="modal-header">

            <h2>
                Thêm giao dịch
            </h2>

            <button
                class="close-modal"
                onclick="closeModal()"
            >
                ×
            </button>

        </div>


        <div class="type-selector">

            <button
                class="active"
                id="expenseTypeButton"
                onclick="selectTransactionType('expense')"
            >
                ↑ Chi tiêu
            </button>

            <button
                id="incomeTypeButton"
                onclick="selectTransactionType('income')"
            >
                ↓ Thu nhập
            </button>

        </div>


        <input
            type="hidden"
            id="transactionType"
            value="expense"
        >


        <div class="form-group">

            <label>
                Số tiền
            </label>

            <input
                id="transactionAmount"
                type="number"
                inputmode="decimal"
                placeholder="0"
            >

        </div>


        <div class="form-group">

            <label>
                Ngày
            </label>

            <input
                id="transactionDate"
                type="date"
                value="${date}"
            >

        </div>


        <div class="form-group">

            <label>
                Tài khoản
            </label>

            <select id="transactionAccount">

                ${data.accounts
                    .map(
                        account =>
                            `<option value="${account.id}">
                                ${escapeHTML(account.name)}
                            </option>`
                    )
                    .join("")}

            </select>

        </div>


        <div class="form-group">

            <label>
                Danh mục
            </label>

            <select id="transactionCategory">

                ${data.categories
                    .map(
                        category =>
                            `<option value="${category.id}">
                                ${category.icon} ${escapeHTML(category.name)}
                            </option>`
                    )
                    .join("")}

            </select>

        </div>


        <div class="form-group">

            <label>
                Ghi chú
            </label>

            <textarea
                id="transactionNote"
                rows="3"
                placeholder="Ghi chú..."
            ></textarea>

        </div>


        <button
            class="form-submit"
            onclick="saveTransaction()"
        >
            Lưu giao dịch
        </button>

    `);

}


function selectTransactionType(
    type
) {

    document.getElementById(
        "transactionType"
    ).value = type;


    document
        .getElementById(
            "expenseTypeButton"
        )
        .classList.toggle(
            "active",
            type === "expense"
        );


    document
        .getElementById(
            "incomeTypeButton"
        )
        .classList.toggle(
            "active",
            type === "income"
        );

}


function saveTransaction() {

    const amount =
        Number(
            document.getElementById(
                "transactionAmount"
            ).value
        );


    if (
        !amount ||
        amount <= 0
    ) {

        alert(
            "Vui lòng nhập số tiền."
        );

        return;

    }


    const type =
        document.getElementById(
            "transactionType"
        ).value;


    const accountId =
        document.getElementById(
            "transactionAccount"
        ).value;


    const account =
        data.accounts.find(
            a =>
                a.id === accountId
        );


    if (!account) return;


    const transaction = {

        id:
            crypto.randomUUID(),

        amount,

        type,

        date:
            document.getElementById(
                "transactionDate"
            ).value,

        accountId,

        categoryId:
            document.getElementById(
                "transactionCategory"
            ).value,

        note:
            document.getElementById(
                "transactionNote"
            ).value.trim(),

        createdAt:
            new Date().toISOString()

    };


    data.transactions.push(
        transaction
    );


    if (type === "income") {

        account.balance += amount;

    }
    else {

        account.balance -= amount;

    }


    saveData();

    closeModal();

    renderHome();

    renderAccounts();

    renderStatistics();

    renderProfile();


    alert(
        "Đã lưu giao dịch."
    );

}


/* =========================================================
   DAY TRANSACTIONS
========================================================= */

function openDayTransactions(
    date
) {

    const transactions =
        data.transactions.filter(
            t =>
                t.date === date
        );


    const income =
        transactions
            .filter(
                t =>
                    t.type === "income"
            )
            .reduce(
                (
                    sum,
                    t
                ) =>
                    sum +
                    Number(t.amount),
                0
            );


    const expense =
        transactions
            .filter(
                t =>
                    t.type === "expense"
            )
            .reduce(
                (
                    sum,
                    t
                ) =>
                    sum +
                    Number(t.amount),
                0
            );


    showModal(`

        <div class="modal-header">

            <h2>
                ${date}
            </h2>

            <button
                class="close-modal"
                onclick="closeModal()"
            >
                ×
            </button>

        </div>


        <div class="statistics-summary">

            <div class="stat-box income">
                <span class="stat-label">
                    ↓ Thu nhập
                </span>

                <strong class="income-text">
                    ${formatMoney(income)}
                </strong>
            </div>


            <div class="stat-box expense">
                <span class="stat-label">
                    ↑ Chi tiêu
                </span>

                <strong class="expense-text">
                    ${formatMoney(expense)}
                </strong>
            </div>

        </div>


        <div style="margin-top:25px">

            ${
                transactions.length
                    ?
                    transactions
                        .map(
                            t =>
                                `
                                <div class="account-item">

                                    <div class="account-icon">
                                        ${
                                            t.type === "income"
                                                ? "↓"
                                                : "↑"
                                        }
                                    </div>

                                    <div class="account-info">

                                        <strong>
                                            ${formatMoney(t.amount)}
                                        </strong>

                                        <div class="account-balance">
                                            ${escapeHTML(t.note || "Giao dịch")}
                                        </div>

                                    </div>

                                </div>
                                `
                        )
                        .join("")
                    :
                    `
                    <div class="empty-card large-empty">
                        <div class="empty-icon">
                            +
                        </div>

                        <strong>
                            Chưa có giao dịch
                        </strong>

                        <p>
                            Nhấn nút bên dưới để thêm giao dịch.
                        </p>
                    </div>
                    `
            }

        </div>


        <button
            class="form-submit"
            onclick="closeModal(); openTransactionModal('${date}')"
        >
            + Thêm giao dịch
        </button>

    `);

}


/* =========================================================
   ACCOUNTS
========================================================= */

function openAccountModal() {

    showModal(`

        <div class="modal-header">

            <h2>
                Thêm tài khoản
            </h2>

            <button
                class="close-modal"
                onclick="closeModal()"
            >
                ×
            </button>

        </div>


        <div class="form-group">

            <label>
                Tên tài khoản
            </label>

            <input
                id="accountName"
                placeholder="Ví tiền mặt..."
            >

        </div>


        <div class="form-group">

            <label>
                Loại
            </label>

            <select id="accountType">

                <option value="wallet">
                    Wallet
                </option>

                <option value="bank">
                    Bank
                </option>

            </select>

        </div>


        <div class="form-group">

            <label>
                Số dư ban đầu
            </label>

            <input
                id="accountInitial"
                type="number"
                inputmode="decimal"
                value="0"
            >

        </div>


        <button
            class="form-submit"
            onclick="saveAccount()"
        >
            Thêm tài khoản
        </button>

    `);

}


function saveAccount() {

    const name =
        document.getElementById(
            "accountName"
        ).value.trim();


    if (!name) {

        alert(
            "Vui lòng nhập tên tài khoản."
        );

        return;

    }


    const balance =
        Number(
            document.getElementById(
                "accountInitial"
            ).value
        ) || 0;


    data.accounts.push({

        id:
            crypto.randomUUID(),

        name,

        type:
            document.getElementById(
                "accountType"
            ).value,

        balance,

        favorite: false

    });


    saveData();

    closeModal();

    renderAccounts();

}


function openAccountDetails(
    id
) {

    const account =
        data.accounts.find(
            a =>
                a.id === id
        );


    if (!account) return;


    showModal(`

        <div class="modal-header">

            <h2>
                ${escapeHTML(account.name)}
            </h2>

            <button
                class="close-modal"
                onclick="closeModal()"
            >
                ×
            </button>

        </div>


        <div
            style="
                text-align:center;
                font-size:45px;
                color:#82cf82;
                margin:30px 0;
            "
        >
            ${formatMoney(account.balance)}
        </div>


        <button
            class="form-submit"
            onclick="closeModal(); openTransactionModal()"
        >
            + Thêm giao dịch
        </button>


        <button
            class="form-submit"
            style="
                background:#29292e;
                margin-top:10px;
            "
            onclick="deleteAccount('${id}')"
        >
            Xóa tài khoản
        </button>

    `);

}


function deleteAccount(id) {

    if (
        data.accounts.length <= 1
    ) {

        alert(
            "Phải có ít nhất một tài khoản."
        );

        return;

    }


    if (
        !confirm(
            "Bạn có chắc muốn xóa tài khoản này?"
        )
    ) {
        return;
    }


    data.accounts =
        data.accounts.filter(
            a =>
                a.id !== id
        );


    saveData();

    closeModal();

    renderAccounts();

}


/* =========================================================
   TRANSFER
========================================================= */

function openTransferModal() {

    showModal(`

        <div class="modal-header">

            <h2>
                Chuyển tiền
            </h2>

            <button
                class="close-modal"
                onclick="closeModal()"
            >
                ×
            </button>

        </div>


        <div class="form-group">

            <label>
                Từ tài khoản
            </label>

            <select id="transferFrom">

                ${data.accounts
                    .map(
                        a =>
                            `<option value="${a.id}">
                                ${escapeHTML(a.name)}
                            </option>`
                    )
                    .join("")}

            </select>

        </div>


        <div class="form-group">

            <label>
                Đến tài khoản
            </label>

            <select id="transferTo">

                ${data.accounts
                    .map(
                        a =>
                            `<option value="${a.id}">
                                ${escapeHTML(a.name)}
                            </option>`
                    )
                    .join("")}

            </select>

        </div>


        <div class="form-group">

            <label>
                Số tiền
            </label>

            <input
                id="transferAmount"
                type="number"
                inputmode="decimal"
                placeholder="0"
            >

        </div>


        <button
            class="form-submit"
            onclick="saveTransfer()"
        >
            Chuyển tiền
        </button>

    `);

}


function saveTransfer() {

    const fromId =
        document.getElementById(
            "transferFrom"
        ).value;


    const toId =
        document.getElementById(
            "transferTo"
        ).value;


    const amount =
        Number(
            document.getElementById(
                "transferAmount"
            ).value
        );


    if (fromId === toId) {

        alert(
            "Tài khoản nguồn và đích phải khác nhau."
        );

        return;

    }


    if (
        !amount ||
        amount <= 0
    ) {

        alert(
            "Số tiền không hợp lệ."
        );

        return;

    }


    const from =
        data.accounts.find(
            a =>
                a.id === fromId
        );


    const to =
        data.accounts.find(
            a =>
                a.id === toId
        );


    if (
        !from ||
        !to
    ) return;


    if (
        from.balance < amount
    ) {

        if (
            !confirm(
                "Số dư hiện tại không đủ. Vẫn thực hiện?"
            )
        ) {
            return;
        }

    }


    from.balance -= amount;

    to.balance += amount;


    saveData();

    closeModal();

    renderAccounts();

}


/* =========================================================
   LOANS
========================================================= */

function renderLoans() {

    const container =
        document.getElementById(
            "loansList"
        );


    if (
        !data.loans.length
    ) {

        container.className =
            "empty-card large-empty";


        container.innerHTML = `

            <div class="empty-icon">
                💵
            </div>

            <strong>
                Chưa có khoản vay
            </strong>

            <p>
                Nhấn + để thêm khoản vay hoặc trả góp
            </p>

        `;

        return;

    }


    container.className = "";

    container.innerHTML =
        data.loans
            .map(
                loan =>
                    `
                    <div class="account-item">

                        <div class="account-icon">
                            💵
                        </div>

                        <div class="account-info">

                            <strong>
                                ${escapeHTML(loan.name)}
                            </strong>

                            <div class="account-balance">
                                Còn ${formatMoney(loan.remaining)}
                            </div>

                        </div>

                    </div>
                    `
            )
            .join("");

}


function openLoanModal() {

    showModal(`

        <div class="modal-header">

            <h2>
                Thêm khoản vay
            </h2>

            <button
                class="close-modal"
                onclick="closeModal()"
            >
                ×
            </button>

        </div>


        <div class="form-group">

            <label>
                Tên khoản vay
            </label>

            <input
                id="loanName"
                placeholder="Ví dụ: Vay ngân hàng"
            >

        </div>


        <div class="form-group">

            <label>
                Số tiền
            </label>

            <input
                id="loanAmount"
                type="number"
                inputmode="decimal"
            >

        </div>


        <div class="form-group">

            <label>
                Lãi suất (%)
            </label>

            <input
                id="loanRate"
                type="number"
                step="0.01"
            >

        </div>


        <button
            class="form-submit"
            onclick="saveLoan()"
        >
            Lưu khoản vay
        </button>

    `);

}


function saveLoan() {

    const name =
        document.getElementById(
            "loanName"
        ).value.trim();


    const amount =
        Number(
            document.getElementById(
                "loanAmount"
            ).value
        );


    if (
        !name ||
        !amount
    ) {

        alert(
            "Vui lòng nhập đầy đủ."
        );

        return;

    }


    data.loans.push({

        id:
            crypto.randomUUID(),

        name,

        amount,

        remaining: amount,

        rate:
            Number(
                document.getElementById(
                    "loanRate"
                ).value
            ) || 0,

        createdAt:
            new Date().toISOString()

    });


    saveData();

    closeModal();

    renderLoans();

}


/* =========================================================
   INVESTMENT
========================================================= */

function openInvestmentModal() {

    showModal(`

        <div class="modal-header">

            <h2>
                Thêm khoản đầu tư
            </h2>

            <button
                class="close-modal"
                onclick="closeModal()"
            >
                ×
            </button>

        </div>


        <div class="form-group">

            <label>
                Tên khoản đầu tư
            </label>

            <input
                id="investmentName"
                placeholder="BTC, ETH, SJC..."
            >

        </div>


        <div class="form-group">

            <label>
                Loại
            </label>

            <select id="investmentType">

                <option>Vàng</option>
                <option>Bạc</option>
                <option>Crypto</option>
                <option>Cổ phiếu</option>
                <option>Khác</option>

            </select>

        </div>


        <div class="form-group">

            <label>
                Giá trị
            </label>

            <input
                id="investmentAmount"
                type="number"
            >

        </div>


        <button
            class="form-submit"
            onclick="saveInvestment()"
        >
            Lưu khoản đầu tư
        </button>

    `);

}


function saveInvestment() {

    const name =
        document.getElementById(
            "investmentName"
        ).value.trim();


    const amount =
        Number(
            document.getElementById(
                "investmentAmount"
            ).value
        );


    if (
        !name ||
        !amount
    ) {

        alert(
            "Vui lòng nhập đầy đủ."
        );

        return;

    }


    data.investments.push({

        id:
            crypto.randomUUID(),

        name,

        type:
            document.getElementById(
                "investmentType"
            ).value,

        amount,

        createdAt:
            new Date().toISOString()

    });


    saveData();

    closeModal();

}


function updateMarketPrices() {

    alert(
        "Chức năng cập nhật giá sẽ kết nối API thị trường ở bước tiếp theo."
    );

}


/* =========================================================
   BUDGET
========================================================= */

function openBudgetModal() {

    showModal(`

        <div class="modal-header">

            <h2>
                Tạo ngân sách
            </h2>

            <button
                class="close-modal"
                onclick="closeModal()"
            >
                ×
            </button>

        </div>


        <div class="form-group">

            <label>
                Tên ngân sách
            </label>

            <input
                id="budgetName"
                placeholder="Ăn uống..."
            >

        </div>


        <div class="form-group">

            <label>
                Hạn mức
            </label>

            <input
                id="budgetLimit"
                type="number"
            >

        </div>


        <div class="form-group">

            <label>
                Danh mục
            </label>

            <select id="budgetCategory">

                ${data.categories
                    .filter(
                        c =>
                            c.type === "expense"
                    )
                    .map(
                        c =>
                            `<option value="${c.id}">
                                ${c.icon} ${escapeHTML(c.name)}
                            </option>`
                    )
                    .join("")}

            </select>

        </div>


        <button
            class="form-submit"
            onclick="saveBudget()"
        >
            Tạo ngân sách
        </button>

    `);

}


function saveBudget() {

    const name =
        document.getElementById(
            "budgetName"
        ).value.trim();


    const limit =
        Number(
            document.getElementById(
                "budgetLimit"
            ).value
        );


    if (
        !name ||
        !limit
    ) {

        alert(
            "Vui lòng nhập đầy đủ."
        );

        return;

    }


    data.budgets.push({

        id:
            crypto.randomUUID(),

        name,

        limit,

        categoryId:
            document.getElementById(
                "budgetCategory"
            ).value,

        spent: 0

    });


    saveData();

    closeModal();

    renderBudgets();

}


function renderBudgets() {

    const list =
        document.getElementById(
            "budgetList"
        );


    if (
        !data.budgets.length
    ) {

        return;

    }


    list.className = "";


    list.innerHTML =
        data.budgets
            .map(
                budget =>
                    `
                    <div class="account-item">

                        <div class="account-icon">
                            💳
                        </div>

                        <div class="account-info">

                            <strong>
                                ${escapeHTML(budget.name)}
                            </strong>

                            <div class="account-balance">
                                ${formatMoney(budget.spent)}
                                /
                                ${formatMoney(budget.limit)}
                            </div>

                        </div>

                    </div>
                    `
            )
            .join("");

}


/* =========================================================
   PROFILE
========================================================= */

function renderProfile() {

    document.getElementById(
        "username"
    ).textContent =
        data.profile.name;


    document.getElementById(
        "profileName"
    ).textContent =
        data.profile.name;


    document.getElementById(
        "profileTransactions"
    ).textContent =
        data.transactions.length;


    const income =
        data.transactions
            .filter(
                t =>
                    t.type === "income"
            )
            .reduce(
                (
                    sum,
                    t
                ) =>
                    sum +
                    Number(t.amount),
                0
            );


    const expense =
        data.transactions
            .filter(
                t =>
                    t.type === "expense"
            )
            .reduce(
                (
                    sum,
                    t
                ) =>
                    sum +
                    Number(t.amount),
                0
            );


    const overview =
        document.querySelectorAll(
            ".overview-grid strong"
        );


    if (overview.length >= 4) {

        overview[1].textContent =
            formatMoney(income);

        overview[2].textContent =
            formatMoney(expense);

        overview[3].textContent =
            formatMoney(
                income - expense
            );

    }

}


/* =========================================================
   PRO
========================================================= */

function openProModal() {

    showModal(`

        <div class="modal-header">

            <h2>
                Mở khóa toàn bộ CapMoney
            </h2>

            <button
                class="close-modal"
                onclick="closeModal()"
            >
                ×
            </button>

        </div>


        <p
            style="
                color:#aaa;
                font-size:18px;
                text-align:center;
            "
        >
            Không giới hạn mỗi ngày, ghi chép thoải mái —
            quản lý tiền nhẹ nhàng và vui hơn
        </p>


        <div class="empty-card">

            <div class="empty-icon">
                ∞
            </div>

            <div>
                <strong>
                    Giao dịch không giới hạn
                </strong>

                <p>
                    Thêm bao nhiêu giao dịch tùy thích
                </p>
            </div>

        </div>


        <div class="empty-card">
            <div class="empty-icon">▣</div>

            <div>
                <strong>
                    Mọi loại tài khoản
                </strong>

                <p>
                    Thẻ tín dụng, sổ tiết kiệm,
                    ví điện tử, khoản vay...
                </p>
            </div>
        </div>


        <div class="empty-card">
            <div class="empty-icon">👥</div>

            <div>
                <strong>
                    Chia sẻ với người thân
                </strong>

                <p>
                    Dùng chung tài khoản ngân hàng,
                    ngân sách với bạn bè
                </p>
            </div>
        </div>


        <div class="empty-card">
            <div class="empty-icon">⚡</div>

            <div>
                <strong>
                    Lưu chuyển khoản siêu tốc
                </strong>

                <p>
                    Chụp màn hình biên lai chuyển khoản
                </p>
            </div>
        </div>


        <div class="empty-card">
            <div class="empty-icon">🎥</div>

            <div>
                <strong>
                    Video 3 giây
                </strong>

                <p>
                    Quay khoảnh khắc cùng giao dịch
                </p>
            </div>
        </div>


        <div class="empty-card">
            <div class="empty-icon">▥</div>

            <div>
                <strong>
                    Thống kê nâng cao
                </strong>

                <p>
                    Biểu đồ và phân tích chi tiết
                </p>
            </div>
        </div>


        <div class="empty-card">
            <div class="empty-icon">🗂</div>

            <div>
                <strong>
                    Danh mục tùy chỉnh
                </strong>

                <p>
                    Tạo danh mục riêng của bạn
                </p>
            </div>
        </div>


        <div class="empty-card">
            <div class="empty-icon">▦</div>

            <div>
                <strong>
                    Widget màn hình chính
                </strong>

                <p>
                    Xem chi tiêu ngay trên màn hình chính
                </p>
            </div>
        </div>


        <div class="empty-card">
            <div class="empty-icon">↥</div>

            <div>
                <strong>
                    Xuất dữ liệu
                </strong>

                <p>
                    Xuất báo cáo PDF, Excel
                </p>
            </div>
        </div>


        <button
            class="form-submit"
            onclick="activatePro()"
        >
            Nâng cấp Pro
        </button>

    `);

}


function activatePro() {

    localStorage.setItem(
        "capmoney_pro",
        "true"
    );

    closeModal();

    alert(
        "Chế độ Pro đã được bật trên bản PWA thử nghiệm."
    );

}


/* =========================================================
   SETTINGS
========================================================= */

function openProfile() {

    navigate("profile");

}


function openSettings() {

    showModal(`

        <div class="modal-header">

            <h2>
                Cài đặt
            </h2>

            <button
                class="close-modal"
                onclick="closeModal()"
            >
                ×
            </button>

        </div>


        <div class="settings-list">

            <button onclick="resetData()">
                🗑
                <span>
                    Xóa toàn bộ dữ liệu
                </span>
                <b>›</b>
            </button>

            <button onclick="exportJSON()">
                ↥
                <span>
                    Xuất dữ liệu JSON
                </span>
                <b>›</b>
            </button>

            <button onclick="importJSON()">
                ↧
                <span>
                    Nhập dữ liệu JSON
                </span>
                <b>›</b>
            </button>

        </div>

    `);

}


function resetData() {

    if (
        !confirm(
            "Xóa toàn bộ dữ liệu CapMoney?"
        )
    ) {
        return;
    }


    data =
        structuredClone(
            defaultData
        );


    saveData();

    closeModal();

    renderHome();

    renderAccounts();

    renderStatistics();

    renderProfile();

}


/* =========================================================
   EXPORT
========================================================= */

function exportJSON() {

    const blob =
        new Blob(
            [
                JSON.stringify(
                    data,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const a =
        document.createElement(
            "a"
        );


    a.href = url;

    a.download =
        "capmoney-backup.json";


    a.click();


    URL.revokeObjectURL(url);

}


function importJSON() {

    const input =
        document.createElement(
            "input"
        );


    input.type = "file";

    input.accept =
        "application/json";


    input.onchange =
        event => {

            const file =
                event.target.files[0];


            if (!file) return;


            const reader =
                new FileReader();


            reader.onload =
                e => {

                    try {

                        data =
                            JSON.parse(
                                e.target.result
                            );


                        saveData();

                        location.reload();

                    }
                    catch {

                        alert(
                            "File dữ liệu không hợp lệ."
                        );

                    }

                };


            reader.readAsText(
                file
            );

        };


    input.click();

}


/* =========================================================
   GENERIC PLACEHOLDERS
========================================================= */

function openSearch() {
    alert("Tìm kiếm giao dịch sẽ được bổ sung.");
}


function openQuickActions() {
    openTransactionModal();
}


function sortAccounts() {
    data.accounts.sort(
        (a, b) =>
            Number(b.favorite) -
            Number(a.favorite)
    );

    saveData();

    renderAccounts();
}


function showTransferHistory() {
    alert("Lịch sử chuyển tiền sẽ được bổ sung.");
}


function openSavingsModal() {
    alert("Sổ tiết kiệm sẽ được bổ sung.");
}


function openInvestmentDetails() {
    alert("Chi tiết đầu tư.");
}


function manageBudgetMembers() {
    alert("Quản lý thành viên ngân sách.");
}


function openFriends() {
    alert("Bạn bè.");
}


function openGroups() {
    alert("Nhóm.");
}


function openSharedTransactions() {
    alert("Giao dịch được chia sẻ.");
}


function openSplitMoney() {
    alert("Chia tiền.");
}


function openRecurringTransactions() {
    alert("Giao dịch định kỳ.");
}


function openCategories() {
    alert("Quản lý danh mục.");
}


function changeLanguage() {
    alert("Ngôn ngữ: Tiếng Việt.");
}


function changeTheme() {
    alert("Giao diện: Tối.");
}


function changeCurrency() {
    alert("Tiền tệ: VND.");
}


function rateApp() {
    alert("Cảm ơn bạn đã đánh giá CapMoney.");
}


function sendFeedback() {
    alert("Mở biểu mẫu góp ý.");
}


function shareApp() {

    if (
        navigator.share
    ) {

        navigator.share({
            title: "CapMoney",
            text: "Ứng dụng quản lý tài chính cá nhân"
        });

    }
    else {

        alert(
            "Trình duyệt không hỗ trợ chia sẻ."
        );

    }

}


function loginApple() {
    alert(
        "Đăng nhập Apple sẽ được tích hợp ở phiên bản backend."
    );
}


function changeAvatar() {
    alert(
        "Đổi avatar sẽ được bổ sung."
    );
}


/* =========================================================
   MODAL
========================================================= */

function showModal(
    content
) {

    const container =
        document.getElementById(
            "modalContainer"
        );


    const modal =
        document.getElementById(
            "modal"
        );


    modal.innerHTML =
        content;


    container.classList.add(
        "show"
    );

}


function closeModal() {

    document
        .getElementById(
            "modalContainer"
        )
        .classList.remove(
            "show"
        );

}


function closeModalOutside(
    event
) {

    if (
        event.target.id ===
        "modalContainer"
    ) {

        closeModal();

    }

}


/* =========================================================
   HTML SECURITY
========================================================= */

function escapeHTML(
    text
) {

    return String(text)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   PWA
========================================================= */

if (
    "serviceWorker" in navigator
) {

    window.addEventListener(
        "load",
        () => {

            navigator.serviceWorker
                .register(
                    "sw.js"
                )
                .catch(
                    error =>
                        console.error(
                            "SW error:",
                            error
                        )
                );

        }
    );

}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateGreeting();

        renderHome();

        renderStatistics();

        renderAccounts();

        renderProfile();

        renderBudgets();

    }
);