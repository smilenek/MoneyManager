const $ = s => document.querySelector(s);

const $$ = s => document.querySelectorAll(s);


const KEY = "moneytrack-v1";


const seed = {

  user: "Bạn",

  budget: 10000000,

  accounts: [

    {
      id: "wallet",
      name: "Ví tiền",
      balance: 200000
    },

    {
      id: "bank",
      name: "Ngân hàng",
      balance: 10768000
    }

  ],

  transactions: [

    {
      id: 1,
      type: "income",
      amount: 9000000,
      category: "Khác",
      account: "bank",
      date: "2026-09-01",
      note: "Thu nhập",
      image: null
    },

    {
      id: 2,
      type: "expense",
      amount: 1807000,
      category: "Khác",
      account: "bank",
      date: "2026-09-02",
      note: "Chi khác",
      image: null
    },

    {
      id: 3,
      type: "expense",
      amount: 1442000,
      category: "Ăn uống",
      account: "wallet",
      date: "2026-09-04",
      note: "Ăn uống",
      image: null
    },

    {
      id: 4,
      type: "expense",
      amount: 200000,
      category: "Sức khỏe",
      account: "wallet",
      date: "2026-09-04",
      note: "Sức khỏe",
      image: null
    }

  ]

};


let state =
  JSON.parse(localStorage.getItem(KEY) || "null")
  || seed;


let activeTab = "home";

let txType = "expense";


/* =========================
   HELPERS
========================= */

const fmt = n =>
  new Intl.NumberFormat(
    "vi-VN",
    {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0
    }
  ).format(n);


const todayISO = () =>
  new Date()
    .toISOString()
    .slice(0, 10);


const save = () =>
  localStorage.setItem(
    KEY,
    JSON.stringify(state)
  );


const totalBalance = () =>
  state.accounts.reduce(
    (s, a) => s + a.balance,
    0
  );


const incomeTotal = () =>
  state.transactions
    .filter(t => t.type === "income")
    .reduce(
      (s, t) => s + t.amount,
      0
    );


const expenseTotal = () =>
  state.transactions
    .filter(t => t.type === "expense")
    .reduce(
      (s, t) => s + t.amount,
      0
    );


const accountName = id =>
  state.accounts.find(
    a => a.id === id
  )?.name || "—";


const escapeHtml = s =>
  String(s ?? "").replace(
    /[&<>"']/g,
    c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[c])
  );


const typeSign = t =>
  t.type === "income"
    ? "+"
    : "-";


/* =========================
   MAIN RENDER
========================= */

function render() {

  $("#todayLabel").textContent =
    new Intl.DateTimeFormat(
      "vi-VN",
      {
        weekday: "long",
        day: "numeric",
        month: "long"
      }
    ).format(new Date());


  $("#userName").textContent =
    state.user || "Bạn";


  $$(".tab").forEach(
    b =>
      b.classList.toggle(
        "active",
        b.dataset.tab === activeTab
      )
  );


  const screens = {

    home: renderHome,

    stats: renderStats,

    accounts: renderAccounts,

    budget: renderBudget,

    profile: renderProfile

  };


  screens[activeTab]();


  fillAccounts();

}


/* =========================
   HOME
========================= */

function renderHome() {

  const inc = incomeTotal();

  const exp = expenseTotal();


  const days = {};


  state.transactions.forEach(
    t => {

      if (!days[t.date]) {
        days[t.date] = [];
      }

      days[t.date].push(t);

    }
  );


  const dates =
    Object.keys(days)
      .sort()
      .reverse();


  $("#screen").innerHTML = `

    <div class="balance-grid">

      <div class="balance-card">

        <div class="label">
          ↗ Chi tiêu
        </div>

        <div class="value expense">
          ${fmt(exp)}
        </div>

      </div>


      <div class="balance-card">

        <div class="label">
          ↙ Thu nhập
        </div>

        <div class="value income">
          ${fmt(inc)}
        </div>

      </div>

    </div>


    <div class="toolbar">

      <button class="pill active">
        Tất cả
      </button>

      <button class="pill">
        Ví tiền
      </button>

      <button class="pill">
        Ngân hàng
      </button>

    </div>


    <div class="card">

      <div class="section-head">

        <h2>
          Số dư hiện tại
        </h2>

        <span class="income">
          ${fmt(totalBalance())}
        </span>

      </div>


      <div class="stat-grid">

        <div class="stat">

          <span>
            Giao dịch
          </span>

          <b>
            ${state.transactions.length}
          </b>

        </div>


        <div class="stat">

          <span>
            Ngân sách tháng
          </span>

          <b>
            ${fmt(
              Math.max(
                0,
                state.budget - exp
              )
            )}
          </b>

        </div>

      </div>

    </div>


    <div class="section-head">

      <h2>
        Giao dịch gần đây
      </h2>

      <button
        class="link"
        onclick="
          activeTab='stats';
          render();
        ">

        Xem tất cả

      </button>

    </div>


    ${
      dates.length

      ? dates
          .map(
            d => dayHtml(
              d,
              days[d]
            )
          )
          .join("")

      : `
        <div class="card empty">
          Chưa có giao dịch.<br>
          Nhấn ＋ để thêm khoản thu hoặc chi.
        </div>
      `
    }

  `;

}


