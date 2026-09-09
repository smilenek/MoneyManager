/* =========================================================
   CAPMONEY PWA
   Main Application
========================================================= */

const App = {

    state: {

        currentPage: "home",

        homePeriod: "month",

        accountFilter: "all",

        currentMonth: new Date(),

        statisticsMonth: new Date(),

        accountMonth: new Date(),

        balanceVisible: true,

        accountPage: "accounts",

        transactions: [],

        accounts: [],

        loans: [],

        investments: [],

        budgets: [],

        savings: [],

        recurring: [],

        categories: [],

        transfers: [],

        settings: {

            name: "Nos",

            currency: "VND",

            language: "vi",

            theme: "dark"

        }

    },


    /* =====================================================
       INIT
    ===================================================== */

    init() {

        this.load();

        this.seedData();

        this.bindEvents();

        this.updateGreeting();

        this.renderAll();

        this.registerServiceWorker();

    },


    /* =====================================================
       STORAGE
    ===================================================== */

    save() {

        localStorage.setItem(
            "capmoney-data",
            JSON.stringify(this.state)
        );

    },


    load() {

        const raw =
            localStorage.getItem("capmoney-data");

        if (!raw) return;

        try {

            const data = JSON.parse(raw);

            this.state = {
                ...this.state,
                ...data,

                settings: {
                    ...this.state.settings,
                    ...(data.settings || {})
                }

            };

        } catch (error) {

            console.error(
                "Không thể đọc dữ liệu",
                error
            );

        }

    },


    seedData() {

        if (!this.state.accounts.length) {

            this.state.accounts = [

                {
                    id: crypto.randomUUID(),
                    name: "Wallet",
                    type: "wallet",
                    balance: 0,
                    currency: "VND",
                    favorite: true
                },

                {
                    id: crypto.randomUUID(),
                    name: "Bank",
                    type: "bank",
                    balance: 0,
                    currency: "VND",
                    favorite: false
                }

            ];

            this.save();

        }

    },


    /* =====================================================
       SERVICE WORKER
    ===================================================== */

    async registerServiceWorker() {

        if (!("serviceWorker" in navigator))
            return;

        try {

            await navigator.serviceWorker.register(
                "sw.js"
            );

        } catch (error) {

            console.log(
                "Service Worker chưa được đăng ký",
                error
            );

        }

    },


    /* =====================================================
       EVENTS
    ===================================================== */

    bindEvents() {

        window.addEventListener(
            "storage",
            () => this.renderAll()
        );

    },


    /* =====================================================
       NAVIGATION
    ===================================================== */

    navigate(page) {

        const pages =
            document.querySelectorAll(".page");

        pages.forEach(
            p => p.classList.remove("active")
        );

        const target =
            document.getElementById(
                `page-${page}`
            );

        if (target)
            target.classList.add("active");

        document
            .querySelectorAll(".nav-item")
            .forEach(btn => {

                btn.classList.toggle(
                    "active",
                    btn.dataset.page === page
                );

            });

        this.state.currentPage = page;

        this.updateFab();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    },


    updateFab() {

        const fab =
            document.getElementById("main-fab");

        if (!fab) return;

        fab.style.display =
            ["home", "accounts", "budget"]
                .includes(this.state.currentPage)
                ? "flex"
                : "none";

        if (
            this.state.currentPage === "budget"
        ) {

            fab.onclick =
                () => this.openAddBudget();

        } else {

            fab.onclick =
                () => this.openAddTransaction();

        }

    },


    /* =====================================================
       GREETING
    ===================================================== */

    updateGreeting() {

        const hour =
            new Date().getHours();

        let greeting = "Chào buổi tối 🌇";

        if (hour < 5)
            greeting = "Chào buổi đêm 🌙";

        else if (hour < 12)
            greeting = "Chào buổi sáng ☀️";

        else if (hour < 18)
            greeting = "Chào buổi chiều 🌤️";

        document.getElementById(
            "greeting"
        ).textContent = greeting;

        document.getElementById(
            "user-name"
        ).textContent =
            this.state.settings.name;

        document.getElementById(
            "profile-name"
        ).textContent =
            this.state.settings.name;

    },


    /* =====================================================
       FORMAT MONEY
    ===================================================== */

    money(value) {

        if (!this.state.balanceVisible)
            return "••••";

        value = Number(value) || 0;

        return new Intl.NumberFormat(
            "vi-VN"
        ).format(value) + "đ";

    },


    /* =====================================================
       TRANSACTION TOTALS
    ===================================================== */

    getTotals(transactions = this.state.transactions) {

        let income = 0;
        let expense = 0;

        transactions.forEach(t => {

            if (t.type === "income")
                income += Number(t.amount);

            if (t.type === "expense")
                expense += Number(t.amount);

        });

        return {

            income,

            expense,

            balance:
                income - expense

        };

    },


    getAccountBalance() {

        return this.state.accounts.reduce(
            (sum, account) =>
                sum + Number(account.balance || 0),
            0
        );

    },


    /* =====================================================
       RENDER ALL
    ===================================================== */

    renderAll() {

        this.renderCalendar();

        this.renderHome();

        this.renderStatistics();

        this.renderAccounts();

        this.renderLoans();

        this.renderInvestments();

        this.renderBudgets();

        this.renderProfile();

        this.updateGreeting();

        this.updateFab();

    },


    /* =====================================================
       HOME
    ===================================================== */

    renderHome() {

        const totals =
            this.getTotals();

        document.getElementById(
            "home-income"
        ).textContent =
            this.money(totals.income);

        document.getElementById(
            "home-expense"
        ).textContent =
            this.money(totals.expense);

    },


    setHomePeriod(period) {

        this.state.homePeriod = period;

        document
            .getElementById("period-day")
            .classList.toggle(
                "selected",
                period === "day"
            );

        document
            .getElementById("period-month")
            .classList.toggle(
                "selected",
                period === "month"
            );

    },


    toggleBalanceVisibility() {

        this.state.balanceVisible =
            !this.state.balanceVisible;

        this.renderAll();

    },


    /* =====================================================
       CALENDAR
    ===================================================== */

    renderCalendar() {

        const container =
            document.getElementById(
                "calendar"
            );

        if (!container) return;

        const date =
            this.state.currentMonth;

        const year =
            date.getFullYear();

        const month =
            date.getMonth();

        document.getElementById(
            "current-month"
        ).textContent =
            `tháng ${month + 1} ${year}`;

        const firstDay =
            new Date(
                year,
                month,
                1
            );

        let start =
            firstDay.getDay();

        start =
            start === 0
                ? 6
                : start - 1;

        const days =
            new Date(
                year,
                month + 1,
                0
            ).getDate();

        container.innerHTML = "";

        for (
            let i = 0;
            i < start;
            i++
        ) {

            const blank =
                document.createElement(
                    "div"
                );

            blank.className =
                "calendar-day empty";

            container.appendChild(blank);

        }


        for (
            let day = 1;
            day <= days;
            day++
        ) {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "calendar-day";

            const circle =
                document.createElement(
                    "div"
                );

            circle.className =
                "day-circle";

            const number =
                document.createElement(
                    "span"
                );

            number.className =
                "day-number";

            number.textContent =
                day;

            circle.appendChild(number);

            item.appendChild(circle);

            const tx =
                this.transactionsForDate(
                    year,
                    month,
                    day
                );

            if (tx.length) {

                item.classList.add(
                    "has-transaction"
                );

                const dot =
                    document.createElement(
                        "span"
                    );

                dot.className = "dot";

                item.appendChild(dot);

            }

            const today =
                new Date();

            if (
                today.getFullYear() === year &&
                today.getMonth() === month &&
                today.getDate() === day
            ) {

                item.classList.add(
                    "today"
                );

            }

            item.onclick =
                () => this.showDateTransactions(
                    year,
                    month,
                    day
                );

            container.appendChild(item);

        }

    },


    transactionsForDate(
        year,
        month,
        day
    ) {

        return this.state.transactions.filter(
            t => {

                const d =
                    new Date(t.date);

                return (
                    d.getFullYear() === year &&
                    d.getMonth() === month &&
                    d.getDate() === day
                );

            }
        );

    },


    changeMonth(delta) {

        this.state.currentMonth =
            new Date(
                this.state.currentMonth.getFullYear(),
                this.state.currentMonth.getMonth() + delta,
                1
            );

        this.renderCalendar();

    },


    /* =====================================================
       FILTER
    ===================================================== */

    setAccountFilter(filter) {

        this.state.accountFilter =
            filter;

        document
            .querySelectorAll(
                ".filter-tab"
            )
            .forEach(btn => {

                if (
                    btn.dataset.filter
                ) {

                    btn.classList.toggle(
                        "active",
                        btn.dataset.filter === filter
                    );

                }

            });

    },


    /* =====================================================
       ADD TRANSACTION
    ===================================================== */

    openAddTransaction() {

        this.openModal(
            "Thêm giao dịch",
            this.transactionForm()
        );

    },


    transactionForm() {

        return `

            <div class="type-selector">

                <button
                    id="income-type"
                    class="active income"
                    onclick="App.selectTransactionType('income')"
                >
                    ↓ Thu nhập
                </button>

                <button
                    id="expense-type"
                    class="expense"
                    onclick="App.selectTransactionType('expense')"
                >
                    ↑ Chi tiêu
                </button>

            </div>


            <input
                type="hidden"
                id="transaction-type"
                value="income"
            >


            <div class="form-group">

                <label>
                    Số tiền
                </label>

                <input
                    id="transaction-amount"
                    type="number"
                    inputmode="decimal"
                    placeholder="0"
                >

            </div>


            <div class="form-group">

                <label>
                    Danh mục
                </label>

                <select id="transaction-category">

                    <option value="Ăn uống">
                        🍜 Ăn uống
                    </option>

                    <option value="Mua sắm">
                        🛍 Mua sắm
                    </option>

                    <option value="Di chuyển">
                        🚗 Di chuyển
                    </option>

                    <option value="Hóa đơn">
                        🧾 Hóa đơn
                    </option>

                    <option value="Giải trí">
                        🎮 Giải trí
                    </option>

                    <option value="Lương">
                        💰 Lương
                    </option>

                    <option value="Khác">
                        📦 Khác
                    </option>

                </select>

            </div>


            <div class="form-group">

                <label>
                    Tài khoản
                </label>

                <select id="transaction-account">

                    ${this.state.accounts.map(
                        a => `
                        <option value="${a.id}">
                            ${a.name}
                        </option>
                        `
                    ).join("")}

                </select>

            </div>


            <div class="form-group">

                <label>
                    Ngày
                </label>

                <input
                    id="transaction-date"
                    type="date"
                    value="${this.todayInput()}"
                >

            </div>


            <div class="form-group">

                <label>
                    Ghi chú
                </label>

                <textarea
                    id="transaction-note"
                    rows="3"
                    placeholder="Ghi chú..."
                ></textarea>

            </div>


            <button
                class="submit-btn"
                onclick="App.saveTransaction()"
            >
                Lưu giao dịch
            </button>

        `;

    },


    selectTransactionType(type) {

        document.getElementById(
            "transaction-type"
        ).value = type;

        document
            .getElementById("income-type")
            .classList.toggle(
                "active",
                type === "income"
            );

        document
            .getElementById("expense-type")
            .classList.toggle(
                "active",
                type === "expense"
            );

    },


    saveTransaction() {

        const amount =
            Number(
                document.getElementById(
                    "transaction-amount"
                ).value
            );

        if (!amount || amount <= 0) {

            alert(
                "Vui lòng nhập số tiền hợp lệ."
            );

            return;

        }

        const type =
            document.getElementById(
                "transaction-type"
            ).value;

        const accountId =
            document.getElementById(
                "transaction-account"
            ).value;

        const transaction = {

            id: crypto.randomUUID(),

            amount,

            type,

            category:
                document.getElementById(
                    "transaction-category"
                ).value,

            accountId,

            date:
                document.getElementById(
                    "transaction-date"
                ).value,

            note:
                document.getElementById(
                    "transaction-note"
                ).value,

            createdAt:
                new Date().toISOString()

        };

        this.state.transactions.push(
            transaction
        );

        const account =
            this.state.accounts.find(
                a => a.id === accountId
            );

        if (account) {

            if (type === "income")
                account.balance += amount;

            else
                account.balance -= amount;

        }

        this.save();

        this.closeModal();

        this.renderAll();

        alert(
            "Đã lưu giao dịch."
        );

    },


    /* =====================================================
       DATE
    ===================================================== */

    todayInput() {

        const d = new Date();

        return [
            d.getFullYear(),
            String(d.getMonth() + 1)
                .padStart(2,"0"),
            String(d.getDate())
                .padStart(2,"0")
        ].join("-");

    },


    showDateTransactions(
        year,
        month,
        day
    ) {

        const tx =
            this.transactionsForDate(
                year,
                month,
                day
            );

        if (!tx.length) {

            this.openModal(
                `Ngày ${day}/${month + 1}/${year}`,
                `
                <div class="empty-card small">
                    <strong>
                        Chưa có giao dịch
                    </strong>
                </div>

                <button
                    class="submit-btn"
                    onclick="App.closeModal();App.openAddTransaction()"
                >
                    ＋ Thêm giao dịch
                </button>
                `
            );

            return;

        }

        this.openModal(
            `Giao dịch ${day}/${month + 1}`,
            tx.map(t => `

                <div class="account-item">

                    <div class="account-icon ${
                        t.type === "income"
                            ? ""
                            : "bank"
                    }">
                        ${t.type === "income" ? "↓" : "↑"}
                    </div>

                    <div class="account-info">

                        <strong>
                            ${this.escape(t.category)}
                        </strong>

                        <span>
                            ${t.type === "income" ? "+" : "-"}
                            ${this.money(t.amount)}
                        </span>

                        <small>
                            ${this.escape(t.note || "")}
                        </small>

                    </div>

                </div>

            `).join("")
        );

    },


    /* =====================================================
       STATISTICS
    ===================================================== */

    renderStatistics() {

        const totals =
            this.getTotals();

        document.getElementById(
            "statistics-income"
        ).textContent =
            this.money(totals.income);

        document.getElementById(
            "statistics-expense"
        ).textContent =
            this.money(totals.expense);

        document.getElementById(
            "statistics-balance"
        ).textContent =
            this.money(
                totals.income -
                totals.expense
            );

        document.getElementById(
            "statistics-month"
        ).textContent =
            this.monthLabel(
                this.state.statisticsMonth
            );

    },


    setStatisticsPeriod(period) {

        document
            .querySelectorAll(
                ".statistics-top-tabs button"
            )
            .forEach(btn =>
                btn.classList.remove(
                    "active-period"
                )
            );

        const index =
            period === "week"
                ? 0
                : period === "month"
                    ? 1
                    : 2;

        document
            .querySelectorAll(
                ".statistics-top-tabs button"
            )[index]
            .classList.add(
                "active-period"
            );

    },


    changeStatisticsMonth(delta) {

        this.state.statisticsMonth =
            new Date(
                this.state.statisticsMonth.getFullYear(),
                this.state.statisticsMonth.getMonth() + delta,
                1
            );

        this.renderStatistics();

    },


    /* =====================================================
       ACCOUNTS
    ===================================================== */

    renderAccounts() {

        const container =
            document.getElementById(
                "account-list"
            );

        if (!container) return;

        let accounts =
            [...this.state.accounts];

        if (
            this.state.accountFilter !== "all"
        ) {

            accounts =
                accounts.filter(
                    a =>
                        a.type ===
                        this.state.accountFilter
                );

        }

        container.innerHTML =
            accounts.map(
                account => `

                <div class="account-item">

                    <div
                        class="account-icon ${
                            account.type === "bank"
                                ? "bank"
                                : ""
                        }"
                    >
                        ${
                            account.type === "bank"
                                ? "🏛"
                                : "▣"
                        }
                    </div>

                    <div class="account-info">

                        <strong>
                            ${this.escape(account.name)}

                            ${
                                account.favorite
                                    ? " ⭐"
                                    : ""
                            }

                        </strong>

                        <span>
                            ${this.money(account.balance)}
                        </span>

                    </div>

                    <button
                        onclick="App.openAccount('${account.id}')"
                    >
                        ›
                    </button>

                </div>

                `
            ).join("");

        const totals =
            this.getTotals();

        document.getElementById(
            "accounts-balance"
        ).textContent =
            this.money(
                this.getAccountBalance()
            );

        document.getElementById(
            "accounts-income"
        ).textContent =
            this.money(totals.income);

        document.getElementById(
            "accounts-expense"
        ).textContent =
            this.money(totals.expense);

    },


    setAccountPage(page) {

        document
            .querySelectorAll(
                ".account-tabs button"
            )
            .forEach(
                btn =>
                    btn.classList.remove(
                        "active"
                    )
            );

        const buttons =
            document.querySelectorAll(
                ".account-tabs button"
            );

        const index =
            page === "accounts"
                ? 0
                : page === "loans"
                    ? 1
                    : 2;

        buttons[index]
            .classList.add("active");

        document
            .getElementById(
                "accounts-view"
            )
            .classList.toggle(
                "hidden",
                page !== "accounts"
            );

        document
            .getElementById(
                "loans-view"
            )
            .classList.toggle(
                "hidden",
                page !== "loans"
            );

        document
            .getElementById(
                "investments-view"
            )
            .classList.toggle(
                "hidden",
                page !== "investments"
            );

        this.state.accountPage =
            page;

    },


    changeAccountMonth(delta) {

        this.state.accountMonth =
            new Date(
                this.state.accountMonth.getFullYear(),
                this.state.accountMonth.getMonth() + delta,
                1
            );

        this.renderAccounts();

    },


    sortAccounts() {

        this.state.accounts.sort(
            (a,b) =>
                Number(b.balance) -
                Number(a.balance)
        );

        this.save();

        this.renderAccounts();

    },


    openAccount(id) {

        const account =
            this.state.accounts.find(
                a => a.id === id
            );

        if (!account) return;

        this.openModal(
            account.name,
            `

            <div class="account-total">

                <span>
                    Số dư
                </span>

                <strong>
                    ${this.money(account.balance)}
                </strong>

            </div>


            <button
                class="submit-btn"
                onclick="App.editAccount('${id}')"
            >
                Chỉnh sửa tài khoản
            </button>


            <button
                class="submit-btn"
                style="background:#333;color:#ee777b"
                onclick="App.deleteAccount('${id}')"
            >
                Xóa tài khoản
            </button>

            `
        );

    },


    openAddAccount() {

        this.openModal(
            "Thêm tài khoản",
            `

            <div class="form-group">

                <label>
                    Tên tài khoản
                </label>

                <input
                    id="account-name"
                    placeholder="Ví dụ: Ví tiền"
                >

            </div>


            <div class="form-group">

                <label>
                    Loại tài khoản
                </label>

                <select id="account-type">

                    <option value="wallet">
                        Wallet
                    </option>

                    <option value="bank">
                        Bank
                    </option>

                    <option value="cash">
                        Tiền mặt
                    </option>

                    <option value="credit">
                        Thẻ tín dụng
                    </option>

                    <option value="ewallet">
                        Ví điện tử
                    </option>

                </select>

            </div>


            <div class="form-group">

                <label>
                    Số dư ban đầu
                </label>

                <input
                    id="account-balance"
                    type="number"
                    value="0"
                >

            </div>


            <button
                class="submit-btn"
                onclick="App.saveAccount()"
            >
                Thêm tài khoản
            </button>

            `
        );

    },


    saveAccount() {

        const name =
            document.getElementById(
                "account-name"
            ).value.trim();

        if (!name) {

            alert(
                "Vui lòng nhập tên tài khoản."
            );

            return;

        }

        const account = {

            id: crypto.randomUUID(),

            name,

            type:
                document.getElementById(
                    "account-type"
                ).value,

            balance:
                Number(
                    document.getElementById(
                        "account-balance"
                    ).value
                ) || 0,

            currency: "VND",

            favorite: false

        };

        this.state.accounts.push(
            account
        );

        this.save();

        this.closeModal();

        this.renderAll();

    },


    editAccount(id) {

        const account =
            this.state.accounts.find(
                a => a.id === id
            );

        if (!account) return;

        this.openModal(
            "Chỉnh sửa tài khoản",
            `

            <div class="form-group">

                <label>
                    Tên
                </label>

                <input
                    id="edit-account-name"
                    value="${this.escape(account.name)}"
                >

            </div>


            <button
                class="submit-btn"
                onclick="App.updateAccount('${id}')"
            >
                Lưu
            </button>

            `
        );

    },


    updateAccount(id) {

        const account =
            this.state.accounts.find(
                a => a.id === id
            );

        if (!account) return;

        account.name =
            document
                .getElementById(
                    "edit-account-name"
                )
                .value.trim();

        this.save();

        this.closeModal();

        this.renderAll();

    },


    deleteAccount(id) {

        if (
            !confirm(
                "Bạn có chắc muốn xóa tài khoản này?"
            )
        )
            return;

        this.state.accounts =
            this.state.accounts.filter(
                a => a.id !== id
            );

        this.save();

        this.closeModal();

        this.renderAll();

    },


    /* =====================================================
       TRANSFER
    ===================================================== */

    openTransfer() {

        if (this.state.accounts.length < 2) {

            alert(
                "Cần ít nhất 2 tài khoản."
            );

            return;

        }

        this.openModal(
            "Chuyển tiền",
            `

            <div class="form-group">

                <label>
                    Từ tài khoản
                </label>

                <select id="transfer-from">

                    ${this.state.accounts.map(
                        a => `
                        <option value="${a.id}">
                            ${this.escape(a.name)}
                        </option>
                        `
                    ).join("")}

                </select>

            </div>


            <div class="form-group">

                <label>
                    Đến tài khoản
                </label>

                <select id="transfer-to">

                    ${this.state.accounts.map(
                        a => `
                        <option value="${a.id}">
                            ${this.escape(a.name)}
                        </option>
                        `
                    ).join("")}

                </select>

            </div>


            <div class="form-group">

                <label>
                    Số tiền
                </label>

                <input
                    id="transfer-amount"
                    type="number"
                >

            </div>


            <button
                class="submit-btn"
                onclick="App.saveTransfer()"
            >
                Chuyển tiền
            </button>

            `
        );

    },


    saveTransfer() {

        const from =
            document.getElementById(
                "transfer-from"
            ).value;

        const to =
            document.getElementById(
                "transfer-to"
            ).value;

        const amount =
            Number(
                document.getElementById(
                    "transfer-amount"
                ).value
            );

        if (from === to) {

            alert(
                "Tài khoản nguồn và đích phải khác nhau."
            );

            return;

        }

        if (!amount || amount <= 0) {

            alert(
                "Số tiền không hợp lệ."
            );

            return;

        }

        const source =
            this.state.accounts.find(
                a => a.id === from
            );

        const target =
            this.state.accounts.find(
                a => a.id === to
            );

        if (!source || !target) return;

        source.balance -= amount;

        target.balance += amount;

        this.state.transfers.push({

            id: crypto.randomUUID(),

            from,

            to,

            amount,

            date:
                new Date().toISOString()

        });

        this.save();

        this.closeModal();

        this.renderAll();

    },


    showTransferHistory() {

        const list =
            this.state.transfers;

        this.openModal(
            "Lịch sử chuyển tiền",
            list.length
                ? list.map(t => {

                    const from =
                        this.state.accounts.find(
                            a => a.id === t.from
                        );

                    const to =
                        this.state.accounts.find(
                            a => a.id === t.to
                        );

                    return `

                    <div class="account-item">

                        <div class="account-info">

                            <strong>
                                ${this.escape(from?.name || "")}
                                →
                                ${this.escape(to?.name || "")}
                            </strong>

                            <span>
                                ${this.money(t.amount)}
                            </span>

                        </div>

                    </div>

                    `;

                }).join("")
                :
                `
                <div class="empty-card small">
                    Chưa có lịch sử chuyển tiền.
                </div>
                `
        );

    },


    /* =====================================================
       SAVINGS
    ===================================================== */

    openAddSavings() {

        this.openModal(
            "Thêm sổ tiết kiệm",
            `

            <div class="form-group">

                <label>
                    Tên sổ
                </label>

                <input
                    id="saving-name"
                    placeholder="Sổ tiết kiệm"
                >

            </div>


            <div class="form-row">

                <div class="form-group">

                    <label>
                        Số tiền
                    </label>

                    <input
                        id="saving-amount"
                        type="number"
                    >

                </div>

                <div class="form-group">

                    <label>
                        Lãi suất %
                    </label>

                    <input
                        id="saving-rate"
                        type="number"
                        step="0.01"
                    >

                </div>

            </div>


            <div class="form-group">

                <label>
                    Ngày đáo hạn
                </label>

                <input
                    id="saving-date"
                    type="date"
                >

            </div>


            <button
                class="submit-btn"
                onclick="App.saveSavings()"
            >
                Thêm sổ
            </button>

            `
        );

    },


    saveSavings() {

        this.state.savings.push({

            id: crypto.randomUUID(),

            name:
                document.getElementById(
                    "saving-name"
                ).value,

            amount:
                Number(
                    document.getElementById(
                        "saving-amount"
                    ).value
                ) || 0,

            rate:
                Number(
                    document.getElementById(
                        "saving-rate"
                    ).value
                ) || 0,

            maturity:
                document.getElementById(
                    "saving-date"
                ).value

        });

        this.save();

        this.closeModal();

        this.renderAll();

    },


    /* =====================================================
       LOANS
    ===================================================== */

    renderLoans() {

        const container =
            document.getElementById(
                "loan-list"
            );

        if (!container) return;

        if (!this.state.loans.length) {

            container.className =
                "empty-card";

            container.innerHTML = `

                <div class="empty-icon">
                    💵
                </div>

                <strong>
                    Chưa có khoản vay
                </strong>

                <span>
                    Nhấn + để thêm khoản vay hoặc trả góp
                </span>

            `;

            return;

        }

        container.className =
            "account-list";

        container.innerHTML =
            this.state.loans.map(
                loan => `

                <div class="account-item">

                    <div class="account-icon bank">
                        💵
                    </div>

                    <div class="account-info">

                        <strong>
                            ${this.escape(loan.name)}
                        </strong>

                        <span>
                            Còn ${this.money(loan.remaining)}
                        </span>

                    </div>

                    <button
                        onclick="App.deleteLoan('${loan.id}')"
                    >
                        ×
                    </button>

                </div>

                `
            ).join("");

    },


    openAddLoan() {

        this.openModal(
            "Thêm khoản vay",
            `

            <div class="form-group">

                <label>
                    Tên khoản vay
                </label>

                <input
                    id="loan-name"
                    placeholder="Ví dụ: Trả góp điện thoại"
                >

            </div>


            <div class="form-row">

                <div class="form-group">

                    <label>
                        Tổng khoản vay
                    </label>

                    <input
                        id="loan-total"
                        type="number"
                    >

                </div>

                <div class="form-group">

                    <label>
                        Lãi suất %
                    </label>

                    <input
                        id="loan-rate"
                        type="number"
                        step="0.01"
                    >

                </div>

            </div>


            <div class="form-group">

                <label>
                    Ngày đến hạn
                </label>

                <input
                    id="loan-due"
                    type="date"
                >

            </div>


            <button
                class="submit-btn"
                onclick="App.saveLoan()"
            >
                Thêm khoản vay
            </button>

            `
        );

    },


    saveLoan() {

        const total =
            Number(
                document.getElementById(
                    "loan-total"
                ).value
            ) || 0;

        this.state.loans.push({

            id: crypto.randomUUID(),

            name:
                document.getElementById(
                    "loan-name"
                ).value,

            total,

            remaining: total,

            rate:
                Number(
                    document.getElementById(
                        "loan-rate"
                    ).value
                ) || 0,

            due:
                document.getElementById(
                    "loan-due"
                ).value

        });

        this.save();

        this.closeModal();

        this.renderLoans();

    },


    deleteLoan(id) {

        this.state.loans =
            this.state.loans.filter(
                l => l.id !== id
            );

        this.save();

        this.renderLoans();

    },


    /* =====================================================
       INVESTMENTS
    ===================================================== */

    renderInvestments() {

        const container =
            document.getElementById(
                "investment-list"
            );

        if (!container) return;

        if (!this.state.investments.length) {

            container.className =
                "empty-card";

            container.innerHTML = `

                <div class="empty-icon">
                    📈
                </div>

                <strong>
                    Chưa có khoản đầu tư
                </strong>

                <span>
                    Nhấn + để thêm vàng, bạc, crypto hoặc các khoản đầu tư khác
                </span>

            `;

            return;

        }

        container.className =
            "account-list";

        container.innerHTML =
            this.state.investments.map(
                inv => `

                <div class="account-item">

                    <div class="account-icon bank">
                        📈
                    </div>

                    <div class="account-info">

                        <strong>
                            ${this.escape(inv.name)}
                        </strong>

                        <span>
                            ${this.money(inv.value)}
                        </span>

                    </div>

                </div>

                `
            ).join("");

    },


    openAddInvestment() {

        this.openModal(
            "Thêm khoản đầu tư",
            `

            <div class="form-group">

                <label>
                    Tên khoản đầu tư
                </label>

                <input
                    id="investment-name"
                    placeholder="BTC, Vàng, Cổ phiếu..."
                >

            </div>


            <div class="form-group">

                <label>
                    Giá trị hiện tại
                </label>

                <input
                    id="investment-value"
                    type="number"
                >

            </div>


            <button
                class="submit-btn"
                onclick="App.saveInvestment()"
            >
                Thêm đầu tư
            </button>

            `
        );

    },


    saveInvestment() {

        this.state.investments.push({

            id: crypto.randomUUID(),

            name:
                document.getElementById(
                    "investment-name"
                ).value,

            value:
                Number(
                    document.getElementById(
                        "investment-value"
                    ).value
                ) || 0

        });

        this.save();

        this.closeModal();

        this.renderInvestments();

    },


    refreshMarket() {

        alert(
            "Đã cập nhật dữ liệu thị trường mẫu."
        );

    },


    /* =====================================================
       BUDGET
    ===================================================== */

    renderBudgets() {

        const container =
            document.getElementById(
                "budget-list"
            );

        if (!container) return;

        if (!this.state.budgets.length) {

            container.className =
                "empty-card budget-empty";

            container.innerHTML = `

                <div class="empty-icon">
                    ▣123
                </div>

                <strong>
                    Chưa có ngân sách
                </strong>

                <span>
                    Tạo ngân sách để theo dõi chi tiêu
                </span>

            `;

            return;

        }

        container.className =
            "account-list";

        container.innerHTML =
            this.state.budgets.map(
                budget => {

                    const percent =
                        budget.limit > 0
                            ? Math.min(
                                100,
                                budget.spent /
                                budget.limit *
                                100
                            )
                            : 0;

                    return `

                    <div class="account-item">

                        <div class="account-icon">
                            $
                        </div>

                        <div class="account-info">

                            <strong>
                                ${this.escape(budget.name)}
                            </strong>

                            <span>
                                ${this.money(budget.spent)}
                                /
                                ${this.money(budget.limit)}
                            </span>

                            <div
                                style="
                                    margin-top:10px;
                                    height:8px;
                                    background:#333;
                                    border-radius:10px;
                                    overflow:hidden;
                                "
                            >
                                <div
                                    style="
                                        width:${percent}%;
                                        height:100%;
                                        background:#72abe8;
                                    "
                                ></div>
                            </div>

                        </div>

                    </div>

                    `;

                }
            ).join("");

    },


    openAddBudget() {

        this.openModal(
            "Tạo ngân sách",
            `

            <div class="form-group">

                <label>
                    Tên ngân sách
                </label>

                <input
                    id="budget-name"
                    placeholder="Ăn uống"
                >

            </div>


            <div class="form-group">

                <label>
                    Hạn mức
                </label>

                <input
                    id="budget-limit"
                    type="number"
                >

            </div>


            <button
                class="submit-btn"
                onclick="App.saveBudget()"
            >
                Tạo ngân sách
            </button>

            `
        );

    },


    saveBudget() {

        this.state.budgets.push({

            id: crypto.randomUUID(),

            name:
                document.getElementById(
                    "budget-name"
                ).value,

            limit:
                Number(
                    document.getElementById(
                        "budget-limit"
                    ).value
                ) || 0,

            spent: 0

        });

        this.save();

        this.closeModal();

        this.renderBudgets();

    },


    addBudgetMember() {

        alert(
            "Tính năng chia sẻ ngân sách đã được mở."
        );

    },


    /* =====================================================
       PRO
    ===================================================== */

    openPro() {

        this.openModal(
            "Mở khóa toàn bộ CapMoney",
            `

            <div class="empty-card small">

                <div class="empty-icon">
                    ♛
                </div>

                <div>

                    <strong>
                        CapMoney Pro
                    </strong>

                    <span>
                        Mở khóa toàn bộ tính năng cao cấp.
                    </span>

                </div>

            </div>


            ${this.proFeature(
                "∞",
                "Giao dịch không giới hạn",
                "Thêm bao nhiêu giao dịch tùy thích"
            )}

            ${this.proFeature(
                "▣",
                "Mọi loại tài khoản",
                "Thẻ tín dụng, tiết kiệm, ví điện tử, khoản vay..."
            )}

            ${this.proFeature(
                "👥",
                "Chia sẻ với người thân",
                "Dùng chung tài khoản ngân hàng, ngân sách"
            )}

            ${this.proFeature(
                "ϟ",
                "Lưu chuyển khoản siêu tốc",
                "Tự động lưu giao dịch"
            )}

            ${this.proFeature(
                "▣",
                "Video 3 giây",
                "Quay khoảnh khắc cùng giao dịch"
            )}

            ${this.proFeature(
                "▥",
                "Thống kê nâng cao",
                "Biểu đồ và phân tích chi tiết"
            )}

            ${this.proFeature(
                "🗂",
                "Danh mục tùy chỉnh",
                "Tạo danh mục riêng"
            )}

            ${this.proFeature(
                "▦",
                "Widget màn hình chính",
                "Xem chi tiêu ngay trên màn hình"
            )}

            ${this.proFeature(
                "↥",
                "Xuất dữ liệu",
                "Xuất báo cáo PDF, Excel"
            )}

            <button
                class="submit-btn"
                onclick="App.activatePro()"
            >
                Nâng cấp Pro
            </button>

            `
        );

    },


    proFeature(
        icon,
        title,
        description
    ) {

        return `

        <div
            style="
                display:flex;
                gap:15px;
                padding:14px 0;
                border-bottom:1px solid rgba(255,255,255,.06);
            "
        >

            <div
                style="
                    width:48px;
                    height:48px;
                    border-radius:14px;
                    background:#293241;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-size:23px;
                "
            >
                ${icon}
            </div>

            <div style="flex:1">

                <strong>
                    ${title}
                </strong>

                <div
                    style="
                        color:#aaa;
                        margin-top:4px;
                    "
                >
                    ${description}
                </div>

            </div>

            <span
                style="
                    color:#86d78b;
                    font-size:28px;
                "
            >
                ✓
            </span>

        </div>

        `;

    },


    activatePro() {

        alert(
            "Đây là bản PWA demo. Module Pro đã được tích hợp giao diện và sẵn sàng để kết nối hệ thống thanh toán."
        );

    },


    /* =====================================================
       PROFILE / SETTINGS
    ===================================================== */

    renderProfile() {

        const totals =
            this.getTotals();

        document.getElementById(
            "profile-transactions"
        ).textContent =
            this.state.transactions.length;

        document.getElementById(
            "profile-income"
        ).textContent =
            this.money(totals.income);

        document.getElementById(
            "profile-expense"
        ).textContent =
            this.money(totals.expense);

        document.getElementById(
            "profile-balance"
        ).textContent =
            this.money(
                totals.income -
                totals.expense
            );

    },


    changeAvatar() {

        alert(
            "Có thể kết nối trình chọn ảnh tại đây."
        );

    },


    appleLogin() {

        alert(
            "Đăng nhập Apple cần backend/OAuth thực tế."
        );

    },


    changeLanguage() {

        alert(
            "Ngôn ngữ hiện tại: Tiếng Việt"
        );

    },


    changeTheme() {

        alert(
            "Giao diện hiện tại: Tối"
        );

    },


    changeCurrency() {

        alert(
            "Tiền tệ hiện tại: VND"
        );

    },


    rateApp() {

        alert(
            "Cảm ơn bạn đã đánh giá CapMoney."
        );

    },


    feedback() {

        alert(
            "Bạn có thể gửi góp ý tại đây."
        );

    },


    async shareApp() {

        if (
            navigator.share
        ) {

            try {

                await navigator.share({

                    title: "CapMoney",

                    text:
                        "Ứng dụng quản lý tài chính cá nhân CapMoney.",

                    url:
                        location.href

                });

            } catch {}

        } else {

            alert(
                "Trình duyệt không hỗ trợ chia sẻ."
            );

        }

    },


    showFriends() {

        this.simpleFeature(
            "Bạn bè",
            "Quản lý danh sách bạn bè và chia sẻ giao dịch."
        );

    },


    showGroups() {

        this.simpleFeature(
            "Nhóm",
            "Tạo nhóm chi tiêu và theo dõi số tiền từng thành viên."
        );

    },


    showSharedTransactions() {

        this.simpleFeature(
            "Giao dịch được chia sẻ",
            "Các giao dịch được chia sẻ với người khác."
        );

    },


    showSplitMoney() {

        this.simpleFeature(
            "Chia tiền",
            "Chia hóa đơn cho nhiều người."
        );

    },


    showRecurring() {

        this.simpleFeature(
            "Giao dịch định kỳ",
            "Tự động tạo giao dịch theo ngày, tuần hoặc tháng."
        );

    },


    openSettings() {

        this.openModal(
            "Cài đặt",
            `

            <div class="settings-list">

                <button>
                    🔐
                    <span>Bảo mật</span>
                    <b>›</b>
                </button>

                <button>
                    🔔
                    <span>Thông báo</span>
                    <b>›</b>
                </button>

                <button onclick="App.exportData()">
                    📤
                    <span>Xuất dữ liệu</span>
                    <b>›</b>
                </button>

                <button onclick="App.importData()">
                    📥
                    <span>Nhập dữ liệu</span>
                    <b>›</b>
                </button>

                <button onclick="App.clearData()">
                    🗑
                    <span>Xóa toàn bộ dữ liệu</span>
                    <b>›</b>
                </button>

            </div>

            `
        );

    },


    openCategories() {

        this.openModal(
            "Danh mục",
            `

            <div class="form-group">

                <input
                    id="new-category"
                    placeholder="Tên danh mục mới"
                >

            </div>

            <button
                class="submit-btn"
                onclick="App.addCategory()"
            >
                ＋ Thêm danh mục
            </button>

            `
        );

    },


    addCategory() {

        const input =
            document.getElementById(
                "new-category"
            );

        if (!input.value.trim())
            return;

        this.state.categories.push(
            input.value.trim()
        );

        this.save();

        input.value = "";

        alert(
            "Đã thêm danh mục."
        );

    },


    simpleFeature(
        title,
        text
    ) {

        this.openModal(
            title,
            `

            <div class="empty-card small">

                <div class="empty-icon">
                    ✓
                </div>

                <span>
                    ${text}
                </span>

            </div>

            `
        );

    },


    /* =====================================================
       EXPORT / IMPORT
    ===================================================== */

    exportData() {

        const data =
            JSON.stringify(
                this.state,
                null,
                2
            );

        const blob =
            new Blob(
                [data],
                {
                    type:
                        "application/json"
                }
            );

        const url =
            URL.createObjectURL(blob);

        const a =
            document.createElement(
                "a"
            );

        a.href = url;

        a.download =
            "capmoney-backup.json";

        a.click();

        URL.revokeObjectURL(url);

    },


    importData() {

        const input =
            document.createElement(
                "input"
            );

        input.type = "file";

        input.accept =
            ".json,application/json";

        input.onchange =
            async event => {

                const file =
                    event.target.files[0];

                if (!file) return;

                try {

                    const text =
                        await file.text();

                    const data =
                        JSON.parse(text);

                    this.state = {
                        ...this.state,
                        ...data
                    };

                    this.save();

                    this.renderAll();

                    alert(
                        "Đã nhập dữ liệu."
                    );

                } catch {

                    alert(
                        "File dữ liệu không hợp lệ."
                    );

                }

            };

        input.click();

    },


    clearData() {

        if (
            !confirm(
                "Xóa toàn bộ dữ liệu CapMoney?"
            )
        )
            return;

        localStorage.removeItem(
            "capmoney-data"
        );

        location.reload();

    },


    /* =====================================================
       SEARCH
    ===================================================== */

    searchTransactions() {

        this.openModal(
            "Tìm kiếm giao dịch",
            `

            <div class="form-group">

                <input
                    id="search-query"
                    placeholder="Tìm theo danh mục, ghi chú..."
                >

            </div>

            <button
                class="submit-btn"
                onclick="App.performSearch()"
            >
                Tìm kiếm
            </button>

            <div
                id="search-results"
                style="margin-top:20px"
            ></div>

            `
        );

    },


    performSearch() {

        const query =
            document
                .getElementById(
                    "search-query"
                )
                .value
                .toLowerCase();

        const results =
            this.state.transactions.filter(
                t =>
                    `${t.category} ${t.note || ""}`
                        .toLowerCase()
                        .includes(query)
            );

        document.getElementById(
            "search-results"
        ).innerHTML =
            results.length
                ? results.map(
                    t => `

                    <div class="account-item">

                        <div class="account-info">

                            <strong>
                                ${this.escape(t.category)}
                            </strong>

                            <span>
                                ${this.money(t.amount)}
                            </span>

                        </div>

                    </div>

                    `
                ).join("")
                :
                `
                <p style="color:#aaa">
                    Không tìm thấy giao dịch.
                </p>
                `;

    },


    /* =====================================================
       MODAL
    ===================================================== */

    openModal(
        title,
        content
    ) {

        document.getElementById(
            "modal-title"
        ).textContent = title;

        document.getElementById(
            "modal-content"
        ).innerHTML = content;

        document.getElementById(
            "modal"
        ).classList.add("open");

    },


    closeModal(event) {

        if (
            event &&
            event.target !== event.currentTarget
        )
            return;

        document.getElementById(
            "modal"
        ).classList.remove("open");

    },


    /* =====================================================
       UTILS
    ===================================================== */

    monthLabel(date) {

        return `tháng ${
            date.getMonth() + 1
        } ${
            date.getFullYear()
        }`;

    },


    escape(value) {

        return String(value ?? "")
            .replaceAll("&","&amp;")
            .replaceAll("<","&lt;")
            .replaceAll(">","&gt;")
            .replaceAll('"',"&quot;")
            .replaceAll("'","&#039;");

    }

};


/* =========================================================
   START APP
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => App.init()
);


/* =========================================================
   GLOBAL ACCESS
========================================================= */

window.App = App;