/* =========================
   DAY
========================= */

function dayHtml(d, items) {

  const exp =
    items
      .filter(
        x => x.type === "expense"
      )
      .reduce(
        (s, x) => s + x.amount,
        0
      );


  return `

    <div class="day-card">

      <div class="day-row">

        <div class="day-date">

          ${
            new Intl.DateTimeFormat(
              "vi-VN",
              {
                weekday: "short",
                day: "numeric",
                month: "numeric"
              }
            ).format(
              new Date(
                d + "T12:00:00"
              )
            )
          }

        </div>


        <div class="day-total">

          ${
            exp
              ? fmt(exp)
              : ""
          }

        </div>

      </div>


      <div class="transactions">

        ${items.map(txHtml).join("")}

      </div>

    </div>

  `;

}


/* =========================
   TRANSACTION HTML
========================= */

function txHtml(t) {

  const icon = {

    "Ăn uống": "🍜",

    "Di chuyển": "🛵",

    "Mua sắm": "🛍️",

    "Sức khỏe": "💊",

    "Hóa đơn": "🧾",

    "Giải trí": "🎮",

    "Khác": "💳"

  }[t.category] || "💳";


  return `

    <div class="tx">

      ${
        t.image

        ? `
          <img
            class="thumb"
            src="${t.image}"
            alt="">
        `

        : `
          <div class="thumb">
            ${icon}
          </div>
        `
      }


      <div>

        <div class="tx-title">
          ${escapeHtml(
            t.note || t.category
          )}
        </div>

        <div class="tx-sub">

          ${escapeHtml(t.category)}

          ·

          ${escapeHtml(
            accountName(t.account)
          )}

        </div>

      </div>


      <div
        class="tx-amount ${
          t.type === "income"
            ? "income"
            : "expense"
        }">

        ${typeSign(t)}
        ${fmt(t.amount)}

      </div>

    </div>

  `;

}


/* =========================
   STATS
========================= */

function renderStats() {

  const exp = expenseTotal();


  const byCat = {};


  state.transactions

    .filter(
      t => t.type === "expense"
    )

    .forEach(
      t =>
        byCat[t.category] =
          (byCat[t.category] || 0)
          + t.amount
    );


  const bars =
    [
      "T2",
      "T3",
      "T4",
      "T5",
      "T6",
      "T7",
      "CN"
    ]

    .map(
      (d, i) => {

        const val =
          Math.round(
            exp *
            (.12 + i * .02)
          );


        return `

          <div class="bar-wrap">

            <div
              class="bar"
              style="
                height:
                ${Math.max(
                  8,
                  val /
                  Math.max(exp, 1) *
                  100
                )}%;
              ">
            </div>

            <div class="bar-label">
              ${d}
            </div>

          </div>

        `;

      }
    )

    .join("");


  const cats =
    Object.entries(byCat)
      .sort(
        (a, b) => b[1] - a[1]
      );


  $("#screen").innerHTML = `

    <div class="section-head">

      <h2>
        Thống kê
      </h2>

      <span class="pill active">
        Tháng này
      </span>

    </div>


    <div class="stat-grid">

      <div class="stat">

        <span>
          Tổng chi
        </span>

        <b class="expense">
          ${fmt(exp)}
        </b>

      </div>


      <div class="stat">

        <span>
          Tổng thu
        </span>

        <b class="income">
          ${fmt(incomeTotal())}
        </b>

      </div>

    </div>


    <div class="card">

      <div class="section-head">

        <h2>
          Chi tiêu theo ngày
        </h2>

      </div>


      <div class="chart">

        ${bars}

      </div>

    </div>


    <div class="card">

      <div class="section-head">

        <h2>
          Chi tiêu theo danh mục
        </h2>

      </div>


      ${
        cats.length

        ? cats
            .map(
              ([c, v]) => `

                <div
                  class="section-head"
                  style="
                    margin:
                    14px 0;
                  ">

                  <span>
                    ${escapeHtml(c)}
                  </span>

                  <b>
                    ${fmt(v)}
                  </b>

                </div>

              `
            )
            .join("")

        : `
          <div class="empty">
            Chưa có dữ liệu.
          </div>
        `
      }

    </div>

  `;

}


/* =========================
   ACCOUNTS
========================= */

function renderAccounts() {

  $("#screen").innerHTML = `

    <div class="section-head">

      <h2>
        Tài khoản
      </h2>

      <button
        class="link"
        id="addAccount">

        ＋ Thêm

      </button>

    </div>


    <div class="card">

      <div
        style="
          color:#aaa;
          font-size:12px;
        ">

        Tổng số dư

      </div>


      <div
        style="
          font-size:30px;
          font-weight:800;
          margin:6px 0;
        ">

        ${fmt(totalBalance())}

      </div>


      <div class="stat-grid">

        <div class="stat">

          <span>
            Thu nhập
          </span>

          <b class="income">
            ${fmt(incomeTotal())}
          </b>

        </div>


        <div class="stat">

          <span>
            Chi tiêu
          </span>

          <b class="expense">
            ${fmt(expenseTotal())}
          </b>

        </div>

      </div>

    </div>


    ${
      state.accounts

        .map(
          a => `

            <div
              class="
                account
                ${
                  a.id === "bank"
                    ? "bank"
                    : ""
                }
              ">

              <div class="account-icon">

                ${
                  a.id === "bank"
                    ? "🏦"
                    : "💼"
                }

              </div>


              <div class="account-info">

                <div class="account-name">

                  ${escapeHtml(
                    a.name
                  )}

                </div>


                <div class="account-sub">

                  ${
                    a.id === "bank"
                      ? "Mặc định"
                      : "Ví cá nhân"
                  }

                </div>

              </div>


              <div class="account-balance">

                ${fmt(a.balance)}

              </div>

            </div>

          `
        )

        .join("")
    }


    <div class="card">

      <button
        class="primary full"
        id="transferBtn">

        ⇄ Chuyển tiền giữa tài khoản

      </button>

    </div>

  `;


  $("#addAccount").onclick =
    () => addAccount();


  $("#transferBtn").onclick =
    () => openTransfer();

}


/* =========================
   BUDGET
========================= */

function renderBudget() {

  const spent =
    expenseTotal();


  const pct =
    Math.min(
      100,
      Math.round(
        spent /
        state.budget *
        100
      )
    );


  const remain =
    Math.max(
      0,
      state.budget - spent
    );


  $("#screen").innerHTML = `

    <div class="section-head">

      <h2>
        Ngân sách tháng
      </h2>

      <span class="pill">
        Tháng
        ${new Date().getMonth() + 1}
      </span>

    </div>


    <div class="card budget-top">

      <div class="percent">

        ${pct}%

      </div>


      <p>
        Đã chi
      </p>


      <div class="progress">

        <i
          style="
            width:${pct}%;
          ">
        </i>

      </div>


      <div class="budget-numbers">

        <div>

          <span>
            Đã chi
          </span>

          <b class="expense">
            ${fmt(spent)}
          </b>

        </div>


        <div>

          <span>
            Còn lại
          </span>

          <b class="income">
            ${fmt(remain)}
          </b>

        </div>


        <div>

          <span>
            Ngân sách
          </span>

          <b>
            ${fmt(state.budget)}
          </b>

        </div>

      </div>

    </div>


    <div class="stat-grid">

      <div class="stat">

        <span>
          Chi tiêu/ngày
        </span>

        <b>

          ${
            fmt(
              Math.round(
                remain /
                Math.max(
                  1,
                  30 -
                  new Date().getDate()
                )
              )
            )
          }

        </b>

        <span>
          Còn lại
        </span>

      </div>


      <div class="stat">

        <span>
          Giao dịch
        </span>

        <b>
          ${state.transactions.length}
        </b>

        <span>
          tháng này
        </span>

      </div>

    </div>


    <div class="card">

      <div class="section-head">

        <h2>
          Ngân sách
        </h2>

      </div>


      <button
        class="primary full"
        id="editBudget">

        Chỉnh sửa ngân sách

      </button>

    </div>

  `;


  $("#editBudget").onclick =
    () => {

      const v =
        prompt(
          "Ngân sách tháng (VND)",
          state.budget
        );


      if (
        v !== null &&
        !isNaN(+v) &&
        +v > 0
      ) {

        state.budget = +v;

        save();

        render();

      }

    };

}


/* =========================
   PROFILE
========================= */

function renderProfile() {

  $("#screen").innerHTML = `

    <div class="section-head">

      <h2>
        Hồ sơ & cài đặt
      </h2>

    </div>


    <div class="card">


      <div class="profile-row">

        <span>
          👤
        </span>

        <div>

          <b>
            Tên hiển thị
          </b>

          <small>
            ${escapeHtml(state.user)}
          </small>

        </div>

        <button
          class="link"
          id="editName">

          Sửa

        </button>

      </div>


      <div class="profile-row">

        <span>
          💾
        </span>

        <div>

          <b>
            Dữ liệu
          </b>

          <small>
            Lưu cục bộ trên thiết bị
          </small>

        </div>

      </div>


      <div class="profile-row">

        <span>
          📱
        </span>

        <div>

          <b>
            PWA
          </b>

          <small>
            Có thể cài lên màn hình chính
          </small>

        </div>

      </div>


    </div>


    <div class="card">

      <button
        class="primary full"
        id="exportBtn">

        Xuất dữ liệu JSON

      </button>


      <br>
      <br>


      <button
        class="primary full"
        id="resetBtn"
        style="
          background:#3a2024;
        ">

        Đặt lại dữ liệu mẫu

      </button>

    </div>

  `;


  $("#editName").onclick =
    () => {

      const n =
        prompt(
          "Tên hiển thị",
          state.user
        );


      if (n) {

        state.user = n;

        save();

        render();

      }

    };


  $("#exportBtn").onclick =
    exportData;


  $("#resetBtn").onclick =
    () => {

      if (
        confirm(
          "Xóa dữ liệu hiện tại và khôi phục dữ liệu mẫu?"
        )
      ) {

        state =
          structuredClone(seed);

        save();

        render();

      }

    };

}


/* =========================
   ACCOUNT SELECT
========================= */

function fillAccounts() {

  const s =
    $("#account");


  if (!s) return;


  s.innerHTML =
    state.accounts

      .map(
        a => `

          <option value="${a.id}">

            ${escapeHtml(a.name)}

          </option>

        `
      )

      .join("");

}


/* =========================
   ADD TRANSACTION MODAL
========================= */

function openModal() {

  $("#modalBackdrop")
    .classList
    .remove("hidden");


  $("#amount").focus();


  $("#date").value =
    todayISO();


  $("#photoPreview")
    .innerHTML = "";


  $("#photoPreview")
    .classList
    .add("hidden");

}


function closeModal() {

  $("#modalBackdrop")
    .classList
    .add("hidden");

}


/* =========================
   TOAST
========================= */

function showToast(s) {

  const t =
    $("#toast");


  t.textContent = s;


  t.classList.add("show");


  setTimeout(
    () =>
      t.classList.remove("show"),
    1800
  );

}


/* =========================
   ADD ACCOUNT
========================= */

function addAccount() {

  const name =
    prompt(
      "Tên tài khoản mới"
    );


  if (!name) return;


  const id =
    "a" + Date.now();


  state.accounts.push({

    id,

    name,

    balance: 0

  });


  save();

  render();

  showToast(
    "Đã thêm tài khoản"
  );

}


/* =========================
   TRANSFER
========================= */

function openTransfer() {

  const from =
    prompt(
      "Tài khoản chuyển đi:\n" +

      state.accounts

        .map(
          (a, i) =>
            `${i + 1}. ${a.name}`
        )

        .join("\n")
    );


  const fi =
    +from - 1;


  if (
    !Number.isInteger(fi) ||
    !state.accounts[fi]
  ) return;


  const to =
    prompt(
      "Tài khoản nhận:\n" +

      state.accounts

        .map(
          (a, i) =>
            `${i + 1}. ${a.name}`
        )

        .join("\n")
    );


  const ti =
    +to - 1;


  if (
    !Number.isInteger(ti) ||
    !state.accounts[ti] ||
    ti === fi
  ) return;


  const amount =
    +prompt(
      "Số tiền chuyển (VND)",
      100000
    );


  if (
    !amount ||
    amount <= 0 ||
    amount >
      state.accounts[fi].balance
  ) {

    return alert(
      "Số tiền không hợp lệ hoặc số dư không đủ."
    );

  }


  state.accounts[fi].balance -=
    amount;


  state.accounts[ti].balance +=
    amount;


  save();

  render();

  showToast(
    "Đã chuyển tiền"
  );

}


/* =========================
   EXPORT
========================= */

function exportData() {

  const blob =
    new Blob(
      [
        JSON.stringify(
          state,
          null,
          2
        )
      ],
      {
        type:
          "application/json"
      }
    );


  const a =
    document.createElement("a");


  a.href =
    URL.createObjectURL(blob);


  a.download =
    "moneytrack-data.json";


  a.click();


  URL.revokeObjectURL(
    a.href
  );

}


/* =========================
   NAVIGATION
========================= */

$$(".tab").forEach(
  b => {

    b.onclick = () => {

      activeTab =
        b.dataset.tab;

      render();

    };

  }
);


$("#profileQuick").onclick =
  () => {

    activeTab = "profile";

    render();

  };


/* =========================
   ADD BUTTON
========================= */

$("#addBtn").onclick =
  openModal;


/* =========================
   CLOSE MODAL
========================= */

$("#closeModal").onclick =
  closeModal;


$("#modalBackdrop")
  .addEventListener(
    "click",
    e => {

      if (
        e.target.id ===
        "modalBackdrop"
      ) {

        closeModal();

      }

    }
  );


/* =========================
   TRANSACTION TYPE
========================= */

$$(".seg").forEach(
  b => {

    b.onclick = () => {

      $$(".seg").forEach(
        x =>
          x.classList.remove(
            "active"
          )
      );


      b.classList.add(
        "active"
      );


      txType =
        b.dataset.type;

    };

  }
);


/* =========================
   PHOTO
========================= */

$("#photo").onchange =
  e => {

    const f =
      e.target.files?.[0];


    if (!f) return;


    const r =
      new FileReader();


    r.onload = () => {

      $("#photoPreview")
        .innerHTML = `

          <img
            src="${r.result}"
            alt="Ảnh giao dịch">

        `;


      $("#photoPreview")
        .classList
        .remove("hidden");


      $("#photoPreview")
        .dataset
        .src =
        r.result;

    };


    r.readAsDataURL(f);

  };


/* =========================
   SAVE TRANSACTION
========================= */

$("#transactionForm")
  .onsubmit = e => {

    e.preventDefault();


    const amount =
      +$("#amount").value;


    if (
      !amount ||
      amount <= 0
    ) return;


    const acc =
      $("#account").value;


    const date =
      $("#date").value ||
      todayISO();


    const tx = {

      id: Date.now(),

      type: txType,

      amount,

      category:
        $("#category").value,

      account: acc,

      date,

      note:
        $("#note").value.trim(),

      image:
        $("#photoPreview")
          .dataset.src ||
        null

    };


    const account =
      state.accounts.find(
        a => a.id === acc
      );


    if (!account) return;


    if (
      txType === "income"
    ) {

      account.balance +=
        amount;

    }


    else if (
      txType === "expense"
    ) {

      account.balance -=
        amount;

    }


    state.transactions.push(
      tx
    );


    save();


    closeModal();


    e.target.reset();


    render();


    showToast(
      "Đã lưu giao dịch"
    );

  };


/* =========================
   INITIAL RENDER
========================= */

render();


/* =========================
   SERVICE WORKER
========================= */

if (
  "serviceWorker"
  in navigator
) {

  window.addEventListener(
    "load",
    () => {

      navigator.serviceWorker
        .register("./sw.js");

    }
  );

}